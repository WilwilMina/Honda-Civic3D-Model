# Architecture

A developer guide to how this Honda Civic 3D model is put together: the coordinate frame, the area modules, the
learning-content format, and how to add things. For setup and a folder map, see the [README](../README.md).

The app is plain JavaScript ES modules on top of [three.js](https://threejs.org) (r170), bundled by
[Vite](https://vite.dev) with `vite-plugin-singlefile` into one self-contained `dist/index.html` that works
offline. There is no framework: the 3D scene, the side panel and the overlays are built by hand.

## Contents

- [Big picture](#big-picture)
- [Coordinate frame](#coordinate-frame)
- [Areas](#areas)
- [The `ctx` object](#the-ctx-object)
- [The `ctx.car` API](#the-ctxcar-api)
- [Learning content](#learning-content)
- [Parts, picking and links between areas](#parts-picking-and-links-between-areas)
- [Highlighting](#highlighting)
- [Frame loop and performance](#frame-loop-and-performance)
- [Export to glTF and Blender](#export-to-gltf-and-blender)
- [How to add a part](#how-to-add-a-part)
- [How to add an area](#how-to-add-an-area)
- [Debug hooks and URL options](#debug-hooks-and-url-options)

## Big picture

```
src/main.js            boot: register content, create the UI and the 3D app, build every area, start
src/core/app.js        area navigation, part selection and highlight, hover, the frame loop
src/core/stage.js      renderer, scene, lights, garage floor, camera and orbit controls, the mirrored car root
src/core/camera.js     tweens and camera flights
src/core/picking.js    which part (or child area) is under the mouse
src/core/focus.js      focus mode: everything but the selected / linked parts fades to a grey ghost
src/core/hotspot-tracker.js  screen positions of the orange dots, and whether each is hidden behind the car
src/core/ui.js, ui/    side panel (overview, part card, symptom card), hotspot buttons, controls bar, welcome card
src/core/registry.js   merges every area's content into global tables keyed "area:id"
src/core/materials.js  colour palette, material presets, per-part materials, the see-through layers
src/core/export.js     window.__exportGLB(): the whole car + animations as a .glb
src/lib/geom.js        geometry helpers shared by all areas (lathe, prism, sweep, box, ball, fromDump)
src/areas/index.js     the list of areas and their content modules
src/areas/<area>/      one folder per area: scene.js (3D model + controls) and content.js (learning text)
```

Boot order (`src/main.js`):

1. Every area's content is added to the registry (`addData(area, content)`).
2. The UI and the app are created; the app owns the renderer, scene, camera and `ctx`.
3. Each area definition in `AREAS` is registered: its `build(ctx)` runs **once**, up front. The `car` area is
   first because it creates the body and `ctx.car`, which the other areas use.
4. The registry is checked for broken links, `app.start()` stops small meshes from casting shadows (see
   [performance](#frame-loop-and-performance)) and starts the frame loop, and the app opens the area named in
   the URL hash (default `car`).

## Coordinate frame

All model code is written in one **authoring frame**, in **metres**:

| Axis | Direction                                                              |
| ---- | ---------------------------------------------------------------------- |
| `+x` | across the car, toward the **driver side** (the left side of a US car) |
| `+y` | along the car, toward the **front**                                    |
| `+z` | **up**; the ground is `z = 0`                                          |

The origin is the middle of the wheelbase, on the ground. Useful reference numbers (from
[docs/research/exterior.md](research/exterior.md) and [exterior-shape.md](research/exterior-shape.md)):

| What                     | Value                                                      |
| ------------------------ | ---------------------------------------------------------- |
| Front / rear axle        | `y = +1.335` / `y = −1.335` (wheelbase 2.670 m)            |
| Wheel centres            | `x = ±0.75` front, `±0.761` rear; `z = 0.317` (P195/65R15) |
| Front / rear bumper tips | `y ≈ +2.265` / `y ≈ −2.292` (length 4.556 m)               |
| Width / height           | 1.752 m / 1.435 m                                          |

### The mirror at the root

In a right-handed, z-up frame with `+y` forward, `+x` is the car's **right**. To keep authoring "driver side =
`+x`" and still show the driver on the left like the real car, the app mirrors the whole car once:
`ctx.carRoot.scale.x = -1` (in `src/core/stage.js`). Consequences:

- Everything under `ctx.carRoot` (every area's `group`) keeps authoring coordinates. So do an area's `view`
  and `hotspot` positions: the core converts them with `carRoot.localToWorld`.
- Objects added directly to `ctx.scene` (not under `carRoot`) are in **world** coordinates, where
  `world x = −(authoring x)`. Keep this rare.
- Canvas-texture **text and symbols** on meshes under `carRoot` appear mirrored. Flip such textures
  (`tex.wrapS = THREE.RepeatWrapping; tex.repeat.x = -1`) or check `ctx.carRoot.matrixWorld.determinant() < 0`.
- `ctx.setLift(t)` raises the whole car (`carRoot.position.z = t × 1.35 m`) for the underside view. Anything
  that should stay on the floor (the lift posts, a wheel lying on the ground) must subtract the lift height.

### Local units inside some areas

Most areas build directly in car metres. Three scale a root group instead, so their files use local units:

| Area      | Local unit                     | Where the transform is defined                                                 |
| --------- | ------------------------------ | ------------------------------------------------------------------------------ |
| `bay`     | "kit units" of 5 mm            | `KIT_TRANSFORM` in `bay/base-model.js` (origin just ahead of the front axle)   |
| `chassis` | kit units of 5 mm              | the header of `chassis/kit.js` (front and rear halves are placed separately)   |
| `engine`  | 2 mm, with `x` along the crank | `PLACE` in `engine/kinematics.js` (the cutaway is also rotated 180° about `z`) |

"Kit units" come from `shapes.json`, a dump of an earlier 2D (isometric) model of the bay and the four
corners. They have the same axes as the car frame; only the scale and origin differ.

## Areas

An **area** is one explorable section: the outside of the car, the engine bay, the inside of the engine, and
so on. Areas form a tree; a child area is opened from its parent.

```
car (outside)
├── bay (under the hood)
│   └── engine (inside the engine)
├── chassis (wheel, brakes, suspension)
├── trunk
├── cabin (dashboard and warning lights)
├── lights (lights and wipers)
└── under (underside, on a lift)
```

### Definition

Each area's `scene.js` default-exports a definition:

```js
export default {
  id: "lights", // also the prefix of the area's part keys ("lights:headlight")
  label: "Lights & wipers", // shown in the breadcrumb and lists
  parent: "car", // null only for the root area
  build(ctx) {
    // build meshes, return the instance described below
    return { group, view, hotspot, enter, exit, update, controls, status, reveal };
  },
};
```

### Instance

Everything `build(ctx)` returns is optional except `view`.

| Field         | Type                                     | What it does                                                                                                                                                                                               |
| ------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `group`       | `THREE.Group`                            | The area's meshes. Added under `ctx.carRoot` (so the lift and the mirror apply) unless it already has a parent.                                                                                            |
| `view`        | `{ pos: [x,y,z], target: [x,y,z] }`      | Camera position and orbit target when the area is open, in the authoring frame. May use getters to switch views (the lights area flips between front and rear).                                            |
| `hotspot`     | `{ pos: [x,y,z], label }`                | The orange dot shown while the **parent** area is open. Clicking it opens this area.                                                                                                                       |
| `enter`       | `(ctx, { instant }) => Promise`          | Called when the area opens: open the hood, fade things in, start animations. Use `ctx.tween`. With `instant`, jump to the end state.                                                                       |
| `exit`        | `(ctx, { instant }) => Promise`          | Undo everything `enter` and the controls changed, so the car is back to normal for the next area.                                                                                                          |
| `update`      | `(dt, ctx) => void`                      | Called **every frame for every area**, open or not. Check your own state before animating.                                                                                                                 |
| `controls`    | array                                    | Buttons in the bottom bar while the area is open (see below).                                                                                                                                              |
| `status`      | `() => string`                           | Short readout at the top of the screen, e.g. "Headlights on · hazards".                                                                                                                                    |
| `reveal`      | `(partKey, ctx) => Promise \| "handled"` | Called before the camera focuses one of this area's parts (part click, symptom jump, card link). Open a lid, ghost a blocker or fly to a better pose; return `"handled"` if you moved the camera yourself. |
| `minDistance` | number                                   | Closest the scroll wheel can zoom while the area is open. Defaults to 2.8 m for the root area and 0.25 m for the others.                                                                                   |

Control types:

```js
{ type: "button", label, onClick() }
{ type: "toggle", label, labelOn, on, onChange(on) }
{ type: "slider", label, min, max, step, value, format(v), onInput(v) }
{ type: "group",  options: [{ label, value }], value, onChange(v) }
{ type: "html",   className, html }   // a free-form box; the UI sets control.el, update its innerHTML yourself
```

After changing a control's `label` or `on` from code, call `control.refresh?.()` (the UI adds it) to repaint it.

### Files inside an area folder

`scene.js` (the definition) and `content.js` (the learning text) are the entry files of every area. Larger
areas split the model into builder files that `scene.js` imports and calls, usually `buildX(kit)` returning
meshes plus an optional `poseX()` or `update()`. Helper files follow one naming scheme:

| File            | Holds                                                                     | Where                                         |
| --------------- | ------------------------------------------------------------------------- | --------------------------------------------- |
| `kit.js`        | `createKit(ctx, ...)`, the toolkit every builder adds its meshes through  | cabin, chassis, engine, trunk, under          |
|                 | (so each mesh gets the area's part-key prefix), plus shared constants     |                                               |
| `geometry.js`   | pure shape and texture helpers that don't need `ctx`                      | bay, chassis, engine, `car/front`, `car/rear` |
| `views.js`      | camera views, zoom views and `reveal()` poses                             | bay, chassis                                  |
| `base-model.js` | turns `shapes.json` into meshes                                           | bay (chassis keeps its loader in `kit.js`)    |
| `content/`      | the learning text once `content.js` passes about 300 lines: `systems.js`, | bay, cabin, chassis, engine, lights, under    |
|                 | `parts.js`, `symptoms.js`, `videos.js`, `guides.js`, `intro.js`           |                                               |

`content.js` stays the entry file and re-exports everything from `content/`. The `car` area pairs each file
with a folder of the same name (`body.js` + `body/`, `front.js` + `front/`, `rear.js` + `rear/`); the
body's panel cut lines are in `car/body/cut-lines.js`.

### Lifecycle

- **Build:** `build(ctx)` runs once at startup for every area, in `AREAS` order. All meshes exist from the
  start; areas hide what should only appear when they are open.
- **Navigation:** `app.go(id)` walks the tree. It calls `exit` on the open areas from the deepest up to the
  common ancestor, then `enter` on the new areas from the common ancestor down (these run in parallel with
  the camera flight to the new `view`). Going from `engine` to `cabin` exits `engine` and `bay`, then enters
  `cabin`. Only one area change runs at a time (`app.busy`).
- **Selecting a part** clears on every area change. Within an area, the side panel shows either the area's
  overview (its `START` card and lists) or one part or symptom card.

## The `ctx` object

`ctx` is passed to `build`, `enter`, `exit`, `update` and `reveal`.

| Member                                    | Use                                                                                                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `THREE`                                   | the three.js namespace                                                                                                                                        |
| `scene`, `camera`, `controls`, `renderer` | the three.js scene, perspective camera, `OrbitControls` and WebGL renderer                                                                                    |
| `carRoot`                                 | the mirrored group that holds every area's `group`                                                                                                            |
| `mat(color, preset, key)`                 | a cached `MeshStandardMaterial`; presets: `paint`, `chrome`, `rubber`, `glass`, `lens`, `plastic`, `metal`, `fabric`. Pass a part `key` so the part can glow. |
| `C`                                       | the colour palette (`C.paint`, `C.black`, `C.rubber`, `C.coolant`, ...)                                                                                       |
| `claim(object, key)`                      | tags every mesh under `object` as part `key` and gives them their own material copies                                                                         |
| `tween(seconds, fn)`                      | calls `fn(t)` every frame with `t` going **linearly** from 0 to 1; resolves when done. `seconds <= 0` calls `fn(1)` at once.                                  |
| `ease(t)`                                 | cubic ease-in-out, for use inside a tween                                                                                                                     |
| `flyTo(view, seconds)`                    | camera flight to a `{ pos, target }` in the authoring frame (a newer flight cancels an older one)                                                             |
| `camTo(pos, target, seconds)`             | the same with world-space `THREE.Vector3`s                                                                                                                    |
| `ghost(keys, on, opacity = 0.18)`         | make parts see-through (or restore them), e.g. to show what is behind a cover                                                                                 |
| `setLift(t)`                              | raise the car on the lift, 0..1                                                                                                                               |
| `car`                                     | the exterior API, below                                                                                                                                       |
| `areas`                                   | `Map` of `id → { def, inst }`                                                                                                                                 |
| `current`                                 | id of the open area                                                                                                                                           |
| `state`                                   | a free object for sharing small bits of state between areas                                                                                                   |

## The `ctx.car` API

The `car` area sets `ctx.car` when it builds (`src/areas/car/body/api.js`). Other areas use it to move body parts;
guard calls with `?.` so an area still builds if the exterior changes. All `t` values run 0..1
(0 = closed or fitted, 1 = open or removed); call them inside `ctx.tween` for smooth motion.

| Member                                            | What it does                                                                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `setHood(t)`                                      | open the hood (the prop rod swings up near the end)                                                                      |
| `setDoor("fl" \| "fr" \| "rl" \| "rr", t)`        | open a door (65° at `t = 1`)                                                                                             |
| `setTrunk(t)`                                     | open the trunk lid                                                                                                       |
| `setWheelOff(id, t)`                              | slide a wheel off its hub and lay it on the floor                                                                        |
| `wheel(id)`                                       | the wheel's `THREE.Group`                                                                                                |
| `hood`, `trunk`                                   | current opening (read only)                                                                                              |
| `doors`                                           | `{ fl, fr, rl, rr }` with `{ group, angle, side }`                                                                       |
| `parts`                                           | named exterior meshes (headlights, lamp sections, wipers, washer nozzles) that other areas can `claim`                   |
| `lights`, `glowMats`                              | the lamp glow overlays                                                                                                   |
| `setLights({ head, tail, brake, reverse, turn })` | lamp glow levels, each 0..1                                                                                              |
| `sweepWipers()`, `sweeping`                       | run one wiper sweep / whether one is running                                                                             |
| `stationAt(y)`, `surfacePoint(y, U)`              | the body surface's cross-section at `y`, and a point on it (`U` runs 0..8 around the section, see `car/body/section.js`) |

## Learning content

Each area's `content.js` exports plain data. Large areas split it into a `content/` folder and re-export from
`content.js`. Ids are local to the area (`battery`); the registry turns them into **part keys**
(`bay:battery`). Anything that already contains a colon is treated as a full key, which is how content
points into another area.

```js
export const SYSTEMS = [{ id, label, blurb }];

export const PARTS = {
  battery: {
    name: "Battery (12-volt)",
    sys: ["electrical"], // SYSTEMS ids: the "Parts by job" lists
    what: "First sentence is the card's summary line. The rest appears under How it works.",
    spec: "Facts and numbers for this car (optional)",
    check: "How an owner can check it",
    trouble: "Signs it is going bad",
    diy: "Easy", // "Easy" | "Medium" | "Hard" | "No" (text after a dash is ignored)
    tip: "Good-to-know note (optional)",
    links: ["alternator"], // related parts in this area: they glow blue when this one is selected
    cross: ["cabin:some-part"], // related parts in other areas (full keys)
  },
};

export const SYMPTOMS = [
  {
    id: "nostart",
    label: "Car won't start",
    urgency: "soon", // "stop" | "soon" | "watch"
    group: "Starting & electrical",
    detail: "What the driver notices",
    causes: [{ part: "battery", why: "Why this part can cause it", check: "How to check" }], // most likely first
    note: "Optional footnote",
  },
];

export const VIDEOS = {
  battery: [{ label: "Replace the battery", url: "https://...", site: "CarCareKiosk" }],
};
export const GUIDES = { battery: { title: "Jump-start the car", steps: ["...", "..."] } };
export const START = { lead, how, sections: [{ title, html }], foot }; // the area's overview card
```

- **Urgency** labels: `stop` = "Stop driving — get it checked now", `soon` = "Get it checked soon",
  `watch` = "Keep an eye on it".
- **Symptom groups** (the finder lists them in this order): Warning lights · Noises · Smoke & smells ·
  Leaks & fluids · Braking · How it drives · Starting & electrical · Lights & visibility · Tires & wheels ·
  Comfort.
- **Videos** must be `https://` links (others are dropped). Link only beginner-manageable jobs.
- **`START.sections[].html`** is inserted as HTML, so it may use simple markup (`<ul>`, `<b>`, `ui-steps`
  lists). Everything else is escaped and shown as plain text.
- The part card has four tabs: **What it does** (`what`, `spec`, links), **Care** (`check`, `tip`),
  **Problems** (`trouble` and every symptom that lists the part as a cause) and **DIY** (`diy`, the guide and
  the videos).
- At startup `check()` in `registry.js` reports links, causes and videos that point at unknown parts. The
  list goes to the console and to `window.__dataProblems`; keep it empty.

Facts should come from the research notes in [docs/research/](research/README.md), which cite their sources.
Write in plain, beginner-friendly language.

## Parts, picking and links between areas

- A clickable mesh carries `mesh.userData.part = "area:id"`, where `id` is a key of that area's `PARTS`. The
  easy way is `ctx.claim(object, key)`, which tags every mesh under `object` and gives them their own
  materials. Alternatively build with `ctx.mat(color, preset, key)` and set `userData.part` yourself.
- A mesh or group in a **parent** area tagged `userData.goto = "<childAreaId>"` opens that child when clicked:
  the hood (`goto: "bay"`), a front wheel (`"chassis"`), the driver's door (`"cabin"`), the trunk lid
  (`"trunk"`) and the lamps (`"lights"`).
- Picking (`src/core/picking.js`) walks the ray hits from front to back and ignores hidden meshes and meshes
  with opacity below 0.3:
  1. a part of the **open** area is picked;
  2. a `goto` to a **child** of the open area opens it;
  3. parts of the open area's **ancestors** and `goto`-only objects are looked past;
  4. anything else blocks the click.
- Window glass and lamp glow overlays have raycasting turned off so they never swallow clicks.

## Highlighting

Highlighting is done with the materials' emissive colour, painted by the core:

| State           | Colour                                                         |
| --------------- | -------------------------------------------------------------- |
| selected part   | orange `#ff8a1f`, pulsing                                      |
| connected parts | blue `#2f6bff` (its `links`, plus every part that links to it) |
| hovered part    | grey-blue `#6b7a90`                                            |

Because every part key has its own materials (`mat(..., key)` or `claim`), parts glow independently.
**Do not set `emissive` on part materials yourself.** For lamps that light up, add separate glow meshes (as
`car/` and `lights/` do). To show a part hidden behind others, `ghost` the blockers in `reveal`;
`src/areas/shared/reveal.js` has a `tempReveal` helper that undoes the change once the part is deselected or
the area is left.

### Focus mode

While a part is selected, or a highlight is on (symptom causes, "parts by job"), `src/core/focus.js` turns
every **other** visible mesh under `carRoot` into a light grey ghost (`FOCUS_OPACITY` 0.22, `FOCUS_COLOR`,
`FOCUS_TINT` in `materials.js`), body panels and unkeyed structure included. The selected and linked parts
stay solid with their glow; a ghost under the mouse brightens to `FOCUS_HOVER_OPACITY`. It fades in and out
over `FOCUS_FADE` (0.25 s, wall-clock time) and counts as "active" for frame pacing while it fades.

- **When it changes:** `app.js` calls `focus.set()` from `repaint()`. A new selection or highlight walks the
  visible car once to collect the materials to ghost; a hover change only flips a flag; nothing is walked per
  frame. When a tween ends (a `reveal()` animation, a camera flight) it walks again so newly shown meshes join.
- **When it clears:** `select(null)` (card close, `Esc`, empty-space click), `highlight(null, [])`, and every
  area change (`go()` clears the selection first; an `instant` change also skips the fade-out). Scroll-wheel
  zoom doesn't touch it.
- **Not ghosted:** anything outside `carRoot` (floor, lift), unlit materials (`MeshBasicMaterial`: lamp
  glows, cabin screens and icons, flow arrows), sprites, points, hidden meshes, materials with opacity below
  0.05, and meshes or materials with `userData.noFocus = true`.
- **Picking ignores it:** `picking.js` and the hotspot occlusion check read `baseLook(m)`, the opacity
  without the focus layer, so a ghosted part can still be hovered and clicked.

### See-through layers

`ghost()` (areas), `fadeTo(m, k)` (an area's own camera-driven fade, e.g. the bay's inner fenders) and focus
mode can all apply to the same material. None of them writes `opacity`, `transparent`, `depthWrite` or
`color` directly: each sets its flag in `m.userData` (`ghostOp`, `fadeOp`, `focusK`/`focusH`) and calls
`applyLook(m)`, which saves the material's own values once (`userData.look0`) when the first layer turns on,
computes the effective look from all active layers, and restores the exact saved values when the last one
turns off. **Don't set those four properties yourself on a material that may be ghosted**; use `ghost()` or
`fadeTo()`.

## Frame loop and performance

The app aims to stay smooth on an ordinary laptop with integrated graphics:

- **Frame pacing:** 60 fps while you interact or something is animating, 30 fps when idle, 10 fps when the
  window is in the background.
- **Pixel ratio** is capped at 1.5 on high-DPI screens.
- **Shadows** are not auto-updated: the shadow map is redrawn every frame while something moves and every
  third frame otherwise. At startup (`cullSmallShadows` in `core/stage.js`, run by `app.start()`), meshes
  smaller than about 12 cm stop casting shadows.
- **Picking:** hover picking runs at most once per frame. The "is this hotspot hidden behind the car?" raycast
  runs only every few frames, and only after the camera moves.
- **Tweens** advance inside the frame loop; `update(dt)` gets `dt` capped at 0.05 s.
- The orbit target is kept inside a box around the car so panning can't lose it.
- **Budget:** the whole model is a few hundred thousand triangles. Share geometry where you can, keep segment
  counts modest, and set `castShadow` only on meshes that matter.

## Export to glTF and Blender

`src/core/export.js` installs `window.__exportGLB()`. It makes every part visible, gives every object a unique
name, stores `partName`, `area` and a short `summary` in each part's glTF extras, and samples animations by
driving the `ctx.car` functions and the engine's crank slider: `Hood_open`, `Doors_open`, `Trunk_open`,
`Front_wheel_off` and `Engine_running`. The root is rotated to glTF's y-up. Invisible helpers (unlit lamp
glows, sprites, lights) are left out.

`tools/export-glb.mjs` runs that in headless Chrome and saves the `.glb`; `tools/make_blend.py` turns it into
a `.blend` with one collection per area. See [tools/README.md](../tools/README.md). To export a new
animation, add a `sample(name, frames, fps, apply)` call in `export.js`.

## How to add a part

1. Add an entry to the area's `PARTS` (in `content.js` or its `content/parts.js`) with at least `name`,
   `what`, `check`, `trouble` and `diy`. Add it to a `SYSTEMS` group with `sys`, and to `links` or `cross`
   where it works with other parts.
2. In the area's `scene.js` (or the sibling file that builds that piece), build the mesh inside the area's
   `group` and tag it: `ctx.claim(mesh, "bay:my-part")`, or use `ctx.mat(color, preset, "bay:my-part")` and set
   `mesh.userData.part`.
3. If it can be hard to see, handle it in the area's `reveal(key)` (open something, ghost a blocker, or fly to
   a pose; `tools/qa/pose-search.mjs` finds good poses).
4. Optionally add `VIDEOS`, a `GUIDES` entry and symptoms that list it as a cause.
5. Run `npm run dev`, open `#area=bay&part=bay:my-part`, and check the console for data problems.
   `npm run build && npm run qa:reveal` checks it is visible when selected.

## How to add an area

1. Create `src/areas/<id>/scene.js` exporting `{ id, label, parent, build(ctx) }` and
   `src/areas/<id>/content.js` exporting at least `PARTS` and `START`.
2. Register both in `src/areas/index.js`: import them, add the definition to `AREAS` (after its parent and
   after `car`) and the content to `DATA` under the same id.
3. In `build`, return a `view` and a `hotspot` (shown on the parent). If the area is reached by clicking
   something in the parent, tag that object with `userData.goto = "<id>"`.
4. Make `enter` and `exit` symmetric: whatever `enter` or a control opens, `exit` closes. `npm run qa` checks
   that leaving an area mid-animation leaves the car closed and in place.
5. If the area needs a new collection in the Blender copy, add its id to `LABEL` in `tools/make_blend.py`.

## Debug hooks and URL options

The URL hash accepts `area=<id>`, `part=<key>` (select a part), `instant` (skip intro animations and the
welcome card) and `welcome` (show the welcome card even with `instant`), e.g.
`index.html#area=bay&part=bay:battery`.

For tools and the browser console the app exposes `window.app` (`go`, `select`, `areas`, `ctx`, ...),
`window.__ready` (true once the first area is open), `window.__dataProblems` and `window.__exportGLB`.
