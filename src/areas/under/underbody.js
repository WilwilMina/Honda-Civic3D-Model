// The car's bare underbody as seen on the lift: floor pan with the exhaust tunnel, pinch welds and rocker boxes;
// the four jacking points; the oil and ATF drain plugs (on the engine bay's oil pan and transmission); and the
// removable engine lower cover and plastic under covers. Called from scene.js with the under kit.
// Frame: metres, +x = driver side, +y = front, z up.
import { prism, box, lathe } from "../../lib/geom.js";
import { FLOOR_Z, SILL_X, SILL_Z, JACK_Y, UNDERCOAT, AXES } from "./kit.js";

// Floor pan, tunnel, rear floor with the spare-well opening, ribs, pinch welds and rocker boxes.
export function buildFloorPan(kit) {
  const { THREE, group, add } = kit;
  const t = 0.012; // sheet thickness
  // front floor (two halves beside the tunnel), side profile [y, z]: up the toe board, flat, then a step up to the
  // rear-seat floor
  const prof = [
    [1.16, FLOOR_Z + 0.03],
    [1.0, FLOOR_Z],
    [-0.32, FLOOR_Z],
    [-0.4, 0.462],
    [-1.04, 0.462],
  ];
  const sheet = (xa, xb) => {
    const poly = prof.concat(
      prof
        .slice()
        .reverse()
        .map(([y, z]) => [y, z + t]),
    );
    return prism({ o: [0, 0, 0], a: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] }, poly, xa, xb);
  };
  add(group, sheet(0.14, 0.68), UNDERCOAT, "metal", "floor-pan");
  add(group, sheet(-0.68, -0.14), UNDERCOAT, "metal", "floor-pan");
  // tunnel (an upside-down U the exhaust runs in), cross-section [x, z] pushed along y
  const tun = [
    [-0.14, FLOOR_Z],
    [-0.14, 0.37],
    [-0.1, 0.4],
    [0.1, 0.4],
    [0.14, 0.37],
    [0.14, FLOOR_Z],
    [0.13, FLOOR_Z],
    [0.13, 0.365],
    [0.095, 0.39],
    [-0.095, 0.39],
    [-0.13, 0.365],
    [-0.13, FLOOR_Z],
  ];
  add(
    group,
    prism({ o: [0, 0, 0], a: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1] }, tun, -0.36, 1.12),
    UNDERCOAT,
    "metal",
    "floor-pan",
  );
  // tunnel strip over the raised rear-seat floor
  add(group, box([0, -0.7, 0.468], AXES, [0.14, 0.34, 0.006]), UNDERCOAT, "metal", "floor-pan");
  // rear floor with the spare-tire well opening (the well itself belongs to the trunk area)
  const s = new THREE.Shape();
  s.moveTo(-0.66, -1.04);
  s.lineTo(0.66, -1.04);
  s.lineTo(0.66, -2.16);
  s.lineTo(-0.66, -2.16);
  s.lineTo(-0.66, -1.04);
  const hole = new THREE.Path();
  hole.absarc(0, -1.8, 0.345, 0, Math.PI * 2, true);
  s.holes.push(hole);
  const rf = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 48 });
  rf.translate(0, 0, 0.452);
  add(group, rf, UNDERCOAT, "metal", "floor-pan");
  // reinforcing ribs pressed into the front floor
  for (const x of [-0.42, 0.42])
    add(group, box([x, 0.35, FLOOR_Z - 0.006], AXES, [0.035, 0.55, 0.006]), UNDERCOAT, "metal", "floor-pan");
  // pinch-weld flanges under each rocker panel
  for (const sx of [1, -1]) {
    add(
      group,
      box([sx * SILL_X, 0.04, SILL_Z + 0.03], AXES, [0.004, 0.98, 0.03]),
      UNDERCOAT,
      "metal",
      "floor-pan",
    );
    // rocker box (only the inner floor side; the outside skin is the exterior body)
    add(
      group,
      box([sx * (SILL_X - 0.02), 0.04, FLOOR_Z - 0.015], AXES, [0.035, 0.98, 0.04]),
      UNDERCOAT,
      "metal",
      "floor-pan",
    );
  }
}

// Jacking points: 4 reinforced spots on the pinch welds, each marked by two small notches.
export function buildJackPoints(kit) {
  const { THREE, group, add } = kit;
  for (const sx of [1, -1])
    for (const y of JACK_Y) {
      const g = new THREE.Group();
      add(
        g,
        box([sx * SILL_X, y, SILL_Z + 0.005], AXES, [0.012, 0.075, 0.012]),
        0x9aa1a8,
        "metal",
        "jack-points",
      );
      // the two small notches that mark the spot
      for (const dy of [-0.06, 0.06])
        add(
          g,
          box([sx * SILL_X, y + dy, SILL_Z + 0.012], AXES, [0.009, 0.006, 0.02]),
          0x3b3f44,
          "metal",
          "jack-points",
        );
      group.add(g);
    }
}

// Oil drain plug (rear of the oil pan) and ATF drain plug (bottom of the transmission case).
export function buildDrainPlugs(kit) {
  const { C, group, add, cyl } = kit;
  // drain bolt on the REAR edge of the oil pan (bay model pan: x -0.45..-0.01, y 1.445..1.645, bottom z 0.30)
  const p = [-0.4, 1.445, 0.318];
  add(
    group,
    cyl([p[0], p[1] - 0.002, p[2]], [0, 1, 0], 0.0145, 0.004, 24),
    C.copper,
    "metal",
    "oil-drain-plug",
  ); // 14 mm crush washer
  add(
    group,
    lathe(
      { o: [p[0], p[1] - 0.004, p[2]], a: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
      [
        [0, 0],
        [0, 0.0098],
        [0.011, 0.0098],
        [0.011, 0],
      ],
      6,
    ),
    0xb9bec4,
    "metal",
    "oil-drain-plug",
  ); // 17 mm head (6-sided lathe = hex)
  add(
    group,
    box([p[0], p[1] + 0.004, p[2] - 0.004], AXES, [0.02, 0.006, 0.012]),
    0x55595e,
    "metal",
    "oil-drain-plug",
  ); // boss on the pan
  // ATF drain plug on the bottom of the transmission case
  const q = [0.22, 1.56, 0.317];
  add(
    group,
    cyl([q[0], q[1], q[2] - 0.002], [0, 0, 1], 0.017, 0.004, 24),
    0x9aa0a6,
    "metal",
    "atf-drain-plug",
  );
  add(
    group,
    cyl([q[0], q[1], q[2] - 0.009], [0, 0, 1], 0.014, 0.01, 24),
    0xb9bec4,
    "metal",
    "atf-drain-plug",
  );
  add(
    group,
    box([q[0], q[1], q[2] - 0.0145], AXES, [0.005, 0.005, 0.002]),
    0x2a2c30,
    "metal",
    "atf-drain-plug",
  ); // square drive
}

// Engine lower cover (metal, held by screws; comes off for oil changes), plastic floor / fuel-tank covers and
// rear strakes.
export function buildUnderCovers(kit) {
  const { THREE, group, add, cyl } = kit;
  const ec = new THREE.Shape();
  const pts = [
    [-0.44, 1.52],
    [0.3, 1.52],
    [0.34, 1.6],
    [0.34, 1.92],
    [-0.48, 1.92],
    [-0.48, 1.6],
  ];
  ec.moveTo(...pts[0]);
  for (const q of pts.slice(1)) ec.lineTo(...q);
  const g = new THREE.ExtrudeGeometry(ec, { depth: 0.004, bevelEnabled: false });
  g.translate(0, 0, 0.183);
  add(group, g, 0xb9bdc2, "metal", "engine-cover");
  // corner screws
  for (const [x, y] of [
    [-0.42, 1.56],
    [0.28, 1.56],
    [-0.44, 1.88],
    [0.3, 1.88],
  ])
    add(group, cyl([x, y, 0.181], [0, 0, 1], 0.009, 0.004, 10), 0x2a2c30, "metal", "engine-cover");
  // pressed ribs
  for (const x of [-0.25, -0.05, 0.15])
    add(group, box([x, 1.72, 0.182], AXES, [0.05, 0.13, 0.002]), 0xa6abb0, "metal", "engine-cover");
  // plastic front-floor covers either side of the tunnel
  for (const sx of [1, -1]) {
    add(
      group,
      box([sx * 0.42, 0.28, FLOOR_Z - 0.022], AXES, [0.19, 0.5, 0.004]),
      0x2e3135,
      "plastic",
      "under-covers",
    );
    // fuel-tank lower cover (leaves the exhaust channel open)
    add(group, box([sx * 0.33, -0.68, 0.198], AXES, [0.2, 0.27, 0.004]), 0x2e3135, "plastic", "under-covers");
    // small strake (air deflector) ahead of each rear tire
    add(
      group,
      box([sx * 0.7, -0.99, 0.215], AXES, [0.06, 0.006, 0.035]),
      0x2e3135,
      "plastic",
      "under-covers",
    );
  }
}
