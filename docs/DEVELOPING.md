# Developer guide

How the project is laid out, where to change things, and how to build, export and deploy it. For the
area API, the content format and how to add areas and parts, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Run it locally

You need [Node.js](https://nodejs.org) 22.12 or newer.

```sh
npm install
npm run dev        # development server with live reload (Vite prints the local URL)
npm run build      # production build: one self-contained file, dist/index.html
npm run preview    # serve the build locally
```

`dist/index.html` has all the code and styles inlined, so you can copy it anywhere and open it directly.

## Project structure

```
index.html                 page shell (the app fills #stage and #ui)
vite.config.js             builds everything into one HTML file
src/
  main.js                  entry point: loads content, builds every area, starts the app
  styles.css               all UI styles
  core/                    shared app machinery (no car-specific content)
    app.js                 area navigation, part selection, the frame loop
    stage.js               renderer, scene, lights, floor, camera; the mirrored car root
    camera.js              tweens and camera flights
    picking.js             mouse picking: which part or area is under the pointer
    focus.js               focus mode: grey ghosts around the selected part, with a short fade
    hotspot-tracker.js     screen positions of the orange dots (ui/hotspot-layer.js draws them)
    materials.js           palette, material presets, highlight glow, ghosting
    registry.js            merges every area's content into one table keyed "area:id"
    export.js              .glb export used by tools/export-glb.mjs
    ui.js, ui/             side panel, part and symptom cards, controls bar, welcome card
  lib/geom.js              geometry helpers shared by all areas
  areas/
    index.js               the list of areas
    shared/reveal.js       helper for showing hidden parts when they are selected
    car/                   the outside: body.js + body/ (measured body, panels, doors, wheels; the ctx.car
                           API in body/api.js), front.js + front/, rear.js + rear/, side.js
    bay/                   under the hood: base-model.js builds the base model from shapes.json; cooling.js,
                           electrical.js, belt.js and fluids.js add detail; flows.js animates the running
                           engine; colors.js, views.js (camera poses), geometry.js; content/
    engine/                inside the engine (animated cutaway): block.js, bottom-end.js, valvetrain.js,
                           timing.js, ignition.js; kinematics.js has the numbers and animation math; kit.js,
                           geometry.js; content/
    chassis/               wheels, brakes, suspension, steering: front-corner.js, rear-corner.js,
                           brake-lines.js, wheels.js, animations.js, views.js (camera poses), kit.js,
                           geometry.js; content/
    trunk/                 trunk, spare, jack: kit.js, linings.js, stowage.js, opening.js
    cabin/                 dashboard.js, cluster.js (gauges, warning lights), controls.js, service.js (glove
                           box, fuses), seats.js, icons.js, kit.js; content/
    lights/                exterior lights, wipers, washers (uses the car area's meshes; no model of its own);
                           content/
    under/                 underside on a lift: underbody.js, exhaust.js, fuel.js, lift.js, kit.js;
                           content/
docs/
  ARCHITECTURE.md          developer guide: area API, content format
  research/                the researched facts, with sources
  images/                  screenshots for this README
tools/                     export to .glb/.blend and automated QA (see tools/README.md)
.github/workflows/         GitHub Pages deployment
```

Each area folder has the same two entry files: **`scene.js`** builds the 3D model, the camera view and the
buttons, and **`content.js`** holds the learning text. Bigger areas split the model into sibling files (for
example `engine/valvetrain.js`). Helper files use the same names everywhere: `kit.js` exports
`createKit(ctx, ...)`, the toolkit every builder adds its meshes through; `geometry.js` holds pure shape
helpers that don't need `ctx`; `views.js` holds camera views and reveal poses; `bay/base-model.js` builds
meshes from `shapes.json`. Once an area's text passes about 300 lines it moves into a `content/` folder
(`systems.js`, `parts.js`, `symptoms.js`, `videos.js`, `guides.js`, `intro.js`), and `content.js`
re-exports it.

### Where to change things

| To change...                                    | Edit                                                                          |
| ----------------------------------------------- | ----------------------------------------------------------------------------- |
| what a part card says                           | `src/areas/<area>/content.js` or its `content/parts.js`                       |
| symptoms in "Something wrong?"                  | `content.js` or `content/symptoms.js` of the area that owns the causes        |
| repair video links                              | `VIDEOS` in `content.js` or `content/videos.js`                               |
| step-by-step DIY guides                         | `GUIDES` in `content.js` (trunk) or `content/guides.js` (cabin, lights)       |
| the intro card of an area                       | `START` in `content.js` or `content/intro.js`                                 |
| the shape of a part                             | the area's `scene.js` or the sibling file that builds it                      |
| the car body                                    | `src/areas/car/body.js` and `src/areas/car/body/`                             |
| buttons under the 3D view                       | `controls` in the area's `scene.js`                                           |
| camera starting view or the orange dot position | `view` / `hotspot` in the area's `scene.js` (chassis: `views.js`)             |
| colours and material looks                      | `src/core/materials.js` (plus `bay/colors.js` and `COLORS` in `cabin/kit.js`) |
| the side panel and cards                        | `src/core/ui.js`, `src/core/ui/`, `src/styles.css`                            |
| add a new area or part                          | see [ARCHITECTURE.md](ARCHITECTURE.md#how-to-add-a-part)                      |

## How it's built

- **Plain JavaScript and three.js.** No framework. The model is procedural: every part is built in code
  from simple shapes (lathes, extrusions, swept tubes and a lofted body surface), sized from the research
  notes. There are no downloaded 3D models or textures.
- **Areas.** Each section of the car is an independent module with the same small interface:
  `build(ctx)` returns its meshes, a camera view, an orange-dot position, `enter`/`exit` animations, a
  per-frame `update` and its buttons. The core handles navigation, picking, highlighting and the frame loop.
- **Content as data.** Each area's learning text is a plain object (`PARTS`, `SYMPTOMS`, `VIDEOS`, ...).
  Parts in the model and in the text are linked by keys such as `bay:battery`.
- **One coordinate frame:** metres, `+y` forward, `+z` up, driver side `+x`, mirrored once at the root so the
  driver sits on the left.
- **Light on the GPU:** the frame rate drops when nothing moves, shadows update on demand and the pixel ratio
  is capped, so it runs on ordinary laptops.
- **Vite** with `vite-plugin-singlefile` bundles it into one offline HTML file.

The full developer guide, with the area API, the content format and how to add areas and parts, is in
**[ARCHITECTURE.md](ARCHITECTURE.md)**.

## Exporting to Blender / .glb

```sh
npm run build
npm run export:glb     # dist/civic-2013-lx.glb: every part named, plus 5 animations
npm run export:blend   # dist/civic-2013-lx.blend: one collection per area, camera and lights set up
```

Requirements:

- **Chrome or Chromium** for the `.glb` export, which runs the app headlessly with `puppeteer-core`. Common
  install locations are found automatically; otherwise set `CHROME_PATH` to the browser executable.
- **Blender's Python** for the `.blend`: the `bpy` module (`pip install bpy`) or Blender 5.3 or newer (on the
  `PATH`, or set `BLENDER_PATH`).

The animations are `Hood_open`, `Doors_open`, `Trunk_open`, `Front_wheel_off` and `Engine_running`. Details
and the QA scripts are in [tools/README.md](../tools/README.md).

## Deploying to GitHub Pages

`.github/workflows/pages.yml` builds the app with `npm ci` and `npm run build` and publishes `dist/` on every
push to `main` (or `master`). Before the first run, set **Settings → Pages → Build and deployment → Source**
to **GitHub Actions** in the repository.
