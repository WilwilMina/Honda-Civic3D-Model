// Chassis area, brake lines and parking brake: the steel hard lines from the ABS modulator under the hood to
// each wheel, and the parking-brake cable from the lever between the front seats to both rear drums. These
// cross the wheelbase, so they are drawn at real length in car metres (the squeezed 2D model in shapes.json
// would make them too short; see kit.js).
import { K, FRONT_AXLE_Y } from "./kit.js";
import { tube, smooth } from "./geometry.js";
import { box, sweep } from "../../lib/geom.js";

// front-group kit point -> car frame (metres), for the front hoses' body brackets
const fk = (p) => [p.x * K, p.y * K + FRONT_AXLE_Y, p.z * K];

// buildBrakeLines(kit, FL, FR): hard lines to all four wheels and the parking-brake cables
// (FL/FR are the front corners from front-corner.js; the front lines end at their hose brackets)
export function buildBrakeLines(kit, FL, FR) {
  const { M, worldG, add, glowOf } = kit;
  const lineMat = M("brake-lines");
  // one hard line (radius 2.4 mm) with its pressure-glow shell
  function line(pts, r = 0.0024) {
    const sp = smooth(pts, 90);
    add(worldG, tube(sp, r, 8), "brake-lines", lineMat, { shadow: false });
    glowOf(worldG, sweep(sp, r * 2.2, { radial: 8 }));
  }
  // ABS modulator (under the hood, driver side, beside the master cylinder) -> each wheel
  const absOut = [0.47, 1.4, 0.455];
  const flB = fk(FL.hoseFix),
    frB = fk(FR.hoseFix);
  line([absOut, [0.49, 1.39, 0.42], [0.53, 1.36, 0.44], [0.535, 1.32, 0.56], flB]);
  line([
    [0.455, 1.41, 0.455],
    [0.43, 1.36, 0.4],
    [0.3, 1.1, 0.4],
    [-0.3, 1.08, 0.4],
    [-0.47, 1.18, 0.45],
    [-0.53, 1.3, 0.55],
    frB,
  ]);
  // rear lines run under the floor to each wheel cylinder inlet (top of the drum backing plate)
  const wcIn = (s) => [0.678 * s, -1.335, 0.315 + 0.084];
  for (const [s, dx] of [
    [1, 0.0],
    [-1, 0.012],
  ]) {
    line([
      [0.465 + dx, 1.405, 0.455],
      [0.5 + dx, 1.3, 0.36],
      [0.52 + dx, 1.05, 0.24],
      [0.5 + dx, 0.85, 0.195],
      [0.48 + dx, 0.0, 0.19],
      [0.47 + dx, -0.9, 0.19],
      [0.45 + dx, -1.05, 0.21],
      ...(s > 0
        ? [[0.55, -1.16, 0.3], [0.64, -1.25, 0.42], [0.665, -1.31, 0.41], wcIn(1)]
        : [
            [0.3, -1.09, 0.22],
            [-0.4, -1.09, 0.22],
            [-0.55, -1.16, 0.3],
            [-0.64, -1.25, 0.42],
            [-0.665, -1.31, 0.41],
            wcIn(-1),
          ]),
    ]);
  }
  // parking brake: cable from the lever between the front seats to an equalizer, then one cable to each drum
  const pb = M("parking-brake");
  add(
    worldG,
    tube(
      smooth(
        [
          [0, -0.12, 0.36],
          [0, -0.16, 0.26],
          [0, -0.26, 0.195],
          [0, -0.34, 0.185],
        ],
        20,
      ),
      0.003,
      8,
    ),
    "parking-brake",
    pb,
    { shadow: false },
  );
  add(
    worldG,
    box(
      [0, -0.36, 0.185],
      [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      [0.03, 0.02, 0.01],
    ),
    "parking-brake",
    M("parking-brake", 0x777c82, "metal"),
  );
  for (const s of [1, -1]) {
    add(
      worldG,
      tube(
        smooth(
          [
            [0.025 * s, -0.375, 0.185],
            [0.18 * s, -0.55, 0.19],
            [0.4 * s, -0.86, 0.195],
            [0.55 * s, -1.06, 0.21],
            [0.65 * s, -1.22, 0.24],
            [0.675 * s, -1.37, 0.25],
          ],
          60,
        ),
        0.0035,
        8,
      ),
      "parking-brake",
      pb,
      { shadow: false },
    );
  }
}
