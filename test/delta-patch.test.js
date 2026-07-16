const DELTA_SIDC = "10064500001401000000";

const { default: ms } = await import("../index.js");
const unpatchedSvg = new ms.Symbol(DELTA_SIDC).asSVG();

const { default: msDelta } = await import("../delta/index.js");
const patchedSvg = new msDelta.Symbol(DELTA_SIDC).asSVG();

export default {
  "delta patch": {
    "patched SIDC differs from base rendering": [patchedSvg !== unpatchedSvg, true],
    "patched SIDC inlines vector content": [
      patchedSvg.includes("<g") || patchedSvg.includes("<path"),
      true,
    ],
    "unpatched base SIDC does not use patched vector content": [
      unpatchedSvg.includes("data:image/svg+xml;base64") ||
        (unpatchedSvg.includes("<g") && patchedSvg === unpatchedSvg),
      false,
    ],
  },
};
