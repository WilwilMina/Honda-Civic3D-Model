// Geometry helpers for the front details: grids built from rows of [point, normal] samples, the front-view projector
// (a point on the fascia seen straight from ahead at (x, z)), and the outlines of the headlight and grille openings
// in the fascia. All take F, the fascia surface from fascia-surface.js.
import * as THREE from "three";
import { T_LB, clamp, lampPhi, lerp, mono } from "../body/profile.js";
import { half, st, uz } from "../body/section.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// geometry from rows of [point, normal] samples (same count per row), optionally mirrored onto the other half
export function gridGeo(rows, { off = 0, mirror = true, flip = false } = {}) {
  const pos = [],
    nrm = [],
    idx = [];
  const nr = rows.length,
    nc = rows[0].length;
  const sides = mirror ? [1, -1] : [1];
  for (const sx of sides) {
    const base = pos.length / 3;
    for (const r of rows)
      for (const [p, n] of r) {
        pos.push(sx * (p[0] + n[0] * off), p[1] + n[1] * off, p[2] + n[2] * off);
        nrm.push(sx * n[0], n[1], n[2]);
      }
    for (let j = 0; j < nr - 1; j++)
      for (let i = 0; i < nc - 1; i++) {
        const a = base + j * nc + i,
          b = a + 1,
          c = a + nc,
          d = c + 1;
        if (sx > 0 !== flip) idx.push(a, b, c, b, d, c);
        else idx.push(a, c, b, b, c, d);
      }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  geo.setIndex(idx);
  return geo;
}
// resample a polyline of [p, n] samples to k+1 points equally spaced along its length
export function resample(samples, k) {
  const acc = [0];
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1][0],
      b = samples[i][0];
    acc.push(acc[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
  }
  const total = acc[acc.length - 1],
    out = [];
  let i = 0;
  for (let j = 0; j <= k; j++) {
    const s = (total * j) / k;
    while (i < samples.length - 2 && acc[i + 1] < s) i++;
    const seg = acc[i + 1] - acc[i],
      f = seg > 1e-12 ? clamp((s - acc[i]) / seg, 0, 1) : 0;
    const [pa, na] = samples[i],
      [pb, nb] = samples[i + 1];
    const p = [0, 1, 2].map((q) => lerp(pa[q], pb[q], f)),
      n = [0, 1, 2].map((q) => lerp(na[q], nb[q], f));
    const l = Math.hypot(...n) || 1;
    out.push([p, n.map((v) => v / l)]);
  }
  return out;
}
// heights z0..z1 in equal steps of at most step
export const zList = (z0, z1, step) => {
  const n = Math.max(1, Math.ceil((z1 - z0) / step)),
    out = [];
  for (let i = 0; i <= n; i++) out.push(lerp(z0, z1, i / n));
  return out;
};
// loft side point / normal at station y, height z (x >= 0 half)
export const loftPt = (y, z) => [half(st(y), uz(y, z))[0], y, z];
export const loftN = (y, z) => {
  const h = 0.002,
    a = loftPt(y + h, z),
    b = loftPt(y - h, z),
    c = loftPt(y, Math.min(z + h, st(y).zt)),
    d = loftPt(y, z - h);
  const dy = [(a[0] - b[0]) / (2 * h), 1, 0],
    dz = [(c[0] - d[0]) / (c[2] - d[2]), 0, 1];
  const n = [dy[1] * dz[2] - dy[2] * dz[1], dy[2] * dz[0] - dy[0] * dz[2], dy[0] * dz[1] - dy[1] * dz[0]],
    l = Math.hypot(...n);
  return n.map((v) => v / l);
};

// frontProjector(F): builders on the fascia surface F.
//   ffGeo(z0, z1, lo, hi, {step, k, off}): fascia patch over rows z0..z1, each from t = lo(z) to hi(z), mirrored
//   frontHit(x, z) / frontN(x, z): fascia point / normal seen straight from ahead at (x, z) (Vector3, either half)
//   frontGeo(z0, z1, lo, hi, off): grid over front-view x limits lo(z)..hi(z)
//   frontRibbon(path, w, off): strip w(i) wide along a front-view (x, z) path
export function frontProjector(F) {
  // one row of [point, normal] samples from t0 to t1, resampled evenly by length
  const ffRow = (z, t0, t1, k, m = 48) => {
    const s = [];
    for (let i = 0; i <= m; i++) {
      const t = lerp(t0, t1, i / m);
      s.push([F.pt(t, z), F.normal(t, z)]);
    }
    return resample(s, k);
  };
  const ffGeo = (z0, z1, lo, hi, { step = 0.004, k = 60, off = 0 } = {}) =>
    gridGeo(
      zList(z0, z1, step).map((z) => ffRow(z, lo(z), hi(z), k)),
      { off },
    );
  // front-view projector: body point seen straight from ahead at (x, z), and its normal
  const frontT = (x, z) => F.tAtX(Math.abs(x), z);
  const frontHit = (x, z) => {
    const p = F.pt(frontT(x, z), z);
    return V(x < 0 ? -p[0] : p[0], p[1], p[2]);
  };
  const frontN = (x, z) => {
    const n = F.normal(frontT(x, z), z);
    return V(x < 0 ? -n[0] : n[0], n[1], n[2]);
  };
  // grid over z0..z1 with x limits lo(z)..hi(z) (front view), offset along the normal
  const frontGeo = (z0, z1, lo, hi, off, nz = 12, nx = 40) => {
    const rows = [];
    for (let j = 0; j <= nz; j++) {
      const z = z0 + ((z1 - z0) * j) / nz,
        r = [];
      for (let i = 0; i <= nx; i++) {
        const x = lo(z) + ((hi(z) - lo(z)) * i) / nx,
          p = frontHit(x, z),
          n = frontN(x, z);
        r.push([
          [p.x, p.y, p.z],
          [n.x, n.y, n.z],
        ]);
      }
      rows.push(r);
    }
    return gridGeo(rows, { off, mirror: false, flip: true });
  };
  // flat ribbon along a front-view (x, z) path: width w(i) measured along the path's in-plane normal
  const frontRibbon = (path, w, off, side = 1) => {
    const r0 = [],
      r1 = [];
    for (let i = 0; i < path.length; i++) {
      const a = path[Math.max(0, i - 1)],
        b = path[Math.min(path.length - 1, i + 1)];
      let tx = b[0] - a[0],
        tz = b[1] - a[1];
      const L = Math.hypot(tx, tz) || 1;
      tx /= L;
      tz /= L;
      const nx = -tz * side,
        nz = tx * side,
        wi = w(i, path.length);
      for (const [k, r] of [
        [0, r0],
        [1, r1],
      ]) {
        const x = path[i][0] + nx * wi * k,
          z = path[i][1] + nz * wi * k,
          p = frontHit(x, z),
          n = frontN(x, z);
        r.push([
          [p.x, p.y, p.z],
          [n.x, n.y, n.z],
        ]);
      }
    }
    return gridGeo([r0, r1], { off, mirror: false, flip: side > 0 });
  };
  return { ffGeo, frontHit, frontN, frontGeo, frontRibbon };
}

// frontOutlines(F): the openings in the fascia.
//   lampT(z) -> [t0, t1] | null: the headlight's span on fascia row z
//   xGo(z) / tGo(z): grille opening half-width (front view) / its t on row z; zG0: bottom of the opening
//   zL0: lowest point of the lamp; zLS: height where the lamp bottom reaches the seam with the loft
export function frontOutlines(F) {
  const { zT, zC, zE0 } = F;
  // headlight: bottom edge T_LB over the plan angle (shared with the loft part); inner end against the grille
  // (T_XIN: front-view |x| of the inner end over z); top: the row ends (E) above the inner lamp tip
  const T_XIN = mono([
    [0.598, 0.42],
    [0.62, 0.424],
    [0.66, 0.432],
    [0.7, 0.441],
    [zE0, 0.447],
  ]);
  const lbG = (t, z) => {
    const p = F.pt(t, z);
    return T_LB(lampPhi(p[0], p[1])) - z;
  }; // > 0: below the lamp
  function lampT(z) {
    // FF t-interval of the lamp in row z, or null
    if (z > zT) return null;
    let t0 = 0;
    if (lbG(0, z) > 0) {
      if (lbG(1, z) > 0) return null;
      let a = 0,
        b = 1;
      for (let k = 0; k < 36; k++) {
        const m = (a + b) / 2;
        if (lbG(m, z) > 0) a = m;
        else b = m;
      }
      t0 = (a + b) / 2;
    }
    const t1 = z > zE0 ? 1 : F.tAtX(T_XIN(z), z);
    return t1 > t0 + 1e-4 ? [t0, t1] : null;
  }
  // grille opening (inside the chrome smile's outer edge) in the front view: T_GO gives the height of its edge over |x|
  // (flat-ish bottom rising into the sides up to the grille top zC); xGo inverts it
  const T_GO = mono([
    [0.0, 0.572],
    [0.14, 0.577],
    [0.227, 0.587],
    [0.3, 0.604],
    [0.35, 0.623],
    [0.4, 0.653],
    [0.423, 0.679],
    [0.438, 0.712],
    [0.441, zC],
  ]);
  const zG0 = T_GO(0);
  const xGo = (z) => {
    if (z <= zG0) return 0;
    let a = 0,
      b = 0.441;
    for (let k = 0; k < 36; k++) {
      const m = (a + b) / 2;
      if (T_GO(m) < z) a = m;
      else b = m;
    }
    return (a + b) / 2;
  };
  const tGo = (z) => (z <= zG0 ? 1 : F.tAtX(xGo(z), z));
  // lowest point of the lamp (inner bottom corner)
  let zL0 = 0.58;
  {
    let a = 0.56,
      b = 0.66;
    for (let k = 0; k < 30; k++) {
      const m = (a + b) / 2;
      if (lampT(m)) b = m;
      else a = m;
    }
    zL0 = b;
  }
  // height where the lamp bottom reaches the seam (above it the fascia row is lamp from t = 0)
  let zLS = 0.69;
  {
    let a = 0.6,
      b = zT;
    for (let k = 0; k < 30; k++) {
      const m = (a + b) / 2;
      if (lbG(0, m) > 0) a = m;
      else b = m;
    }
    zLS = b;
  }
  return { lampT, xGo, tGo, zG0, zL0, zLS };
}
