// Exhaust system from the catalytic converter back: Pipe A (front pipe), the spring-loaded flexible joint,
// Pipe B (centre pipe, along the floor tunnel), the muffler, the tailpipe, the rubber hangers and the heat
// shields. The converter itself is part of the engine bay; the pipe starts at its outlet, found in the bay model.
// Called from scene.js with the under kit. Frame: metres, +x = driver side, +y = front, z up.
import { lathe, prism, box, sweep } from "../../lib/geom.js";
import { TAIL_X, AXES } from "./kit.js";

const PIPE_R = 0.024; // exhaust pipe radius

// Lowest point of the bay's catalytic converter pipe = where our exhaust starts (adapts if the bay model moves it).
function findCatOutlet(ctx) {
  const { THREE } = ctx;
  const pts = [];
  const v = new THREE.Vector3();
  ctx.carRoot.updateMatrixWorld(true);
  ctx.carRoot.traverse((o) => {
    if (!o.isMesh || o.userData.part !== "bay:catalytic" || !o.geometry?.attributes?.position) return;
    const p = o.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld);
      pts.push(v.clone());
    }
  });
  if (!pts.length) return null;
  // among the lowest vertices take the rearmost ones, average them, and lift to the pipe centre
  const zmin = Math.min(...pts.map((q) => q.z));
  const low = pts.filter((q) => q.z < zmin + 0.004);
  const ymin = Math.min(...low.map((q) => q.y));
  const end = low.filter((q) => q.y < ymin + 0.01);
  const c = end.reduce((a, q) => a.add(q), new THREE.Vector3()).multiplyScalar(1 / end.length);
  c.z = zmin + 0.024;
  return ctx.carRoot.worldToLocal(c); // world -> car authoring frame (the car root is mirrored in x)
}

// Build the whole exhaust (pipes, joint, muffler, tailpipe, hangers, heat shields).
export function buildExhaust(kit) {
  const { ctx, THREE, C, group, add, curve, cyl, ovalDrum } = kit;
  // One close-coupled catalytic converter sits on the engine (bay area). From its outlet: Pipe A (front pipe) ->
  // flexible joint with spring-loaded bolts -> Pipe B (centre pipe, under the floor) -> muffler -> tailpipe.
  const catOut = findCatOutlet(ctx) || new THREE.Vector3(-0.22, 1.185, 0.218);
  const EX = { tunnelX: -0.02, joint: 0.97 }; // pipe x inside the tunnel, y of the flexible joint
  // Pipe A: from the converter outlet down and back under the engine and front subframe to the joint
  const aPts = [[catOut.x, catOut.y, catOut.z]];
  if (catOut.y > 1.5) {
    // outlet far forward (exhaust side faces the radiator): drop down first, then run back under the engine
    aPts.push(
      [catOut.x + 0.01, catOut.y + 0.03, Math.max(0.24, catOut.z - 0.12)],
      [catOut.x + 0.04, catOut.y - 0.06, 0.226],
      [-0.17, 1.5, 0.222],
    );
  }
  aPts.push(
    [-0.17, Math.min(1.3, catOut.y - 0.1), 0.205],
    [-0.14, 1.12, 0.21],
    [-0.1, EX.joint + 0.02, 0.212],
  );
  const pipeA = curve(aPts, 70);
  add(group, sweep(pipeA, PIPE_R, { radial: 16 }), C.steel, "metal", "front-pipe", true);

  // flexible joint: two flanges pulled together by 2 spring-loaded bolts (lets the engine rock without cracking
  // the pipe)
  const jA = new THREE.Vector3(...pipeA[pipeA.length - 1]);
  const jDir = jA
    .clone()
    .sub(new THREE.Vector3(...pipeA[pipeA.length - 3]))
    .normalize(); // pipe direction at the joint
  {
    const flange = (c) =>
      add(group, cyl(c.toArray(), jDir.toArray(), 0.05, 0.008, 20), C.darksteel, "metal", "flex-joint");
    flange(jA.clone().addScaledVector(jDir, -0.006));
    flange(jA.clone().addScaledVector(jDir, 0.014));
    // side = horizontal, across the pipe (bolt offset); side and up2 also frame the coil around each bolt
    const side = new THREE.Vector3().crossVectors(jDir, new THREE.Vector3(0, 0, 1)).normalize();
    const up2 = new THREE.Vector3().crossVectors(side, jDir);
    for (const sgn of [-1, 1]) {
      const b = jA.clone().addScaledVector(side, sgn * 0.04);
      add(group, cyl(b.toArray(), jDir.toArray(), 0.0035, 0.09, 8), 0xb9bec4, "metal", "flex-joint");
      // coil spring on the bolt: 6 turns, 9 mm radius, 40 mm long, on the Pipe A side of the flanges
      const coil = [];
      for (let i = 0; i <= 60; i++) {
        const a = (i / 60) * Math.PI * 2 * 6,
          s = -0.055 + (i / 60) * 0.04;
        const q = b
          .clone()
          .addScaledVector(jDir, s)
          .addScaledVector(up2, Math.cos(a) * 0.009)
          .addScaledVector(side, Math.sin(a) * 0.009);
        coil.push(q.toArray());
      }
      add(group, sweep(coil, 0.0018, { radial: 6 }), 0xc8a24a, "metal", "flex-joint");
    }
  }

  // Pipe B: from the joint along the tunnel, under the fuel tank, up over the rear suspension to the muffler
  // muffler layout: centre y/z, x0..x1 across the car, radius r, height squash sq
  // (a slim can tucked under the spare well, hidden behind the bumper)
  const MUF = { y: -1.84, z: 0.318, x0: -0.24, x1: TAIL_X, r: 0.14, sq: 0.45 };
  const jB = jA.clone().addScaledVector(jDir, 0.014);
  const bPts = curve(
    [
      jB.toArray(),
      [-0.05, 0.82, 0.218],
      [EX.tunnelX, 0.62, 0.222],
      [EX.tunnelX, 0.2, 0.226],
      [EX.tunnelX, -0.36, 0.236],
      [EX.tunnelX, -0.7, 0.246],
      [EX.tunnelX, -1.05, 0.255],
      [EX.tunnelX, -1.25, 0.278],
      [EX.tunnelX + 0.01, -1.45, 0.285],
      [0.02, -1.6, 0.272],
      [0.05, MUF.y + 0.02, MUF.z],
    ],
    90,
  );
  add(group, sweep(bPts, PIPE_R * 0.95, { radial: 16 }), C.steel, "metal", "center-pipe", true);

  // muffler: transverse oval can behind the rear axle, with a seam ring near each end
  const mufLen = MUF.x1 - MUF.x0 + 0.06;
  add(
    group,
    ovalDrum([(MUF.x0 + MUF.x1) / 2, MUF.y, MUF.z], "x", mufLen, MUF.r, MUF.sq),
    0xb0b5bb,
    "metal",
    "muffler",
    true,
  );
  for (const x of [MUF.x0 + 0.06, MUF.x1 - 0.04]) {
    const g = lathe(
      { o: [0, 0, 0], a: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] },
      [
        [0, MUF.r + 0.004],
        [0.012, MUF.r + 0.004],
      ],
      36,
    );
    g.scale(1, 1, MUF.sq);
    g.translate(x, MUF.y, MUF.z);
    add(group, g, 0x8e9399, "metal", "muffler");
  }

  // tailpipe out the back, tucked under the bumper (plain tip on the LX; side not confirmed)
  const tailSign = Math.sign(TAIL_X) || 1;
  const tailPts = curve(
    [
      [TAIL_X - tailSign * 0.06, MUF.y - 0.05, MUF.z - 0.01],
      [TAIL_X, MUF.y - 0.14, MUF.z - 0.015],
      [TAIL_X + tailSign * 0.01, -2.03, MUF.z - 0.03],
      [TAIL_X + tailSign * 0.01, -2.1, MUF.z - 0.04],
    ],
    24,
  );
  add(group, sweep(tailPts, PIPE_R * 0.95, { radial: 16 }), C.steel, "metal", "tailpipe", true);
  add(
    group,
    cyl([TAIL_X + tailSign * 0.01, -2.095, MUF.z - 0.04], [0, -1, -0.3], PIPE_R * 1.08, 0.05),
    0x5c6066,
    "metal",
    "tailpipe",
  );

  // rubber hangers: rod on the pipe -> rubber isolator -> bracket on the body (at height `top`)
  const hangerAt = (p, top) => {
    const g = new THREE.Group();
    add(
      g,
      sweep(
        [
          [p[0], p[1], p[2]],
          [p[0], p[1], p[2] + 0.035],
        ],
        0.0045,
        { radial: 8 },
      ),
      C.darksteel,
      "metal",
      "hangers",
    );
    add(g, box([p[0], p[1], p[2] + 0.05], AXES, [0.02, 0.012, 0.024]), C.rubber, "rubber", "hangers");
    add(
      g,
      sweep(
        [
          [p[0], p[1], p[2] + 0.065],
          [p[0], p[1], top],
        ],
        0.0045,
        { radial: 8 },
      ),
      C.darksteel,
      "metal",
      "hangers",
    );
    add(g, box([p[0], p[1], top - 0.004], AXES, [0.022, 0.016, 0.004]), C.darksteel, "metal", "hangers");
    group.add(g);
  };
  hangerAt([EX.tunnelX, 0.55, 0.222 + PIPE_R], 0.39);
  hangerAt([EX.tunnelX, -0.25, 0.234 + PIPE_R], 0.39);
  hangerAt([0.02, -1.58, 0.272 + PIPE_R], 0.452);
  hangerAt([MUF.x0 + 0.03, MUF.y + 0.02, MUF.z + MUF.r * MUF.sq - 0.01], 0.36);
  hangerAt([MUF.x1 - 0.01, MUF.y + 0.02, MUF.z + MUF.r * MUF.sq - 0.01], 0.36);

  // heat shields: shiny thin plates between the hot pipes and the floor / tank / spare well
  {
    // arched strip (ring sector in the x/z plane, centre cx/cz, radii r0..r1, angles a0..a1) for a tunnel shield
    const arc = (cx, cz, r0, r1, a0, a1) => {
      const out = [],
        inn = [];
      for (let i = 0; i <= 12; i++) {
        const a = a0 + (a1 - a0) * (i / 12);
        out.push([cx + Math.cos(a) * r1, cz + Math.sin(a) * r1]);
        inn.push([cx + Math.cos(a) * r0, cz + Math.sin(a) * r0]);
      }
      return out.concat(inn.reverse());
    };
    const F = { o: [0, 0, 0], a: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1] };
    add(
      group,
      prism(F, arc(EX.tunnelX, 0.226, 0.07, 0.074, 0.25, Math.PI - 0.25), -0.34, 0.8),
      C.aluminum,
      "chrome",
      "heat-shields",
    );
    add(
      group,
      prism(F, arc(EX.tunnelX, 0.25, 0.066, 0.07, 0.15, Math.PI - 0.15), -1.0, -0.36),
      C.aluminum,
      "chrome",
      "heat-shields",
    );
    // flat plate over the muffler
    add(
      group,
      box([(MUF.x0 + MUF.x1) / 2, MUF.y, 0.352], AXES, [mufLen / 2 + 0.03, 0.17, 0.0025]),
      C.aluminum,
      "chrome",
      "heat-shields",
    );
  }
}
