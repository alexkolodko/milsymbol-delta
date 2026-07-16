import { applyDeltaPatch, renderWithoutDeltaPatch } from "../src/delta/apply-delta-patch.js";

const DELTA_MISSING_SIDC = "10064500001401000000";
const DELTA_PRESENT_SIDC = "10061100001108000000";

const { default: ms } = await import("../index.js");

// Re-assert missing-only mode in case other delta tests already patched `ms`.
applyDeltaPatch(ms, { mode: "missing-only" });

const unpatchedMissingSvg = renderWithoutDeltaPatch(ms, DELTA_MISSING_SIDC);
const unpatchedPresentSvg = renderWithoutDeltaPatch(ms, DELTA_PRESENT_SIDC);
const missingOnlyMissingSvg = new ms.Symbol(DELTA_MISSING_SIDC).asSVG();
const missingOnlyPresentSvg = new ms.Symbol(DELTA_PRESENT_SIDC).asSVG();

export default {
  "delta missing-only patch": {
    "missing-only patch fills symbols missing in base": [
      missingOnlyMissingSvg !== unpatchedMissingSvg,
      true,
    ],
    "missing-only patch leaves base symbols unchanged": [
      missingOnlyPresentSvg === unpatchedPresentSvg,
      true,
    ],
    "missing-only patch inlines vector content for missing symbols": [
      missingOnlyMissingSvg.includes("<g") ||
        missingOnlyMissingSvg.includes("<path") ||
        missingOnlyMissingSvg.includes("<image"),
      true,
    ],
  },
};
