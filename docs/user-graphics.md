# User Graphics (Delta symbol-set 66)

## What it is

**User Graphics** (`КОРИСТУВАЦЬКА ГРАФІКА`) is a Delta product catalog for **non-standard symbol-set `66`**. It is not an upload pipeline, graphic pack, or user-drawn asset store.

There are **14** SIDCs in [`delta_objects_2026-07-16.json`](./delta_objects_2026-07-16.json). All use `symbolSet=66`. Example path: `->User Graphics -> Дорога`.

## What it is not

`std-milsymbol-picker` does **not** implement User Graphics. That repo only has:

1. Research notes flagging Delta **ss=66** customs
2. mil-sym-ts **`AddCustomSymbol`** — a generic runtime API to register in-memory `MSInfo` + SVG `<g>` fragments (unrelated to the Delta User Graphics catalog)

## Coverage in milsymbol-delta

Base milsymbol cannot render ss=66 (unknown dimension / `?`). The Delta icon patch supplies captured icons for **13 of 14** User Graphics SIDCs. Those 13 are also on the **missing-only** allowlist.

| Status | Count | Notes |
|--------|------:|-------|
| In patch | 13 | Captured Delta app icons |
| Missing from patch | 1 | `10066600007000000000` — Сітка / Grid |

Machine-readable checklist (labels, geometries, research icon types, patch flags):

- [`user-graphics-inventory.json`](./user-graphics-inventory.json)

Programmatic SIDC set:

```javascript
import { DELTA_USER_GRAPHICS_SIDC_SET } from "../src/delta/delta-user-graphics.js";
```

## Research cross-reference

`std-milsymbol-picker/research` lists **13** ss=66 keys (affiliation digit `1`, e.g. `100166…`). Delta catalog entries use affiliation digit `6` (`100666…`) — same symbol set + entity.

| researchIconType | Meaning |
|------------------|---------|
| `dynamic-color` | Hostility-colored generated shape in mil-sym-renderer |
| `static-svg` | Hand-made SVG (some also in `ui-kit-mil-symbols`) |
| `null` | Not in research dump (Grid only) |

## How to render with this package

Full patch (all captured Delta icons, including User Graphics):

```javascript
import ms from "milsymbol-delta/delta";

new ms.Symbol("10066600001000000000").asSVG();
```

Missing-only (fills base gaps only — includes the 13 User Graphics SIDCs that are in the allowlist):

```javascript
import ms from "milsymbol-delta/delta/missing-only";
```

## Demo

Open the catalog demo and select group **КОРИСТУВАЦЬКА ГРАФІКА**, or use:

```
docs/examples/delta-catalog-demo.html?group=%D0%9A%D0%9E%D0%A0%D0%98%D0%A1%D0%A2%D0%A3%D0%92%D0%90%D0%A6%D0%AC%D0%9A%D0%90%20%D0%93%D0%A0%D0%90%D0%A4%D0%86%D0%9A%D0%90
```
