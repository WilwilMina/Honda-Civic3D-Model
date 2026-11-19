// Driver controls: steering wheel (its hub is the driver's airbag), column and the two stalks; the brake and gas
// pedals, hood release and the floor-mounted trunk / fuel-door release levers; and the center console with the
// automatic shifter (its P-R-N-D gate label is a canvas) and the hand parking brake. Called from scene.js.
// Frame: metres, +x = driver side, +y = front, z up; the driver's centre line is x = +0.37.
import { sweep, lathe } from "../../lib/geom.js";
import { iconCanvas, ICONS } from "./icons.js";

// Steering wheel, column, shroud and stalks.
export function buildSteering(kit) {
  const { THREE, mat, P, root, add, at, rbox, M } = kit;
  const WC = new THREE.Vector3(0.37, 0.4, 0.88); // wheel centre
  const colTilt = (65 * Math.PI) / 180; // wheel plane tilted so its face points back and up at the driver
  const wheel = new THREE.Group();
  wheel.position.copy(WC);
  wheel.rotation.x = colTilt;
  root.add(wheel);
  // wheel-local frame: the rim lies in the x/y plane, +z points at the driver
  const wheelMat = mat(0x222428, "rubber", P("wheel"));
  add(new THREE.TorusGeometry(0.183, 0.016, 14, 56), wheelMat, "wheel", wheel, true);
  // two side spokes (pointing +x and -x) + bottom spoke
  for (const a of [0, Math.PI]) {
    const g = new THREE.BoxGeometry(0.12, 0.034, 0.016);
    g.translate(0.11, 0, 0);
    g.rotateZ(a);
    add(g, M.trim, "wheel", wheel);
  }
  const bottomSpoke = new THREE.BoxGeometry(0.05, 0.12, 0.016);
  bottomSpoke.translate(0, -0.11, -0.004);
  add(bottomSpoke, M.trim, "wheel", wheel);
  // switch pads on the spokes (audio / cruise)
  for (const sx of [0.105, -0.105]) {
    add(at(rbox(0.05, 0.04, 0.008, 0.006), sx, 0.004, 0.011), M.black, "wheel", wheel);
    for (const dy of [0.011, 0, -0.011])
      add(
        at(rbox(0.03, 0.007, 0.003, 0.0012, 1), sx, 0.004 + dy, 0.0155),
        mat(0x4a4f56, "plastic"),
        "wheel",
        wheel,
      );
  }
  // hub = driver's airbag cover
  add(
    lathe(
      { o: [0, 0, -0.03], a: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
      [
        [0, 0.07],
        [0.035, 0.074],
        [0.05, 0.066],
        [0.056, 0.03],
        [0.057, 0],
      ],
      36,
    ),
    mat(0x26282c, "plastic", P("airbags")),
    "airbags",
    wheel,
  );
  add(
    at(new THREE.CylinderGeometry(0.009, 0.009, 0.003, 24).rotateX(Math.PI / 2), 0, 0.012, 0.028),
    M.silver,
    "airbags",
    wheel,
  ); // badge
  // column + shroud, running from the wheel centre along -wheelNormal into the dash
  // wheel normal, pointing from the wheel toward the driver
  const wheelNormal = new THREE.Vector3(0, -Math.cos(Math.PI / 2 - colTilt), Math.sin(Math.PI / 2 - colTilt));
  const colEnd = WC.clone().addScaledVector(wheelNormal, -0.3);
  add(
    sweep([WC.clone().addScaledVector(wheelNormal, -0.04).toArray(), colEnd.toArray()], [0.03, 0.03], {
      radial: 16,
    }),
    M.black,
    "wheel",
  );
  const shroud = add(rbox(0.11, 0.2, 0.09, 0.03), M.trim, "wheel");
  shroud.position.copy(WC.clone().addScaledVector(wheelNormal, -0.17)).add(new THREE.Vector3(0, 0, -0.02));
  shroud.rotation.x = -(Math.PI / 2 - colTilt);
  // stalks: outboard (+x) = lights & turn signals, inboard = wipers
  for (const [side, part] of [
    [1, "stalk-lights"],
    [-1, "stalk-wipers"],
  ]) {
    const base = WC.clone()
      .addScaledVector(wheelNormal, -0.12)
      .add(new THREE.Vector3(side * 0.05, 0, 0.0));
    const tip = base.clone().add(new THREE.Vector3(side * 0.13, -0.02, 0.012));
    add(
      sweep([base.toArray(), tip.toArray()], [0.009, 0.011], { radial: 10 }),
      mat(0x2b2d31, "plastic", P(part)),
      part,
    );
    add(
      at(
        new THREE.CylinderGeometry(0.0125, 0.0125, 0.03, 14).rotateZ(Math.PI / 2),
        tip.x - side * 0.012,
        tip.y,
        tip.z,
      ),
      mat(0x2b2d31, "plastic", P(part)),
      part,
    );
  }
}

// Brake and gas pedals, dead pedal, hood release, and the trunk / fuel-door release levers.
export function buildPedalsAndReleases(kit) {
  const { THREE, mat, P, root, add, at, rbox, mkTex, M } = kit;
  // pedal arm swept from its pivot up under the dash down to the pad, which is tipped back toward the driver
  const pedal = (part, x, padY, padZ, pivotY, pivotZ, w, h) => {
    const m = mat(0x4a4e55, "metal", P(part));
    add(
      sweep(
        [
          [x, pivotY, pivotZ],
          [x, padY + 0.03, padZ + h * 0.4],
          [x, padY + 0.012, padZ],
        ],
        0.008,
        { radial: 8 },
      ),
      m,
      part,
    );
    const pad = add(rbox(w, 0.02, h, 0.006), mat(0x1c1d1f, "rubber", P(part)), part);
    pad.position.set(x, padY, padZ);
    pad.rotation.x = -0.45;
  };
  pedal("brake-pedal", 0.37, 0.7, 0.43, 0.8, 0.64, 0.085, 0.06);
  pedal("gas-pedal", 0.24, 0.78, 0.4, 0.84, 0.6, 0.045, 0.12);
  add(at(rbox(0.07, 0.02, 0.16, 0.01), 0.6, 0.8, 0.4), mat(0x1c1d1f, "rubber"), null); // dead pedal (footrest)
  const hood = new THREE.Group();
  hood.position.set(0.66, 0.7, 0.5);
  root.add(hood);
  add(
    at(rbox(0.035, 0.06, 0.035, 0.006), 0, 0.03, 0),
    mat(0x23252a, "plastic", P("hood-release")),
    "hood-release",
    hood,
  );
  add(
    at(rbox(0.03, 0.05, 0.06, 0.008), -0.005, -0.02, -0.012),
    mat(0x3a3e45, "plastic", P("hood-release")),
    "hood-release",
    hood,
  );
  // trunk and fuel-door release levers on the floor at the lower left (outboard side) of the driver's seat
  const relBase = new THREE.Group();
  relBase.position.set(0.665, -0.02, 0.3);
  root.add(relBase);
  add(at(rbox(0.07, 0.2, 0.03, 0.01), 0, 0, 0.012), M.trim, null, relBase);
  const decal = (draw) =>
    new THREE.MeshBasicMaterial({ map: mkTex(iconCanvas(draw)), color: 0xbfc5cc, transparent: true });
  // car side view with the trunk lid popped open
  const trunkIcon = (g) => {
    g.beginPath();
    g.moveTo(14, 92);
    g.lineTo(14, 64);
    g.lineTo(40, 60);
    g.lineTo(60, 36);
    g.lineTo(98, 36);
    g.lineTo(114, 60);
    g.lineTo(114, 92);
    g.closePath();
    g.stroke();
    g.beginPath();
    g.moveTo(98, 36);
    g.lineTo(122, 18);
    g.stroke();
  };
  for (const [part, y, draw] of [
    ["trunk-release", 0.045, trunkIcon],
    ["fuel-release", -0.045, ICONS.fuel],
  ]) {
    const lever = new THREE.Group();
    lever.position.set(0, y, 0.03);
    relBase.add(lever);
    add(at(rbox(0.028, 0.075, 0.03, 0.009), 0, 0, 0.012), mat(0x2b2e33, "plastic", P(part)), part, lever);
    const d = add(new THREE.PlaneGeometry(0.024, 0.024), decal(draw), part, lever);
    d.position.set(0, 0, 0.0275);
    d.rotation.z = -Math.PI / 2;
  }
}

// Center console, shifter with its gate label, and the parking brake lever. Returns { pbrake, drawGate }.
export function buildConsole(kit) {
  const { THREE, mat, P, root, add, at, rbox, mkTex, M } = kit;
  add(at(rbox(0.22, 0.95, 0.15, 0.03), 0, 0.05, 0.4), M.trim, null);
  add(at(rbox(0.2, 0.3, 0.012, 0.01), 0, 0.33, 0.478), M.black, "shifter"); // shift gate plate
  const gateCv = document.createElement("canvas");
  gateCv.width = 64;
  gateCv.height = 256;
  const gateTex = mkTex(gateCv);
  const gateLabel = add(
    new THREE.PlaneGeometry(0.03, 0.12),
    new THREE.MeshBasicMaterial({ map: gateTex, transparent: true, toneMapped: false }),
    "shifter",
  );
  gateLabel.position.set(-0.045, 0.33, 0.4852);
  add(at(new THREE.BoxGeometry(0.012, 0.15, 0.002), 0, 0.33, 0.485), mat(0x0a0a0a, "plastic"), null); // slot
  const shifter = new THREE.Group();
  shifter.position.set(0, 0.395, 0.48);
  root.add(shifter);
  add(
    at(new THREE.CylinderGeometry(0.008, 0.01, 0.14, 12).rotateX(Math.PI / 2), 0, 0, 0.07),
    M.silver,
    "shifter",
    shifter,
  );
  add(
    lathe(
      { o: [0, 0, 0.12], a: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
      [
        [0, 0.016],
        [0.02, 0.022],
        [0.05, 0.026],
        [0.072, 0.018],
        [0.08, 0],
      ],
      24,
    ),
    mat(0x1f2124, "rubber", P("shifter")),
    "shifter",
    shifter,
  );
  add(at(new THREE.BoxGeometry(0.012, 0.01, 0.02), 0.022, 0, 0.165), M.silver, "shifter", shifter); // shift-lock button
  // parking brake: lever pivots at its front end; scene.js tips it up (rotation.x) while the brake is set
  const pbrake = new THREE.Group();
  pbrake.position.set(0, 0.16, 0.47);
  root.add(pbrake);
  const pbM = mat(0x24262a, "rubber", P("parking-brake"));
  add(
    sweep(
      [
        [0, 0, 0],
        [0, -0.12, 0.015],
        [0, -0.24, 0.02],
      ],
      [0.012, 0.017, 0.018],
      { radial: 12 },
    ),
    pbM,
    "parking-brake",
    pbrake,
  );
  add(
    at(new THREE.CylinderGeometry(0.008, 0.008, 0.016, 12).rotateX(Math.PI / 2), 0, -0.255, 0.02),
    M.silver,
    "parking-brake",
    pbrake,
  );
  add(at(new THREE.BoxGeometry(0.06, 0.3, 0.02), 0, 0.04, 0.47), M.black, null); // lever boot / slot in the console

  // gate label: P R N D D3 2 1, the current gear in orange
  function drawGate(gear) {
    const g = gateCv.getContext("2d");
    g.clearRect(0, 0, 64, 256);
    const gears = ["P", "R", "N", "D", "D3", "2", "1"];
    g.textAlign = "center";
    g.textBaseline = "middle";
    gears.forEach((s, i) => {
      g.font = "bold 28px Arial";
      g.fillStyle = s === gear ? "#ff9a3c" : "#cfd4da";
      g.fillText(s, 32, 22 + i * 34);
    });
    gateTex.needsUpdate = true;
  }
  return { pbrake, drawGate };
}
