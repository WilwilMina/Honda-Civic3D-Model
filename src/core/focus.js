// Focus mode: while a part is selected (or a symptom / "parts by job" highlight is on), every OTHER visible
// mesh of the car turns into a light grey, very see-through ghost, so the selected part (orange glow) and its
// linked parts (blue glow) stand out even when they are small or buried. Created once by core/app.js.
//
// How it works:
//  - set(selected, linked, hovered) is called by app.js whenever the selection, highlight or hover changes.
//    A new selection/highlight walks the visible car once and collects the materials to ghost: lit materials
//    (MeshStandard/Phong/Lambert) of visible meshes, minus the focused parts' own materials. A hover change
//    only flips one flag. Nothing is walked per frame.
//  - Each ghosted material has an entry {k, h} that eases toward its target (k: 0 solid → 1 ghost, h: hover
//    brighten). step(now) advances them from the frame loop by wall-clock time (like the camera tweens), so a
//    fade takes 0.25 s even on a slow machine; it only works while something is still moving (`animating`,
//    which app.js counts as "active" for frame pacing).
//  - The look itself is computed by applyLook() in materials.js from m.userData.focusK / focusH, together
//    with the area layers (ghost(), fadeTo()). The material's own values are saved there once and put back
//    exactly when every layer is off, so focus mode and an area's ghost() never save each other's state.
//  - When the fade-out of a material reaches 0 its flags are deleted, so nothing stays ghosted. clear()
//    does that at once (instant area changes).
//
// Not ghosted: the floor, lift and anything else outside carRoot; unlit materials (lamp glow overlays, the
// cabin's screens and icons, flow arrows, gas volumes); sprites, points and lines; hidden meshes; helper
// materials that are nearly invisible anyway (opacity < 0.05); and anything with userData.noFocus.
import { partMaterials, applyLook, baseLook } from "./materials.js";

export const FOCUS_FADE = 0.25; // seconds for the fade in or out
const HOVER_FADE = 0.12; // seconds for the hover brighten
const MIN_OPACITY = 0.05; // materials more transparent than this are helpers: leave them alone

// smoothstep, so the fade starts and ends gently
const smooth = (t) => t * t * (3 - 2 * t);

// Can this material be ghosted at all?
function ghostable(m) {
  if (!m || m.visible === false || m.userData.noFocus) return false;
  if (!(m.isMeshStandardMaterial || m.isMeshPhongMaterial || m.isMeshLambertMaterial)) return false;
  return baseLook(m).opacity >= MIN_OPACITY;
}

// Nearest part key on the mesh or its parents (the same rule as picking).
function partOf(o) {
  for (let q = o; q; q = q.parent) if (q.userData.part) return q.userData.part;
  return null;
}

// Create the focus controller for the meshes under `carRoot`.
export function createFocus(carRoot) {
  const entries = new Map(); // material -> { k, h, tk, th }: current and target ghost / hover amounts
  let focusKeys = new Set(); // selected + linked part keys ("" set = focus mode off)
  let hoverKey = null;
  let animating = false;
  let lastStep = 0; // time (ms) of the last step(), to measure the real time since then

  // Walk the visible car once: which materials should be ghosts for the current focus keys?
  function collect() {
    const ghosts = new Set();
    if (!focusKeys.size) return ghosts;
    // materials of focused parts stay solid, even when a non-part mesh happens to share one
    const solid = new Set();
    for (const k of focusKeys) for (const m of partMaterials.get(k) || []) solid.add(m);
    carRoot.traverseVisible((o) => {
      if (!o.isMesh || o.userData.noFocus) return;
      const list = Array.isArray(o.material) ? o.material : [o.material];
      const focused = focusKeys.has(partOf(o));
      for (const m of list) {
        if (focused) solid.add(m);
        else if (ghostable(m)) ghosts.add(m);
      }
    });
    for (const m of solid) ghosts.delete(m);
    return ghosts;
  }

  // Point every entry at its new target (ghost or solid, hovered or not) and start the animation.
  function retarget(ghosts) {
    for (const m of ghosts) if (!entries.has(m)) entries.set(m, { k: 0, h: 0, tk: 1, th: 0 });
    for (const [m, e] of entries) e.tk = ghosts.has(m) ? 1 : 0;
    rehover();
  }
  function rehover() {
    const hov = hoverKey ? partMaterials.get(hoverKey) : null;
    for (const [m, e] of entries) e.th = hov?.has(m) ? 1 : 0;
    if (!animating && entries.size) lastStep = performance.now(); // a new fade starts from now
    animating = entries.size > 0;
  }

  // the ghost set as it is now, for refresh(): the materials whose target is "ghost"
  const targetGhosts = () => new Set([...entries].filter(([, e]) => e.tk === 1).map(([m]) => m));

  return {
    // New selection state. `selected` may be null; `linked` is a Set of part keys; `hovered` a key or null.
    set(selected, linked, hovered) {
      const keys = new Set(linked);
      if (selected) keys.add(selected);
      const same = keys.size === focusKeys.size && [...keys].every((k) => focusKeys.has(k));
      hoverKey = hovered;
      if (same) {
        if (entries.size) rehover(); // only the hover changed: no walk
        return;
      }
      focusKeys = keys;
      retarget(collect());
    },
    // Walk again with the same focus (call after something was shown or hidden, e.g. a reveal() opened a lid).
    refresh() {
      if (!focusKeys.size) return;
      const ghosts = collect();
      // keep materials that are already ghosts even if their mesh was just hidden: hidden is harmless, and
      // a later show must not pop back solid in the middle of a focus
      for (const m of targetGhosts()) ghosts.add(m);
      retarget(ghosts);
    },
    // Advance the fades to time `now` (ms, performance.now()). Cheap no-op when nothing is moving.
    step(now) {
      if (!animating) return;
      const dt = Math.max(0, now - lastStep) / 1000;
      lastStep = now;
      const dk = dt / FOCUS_FADE,
        dh = dt / HOVER_FADE;
      let moving = false;
      for (const [m, e] of entries) {
        if (e.k === e.tk && e.h === e.th) continue;
        e.k = e.tk > e.k ? Math.min(e.tk, e.k + dk) : Math.max(e.tk, e.k - dk);
        e.h = e.th > e.h ? Math.min(e.th, e.h + dh) : Math.max(e.th, e.h - dh);
        if (e.k === 0 && e.tk === 0) {
          // fully faded back: drop the flags so applyLook() restores the saved values
          delete m.userData.focusK;
          delete m.userData.focusH;
          entries.delete(m);
        } else {
          m.userData.focusK = smooth(e.k);
          m.userData.focusH = smooth(e.h);
          moving = true;
        }
        applyLook(m);
      }
      animating = moving;
    },
    // Turn focus mode off. instant: restore every material now, without the fade-out.
    clear({ instant = false } = {}) {
      focusKeys = new Set();
      hoverKey = null;
      if (!instant) return retarget(new Set());
      for (const m of entries.keys()) {
        delete m.userData.focusK;
        delete m.userData.focusH;
        applyLook(m);
      }
      entries.clear();
      animating = false;
    },
    // true while a fade is running (the frame loop then draws at full rate)
    get animating() {
      return animating;
    },
    // true while focus mode is on (a selection or highlight is active)
    get active() {
      return focusKeys.size > 0;
    },
    // debug / QA: how many materials currently carry a focus ghost
    get count() {
      return entries.size;
    },
  };
}
