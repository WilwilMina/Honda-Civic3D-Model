// Measured profile of the car body: the key dimensions and the smooth tables (T_*) that describe the shape of the
// 2013 Civic LX sedan station by station along its length. section.js turns these numbers into cross-sections.

// Coordinates (metres, z-up, see docs/ARCHITECTURE.md): y runs along the car (+y = front, 0 = middle of the
// wheelbase), z is height above the ground, x is across (+x = driver side). The body is symmetric, so every table
// describes one half (x >= 0) as a function of y. Most tables give a height (z) or a half-width (x) at station y.
//
// The side-view numbers come from the key points in docs/research/exterior-shape.md (from a perspective-corrected
// side photo): it measures x = mm back from the nose; between the axles y = 2.235 - x/1000, and the overhangs are
// stretched slightly so the bumpers land on our +2.265 / -2.292.

// ------------------------------------------------------------------ math helpers
// mono(keys): smooth curve through [x, y] key points (monotone cubic Hermite / Fritsch-Carlson). Between keys it never
// overshoots, so a table that rises steadily stays steady; outside the first/last key it holds the end value.
export function mono(keys) {
  const k = keys.slice().sort((a, b) => a[0] - b[0]);
  const n = k.length,
    xs = k.map((p) => p[0]),
    ys = k.map((p) => p[1]);
  const d = [],
    m = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i],
      b = m[i + 1] / d[i],
      s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  return (x) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i],
      t = (x - xs[i]) / h,
      t2 = t * t,
      t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i] +
      (t3 - 2 * t2 + t) * h * m[i] +
      (-2 * t3 + 3 * t2) * ys[i + 1] +
      (t3 - t2) * h * m[i + 1]
    );
  };
}
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
// smoothstep: 0 for t <= 0, 1 for t >= 1, an S-curve between (used everywhere to blend one shape into another)
export const smooth01 = (t) => {
  t = clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
};

// ------------------------------------------------------------------ key dimensions
// wheel centres [x, y] (front track 1.499 m, rear 1.522 m; wheelbase 2.670 m)
export const WHEEL = { fl: [0.75, 1.335], fr: [-0.75, 1.335], rl: [0.761, -1.335], rr: [-0.761, -1.335] };
export const WZ = 0.317; // wheel centre height
export const TIRE_R = 0.317; // P195/65R15 tire radius
// wheel-arch openings: [centre y, radius] (arch lip tops at z ~0.675 front / 0.67 rear)
export const ARCHES = [
  [1.335, 0.353],
  [-1.335, 0.348],
];
// The body is a loft (a surface swept through cross-sections) from Y_REAR to Y_END; ahead of Y_END the front
// fascia surface (front/fascia-surface.js) closes the nose out to the bumper at y ~2.265.
export const Y_END = 2.19,
  Y_REAR = -2.292; // rear bumper face

// ------------------------------------------------------------------ profile tables (all metres, keyed by y)
// Each table maps station y to one number of the cross-section; section.js (st) reads them. Heights are z, widths are
// half-widths |x|. Names: T_W width, T_Z* heights, T_TOP / T_CR top surface; names ending in F apply to the nose
// only, T_UP / T_DR / T_ZTR to the tail only.

// T_TOP: centre-line top silhouette (side view): hood, windshield, one-arc roof (peak at the B-pillar), rear glass,
// short high deck, ducktail lip, near-vertical trunk face, bumper shelf.
export const T_TOP = mono([
  [2.19, 0.69],
  [2.17, 0.712],
  [2.13, 0.722],
  [2.08, 0.742],
  [2.03, 0.762],
  [1.96, 0.787],
  [1.8, 0.842],
  [1.6, 0.897],
  [1.335, 0.955],
  [1.25, 0.968],
  [1.185, 0.985],
  [1.1, 1.015],
  [0.875, 1.105],
  [0.7, 1.18],
  [0.545, 1.25],
  [0.42, 1.3],
  [0.305, 1.345],
  [0.19, 1.375],
  [0.085, 1.397],
  [-0.095, 1.42],
  [-0.25, 1.432],
  [-0.335, 1.435],
  [-0.575, 1.435],
  [-0.7, 1.425],
  [-0.815, 1.41],
  [-0.99, 1.385],
  [-1.1, 1.362],
  [-1.215, 1.33],
  [-1.33, 1.288],
  [-1.451, 1.24],
  [-1.57, 1.19],
  [-1.684, 1.14],
  [-1.77, 1.108],
  [-1.84, 1.085],
  [-1.995, 1.068],
  [-2.08, 1.06],
  [-2.12, 1.052],
  [-2.127, 0.99],
  [-2.133, 0.92],
  [-2.14, 0.85],
  [-2.15, 0.795],
  [-2.165, 0.752],
  [-2.19, 0.722],
  [-2.215, 0.695],
  [-2.235, 0.66],
  [-2.255, 0.62],
  [-2.272, 0.58],
  [-2.284, 0.545],
  [-2.292, 0.51],
]);
// T_CR, crown: how much higher the centre line is than the side edge of the top surface (negative = dipped, the plate
// recess). Around y 1.2-1.4 the keys make the fender crest fall steadily from the cowl, with no hump at the cowl
// corner.
export const T_CR = mono([
  [2.19, 0.015],
  [2.13, 0.04],
  [2.0, 0.045],
  [1.8, 0.04],
  [1.62, 0.025],
  [1.5, 0.01],
  [1.4, 0.01],
  [1.35, 0.0157],
  [1.3, 0.0208],
  [1.25, 0.0275],
  [1.225, 0.0333],
  [1.2, 0.04],
  [1.1, 0.042],
  [0.8, 0.048],
  [0.5, 0.058],
  [0.3, 0.072],
  [0.1, 0.084],
  [-0.1, 0.09],
  [-0.9, 0.09],
  [-1.3, 0.08],
  [-1.6, 0.05],
  [-1.84, 0.014],
  [-1.93, 0.02],
  [-2.02, 0.05],
  [-2.05, 0.1],
  [-2.08, 0.17],
  [-2.1, 0.19],
  [-2.12, 0.2],
  [-2.13, 0.16],
  [-2.14, 0.09],
  [-2.15, 0.03],
  [-2.165, 0.0],
  [-2.19, -0.02],
  [-2.215, -0.035],
  [-2.235, -0.05],
  [-2.27, -0.02],
  [-2.292, 0.0],
]);
// T_BELT: beltline (glass sill) height inside the greenhouse zone: low at the mirror, rising to the B-pillar,
// nearly flat to the tip
export const T_BELT = mono([
  [1.205, 0.937],
  [1.1, 0.929],
  [0.95, 0.915],
  [0.785, 0.895],
  [0.6, 0.908],
  [0.385, 0.93],
  [0.15, 0.955],
  [-0.045, 0.975],
  [-0.395, 0.995],
  [-0.8, 1.004],
  [-1.22, 1.012],
  [-1.6, 1.035],
  [-1.84, 1.05],
]);
// T_W: half-width in plan view: soft teardrop, widest over the wheels (1.752 m overall), rounded nose and tail
export const T_W = mono([
  [2.19, 0.43],
  [2.188, 0.475],
  [2.185, 0.505],
  [2.178, 0.54],
  [2.17, 0.565],
  [2.13, 0.64],
  [2.08, 0.71],
  [2.03, 0.765],
  [1.96, 0.812],
  [1.88, 0.845],
  [1.8, 0.862],
  [1.7, 0.869],
  [1.45, 0.884],
  [1.335, 0.889],
  [1.15, 0.883],
  [1.0, 0.875],
  [0.9, 0.871],
  [0.5, 0.872],
  [0.0, 0.876],
  [-0.6, 0.874],
  [-1.1, 0.875],
  [-1.335, 0.876],
  [-1.65, 0.874],
  [-1.9, 0.868],
  [-2.0, 0.848],
  [-2.08, 0.815],
  [-2.14, 0.765],
  [-2.19, 0.695],
  [-2.23, 0.62],
  [-2.26, 0.55],
  [-2.28, 0.45],
  [-2.292, 0.36],
]);
// T_ZB: bottom edge of the body side (rocker / bumper bottom)
export const T_ZB = mono([
  [2.19, 0.2],
  [2.17, 0.185],
  [2.1, 0.18],
  [2.0, 0.19],
  [1.75, 0.19],
  [1.6, 0.195],
  [-0.99, 0.2],
  [-1.66, 0.272],
  [-1.75, 0.274],
  [-1.9, 0.27],
  [-2.0, 0.252],
  [-2.1, 0.238],
  [-2.2, 0.245],
  [-2.25, 0.28],
  [-2.275, 0.33],
  [-2.287, 0.4],
  [-2.292, 0.46],
]);
// Heights of the side's lines:
// T_ZM: height of maximum width (about the arch tops)
export const T_ZM = mono([
  [2.19, 0.42],
  [2.13, 0.52],
  [2.05, 0.6],
  [1.8, 0.65],
  [1.3, 0.67],
  [0, 0.68],
  [-1.3, 0.69],
  [-1.9, 0.7],
  [-2.0, 0.665],
  [-2.08, 0.61],
  [-2.14, 0.565],
  [-2.2, 0.53],
  [-2.292, 0.46],
]);
// T_ZSH: the crisp shoulder line (headlight top -> door handles -> tail light top)
export const T_ZSH = mono([
  [2.19, 0.6],
  [2.1, 0.66],
  [2.0, 0.71],
  [1.645, 0.765],
  [1.4, 0.757],
  [1.1, 0.764],
  [0.785, 0.781],
  [0.45, 0.8],
  [0.2, 0.822],
  [0.0, 0.843],
  [-0.4, 0.874],
  [-0.8, 0.902],
  [-1.0, 0.918],
  [-1.3, 0.942],
  [-1.6, 0.975],
  [-1.87, 0.998],
  [-2.12, 1.005],
  [-2.165, 0.95],
  [-2.195, 0.76],
  [-2.292, 0.54],
]);
// T_ZC: the lower character line (low on the front door, rising toward the rear arch)
export const T_ZC = mono([
  [2.2, 0.36],
  [1.3, 0.33],
  [0.85, 0.342],
  [0.42, 0.383],
  [0.0, 0.405],
  [-0.45, 0.428],
  [-0.75, 0.452],
  [-0.95, 0.475],
  [-1.2, 0.56],
  [-1.45, 0.57],
  [-1.8, 0.47],
  [-2.3, 0.42],
]);
// T_TB: tumblehome, how far the beltline sits inside the maximum width (the side tucks in toward the glass)
export const T_TB = mono([
  [2.19, 0.06],
  [2.0, 0.07],
  [1.6, 0.09],
  [1.25, 0.12],
  [1.05, 0.11],
  [0.85, 0.07],
  [0.6, 0.055],
  [-1.2, 0.055],
  [-1.55, 0.075],
  [-1.84, 0.115],
  [-2.12, 0.13],
  [-2.18, 0.09],
  [-2.292, 0.05],
]);
// T_UP: half-width of the upper rear body (shoulder / lamp level); it narrows sharply in plan: the tail lamps
// face back-sideways above the bumper
export const T_UP = mono([
  [-1.85, 0.808],
  [-1.95, 0.806],
  [-2.02, 0.8],
  [-2.07, 0.787],
  [-2.11, 0.762],
  [-2.14, 0.7],
  [-2.17, 0.625],
  [-2.2, 0.57],
  [-2.3, 0.54],
]);
// T_DR: how far the shoulder line sits inside the max width, under the tail lamp and down the bumper corner
export const T_DR = mono([
  [-2.09, 0.03],
  [-2.12, 0.042],
  [-2.15, 0.054],
  [-2.18, 0.052],
  [-2.205, 0.033],
  [-2.23, 0.021],
  [-2.26, 0.02],
  [-2.292, 0.02],
]);
// T_ZTR: height of the top surface's side edge at the tail (the lid corners round down into the lamps)
export const T_ZTR = mono([
  [-1.98, 1.03],
  [-2.02, 1.015],
  [-2.05, 0.982],
  [-2.08, 0.94],
  [-2.1, 0.905],
  [-2.12, 0.865],
  [-2.14, 0.825],
  [-2.16, 0.792],
  [-2.19, 0.747],
  [-2.215, 0.73],
  [-2.235, 0.71],
  [-2.255, 0.67],
  [-2.272, 0.62],
  [-2.284, 0.575],
  [-2.292, 0.51],
]);
// T_UPF: half-width of the upper nose (headlight level), much rounder in plan than the bumper below it
export const T_UPF = mono([
  [1.85, 0.865],
  [1.92, 0.835],
  [1.98, 0.78],
  [2.03, 0.7],
  [2.08, 0.61],
  [2.12, 0.53],
  [2.16, 0.45],
  [2.19, 0.38],
]);
// Nose (y > 1.85): the top surface's side edge "E" is the hood shut line / headlight top edge (matched to the
// straight-on front photo). Seen from the front it rises from the inner lamp tip (x 0.447, z 0.722) to the outer lamp
// corner (x ~0.78, z ~0.78). T_ZTF: height of E; T_XEF: half-width of E; T_ZCF: centre-line height.
export const T_ZTF = mono([
  [1.85, 0.783],
  [1.9, 0.779],
  [1.95, 0.776],
  [2.0, 0.772],
  [2.05, 0.767],
  [2.1, 0.761],
  [2.125, 0.755],
  [2.15, 0.748],
  [2.17, 0.738],
  [2.18, 0.731],
  [2.19, 0.722],
]);
export const T_XEF = mono([
  [1.85, 0.775],
  [1.9, 0.772],
  [1.95, 0.768],
  [2.0, 0.757],
  [2.025, 0.745],
  [2.05, 0.727],
  [2.075, 0.7],
  [2.1, 0.668],
  [2.125, 0.63],
  [2.15, 0.585],
  [2.17, 0.525],
  [2.18, 0.49],
  [2.19, 0.447],
]);
export const T_ZCF = mono([
  [1.85, 0.825],
  [1.9, 0.808],
  [1.95, 0.792],
  [2.0, 0.776],
  [2.05, 0.76],
  [2.1, 0.745],
  [2.15, 0.729],
  [2.19, 0.715],
]);
// Ahead of Y_S the sides are the front fascia surface (front/fascia-surface.js: rows of constant height blending the
// loft into the nose). The headlight's bottom edge spans both, so it is a height over the plan angle (degrees) seen
// from the point (0, 1.6): lampPhi gives that angle for a point, T_LB the lens bottom height at that angle.
export const Y_S = 1.9;
export const lampPhi = (x, y) => (Math.atan2(y - 1.6, Math.abs(x)) * 180) / Math.PI;
export const T_LB = mono([
  [6.5, 0.772],
  [10.5, 0.742],
  [19.6, 0.695],
  [26, 0.652],
  [32.6, 0.633],
  [39.5, 0.615],
  [47, 0.597],
  [55, 0.582],
  [62, 0.576],
]); // lens bottom 15-25 mm lower toward the inner end (taller lamp), matched to the front photo
// greenhouse zone (the glass house: windshield, side windows, rear glass), from the rear-glass base to the hood's
// rear edge; outside it the section's greenhouse strip (u 1..2) collapses
export const GH0 = -1.84,
  GH1 = 1.205;
export const TUMBLE = 0.62; // side glass lean (~29 deg): roof rails 1.25 m apart on a 1.64 m belt
