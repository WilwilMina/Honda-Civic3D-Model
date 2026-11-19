// Electrical details at the driver-side front corner, rebuilt by hand in kit units (see base-model.js): battery
// posts, the red + boot and black − clamp, the battery's top and front labels, and the ECM connector strip.
// The battery case, fuse box, ECM and cables themselves come from shapes.json (cable routes in base-model.js).
import { lathe, fixWinding } from "../../lib/geom.js";
import { frame, alignedBox } from "./geometry.js";

// Battery post positions (kit units): + toward the engine, − toward the fender (Paul's Travel Pictures battery
// guide, cited in docs/research/engine.md). The cable routes in base-model.js start from these.
export const BATTERY_POS_POST = [111, 24, 114];
export const BATTERY_NEG_POST = [125, 24, 114];

// Builds the battery terminal details and the ECM connector strip. b: the shared build context from scene.js.
export function buildElectrical({ mat, C, P, add, kit }) {
  const post = mat(0x8c8f93, "metal", P("battery"));
  for (const [x, y] of [BATTERY_POS_POST, BATTERY_NEG_POST])
    add(
      fixWinding(
        lathe(
          frame([x, y, 114], [0, 0, 1], [1, 0, 0], [0, 1, 0]),
          [
            [0, 0],
            [0, 2.2],
            [3, 1.9],
            [3, 0],
          ],
          18,
        ),
      ),
      post,
      "battery",
    );
  // red boot over the + terminal (pos-cable), black clamp on − (ground-cable)
  add(
    fixWinding(
      lathe(
        frame(BATTERY_POS_POST, [0, 0, 1], [1, 0, 0], [0, 1, 0]),
        [
          [0, 0],
          [0, 3.6],
          [2.4, 3.6],
          [4.2, 2.6],
          [5, 1.2],
          [5.2, 0],
        ],
        24,
      ),
    ),
    mat(C.red, "plastic", P("pos-cable")),
    "pos-cable",
    kit,
    { name: "battery.pos" },
  );
  const [nx, ny] = BATTERY_NEG_POST;
  add(
    alignedBox([nx, ny, 116], [2.8, 2.8, 2]),
    mat(0x2b2d31, "metal", P("ground-cable")),
    "ground-cable",
    kit,
    {
      name: "battery.neg",
    },
  );
  add(alignedBox([nx, ny, 118.4], [1.2, 1.2, 0.6]), mat(C.steel, "metal", P("ground-cable")), "ground-cable");
  // vent caps / label band on top and a label on the front face
  add(alignedBox([118, 47, 114.15], [9, 13, 0.15]), mat(0x2c2e33, "plastic", P("battery")), "battery");
  add(alignedBox([118, 64.1, 96], [10, 0.12, 9]), mat(0xe9e7e0, "plastic", P("battery")), "battery");
  add(alignedBox([118, 64.2, 99], [10, 0.12, 2.2]), mat(0x2f6bd0, "plastic", P("battery")), "battery");

  // ECM connector strip on top of the computer
  add(alignedBox([44, -9, 122.8], [9, 2.4, 0.9]), mat(0x2a2c30, "plastic", P("ecm")), "ecm");
}
