// Hotspots: the orange dots that open a child area (e.g. "Open the hood" while the whole car is shown).
// Each frame this projects the open area's children's hotspot positions to screen pixels and works out
// whether each dot is hidden behind the car ("far" dots are drawn faded). core/ui/hotspot-layer.js draws them.
import * as THREE from "three";
import { shownInScene } from "./picking.js";
import { baseLook } from "./materials.js";

// A see-through blocker doesn't hide a dot (glass, ghosted parts; focus-mode ghosts count as solid).
const seeThrough = (l) => l.transparent && l.opacity < 0.6;

// Create the per-frame hotspot tracker. `ray` is the Raycaster shared with picking.
export function createHotspotTracker({ camera, carRoot, areas, canvasHost, ray }) {
  const farCache = new Map(); // area id -> is its dot behind solid parts? (last raycast result)
  const lastCam = new THREE.Matrix4();
  const tmp = new THREE.Vector3();

  // Returns [{id, far, label, x, y}] in canvas pixels for the children of `current`.
  // The occlusion raycast is costly (≈400k triangles), so it is only redone every 6th frame while the camera
  // moves, every 45th frame otherwise (animations can move things in front), and once for a new dot.
  return function update(current, frameNo) {
    const camMoved = !lastCam.equals(camera.matrixWorld);
    if (camMoved) lastCam.copy(camera.matrixWorld);
    const spots = [];
    for (const [id, { def, inst }] of areas) {
      if (def.parent !== current || !inst.hotspot) continue;
      tmp.set(...inst.hotspot.pos);
      carRoot.localToWorld(tmp);
      if ((camMoved && frameNo % 6 === 0) || frameNo % 45 === 0 || !farCache.has(id)) {
        // cast from the camera to just short of the dot (6 cm), so the dot's own surface doesn't count;
        // nearly see-through meshes (ghosted parts, glass) don't hide it
        const dir = tmp.clone().sub(camera.position);
        const dist = dir.length();
        ray.set(camera.position, dir.normalize());
        ray.far = Math.max(0, dist - 0.06);
        const hits = ray.intersectObject(carRoot, true);
        farCache.set(
          id,
          hits.some(
            (h) =>
              shownInScene(h.object) &&
              h.object.isMesh &&
              !(h.object.material && seeThrough(baseLook(h.object.material))),
          ),
        );
        ray.far = Infinity;
      }
      tmp.project(camera);
      if (tmp.z > 1) continue; // behind the camera (or past the far plane)
      spots.push({
        id,
        far: farCache.get(id),
        label: inst.hotspot.label || def.label,
        x: (tmp.x * 0.5 + 0.5) * canvasHost.clientWidth,
        y: (-tmp.y * 0.5 + 0.5) * canvasHost.clientHeight,
      });
    }
    return spots;
  };
}
