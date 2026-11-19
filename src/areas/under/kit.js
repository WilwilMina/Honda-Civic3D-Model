// Shared layout constants and geometry helpers for the "under" area builders (underbody.js, exhaust.js, fuel.js,
// lift.js). scene.js makes one kit per build(ctx) and passes it to each builder, so they all add tagged meshes
// the same way. Frame (docs/ARCHITECTURE.md): metres, +x = driver side, +y = front, z up, ground z = 0.
import { lathe, fixWinding } from "../../lib/geom.js";

// ------------------------------------------------------------------ layout (car frame, metres)
export const FLOOR_Z = 0.262; // underside of the front floor pan
export const SILL_X = 0.7; // pinch-weld flange under the rocker panels
export const SILL_Z = 0.175; // bottom of the pinch weld (where lift pads / jack meet the car)
export const JACK_Y = [0.84, -0.84]; // front jack point (behind front wheel), rear jack point (ahead of rear wheel)
export const TAIL_X = 0.42; // tailpipe side: + = driver (US left). Side unconfirmed; best estimate is the driver side.
export const FUEL_X = 1; // filler neck to the driver side (+x): the fuel door is on the left rear quarter
export const LIFT_H = 1.35; // how far the lift raises the car
export const UNDERCOAT = 0x6f747a; // colour of the painted / undercoated floor
export const AXES = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
]; // axis-aligned frame for box()

// parts whose thin sheets are seen from both sides
const TWO_SIDED = new Set(["floor-pan", "heat-shields", "engine-cover", "under-covers"]);

// Build the helper kit; `group` is the area's root group.
export function createKit(ctx, group) {
  const { THREE, mat, C } = ctx;
  const K = (id) => "under:" + id;

  // add a mesh tagged with part `key` (if any) to `parent`; the shared builders wind some faces inward, so
  // fixWinding makes every triangle face the way its vertex normals point
  const add = (parent, geom, color, preset, key, shadow = false) => {
    const m = new THREE.Mesh(fixWinding(geom), mat(color, preset, key ? K(key) : ""));
    if (TWO_SIDED.has(key)) m.material.side = THREE.DoubleSide;
    if (key) m.userData.part = K(key);
    m.castShadow = shadow;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  // smooth centripetal Catmull-Rom curve through pts, resampled to n+1 points (for sweep())
  const curve = (pts, n = 60) =>
    new THREE.CatmullRomCurve3(
      pts.map((p) => new THREE.Vector3(...p)),
      false,
      "centripetal",
    )
      .getPoints(n)
      .map((v) => [v.x, v.y, v.z]);
  // two unit vectors perpendicular to axis `a` (and to each other), for lathe frames
  function perp(a) {
    const v = new THREE.Vector3(...a).normalize();
    const u = Math.abs(v.z) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
    const w = new THREE.Vector3().crossVectors(v, u).normalize();
    const u2 = new THREE.Vector3().crossVectors(w, v).normalize();
    return { u: u2.toArray(), v: w.toArray() };
  }
  // closed cylinder of radius r and length len centred on o, along axis
  const cyl = (o, axis, r, len, seg = 20) =>
    lathe(
      {
        o: [o[0] - (axis[0] * len) / 2, o[1] - (axis[1] * len) / 2, o[2] - (axis[2] * len) / 2],
        a: axis,
        ...perp(axis),
      },
      [
        [0, 0],
        [0, r],
        [len, r],
        [len, 0],
      ],
      seg,
    );
  // oval drum (muffler can) along x or y: lathe a round drum with rounded ends, then squash it in z
  const ovalDrum = (center, axis, len, r, squash) => {
    const prof = [
      [0, 0],
      [0, r * 0.82],
      [0.012, r * 0.96],
      [0.03, r],
      [len - 0.03, r],
      [len - 0.012, r * 0.96],
      [len, r * 0.82],
      [len, 0],
    ];
    const g = lathe({ o: [0, 0, 0], a: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] }, prof, 36);
    g.translate(-len / 2, 0, 0);
    g.scale(1, 1, squash);
    if (axis === "y") g.rotateZ(Math.PI / 2);
    g.translate(...center);
    g.computeVertexNormals();
    return g;
  };

  return { ctx, THREE, C, group, K, add, curve, cyl, ovalDrum };
}
