// The bottom end of the engine cutaway: crankshaft with its webs and counterweights, the flexplate, and per
// cylinder the piston, rings, connecting rod, the coloured gas column above the piston and the oil jet with its
// spray. buildBottomEnd() makes the meshes; poseBottomEnd() moves them for a crank angle using the slider-crank
// math in kinematics.js. Local engine frame (2 mm units), crank axis = x.
import * as THREE from "three";
import {
  CYL_X,
  FIRING_OFFSET,
  CRANK_R,
  ROD,
  DECK,
  D2R,
  mod,
  cyclePhase,
  strokeAt,
  sliderCrank,
} from "./kinematics.js";
import { hull, blob, slab, cylX, cylZ, boxG, gear } from "./geometry.js";
import { noPick } from "./kit.js";

// Piston extent relative to its wrist pin (which is what the slider-crank positions).
const PISTON_TOP = 15.5;
const PISTON_SKIRT = -9.5;
// Gas colour per stroke: light blue intake, dark blue compression, orange power, grey exhaust.
const GAS = { intake: 0x8fd3ff, compression: 0x2f5fc4, power: 0xff7a1a, exhaust: 0x8c9096 };
const BURNT = new THREE.Color(0xc0c4c8); // the power-stroke gas fades toward this as it expands
const DROPS = 14; // oil droplets per jet

/** Build the crankshaft, flexplate and per-cylinder piston/rod/gas/oil-jet parts. Returns the handles to pose. */
export function buildBottomEnd(kit) {
  const { root, C, bucket } = kit;

  // ---------------------------------------------------------------- crankshaft (turns about x) + flexplate
  const crank = new THREE.Group();
  crank.name = "crankshaft";
  root.add(crank);
  const crankCol = 0x7d838a;
  // main journals, between and outside the cylinders
  for (const [a, b] of [
    [-100, -77.5],
    [-57.5, -32.5],
    [-12.5, 12.5],
    [32.5, 57.5],
    [77.5, 100],
  ])
    bucket(cylX(a, b, 11, 28), "crankshaft", crankCol, "chrome", crank);
  bucket(cylX(100, 104, 7, 20), "crankshaft", crankCol, "chrome", crank); // nose (crank sprocket end)
  CYL_X.forEach((xc, c) => {
    // Throw angle at crank angle 0: the pin sits at CRANK_R·(sin a, cos a). Rotating the crank by −theta then
    // puts it at angle (theta − offset) = the cylinder's cycle angle, matching sliderCrank().
    const a = -FIRING_OFFSET[c] * D2R;
    const pin = [CRANK_R * Math.sin(a), CRANK_R * Math.cos(a)];
    // web: a counterweight arc opposite the pin, hulled with the main journal and the pin boss
    const counterweight = [];
    for (let i = -55; i <= 55; i += 5.5) {
      const t = a + Math.PI + i * D2R;
      counterweight.push([Math.sin(t) * 27, Math.cos(t) * 27]);
    }
    counterweight.push([0, 0]);
    const web = hull(
      counterweight.concat(
        blob([
          [0, 0, 13],
          [pin[0], pin[1], 11],
        ]),
      ),
    );
    for (const x0 of [xc - 10, xc + 5]) bucket(slab(web, x0, x0 + 5), "crankshaft", 0x6a7077, "metal", crank);
    bucket(
      cylX(xc - 5, xc + 5, 9.5, 24).translate(0, pin[0], pin[1]),
      "crankshaft",
      crankCol,
      "chrome",
      crank,
    );
  });
  {
    // flexplate: a disc with six lightening holes at the transmission end (x = −104)
    const s = new THREE.Shape();
    s.absarc(0, 0, 50, 0, Math.PI * 2, false);
    for (let i = 0; i < 6; i++) {
      const t = (i / 6) * Math.PI * 2,
        hole = new THREE.Path();
      hole.absarc(Math.cos(t) * 30, Math.sin(t) * 30, 4.5, 0, Math.PI * 2, true);
      s.holes.push(hole);
    }
    const g = new THREE.ExtrudeGeometry(s, { depth: 2, bevelEnabled: false, curveSegments: 48 });
    // shape x,y,depth -> engine y,z,x
    g.applyMatrix4(
      new THREE.Matrix4().makeBasis(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(1, 0, 0),
      ),
    );
    g.translate(-104, 0, 0);
    bucket(g, "flexplate", 0x8e949a, "metal", crank);
    bucket(gear(-104, -102, 51.5, 60, 1.6), "flexplate", 0x5f646b, "metal", crank); // ring gear the starter turns
    bucket(cylX(-102, -100, 12, 24), "flexplate", 0x8e949a, "metal", crank);
  }

  // ---------------------------------------------------------------- per-cylinder moving parts
  const cylinders = CYL_X.map((xc, c) => {
    const o = { xc, c };
    // piston + rings; the group origin is the wrist pin
    o.piston = new THREE.Group();
    o.piston.name = `piston${c + 1}`;
    root.add(o.piston);
    bucket(
      cylZ(PISTON_SKIRT, PISTON_TOP, 20, 40).translate(xc, 0, 0),
      "piston",
      C.aluminum,
      "metal",
      o.piston,
    );
    bucket(cylX(xc - 19, xc + 19, 4.2, 14), "piston", 0x9ea4aa, "chrome", o.piston); // wrist pin ends
    for (const h of [13.6, 11.4, 8.8])
      bucket(cylZ(h - 0.5, h + 0.5, 20.3, 40).translate(xc, 0, 0), "rings", 0x4c5258, "chrome", o.piston);
    // connecting rod: big end at the group origin, small end ROD along +z (rotated in the y–z plane)
    o.rod = new THREE.Group();
    o.rod.name = `rod${c + 1}`;
    root.add(o.rod);
    bucket(
      slab(
        blob([
          [0, 0, 13],
          [0, ROD, 6.5],
        ]),
        -4.5,
        4.5,
      ),
      "rod",
      0x9aa1a8,
      "chrome",
      o.rod,
    );
    bucket(cylX(-4.6, 4.6, 9.6, 20), "rod", 0x5a6067, "metal", o.rod); // bearing shell around the pin
    o.rod.position.x = xc;
    // gas above the piston: an open tube of height 1 (z 0…1) stretched each frame from the crown to the deck,
    // plus a cap at the deck. Each cylinder has its own material so its colour can follow its stroke.
    const tube = new THREE.CylinderGeometry(19.6, 19.6, 1, 40, 1, true);
    tube.rotateX(Math.PI / 2);
    tube.translate(xc, 0, 0.5);
    const gasMat = new THREE.MeshBasicMaterial({
      color: GAS.intake,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    o.gas = noPick(new THREE.Mesh(tube, gasMat));
    o.gasCap = noPick(new THREE.Mesh(new THREE.CircleGeometry(19.6, 40), gasMat));
    o.gasCap.position.set(xc, 0, DECK - 0.1);
    o.gas.renderOrder = 1;
    o.gasCap.renderOrder = 1;
    root.add(o.gas, o.gasCap);
    // oil jet nozzle on the block wall; it sprays the underside of the piston
    bucket(boxG([xc - 2, -26, 26], [xc + 2, -20, 32]), "oil-jets", C.darksteel, "metal");
    return o;
  });

  // ---------------------------------------------------------------- oil spray: DROPS points per jet
  const sprayPos = new Float32Array(CYL_X.length * DROPS * 3);
  const sprayG = new THREE.BufferGeometry();
  sprayG.setAttribute("position", new THREE.BufferAttribute(sprayPos, 3));
  const spray = noPick(
    new THREE.Points(
      sprayG,
      new THREE.PointsMaterial({
        color: 0xe0a325,
        size: 0.0035,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      }),
    ),
  );
  spray.frustumCulled = false;
  root.add(spray);

  return { crank, cylinders, spray };
}

/** Pose the crank, pistons, rods, gas columns and oil spray for crank angle `theta` (degrees). */
export function poseBottomEnd(bottom, theta) {
  const { crank, cylinders, spray } = bottom;
  crank.rotation.x = -theta * D2R;
  for (const o of cylinders) {
    const phi = cyclePhase(theta, o.c);
    const stroke = strokeAt(phi);
    const { pinY, pinZ, wristZ, rodAngle } = sliderCrank(phi);
    o.piston.position.z = wristZ;
    o.rod.position.set(o.xc, pinY, pinZ);
    o.rod.rotation.x = rodAngle;
    // gas column from the piston crown up to the deck
    const crown = wristZ + PISTON_TOP,
      height = DECK - crown;
    o.gas.visible = o.gasCap.visible = height > 0.4;
    o.gas.position.z = crown;
    o.gas.scale.z = Math.max(0.01, height);
    // colour by stroke; on the power stroke the bright burn fades over the first ~160° as the gas expands
    const burn = stroke === "power" ? Math.max(0.15, 1 - phi / 160) : 1;
    o.gas.material.color.setHex(GAS[stroke]);
    if (stroke === "power") o.gas.material.color.lerp(BURNT, 1 - burn);
    o.gas.material.opacity = stroke === "power" ? 0.25 + 0.35 * burn : stroke === "compression" ? 0.45 : 0.36;
  }

  // oil spray: droplets stream from each jet (y −22, z 32) to the underside of its piston, 9 waves per cycle;
  // the sin/cos of the droplet index just scatter them a little so the stream doesn't look like a dotted line
  const pos = spray.geometry.attributes.position;
  const arr = pos.array;
  const waves = (theta / 720) * 9;
  cylinders.forEach((o, c) => {
    const zTo = o.piston.position.z + PISTON_SKIRT;
    for (let j = 0; j < DROPS; j++) {
      const u = mod(waves + j / DROPS + c * 0.13, 1); // 0 at the nozzle, 1 at the piston
      const k = (c * DROPS + j) * 3,
        scatter = Math.sin(j * 12.9898 + c) * 2.2 * u;
      arr[k] = o.xc + scatter;
      arr[k + 1] = -22 + 16 * u + Math.cos(j * 7.1) * 1.2 * u;
      arr[k + 2] = 32 + (zTo - 32) * u;
    }
  });
  pos.needsUpdate = true;
}
