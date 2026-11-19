// Chassis area, REAR corners: drum brakes (drum, shoes, wheel cylinder, self-adjuster, return springs,
// parking-brake lever), the hub and knuckle, the multi-link arms, trailing arm, shock and coil spring, and
// the rear sway bar. Kit units in the rear group (see kit.js). The driver-side drum slides off when the area
// opens (animations.js).
import * as THREE from "three";
import { RY, HZ, A } from "./kit.js";
import { turn, cylX, tube, smooth, sector, slabX, helixPts } from "./geometry.js";
import { box } from "../../lib/geom.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// 200 mm drum (kit units): inner / outer radius, open edge x, closed outer face x
const DR = { in: 20, out: 22.4, x0: 135.0, face1: 143.2 };
// drum shell for side s: open toward the car, closed face outboard. Its origin is the face centre so it can
// be slid off the hub and tipped flat onto the floor (setDrum in animations.js).
function drumGeom(s) {
  return turn(
    [0, 0, 0],
    [-s, 0, 0],
    [
      [0, 6.8],
      [0, 20.5],
      [0.5, 21.9],
      [1.4, 22.6],
      [2.4, DR.out],
      [DR.face1 - DR.x0 - 0.2, DR.out],
      [DR.face1 - DR.x0, DR.out + 0.9],
      [DR.face1 - DR.x0 + 0.6, DR.out + 0.9],
      [DR.face1 - DR.x0 + 0.6, DR.in],
      [1.2, DR.in],
      [1.2, 6.8],
      [0, 6.8],
    ],
    56,
  );
}
// buildRearCorner(kit, s): one rear corner (s = 1 driver side, -1 passenger side). Returns the handles the
// animations move: c.kn (knuckle group), c.shoes, c.drum / c.drumHome, the arm pivot groups and the spring.
export function buildRearCorner(kit, s) {
  const { mat, M, RUBBER, CHROME, LINING, rearG, add, item } = kit;
  const sfx = String(s);
  const c = { s };
  c.kn = new THREE.Group();
  rearG.add(c.kn);
  const kn = c.kn;
  for (const n of ["rhub", "rshock.eye", "rshock", "rswaylink"]) item(n + sfx, kn);
  add(
    kn,
    box(
      [128.25 * s, RY + 6.25, 66],
      [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      [3.25, 14.25, 30],
    ),
    "rear-knuckle",
  );
  add(kn, cylX(s, 131.5, 133.7, RY, HZ, 11, 28), "rear-knuckle");
  // backing plate, hub flange, studs
  add(
    kn,
    turn(
      [133.6 * s, RY, HZ],
      [s, 0, 0],
      [
        [0, 0],
        [0, 23.4],
        [0.8, 23.6],
        [1.4, 22.2],
        [1.4, 0],
      ],
      48,
    ),
    "shoes",
    M("shoes", 0x4b4f55, "metal"),
  );
  add(kn, cylX(s, 140.4, 142, RY, HZ, 12.5, 32), "hub-rear");
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    add(
      kn,
      cylX(s, 142, 148.2, RY + Math.cos(a) * 11.43, HZ + Math.sin(a) * 11.43, 1.2, 12),
      "hub-rear",
      CHROME("hub-rear"),
      { shadow: false },
    );
  }
  // shoes: lining + steel rim + web, front shoe and rear shoe
  c.shoes = [];
  for (const [d0, d1, dir] of [
    [-64, 64, 1],
    [116, 244, -1],
  ]) {
    const g = new THREE.Group();
    kn.add(g);
    add(g, slabX(s, sector(RY, HZ, 18.4, 19.6, d0 + 3, d1 - 3, 24), 136.2, 140.8), "shoes", LINING("shoes"));
    add(g, slabX(s, sector(RY, HZ, 17.7, 18.4, d0, d1, 24), 136.0, 141.0), "shoes");
    add(g, slabX(s, sector(RY, HZ, 12.5, 17.7, d0 + 2, d1 - 2, 24), 138.2, 138.8), "shoes");
    const mid = ((d0 + d1) / 2) * (Math.PI / 180);
    add(
      g,
      cylX(s, 136.2, 139.6, RY + Math.cos(mid) * 14.5, HZ + Math.sin(mid) * 14.5, 1.1, 12),
      "shoes",
      CHROME("shoes"),
      { shadow: false },
    ); // hold-down pin
    g.userData.dir = dir;
    c.shoes.push(g);
  }
  // parking-brake lever on the rear shoe
  add(
    c.shoes[1],
    slabX(
      s,
      [
        [RY - 6, HZ + 15],
        [RY - 4.5, HZ + 15.5],
        [RY - 12.5, HZ - 11],
        [RY - 14, HZ - 11.5],
      ],
      137.4,
      138.0,
    ),
    "parking-brake",
    M("parking-brake", 0x5e6268, "metal"),
  );
  // wheel cylinder at the top between the shoe ends
  add(
    kn,
    turn(
      [138.5 * s, RY - 7.2, HZ + 16.6],
      [0, 1, 0],
      [
        [0, 0],
        [0, 1.9],
        [14.4, 1.9],
        [14.4, 0],
      ],
      18,
    ),
    "wheel-cylinder",
  );
  add(
    kn,
    box(
      [136.8 * s, RY, HZ + 17],
      [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      [2.2, 3.6, 2.4],
    ),
    "wheel-cylinder",
  );
  for (const y of [-7.6, 7.6])
    add(
      kn,
      turn(
        [138.5 * s, RY + y, HZ + 16.6],
        [0, Math.sign(y), 0],
        [
          [0, 0],
          [0, 2.1],
          [1.0, 2.1],
          [1.0, 0],
        ],
        14,
      ),
      "wheel-cylinder",
      RUBBER("wheel-cylinder"),
    );
  add(
    kn,
    turn(
      [137 * s, RY + 2.4, HZ + 19.2],
      [0, 0.3, 1],
      [
        [0, 0],
        [0, 0.7],
        [2.6, 0.7],
        [2.6, 0],
      ],
      8,
    ),
    "wheel-cylinder",
    CHROME("wheel-cylinder"),
  );
  // self-adjuster strut with its star wheel, anchor block at the bottom, return springs
  add(
    kn,
    turn(
      [138.5 * s, RY - 13, HZ + 10],
      [0, 1, 0],
      [
        [0, 0],
        [0, 0.8],
        [26, 0.8],
        [26, 0],
      ],
      10,
    ),
    "shoes",
    CHROME("shoes"),
  );
  add(
    kn,
    turn(
      [138.5 * s, RY + 2, HZ + 10],
      [0, 1, 0],
      [
        [0, 0],
        [0, 2.2],
        [1.4, 2.2],
        [1.4, 0],
      ],
      18,
    ),
    "shoes",
    CHROME("shoes"),
  );
  add(
    kn,
    box(
      [138.4 * s, RY, HZ - 19],
      [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      [2.2, 4.2, 2.8],
    ),
    "shoes",
    M("shoes", 0x6b7076),
  );
  for (const [z, w] of [
    [HZ + 13.2, 9],
    [HZ - 14.5, 8],
  ]) {
    const pts = [];
    for (let i = 0; i <= 96; i++) {
      const t = i / 96,
        a = t * Math.PI * 2 * 9;
      pts.push([139.3 * s + Math.cos(a) * 0.8, RY - w + 2 * w * t, z + Math.sin(a) * 0.8]);
    }
    add(kn, tube(pts, 0.28, 6), "shoes", mat(0x3d7fb8, "metal", A + "shoes"), { shadow: false });
  }
  // ABS sensor at the back of the knuckle
  add(
    kn,
    box(
      [130 * s, RY + 10, HZ - 14],
      [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      [2.4, 2, 3],
    ),
    "abs-sensor",
  );
  add(
    kn,
    tube(
      smooth(
        [
          [128 * s, RY + 10, HZ - 14],
          [122 * s, RY + 14, HZ - 6],
          [118 * s, RY + 20, HZ + 20],
          [116 * s, RY + 22, 96],
        ],
        20,
      ),
      0.7,
      8,
    ),
    "abs-sensor",
  );
  // the drum itself (driver-rear one slides off when the area opens)
  c.drum = new THREE.Group();
  add(c.drum, drumGeom(s), "drum");
  for (let i = 0; i < 2; i++)
    add(
      c.drum,
      turn(
        [0, 0, 0],
        [-s, 0, 0],
        [
          [3 + i * 2.2, DR.out],
          [3 + i * 2.2, DR.out + 0.6],
          [4 + i * 2.2, DR.out + 0.6],
          [4 + i * 2.2, DR.out],
        ],
        56,
      ),
      "drum",
    ); // cooling ribs
  c.drumHome = V(DR.face1 * s, RY, HZ);
  c.drum.position.copy(c.drumHome);
  rearG.add(c.drum);
  // body-side (static) pieces
  for (const n of ["rshock.rod", "rswaybar.eye", "rseat.bracket", "trailing.bracket"]) item(n + sfx, rearG);
  // spring perch: the rear spring sits low, near the wheel (where exactly is simplified; Honda lists spring
  // and shock separately)
  add(
    kn,
    tube(
      [
        [126 * s, RY + 2, 41],
        [112 * s, RY + 2, 42],
        [94 * s, RY + 2, 43],
      ],
      2.6,
      12,
    ),
    "trailing-arm",
  );
  item("rseat" + sfx, kn);
  c.upP = new THREE.Group();
  c.upP.position.set(76 * s, RY + 16, 93);
  rearG.add(c.upP);
  const up = new THREE.Group();
  up.position.set(-76 * s, -RY - 16, -93);
  c.upP.add(up);
  item("rarm.up" + sfx, up);
  c.trP = new THREE.Group();
  c.trP.position.set(76 * s, RY + 60, 84);
  rearG.add(c.trP);
  const tr = new THREE.Group();
  tr.position.set(-76 * s, -RY - 60, -84);
  c.trP.add(tr);
  item("trailing" + sfx, tr);
  add(
    tr,
    turn(
      [76 * s, RY + 60, 84],
      [s, 0, 0],
      [
        [-3, 0],
        [-3, 4.4],
        [3, 4.4],
        [3, 0],
      ],
      20,
    ),
    "trailing-arm",
    RUBBER("trailing-arm"),
  );
  // rear coil spring between the lower arm and the body
  c.spring = add(rearG, tube(helixPts(0, 0, 9, -46.6, 0, 5, 1.3), 1.3, 10), "rear-spring");
  c.spring.position.set(102 * s, RY + 2, 92);
  c.springH = 46.6;
  return c;
}

// buildRearSwayBar(kit): the rear anti-roll bar and its two body clamps
export function buildRearSwayBar(kit) {
  for (const n of ["swaybar.r", "rswaybar.clamp-40", "rswaybar.clamp40"]) kit.item(n, kit.rearG);
}
