// Trunk area, stowage: the compact spare lying face up in the well, its hold-down rod and wing nut, and the
// foam tool tray in the spare's centre with the folded scissor jack and the lug wrench + jack bar. Each piece
// is its own group so scene.js can lift it out onto the floor; car metres, dimensions from kit.js.
import * as THREE from "three";
import { lathe, box, sweep } from "../../lib/geom.js";
import { T, SPARE, AX, zcyl } from "./kit.js";

// buildStowage(kit, ctx, group): adds the pieces to group and returns them with their home positions
export function buildStowage({ add }, ctx, group) {
  const { C } = ctx;
  // compact spare: lies flat in the well, face up
  const spare = new THREE.Group();
  spare.name = "spare";
  const spareHome = new THREE.Vector3(0, T.wellY, T.wellZ + 0.006 + SPARE.W / 2);
  spare.position.copy(spareHome);
  {
    const { R, W, rim } = SPARE;
    const h = W / 2;
    // tire cross-section (s along the axle, r out from the centre)
    const tire = [
      [-h + 0.012, rim],
      [-h + 0.004, rim + 0.02],
      [-h, rim + 0.05],
      [-h + 0.004, R - 0.03],
      [-h + 0.018, R - 0.008],
      [-h + 0.04, R],
      [h - 0.04, R],
      [h - 0.018, R - 0.008],
      [h - 0.004, R - 0.03],
      [h, rim + 0.05],
      [h - 0.004, rim + 0.02],
      [h - 0.012, rim],
    ];
    add(
      spare,
      lathe({ o: [0, 0, 0], a: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] }, tire, 56),
      C.rubber,
      "rubber",
      "spare-tire",
      true,
    );
    // tread grooves
    for (const s of [-0.03, 0, 0.03])
      add(
        spare,
        lathe(
          { o: [0, 0, s - 0.003], a: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
          [
            [0, R + 0.0005],
            [0.006, R + 0.0005],
          ],
          56,
        ),
        0x141516,
        "rubber",
        "spare-tire",
      );
    // steel wheel: rim barrel + dished centre disc with 5 lug holes
    add(
      spare,
      lathe(
        { o: [0, 0, 0], a: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
        [
          [-h + 0.008, rim + 0.012],
          [-h + 0.012, rim],
          [h - 0.012, rim],
          [h - 0.008, rim + 0.012],
        ],
        56,
      ),
      0x4a4e54,
      "metal",
      "spare-tire",
    );
    add(
      spare,
      lathe(
        { o: [0, 0, 0], a: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
        [
          [h - 0.03, rim],
          [h - 0.03, 0.12],
          [h - 0.012, 0.1],
          [h - 0.012, 0.045],
          [h - 0.02, 0.032],
          [h - 0.02, 0],
        ],
        56,
      ),
      0x5a5e64,
      "metal",
      "spare-tire",
    );
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      add(
        spare,
        zcyl([Math.cos(a) * 0.057, Math.sin(a) * 0.057, h - 0.0125], 0.008, 0.002, 10),
        0x26282b,
        "metal",
        "spare-tire",
      );
    }
    // a few ventilation holes in the disc
    for (let i = 0; i < 5; i++) {
      const a = ((i + 0.5) / 5) * Math.PI * 2;
      add(
        spare,
        zcyl([Math.cos(a) * 0.15, Math.sin(a) * 0.15, h - 0.0295], 0.018, 0.002, 14),
        0x26282b,
        "metal",
        "spare-tire",
      );
    }
  }

  // hold-down: threaded rod from the well floor up through the wheel's centre hole, wing nut on top
  const holdDown = new THREE.Group();
  add(holdDown, zcyl([0, T.wellY, T.wellZ], 0.006, SPARE.W + 0.04, 10), 0xa3a8ae, "metal", "hold-down");
  {
    const top = T.wellZ + 0.006 + SPARE.W - 0.01;
    add(holdDown, zcyl([0, T.wellY, top], 0.03, 0.012, 20), C.black, "plastic", "hold-down");
    add(holdDown, box([0, T.wellY, top + 0.028], AX, [0.06, 0.009, 0.02]), C.black, "plastic", "hold-down");
    add(holdDown, zcyl([0, T.wellY, top + 0.012], 0.016, 0.03, 14), C.black, "plastic", "hold-down");
  }

  // foam tool tray in the spare's centre; the jack and lug wrench lie on it
  const tools = new THREE.Group();
  tools.name = "tools";
  {
    const z0 = spareHome.z + SPARE.W / 2 + 0.003;
    // foam tool tray sitting in the spare's dish
    add(tools, zcyl([0, T.wellY, z0 - 0.06], 0.165, 0.07, 40), 0x2c2f33, "plastic", "tool-tray");
  }
  // scissor jack, folded flat
  const jack = new THREE.Group();
  jack.name = "jack";
  {
    const L = 0.34,
      Hc = 0.075; // folded length / height
    const steel = 0x8f959c;
    add(jack, box([0, 0, 0.006], AX, [0.06, 0.05, 0.006]), 0x4a4e54, "metal", "jack", true); // base
    add(jack, box([0, 0, Hc - 0.004], AX, [0.045, 0.03, 0.008]), 0x4a4e54, "metal", "jack"); // saddle
    // saddle groove for the pinch weld
    add(jack, box([0, 0, Hc + 0.006], AX, [0.035, 0.012, 0.004]), 0x2a2c30, "metal", "jack");
    const mid = Hc / 2;
    for (const sy of [-0.022, 0.022])
      for (const [x0, z0, x1, z1] of [
        [-0.03, 0.012, -L / 2 + 0.02, mid],
        [0.03, 0.012, L / 2 - 0.035, mid],
        [-0.03, Hc - 0.01, -L / 2 + 0.02, mid],
        [0.03, Hc - 0.01, L / 2 - 0.035, mid],
      ]) {
        add(
          jack,
          sweep(
            [
              [x0, sy, z0],
              [x1, sy, z1],
            ],
            0.006,
            { radial: 6 },
          ),
          steel,
          "metal",
          "jack",
        );
      }
    add(
      jack,
      sweep(
        [
          [-L / 2 + 0.01, 0, mid],
          [L / 2 - 0.01, 0, mid],
        ],
        0.0055,
        { radial: 8 },
      ),
      0xb5bac0,
      "metal",
      "jack",
    ); // screw
    add(jack, box([-L / 2 + 0.02, 0, mid], AX, [0.012, 0.03, 0.012]), steel, "metal", "jack");
    add(jack, box([L / 2 - 0.035, 0, mid], AX, [0.012, 0.03, 0.012]), steel, "metal", "jack");
    // eye where the wrench hooks in to turn the screw
    add(
      jack,
      lathe(
        { o: [L / 2 - 0.01, 0, mid], a: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1] },
        [
          [-0.004, 0.006],
          [-0.004, 0.013],
          [0.004, 0.013],
          [0.004, 0.006],
          [-0.004, 0.006],
        ],
        16,
      ),
      steel,
      "metal",
      "jack",
    );
  }
  const jackHome = new THREE.Vector3(0, T.wellY + 0.035, spareHome.z + SPARE.W / 2 + 0.003);
  jack.position.copy(jackHome);
  // lug wrench: bent bar, 19 mm-style socket on one end, flat tip on the other
  const wrench = new THREE.Group();
  wrench.name = "lug-wrench";
  {
    const z = 0.01;
    add(
      wrench,
      sweep(
        [
          [-0.15, 0, z],
          [0.11, 0, z],
          [0.135, 0, z + 0.012],
          [0.15, 0, z + 0.03],
        ],
        0.0065,
        { radial: 8 },
      ),
      0x6d7278,
      "metal",
      "lug-wrench",
      true,
    );
    add(
      wrench,
      lathe(
        { o: [0.15, 0, z + 0.02], a: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
        [
          [0, 0.007],
          [0, 0.0135],
          [0.04, 0.0135],
          [0.04, 0.009],
        ],
        6,
      ),
      0x9aa0a6,
      "metal",
      "lug-wrench",
    );
    add(wrench, box([-0.158, 0, z], AX, [0.012, 0.009, 0.002]), 0x6d7278, "metal", "lug-wrench");
    // jack bar (hooks into the jack's eye, turned with the wrench)
    add(
      wrench,
      sweep(
        [
          [-0.13, 0.03, z],
          [0.1, 0.03, z],
          [0.115, 0.03, z + 0.01],
          [0.13, 0.045, z + 0.01],
        ],
        0.005,
        { radial: 8 },
      ),
      0x8f959c,
      "metal",
      "lug-wrench",
    );
  }
  const wrenchHome = new THREE.Vector3(0, T.wellY - 0.06, spareHome.z + SPARE.W / 2 + 0.003);
  wrench.position.copy(wrenchHome);
  group.add(spare, holdDown, tools, jack, wrench);
  return { spare, spareHome, holdDown, tools, jack, jackHome, wrench, wrenchHome };
}
