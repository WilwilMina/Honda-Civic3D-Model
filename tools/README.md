# Tools

Command-line helpers for exporting the model and for automated checks. None of them are needed to run or build
the app. They all work from any directory and default to the build in `dist/index.html`, so run
`npm run build` first.

## Requirements

- **Node 22.12 or newer** (required by `puppeteer-core` 25) and
  `npm install` (installs `puppeteer-core`).
- **Chrome or Chromium** for everything that opens the app headlessly. `puppeteer-core` does not download a
  browser; the tools look in the usual install locations, or use the `CHROME_PATH` environment variable:

  ```sh
  CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run export:glb
  ```

  Rendering uses SwiftShader (software WebGL), so no GPU is needed, but it is slow: allow a few minutes.

- **Blender's Python** for `make-blend.mjs`: either the `bpy` module (`pip install bpy`) or Blender 5.3 or
  newer.

## Export

| Command                | Script                             | What it does                                                                                                                                                                                                                                                    |
| ---------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run export:glb`   | `export-glb.mjs`                   | Opens the build in headless Chrome and saves `dist/civic-2013-lx.glb`: every part as a named object (with its area and a short summary in the glTF extras) plus the `Hood_open`, `Doors_open`, `Trunk_open`, `Front_wheel_off` and `Engine_running` animations. |
| `npm run export:blend` | `make-blend.mjs` → `make_blend.py` | Turns that `.glb` into `dist/civic-2013-lx.blend`: one collection per area (Outside, Under the hood, Inside the engine, ...), objects named after their parts, a camera, a sun and a README text block inside the file.                                         |

Both accept explicit paths: `node tools/export-glb.mjs [input.html] [output.glb]` and
`node tools/make-blend.mjs [input.glb] [output.blend]`.

`make-blend.mjs` picks the first of: `BLENDER_PATH` (a Blender executable, run in background mode), `python3`
with `bpy` importable (`PYTHON` overrides the interpreter), or `blender` on the `PATH`. The Python script also
runs on its own:

```sh
python3 tools/make_blend.py -- dist/civic-2013-lx.glb dist/civic-2013-lx.blend
blender --background --python tools/make_blend.py -- dist/civic-2013-lx.glb dist/civic-2013-lx.blend
```

## Checks (`qa/`)

| Command             | Script                | What it checks                                                                                                                                                                                                                                                          |
| ------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run qa`        | `qa/final-qa.mjs`     | A full walkthrough with real mouse clicks: welcome card, every area opened from its hotspot, part cards and framing, every control, leaving areas mid-animation, the symptom finder and other screen sizes. Prints every issue found and saves screenshots to `shots/`. |
| `npm run qa:reveal` | `qa/reveal-check.mjs` | For every clickable part: select it and raycast from the camera to confirm it is actually visible. Prints PASS/FAIL and what blocks the view.                                                                                                                           |
| (manual)            | `qa/pose-search.mjs`  | Finds camera poses from which given parts are visible, for an area's `reveal()` hook.                                                                                                                                                                                   |

Options:

- `node tools/qa/final-qa.mjs [input.html] [phases] [width height]`, where phases is a comma list of
  `welcome,areas,sym,sizes`. Environment: `ONLY=bay,cabin` limits the areas phase, `NOCARD=1` skips the part
  card in the sizes phase, `QA_SHOTS=dir` changes the screenshot folder.
- `node tools/qa/reveal-check.mjs [input.html] [areas-or-part-keys]`, e.g. `cabin,bay:battery`.
- `node tools/qa/pose-search.mjs [input.html] <area> <part-key,...>`, e.g. `bay bay:battery,bay:dipstick`.

The checks drive the app through the debug hooks it exposes (`window.app`, `window.__ready`,
`window.__dataProblems`); see [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md#debug-hooks-and-url-options).

## Shared code

`lib/chrome.mjs` finds Chrome, launches it headless with software WebGL (adding `--no-sandbox` only when
running as root, as in Docker), and resolves the default `dist/index.html`.
