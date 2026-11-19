// Trunk area, opening hardware: the rubber seal around the trunk opening, the latch striker on the rear sill,
// the taillight access flaps in the side linings, and the emergency trunk release on the inside of the lid.
// Positions are fitted to the exterior's lid surface (see the release below); car metres.
import * as THREE from "three";
import { box, sweep } from "../../lib/geom.js";
import { T, AX } from "./kit.js";

// buildOpening(kit, ctx, group): returns openOnly, the meshes that sit right under the closed lid skin and
// must be hidden while the lid is shut (scene.js toggles them)
export function buildOpening({ add }, ctx, group) {
  const { C } = ctx;
  const openOnly = [];
  // rubber weatherstrip on the body flange around the opening, fitted ~15 mm inside the exterior's closed lid
  // (lid: deck z ≈ 1.09 at y −1.84, ducktail lip y ≈ −2.12, face down to its bottom edge z ≈ 0.77 at y ≈
  // −2.155). The loop runs across the front edge, down both sides and across the sill.
  const yF = -1.875,
    yR = -2.13,
    zF = 1.035,
    xs = 0.64,
    sill = 0.775;
  const loop = [
    [-xs, yF, zF],
    [xs, yF, zF],
    [xs, -1.98, zF - 0.01],
    [xs - 0.01, -2.09, 0.99],
    [xs - 0.03, yR, 0.88],
    [xs - 0.05, yR, sill],
    [-xs + 0.05, yR, sill],
    [-xs + 0.03, yR, 0.88],
    [-xs + 0.01, -2.09, 0.99],
    [-xs, -1.98, zF - 0.01],
  ];
  const pts = new THREE.CatmullRomCurve3(
    loop.map((p) => new THREE.Vector3(...p)),
    true,
    "centripetal",
    0.1,
  )
    .getPoints(120)
    .map((v) => [v.x, v.y, v.z]);
  openOnly.push(
    add(group, sweep(pts, 0.008, { radial: 10, closed: true }), 0x18191b, "rubber", "trunk-seal"),
  );
  // latch striker on the rear sill
  openOnly.push(
    add(group, box([0, yR + 0.004, sill - 0.015], AX, [0.035, 0.012, 0.01]), 0x2a2c30, "metal", "striker"),
  );
  openOnly.push(
    add(
      group,
      sweep(
        [
          [-0.012, yR + 0.005, sill - 0.008],
          [-0.012, yR + 0.005, sill + 0.02],
          [0.012, yR + 0.005, sill + 0.02],
          [0.012, yR + 0.005, sill - 0.008],
        ],
        0.004,
        { radial: 8 },
      ),
      0xb5bac0,
      "chrome",
      "striker",
    ),
  );
  // taillight access: removable flaps in the side linings behind the outer (quarter-panel) taillights
  for (const sx of [1, -1]) {
    openOnly.push(
      add(
        group,
        box([sx * (T.x - 0.01), -2.03, 0.86], AX, [0.004, 0.06, 0.05]),
        0x4a4e55,
        "fabric",
        "taillight-access",
      ),
    );
    openOnly.push(
      add(
        group,
        box([sx * (T.x - 0.016), -2.03, 0.895], AX, [0.004, 0.018, 0.007]),
        C.black,
        "plastic",
        "taillight-access",
      ),
    );
  }

  // Emergency trunk opener: a slide lever on the inside of the lid near the latch. It hangs on the exterior's
  // lid group ("trunk-lid") so it swings with the lid; without one it stays in our group.
  const release = new THREE.Group();
  // Where the lid's outer skin is, with the lid closed: ctx.car.surfacePoint(y, U) gives the body surface
  // point [x, y, z] at station y, and U = 4 is the top centre line, which on the lid's rear face runs down
  // and back. Bisect y over -2.29..-2.0 for the point where that centre line is at z = 0.79, then mount the
  // release 30 mm in front of it, so it stays inside the lid behind the 17 mm-deep plate recess. Fallback
  // without the car API: y = -2.155.
  let yS = -2.155;
  const sp = ctx.car?.surfacePoint;
  if (sp) {
    let a = -2.29,
      b = -2.0;
    for (let k = 0; k < 40; k++) {
      const m = (a + b) / 2;
      if (sp(m, 4)[2] > 0.79) b = m;
      else a = m;
    }
    yS = (a + b) / 2;
  }
  const p = [0, yS + 0.03, 0.79];
  add(
    release,
    box([p[0], p[1] + 0.015, p[2] + 0.02], AX, [0.035, 0.012, 0.025]),
    0x2a2c30,
    "plastic",
    "trunk-release",
  ); // latch cover
  add(
    release,
    box([p[0] + 0.02, p[1] + 0.03, p[2] - 0.005], AX, [0.012, 0.006, 0.02]),
    0xd8d9d4,
    "plastic",
    "trunk-release",
  ); // slide lever
  add(
    release,
    box([p[0] - 0.012, p[1] + 0.028, p[2] - 0.005], AX, [0.014, 0.002, 0.003]),
    0xe8742a,
    "plastic",
    "trunk-release",
  ); // arrow mark

  const lid = ctx.carRoot.getObjectByName("trunk-lid");
  if (lid) {
    const holder = new THREE.Group();
    holder.position.copy(lid.position).multiplyScalar(-1); // undo the lid pivot: our coordinates are car coordinates
    holder.add(release);
    lid.add(holder);
  } else group.add(release);
  return openOnly;
}
