// Geometry builders on the body surface P(y, U) from section.js. A "patch" is the piece of surface between two
// stations y0..y1 and two U limits (constants or functions of y); body panels, glass, lamps and trim are all patches,
// optionally pushed in or out along the normal (off). Also: surface frames, end caps and a rear-view projector.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Y_END, Y_REAR, clamp, lerp } from "./profile.js";
import { CREASES, DENS, P, STATIONS, half, st } from "./section.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// a limit given as a constant or as a function of y -> always a function
const fn = (v) => (typeof v === "function" ? v : () => v);
// the shared STATIONS rows between y0 and y1, plus both ends
export function stationsIn(y0, y1) {
  const out = [y0];
  for (const y of STATIONS) if (y > y0 + 1e-4 && y < y1 - 1e-4) out.push(y);
  out.push(y1);
  return out;
}
// push every vertex off along its normal
function offsetGeom(geo, off, keepNormals = false) {
  if (!off) return geo;
  const p = geo.attributes.position,
    n = geo.attributes.normal;
  for (let i = 0; i < p.count; i++)
    p.setXYZ(i, p.getX(i) + n.getX(i) * off, p.getY(i) + n.getY(i) * off, p.getZ(i) + n.getZ(i) * off);
  if (!keepNormals) geo.computeVertexNormals();
  return geo;
}
// outward surface normal at (y, U), by finite differences; dir picks the side for the U derivative (one-sided at a
// crease, so the crease stays crisp)
const _a = V(0, 0, 0),
  _b = V(0, 0, 0),
  _c = V(0, 0, 0);
export function surfNormal(y, U, dir = 1) {
  _a.set(...P(y, U));
  const ya = Math.min(Y_END, y + 0.0015),
    yb = Math.max(Y_REAR, y - 0.0015);
  _b.set(...P(ya, U)).sub(_c.set(...P(yb, U)));
  let tu = null;
  for (const k of [0.003, 0.02, 0.08, 0.3, 0.7, 1.05]) {
    const U2 = clamp(U + dir * k, 0, 8);
    const q = V(...P(y, U2))
      .sub(_a)
      .multiplyScalar(dir);
    if (q.lengthSq() > 1e-12) {
      tu = q;
      break;
    }
  }
  if (!tu || _b.lengthSq() < 1e-14) return V(U < 4 ? -1 : 1, 0, 0);
  const n = tu.cross(_b).normalize();
  return Number.isFinite(n.x) ? n : V(U < 4 ? -1 : 1, 0, 0);
}
// patchGeo(y0, y1, lo, hi, opts): the surface between stations y0..y1 and U = lo(y)..hi(y) (constants or functions).
// opts: off (offset along the normal, m), dens (columns per unit of U), ys (custom rows), crease: false (do not split
// at the CREASES lines; by default the patch is split there so each crease stays a crisp edge).
export function patchGeo(y0, y1, lo, hi, opts = {}) {
  if (opts.crease === false) return patchGeo1(y0, y1, lo, hi, opts);
  const L = fn(lo),
    H = fn(hi);
  const rows = opts.ys || stationsIn(y0, y1);
  const cuts = [-Infinity, ...CREASES, Infinity],
    geos = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    const a = cuts[i],
      b = cuts[i + 1];
    const Ls = (y) => Math.min(Math.max(L(y), a), H(y));
    const Hs = (y) => Math.max(Math.min(H(y), b), Ls(y));
    if (rows.some((y) => Hs(y) - Ls(y) > 1e-4)) geos.push(patchGeo1(y0, y1, Ls, Hs, opts));
  }
  if (geos.length === 1) return geos[0];
  if (!geos.length) return patchGeo1(y0, y1, lo, hi, opts);
  return mergeGeometries(geos);
}
// one unsplit patch: rows at the stations, columns spaced evenly by arc length, normals from the surface itself
function patchGeo1(y0, y1, lo, hi, { off = 0, dens = DENS, ys = null } = {}) {
  const L = fn(lo),
    H = fn(hi);
  const rows = ys || stationsIn(y0, y1);
  let maxR = 0;
  for (const y of rows) maxR = Math.max(maxR, H(y) - L(y));
  const nc = Math.max(1, Math.ceil(maxR * dens));
  const pos = [],
    idx = [],
    par = [];
  for (const y of rows) {
    // equal arc-length spacing along the row (skips collapsed greenhouse stretches)
    const a = L(y),
      b = H(y);
    const nf = Math.max(24, Math.ceil((b - a) * 48));
    const fine = [],
      acc = [0];
    for (let k = 0; k <= nf; k++) fine.push(P(y, a + ((b - a) * k) / nf));
    for (let k = 1; k <= nf; k++)
      acc.push(
        acc[k - 1] +
          Math.hypot(fine[k][0] - fine[k - 1][0], fine[k][1] - fine[k - 1][1], fine[k][2] - fine[k - 1][2]),
      );
    const total = acc[nf];
    if (total < 1e-7) {
      for (let j = 0; j <= nc; j++) {
        pos.push(...fine[0]);
        par.push(y, a, a, b);
      }
      continue;
    }
    let k = 0;
    for (let j = 0; j <= nc; j++) {
      const target = (total * j) / nc;
      while (k < nf - 1 && acc[k + 1] < target) k++;
      const seg = acc[k + 1] - acc[k],
        t = seg > 1e-12 ? clamp((target - acc[k]) / seg, 0, 1) : 0;
      pos.push(
        lerp(fine[k][0], fine[k + 1][0], t),
        lerp(fine[k][1], fine[k + 1][1], t),
        lerp(fine[k][2], fine[k + 1][2], t),
      );
      par.push(y, a + ((b - a) * (k + t)) / nf, a, b);
    }
  }
  for (let i = 0; i < rows.length - 1; i++)
    for (let j = 0; j < nc; j++) {
      const a = i * (nc + 1) + j,
        b = a + 1,
        c = a + nc + 1,
        d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  // analytic normals from the surface itself, so neighbouring panels shade seamlessly
  // (one-sided across U toward the patch interior keeps the crease lines crisp)
  const nrm = new Float32Array(pos.length);
  for (let i = 0; i < pos.length / 3; i++) {
    const [y, U, b] = [par[i * 4], par[i * 4 + 1], par[i * 4 + 3]]; // par = [y, U, lo, hi] per vertex
    const n = surfNormal(y, U, U + 0.003 <= b + 1e-9 ? 1 : -1);
    nrm[i * 3] = n.x;
    nrm[i * 3 + 1] = n.y;
    nrm[i * 3 + 2] = n.z;
  }
  geo.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
  return offsetGeom(geo, off, true);
}
// sideGeo(side, y0, y1, ulo, uhi, opts): the same on one side (side = +1 driver / -1 passenger), with half-section
// u limits (u in -1..3) instead of full-width U
export function sideGeo(side, y0, y1, ulo, uhi, opts) {
  const L = fn(ulo),
    H = fn(uhi);
  return side < 0
    ? patchGeo(
        y0,
        y1,
        (y) => L(y) + 1,
        (y) => H(y) + 1,
        opts,
      )
    : patchGeo(
        y0,
        y1,
        (y) => 7 - H(y),
        (y) => 7 - L(y),
        opts,
      );
}
// flat cap closing the loft at an end station (normalSign: which way it faces along y)
export function capGeo(y, normalSign, off = 0) {
  const pts = [];
  for (let k = 0; k <= 8 * 24; k++) {
    const p = P(y, (k / (8 * 24)) * 8);
    const q = new THREE.Vector2(p[0], p[2]);
    if (!pts.length || q.distanceTo(pts[pts.length - 1]) > 1e-4) pts.push(q);
  }
  if (pts[0].distanceTo(pts[pts.length - 1]) < 1e-4) pts.pop();
  const shape = new THREE.Shape(pts);
  const geo = new THREE.ShapeGeometry(shape, 1);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i), y + normalSign * off, p.getY(i));
  geo.computeVertexNormals();
  const n = geo.attributes.normal;
  for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, normalSign, 0);
  return geo;
}
// surf(y, U, off) -> {p, n, ty, tu}: point on the surface (pushed off along n) and its frame: n outward normal,
// ty tangent along +y, tu tangent along +U
export function surf(y, U, off = 0) {
  const p = V(...P(y, U));
  const a = y + 0.003 <= Y_END ? V(...P(y + 0.003, U)).sub(p) : p.clone().sub(V(...P(y - 0.003, U)));
  let tu = null;
  for (const k of [0.004, 0.02, 0.08, 0.3, 0.7, 1.05]) {
    const q = U + k <= 8 ? V(...P(y, U + k)).sub(p) : p.clone().sub(V(...P(y, U - k)));
    if (q.lengthSq() > 1e-10) {
      tu = q.normalize();
      break;
    }
  }
  if (!tu) tu = V(1, 0, 0);
  const ty = a.normalize();
  const n = tu.clone().cross(ty).normalize();
  return { p: p.clone().add(n.clone().multiplyScalar(off)), n, ty, tu };
}

// ------------------------------------------------------------------ rear-view projector
// Rear details (tail lamps, badges, reflectors) are drawn in the rear view, as (x, z) outlines; these helpers project
// such outlines onto the body as seen straight from behind.
// max |x| of the half-section at height z (for projecting front/rear-view outlines onto the body)
const secMaxX = (y, z) => {
  const s0 = st(y);
  let best = -1,
    prev = half(s0, -1);
  for (let k = 1; k <= 64; k++) {
    const q = half(s0, -1 + (4 * k) / 64);
    if ((z - prev[1]) * (z - q[1]) <= 0 && Math.abs(q[1] - prev[1]) > 1e-9)
      best = Math.max(best, prev[0] + ((q[0] - prev[0]) * (z - prev[1])) / (q[1] - prev[1]));
    prev = q;
  }
  return best;
};
// rearHit(x, z): the body point seen straight from behind at (x, z) (bisection on y for where the section reaches |x|)
export const rearHit = (x, z) => {
  const ax = Math.abs(x),
    sg = x < 0 ? -1 : 1;
  let a = Y_REAR,
    b = -1.8;
  for (let k = 0; k < 24; k++) {
    const m = (a + b) / 2;
    if (secMaxX(m, z) >= ax) b = m;
    else a = m;
  }
  return V(sg * ax, b, z);
};
// rearN(x, z): outward (rearward) normal there
export const rearN = (x, z) => {
  const d = 0.004,
    A = rearHit(x + d, z).sub(rearHit(x - d, z)),
    B = rearHit(x, z + d).sub(rearHit(x, z - d));
  const n = A.cross(B).normalize();
  return n.y > 0 ? n.negate() : n;
};
// rearGeo(z0, z1, lo, hi, off): grid over heights z0..z1 with x limits lo(z)..hi(z) in the rear view, on the body
export const rearGeo = (z0, z1, lo, hi, off, nz = 12, nx = 30) => {
  const pos = [],
    nrm = [],
    idx = [];
  for (let j = 0; j <= nz; j++) {
    const z = z0 + ((z1 - z0) * j) / nz;
    for (let i = 0; i <= nx; i++) {
      const x = lo(z) + ((hi(z) - lo(z)) * i) / nx,
        n = rearN(x, z),
        q = rearHit(x, z).add(n.clone().multiplyScalar(off));
      pos.push(q.x, q.y, q.z);
      nrm.push(n.x, n.y, n.z);
    }
  }
  for (let j = 0; j < nz; j++)
    for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i,
        b = a + 1,
        c = a + nx + 1,
        d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  geo.setIndex(idx);
  return geo;
};

// rearRibbon(path, w, off): a strip w wide along a rear-view (x, z) path, on the body
export const rearRibbon = (path, w, off) => {
  const pos = [],
    nrm = [],
    idx = [];
  for (let i = 0; i < path.length; i++) {
    const a = path[Math.max(0, i - 1)],
      b = path[Math.min(path.length - 1, i + 1)];
    let tx = b[0] - a[0],
      tz = b[1] - a[1];
    const L = Math.hypot(tx, tz) || 1;
    tx /= L;
    tz /= L;
    for (const k of [-0.5, 0.5]) {
      const x = path[i][0] - tz * w * k,
        z = path[i][1] + tx * w * k,
        n = rearN(x, z),
        q = rearHit(x, z).add(n.clone().multiplyScalar(off));
      pos.push(q.x, q.y, q.z);
      nrm.push(n.x, n.y, n.z);
    }
  }
  for (let i = 0; i < path.length - 1; i++) {
    const a = i * 2;
    idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  geo.setIndex(idx);
  return geo;
};
