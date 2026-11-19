// The front fascia surface: the bumper face, the nose corners and the front part of the headlight band, ahead of
// station Y_S where the lofted body (body/section.js) ends its sides. makeFF() returns the surface as functions;
// front.js and the other front/ modules cut the fascia panels, the lamp and grille openings from it.
import { Y_END, Y_S, clamp, lerp, mono, smooth01 } from "../body/profile.js";
import { half, st, uz } from "../body/section.js";

// Ahead of Y_S the body sides and the nose are ONE surface made of rows of constant height z. Each row is a cubic
// Bezier in plan running from the loft's own point at Y_S, leaving along the loft's own tangent (so there is no kink
// where the two meet), to the centre line, crossing it square (so the two halves meet smoothly). Rows above the grille
// top end on the top edge E of the hood strip instead (front-view line from the grille top to the inner lamp tip,
// then the lamp top / hood shut line back to Y_S). Coordinates: x >= 0 half; the other half is mirrored.
// A point on the fascia is addressed by (t, z): z the row height, t along the row from 0 (seam with the loft) to 1
// (centre line, or the row's end on E). Plan-view angles are measured about the point (0, PY = 1.6).
const sideX = (y, z) => half(st(y), uz(y, z))[0];
// makeFF() -> {pt(t, z) -> [x, y, z], normal(t, z) -> [nx, ny, nz], tAtX(x, z) -> t, zB, zT, zC, zE0}
// zB / zT: bottom and top heights of the rows at the seam; zC: centre-line height of the nose's top edge (the grille
// top); zE0: height of E at the inner lamp tip.
export function makeFF() {
  // centre-line profile (side view of the nose): most forward around the bumper crease, tucked under at the lip,
  // leaning back up the grille into the hood front edge (continued above it for the base rows only)
  const YC = mono([
    [0.19, 2.2],
    [0.24, 2.238],
    [0.3, 2.258],
    [0.36, 2.265],
    [0.42, 2.263],
    [0.48, 2.255],
    [0.53, 2.244],
    [0.58, 2.23],
    [0.63, 2.215],
    [0.675, 2.201],
    [0.7, 2.194],
    [0.715, 2.19],
    [0.75, 2.165],
    [0.8, 2.12],
  ]);
  // Bezier handle lengths (fraction of the chord): seam end / centre end. Matched to the plan-view outline.
  const KA = 0.3,
    KB = 0.45;
  const sE = st(Y_END),
    zC = sE.zt + sE.crown,
    zE0 = sE.zt,
    xE0 = sE.Wbelt - 0.008;
  const zB = st(Y_S).zb,
    zT = st(Y_S).zt - 1e-4;
  const PY = 1.6, // plan angles are measured about (0, PY)
    phiOf = (p) => Math.atan2(p[1] - PY, p[0]);
  // base rows: seam (loft point + tangent) -> centre line, crossing it square; P0..P3 are the Bezier control points
  const cache = new Map();
  function row(z) {
    z = clamp(z, zB, zT);
    const key = Math.round(z * 1e6);
    let r = cache.get(key);
    if (r) return r;
    const xs = sideX(Y_S, z),
      h = 0.002,
      d = (sideX(Y_S + h, z) - sideX(Y_S - h, z)) / (2 * h);
    const L = Math.hypot(d, 1),
      T0 = [d / L, 1 / L],
      Q = [0, YC(z)];
    const ch = Math.hypot(Q[0] - xs, Q[1] - Y_S),
      a = KA * ch,
      b = KB * ch;
    r = { z, P0: [xs, Y_S], P1: [xs + a * T0[0], Y_S + a * T0[1]], P2: [Q[0] + b, Q[1]], P3: Q, tEnd: 1 };
    cache.set(key, r);
    return r;
  }
  // point of a row's cubic Bezier at t
  function bez(r, t) {
    const u = 1 - t,
      A = u * u * u,
      Bq = 3 * u * u * t,
      Cq = 3 * u * t * t,
      D = t * t * t;
    return [
      A * r.P0[0] + Bq * r.P1[0] + Cq * r.P2[0] + D * r.P3[0],
      A * r.P0[1] + Bq * r.P1[1] + Cq * r.P2[1] + D * r.P3[1],
    ];
  }
  // above zA the row shape is frozen at the zA row (only its seam end keeps following the loft section)
  const zA = 0.6;
  function base(t, z) {
    const p = bez(row(z), t);
    if (z <= zA) return p;
    const q = bez(row(zA), t),
      w = smooth01(t / 0.3);
    return [lerp(p[0], q[0], w), lerp(p[1], q[1], w)];
  }
  // t of the base row at height z where it reaches plan angle ph (bisection)
  const baseTAtPhi = (ph, z) => {
    let a = 0,
      b = 1;
    for (let k = 0; k < 34; k++) {
      const m = (a + b) / 2;
      if (phiOf(base(m, z)) < ph) a = m;
      else b = m;
    }
    return (a + b) / 2;
  };
  // top edge E as a function of the plan angle: the lamp top / hood shut line (loft u = 1 line, Y_S..Y_END), then
  // the hood strip's front edge (straight in front view from the inner lamp tip to the grille top at the centre)
  const EP = [];
  for (let i = 0; i <= 90; i++) {
    const y = lerp(Y_S, Y_END, i / 90),
      s0 = st(y);
    EP.push([s0.Wbelt - 0.008, y, s0.zt]);
  }
  for (let i = 1; i <= 40; i++) {
    const x = xE0 * (1 - i / 40);
    EP.push([Math.max(x, 1e-4), Y_END, zC + (zE0 - zC) * (x / xE0)]);
  }
  const EPH = EP.map((p) => phiOf(p)),
    ER = EP.map((p) => Math.hypot(p[0], p[1] - PY)),
    EZ = EP.map((p) => p[2]);
  const eAt = (ph) => {
    // {r, z} of E at plan angle ph
    if (ph <= EPH[0]) return { r: ER[0], z: EZ[0] };
    for (let i = 1; i < EPH.length; i++)
      if (ph <= EPH[i]) {
        const f = (ph - EPH[i - 1]) / (EPH[i] - EPH[i - 1]);
        return { r: lerp(ER[i - 1], ER[i], f), z: lerp(EZ[i - 1], EZ[i], f) };
      }
    return { r: ER[ER.length - 1], z: EZ[EZ.length - 1] };
  };
  const phiAtEz = (z) => {
    // plan angle where E is at height z (E falls toward the front)
    for (let i = 1; i < EZ.length; i++)
      if (EZ[i] <= z) {
        const f = (EZ[i - 1] - z) / Math.max(1e-9, EZ[i - 1] - EZ[i]);
        return lerp(EPH[i - 1], EPH[i], f);
      }
    return EPH[EPH.length - 1];
  };
  // upper band (lamps): above zA each column (fixed plan angle) is pulled from the base surface onto E, reaching it
  // exactly at E's own height; rows above the grille top stop where they meet E
  // rbTab: base-surface radius at E's height, tabulated per plan angle
  const NPH = 160,
    ph0 = EPH[0] - 0.08,
    ph1 = Math.PI / 2;
  const rbTab = [];
  for (let i = 0; i <= NPH; i++) {
    const ph = lerp(ph0, ph1, i / NPH),
      e = eAt(ph),
      zz = clamp(e.z, zB, zT),
      q = base(baseTAtPhi(ph, zz), zz);
    rbTab.push(Math.hypot(q[0], q[1] - PY));
  }
  const rbAt = (ph) => {
    const f = clamp((ph - ph0) / (ph1 - ph0), 0, 1) * NPH,
      i = Math.min(NPH - 1, Math.floor(f));
    return lerp(rbTab[i], rbTab[i + 1], f - i);
  };
  // where row z ends: 1 (the centre line) below the grille top, else the t where it meets E
  const tEndOf = (z) => {
    const r = row(z);
    if (r.tEndZ === undefined) {
      r.tEndZ = z <= zC ? 1 : baseTAtPhi(phiAtEz(z), clamp(z, zB, zT));
    }
    return r.tEndZ;
  };
  // soft horizontal crease below the lamps (T_ZCR: its height over |x|): the band above it, up to the lamps and
  // the smile, sits a few
  // mm further back; it fades out toward the loft seam and toward the hood front edge
  const T_ZCR = mono([
    [0, 0.484],
    [0.25, 0.49],
    [0.4, 0.505],
    [0.5, 0.522],
    [0.6, 0.55],
    [0.7, 0.585],
    [0.78, 0.625],
    [0.86, 0.665],
  ]);
  // the fascia point at (t, z): the base row, pulled onto E in the lamp band, plus the chin lip and the crease
  function pt(t, z) {
    const zz = clamp(z, zB, zT);
    let [x, y] = base(t * tEndOf(zz), zz),
      g = 0;
    if (zz > zA) {
      const ph = phiOf([x, y]),
        e = eAt(ph);
      if (e.z > zA) {
        const u = clamp((zz - zA) / (e.z - zA), 0, 1);
        g = u * u * (3 - 2 * u);
        const r = Math.hypot(x, y - PY) - (rbAt(ph) - e.r) * g * smooth01((t * tEndOf(zz)) / 0.12);
        x = r * Math.cos(ph);
        y = PY + r * Math.sin(ph);
      }
    }
    {
      // body-colour chin lip: ~18 mm proud below a crease at z 0.232, rolling under to the bottom
      const lp =
        zz < 0.232
          ? Math.sqrt(Math.max(0, 1 - ((0.232 - zz) / (0.232 - zB)) ** 2))
          : 1 - smooth01((zz - 0.232) / 0.022);
      const dr = 0.018 * lp * smooth01(t / 0.25);
      if (dr > 0) {
        const ph = phiOf([x, y]),
          r = Math.hypot(x, y - PY) + dr;
        x = r * Math.cos(ph);
        y = PY + r * Math.sin(ph);
      }
    }
    y -=
      0.01 *
      smooth01((zz - T_ZCR(x)) / 0.02 + 0.5) *
      (1 - g) *
      smooth01((0.745 - zz) / 0.06) *
      smooth01(t / 0.16);
    return [x, y, zz];
  }
  // row tangent d(pt)/dt
  function dt(t, z) {
    const h = 0.0015,
      t0 = Math.max(0, t - h),
      t1 = Math.min(1, t + h),
      a = pt(t0, z),
      b = pt(t1, z);
    return [(b[0] - a[0]) / (t1 - t0), (b[1] - a[1]) / (t1 - t0), 0];
  }
  // normal from the row tangent and the height tangent taken at a fixed plan angle (robust where rows shorten)
  const tAtPhi = (ph, z) => {
    let a = 0,
      b = 1;
    for (let k = 0; k < 30; k++) {
      const m = (a + b) / 2;
      if (phiOf(pt(m, z)) < ph) a = m;
      else b = m;
    }
    return (a + b) / 2;
  };
  function normal(t, z) {
    const a = dt(t, z),
      h = 0.0015,
      z0 = Math.max(zB, z - h),
      z1 = Math.min(zT, z + h),
      ph = phiOf(pt(t, z));
    const p0 = pt(tAtPhi(ph, z0), z0),
      p1 = pt(tAtPhi(ph, z1), z1),
      b = [(p1[0] - p0[0]) / (z1 - z0), (p1[1] - p0[1]) / (z1 - z0), 1];
    const n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const l = Math.hypot(...n) || 1;
    return n.map((v) => v / l);
  }
  // t on row z where the fascia is at half-width x (for the front-view projector)
  const tAtX = (x, z) => {
    let a = 0,
      b = 1;
    for (let k = 0; k < 36; k++) {
      const m = (a + b) / 2;
      if (pt(m, z)[0] > x) a = m;
      else b = m;
    }
    return (a + b) / 2;
  };
  return { pt, normal, tAtX, zB, zT, zC, zE0 };
}
