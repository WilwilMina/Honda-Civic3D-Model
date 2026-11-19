// Helpers for the rear details: small canvas-free textures (DataTexture) and rear-view UV mapping for the tail lamp
// lenses, a fold-free version of the body surface for lenses that cross the collapsed greenhouse strip, a lamp
// builder (lens + recessed back + walls) on that surface, and shared rear-view measurements.
import * as THREE from "three";
import { clamp, lerp } from "../body/profile.js";
import { P, half, st } from "../body/section.js";
import { stationsIn } from "../body/surface.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// shared rear-view measurements (matched to the straight-on rear photo)
export const ZBAR = 0.91, // height of the lid's chrome bar
  XTIP = 0.386; // |x| of the inner lens tips (the plate recess's top corners)
export const RECESS_DEPTH = 0.017; // plate recess depth

const rgb = (h) => [(h >> 16) & 255, (h >> 8) & 255, h & 255];
// tail lamp lens colours (RGB 0..255): dark rim, black border, clear ribbed strip (two shades), amber, separator,
// dark / mid / light red
export const COL = {
  rim: rgb(0x180606),
  black: rgb(0x121314),
  clear: rgb(0xdcdcd8),
  clear2: rgb(0xbdbdb9),
  amber: rgb(0xe2952e),
  sep: rgb(0x3a0909),
  redD: rgb(0x6e0a10),
  red: rgb(0xb3151b),
  redL: rgb(0xd42822),
};
// a W x H sRGB texture whose texel colour is fn(u, v) with u, v in 0..1
export const dataTex = (W, H, fn) => {
  const d = new Uint8Array(W * H * 4);
  for (let j = 0; j < H; j++)
    for (let i = 0; i < W; i++) {
      const c = fn((i + 0.5) / W, (j + 0.5) / H),
        k = (j * W + i) * 4;
      d[k] = c[0];
      d[k + 1] = c[1];
      d[k + 2] = c[2];
      d[k + 3] = 255;
    }
  const t = new THREE.DataTexture(d, W, H, THREE.RGBAFormat);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
};
// a plain material showing a texture (the lamp lenses)
export const texMat = (mat, key, tex) => {
  const m = mat(0xffffff, "plastic", key);
  m.map = tex;
  m.roughness = 0.16;
  m.metalness = 0.05;
  m.needsUpdate = true;
  return m;
};
// set a geometry's UVs from its vertex positions: f(x, y, z) -> [u, v]
export const setUV = (geo, f) => {
  const p = geo.attributes.position,
    uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const q = f(p.getX(i), p.getY(i), p.getZ(i));
    uv[i * 2] = q[0];
    uv[i * 2 + 1] = q[1];
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
};
// the clear lens's vertical ribs: alternating shades every w metres of |x|
export const ribs = (ax, w = 0.0065) => (Math.floor(ax / w) % 2 ? COL.clear : COL.clear2);
// surface point without the fold of the collapsed greenhouse strip (u 1..2 is ~18 mm wide and turned back on itself
// where there is no greenhouse); the outer lamp lens crosses that strip on its way from the side onto the face
const Pf = (y, u) => {
  const s0 = st(y);
  if (u > 1 && u < 2 && s0.zr - s0.zt < 0.002) {
    const a = half(s0, 1),
      b = half(s0, 2.0001),
      t = u - 1;
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  }
  return half(s0, u);
};
// foldGeo(side, y0, y1, lo, hi, off): a side patch (half u limits lo(y)..hi(y)) on that fold-free surface, with
// computed normals facing outward; geo.userData.rows is its row count (for lampF's walls)
export const foldGeo = (side, y0, y1, lo, hi, off = 0, dens = 40) => {
  const rows = stationsIn(y0, y1);
  let nc = 2;
  for (const y of rows) nc = Math.max(nc, Math.ceil(Math.abs(hi(y) - lo(y)) * dens));
  const pos = [],
    idx = [];
  for (const y of rows) {
    const a = lo(y),
      b = Math.max(a, hi(y)),
      nf = 64,
      fine = [],
      acc = [0];
    for (let k = 0; k <= nf; k++) {
      const q = Pf(y, a + ((b - a) * k) / nf);
      fine.push([side * q[0], y, q[1]]);
    }
    for (let k = 1; k <= nf; k++)
      acc.push(acc[k - 1] + Math.hypot(fine[k][0] - fine[k - 1][0], fine[k][2] - fine[k - 1][2]));
    let k = 0;
    for (let j = 0; j <= nc; j++) {
      const tg = (acc[nf] * j) / nc;
      while (k < nf - 1 && acc[k + 1] < tg) k++;
      const sg = acc[k + 1] - acc[k],
        t = sg > 1e-12 ? clamp((tg - acc[k]) / sg, 0, 1) : 0;
      pos.push(lerp(fine[k][0], fine[k + 1][0], t), y, lerp(fine[k][2], fine[k + 1][2], t));
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
  geo.computeVertexNormals();
  const n = geo.attributes.normal,
    p = geo.attributes.position;
  let dot = 0;
  for (let i = 0; i < n.count; i++) dot += n.getX(i) * side - n.getY(i) * 0.3;
  if (dot < 0) {
    const ix = geo.index.array;
    for (let i = 0; i < ix.length; i += 3) {
      const t = ix[i + 1];
      ix[i + 1] = ix[i + 2];
      ix[i + 2] = t;
    }
    geo.computeVertexNormals();
  }
  if (off)
    for (let i = 0; i < p.count; i++)
      p.setXYZ(i, p.getX(i) + n.getX(i) * off, p.getY(i) + n.getY(i) * off, p.getZ(i) + n.getZ(i) * off);
  geo.userData.rows = rows.length;
  return geo;
};
// lampF(B, side, y0, y1, lo, hi, opts): a lamp on the fold-free surface: the lens, a back made by shrinking the lens
// toward a point 0.14 m behind it (so it never folds like a plain offset would) and walls joining their outlines
// round the edge. opts: depth (recess depth), back / wall / lens materials, parent, name
export const lampF = (
  B,
  side,
  y0,
  y1,
  lo,
  hi,
  { depth = 0.014, back = B.M.redBack, wall = back, lens, parent = B.g, name = "lamp" },
) => {
  const { mesh, dbl } = B;
  const grp = new THREE.Group();
  grp.name = name;
  parent.add(grp);
  const lensGeo = foldGeo(side, y0, y1, lo, hi, 0.002);
  mesh(lensGeo, lens, grp, name + "-lens").castShadow = false;
  const p = lensGeo.attributes.position,
    nn = lensGeo.attributes.normal,
    c = V(0, 0, 0),
    nm = V(0, 0, 0);
  for (let i = 0; i < p.count; i++) {
    c.x += p.getX(i);
    c.y += p.getY(i);
    c.z += p.getZ(i);
    nm.x += nn.getX(i);
    nm.y += nn.getY(i);
    nm.z += nn.getZ(i);
  }
  c.divideScalar(p.count);
  nm.normalize();
  const Cc = c.clone().sub(nm.clone().multiplyScalar(0.14)),
    k = clamp(depth / 0.14, 0, 0.9);
  const backGeo = lensGeo.clone(),
    bp = backGeo.attributes.position;
  for (let i = 0; i < bp.count; i++) {
    const q = V(bp.getX(i), bp.getY(i), bp.getZ(i)).lerp(Cc, k);
    bp.setXYZ(i, q.x, q.y, q.z);
  }
  backGeo.deleteAttribute("uv");
  backGeo.computeVertexNormals();
  mesh(backGeo, back, grp, name + "-back");
  const rows = lensGeo.userData.rows,
    cols = p.count / rows,
    ring = [];
  for (let j = 0; j < cols; j++) ring.push(j);
  for (let i = 1; i < rows; i++) ring.push(i * cols + cols - 1);
  for (let j = cols - 2; j >= 0; j--) ring.push((rows - 1) * cols + j);
  for (let i = rows - 2; i >= 0; i--) ring.push(i * cols);
  const pos = [],
    idx = [];
  for (const i of ring) pos.push(p.getX(i), p.getY(i), p.getZ(i), bp.getX(i), bp.getY(i), bp.getZ(i));
  for (let i = 0; i < ring.length - 1; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const wg = new THREE.BufferGeometry();
  wg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  wg.setIndex(idx);
  wg.computeVertexNormals();
  mesh(wg, dbl(wall), grp, name + "-wall");
  grp.userData.lensGeo = lensGeo;
  return grp;
};
// where on the lid face the centre line reaches a height
export const yFace = (z) => {
  let a = -2.29,
    b = -2.115;
  for (let k = 0; k < 40; k++) {
    const m = (a + b) / 2;
    if (P(m, 4)[2] > z) b = m;
    else a = m;
  }
  return (a + b) / 2;
};
// rear-view x limits lo(z)..hi(z) given for the driver half -> the same limits on side s
export const sideFn = (s, lo, hi) => (s > 0 ? [lo, hi] : [(z) => -hi(z), (z) => -lo(z)]);
