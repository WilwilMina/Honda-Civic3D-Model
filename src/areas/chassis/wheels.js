// Chassis area, wheels: the "tire" and "wheel" parts. Normally these are the exterior's own wheels
// (ctx.car.wheel), claimed for this area. If the car area provides none, a stand-in stack of the two removed
// wheels lying flat on the floor beside the car is used instead (shown only while the area is open). Car
// metres.
import * as THREE from "three";
import { A } from "./kit.js";
import { turn } from "./geometry.js";
import { box } from "../../lib/geom.js";

const TW = 0.195, // P195/65R15 tire: section width
  TR = 0.317, // outer radius
  RIM = 0.1905; // 15 in rim radius

// buildWheels(kit): returns { stack, usedCarWheels }
export function buildWheels(kit) {
  const { ctx, mat, M, worldG, add } = kit;
  // stand-in: the two removed wheels, stacked flat on the floor
  const stack = new THREE.Group();
  stack.position.set(1.4, -2.3, 0);
  stack.visible = false;
  worldG.add(stack);

  for (let i = 0; i < 2; i++) {
    const z0 = i * (TW + 0.002);
    add(
      stack,
      turn(
        [0, 0, z0],
        [0, 0, 1],
        [
          [0, RIM],
          [0.004, 0.25],
          [0.012, 0.296],
          [0.03, TR - 0.002],
          [0.045, TR],
          [TW - 0.045, TR],
          [TW - 0.03, TR - 0.002],
          [TW - 0.012, 0.296],
          [TW - 0.004, 0.25],
          [TW, RIM],
          [0, RIM],
        ],
        64,
      ),
      "tire",
    );
    for (let k = 0; k < 3; k++)
      add(
        stack,
        turn(
          [0, 0, z0],
          [0, 0, 1],
          [
            [0.05 + k * 0.035, TR],
            [0.05 + k * 0.035, TR + 0.0015],
            [0.062 + k * 0.035, TR + 0.0015],
            [0.062 + k * 0.035, TR],
          ],
          64,
        ),
        "tire",
        mat(0x141516, "rubber", A + "tire"),
        { shadow: false },
      );
    add(
      stack,
      turn(
        [0, 0, z0 + 0.012],
        [0, 0, 1],
        [
          [0, RIM - 0.004],
          [TW - 0.024, RIM - 0.004],
          [TW - 0.024, RIM - 0.012],
          [0, RIM - 0.012],
        ],
        48,
      ),
      "wheel",
      M("wheel", 0x7d8288, "metal"),
    );
    add(
      stack,
      turn(
        [0, 0, z0 + 0.06],
        [0, 0, 1],
        [
          [0, 0],
          [0, RIM - 0.008],
          [0.008, RIM - 0.008],
          [0.008, 0],
        ],
        48,
      ),
      "wheel",
      M("wheel", 0x7d8288, "metal"),
    );
  }
  // top wheel shows its silver 5-spoke cover
  const coverZ = TW * 2 + 0.002;
  add(
    stack,
    turn(
      [0, 0, coverZ - 0.004],
      [0, 0, 1],
      [
        [0, 0.03],
        [0, RIM + 0.002],
        [0.006, RIM - 0.004],
        [0.016, 0.16],
        [0.02, 0.06],
        [0.024, 0.03],
        [0, 0.03],
      ],
      64,
    ),
    "wheel",
  );
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    for (const off of [-0.11, 0.11]) {
      const g = box(
        [Math.cos(a + off) * 0.115, Math.sin(a + off) * 0.115, coverZ + 0.016],
        [
          [Math.cos(a + off), Math.sin(a + off), 0],
          [-Math.sin(a + off), Math.cos(a + off), 0],
          [0, 0, 1],
        ],
        [0.05, 0.007, 0.004],
      );
      add(stack, g, "wheel", M("wheel", 0x2c2e31, "plastic"), { shadow: false });
    }
  }
  add(
    stack,
    turn(
      [0, 0, coverZ + 0.016],
      [0, 0, 1],
      [
        [0, 0],
        [0, 0.03],
        [0.006, 0.026],
        [0.008, 0],
      ],
      32,
    ),
    "wheel",
    mat(0x9aa0a6, "chrome", A + "wheel"),
  );

  // The exterior's wheels carry the "tire" and "wheel" info in this area. They keep their goto (car view ->
  // here); only untagged meshes are claimed, so the car area's own part tags win if it adds them later.
  let usedCarWheels = false;
  for (const id of ["fl", "fr", "rl", "rr"]) {
    const w = ctx.car?.wheel?.(id);
    if (!w) continue;
    w.traverse((o) => {
      if (!o.isMesh || o.userData.part) return;
      const col = o.material?.color;
      const dark = col ? col.r + col.g + col.b < 0.45 : false;
      ctx.claim(o, A + (dark ? "tire" : "wheel"));
      usedCarWheels = true;
    });
  }
  if (usedCarWheels) worldG.remove(stack);
  return { stack, usedCarWheels };
}
