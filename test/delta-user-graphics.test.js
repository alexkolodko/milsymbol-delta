import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { applyDeltaPatch, renderWithoutDeltaPatch } from "../src/delta/apply-delta-patch.js";
import { DELTA_SIDC_ICON_DATA } from "../src/delta/delta-sidc-icon-data.js";
import { DELTA_MISSING_SIDC_SET } from "../src/delta/delta-missing-sidc-set.js";
import {
  DELTA_USER_GRAPHICS_SIDCS,
  DELTA_USER_GRAPHICS_UNPATCHED_SIDC,
  isUserGraphicsSidc,
} from "../src/delta/delta-user-graphics.js";

const inventoryPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../docs/user-graphics-inventory.json"
);
const inventory = JSON.parse(readFileSync(inventoryPath, "utf8"));

const { default: ms } = await import("../index.js");
applyDeltaPatch(ms, { mode: "all" });

const PATCHED_UG_SIDC = "10066600001000000000";
const unpatchedUg = renderWithoutDeltaPatch(ms, PATCHED_UG_SIDC);
const patchedUg = new ms.Symbol(PATCHED_UG_SIDC).asSVG();
const unpatchedGrid = renderWithoutDeltaPatch(ms, DELTA_USER_GRAPHICS_UNPATCHED_SIDC);
const patchedGrid = new ms.Symbol(DELTA_USER_GRAPHICS_UNPATCHED_SIDC).asSVG();

const inventorySidcs = inventory.entries.map((entry) => entry.sidc).sort();
const moduleSidcs = [...DELTA_USER_GRAPHICS_SIDCS].sort();

const allPatchedExceptGrid = DELTA_USER_GRAPHICS_SIDCS.filter(
  (sidc) => sidc !== DELTA_USER_GRAPHICS_UNPATCHED_SIDC
).every(
  (sidc) => DELTA_SIDC_ICON_DATA[sidc] && DELTA_MISSING_SIDC_SET.has(sidc)
);

export default {
  "delta user graphics": {
    "module lists 14 catalog SIDCs": [DELTA_USER_GRAPHICS_SIDCS.length, 14],
    "inventory matches module SIDC list": [
      JSON.stringify(inventorySidcs),
      JSON.stringify(moduleSidcs),
    ],
    "isUserGraphicsSidc recognizes Road": [isUserGraphicsSidc(PATCHED_UG_SIDC), true],
    "13 User Graphics SIDCs are in the icon patch": [allPatchedExceptGrid, true],
    "Grid SIDC is not in the icon patch": [
      Boolean(DELTA_SIDC_ICON_DATA[DELTA_USER_GRAPHICS_UNPATCHED_SIDC]),
      false,
    ],
    "full patch changes a User Graphics SIDC vs base": [patchedUg !== unpatchedUg, true],
    "full patch leaves Grid identical to base (no capture)": [
      patchedGrid === unpatchedGrid,
      true,
    ],
  },
};
