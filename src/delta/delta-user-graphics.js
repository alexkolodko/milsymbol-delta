/**
 * Delta User Graphics = symbol-set 66 (non-standard Delta extension).
 * SIDCs match docs/delta_objects_2026-07-16.json → КОРИСТУВАЦЬКА ГРАФІКА.
 * See docs/user-graphics.md and docs/user-graphics-inventory.json.
 */

/** All 14 catalog SIDCs (including Grid, which has no captured icon). */
export const DELTA_USER_GRAPHICS_SIDCS = Object.freeze([
  "10066600001000000000", // Дорога / Road
  "10066600001100000000", // Маршрут / Route
  "10066600002000000000", // Забудований район / Built-up area
  "10066600003000000000", // Переправа / Crossing
  "10066600004000000000", // Район тилового забезпечення / Rear area
  "10066600005000000000", // Місце зведення військового мосту / Bridge site
  "10066600006005000000", // Еліпс / Ellipse
  "10066600006099000000", // Точка / Point
  "10066600007000000000", // Сітка / Grid (no patch icon)
  "10066600008001000000", // Ряд протипіхотних мін
  "10066600008002000000", // Ряд протитанкових мін
  "10066600008003000000", // Ряд мін змішаного типу
  "10066600008004000000", // Ряд мін невизначеного типу
  "10066600009100000000", // Довільний текст / Free text
]);

export const DELTA_USER_GRAPHICS_SIDC_SET = new Set(DELTA_USER_GRAPHICS_SIDCS);

/** Catalog SIDC present in delta_objects but not in the icon capture. */
export const DELTA_USER_GRAPHICS_UNPATCHED_SIDC = "10066600007000000000";

export function isUserGraphicsSidc(sidc) {
  return DELTA_USER_GRAPHICS_SIDC_SET.has(sidc);
}
