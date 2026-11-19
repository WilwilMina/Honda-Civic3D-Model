// Small geometry and texture helpers shared by the engine bay files (scene.js and its siblings).
// All coordinates here are kit units (see base-model.js); the bay's root group scales them into car metres.
import * as THREE from "three";
import { box, sweep, fixWinding } from "../../lib/geom.js";

// Swap u and v if needed so a frame {o, a, u, v} is right-handed (u × v points along the axis a).
export const rightFrame = (F) => {
  const u = new THREE.Vector3(...F.u),
    v = new THREE.Vector3(...F.v),
    a = new THREE.Vector3(...F.a);
  return u.clone().cross(v).dot(a) < 0 ? { ...F, u: F.v, v: F.u } : F;
};

// Right-handed frame from origin, axis and the two cross directions.
export const frame = (o, a, u, v) => rightFrame({ o, a, u, v });

const WORLD_AXES = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
// Axis-aligned box from its centre and half-extents.
export const alignedBox = (centre, half) => box(centre, WORLD_AXES, half);

// Cumulative length along a polyline.
const arcLengths = (pts) => {
  const s = [0];
  for (let i = 1; i < pts.length; i++)
    s.push(
      s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]),
    );
  return s;
};

// Open tube whose texture u = arc length / period, so a scrolling dash texture moves evenly along it.
export function uvTube(points, r, period, radial = 10) {
  const g = sweep(points, r, { radial, caps: false });
  const s = arcLengths(points);
  const uv = [];
  for (let i = 0; i < points.length; i++)
    for (let j = 0; j <= radial; j++) uv.push(s[i] / period, j / radial);
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  return fixWinding(g);
}

// Texture drawn on a canvas by draw(ctx2d, w, h); repeats in both directions by default.
export function canvasTex(w, h, draw, repeat = true) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

// Shrink a polygon toward its centroid by factor k (used for the fluid inside a tank).
export const shrink = (poly, k) => {
  const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length,
    cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
  return poly.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
};

// Round the inner corners of a 3D polyline with quadratic fillets of up to `bend` units (6 segments each).
export function fillet(pts, bend) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1],
      b = pts[i],
      c = pts[i + 1];
    const la = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]),
      lc = Math.hypot(c[0] - b[0], c[1] - b[1], c[2] - b[2]);
    // never eat more than 45% of either neighbouring segment
    const d = Math.min(bend, la * 0.45, lc * 0.45);
    const p0 = b.map((v, k) => v + ((a[k] - v) * d) / la),
      p2 = b.map((v, k) => v + ((c[k] - v) * d) / lc);
    for (let j = 0; j <= 6; j++) {
      const t = j / 6;
      out.push([0, 1, 2].map((k) => (1 - t) * (1 - t) * p0[k] + 2 * (1 - t) * t * b[k] + t * t * p2[k]));
    }
  }
  out.push(pts.at(-1));
  return out;
}
