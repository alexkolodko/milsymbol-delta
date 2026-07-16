import { applyDeltaPatch } from "../src/delta/apply-delta-patch.js";

const globalMs = globalThis.ms;

if (!globalMs) {
  throw new Error(
    "milsymbol-delta-patch requires the ms global from milsymbol.js to be loaded first"
  );
}

applyDeltaPatch(globalMs);
