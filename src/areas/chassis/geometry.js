// Pure geometry helpers for the chassis builders (no ctx): solids of revolution about any axis, x-axis
// cylinders and (y, z) slabs for either side of the car, swept tubes, Catmull-Rom smoothing, annular sectors
// and coil-spring centre lines. Units are kit units unless noted (see kit.js for the kit-unit transform).
// kit.js and the corner builders (front-corner.js, rear-corner.js, brake-lines.js, wheels.js) import them.
import * as THREE from "three";
import { lathe, prism, sweep } from "../../lib/geom.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// Make every triangle face the way its normals point (some shared builders wind tubes inside-out). Unlike
// lib/geom.js fixWinding, near-degenerate triangles are left alone: their winding is just float noise.
export function fixWinding(g) {
  if (!g.index) return g;
  const p = g.attributes.position,
    n = g.attributes.normal,
    idx = g.index.array;
  const a = V(),
    b = V(),
    c = V(),
    na = V(),
    nb = V(),
    nc = V();
  for (let i = 0; i < idx.length; i += 3) {
    a.fromBufferAttribute(p, idx[i]);
    b.fromBufferAttribute(p, idx[i + 1]);
    c.fromBufferAttribute(p, idx[i + 2]);
    const f = b.sub(a).cross(c.sub(a));
    if (f.lengthSq() < 1e-14) continue;
    na.fromBufferAttribute(n, idx[i]);
    nb.fromBufferAttribute(n, idx[i + 1]);
    nc.fromBufferAttribute(n, idx[i + 2]);
    if (f.dot(na.add(nb).add(nc)) < 0) {
      const t = idx[i + 1];
      idx[i + 1] = idx[i + 2];
      idx[i + 2] = t;
    }
  }
  g.index.needsUpdate = true;
  return g;
}

// Copy of a geometry mirrored across x = 0 (driver side <-> passenger side).
export const mirrorX = (g) => fixWinding(g.clone().applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1)));

// Right-handed frame around axis a, so lathe winding is consistent whichever way the axis points.
function frame(o, a) {
  const ax = V(...a).normalize();
  const ref = Math.abs(ax.z) > 0.9 ? V(1, 0, 0) : V(0, 0, 1);
  const u = ref
    .clone()
    .sub(ax.clone().multiplyScalar(ref.dot(ax)))
    .normalize();
  const v = ax.clone().cross(u);
  return { o, a: ax.toArray(), u: u.toArray(), v: v.toArray() };
}

// Solid of revolution about axis a through o; poly = [[along-axis, radius], ...].
export const turn = (o, a, poly, seg = 32) => fixWinding(lathe(frame(o, a), poly, seg));

// Solid cylinder along x from x0 to x1 (outboard for side s = ±1) at (y, z).
export const cylX = (s, x0, x1, y, z, r, seg = 24) =>
  turn(
    [x0 * s, y, z],
    [s, 0, 0],
    [
      [0, 0],
      [0, r],
      [x1 - x0, r],
      [x1 - x0, 0],
    ],
    seg,
  );

// Round tube along a polyline.
export const tube = (pts, r, radial = 10) => fixWinding(sweep(pts, r, { radial }));

// Resample control points along a smooth centripetal Catmull-Rom curve (for hoses, wires, cables).
export function smooth(pts, n = 40) {
  const c = new THREE.CatmullRomCurve3(
    pts.map((p) => (p.isVector3 ? p : V(...p))),
    false,
    "centripetal",
  );
  return c.getPoints(n).map((p) => p.toArray());
}

// Annular sector outline in the (y, z) wheel plane around (cy, cz); angles in degrees from +y toward +z.
export function sector(cy, cz, r0, r1, d0, d1, n = 16) {
  const o = [],
    i = [];
  for (let k = 0; k <= n; k++) {
    const a = ((d0 + ((d1 - d0) * k) / n) * Math.PI) / 180;
    o.push([cy + Math.cos(a) * r1, cz + Math.sin(a) * r1]);
    i.push([cy + Math.cos(a) * r0, cz + Math.sin(a) * r0]);
  }
  return [...o, ...i.reverse()];
}

// Prism of a (y, z) outline between x0..x1, mirrored to the passenger side when s = -1.
export const slabX = (s, poly, x0, x1) =>
  fixWinding(
    prism({ o: [0, 0, 0], a: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] }, poly, x0, x1).applyMatrix4(
      new THREE.Matrix4().makeScale(s, 1, 1),
    ),
  );

// Centre line of a closed-end coil spring around (cx, cy) from z0 to z1: the end coils are flat (pitch about
// one wire size), the active coils share the rest of the height.
export function helixPts(cx, cy, r, z0, z1, turns, tubeR, flat = 0.75) {
  const N = Math.round(turns * 40),
    out = [];
  const active = turns - 2 * flat;
  const rise = z1 - z0 - 2 * tubeR,
    endRise = 2.1 * tubeR * flat;
  const pitch = (rise - 2 * endRise) / active;
  for (let i = 0; i <= N; i++) {
    const tt = (i / N) * turns;
    let z;
    if (tt < flat) z = (tt / flat) * endRise;
    else if (tt > turns - flat) z = rise - ((turns - tt) / flat) * endRise;
    else z = endRise + (tt - flat) * pitch;
    const a = tt * Math.PI * 2;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, z0 + tubeR + z]);
  }
  return out;
}
