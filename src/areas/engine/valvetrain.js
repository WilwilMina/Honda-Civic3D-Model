// The valvetrain of the engine cutaway (SOHC: one camshaft for all 16 valves): per cylinder two intake and two
// exhaust valves with springs and retainers, a rocker arm for each, the rocker shafts, and the camshaft with one
// lobe per valve. buildValvetrain() makes the meshes; poseValvetrain() turns the cam and opens the valves using
// valveLift() from kinematics.js. Local engine frame (2 mm units); the valves are drawn straight up for clarity.
import * as THREE from "three";
import { CYL_X, CAM_AXIS, VALVES, FIRING_OFFSET, D2R, cyclePhase, valveLift } from "./kinematics.js";
import { blob, slab, cylX, cylZ, springGeom } from "./geometry.js";

// Valve spring: sits on a seat at z = SPRING_BASE and is SPRING_LEN tall when the valve is shut; its top touches
// the retainer (z 152…154, minus the 0.6 wire radius), which rides down with the valve.
const SPRING_BASE = 138.6;
const SPRING_LEN = 12.8;
const SPRING_TOP = 151.4; // SPRING_BASE + SPRING_LEN
// Rocker geometry, relative to the cam axis / rocker pivot (y is mirrored by the side sign s: +1 intake, −1 exhaust)
const ROCKER_SHAFT = { y: 22, z: 164 }; // pivot shaft position (y × s)
const ROCKER_SCREW = 12; // pivot -> adjusting screw over the valve stem
const ROCKER_PAD = 19; // pivot -> pad the cam lobe presses on
const camColour = 0x8a9198;

/** Build valves, springs, rockers, rocker shafts and the camshaft. Returns the handles to pose. */
export function buildValvetrain(kit) {
  const { root, part, bucket } = kit;

  // ---------------------------------------------------------------- valves, springs, rockers (per cylinder)
  const valves = [];
  CYL_X.forEach((xc, c) => {
    for (const kind of ["in", "ex"]) {
      const v = VALVES[kind],
        s = Math.sign(v.y);
      for (const dx of v.xs) {
        const x = xc + dx;
        // the valve and its retainer move together (group origin = shut position)
        const valve = new THREE.Group();
        valve.name = `valve-${kind}${c + 1}${dx > 0 ? "a" : "b"}`;
        root.add(valve);
        const key = kind === "in" ? "valves-in" : "valves-ex";
        const col = kind === "in" ? 0x7fa9d8 : 0xc98a5a;
        bucket(cylZ(118, 119.6, v.r, 32).translate(x, v.y, 0), key, col, "metal", valve); // head (on the seat)
        bucket(
          new THREE.CylinderGeometry(1.2, v.r * 0.55, 2.4, 20).rotateX(Math.PI / 2).translate(x, v.y, 120.8),
          key,
          col,
          "metal",
          valve,
        ); // tulip neck
        bucket(cylZ(119.6, 160, 1.2, 12).translate(x, v.y, 0), key, col, "metal", valve); // stem
        bucket(cylZ(152, 154, 5, 24).translate(x, v.y, 0), "valve-springs", 0x6b7178, "chrome", valve); // retainer
        bucket(cylZ(137, 138, 5, 24).translate(x, v.y, 0), "valve-springs", 0x6b7178, "metal"); // spring seat
        const spring = part(springGeom(4.4, SPRING_LEN, 6, 0.6), "valve-springs", 0x3f9a6a, "metal");
        spring.position.set(x, v.y, SPRING_BASE);
        // rocker arm on its shaft (group origin = pivot); pad and screw are on the same side of the pivot
        const rocker = new THREE.Group();
        rocker.name = `rocker-${kind}${c + 1}${dx > 0 ? "a" : "b"}`;
        rocker.position.set(x, ROCKER_SHAFT.y * s, ROCKER_SHAFT.z);
        root.add(rocker);
        bucket(
          slab(
            blob([
              [0, 0, 4],
              [-ROCKER_PAD * s, 1.5, 3],
            ]),
            -2,
            2,
          ),
          "rockers",
          0x8d949b,
          "metal",
          rocker,
        );
        bucket(cylZ(-4, 6, 1.4, 12).translate(0, -ROCKER_SCREW * s, 0), "rockers", 0x8d949b, "metal", rocker); // adjusting screw
        bucket(
          cylZ(4.3, 5.5, 2.6, 6).translate(0, -ROCKER_SCREW * s, 0),
          "rockers",
          0x8d949b,
          "metal",
          rocker,
        ); // locknut
        valves.push({ c, v, s, valve, spring, rocker });
      }
    }
  });

  // ---------------------------------------------------------------- camshaft (turns at half crank speed)
  const cam = new THREE.Group();
  cam.name = "camshaft";
  cam.position.set(0, CAM_AXIS[0], CAM_AXIS[1]);
  root.add(cam);
  bucket(cylX(-100, 104, 4.5, 16), "camshaft", camColour, "chrome", cam);
  for (const x of [-90, -45, 0, 45, 90])
    bucket(cylX(x - 3, x + 3, 8, 24), "camshaft", camColour, "chrome", cam); // journals
  CYL_X.forEach((xc, c) => {
    for (const kind of ["in", "ex"]) {
      const v = VALVES[kind],
        s = Math.sign(v.y);
      // Lobe nose angle at crank angle 0. atan2(3s, 10.5) points from the cam axis at the rocker pad (3s across,
      // 10.5 below). The cam turns the same way as the crank at half speed, so it turns by −theta/2: adding half of
      // the crank angle where this valve is fully open (cylinder offset + middle of its window) makes the nose
      // reach the pad exactly then. The lobe's size is illustrative; the actual lift comes from valveLift().
      const ang0 = Math.atan2(3 * s, 10.5) + ((FIRING_OFFSET[c] + (v.open + v.close) / 2) / 2) * D2R;
      const lobe = blob(
        [
          [0, 0, 7], // base circle
          [11.1 * Math.sin(ang0), -11.1 * Math.cos(ang0), 3], // nose
        ],
        28,
      );
      for (const dx of v.xs)
        bucket(slab(lobe, xc + dx - 1.75, xc + dx + 1.75), "camshaft", camColour, "chrome", cam);
    }
  });
  // rocker shafts, one per side
  for (const s of [-1, 1])
    bucket(
      cylX(-100, 100, 3, 14).translate(0, ROCKER_SHAFT.y * s, ROCKER_SHAFT.z),
      "rockers",
      0x6f767d,
      "chrome",
    );

  return { cam, valves };
}

/** Turn the camshaft and set every valve, spring and rocker for crank angle `theta` (degrees). */
export function poseValvetrain(valvetrain, theta) {
  valvetrain.cam.rotation.x = (-theta * D2R) / 2; // half crank speed
  for (const q of valvetrain.valves) {
    const lift = valveLift(cyclePhase(theta, q.c), q.v);
    q.valve.position.z = -lift; // valves open downward, into the cylinder
    q.spring.scale.z = (SPRING_TOP - lift - SPRING_BASE) / SPRING_LEN; // squeezed by the lift
    q.rocker.rotation.x = q.s * (lift / ROCKER_SCREW); // small angle that moves the screw end down by `lift`
  }
}
