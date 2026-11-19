// Trunk area toolkit: the trunk's key dimensions (car frame, metres, z-up), the compact spare's size,
// and the small helpers every trunk builder uses (createKit adds tagged "trunk:<part>" meshes the same
// way). Builders: linings.js (carpet + spare well + floor board), stowage.js (spare, hold-down, jack,
// wrench), opening.js (seal, striker, taillight access, emergency release). scene.js wires them up and
// animates them.
import * as THREE from "three";
import { lathe, fixWinding } from "../../lib/geom.js";

export const T = {
  y0: -1.4, // front of the trunk (behind the rear seat back)
  y1: -2.22, // rear wall (behind the rear bumper)
  x: 0.6, // half width between the side linings
  floor: 0.52, // top of the floor board
  wellY: -1.8, // spare-tire well centre
  wellR: 0.345, // spare-tire well radius
  wellZ: 0.36, // spare-tire well floor
  hingeY: -1.45, // floor board hinge (front edge)
};

// Compact spare T135/80D15 (Honda spec sheet): 381 + 2·135·0.80 = 597 mm across.
export const SPARE = { R: 0.2985, W: 0.135, rim: 0.1905 };

// axis-aligned frame for box()
export const AX = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

export const CARPET = 0x3b3e44,
  CARPET2 = 0x33363b;

// solid vertical cylinder standing on o (radius r, height h)
export const zcyl = (o, r, h, seg = 24) =>
  lathe(
    { o, a: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
    [
      [0, 0],
      [0, r],
      [h, r],
      [h, 0],
    ],
    seg,
  );

// createKit(ctx): K(id) -> part key, add(parent, geom, colour, preset, partId, castShadow) -> mesh
export function createKit(ctx) {
  const K = (id) => "trunk:" + id;
  const add = (parent, geom, color, preset, key, shadow = false) => {
    // fixWinding: the shared builders wind some faces inward; make every triangle face its vertex normals
    const m = new THREE.Mesh(fixWinding(geom), ctx.mat(color, preset, key ? K(key) : ""));
    if (key) m.userData.part = K(key);
    m.castShadow = shadow;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  return { K, add };
}
