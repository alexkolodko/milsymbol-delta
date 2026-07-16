import { DELTA_SIDC_ICON_DATA } from "./delta-sidc-icon-data.js";

// milsymbol invokes addSIDCicons callbacks with `this` bound to its internal _getIcons lookup
// table, never to the Symbol instance being rendered -- so `this.options.sidc` is always
// undefined and a naive callback silently no-ops on every render. The Symbol instance is not
// forwarded to the callback via any argument either, so the sidc has to be captured earlier, at
// construction time (icon-building happens synchronously inside `new ms.Symbol(sidc, options)`,
// before any render method runs), and read back from a closure variable instead of `this`.
let deltaCurrentSidc = null;

export function applyDeltaPatch(ms) {
  const DeltaOrigSymbol = ms.Symbol;
  function DeltaSymbol(sidc, options) {
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

  // Key formats are milsymbol internals, reverse-engineered from third_party/milsymbol_delta_patched/milsymbol.js:
  // - "number" SIDCs (all Delta sidc values are this format) look icons up by functionid.substr(0,6),
  //   with a functionid.substr(0,4)+"00" fallback when functionid.substr(4,2) >= "95".
  // - "letter" (legacy alphanumeric APP6) SIDCs look icons up by sidc[0]+"-"+sidc[2]+"-"+sidc.substr(4,6).
  // Both are registered for robustness even though Delta only ever produces "number"-format sidc.
  function deltaApplyNumberSidcPatch(icons, m1, m2, bbox) {
    const sidc = deltaCurrentSidc;
    const dataUri = sidc && DELTA_SIDC_ICON_DATA[sidc];
    if (!dataUri) return;
    const svg = `<image href="${dataUri}" x="0" y="0" width="100%" height="100%"/>`;
    const functionid = sidc.substr(10, 10);
    for (const key of [functionid.substr(0, 6), functionid.substr(0, 4) + "00"]) {
      icons[key] = { type: "svg", svg };
      bbox[key] = { x1: 0, y1: 0, x2: 200, y2: 200 };
    }
  }

  function deltaApplyLetterSidcPatch(icons, bbox) {
    const sidc = deltaCurrentSidc;
    const dataUri = sidc && DELTA_SIDC_ICON_DATA[sidc];
    if (!dataUri) return;
    const svg = `<image href="${dataUri}" x="0" y="0" width="100%" height="100%"/>`;
    const key = sidc.substr(0, 1) + "-" + sidc.substr(2, 1) + "-" + sidc.substr(4, 6);
    icons[key] = { type: "svg", svg };
    bbox[key] = { x1: 0, y1: 0, x2: 200, y2: 200 };
  }

  ms.addSIDCicons(deltaApplyLetterSidcPatch, "letter");
  ms.addSIDCicons(deltaApplyNumberSidcPatch, "number");

  return ms;
}
