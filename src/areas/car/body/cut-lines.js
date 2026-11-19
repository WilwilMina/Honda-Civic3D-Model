// Panel cut lines: where the body surface is cut into panels (hood, fenders, doors, roof, quarters, trunk lid, bumpers)
// and where the lamp and glass openings are. Stations are y values (metres, +y = front); side cut lines are given as
// a section parameter u (see section.js), usually via uz(y, z) from a height z. panels.js and the front / rear / side
// details all build on these lines, so the openings and the parts that fill them match.
import { ARCHES, T_LB, WZ, Y_END, clamp, lampPhi, lerp, mono, smooth01 } from "./profile.js";
import { half, st, uz } from "./section.js";

// ------------------------------------------------------------------ gaps and stations
export const GAP = 0.0022; // panel gap in y (each side of a cut)
export const GAP_U = 0.004; // panel gap in u
export const Y_HOOD0 = 1.205, // hood rear edge (just behind the windshield base)
  Y_HOOD1 = 2.183; // hood front edge = top of the grille opening
export const Y_FD0 = -0.212, // front door rear edge: the cut sits at the front of the black B-pillar, behind the handle
  Y_FD1 = 0.885; // front door front edge
export const Y_RD0 = -0.953, // rear door: lower rear edge (at the arch)
  Y_RD1 = -0.222, // rear door front edge
  Y_RDT = -1.22; // rear door upper rear tip (above the arch)
export const Y_TRUNK0 = -1.84, // trunk lid front edge (rear-glass base)
  Y_LID1 = -2.158, // lid corners: below this the lid continues down the face only as the "chin" (chinU)
  Y_RB = -1.72, // rear bumper front end on the side
  Y_FB = 1.7; // front bumper / fender cut
export const Y_WS = 1.175, // windshield base
  Y_ROOF1 = 0.085, // roof front (windshield header)
  Y_ROOF0 = -0.99; // roof rear (rear-glass top)
export const Y_LIP = -2.118; // ducktail lip: the deck lid's rear edge, where the lid turns down into its face
export const U_EDGE = 2.035; // hood / trunk / roof side edge (half u, just inside the top surface's edge)

// ------------------------------------------------------------------ doors
const zDoor = 0.3; // door bottom edge height (above the rocker)
export const uDoor = (y) => uz(y, zDoor);
export const uBump = (y) => uz(y, 0.615); // fender / front bumper cut height on the side
// Lower edge of the rear door's rear part: a diagonal down from the window tip (Y_RDT), then following the rear arch
// ~35 mm off the lip all the way down to the door bottom (matched to the side photos).
const archOff = (y) => {
  const dy = y - ARCHES[1][0],
    r = ARCHES[1][1] + 0.035;
  return Math.abs(dy) < r ? WZ + Math.sqrt(r * r - dy * dy) : 0;
};
const smax = (a, b, k) => (a + b + Math.sqrt((a - b) * (a - b) + k * k)) / 2; // smooth max (k = corner size)
export const doorCut = (y) =>
  uz(
    y,
    Math.max(
      st(y).zb + 0.03,
      smax(1.0 - 2.375 * Math.max(0, y - Y_RDT), archOff(y), 0.03),
      y > Y_RD0 - 0.004 ? zDoor : 0,
    ),
  );

// ------------------------------------------------------------------ glass and pillars
// pillar strips (as half u of the top surface) beside the windshield and the tapered rear glass
export const AP_F = (y) => lerp(0.1, 0.165, clamp((Y_WS - y) / (Y_WS - Y_ROOF1), 0, 1)); // painted A-pillar ~55-60 mm
export const AP_R = (y) => lerp(0.21, 0.14, clamp((Y_ROOF0 - y) / (Y_ROOF0 - Y_TRUNK0), 0, 1));
// windshield and rear-glass side edges in full-width U (left / right)
export const WSL = (y) => 3 + AP_F(y),
  WSR = (y) => 5 - AP_F(y),
  RGL = (y) => 3 + AP_R(y),
  RGR = (y) => 5 - AP_R(y);
// side-glass top (a black drip/frame band ~85 mm runs above it up to the roof rail)
export const gTop = (y) => {
  const s0 = st(y),
    h = s0.zr - s0.zt;
  return h < 0.01 ? 1.5 : 1 + clamp((h - 0.08) / h, 0.25, 0.94);
};
export const DLO_F = 0.63; // front side glass front corner (behind the black mirror sail); DLO = daylight opening
export const YQ0 = -0.965,
  YQ1 = -0.983; // divider between the rear door glass and its fixed quarter glass
const rq = (y) => clamp((y - Y_RDT) / (YQ1 - Y_RDT), 0, 1); // 1 at the divider, 0 at the pointed tip
export const qTop = (y) => 1.04 + (gTop(y) - 1.04) * rq(y); // fixed quarter glass top edge
export const qFrame = (y) => Math.max(qTop(y) + 0.004, 1.04 + 0.96 * Math.pow(rq(y), 0.8)); // its frame's top

// ------------------------------------------------------------------ headlight opening and front bumper seam
// The headlight (as half u of the body side) is swept back along the fender to a point above the front arch: on the
// loft it runs from its rear tip HL0 to Y_S; the rest is on the front fascia (front.js).
export const HL0 = 1.7;
export const T_HLZ = (y) => T_LB(lampPhi(st(y).Wsh, y)); // lens bottom height
// lens top height; above ~1.83 it reaches the side's top edge (u = 1), which becomes the hood shut line
export const T_HLT = mono([
  [HL0, 0.776],
  [1.75, 0.79],
  [1.8, 0.797],
  [1.86, 0.84],
  [1.95, 2.0],
  [Y_END, 2.0],
]);
export const hlLo = (y) => Math.min(0.99, uz(y, T_HLZ(y)));
export const hlHi = (y) => {
  const zT = T_HLT(y);
  return zT >= st(y).zt - 0.002 ? 1 : Math.max(hlLo(y) + 0.004, uz(y, zT));
};
// bumper / fender seam on the side: level behind, rising into the lamp's lower rear corner by Y_S
export const zFB = (y) => Math.min(T_HLZ(y), lerp(0.615, T_HLZ(y), smooth01((y - 1.74) / 0.13)));
export const uFB = (y) => uz(y, zFB(y));
export const uFBlo = (y) => uz(y, zFB(y) - 0.0025); // fascia top: an even ~2.5 mm gap in height below the seam

// ------------------------------------------------------------------ tail lamp opening (outer lamp, quarter corner)
// a wedge from a point at the shoulder line (TL1) down / back onto the rear face (TL0)
export const TL0 = -2.202,
  TL1 = -1.875;
// lens bottom ~0.79 at the outer end, ~0.78 at the lid seam; top ~1.0 (matched to the straight-on rear photo)
const T_TLZ = mono([
  [TL1, 0.987],
  [-1.92, 0.962],
  [-1.97, 0.912],
  [-2.02, 0.848],
  [-2.07, 0.805],
  [-2.12, 0.79],
  [-2.16, 0.782],
  [TL0, 0.778],
]);
const T_TLT = mono([
  [TL1, 0.992],
  [-1.95, 0.982],
  [-2.02, 0.975],
  [-2.06, 0.972],
  [TL0, 0.965],
]);
// lens bottom height, held constant behind TL0
export function T_TLZ_(y) {
  return T_TLZ(Math.max(TL0, y));
}
// the lamp ends where the body's top edge drops below its bottom line (just past the lid's lower corner)
export const tlDead = (y) => y < -2.1 && st(y).zt - T_TLZ_(y) < 0.003;
export const tlLo = (y) => (tlDead(y) ? 1.003 : Math.min(0.99, uz(y, T_TLZ(y))));
export const tlHi = (y) => {
  if (tlDead(y)) return 1.003;
  const s0 = st(y);
  return Math.max(tlLo(y) + 0.004, uz(y, Math.min(T_TLT(y), s0.zt - 0.003)));
};
// where the lamp reaches the top edge on the face it carries on across the quarter strip (u 1..2) up to the lid seam
export const tlTop = (y) => {
  if (tlDead(y)) return 1.003;
  const s0 = st(y),
    w = smooth01((T_TLT(Math.max(TL0, y)) - s0.zt + 0.003) / 0.025) * smooth01((-2.0 - y) / 0.03);
  return w <= 0.001 ? tlHi(y) : 2 + w * Math.max(0, lidEdge(y) - 0.0035 - 2);
};

// ------------------------------------------------------------------ rear bumper / quarter cut
// The cut on the side leaves the lamp's lower edge at y -1.95 and runs as one diagonal down to the rear wheel-arch
// lip at Y_RBA (matched to the rear three-quarter photos).
export const Y_RBA = -1.6;
const zSeam = (y) => {
  if (y <= -1.95) return T_TLZ_(y) - 0.012;
  const t = clamp((y + 1.95) / (Y_RBA + 1.95), 0, 1);
  return lerp(T_TLZ_(-1.95) - 0.012, st(Y_RBA).zb + 0.003, t * (1.25 - 0.25 * t));
};
// bumper top edge on the side (u); where the outer lamp runs out (tlDead) it rises smoothly to the body's top edge
// instead of jumping ~30 mm in one station
export const uRBump = (y) => {
  if (y < TL0 || tlDead(y)) return 1;
  const s0 = st(y),
    zT = Math.min(zSeam(y), s0.zt - 0.03),
    w = y < -2.1 ? smooth01((s0.zt - T_TLZ_(y) - 0.003) / 0.025) : 1;
  return uz(y, s0.zt - (s0.zt - zT) * w);
};

// ------------------------------------------------------------------ trunk lid outline
// Rear-view lid seam (camera-matched to the straight-on rear photo): |x| of the seam at height z, from the bottom of
// the shallow U (centre ~0.62) up the lamp split to the lid's top corner.
export const T_SEAM = mono([
  [0.61, 0.3],
  [0.632, 0.345],
  [0.659, 0.417],
  [0.703, 0.463],
  [0.751, 0.494],
  [0.77, 0.516],
  [0.8, 0.54],
  [0.835, 0.56],
  [0.875, 0.576],
  [0.912, 0.589],
  [0.97, 0.6],
  [1.03, 0.612],
  [1.07, 0.665],
]);
// top-surface fraction t (u = 2 + t) where station y crosses the seam curve (bisection, cached)
const seamCache = new Map();
const seamFrac = (y) => {
  const key = Math.round(y * 1e6);
  if (seamCache.has(key)) return seamCache.get(key);
  const s0 = st(y),
    f = (t) => {
      const q = half(s0, 2 + t);
      return q[0] - T_SEAM(q[1]);
    };
  let a = 0,
    b = 1,
    t = 0;
  if (f(0) > 0) {
    for (let k = 0; k < 32; k++) {
      const m = (a + b) / 2;
      if (f(m) > 0) a = m;
      else b = m;
    }
    t = (a + b) / 2;
  }
  seamCache.set(key, t);
  return t;
};
// lid side edge (half u): on the deck just inside the gutter; on the face it follows the rear-view seam
export const lidEdge = (y) => {
  const base = U_EDGE - 0.024 * smooth01((-2.0 - y) / 0.05);
  if (y > -2.0) return base;
  const face = 2 + clamp(seamFrac(y), 0.011, 0.6);
  return lerp(base, Math.max(base, face), smooth01((-2.0 - y) / 0.04));
};
// The lid's bottom edge seen from behind is a wide shallow U: below its side corners (Y_LID1) the lid carries on down
// the face to Y_LIDC as a "chin" whose half-width (chinU, a top-surface fraction) shrinks with height.
export const Y_LIDC = -2.251;
export const chinU = (y) => clamp(1 - seamFrac(y), 0.05, 0.98);
