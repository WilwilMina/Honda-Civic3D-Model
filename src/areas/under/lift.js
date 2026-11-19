// The two-post garage lift shown while the "under" area is open: two posts with safety-lock ladders, an
// overhead beam, and on each post a carriage with two swing arms whose pads meet the car's jacking points.
// It stands on the garage floor, so it is added to ctx.scene (world frame, not the mirrored car root) and
// starts hidden. Called from scene.js, which raises the car and swings the arms through sync().
import { box } from "../../lib/geom.js";
import { SILL_X, SILL_Z, JACK_Y, AXES } from "./kit.js";

const POST_X = 1.32, // posts stand this far either side of the car's centre line
  POST_Y = 0.0; // ... level with the middle of the wheelbase

// Build the lift. Returns { lift, sync(armSwing) }; armSwing 0 = arms parked along the car, 1 = under the jack points.
export function buildLift(ctx, kit) {
  const { THREE, mat, C } = ctx;
  const { cyl } = kit;
  const lift = new THREE.Group();
  lift.name = "two-post-lift";
  lift.visible = false;
  ctx.scene.add(lift);
  const LM = {
    post: mat(0x3d6fb0, "paint"),
    dark: mat(0x2b2e33, "metal"),
    steel: mat(0x9ea3a9, "metal"),
    pad: mat(0x1e1f22, "rubber"),
    yellow: mat(C.yellow, "paint"),
  };
  const carriages = [];
  for (const sx of [1, -1]) {
    const post = new THREE.Mesh(box([sx * POST_X, POST_Y, 1.45], AXES, [0.14, 0.16, 1.45]), LM.post);
    post.castShadow = true;
    lift.add(post);
    lift.add(new THREE.Mesh(box([sx * POST_X, POST_Y, 0.008], AXES, [0.26, 0.26, 0.008]), LM.dark)); // base plate
    // carriage track on the post's inner face
    lift.add(new THREE.Mesh(box([sx * (POST_X - 0.141), POST_Y, 1.45], AXES, [0.003, 0.05, 1.4]), LM.dark));
    // carriage + two swing arms (front and rear)
    const carriage = new THREE.Group();
    carriage.add(
      new THREE.Mesh(box([sx * (POST_X - 0.17), POST_Y, 0.28], AXES, [0.04, 0.13, 0.24]), LM.dark),
    );
    const arms = [];
    for (const y of JACK_Y) {
      const pivot = new THREE.Vector3(sx * (POST_X - 0.19), POST_Y + Math.sign(y) * 0.09, 0.09);
      const pad = new THREE.Vector3(sx * SILL_X, y, 0.09);
      // arm-local frame: +x runs from the pivot to the pad; outer tube + telescoping inner tube + lift pad
      const arm = new THREE.Group();
      arm.position.copy(pivot);
      const len = pad.distanceTo(pivot);
      const outer = new THREE.Mesh(box([len * 0.3, 0, 0], AXES, [len * 0.3, 0.045, 0.035]), LM.post);
      const inner = new THREE.Mesh(box([len * 0.75, 0, 0], AXES, [len * 0.25, 0.034, 0.026]), LM.steel);
      const padM = new THREE.Mesh(cyl([len, 0, 0.055], [0, 0, 1], 0.055, 0.04, 20), LM.pad);
      const padS = new THREE.Mesh(cyl([len, 0, 0.025], [0, 0, 1], 0.03, 0.04, 12), LM.steel);
      outer.castShadow = inner.castShadow = true;
      arm.add(outer, inner, padM, padS);
      // ang = angle that points the arm at the jack point; park = folded along the car (±90°)
      const ang = Math.atan2(pad.y - pivot.y, pad.x - pivot.x);
      arm.userData = { ang, park: (Math.sign(y) * Math.PI) / 2 };
      arm.rotation.z = ang;
      carriage.add(arm);
      arms.push(arm);
    }
    lift.add(carriage);
    carriages.push({ g: carriage, arms });
    // safety-lock ladder on the post
    for (let i = 0; i < 14; i++)
      lift.add(
        new THREE.Mesh(
          box([sx * (POST_X - 0.142), POST_Y + 0.07, 0.25 + i * 0.17], AXES, [0.004, 0.012, 0.012]),
          LM.yellow,
        ),
      );
  }
  // overhead beam (clear-floor style) to make it read as a lift
  lift.add(new THREE.Mesh(box([0, POST_Y, 2.92], AXES, [POST_X + 0.12, 0.09, 0.06]), LM.post));

  // move the carriages with the car (the core raises ctx.carRoot) and swing the arms
  const sync = (armSwing) => {
    const z = ctx.carRoot.position.z;
    for (const c of carriages) {
      c.g.position.z = z + SILL_Z - 0.09 - 0.075; // pad top meets the pinch weld
      for (const a of c.arms) a.rotation.z = a.userData.park + (a.userData.ang - a.userData.park) * armSwing;
    }
  };
  return { lift, sync };
}
