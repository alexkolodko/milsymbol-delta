const DELTA_MISSING_SIDC = "10064500001401000000";
const DELTA_PRESENT_SIDC = "10061100001108000000";

const { default: ms } = await import("../index.js");
const unpatchedMissingSvg = new ms.Symbol(DELTA_MISSING_SIDC).asSVG();
const unpatchedPresentSvg = new ms.Symbol(DELTA_PRESENT_SIDC).asSVG();

const { default: msDelta } = await import("../delta/index.js");
const patchedMissingSvg = new msDelta.Symbol(DELTA_MISSING_SIDC).asSVG();
const patchedPresentSvg = new msDelta.Symbol(DELTA_PRESENT_SIDC).asSVG();

export default {
  "delta patch": {
    "patched SIDC differs from base rendering": [patchedMissingSvg !== unpatchedMissingSvg, true],
    "patched SIDC inlines vector content": [
      patchedMissingSvg.includes("<g") || patchedMissingSvg.includes("<path"),
      true,
    ],
    "unpatched base SIDC does not use patched vector content": [
      unpatchedMissingSvg.includes("data:image/svg+xml;base64") ||
        (unpatchedMissingSvg.includes("<g") && patchedMissingSvg === unpatchedMissingSvg),
      false,
    ],
    "full patch overrides symbols already present in base": [
      patchedPresentSvg !== unpatchedPresentSvg,
      true,
    ],
  },
};
