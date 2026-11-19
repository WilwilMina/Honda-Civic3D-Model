// Mesh/material helpers shared by the engine builders (block.js, bottom-end.js, valvetrain.js, timing.js,
// ignition.js). Every engine part is tagged "engine:<key>" (a key in content.js PARTS) and can only be clicked
// while the area is open. Rigid pieces go through bucket() and are merged per (parent, part, look) to keep
// draw calls low; scene.js calls flush() once at the end of the build. createKit(ctx, root, isShown) binds the
// helpers to one area instance; the pure shape helpers (no ctx) are in geometry.js.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { mergeable } from "./geometry.js";

// [metalness, roughness] per look
const LOOKS = {
  metal: [0.45, 0.45],
  chrome: [0.85, 0.22],
  plastic: [0.05, 0.6],
  rubber: [0, 0.85],
  paint: [0.55, 0.32],
};

/** Material for a look; `opts` are extra MeshStandardMaterial properties (transparency etc.). */
export function matOf(color, look = "metal", opts = null) {
  const [metalness, roughness] = LOOKS[look] || LOOKS.metal;
  const m = new THREE.MeshStandardMaterial({ color, metalness, roughness });
  if (opts) Object.assign(m, opts);
  return m;
}

/** Make an object ignore clicks entirely (outlines, gas, effects). */
export function noPick(o) {
  o.raycast = () => {};
  return o;
}

/**
 * Builder kit bound to one area instance. `root` is the engine-frame group parts go into by default, and
 * `isShown()` says whether the area is open (the hidden cutaway sits inside the bay and must not catch clicks there).
 */
export function createKit(ctx, root, isShown) {
  // clickable only while the area is open
  const pickWhenShown = (o) => {
    const base = o.raycast.bind(o);
    o.raycast = (ray, out) => {
      if (isShown()) base(ray, out);
    };
    return o;
  };

  // one tagged part mesh with its own highlightable material
  const part = (geom, key, color, look, parent = root, opts = null) => {
    const mesh = new THREE.Mesh(geom, matOf(color, look, opts));
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    ctx.claim(mesh, "engine:" + key);
    pickWhenShown(mesh);
    parent.add(mesh);
    return mesh;
  };

  // queue a rigid piece; pieces with the same parent, part key and look become one merged mesh at flush()
  const buckets = new Map();
  const bucket = (geom, key, color, look, parent = root, opts = null) => {
    const id = `${parent.uuid}|${key}|${color}|${look}|${JSON.stringify(opts || {})}`;
    let b = buckets.get(id);
    if (!b) buckets.set(id, (b = { geoms: [], key, color, look, parent, opts }));
    b.geoms.push(geom);
  };
  const flush = () => {
    for (const b of buckets.values()) {
      const gs = b.geoms.map(mergeable);
      part(gs.length > 1 ? mergeGeometries(gs) : gs[0], b.key, b.color, b.look, b.parent, b.opts);
    }
    buckets.clear();
  };

  return { root, C: ctx.C, part, bucket, flush, pickWhenShown };
}
