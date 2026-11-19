// Small geometry helpers for the engine cutaway, all in the engine's local frame (2 mm units, z up).
// Most engine parts are either cylinders along an axis or flat (y, z) outlines pushed along x (crank webs,
// rods, cam lobes, gears), because the engine's moving parts all turn about the x axis.
import * as THREE from "three";
import { prism } from "../../lib/geom.js";

/** Convex hull of 2D points (Andrew's monotone chain), counter-clockwise. */
export function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const turn = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [],
    upper = [];
  for (const q of p) {
    while (lower.length >= 2 && turn(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (upper.length >= 2 && turn(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
    upper.push(q);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

/** Rounded outline wrapped around circles [[cy, cz, r], ...]: the hull of their sampled rims (rods, lobes, webs). */
export function blob(circles, n = 24) {
  const pts = [];
  for (const [cy, cz, r] of circles)
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      pts.push([cy + Math.cos(t) * r, cz + Math.sin(t) * r]);
    }
  return hull(pts);
}

// frame for prism(): profile axes u = y, v = z, extruded along a = x
const YZ = { o: [0, 0, 0], a: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] };
/** A flat (y, z) outline pushed along x from x0 to x1. */
export const slab = (poly, x0, x1) => prism(YZ, poly, x0, x1);

/** Cylinder along x from x0 to x1, centred on the x axis. */
export function cylX(x0, x1, r, seg = 32) {
  const g = new THREE.CylinderGeometry(r, r, x1 - x0, seg);
  g.rotateZ(-Math.PI / 2);
  g.translate((x0 + x1) / 2, 0, 0);
  return g;
}

/** Cylinder along z from z0 to z1, centred on the z axis. */
export function cylZ(z0, z1, r, seg = 32) {
  const g = new THREE.CylinderGeometry(r, r, z1 - z0, seg);
  g.rotateX(Math.PI / 2);
  g.translate(0, 0, (z0 + z1) / 2);
  return g;
}

/** Cylinder between two points a and b ([x, y, z]). */
export function cylAB(a, b, r, seg = 16) {
  const A = new THREE.Vector3(...a),
    B = new THREE.Vector3(...b);
  const d = B.clone().sub(A);
  const g = new THREE.CylinderGeometry(r, r, d.length(), seg);
  g.applyQuaternion(
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()),
  );
  const c = A.add(B).multiplyScalar(0.5);
  g.translate(c.x, c.y, c.z);
  return g;
}

/** Axis-aligned box between corners a and b. */
export function boxG(a, b) {
  const g = new THREE.BoxGeometry(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  return g;
}

/** A gear in the (y, z) plane pushed along x: `teeth` trapezoid teeth of height `depth` on outer radius r. */
export function gear(x0, x1, r, teeth, depth = 1.6) {
  const pts = [];
  for (let i = 0; i < teeth; i++) {
    // [fraction of the tooth pitch, radius]: root, rise, flat top, fall
    for (const [f, rr] of [
      [0.0, r - depth],
      [0.18, r],
      [0.5, r],
      [0.68, r - depth],
    ]) {
      const t = ((i + f) / teeth) * Math.PI * 2;
      pts.push([Math.sin(t) * rr, Math.cos(t) * rr]);
    }
  }
  return slab(pts, x0, x1);
}

/**
 * Keep only some faces of a BoxGeometry (its groups are +x −x +y −y +z −z = 0…5). Used for the see-through
 * block/head/pan: leaving out the near faces means a click aimed at a part inside never hits a wall first.
 */
export function keepFaces(g, keep) {
  const idx = g.index.array,
    out = [];
  for (const gr of g.groups)
    if (keep.includes(gr.materialIndex))
      for (let i = gr.start; i < gr.start + gr.count; i++) out.push(idx[i]);
  const h = g.clone();
  h.setIndex(out);
  h.clearGroups();
  return h;
}

/** Helix tube (a valve spring): coil radius r, height h, `turns` turns, wire radius w; z from 0 to h. */
export function springGeom(r, h, turns, w) {
  class Helix extends THREE.Curve {
    getPoint(t, out = new THREE.Vector3()) {
      const a = t * turns * Math.PI * 2;
      return out.set(Math.cos(a) * r, Math.sin(a) * r, t * h);
    }
  }
  return new THREE.TubeGeometry(new Helix(), Math.round(turns * 20), w, 6, false);
}

/** Non-indexed, uv-free copy so geometries with different attributes can go through mergeGeometries. */
export function mergeable(g) {
  const h = g.index ? g.toNonIndexed() : g;
  h.deleteAttribute("uv");
  return h;
}
