// Ignition in the engine cutaway: a spark plug and coil per cylinder (leaning toward the intake side), and the
// spark effect, a glowing flash sprite plus a small point light at the top of the cylinder that is starting
// its power stroke. buildIgnition() makes them; poseIgnition() shows the spark for a crank angle.
// Local engine frame (2 mm units).
import * as THREE from "three";
import { CYL_X, PLACE, cyclePhase } from "./kinematics.js";
import { cylAB, boxG } from "./geometry.js";
import { noPick } from "./kit.js";

const SPARK_DEGREES = 26; // the flash lasts for the first 26° of the power stroke, shrinking as it goes

/** Build plugs, coils, the flash sprite and the spark light. Returns the handles to pose. */
export function buildIgnition(kit, ctx) {
  const { root, C, bucket } = kit;

  // ---------------------------------------------------------------- spark plugs and coils
  // Each leans from the combustion chamber toward the intake side (+y), which clears the closely spaced
  // exhaust valve springs. `at(t)` is the point t units up that axis.
  for (const xc of CYL_X) {
    const top = new THREE.Vector3(xc, 15, 200),
      tip = new THREE.Vector3(xc, 0.5, 119.5);
    const axis = top.clone().sub(tip).normalize();
    const at = (t) => tip.clone().addScaledVector(axis, t).toArray();
    bucket(cylAB(at(0), at(4), 1.8, 12), "spark-plug", 0x9aa0a6, "chrome"); // electrode / thread
    bucket(cylAB(at(4), at(12), 3, 6), "spark-plug", 0xb5bac0, "chrome"); // hex
    bucket(cylAB(at(12), at(42), 2.4, 16), "spark-plug", C.white, "plastic"); // ceramic insulator
    bucket(cylAB(at(42), at(76), 3.4, 16), "coil", 0x2b2e33, "plastic"); // coil boot
    bucket(boxG([xc - 5, 8, 193], [xc + 5, 21, 203]), "coil", 0x2b2e33, "plastic"); // coil head
  }

  // ---------------------------------------------------------------- spark flash sprite (radial glow + star)
  const flashTex = (() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 128;
    const g = cv.getContext("2d");
    const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    rg.addColorStop(0, "rgba(255,255,255,1)");
    rg.addColorStop(0.18, "rgba(255,240,170,0.95)");
    rg.addColorStop(0.45, "rgba(255,150,40,0.45)");
    rg.addColorStop(1, "rgba(255,120,20,0)");
    g.fillStyle = rg;
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = "rgba(255,255,230,0.9)";
    g.beginPath();
    for (let i = 0; i < 16; i++) {
      const t = (i / 16) * Math.PI * 2,
        r = i % 2 ? 9 : 52;
      g.lineTo(64 + Math.cos(t) * r, 64 + Math.sin(t) * r);
    }
    g.closePath();
    g.fill();
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const flash = noPick(
    new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: flashTex,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  flash.renderOrder = 5;
  flash.visible = false;
  root.add(flash);

  // ---------------------------------------------------------------- spark light
  // The light lives OUTSIDE the hidden area group (in its own copy of the engine frame) so the scene's light count
  // never changes: a light that appears only when this area opens makes three.js recompile every visible
  // material (a long hitch on Windows/ANGLE).
  const light = new THREE.PointLight(0xffa040, 0, 0.35, 2);
  const lightFrame = new THREE.Group();
  lightFrame.name = "engine-spark-light";
  lightFrame.rotation.z = Math.PI;
  lightFrame.scale.setScalar(PLACE.scale);
  lightFrame.position.set(...PLACE.offset);
  lightFrame.add(light);
  ctx.carRoot.add(lightFrame);

  return { flash, light };
}

/** Show the spark in whichever cylinder is in the first SPARK_DEGREES of its power stroke (if any). */
export function poseIgnition(ignition, theta, shown) {
  const { flash, light } = ignition;
  const c = CYL_X.findIndex((_, i) => cyclePhase(theta, i) < SPARK_DEGREES);
  if (c < 0) {
    flash.visible = false;
    light.intensity = 0;
    return;
  }
  const fade = 1 - cyclePhase(theta, c) / SPARK_DEGREES; // 1 at the spark, 0 at the end of the flash
  const xc = CYL_X[c];
  flash.visible = true;
  flash.position.set(xc, 1.5, 117.5);
  flash.scale.setScalar((fade * 9 + 3) * 3.2);
  light.position.set(xc, 1.5, 112);
  light.intensity = shown ? 0.012 * fade + 0.003 : 0;
}

/** Turn the spark off (used when the area closes). */
export function hideSpark(ignition) {
  ignition.flash.visible = false;
  ignition.light.intensity = 0;
}
