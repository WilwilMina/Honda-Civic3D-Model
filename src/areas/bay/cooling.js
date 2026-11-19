// Cooling stack at the front of the engine bay, rebuilt by hand in kit units (see base-model.js): the finned
// radiator core, the A/C condenser in front of it, and the two electric fans (shroud, motor, spinning blades).
// The radiator tanks, cap and hoses come from shapes.json. buildCooling() returns an update() that spins the fans.
import * as THREE from "three";
import { lathe, sweep, fixWinding } from "../../lib/geom.js";
import { frame, alignedBox, canvasTex } from "./geometry.js";

// Vertical fin lines with faint horizontal tube bands, tiled across a core face.
const finTex = (bg, line, n) =>
  canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = line;
    g.lineWidth = 2;
    for (let i = 0; i < n; i++) {
      const x = (i + 0.5) * (w / n);
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.stroke();
    }
    g.globalAlpha = 0.25;
    g.fillStyle = "#000";
    for (let j = 0; j < 4; j++) g.fillRect(0, j * 16, w, 2);
  });

// Builds the radiator core, condenser and both fans. b: the shared build context from scene.js.
export function buildCooling({ mat, C, P, add, kit }) {
  // radiator core (kit y 68..75) and the condenser just ahead of it (y 76..80), both spanning z 28..100
  const radMat = mat(0x4b4f55, "metal", P("radiator"));
  radMat.map = finTex("#6b7078", "#3a3e44", 16);
  radMat.map.repeat.set(6, 1);
  radMat.roughness = 0.6;
  const core = new THREE.BoxGeometry(180, 7, 72);
  core.translate(-4, 71.5, 64);
  add(core, radMat, "radiator", kit, { shadow: true, name: "radiator.core" });
  const conMat = mat(0x3b3e43, "metal", P("condenser"));
  conMat.map = finTex("#5a5e64", "#2e3135", 20);
  conMat.map.repeat.set(8, 1);
  conMat.roughness = 0.6;
  const condenser = new THREE.BoxGeometry(214, 4, 72);
  condenser.translate(-1, 78, 64);
  add(condenser, conMat, "condenser", kit, { shadow: true, name: "condenser" });
  // condenser side headers
  for (const x of [-109, 107])
    add(alignedBox([x, 78, 64], [2, 2.6, 36]), mat(C.aluminum, "metal", P("condenser")), "condenser");

  // fans: driver-side and passenger-side, each centred at kit x = cx on the engine side of the radiator
  const fans = [];
  for (const cx of [-56, 26]) fans.push(buildFan({ mat, P, add, kit }, cx));

  return {
    // runLevel: eased 0..1 engine speed. The fans cycle with temperature in real life; A/C on keeps them running.
    update(dt, runLevel, ac) {
      for (const [i, f] of fans.entries()) f.rotation.y += dt * runLevel * (ac ? 26 : 16) * (i ? 1 : 0.92);
    },
  };
}

// One fan: a rounded-rectangle shroud with a round opening, a motor held by three struts, and a five-blade rotor
// in a pivot that turns about the y axis. Returns the pivot.
function buildFan({ mat, P, add, kit }, cx) {
  const sh = new THREE.Shape();
  const x0 = cx - 30,
    x1 = cx + 30,
    z0 = 34,
    z1 = 98,
    r = 3;
  sh.moveTo(x0 + r, z0);
  sh.lineTo(x1 - r, z0);
  sh.quadraticCurveTo(x1, z0, x1, z0 + r);
  sh.lineTo(x1, z1 - r);
  sh.quadraticCurveTo(x1, z1, x1 - r, z1);
  sh.lineTo(x0 + r, z1);
  sh.quadraticCurveTo(x0, z1, x0, z1 - r);
  sh.lineTo(x0, z0 + r);
  sh.quadraticCurveTo(x0, z0, x0 + r, z0);
  const hole = new THREE.Path();
  hole.absarc(cx, 66, 26, 0, Math.PI * 2, true);
  sh.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(sh, {
    depth: 5,
    bevelEnabled: true,
    bevelThickness: 0.6,
    bevelSize: 0.6,
    bevelSegments: 1,
    curveSegments: 40,
  });
  // the shape was drawn in (x, z): stand it up so it faces along y
  g.rotateX(Math.PI / 2);
  g.translate(0, 67.4, 0); // spans y 61.8..67.4 (+bevel)
  add(g, mat(0x26282c, "plastic", P("fans")), "fans", kit, { shadow: true, name: "fan.shroud" });
  // motor on the engine side, held by three struts
  add(
    fixWinding(
      lathe(
        frame([cx, 61, 66], [0, -1, 0], [1, 0, 0], [0, 0, 1]),
        [
          [0, 0],
          [0, 9],
          [1, 9.2],
          [7, 9.2],
          [8, 8],
          [8, 0],
        ],
        28,
      ),
    ),
    mat(0x5d6168, "metal", P("fans")),
    "fans",
  );
  for (let i = 0; i < 3; i++) {
    const a = i * 2.094 + 0.5; // 120° apart
    const p0 = [cx + Math.cos(a) * 8, 60.5, 66 + Math.sin(a) * 8],
      p1 = [cx + Math.cos(a) * 28, 61.5, 66 + Math.sin(a) * 28];
    add(fixWinding(sweep([p0, p1], 1.1, { radial: 6 })), mat(0x26282c, "plastic", P("fans")), "fans");
  }
  // blades in a pivot that turns about the y axis
  const pivot = new THREE.Group();
  pivot.position.set(cx, 64.5, 66);
  kit.add(pivot);
  const bm = mat(0x303237, "plastic", P("fans"));
  add(
    fixWinding(
      lathe(
        frame([0, 2.5, 0], [0, -1, 0], [1, 0, 0], [0, 0, 1]),
        [
          [0, 0],
          [0, 6],
          [5, 6],
          [5, 0],
        ],
        24,
      ),
    ),
    bm,
    "fans",
    pivot,
  );
  for (let i = 0; i < 5; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(18, 0.8, 9), bm);
    blade.geometry.translate(14, 0, 0);
    blade.rotation.y = (i / 5) * Math.PI * 2;
    blade.rotateX(0.45); // blade pitch
    blade.userData.part = P("fans");
    pivot.add(blade);
  }
  return pivot;
}
