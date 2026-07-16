# Milsymbol

Milsymbol is a small library in pure JavaScript that creates military unit symbols according to MIL-STD-2525 and STANAG APP-6.

![Figure 13](https://github.com/spatialillusions/milsymbol/blob/master/docs/images/milsymbol.png?raw=true)

```javascript
new ms.Symbol("130315003611010300000000000000", {
  size: 35,
  quantity: 200,
  staffComments: "for reinforcements".toUpperCase(),
  additionalInformation: "added support for JJ".toUpperCase(),
  direction: (750 * 360) / 6400,
  type: "machine gun".toUpperCase(),
  dtg: "30140000ZSEP97",
  location: "0900000.0E570306.0N",
}).asSVG();
```

Compared to the reference figure from MIL-STD-2525C:

![Figure 13](https://github.com/spatialillusions/milsymbol/blob/master/docs/images/figure13.png?raw=true)

## Milsymbol summary

Milsymbol supports a lot of different options:

- NATO or US standards (MIL-STD-2525C, MIL-STD-2525D, MIL-STD-2525E, FM 1-02.2, STANAG APP-6 B, STANAG APP-6 D, STANAG APP-6 E)
- Filled/unfilled symbols
- Framed/unframed symbols
- Text fields
- Movement indicators
- SVG/Canvas output (using SVG or Canvas draw instructions)
- Outlines of symbols
- and much more...

For detailed descriptions of what is possible with milsymbol, see the API documentation under /docs.

Since version 3.0, symbology will be rendered as closely as possible to MIL-STD-2525E / STANAG APP-6 E / FM 1-02.2 as possible, even if the symbol might look slightly different in older standard documents. This is to make symbology uniform between systems that use different versions of the SIDC codes. In some cases where symbols are inconsistent between different appendixes in the standard documents, they have been made consistent for easier interpretation.

Milsymbol can be integrated with most common JavaScript libraries, such as:

- Angular
- Cesium
- D3
- Leaflet
- Node.js
- Open Layers 3
- and also in ScriptEngine in Java, and QtJSEngine in C++...

Examples of some of the integrations are included with milsymbol.

## Getting started

You can download [milsymbol from GitHub](https://github.com/spatialillusions/milsymbol "milsymbol"), or install it using npm:
`npm install milsymbol`

To create your first symbol, you use the symbol method to create a symbol object:

`ms.Symbol(SIDC,{options})`

To make a symbol for an infantry platoon, the syntax would be:

`var sym = new ms.Symbol("130310001412110000000000000000");`

And `sym` will now be a symbol object containing information about the size and draw instructions.

But you want something to put on your screen, and since milsymbol provides different ways to draw symbols, using SVG or Canvas, you will have to use the method that provides you with the output you want, so we use `asCanvas()` or `asSVG()` that returns a canvas element containing the symbol or an XML representation of the SVG:

`var canvasElement = sym.asCanvas();`

And if you don't want to make it step by step, you can chain it all together like this:

`var canvasElement = new ms.Symbol("130310001412110000000000000000").asCanvas();`

![Infantry Platoon](https://github.com/spatialillusions/milsymbol/blob/master/docs/images/infantry-platoon.png?raw=true)

Options you provide to your symbol can change the size of the symbol, define if it should be filled/unfilled, add text information, and much more; you can read more about all properties and methods in the API documentation provided with milsymbol.

The options can be set when you create your symbol:

`var sym = new ms.Symbol("130310001412110000000000000000",{size:35}).asCanvas();`

Or they can be updated at any time using `setOptions(options)`:

```
var sym = new ms.Symbol("130310001412110000000000000000");
sym.setOptions({size:35});
var canvasElement = sym.asCanvas();
```

Your symbol object will also contain information about what offset that should be used to get a correct placement. This information can be retrieved with `getAnchor()` and it will return an object with the x and y offset. You will also have access to information about what size the created symbol has and detailed information about colors used.

The library is built on the idea that everything used inside milsymbol should be accessible outside milsymbol so that it is easy to extend the library with custom functionality.

## Technology

Milsymbol uses pure JavaScript to create SVG, Scalable Vector Graphics, and also has built-in native Canvas support.

- No external dependencies, just one JavaScript file required
- Super fast, can create 1000 symbols in less than 20 milliseconds (SVG output)

The symbols are created using building blocks defined in the code and no images or fonts are used. This makes it possible to modify almost every aspect of the symbols, such as fill, frame, color, size, stroke width, and easily switch between APP6 and 2525 symbology.

To see what is possible with milsymbol, use the unit test documents in the docs folder that list all tables and figures from the different standards using milsymbol. (The documents use milsymbol to render every image that you see. Look into the code if you want to see how it is done.)

## Extending milsymbol

Milsymbol can easily be extended with new functionality. If you go to https://spatialillusions.com/unitgenerator/ you can see that it uses a modified version of milsymbol with closed-source extensions "stack-extension", "reinforced/reduced-extension", and "country flag-extension". Please contact me if you would like to use them in your project.

## Delta patch

This fork (`milsymbol-delta`) adds an optional Delta icon patch: 1749 SIDC icons captured from the Delta application (~20MB of icon data). The patch is opt-in — the default package export is unchanged upstream milsymbol.

### Install

```bash
npm install milsymbol-delta
```

Or install directly from this fork:

```bash
npm install github:alexkolodko/milsymbol-delta
```

### ESM / Node

```javascript
import ms from "milsymbol-delta/delta";

const svg = new ms.Symbol("10064500001401000000").asSVG();
```

Use `import ms from "milsymbol-delta"` when you only need standard MIL-STD/APP6 symbols.

### Browser and extensions

For browser extensions or script-tag usage, load the base library first, then apply the patch:

```html
<script src="dist/milsymbol.js"></script>
<script src="dist/milsymbol-delta-patch.js"></script>
```

Or use the all-in-one patched bundle:

```html
<script src="dist/milsymbol-delta.js"></script>
```

Build the Delta bundles with `npm run bundle:delta` (after `npm run build`).

### Regenerating icons

The icon data was auto-generated on 2026-07-15 from Delta app icons. A human-readable SIDC catalog is in [`docs/delta_objects_2026-07-16.json`](docs/delta_objects_2026-07-16.json). Regenerating the patch requires `delta_milsymbol_icon_capture.js` (not included in this repository).

### Demo page

A practical browser demo for comparing the base renderer with the Delta patch is available at:

- `docs/examples/delta-catalog-demo.html`
- `examples/delta-catalog-demo/index.html`

It loads the generated catalog from `docs/delta_objects_2026-07-16.json` and shows base vs patched output side by side, with search, filtering, and pagination for scanning the catalog.

Serve the repository root with a simple local HTTP server after building the browser bundles:

```bash
npm run bundle
npm run bundle:delta
python3 -m http.server 8000
```

Then open either:

- `http://localhost:8000/docs/examples/delta-catalog-demo.html`
- `http://localhost:8000/examples/delta-catalog-demo/`

## Contact

Milsymbol is created and maintained by Måns Beckman

- http://www.spatialillusions.com

## Licensing

MIT, See [LICENSE](LICENSE) for details.

If you like my work and would like to support it, please use https://buymeacoffee.com/spatialillusion
