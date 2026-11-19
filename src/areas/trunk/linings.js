// Trunk area, linings: the carpeted side and rear linings, the wheel-house humps, the front ledge, the
// pressed-steel spare-tire well with the carpeted floor around its opening, and the hinged floor board (cargo
// floor lid) on top. Car metres; dimensions from kit.js.
import * as THREE from "three";
import { lathe, prism, box } from "../../lib/geom.js";
import { T, AX, CARPET, CARPET2, zcyl } from "./kit.js";

// buildLinings(kit, ctx, group): the fixed carpet, ledges and the spare well
export function buildLinings({ K, add }, ctx, group) {
  const { mat } = ctx;
  // front ledge in front of the floor board and side ledges
  add(
    group,
    box([0, (T.y0 + T.hingeY) / 2, T.floor - 0.01], AX, [T.x, (T.y0 - T.hingeY) / 2, 0.01]),
    CARPET2,
    "fabric",
    "lining",
  );
  for (const sx of [1, -1]) {
    // side lining (rear top corner cut back to follow the closed body's rear face so nothing shows outside)
    const zb0 = T.floor - 0.01,
      zt0 = T.floor + 0.35;
    add(
      group,
      prism(
        { o: [0, 0, 0], a: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] },
        [
          [T.y0, zb0],
          [T.y1, zb0],
          [T.y1 + 0.01, 0.655],
          [-2.165, 0.735],
          [-2.12, 0.815],
          [-2.085, zt0],
          [T.y0, zt0],
        ],
        sx * T.x - 0.008,
        sx * T.x + 0.008,
      ),
      CARPET,
      "fabric",
      "lining",
    );
    // wheel-house hump over the rear wheel arch (half-disc r 0.33 m about y -1.36, z 0.40), above the floor
    const hp = [];
    for (let i = 0; i <= 16; i++) {
      const a = Math.PI * (i / 16);
      const z = 0.4 + Math.sin(a) * 0.33;
      if (z >= T.floor - 0.01) hp.push([-1.36 + Math.cos(a) * 0.33, z]);
    }
    add(
      group,
      prism(
        { o: [0, 0, 0], a: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] },
        hp,
        sx > 0 ? T.x - 0.13 : -T.x,
        sx > 0 ? T.x : -T.x + 0.13,
      ),
      CARPET,
      "fabric",
      "lining",
    );
    add(
      group,
      box([sx * (T.x - 0.095), -1.8, T.floor - 0.005], AX, [0.1, 0.33, 0.005]),
      CARPET2,
      "fabric",
      "lining",
    );
  }
  // rear wall lining up to the sill
  add(
    group,
    box([0, T.y1, (T.floor + 0.665) / 2], AX, [T.x, 0.008, (0.665 - T.floor) / 2]),
    CARPET,
    "fabric",
    "lining",
  );
  // the well: a pressed steel tub under the floor board (open at the top, so both faces render)
  const prof = [
    [0, 0],
    [0, T.wellR - 0.06],
    [0.01, T.wellR - 0.035],
    [0.03, T.wellR - 0.015],
    [T.floor - 0.02 - T.wellZ, T.wellR],
    [T.floor - 0.02 - T.wellZ, T.wellR + 0.04],
  ];
  const well = lathe({ o: [0, T.wellY, T.wellZ], a: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] }, prof, 48);
  const wellMesh = new THREE.Mesh(well, mat(0x55595f, "metal", K("lining")));
  wellMesh.material.side = THREE.DoubleSide;
  wellMesh.userData.part = K("lining");
  wellMesh.receiveShadow = true;
  group.add(wellMesh);
  // carpeted floor around the well opening (under the floor lid)
  const fs = new THREE.Shape();
  fs.moveTo(-T.x, T.hingeY);
  fs.lineTo(T.x, T.hingeY);
  fs.lineTo(T.x, T.y1);
  fs.lineTo(-T.x, T.y1);
  fs.lineTo(-T.x, T.hingeY);
  const fh = new THREE.Path();
  fh.absarc(0, T.wellY, T.wellR + 0.035, 0, Math.PI * 2, true);
  fs.holes.push(fh);
  const fg = new THREE.ExtrudeGeometry(fs, { depth: 0.004, bevelEnabled: false, curveSegments: 48 });
  fg.translate(0, 0, T.floor - 0.03);
  add(group, fg, CARPET2, "fabric", "lining");
  // felt mat in the bottom of the well
  add(group, zcyl([0, T.wellY, T.wellZ + 0.001], T.wellR - 0.07, 0.004, 40), CARPET2, "fabric", "lining");
}

// buildFloorBoard(kit, ctx): the floor board group, pivoting on its front edge (scene.js sets rotation.x)
export function buildFloorBoard({ add }, ctx) {
  const { C } = ctx;
  const board = new THREE.Group();
  board.name = "floor-board";
  board.position.set(0, T.hingeY, T.floor);
  const len = T.hingeY - T.y1 - 0.008;
  add(
    board,
    box([0, -len / 2, -0.008], AX, [T.x - 0.205, len / 2, 0.008]),
    CARPET,
    "fabric",
    "floor-board",
    true,
  );
  // fibreboard edge + underside
  add(
    board,
    box([0, -len / 2, -0.0175], AX, [T.x - 0.21, len / 2 - 0.004, 0.0015]),
    0x5e574b,
    "plastic",
    "floor-board",
  );
  // pull strap at the rear edge
  add(board, box([0, -len + 0.03, 0.001], AX, [0.05, 0.012, 0.002]), C.black, "fabric", "floor-board");
  return board;
}
