// The 3D app core, created once by main.js with createApp(). It owns the stage (core/stage.js), the area
// navigation (go(): exit/enter animations plus a camera flight), part selection and highlight, mouse picking
// and hover, focus mode (core/focus.js: everything else turns into a grey ghost), the hotspot dots, and the
// frame loop. Areas talk to it only through `ctx` (see
// docs/ARCHITECTURE.md); the UI (core/ui.js) gets callbacks: onArea, onSelect, onHover, drawHotspots, setBusy.
import * as THREE from "three";
import { mat, claim, C, paintParts, pulseSelected, ghost } from "./materials.js";
import { PARTS } from "./registry.js";
import { createStage, cullSmallShadows, MAX_DPR } from "./stage.js";
import { createAnimator, ease } from "./camera.js";
import { createPicker } from "./picking.js";
import { createHotspotTracker } from "./hotspot-tracker.js";
import { createFocus } from "./focus.js";

// Build the app inside `canvasHost` (#stage) and report to `ui`. Returns the app API used by main.js and ui.js.
export function createApp(canvasHost, ui) {
  const { renderer, scene, camera, controls, carRoot } = createStage(canvasHost);
  const anim = createAnimator(camera, controls);

  // ------------------------------------------------------------ frame pacing input
  // Any interaction "pokes" the loop: it then draws at full rate for a while (see frame()).
  let lastPoke = performance.now();
  function poke() {
    lastPoke = performance.now();
  }
  controls.addEventListener("change", poke);
  for (const ev of ["pointerdown", "pointermove", "wheel", "keydown"])
    window.addEventListener(ev, poke, { passive: true });

  // ------------------------------------------------------------ areas
  const areas = new Map(); // id -> {def, inst}
  let current = "car";
  // ["car", "bay", "engine"] for "engine": the path from the root area down to `id`
  const chainOf = (id) => {
    const out = [];
    let a = id;
    while (a) {
      out.unshift(a);
      a = areas.get(a)?.def.parent;
    }
    return out;
  };

  // The context handed to every area's build(ctx) (documented in docs/ARCHITECTURE.md).
  const ctx = {
    THREE,
    scene,
    camera,
    controls,
    renderer,
    carRoot,
    mat,
    C,
    tween: anim.tween,
    ease,
    claim, // claim(object, "area:part") tags meshes + gives them their own materials
    car: null, // exterior API, set by the car area
    areas,
    get current() {
      return current;
    },
    state: {},
    // raise the whole car on the lift: t = 0 on the ground … 1 = 1.35 m up
    setLift(t) {
      carRoot.position.z = t * 1.35;
    },
    ghost, // ghost(keys, on, opacity): make parts see-through, or restore them
    // fly to a view {pos, target} given in car coordinates
    flyTo(view, seconds = 1.1) {
      return anim.flyTo(carRoot, view, seconds);
    },
    camTo: (p, t, s) => anim.camTo(p, t, s), // fly to world-space position p looking at t
  };

  // Build an area and attach its model under carRoot (unless the area already parented it elsewhere).
  function register(def) {
    const inst = def.build(ctx) || {};
    if (inst.group && !inst.group.parent) carRoot.add(inst.group);
    areas.set(def.id, { def, inst });
  }

  // Open area `id`: exit the areas we leave (deepest first), enter the new ones and fly the camera, all
  // while the UI is marked busy. Resolves false if the area is unknown, another change is running, or an
  // area's exit/enter threw.
  let busy = false;
  async function go(id, { instant = false } = {}) {
    if (!areas.has(id) || busy) return false;
    if (id === current && !selected) {
      await ctx.flyTo(areas.get(id).inst.view, instant ? 0 : 0.9);
      return true;
    }
    busy = true;
    ui.setBusy?.(true);
    let ok = true;
    try {
      select(null);
      if (instant) focusMode.clear({ instant: true }); // (otherwise the ghosts fade out during the flight)
      const from = chainOf(current),
        to = chainOf(id);
      // length of the shared root path: those areas stay open
      let common = 0;
      while (common < from.length && common < to.length && from[common] === to[common]) common++;
      for (let i = from.length - 1; i >= common; i--) await areas.get(from[i]).inst.exit?.(ctx, { instant });
      current = id;
      // whole-car view: don't let the scroll wheel zoom inside the body (sections need close-ups)
      controls.minDistance = areas.get(id).inst.minDistance ?? (areas.get(id).def.parent ? 0.25 : 2.8);
      ui.onArea(id);
      const enters = to.slice(common).map((a) => areas.get(a).inst.enter?.(ctx, { instant }));
      await Promise.all([...enters, ctx.flyTo(areas.get(id).inst.view, instant ? 0 : 1.2)]);
    } catch (e) {
      console.error("area change failed:", id, e);
      ok = false;
    } finally {
      busy = false;
      ui.setBusy?.(false);
      ui.onArea(current);
    }
    return ok;
  }

  // ------------------------------------------------------------ selection and highlight
  let selected = null; // selected part key (glows orange)
  let linked = new Set(); // its connected parts (glow blue)
  let hovered = null; // part under the mouse
  // bumped by every select() and focusPart(), so a focus whose reveal() is still running doesn't fly the
  // camera back to the old part when that reveal finishes
  let focusGen = 0;
  // focus mode: everything but the selected / linked parts turns into a see-through grey ghost
  const focusMode = createFocus(carRoot);
  const repaint = () => {
    paintParts(selected, linked, hovered);
    focusMode.set(selected, linked, hovered); // walks the car only when the selection or highlight changed
  };

  // Select a part (or null to clear): glow it and its links, tell the UI, and frame it with the camera.
  function select(key, { focus = true } = {}) {
    focusGen++; // cancels a focusPart() still waiting on an area's reveal()
    selected = key && PARTS[key] ? key : null;
    linked = new Set();
    if (selected) {
      // links go both ways: parts it lists, and parts that list it
      for (const l of PARTS[selected].links || []) linked.add(l);
      for (const p of Object.values(PARTS)) if ((p.links || []).includes(selected)) linked.add(p.id);
      linked.delete(selected);
      if (focus) focusPart(selected);
    }
    repaint();
    ui.onSelect(selected);
  }
  // Glow parts without selecting them (symptom causes, "parts by job"); doesn't notify the UI.
  function highlight(on, links) {
    selected = on;
    linked = new Set(links);
    repaint();
  }
  // World-space bounding box of every visible mesh of a part.
  function boundsOf(key) {
    const box = new THREE.Box3();
    carRoot.traverse((o) => {
      if (o.isMesh && o.userData.part === key && o.visible) box.expandByObject(o);
    });
    return box;
  }
  // Fly the camera so a part fills a comfortable part of the view, keeping the current viewing direction.
  async function focusPart(key) {
    const gen = ++focusGen;
    // let the area reveal hidden parts first (open the glove box, fly to a corner…)
    const inst = areas.get(String(key).split(":")[0])?.inst;
    if (inst?.reveal) {
      try {
        const r = inst.reveal(key, ctx);
        if (r === "handled") return;
        await r;
      } catch (e) {
        console.warn(e);
      }
      if (gen !== focusGen) return;
      focusMode.refresh(); // the reveal may have shown things (an opened lid, a removed cover): ghost them too
    }
    let box = boundsOf(key);
    if (box.isEmpty()) return;
    // a part spread over the car (e.g. all four tires): frame only the pieces near the one closest to the view
    if (box.getSize(new THREE.Vector3()).length() > 1.2) {
      const pieces = [];
      carRoot.traverse((o) => {
        if (o.isMesh && o.userData.part === key && o.visible) pieces.push(new THREE.Box3().setFromObject(o));
      });
      const target = controls.target,
        v = new THREE.Vector3();
      pieces.sort(
        (a, b) => a.getCenter(v).distanceTo(target) - b.getCenter(new THREE.Vector3()).distanceTo(target),
      );
      const near = pieces[0];
      box = new THREE.Box3();
      for (const pc of pieces)
        if (pc.getCenter(v).distanceTo(near.getCenter(new THREE.Vector3())) < 0.5) box.union(pc);
    }
    const c = box.getCenter(new THREE.Vector3());
    const size = Math.max(0.18, box.getSize(new THREE.Vector3()).length());
    const dir = camera.position.clone().sub(controls.target).normalize();
    // 2.6 × the part's size, clamped to 1.0–3.2 m: keeps some surroundings in view so a beginner stays oriented
    const dist = Math.min(Math.max(size * 2.6, 1.0), 3.2);
    const p1 = c.clone().add(dir.multiplyScalar(dist));
    await anim.camTo(p1, c, 0.8);
  }

  // ------------------------------------------------------------ picking: click and hover
  const ray = new THREE.Raycaster(); // shared by picking and the hotspot occlusion check
  const pickAt = createPicker({ renderer, camera, carRoot, areas, chainOf, getCurrent: () => current, ray });
  let down = null; // where the pointer went down; a click is a press + release that moved ≤ 6 px
  let mouse = null, // last hover position, consumed by hoverTick()
    hoverKey = null; // what the tooltip currently shows: a part key or "goto:<area>"
  renderer.domElement.addEventListener("pointerdown", (e) => {
    down = { x: e.clientX, y: e.clientY, t: performance.now() };
  });
  renderer.domElement.addEventListener("pointerup", (e) => {
    if (e.button !== 0) return; // only the primary button selects (right-drag pans the camera)
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6 || busy) return;
    const hit = pickAt(e.clientX, e.clientY);
    if (!hit) {
      if (selected) select(null, { focus: false });
      return;
    }
    if (hit.goto) go(hit.goto);
    else if (hit.part === selected) select(null, { focus: false });
    else select(hit.part);
  });
  renderer.domElement.addEventListener("pointermove", (e) => {
    if (e.buttons) return; // dragging the camera, not hovering
    mouse = { x: e.clientX, y: e.clientY };
  });
  renderer.domElement.addEventListener("pointerleave", () => {
    mouse = null;
    if (hovered || hoverKey) {
      hovered = null;
      hoverKey = null;
      repaint();
      ui.onHover(null);
    }
  });
  // Called from the frame loop: at most one hover pick per drawn frame instead of one per mouse event.
  function hoverTick() {
    if (!mouse || busy) return;
    const hit = pickAt(mouse.x, mouse.y);
    mouse = null;
    const key = hit ? hit.part || "goto:" + hit.goto : null;
    renderer.domElement.style.cursor = hit ? "pointer" : "grab";
    if (key !== hoverKey) {
      hoverKey = key;
      const h = hit?.part || null;
      if (h !== hovered) {
        hovered = h;
        repaint();
      }
      ui.onHover(hit);
    }
  }

  // ------------------------------------------------------------ resize
  function resize() {
    const w = Math.max(1, canvasHost.clientWidth),
      h = Math.max(1, canvasHost.clientHeight);
    renderer.setPixelRatio(Math.min(MAX_DPR, window.devicePixelRatio || 1));
    renderer.setSize(w, h, false);
    poke();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvasHost);
  resize();

  // ------------------------------------------------------------ frame loop
  const clock = new THREE.Clock();
  const updateHotspots = createHotspotTracker({ camera, carRoot, areas, canvasHost, ray });
  let frameNo = 0; // frames actually drawn
  let lastDraw = 0;
  let animWas = false; // were tweens running at the last drawn frame?
  function frame() {
    requestAnimationFrame(frame);
    // Frame pacing: 60 fps while something tweens or you touched the app in the last 2.5 s (this also caps
    // fast 120–165 Hz laptop screens), 30 fps when idle, 10 fps while the window is in the background.
    // The 2 ms slack keeps a 60 Hz display from skipping every other frame because of timer jitter.
    const now = performance.now();
    const active = anim.running || focusMode.animating || now - lastPoke < 2500;
    const fps = active ? 60 : document.hasFocus() ? 30 : 10;
    if (now - lastDraw < 1000 / fps - 2) return;
    lastDraw = now;
    frameNo++;

    hoverTick();
    const dt = Math.min(0.05, clock.getDelta()); // seconds since the last drawn frame, capped for long pauses
    anim.step(now);
    // a tween just ended (a reveal() animation, an area's enter, a camera flight): parts may have been shown
    // or hidden, so let focus mode look again (one walk per animation end, and only while it is on)
    if (animWas && !anim.running) focusMode.refresh();
    animWas = anim.running;
    focusMode.step(now);
    for (const { inst } of areas.values()) inst.update?.(dt, ctx);
    if (selected) pulseSelected(selected, now);
    if (controls.enabled) controls.update();

    // never let panning lose the car: keep the orbit point within a box around it (moves the camera along)
    {
      const t = controls.target,
        cx = Math.max(-2.6, Math.min(2.6, t.x)),
        cy = Math.max(-3.4, Math.min(3.4, t.y)),
        cz = Math.max(-0.3, Math.min(3, t.z));
      if (cx !== t.x || cy !== t.y || cz !== t.z) {
        camera.position.x += cx - t.x;
        camera.position.y += cy - t.y;
        camera.position.z += cz - t.z;
        t.set(cx, cy, cz);
      }
    }

    ui.drawHotspots(updateHotspots(current, frameNo));

    // shadows: every frame while things move, otherwise every 3rd drawn frame (still follows slow animations)
    if (active || frameNo % 3 === 0) renderer.shadowMap.needsUpdate = true;
    renderer.render(scene, camera);
  }

  // ------------------------------------------------------------ public API (main.js, ui.js, tools/qa)
  return {
    ctx,
    register,
    go,
    select,
    highlight,
    // call once, after every area is registered
    start() {
      cullSmallShadows(carRoot);
      requestAnimationFrame(frame);
    },
    get current() {
      return current;
    },
    get selected() {
      return selected;
    },
    chainOf,
    areas,
    focusPart,
    focus: focusMode, // focus mode controller (tools/qa and the console: app.focus.count, app.focus.active)
    get busy() {
      return busy;
    },
    // fly back to the open area's starting view
    resetView() {
      if (!busy) return ctx.flyTo(areas.get(current).inst.view, 0.9);
    },
  };
}
