// Moving fittings of the exterior: the four wheels (tire, steel rim and the LX's silver 5-split-spoke wheel cover),
// the windshield wipers (parked at the base of the windshield, swept by ctx.car.sweepWipers) and the hood prop rod.
// api.js animates them.
import * as THREE from "three";
import { box, lathe, prism, sweep } from "../../../lib/geom.js";
import { TIRE_R, WHEEL, WZ } from "./profile.js";
import { P } from "./section.js";
import { surf } from "./surface.js";
import { Y_WS } from "./cut-lines.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// One wheel, built in its own frame: axle along x (+x = outboard), centre at the origin. Round parts are lathed:
// each profile is a list of [s, r] = [position along the axle, radius].
function buildWheel(M) {
  const w = new THREE.Group();
  const F = (o = 0) => ({ o: [o, 0, 0], a: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] }); // lathe frame on the axle
  // tire (P195/65R15): meridian from the inboard bead, over the tread, to the outboard bead
  const R = TIRE_R,
    rb = 0.1925; // bead radius (15-inch rim)
  const tp = [
    [-0.085, rb],
    [-0.094, 0.215],
    [-0.099, 0.25],
    [-0.097, 0.28],
    [-0.09, 0.3],
    [-0.078, 0.312],
    [-0.06, R],
    [0.06, R],
    [0.078, 0.312],
    [0.09, 0.3],
    [0.097, 0.28],
    [0.099, 0.25],
    [0.094, 0.215],
    [0.085, rb],
  ];
  const tire = new THREE.Mesh(lathe(F(), tp, 56), M.rubber);
  tire.castShadow = true;
  w.add(tire);
  // inner tire wall (so the hollow dish reads dark from behind)
  w.add(
    new THREE.Mesh(
      lathe(
        F(),
        [
          [0.085, rb],
          [-0.085, rb],
        ],
        48,
      ),
      M.rubber,
    ),
  );
  // steel rim barrel + flanges
  const rim = new THREE.Mesh(
    lathe(
      F(),
      [
        [-0.092, 0.2],
        [-0.084, 0.196],
        [-0.082, 0.185],
        [-0.03, 0.172],
        [0.03, 0.172],
        [0.082, 0.185],
        [0.084, 0.196],
        [0.092, 0.2],
      ],
      48,
    ),
    M.steel,
  );
  w.add(rim);
  // disc: hub face at |x| = 0.715 (s = -0.035), open centre bore
  w.add(
    new THREE.Mesh(
      lathe(
        F(),
        [
          [-0.035, 0.034],
          [-0.035, 0.085],
          [-0.02, 0.11],
          [-0.005, 0.15],
          [0.0, 0.172],
        ],
        40,
      ),
      M.steel,
    ),
  );
  // wheel cover: dark backing, silver ring, 5 split spokes, hub with lug holes
  const cz = 0.075;
  w.add(
    new THREE.Mesh(
      lathe(
        F(),
        [
          [cz - 0.012, 0.19],
          [cz - 0.018, 0.12],
          [cz - 0.02, 0.0],
        ].reverse(),
        48,
      ),
      M.coverDark,
    ),
  );
  w.add(
    new THREE.Mesh(
      lathe(
        F(),
        [
          [0.086, 0.197],
          [0.088, 0.19],
          [0.084, 0.168],
          [0.074, 0.158],
          [0.072, 0.15],
        ].reverse(),
        56,
      ),
      M.cover,
    ),
  );
  w.add(
    new THREE.Mesh(
      lathe(
        F(),
        [
          [0.072, 0.075],
          [0.078, 0.07],
          [0.082, 0.05],
          [0.084, 0.02],
          [0.084, 0.0],
        ],
        40,
      ),
      M.cover,
    ),
  );
  // 10 spoke halves = 5 split spokes, as thin prisms standing off the cover
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    const poly = [
      [0.068, -0.012],
      [0.16, -0.019],
      [0.16, 0.019],
      [0.068, 0.012],
    ];
    const sp = new THREE.Mesh(
      prism(
        {
          o: [0.0, 0, 0],
          a: [1, 0, 0],
          u: [0, Math.cos(a), Math.sin(a)],
          v: [0, -Math.sin(a), Math.cos(a)],
        },
        poly,
        0.064,
        0.077,
      ),
      M.cover,
    );
    w.add(sp);
  }
  // lug nuts showing through the cover (5 on a 114.3 mm circle)
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + Math.PI / 5;
    const n = new THREE.Mesh(new THREE.CylinderGeometry(0.0095, 0.0095, 0.02, 6), M.chrome);
    n.rotation.z = Math.PI / 2;
    n.position.set(0.085, Math.cos(a) * 0.057, Math.sin(a) * 0.057);
    w.add(n);
  }
  // Honda-ish centre badge
  const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.004, 24), M.chrome);
  badge.rotation.z = Math.PI / 2;
  badge.position.x = 0.086;
  w.add(badge);
  w.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return w;
}

// the four wheels, cloned from one prototype and placed at WHEEL[id]; right-side wheels are turned 180 deg about z
export function buildWheels({ g, M }) {
  const wheels = {};
  const proto = buildWheel(M);
  for (const [id, [x, y]] of Object.entries(WHEEL)) {
    const wg = proto.clone(true);
    wg.name = "wheel-" + id;
    if (x < 0) wg.rotation.z = Math.PI;
    wg.position.set(x, y, WZ);
    wg.userData.goto = "chassis";
    g.add(wg);
    wheels[id] = {
      group: wg,
      home: wg.position.clone(),
      t: 0,
      side: Math.sign(x),
      baseRotZ: wg.rotation.z,
    };
  }
  return wheels;
}

// The two wipers. Each is a group on the windshield at its pivot, oriented so local x runs along the parked arm and
// local z is the windshield normal; its child sweepG rotates about z to sweep (api.js). Returns [{grp, sweepG, max}].
export function buildWipers({ g, M, mat, parts }) {
  const wipers = [];
  const yb = Y_WS - 0.055; // pivot station, just ahead of the windshield base
  // driver blade 650 mm, passenger 575 mm; tandem, both parked pointing toward the driver side (+x)
  for (const [px, len, armLen, key] of [
    [0.03, 0.65, 0.62, "d"],
    [-0.6, 0.575, 0.55, "p"],
  ]) {
    const pz = P(yb, 4)[2];
    const base = V(px, yb, pz - 0.022); // parked low, mostly hidden behind the hood's rear edge
    const n = surf(yb, 4, 0).n; // windshield normal near the base
    const grp = new THREE.Group();
    grp.name = "wiper-" + key;
    grp.userData.goto = "lights";
    grp.position.copy(base);
    // local frame: x along the parked arm (+x world), z = windshield normal
    const xAxis = V(1, 0, 0),
      zAxis = n.clone(),
      yAxis = zAxis.clone().cross(xAxis).normalize();
    const xA = yAxis.clone().cross(zAxis).normalize();
    grp.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xA, yAxis, zAxis));
    g.add(grp);
    const sweepG = new THREE.Group();
    grp.add(sweepG);
    const pivotCap = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.025, 14), M.trim);
    pivotCap.rotation.x = Math.PI / 2;
    sweepG.add(pivotCap);
    const arm = new THREE.Mesh(
      box(
        [armLen / 2, 0.0, 0.014],
        [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
        ],
        [armLen / 2, 0.007, 0.005],
      ),
      M.trim,
    );
    sweepG.add(arm);
    parts.wiperArm.push(arm);
    const blade = new THREE.Group();
    blade.position.set(armLen * 0.97, 0.022, 0.012);
    sweepG.add(blade);
    const frame = new THREE.Mesh(
      box(
        [0, 0, 0.006],
        [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
        ],
        [len / 2, 0.009, 0.006],
      ),
      mat(0x232528, "plastic", "car:blade"),
    );
    frame.position.x = -len * 0.48;
    blade.add(frame);
    const rubber = new THREE.Mesh(
      box(
        [0, 0, -0.003],
        [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
        ],
        [len / 2, 0.003, 0.004],
      ),
      M.rubber,
    );
    rubber.position.x = -len * 0.48;
    blade.add(rubber);
    parts.wiperBlade.push(frame, rubber);
    wipers.push({ grp, sweepG, max: key === "d" ? 1.62 : 1.5 }); // max sweep angle (rad)
  }
  return wipers;
}

// Hood prop rod (Honda manual: support rod + clamp): rests along the radiator support; api.js swings it up into the
// open hood. Its group's local +y runs along the rod.
export function buildPropRod({ g, mat }) {
  const prop = new THREE.Group();
  prop.name = "prop-rod";
  const propBase = V(0.3, 2.03, 0.745);
  prop.position.copy(propBase);
  g.add(prop);
  const propLen = 0.66;
  prop.add(
    new THREE.Mesh(
      sweep(
        [
          [0, 0, 0],
          [0, propLen, 0],
        ],
        0.0045,
        { radial: 8 },
      ),
      mat(0x1d1f22, "metal", "car:prop"),
    ),
  );
  return { prop, propBase, propLen };
}
