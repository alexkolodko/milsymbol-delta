const DELTA_SIDC = "10064500001401000000";

const { default: ms } = await import("../index.js");
const unpatchedSvg = new ms.Symbol(DELTA_SIDC).asSVG();

const { default: msDelta } = await import("../delta/index.js");
const patchedSvg = new msDelta.Symbol(DELTA_SIDC).asSVG();

export default {
  "delta patch": {
    "patched SIDC includes custom data:image icon": [
      patchedSvg.includes("data:image/svg+xml;base64"),
      true,
    ],
    "unpatched base SIDC does not include custom data:image icon": [
      unpatchedSvg.includes("data:image/svg+xml;base64"),
      false,
    ],
  },
};
