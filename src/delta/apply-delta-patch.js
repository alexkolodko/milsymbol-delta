import { DELTA_SIDC_ICON_DATA } from "./delta-sidc-icon-data.js";
import { DELTA_MISSING_SIDC_SET } from "./delta-missing-sidc-set.js";

/** @typedef {{ mode?: "all" | "missing-only" }} DeltaPatchOptions */

// milsymbol invokes addSIDCicons callbacks with `this` bound to its internal _getIcons lookup
// table, never to the Symbol instance being rendered -- so `this.options.sidc` is always
// undefined and a naive callback silently no-ops on every render. The Symbol instance is not
// forwarded to the callback via any argument either, so the sidc has to be captured earlier, at
// construction time (icon-building happens synchronously inside `new ms.Symbol(sidc, options)`,
// before any render method runs), and read back from a closure variable instead of `this`.
let deltaCurrentSidc = null;
const deltaInlineSvgCache = new Map();

function extractSvgDimension(decodedSvg, name, fallback) {
  const match = decodedSvg.match(new RegExp(`${name}="([^"]+)"`, "i"));
  if (!match) return fallback;
  const value = Number.parseFloat(match[1]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function decodeDataUriSvg(dataUri) {
  if (!dataUri || typeof dataUri !== "string") return "";

  const prefix = "data:image/svg+xml;base64,";
  if (dataUri.startsWith(prefix)) {
    const base64 = dataUri.slice(prefix.length);
    if (typeof atob === "function") {
      return atob(base64);
    }
    return Buffer.from(base64, "base64").toString("utf8");
  }

  const utf8Prefix = "data:image/svg+xml;utf8,";
  if (dataUri.startsWith(utf8Prefix)) {
    return decodeURIComponent(dataUri.slice(utf8Prefix.length));
  }

  return "";
}

function isPngEmbeddedSvg(decodedSvg) {
  return /<image[^>]+(?:xlink:)?href="data:image\/png/i.test(decodedSvg);
}

function getPatchedSvgMarkup(dataUri) {
  if (deltaInlineSvgCache.has(dataUri)) {
    return deltaInlineSvgCache.get(dataUri);
  }

  const decodedSvg = decodeDataUriSvg(dataUri);

  // Captured Delta assets that wrap a PNG inside SVG must keep the original
  // data URI intact. Inlining/re-wrapping breaks viewBox scaling and produces
  // ghosted or cropped output compared to opening image.svg directly.
  if (isPngEmbeddedSvg(decodedSvg)) {
    const markup = `<image href="${dataUri}" x="0" y="0" width="100%" height="100%"/>`;
    deltaInlineSvgCache.set(dataUri, markup);
    return markup;
  }

  const width = extractSvgDimension(decodedSvg, "width", 200);
  const height = extractSvgDimension(decodedSvg, "height", 200);
  const explicitViewBox = decodedSvg.match(/viewBox="([^"]+)"/i);
  const body = decodedSvg
    .replace(/^[\s\S]*?<svg[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "")
    .trim();

  let viewBox;
  let inner = body;
  if (explicitViewBox) {
    viewBox = explicitViewBox[1];
  } else {
    const padding = Math.max(2, Math.ceil(Math.max(width, height) * 0.1));
    viewBox = `0 0 ${width + padding * 2} ${height + padding * 2}`;
    inner = `<g transform="translate(${padding} ${padding})">${body}</g>`;
  }

  const wrapped = `<svg x="0" y="0" width="200" height="200" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;

  deltaInlineSvgCache.set(dataUri, wrapped);
  return wrapped;
}

function removeRegisteredCallback(list, callback) {
  if (!callback || !Array.isArray(list)) return;
  const index = list.indexOf(callback);
  if (index !== -1) {
    list.splice(index, 1);
  }
}

/**
 * Render a SIDC with Delta icon callbacks temporarily removed (base milsymbol only).
 * Useful when the process-wide `ms` singleton has already been patched.
 */
export function renderWithoutDeltaPatch(ms, sidc, options) {
  const letter = ms._iconSIDC && ms._iconSIDC.letter;
  const number = ms._iconSIDC && ms._iconSIDC.number;
  const prevLetter = ms._deltaLetterPatch;
  const prevNumber = ms._deltaNumberPatch;

  removeRegisteredCallback(letter, prevLetter);
  removeRegisteredCallback(number, prevNumber);
  ms._iconCache = {};

  try {
    if (options === undefined) {
      return new ms.Symbol(sidc).asSVG();
    }
    return new ms.Symbol(sidc, options).asSVG();
  } finally {
    if (prevLetter && letter && letter.indexOf(prevLetter) === -1) {
      letter.push(prevLetter);
    }
    if (prevNumber && number && number.indexOf(prevNumber) === -1) {
      number.push(prevNumber);
    }
    ms._iconCache = {};
  }
}

export function applyDeltaPatch(ms, options = {}) {
  const mode = options.mode ?? "all";
  const patchMissingOnly = mode === "missing-only";

  function shouldPatchSidc(sidc) {
    if (!sidc || !DELTA_SIDC_ICON_DATA[sidc]) return false;
    if (!patchMissingOnly) return true;
    return DELTA_MISSING_SIDC_SET.has(sidc);
  }

  // Keep the pre-patch Symbol constructor so re-applying does not nest wrappers.
  if (!ms._deltaBaseSymbol) {
    ms._deltaBaseSymbol = ms.Symbol;
  }
  const DeltaOrigSymbol = ms._deltaBaseSymbol;

  function DeltaSymbol(sidc, symbolOptions) {
    // milsymbol caches computed icon sets on the shared `ms` object itself, keyed only by
    // style/dimension/color signature (not sidc) -- so a second symbol that happens to share that
    // signature with an earlier one silently reuses the earlier icon set and never re-invokes the
    // addSIDCicons callbacks at all. Since virtually all Delta sidc values share the same signature,
    // this cache has to be busted on every construction or only the first-rendered symbol per
    // signature ever gets patched.
    ms._iconCache = {};
    const prevSidc = deltaCurrentSidc;
    deltaCurrentSidc = sidc;
    try {
      return DeltaOrigSymbol.apply(this, arguments);
    } finally {
      deltaCurrentSidc = prevSidc;
    }
  }
  DeltaSymbol.prototype = DeltaOrigSymbol.prototype;
  Object.setPrototypeOf(DeltaSymbol, DeltaOrigSymbol);
  ms.Symbol = DeltaSymbol;

  // Replace any previously registered Delta callbacks so importing both
  // delta/index.js and delta/missing-only.js in one process does not stack modes.
  removeRegisteredCallback(ms._iconSIDC.letter, ms._deltaLetterPatch);
  removeRegisteredCallback(ms._iconSIDC.number, ms._deltaNumberPatch);

  // Key formats are milsymbol internals, reverse-engineered from third_party/milsymbol_delta_patched/milsymbol.js:
  // - "number" SIDCs (all Delta sidc values are this format) look icons up by functionid.substr(0,6),
  //   with a functionid.substr(0,4)+"00" fallback when functionid.substr(4,2) >= "95".
  // - "letter" (legacy alphanumeric APP6) SIDCs look icons up by sidc[0]+"-"+sidc[2]+"-"+sidc.substr(4,6).
  // Both are registered for robustness even though Delta only ever produces "number"-format sidc.
  function deltaApplyNumberSidcPatch(icons, m1, m2, bbox) {
    const sidc = deltaCurrentSidc;
    if (!shouldPatchSidc(sidc)) return;
    const dataUri = DELTA_SIDC_ICON_DATA[sidc];
    const svg = getPatchedSvgMarkup(dataUri);
    const functionid = sidc.substr(10, 10);
    for (const key of [functionid.substr(0, 6), functionid.substr(0, 4) + "00"]) {
      icons[key] = { type: "svg", svg };
      bbox[key] = { x1: 0, y1: 0, x2: 200, y2: 200 };
    }
  }

  function deltaApplyLetterSidcPatch(icons, bbox) {
    const sidc = deltaCurrentSidc;
    if (!shouldPatchSidc(sidc)) return;
    const dataUri = DELTA_SIDC_ICON_DATA[sidc];
    const svg = getPatchedSvgMarkup(dataUri);
    const key = sidc.substr(0, 1) + "-" + sidc.substr(2, 1) + "-" + sidc.substr(4, 6);
    icons[key] = { type: "svg", svg };
    bbox[key] = { x1: 0, y1: 0, x2: 200, y2: 200 };
  }

  ms._deltaLetterPatch = deltaApplyLetterSidcPatch;
  ms._deltaNumberPatch = deltaApplyNumberSidcPatch;
  ms._deltaPatchMode = mode;

  ms.addSIDCicons(deltaApplyLetterSidcPatch, "letter");
  ms.addSIDCicons(deltaApplyNumberSidcPatch, "number");

  return ms;
}
