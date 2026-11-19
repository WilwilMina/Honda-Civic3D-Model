// Mouse picking: turns a screen point into "this part" or "open that area".
// Only parts of the area that is open can be clicked; in a parent area, meshes tagged userData.goto
// (the hood -> "bay"…) open the child area instead. Used by core/app.js for clicks and hover.
import * as THREE from "three";
import { PARTS } from "./registry.js";
import { baseLook } from "./materials.js";

// True if the object and all of its parents are visible (three.js raycasts ignore `visible`).
export const shownInScene = (o) => {
  for (let q = o; q; q = q.parent) if (!q.visible) return false;
  return true;
};

// Create pickAt(x, y) for client (CSS pixel) coordinates. Returns {part}, {goto} or null.
//   getCurrent() -> id of the open area; chainOf(id) -> [root, …, id]; areas: Map id -> {def, inst}.
//   ray is a shared Raycaster (the hotspot occlusion check reuses it).
export function createPicker({ renderer, camera, carRoot, areas, chainOf, getCurrent, ray }) {
  const ndc = new THREE.Vector2();
  return function pickAt(x, y) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObject(carRoot, true);
    const current = getCurrent();
    const chain = chainOf(current);
    // walk the hits front to back; skip hidden and see-through (ghosted) meshes
    for (const h of hits) {
      const o = h.object;
      // (focus-mode ghosts count as solid: baseLook() ignores that layer, so they can still be hovered and clicked)
      if (!shownInScene(o) || (o.material && baseLook(o.material).opacity < 0.3)) continue;
      // the nearest part / goto tag on the mesh or any of its parents
      let goto = null,
        part = null;
      for (let q = o; q; q = q.parent) {
        if (!goto && q.userData.goto) goto = q.userData.goto;
        if (!part && q.userData.part) part = q.userData.part;
      }
      const partArea = part ? part.split(":")[0] : null;
      if (part && partArea === current && PARTS[part]) return { part };
      if (goto && areas.has(goto) && areas.get(goto).def.parent === current) return { goto };
      if (part && chain.includes(partArea) && PARTS[part]) continue; // parent-area part in front: keep looking
      if (goto && !part) continue; // a door/lid that only opens another area: look past it
      if (part || goto) return null; // something from an unrelated area blocks the view
    }
    return null;
  };
}
