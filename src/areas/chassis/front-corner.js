// Chassis area, FRONT corners: the knuckle with its hub, vented disc (rotor), floating caliper and pads, the
// MacPherson strut with its coil spring and top mount, the lower control arm and ball joint, the CV axle, the
// tie rod, the sway-bar end link and the brake hose / ABS wire. Also the parts between the front wheels:
// steering rack, assist motor, steering shaft, subframe, differential and front sway bar. Kit units in the
// front group (see kit.js); the knuckle group is posed per frame by animations.js.
import * as THREE from "three";
import { HZ, A } from "./kit.js";
import { turn, cylX, tube, smooth, sector, slabX, helixPts } from "./geometry.js";
import { sweep } from "../../lib/geom.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);

const KP_TOP = 183; // strut top pivot height (kit z): the top of the steering axis
const SX = 124,
  SDX = 4; // strut axis (kit x) and shift from the 2D model
// buildFrontCorner(kit, s): one front corner (s = 1 driver side, -1 passenger side). Returns the handles the
// animations move: c.kn (knuckle group), c.cal / c.padIn / c.padOut (brake), dynamic tubes, pivot groups.
export function buildFrontCorner(kit, s) {
  const { mat, C, M, RUBBER, CHROME, LINING, frontG, add, item, glowOf, dynTube } = kit;
  const sfx = String(s);
  const c = { s };
  // knuckle group: moves up with bounce and turns about the steering axis
  c.kn = new THREE.Group();
  c.kn.matrixAutoUpdate = false;
  frontG.add(c.kn);
  const kn = c.kn;
  for (const n of ["knuckle.f", "steerarm", "bearing.f", "hat"]) item(n + sfx, kn);
  // strut sits 2 cm further inboard than the 2D model (x = 0.62) so it clears the tire; the lower spring seat
  // is raised above the tire top
  for (const n of ["strut.clamp", "strut.body", "strut.top"]) item(n + sfx, kn, { dx: -SDX * s });
  add(
    kn,
    turn(
      [SX * s, -2, 128],
      [0, 0, 1],
      [
        [0, 0],
        [0, 15],
        [2, 15],
        [2, 0],
      ],
      40,
    ),
    "spring",
    M("spring", 0x55595f, "metal"),
  );
  add(
    kn,
    turn(
      [SX * s, -2, 120],
      [0, 0, 1],
      [
        [0, 5.5],
        [8, 6.6],
        [8, 5.5],
      ],
      24,
    ),
    "strut",
    M("strut", 0x55595f),
  );
  // rotor: vented disc, 282 mm
  add(
    kn,
    turn(
      [135.8 * s, 0, HZ],
      [s, 0, 0],
      [
        [0, 10],
        [0, 28.2],
        [1.6, 28.2],
        [1.6, 27.2],
        [2.8, 27.2],
        [2.8, 28.2],
        [4.4, 28.2],
        [4.4, 10],
        [0, 10],
      ],
      56,
    ),
    "rotor",
  );
  add(
    kn,
    turn(
      [135.8 * s, 0, HZ],
      [s, 0, 0],
      [
        [1.6, 27.25],
        [2.8, 27.25],
      ],
      56,
    ),
    "rotor",
    mat(0x3a3c40, "metal", A + "rotor"),
    { shadow: false },
  );
  // wheel studs (5 on a 114.3 mm circle)
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    add(kn, cylX(s, 143, 149, Math.cos(a) * 11.43, HZ + Math.sin(a) * 11.43, 1.2, 12), "hub", CHROME("hub"), {
      shadow: false,
    });
  }
  // floating caliper behind the axle: piston housing inboard, bridge over the rotor edge, fingers outboard
  const CA = 160; // caliper centre angle (deg from +y toward +z): rear, slightly up
  c.cal = new THREE.Group();
  kn.add(c.cal);
  add(c.cal, slabX(s, sector(0, HZ, 17, 31.6, CA - 26, CA + 26), 128.4, 133.4), "caliper");
  add(c.cal, slabX(s, sector(0, HZ, 28.9, 32.4, CA - 26, CA + 26), 128.4, 144.4), "caliper");
  add(c.cal, slabX(s, sector(0, HZ, 21.2, 32.4, CA - 24, CA - 6), 142.9, 144.4), "caliper");
  add(c.cal, slabX(s, sector(0, HZ, 21.2, 32.4, CA + 6, CA + 24), 142.9, 144.4), "caliper");
  add(
    c.cal,
    turn(
      [128.2 * s, Math.cos((CA * Math.PI) / 180) * 24, HZ + Math.sin((CA * Math.PI) / 180) * 24],
      [-s, 0, 0],
      [
        [0, 0],
        [0, 6.2],
        [1.2, 6.2],
        [1.6, 5.4],
        [1.6, 0],
      ],
      28,
    ),
    "caliper",
  ); // piston bore cap
  for (const d of [CA - 31, CA + 31]) {
    const a = (d * Math.PI) / 180;
    add(
      c.cal,
      cylX(s, 127.4, 134.8, Math.cos(a) * 27.5, HZ + Math.sin(a) * 27.5, 2.0, 16),
      "caliper",
      CHROME("caliper"),
    );
  }
  const bleedA = ((CA - 14) * Math.PI) / 180;
  add(
    c.cal,
    turn(
      [130.6 * s, Math.cos(bleedA) * 32.4, HZ + Math.sin(bleedA) * 32.4],
      [0, Math.cos(bleedA), Math.sin(bleedA)],
      [
        [0, 0],
        [0, 0.9],
        [2.6, 0.9],
        [2.6, 0],
      ],
      10,
    ),
    "caliper",
    CHROME("caliper"),
  );
  // pads: outer pad rides with the caliper, inner pad on the piston
  const padShape = sector(0, HZ, 18.6, 27.9, CA - 21, CA + 21);
  c.padOut = new THREE.Group();
  c.cal.add(c.padOut);
  add(c.padOut, slabX(s, padShape, 140.7, 141.9), "pads", LINING("pads"));
  add(
    c.padOut,
    slabX(s, sector(0, HZ, 18.2, 28.3, CA - 22, CA + 22), 141.9, 142.9),
    "pads",
    M("pads", 0x8a8e93, "metal"),
  );
  c.padIn = new THREE.Group();
  kn.add(c.padIn);
  add(c.padIn, slabX(s, padShape, 134.1, 135.3), "pads", LINING("pads"));
  add(
    c.padIn,
    slabX(s, sector(0, HZ, 18.2, 28.3, CA - 22, CA + 22), 133.4, 134.1),
    "pads",
    M("pads", 0x8a8e93, "metal"),
  );
  // brake hose: caliper -> bracket on the strut (rides with the strut) -> body (dynamic)
  const banjo = [131 * s, Math.cos(bleedA + 0.25) * 31.8, HZ + Math.sin(bleedA + 0.25) * 31.8];
  item("hose.bracket", kn, { mirror: s < 0, dx: -SDX * s });
  const hb = [115.2 * s, -2, 108];
  add(
    kn,
    tube(smooth([banjo, [banjo[0], banjo[1] + 2, banjo[2] + 8], [124 * s, -12, 106], hb], 30), 1.2),
    "brake-hose",
  );
  c.hoseGlow1 = glowOf(
    kn,
    sweep(smooth([banjo, [banjo[0], banjo[1] + 2, banjo[2] + 8], [124 * s, -12, 106], hb], 30), 2.2, {
      radial: 8,
    }),
  );
  c.hoseFix = V(104 * s, -10, 126); // body bracket on the inner fender (hard line ends here)
  c.hoseB = V(...hb);
  c.hose = dynTube(frontG, "brake-hose", 1.2, null, true);
  // ABS sensor on the knuckle with its wire clipped up the strut, then to the body
  item("abs.sensor", kn, { mirror: s < 0 });
  add(
    kn,
    tube(
      smooth(
        [
          [126.5 * s, 12, 73],
          [123 * s, 12, 80],
          [123 * s, 6.5, 96],
          [122 * s, 4.6, 112],
        ],
        24,
      ),
      0.7,
      8,
    ),
    "abs-sensor",
  );
  c.absB = V(122 * s, 4.6, 112);
  c.absFix = V(100 * s, 12, 130);
  c.abs = dynTube(frontG, "abs-sensor", 0.7);
  // static (body side): strut rod, upper seat, top mount (the top mount sits 20 mm lower than in the 2D model
  // so it clears the hood skin)
  for (const n of ["strut.rod", "seat.up", "mount.top"])
    item(n + sfx, frontG, { dx: -SDX * s, dz: n === "mount.top" ? -4 : 0 });
  // coil spring around the strut (fixed at the top seat, squeezed from below)
  c.spring = add(frontG, tube(helixPts(0, 0, 12, -48, 0, 5, 1.6), 1.6, 10), "spring");
  c.spring.position.set(SX * s, -2, 178);
  c.springH = 48;
  // lower control arm pivots on the subframe (x = 64)
  c.armP = new THREE.Group();
  c.armP.position.set(64 * s, 0, 36);
  frontG.add(c.armP);
  const arm = new THREE.Group();
  arm.position.set(-64 * s, 0, -36);
  c.armP.add(arm);
  for (const n of ["arm.apex", "balljoint", "arm.front", "arm.rear"]) item(n + sfx, arm);
  add(
    arm,
    turn(
      [130 * s, 0, 38.5],
      [0, 0, 1],
      [
        [0, 0],
        [0, 3.6],
        [3, 3.2],
        [5, 2.2],
        [5, 0],
      ],
      18,
    ),
    "ball-joint",
    RUBBER("ball-joint"),
  );
  for (const y of [9, -18])
    add(
      arm,
      turn(
        [64 * s, y, 35.5],
        [0, 1, 0],
        [
          [-3, 0],
          [-3, 4.2],
          [3, 4.2],
          [3, 0],
        ],
        20,
      ),
      "lower-arm",
      RUBBER("lower-arm"),
    ); // bushings
  // CV axle with boots, pivots at the transmission
  c.axP = new THREE.Group();
  c.axP.position.set(22 * s, 4, 62);
  frontG.add(c.axP);
  const ax = new THREE.Group();
  ax.position.set(-22 * s, -4, -62);
  c.axP.add(ax);
  add(
    ax,
    turn(
      [22 * s, 4, 62],
      [s, 0, 0],
      [
        [0, 0],
        [0, 6.6],
        [6, 6.6],
        [6, 0],
      ],
      24,
    ),
    "cv-axle",
  );
  add(
    ax,
    turn(
      [28 * s, 4, 62],
      [s, 0, 0],
      [
        [0, 0],
        [0, 6.2],
        [2, 6.0],
        [3, 5.2],
        [4.5, 5.6],
        [6, 4.4],
        [7.5, 4.6],
        [9, 3.4],
        [11, 2.6],
        [11, 0],
      ],
      24,
    ),
    "cv-axle",
    RUBBER("cv-axle"),
  );
  add(ax, cylX(s, 38, 112, 4, 62, 2.4, 16), "cv-axle");
  add(
    ax,
    turn(
      [112 * s, 4, 62],
      [s, 0, 0],
      [
        [0, 0],
        [0, 2.6],
        [2, 3.4],
        [3.5, 4.6],
        [5, 4.4],
        [6.5, 5.6],
        [8, 5.2],
        [9, 6.2],
        [11, 6.4],
        [11, 0],
      ],
      24,
    ),
    "cv-axle",
    RUBBER("cv-axle"),
  );
  add(ax, cylX(s, 123, 127.5, 4, 62, 6.8, 24), "cv-axle");
  // tie rod (rebuilt every frame from the rack to the steering arm)
  c.tieIn = V(86 * s, -24, 51);
  c.tieOut = V(123.4 * s, -24, 51);
  c.tie = add(frontG, new THREE.CylinderGeometry(1.6, 1.6, 1, 14), "tie-rod");
  c.tieEnd = add(frontG, new THREE.SphereGeometry(2.6, 16, 10), "tie-rod", M("tie-rod", C.darksteel));
  c.tieBoot = add(frontG, new THREE.SphereGeometry(2.4, 14, 8), "tie-rod", RUBBER("tie-rod"));
  // sway bar end link: bar eye -> strut body (dynamic)
  c.linkLow = V(111 * s, 22, 51);
  c.linkTop = V(121.5 * s, 3.4, 104);
  c.link = dynTube(frontG, "sway-link", 1.3);
  c.linkBalls = [
    add(frontG, new THREE.SphereGeometry(2.3, 14, 8), "sway-link", RUBBER("sway-link")),
    add(frontG, new THREE.SphereGeometry(2.3, 14, 8), "sway-link", RUBBER("sway-link")),
  ];
  item("swaybar.eye" + sfx, frontG);
  // steering axis: lower ball joint -> strut top mount
  c.kpP = V(130 * s, 0, 36.4);
  c.kpA = V(SX * s, -2, KP_TOP)
    .sub(c.kpP)
    .normalize();
  return c;
}

// buildFrontCentre(kit): steering rack, assist motor, shaft; subframe, differential, front sway bar
export function buildFrontCentre(kit) {
  const { frontG, item } = kit;
  for (const n of [
    "rack",
    "rack.clamp-50",
    "rack.clamp46",
    "eps.motor",
    "pinion",
    "shaft",
    "column",
    "column.stay",
  ])
    item(n, frontG);
  for (const n of [
    "subframe.f",
    "subframe.f.post1",
    "subframe.f.post-1",
    "subframe.f.foot1",
    "subframe.f.foot-1",
    "diff",
    "diff.mount",
  ])
    item(n, frontG);
  for (const n of ["swaybar.f", "swaybar.clamp-44", "swaybar.clamp44"]) item(n, frontG);
}
