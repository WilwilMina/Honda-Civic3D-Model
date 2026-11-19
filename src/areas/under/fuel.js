// Fuel system and lines under the floor: the plastic fuel tank (shaped as a saddle over the exhaust tunnel) with
// its two steel straps, the filler neck up to the fuel door, and the fuel / EVAP / rear brake lines clipped along
// the floor. Called from scene.js with the under kit. Frame: metres, +x = driver side, +y = front, z up.
import { prism, box, sweep } from "../../lib/geom.js";
import { FLOOR_Z, FUEL_X, AXES } from "./kit.js";

// Fuel tank, straps and filler neck.
export function buildFuelTank(kit) {
  const { C, group, add, curve, cyl } = kit;
  // tank extent: y0..y1 along the car, z0..z1 bottom..top, ±xo outer sides; the exhaust notch runs
  // between nx0 and nx1 up to height nz
  const T = { y0: -0.98, y1: -0.38, z0: 0.212, z1: 0.444, xo: 0.56, nx0: -0.11, nx1: 0.09, nz: 0.335 };
  const c = 0.035; // chamfer
  // cross-section [x, z], pushed along y
  const poly = [
    [-T.xo + c, T.z0],
    [T.nx0 - 0.02, T.z0],
    [T.nx0, T.z0 + 0.03],
    [T.nx0, T.nz],
    [T.nx1, T.nz],
    [T.nx1, T.z0 + 0.03],
    [T.nx1 + 0.02, T.z0],
    [T.xo - c, T.z0],
    [T.xo, T.z0 + c],
    [T.xo, T.z1 - 0.02],
    [T.xo - 0.02, T.z1],
    [-T.xo + 0.02, T.z1],
    [-T.xo, T.z1 - 0.02],
    [-T.xo, T.z0 + c],
  ];
  add(
    group,
    prism({ o: [0, 0, 0], a: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1] }, poly, T.y0, T.y1),
    0x3a3d42,
    "plastic",
    "fuel-tank",
    true,
  );
  // pressed ribs on the tank bottom
  for (const x of [-0.36, 0.33])
    add(
      group,
      box([x, (T.y0 + T.y1) / 2, T.z0 - 0.003], AXES, [0.09, 0.25, 0.004]),
      0x34373c,
      "plastic",
      "fuel-tank",
    );
  // two steel straps under the tank, bolted to the floor; each follows the tank bottom and the exhaust notch
  for (const y of [-0.5, -0.86]) {
    const pts = [
      [-T.xo - 0.03, y, 0.452],
      [-T.xo - 0.03, y, T.z0 - 0.006],
      [T.nx0 - 0.02, y, T.z0 - 0.006],
      [T.nx0 + 0.005, y, T.z0 + 0.02],
      [T.nx0 + 0.005, y, T.nz - 0.004],
      [T.nx1 - 0.005, y, T.nz - 0.004],
      [T.nx1 - 0.005, y, T.z0 + 0.02],
      [T.nx1 + 0.02, y, T.z0 - 0.006],
      [T.xo + 0.03, y, T.z0 - 0.006],
      [T.xo + 0.03, y, 0.452],
    ];
    add(group, sweep(pts, 0.006, { radial: 6 }), C.darksteel, "metal", "tank-straps", true);
    for (const sx of [-1, 1])
      add(
        group,
        cyl([sx * (T.xo + 0.03), y, 0.44], [0, 0, 1], 0.012, 0.018, 6),
        C.darksteel,
        "metal",
        "tank-straps",
      );
  }
  // filler neck: from the tank up to the fuel door on the driver-side rear quarter (s = side sign)
  const s = FUEL_X;
  const neck = curve(
    [
      [s * 0.47, -0.93, 0.38],
      [s * 0.56, -0.99, 0.48],
      [s * 0.6, -1.12, 0.66],
      [s * 0.615, -1.36, 0.79],
      [s * 0.66, -1.6, 0.85],
      [s * 0.76, -1.68, 0.875],
      [s * 0.8, -1.69, 0.88],
    ],
    50,
  );
  add(group, sweep(neck, 0.024, { radial: 16 }), 0x8a8f95, "metal", "filler-neck", true);
  // thin rubber hose running alongside the neck
  add(
    group,
    sweep(
      neck.map((p) => [p[0] - s * 0.035, p[1] + 0.01, p[2] + 0.025]),
      0.006,
      { radial: 8 },
    ),
    C.rubber,
    "rubber",
    "filler-neck",
  );
  // filler cap housing at the fuel door
  add(group, cyl([s * 0.8, -1.69, 0.88], [s, 0, 0], 0.04, 0.03), C.black, "plastic", "filler-neck");
}

// Fuel feed, EVAP vapor and the two rear brake lines along the floor, held by plastic clips.
export function buildFuelLines(kit) {
  const { C, group, add, curve } = kit;
  const z = FLOOR_Z - 0.012;
  const lines = [
    { x: 0.165, r: 0.0055, color: 0x9aa0a6, end: [[0.165, -0.34, 0.33]] }, // fuel feed
    { x: 0.18, r: 0.0045, color: 0x3f4247, end: [[0.18, -0.34, 0.33]] }, // EVAP vapor line
    {
      x: 0.195,
      r: 0.0035,
      color: 0xb8733d,
      end: [
        [0.2, -0.33, z + 0.005],
        [0.5, -0.33, z + 0.02],
        [0.62, -0.36, 0.33],
        [0.62, -1.15, 0.35],
      ],
    }, // brake line -> driver rear
    {
      x: 0.207,
      r: 0.0035,
      color: 0xb8733d,
      end: [
        [0.21, -0.31, z + 0.005],
        [-0.5, -0.31, z + 0.02],
        [-0.62, -0.34, 0.33],
        [-0.62, -1.15, 0.35],
      ],
    }, // brake line -> passenger rear
  ];
  // every line comes down from the engine bay at the front, runs flat along the floor, then to its own end
  for (const L of lines) {
    const pts = [[L.x, 1.16, 0.4], [L.x, 1.08, z + 0.02], [L.x, 0.95, z], [L.x, -0.25, z], ...L.end];
    add(group, sweep(curve(pts, 80), L.r, { radial: 8 }), L.color, "metal", "fuel-lines");
  }
  // plastic clips holding the bundle
  for (const y of [0.85, 0.45, 0.05, -0.2])
    add(group, box([0.186, y, z + 0.004], AXES, [0.034, 0.012, 0.009]), C.black, "plastic", "fuel-lines");
}
