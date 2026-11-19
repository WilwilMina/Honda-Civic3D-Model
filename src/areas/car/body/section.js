// Cross-sections of the body surface. st(y) gathers the profile numbers for station y, half(s, u) gives the point of
// that section at parameter u, and P(y, U) is the full 3D surface point. Every body panel, lamp and trim piece is a
// patch of this one surface (see surface.js), so neighbouring parts always line up.

// Section parameter u (one half, x >= 0), running round the section from the bottom centre to the roof centre:
//   -1..0  bottom return (flat underside, under the bumpers and rockers), from the centre line out to the rocker
//    0..1  body side: rocker -> lower crease (0.2) -> widest point (0.4) -> shoulder line (0.75) -> belt (1)
//    1..2  greenhouse side (side glass / pillars); collapses to a thin strip where there is no greenhouse
//    2..3  top surface (hood / roof / deck lid), ending at the centre line
// Full-width parameter U in 0..8 goes all the way round: right half U = u + 1 (x < 0), left/driver half U = 7 - u
// (x > 0). So U = 0 and 8 are the bottom centre, U = 1 / 7 the rockers, U = 4 the top centre line.
import {
  ARCHES,
  GH0,
  GH1,
  TUMBLE,
  T_BELT,
  T_CR,
  T_DR,
  T_TB,
  T_TOP,
  T_UP,
  T_UPF,
  T_W,
  T_XEF,
  T_ZB,
  T_ZC,
  T_ZCF,
  T_ZM,
  T_ZSH,
  T_ZTF,
  T_ZTR,
  WZ,
  Y_END,
  Y_REAR,
  clamp,
  lerp,
  smooth01,
} from "./profile.js";

// ------------------------------------------------------------------ station numbers
// st(y) -> the numbers that define the cross-section at station y (cached; y is rounded to 1e-6 m):
//   W      maximum half-width          zb   bottom edge of the side (raised to the arch over the wheel openings)
//   Wb     half-width at the bottom    zc   lower character line (crease, u = 0.2)
//   Wsh    half-width at the shoulder  zm   height of maximum width (u = 0.4)
//   Wbelt  half-width at the belt      zsh  shoulder line (u = 0.75)
//   Wr     half-width at the roof rail zt   belt / top edge of the side (u = 1)
//   crown  centre line above the top surface's edge   zr   roof-rail height (top of the greenhouse, u = 2)
//   cp     crown shape exponent (higher = flatter top with rounder corners, the trunk lid)
//   kc, sk, sd, rt, rk, hc, hcx: blend weights for local features (lower crease, crisp shoulder, rear quarter
//   tumblehome, hood creases at x = hcx); see stRaw().
const stCache = new Map();
// The rear quarter's side numbers (shoulder inset, belt, line heights, tuck weights) change fast in y where several
// tables hand over (T_UP -> T_DR, the tuck blend, the lamp facet), which would ripple the quarter / bumper corner.
// st() averages them over a short y window (a Gaussian, fading in behind y -1.76 and out at the tail), so the quarter
// is one smooth surface; the profile numbers (W, zt, crown, zb) are not averaged.
const RS_F = ["Wsh", "Wbelt", "zsh", "zm", "zc", "rk", "sd", "sk"];
const RS_WIDE = 1.7; // the window is 1.7x wider for everything but the shoulder height
const rsH = (y) => 0.036 * smooth01((-1.76 - y) / 0.08) * smooth01((y + 2.288) / 0.03);
export function st(y) {
  const key = Math.round(y * 1e6);
  let s = stCache.get(key);
  if (s) return s;
  const h = rsH(y);
  s = stRaw(y);
  if (h > 1e-4) {
    const acc = {},
      wsum = {};
    for (const f of RS_F) acc[f] = wsum[f] = 0;
    // the shoulder height keeps the short window (it moves <= 10 mm)
    for (const [hh, fs] of [
      [h, ["zsh"]],
      [h * RS_WIDE, RS_F.filter((f) => f !== "zsh")],
    ])
      for (let k = -6; k <= 6; k++) {
        const w = Math.exp(-((k / 3) ** 2)),
          q = stRaw(clamp(y + (hh * k) / 6, Y_REAR, -1.6));
        for (const f of fs) {
          acc[f] += (f === "Wsh" || f === "Wbelt" ? q.W - q[f] : f === "zsh" ? q.zt - q[f] : q[f]) * w;
          wsum[f] += w;
        } // insets, not absolute values: the plan / profile curves stay
      }
    s = { ...s };
    for (const f of RS_F) {
      const a = acc[f] / wsum[f];
      s[f] = f === "Wsh" || f === "Wbelt" ? s.W - a : f === "zsh" ? s.zt - a : a;
    }
    s.Wsh = Math.min(s.Wsh, s.W - 0.006);
    s.Wbelt = Math.min(s.Wbelt, s.Wsh - 0.006);
    s.zsh = Math.min(s.zsh, s.zt - 0.004);
    s.zm = clamp(s.zm, s.zb + 0.03, s.zsh - 0.01);
    s.zc = s.zm - s.zb > 0.03 ? clamp(s.zc, s.zb + 0.012, s.zm - 0.012) : (s.zb + s.zm) / 2;
    s.Wr = s.Wbelt - TUMBLE * (s.zr - s.zt);
  }
  stCache.set(key, s);
  return s;
}
const stRawCache = new Map();
// the station numbers straight from the profile tables, before the rear-quarter averaging
function stRaw(y) {
  const key = Math.round(y * 1e6);
  let s = stRawCache.get(key);
  if (s) return s;
  const W = T_W(y);
  let crown = T_CR(y);
  let zt = y < GH1 && y > GH0 ? T_BELT(y) : T_TOP(y) - crown;
  if (y >= GH1 && y < GH1 + 0.05) {
    zt = lerp(T_BELT(GH1), zt, smooth01((y - GH1) / 0.05));
    crown = T_TOP(y) - zt;
  } // blend the belt into the top silhouette just ahead of the cowl (no step in the fender crest)
  const kf = smooth01((y - 1.85) / 0.05); // nose: edge E and centre line from T_ZTF / T_ZCF
  if (kf > 0) {
    const zc0 = zt + crown;
    zt = lerp(zt, T_ZTF(y), kf);
    crown = lerp(zc0, T_ZCF(y), kf) - zt;
  }
  if (y < -1.98) {
    // rear: the top-surface edge follows its own smooth curve (lid corners round down into the lamps)
    zt = lerp(zt, T_ZTR(y), smooth01((-1.98 - y) / 0.04));
    crown = T_TOP(y) - zt;
  }
  const zb0 = T_ZB(y);
  let zb = zb0;
  // over the wheel openings the bottom edge follows the arch (a circle 4 mm above the wheel centre)
  for (const [yc, R] of ARCHES) {
    const dy = Math.abs(y - yc);
    if (dy < R) zb = Math.max(zb, WZ + 0.004 + Math.sqrt(R * R - dy * dy));
  }
  const zr = Math.max(zt, y > GH0 - 0.02 && y < GH1 + 0.02 ? T_TOP(y) - crown : 0);
  let zsh = Math.min(T_ZSH(y), zt - 0.02);
  let zm = Math.max(Math.min(T_ZM(y), zsh - 0.03), zb + 0.03);
  zsh = Math.max(zsh, Math.min(zt - 0.004, zm + 0.02));
  const zc = zm - zb > 0.03 ? clamp(T_ZC(y), zb + 0.012, zm - 0.012) : (zb + zm) / 2;
  const kc = smooth01((y + 1.2) / 0.2) * smooth01((1.02 - y) / 0.15);
  const tb = T_TB(y);
  // rear quarter tumblehome: above the arch flare the quarter leans in to ~0.81 at tail-light height (the 'hip')
  const rt = smooth01((-1.0 - y) / 0.5);
  let up =
    y < -1.84
      ? lerp(T_UP(y), W - 0.02, smooth01((-2.135 - y) / 0.09))
      : y > 1.85
        ? T_UPF(y)
        : y < -1.0
          ? W - 0.063 * rt
          : 9; // half-width limit at shoulder level (9 = no limit): the lamp body narrows, the bumper below stays full
  // rear: the lamp facet recovers into the bumper corner gradually (no dent under the lamp)
  if (y < -2.09) up = lerp(up, W - T_DR(y), smooth01((-2.09 - y) / 0.03));
  const sk = smooth01((y + 2.0) / 0.15) * smooth01((2.05 - y) / 0.15); // crisp shoulder ridge zone
  const sd = 0.006 * sk; // slight hollow under the shoulder line
  let Wsh = Math.min(W - Math.min(0.02, tb * 0.4) * (1 - 0.9 * sk), up),
    Wbelt = Math.min(W - tb, Wsh - lerp(0.04, 0.012, rt));
  if (kf > 0) {
    Wbelt = lerp(Wbelt, T_XEF(y) + 0.008, kf);
    Wsh = Math.max(Wsh, Wbelt + 0.03);
  } // nose: the belt follows E's plan line
  // no tuck-under inside the wheel arches
  const Wb = W - 0.07 * clamp((0.6 - zb) / 0.35, 0, 1) * (zb > zb0 + 0.01 ? 0.08 : 1);
  const Wr = Wbelt - TUMBLE * (zr - zt);
  // hood creases: inner lamp tips -> cowl, splaying out
  const hc = smooth01((y - 1.22) / 0.08) * smooth01((2.205 - y) / 0.05);
  const hcx = lerp(0.54, 0.447, clamp((y - 1.2) / 0.99, 0, 1));
  // lid: flat top, crisp rounded corners
  const cp = 2 + 3 * smooth01((-1.95 - y) / 0.06) * smooth01((y + 2.135) / 0.012);
  s = {
    y,
    W,
    Wb,
    Wbelt,
    Wsh,
    Wr,
    zb,
    zc,
    zm,
    zsh,
    zt,
    zr,
    crown,
    kc,
    hc,
    hcx,
    cp,
    sk,
    sd,
    rt,
    rk: rt * smooth01((y + 2.06) / 0.1),
  };
  stRawCache.set(key, s);
  return s;
}
// ------------------------------------------------------------------ the cross-section
// half(s, u) -> [x, z]: point of the half-section s = st(y) at parameter u in -1..3 (x >= 0).
// Side pieces: 0-0.2 rocker up to the lower crease, 0.2-0.4 up to the widest point, 0.4-0.75 up to the crisp
// shoulder line, 0.75-1 tucked in to the belt. Each piece is a simple curve between the station's line heights.
export function half(s, u) {
  if (u <= 0) return [s.Wb * (1 + u), s.zb]; // flat underside
  if (u <= 1) {
    const Wc = s.W - 0.033 * s.kc;
    if (u < 0.2) {
      const t = u / 0.2,
        z = s.zb + (s.zc - s.zb) * t,
        x0 = s.Wb + (Wc - s.Wb) * Math.sin((t * Math.PI) / 2);
      if (s.kc <= 0) return [x0, z];
      // lower character line (matched to the side photos): just under the crease the side kicks back out (a ~50
      // mm band facing up
      // that catches the light), then rolls under to the rocker; the crease itself is a sharp kink at u = 0.2
      const tp = clamp(1 - 0.045 / Math.max(0.06, s.zc - s.zb), 0.3, 0.85),
        Xp = s.W - 0.012;
      const x1 =
        t < tp
          ? s.Wb + (Xp - s.Wb) * Math.sin(((t / tp) * Math.PI) / 2)
          : Xp - (Xp - Wc) * ((t - tp) / (1 - tp)) ** 2;
      return [lerp(x0, x1, s.kc), z];
    }
    if (u < 0.4) {
      const t = (u - 0.2) / 0.2;
      return [Wc + (s.W - Wc) * (1 - (1 - t) * (1 - t)), s.zc + (s.zm - s.zc) * t];
    }
    if (u < 0.75) {
      const t = (u - 0.4) / 0.35,
        k = lerp(t * t, t * t * (3 - 2 * t), s.rk); // shape of the bulge between max width and shoulder
      return [
        s.W -
          (s.W - s.Wsh) * k -
          s.sd * lerp(Math.sin(Math.PI * t), Math.sin(Math.PI * t) ** 2, smooth01((s.y - 0.95) / 0.12)),
        s.zm + (s.zsh - s.zm) * t,
      ];
    }
    const t = (u - 0.75) / 0.25;
    let x = s.Wsh - (s.Wsh - s.Wbelt) * Math.pow(t, lerp(1.25, 0.85, s.sk)) - 0.008 * Math.pow(t, 8);
    if (s.y < -1.85) {
      // rear: the tuck above the shoulder starts tangent to the side below it (no concave kink at zsh)
      const xe = s.Wbelt - 0.008,
        m0 = Math.max((-2 * (s.W - s.Wsh) * (s.zt - s.zsh)) / Math.max(1e-4, s.zsh - s.zm), 2 * (xe - s.Wsh));
      x = lerp(x, s.Wsh + m0 * t + (xe - s.Wsh - m0) * t * t, smooth01((-1.85 - s.y) / 0.08));
    }
    return [x, s.zsh + (s.zt - s.zsh) * t];
  }
  // greenhouse: side glass leaning in from the belt (zt) up to the roof rail (zr)
  if (u <= 2) {
    const t = u - 1,
      h = s.zr - s.zt;
    if ((s.y < -1.86 || s.y > GH1) && h < 0.002) {
      const a = half(s, 1),
        b = half(s, 2.0001);
      return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
    } // no greenhouse (rear deck / front fender): a straight, nearly zero-width strip from the side to the top
    return [
      s.Wbelt -
        0.01 +
        (s.Wr - s.Wbelt + 0.01) * t +
        0.02 * h * Math.sin(Math.PI * t) +
        0.01 * (1 - Math.min(1, h * 30)) * t,
      s.zt + h * t,
    ];
  }
  // top surface: from the side edge (x0) to the centre line, rising by the crown
  const t = u - 2;
  const x0 = s.zr - s.zt > 0.002 ? s.Wr : s.Wbelt - 0.01;
  const x = x0 * (1 - t);
  // front fender crest: no rolled-down edge
  const fr = s.y > GH1 ? smooth01((s.y - GH1) / 0.03) * (1 - smooth01((s.y - 1.74) / 0.1)) : 0;
  // crown curve toward the centre line, minus a ~6 mm rolled-down lip right at the edge
  let z = s.zr + s.crown * (1 - Math.pow(1 - t, s.cp)) - 0.006 * (1 - fr) * Math.pow(1 - t, 12);
  if (s.hc > 0) {
    z += s.hc * 0.012 * smooth01((s.hcx - x) / 0.04 + 0.5); // raised centre panel between the hood creases (crisp edge)
    // outboard of the crease the hood falls to its edge
    const tc = Math.max(0.12, 1 - (s.hcx - 0.02) / Math.max(0.05, x0));
    // ahead of the hood (one-piece nose strip) the step is a soft ramp
    const wr = Math.max(1e-4, 0.03 * smooth01((s.y - 2.1) / 0.03));
    if (t > 0.035)
      z -=
        s.hc *
        0.009 *
        clamp(1 - (t - 0.035) / (tc - 0.035), 0, 1) *
        smooth01((t - 0.035) / wr) *
        (1 - smooth01((s.y - 1.8) / 0.12)); // hood edge below the fender crowns; flush with the lamp top at the nose
  }
  if (s.y < -1.86 && s.zr - s.zt < 0.002) {
    // rear corners: one smooth surface across the side / top ridge
    const wR = smooth01((-1.86 - s.y) / 0.05);
    if (wR > 0) {
      z += 0.006 * wR * Math.pow(1 - t, 12); // cancel the rolled-down edge here (it would read as a groove)
      if (t < RTF) {
        // tangent-continuous fillet from the side's top edge (u = 1) into the top surface
        const p1 = half(s, 1),
          p0 = half(s, 0.995),
          p2 = half(s, 2 + RTF),
          p3 = half(s, 2 + RTF + 0.004);
        const a = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1,
          b = Math.hypot(p3[0] - p2[0], p3[1] - p2[1]) || 1,
          L = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
        const k = t / RTF,
          h00 = 2 * k ** 3 - 3 * k * k + 1,
          h10 = k ** 3 - 2 * k * k + k,
          h01 = -2 * k ** 3 + 3 * k * k,
          h11 = k ** 3 - k * k;
        const hx =
          h00 * p1[0] + (h10 * L * (p1[0] - p0[0])) / a + h01 * p2[0] + (h11 * L * (p3[0] - p2[0])) / b;
        const hz =
          h00 * p1[1] + (h10 * L * (p1[1] - p0[1])) / a + h01 * p2[1] + (h11 * L * (p3[1] - p2[1])) / b;
        return [lerp(x, hx, wR), lerp(z, hz, wR)];
      }
    }
  }
  return [x, z];
}
const RTF = 0.06; // width (in t) of that rear fillet
// P(y, U) -> [x, y, z]: the full-width surface point (U in 0..8, see the header)
export function P(y, U) {
  const s = st(y);
  if (U < 4) {
    const [x, z] = half(s, U - 1);
    return [-x, y, z];
  }
  const [x, z] = half(s, 7 - U);
  return [x, y, z];
}
// uz(y, z): the side parameter u (0..1) at height z on station y (inverse of half() on the body side)
export function uz(y, z) {
  const s = st(y),
    d = (a) => Math.max(1e-6, a);
  if (z <= s.zb) return 0;
  if (z < s.zc) return (0.2 * (z - s.zb)) / d(s.zc - s.zb);
  if (z < s.zm) return 0.2 + (0.2 * (z - s.zc)) / d(s.zm - s.zc);
  if (z < s.zsh) return 0.4 + (0.35 * (z - s.zm)) / d(s.zsh - s.zm);
  if (z < s.zt) return 0.75 + (0.25 * (z - s.zsh)) / d(s.zt - s.zsh);
  return 1;
}
// crisp lines: side patches are split at the lower crease (u 0.2) and the shoulder line (u 0.75), in full-width U
export const CREASES = [1.2, 1.75, 6.25, 6.8];

// STATIONS: the y rows every patch is built on (shared, so neighbouring patches match exactly): every 22 mm, denser at
// the nose, the tail, the trunk face and around the wheel-arch edges
export const STATIONS = (() => {
  const set = new Set();
  const add = (y) => {
    if (y >= Y_REAR - 1e-9 && y <= Y_END + 1e-9) set.add(Math.round(y * 1e5) / 1e5);
  };
  for (let y = Y_REAR; y <= Y_END; y += 0.022) add(y);
  for (let y = Y_END - 0.16; y <= Y_END; y += 0.005) add(y);
  for (let k = 1; k < 8; k++) add(Y_END - 0.0008 * k);
  for (let y = Y_REAR; y <= Y_REAR + 0.22; y += 0.005) add(y);
  for (let y = -2.12; y <= -1.85; y += 0.01) add(y);
  for (const [yc, R] of ARCHES)
    for (const sg of [-1, 1]) {
      for (let d = R - 0.08; d < R; d += 0.008) add(yc + sg * d);
      add(yc + sg * (R - 0.003));
      add(yc + sg * (R - 0.0008));
      add(yc + sg * (R + 0.0008));
    }
  for (let y = -2.21; y <= -2.12; y += 0.003) add(y); // trunk face
  add(Y_END);
  add(Y_REAR);
  return [...set].sort((a, b) => a - b);
})();
export const DENS = 26; // default patch columns per unit of U
