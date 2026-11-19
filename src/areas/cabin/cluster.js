// Instruments: the 9th-gen Civic's two-tier dash. The upper pod holds the digital speedometer and the i-MID
// screen; the lower cluster behind the steering wheel holds the tachometer, the fuel and gear displays and all
// the warning lights. The screens are canvas textures redrawn from the shared cabin `state` (key off / on / run),
// which also drives the key-on bulb-check demo. Called from scene.js; returns the handles scene.js animates.
import { iconCanvas, ICONS } from "./icons.js";

// ---------------------------------------------------------------------------------------------- warning lights
// slot: [rx, z] on the lower cluster face (rx = real driver's-view right, metres from the tach centre), or "imid".
// color: lit colour. run: what the light does after the engine starts during the bulb check demo:
//   "start" = goes off when the engine starts, number = goes off that many seconds after the key turns on,
//   "pbrake" = stays on while the parking brake is set, "belt" = stays on while the driver belt is unbuckled,
//   "cold" = stays on (engine still cold), "door" = on while the driver door is open, "never" = stays dark.
const RED = 0xff3b30,
  AMBER = 0xffa31a,
  GREEN = 0x3ddc84,
  BLUE = 0x3d8bff;
const UNLIT = 0x2c3036; // icon tint while a light is off
const LIGHTS = [
  // real left block: the red "stop / act now" lights
  { id: "light-brake", icon: "brake", color: RED, slot: [-0.152, 0.034], run: "pbrake" },
  { id: "light-oil", icon: "oil", color: RED, slot: [-0.152, 0.003], run: "start" },
  { id: "light-battery", icon: "battery", color: RED, slot: [-0.152, -0.028], run: "start" },
  { id: "light-srs", icon: "srs", color: RED, slot: [-0.12, 0.034], run: 5 },
  { id: "light-belt", icon: "belt", color: RED, slot: [-0.12, 0.003], run: "belt" },
  { id: "light-temp-high", icon: "tempH", color: RED, slot: [-0.12, -0.028], run: "start" },
  // real right block: the amber "get it checked" lights
  { id: "light-cel", icon: "cel", color: AMBER, slot: [0.12, 0.034], run: "start" },
  { id: "light-abs", icon: "abs", color: AMBER, slot: [0.12, 0.003], run: 5 },
  { id: "light-vsa", icon: "vsa", color: AMBER, slot: [0.12, -0.028], run: 5 },
  { id: "light-eps", icon: "eps", color: AMBER, slot: [0.152, 0.034], run: "start" },
  { id: "light-tpms", icon: "tpms", color: AMBER, slot: [0.152, 0.003], run: 5 },
  { id: "light-fuel", icon: "fuel", color: AMBER, slot: [0.152, -0.028], run: "start" },
  // bottom row under the tachometer
  { id: "light-temp-low", icon: "tempC", color: BLUE, slot: [-0.045, -0.053], run: "cold" },
  { id: "light-door", icon: "door", color: RED, slot: [-0.015, -0.053], run: "door" },
  { id: "light-key", icon: "key", color: GREEN, slot: [0.015, -0.053], run: 2 },
  { id: "light-info", icon: "info", color: AMBER, slot: [0.045, -0.053], run: "start" },
  // Maintenance Minder: an i-MID message on this car, not a bulb, so the bulb check leaves it dark
  { id: "light-wrench", icon: "wrench", color: AMBER, slot: "imid", run: "never" },
];
export const KEY_TO_START = 3.2; // seconds the demo waits in "key on" before it "starts the engine"

// Build the display pod, the gauge cluster and the warning lights. Returns
// { pod, lights, redraw(), drawImid(), refreshLights(t), update(dt, mirrored) }.
export function buildInstruments(kit, state) {
  const { THREE, mat, P, root, add, at, rbox, yzPrism, facePlane, mkTex, M } = kit;

  // ============================================================ upper display pod (digital speedometer + i-MID)
  const POD = [
    [0.82, 0.985],
    [0.82, 1.045],
    [0.76, 1.072],
    [0.69, 1.07],
    [0.655, 1.048],
    [0.66, 0.975],
  ];
  add(yzPrism(POD, -0.03, 0.6), M.dashTop, "dash");
  const tilt = Math.atan2(0.655 - 0.66, 1.048 - 0.975); // pod face (last two POD points) is almost vertical
  const pod = new THREE.Group();
  pod.position.set(0, 0.653, 1.012);
  pod.rotation.x = tilt;
  root.add(pod);
  // speedometer screen (driver centre) and i-MID screen (toward the middle of the car)
  const speedCv = document.createElement("canvas");
  speedCv.width = 512;
  speedCv.height = 160;
  const imidCv = document.createElement("canvas");
  imidCv.width = 384;
  imidCv.height = 192;
  const speedTex = mkTex(speedCv),
    imidTex = mkTex(imidCv);
  const scrMat = (tex) => new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
  add(at(facePlane(0.205, 0.066), 0.37, 0.004, 0), mat(0x1d2024, "plastic", P("speedo")), "speedo", pod);
  add(at(facePlane(0.19, 0.056), 0.37, -0.001, 0), scrMat(speedTex), "speedo", pod);
  add(at(facePlane(0.16, 0.07), 0.1, 0.004, 0), mat(0x1d2024, "plastic", P("imid")), "imid", pod);
  add(at(facePlane(0.13, 0.062), 0.095, -0.001, 0), scrMat(imidTex), "imid", pod);

  // ============================================================ lower gauge cluster
  // Local frame: origin at the tach centre on the driver's centre line, face tipped back 0.12 rad toward the driver.
  const cluster = new THREE.Group();
  cluster.position.set(0.37, 0.664, 0.905);
  cluster.rotation.x = -0.12;
  root.add(cluster);
  add(at(facePlane(0.37, 0.135), 0, 0.006, -0.004), M.black, null, cluster);
  // tachometer
  const tachCv = document.createElement("canvas");
  tachCv.width = tachCv.height = 256;
  const tachTex = mkTex(tachCv);
  add(
    at(new THREE.CylinderGeometry(0.054, 0.054, 0.006, 40), 0, 0.004, 0.014),
    mat(0x1d2024, "plastic", P("tach")),
    "tach",
    cluster,
  );
  add(
    at(facePlane(0.1, 0.1), 0, -0.0005, 0.014),
    new THREE.MeshBasicMaterial({ map: tachTex, transparent: true, toneMapped: false }),
    "tach",
    cluster,
  );
  const needle = new THREE.Group();
  needle.position.set(0, -0.003, 0.014);
  cluster.add(needle);
  const needleMat = new THREE.MeshBasicMaterial({ color: 0xff4a2a, toneMapped: false });
  add(at(new THREE.BoxGeometry(0.0025, 0.0015, 0.042), 0, 0, 0.019), needleMat, "tach", needle);
  add(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 16), M.black, "tach", needle);
  // fuel gauge (bar segments) on one side of the tach, shift-position display on the other.
  // (No coolant temperature gauge on this car: only the High/Low temperature lights.)
  const fuelGauge = { cv: document.createElement("canvas"), low: "E", high: "F", level: 0 };
  fuelGauge.cv.width = 128;
  fuelGauge.cv.height = 160;
  fuelGauge.tex = mkTex(fuelGauge.cv);
  const gearCv = document.createElement("canvas");
  gearCv.width = 128;
  gearCv.height = 160;
  const gearTex = mkTex(gearCv);
  // rx is the real driver's-view offset; the cluster's local x runs the other way, hence -rx
  for (const [tex, rx, part] of [
    [fuelGauge.tex, -0.082, "fuel-gauge"],
    [gearTex, 0.082, "gear-display"],
  ]) {
    add(at(facePlane(0.05, 0.085), -rx, 0.004, 0.008), mat(0x1d2024, "plastic", P(part)), part, cluster);
    add(
      at(facePlane(0.044, 0.078), -rx, -0.0005, 0.008),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }),
      part,
      cluster,
    );
  }
  // visor over the cluster
  add(
    yzPrism(
      [
        [0.71, 0.965],
        [0.575, 0.99],
        [0.565, 0.982],
        [0.7, 0.952],
      ],
      0.17,
      0.57,
    ),
    M.dashTop,
    "dash",
  );

  // warning lights: backing tile (standard material, glows when selected) + icon (basic material, lit/unlit)
  const lights = {};
  for (const L of LIGHTS) {
    const cv = iconCanvas(ICONS[L.icon]);
    const tex = mkTex(cv);
    const iconMat = new THREE.MeshBasicMaterial({
      map: tex,
      color: UNLIT,
      transparent: true,
      toneMapped: false,
      depthWrite: false,
    });
    const parent = L.slot === "imid" ? pod : cluster;
    const [x, z] = L.slot === "imid" ? [-0.012, 0.016] : [-L.slot[0], L.slot[1]];
    const s = L.slot === "imid" ? 0.022 : 0.025;
    const tile = add(
      at(rbox(s + 0.006, 0.003, s + 0.006, 0.003, 2), x, -0.0005, z),
      mat(0x101215, "plastic", P(L.id)),
      L.id,
      parent,
    );
    const icon = add(at(facePlane(s, s), x, -0.0025, z), iconMat, L.id, parent);
    icon.renderOrder = 2;
    lights[L.id] = { ...L, iconMat, tile, on: false };
  }

  // ============================================================ screen drawing
  function drawSpeed() {
    const g = speedCv.getContext("2d");
    g.fillStyle = "#07090b";
    g.fillRect(0, 0, 512, 160);
    if (state.key === "off") {
      speedTex.needsUpdate = true;
      return;
    }
    g.fillStyle = "#7fd3ff";
    g.font = "bold 104px Arial";
    g.textAlign = "right";
    g.textBaseline = "middle";
    g.fillText("0", 330, 84);
    g.font = "bold 34px Arial";
    g.textAlign = "left";
    g.fillText("mph", 350, 108);
    g.fillStyle = "#2c6f9a";
    g.fillRect(40, 30, 6, 100);
    g.fillRect(466, 30, 6, 100);
    speedTex.needsUpdate = true;
  }
  function drawImid() {
    const g = imidCv.getContext("2d");
    g.fillStyle = "#06080a";
    g.fillRect(0, 0, 384, 192);
    if (state.key !== "off") {
      g.fillStyle = "#cfe8ff";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = "bold 44px Arial";
      g.fillText(state.key === "on" ? "i-MID" : "12:00", 192, 70);
      g.font = "24px Arial";
      g.fillStyle = "#8fb6d6";
      g.fillText(state.key === "on" ? "Bulb check" : "Trip A  0.0 mi", 192, 128);
    }
    imidTex.needsUpdate = true;
  }
  // tach dial: 0–8 (x1000 r/min) over a 270° sweep starting at 135° (lower left), clockwise on the canvas
  function drawTach() {
    const g = tachCv.getContext("2d");
    g.clearRect(0, 0, 256, 256);
    g.fillStyle = "#0a0c0f";
    g.beginPath();
    g.arc(128, 128, 124, 0, Math.PI * 2);
    g.fill();
    const lit = state.key !== "off";
    g.strokeStyle = lit ? "#d9ecff" : "#4a5059";
    g.fillStyle = g.strokeStyle;
    g.font = "bold 22px Arial";
    g.textAlign = "center";
    g.textBaseline = "middle";
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI * (0.75 + (i / 8) * 1.5);
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(128 + Math.cos(a) * 112, 128 + Math.sin(a) * 112);
      g.lineTo(128 + Math.cos(a) * 94, 128 + Math.sin(a) * 94);
      g.stroke();
      g.fillText(String(i), 128 + Math.cos(a) * 76, 128 + Math.sin(a) * 76);
    }
    g.font = "15px Arial";
    g.fillText("x1000 r/min", 128, 178);
    tachTex.needsUpdate = true;
  }
  // fuel gauge: 8 bar segments lit up to fuelGauge.level (0..1)
  function drawFuelGauge() {
    const G = fuelGauge;
    const g = G.cv.getContext("2d");
    g.clearRect(0, 0, 128, 160);
    g.fillStyle = "#0a0c0f";
    g.fillRect(0, 0, 128, 160);
    const lit = state.key !== "off";
    const n = 8,
      on = Math.round(G.level * n);
    for (let i = 0; i < n; i++) {
      g.fillStyle = !lit ? "#22262c" : i < on ? "#9fd6ff" : "#28303a";
      g.fillRect(52, 136 - i * 15, 52, 10);
    }
    g.fillStyle = lit ? "#d9ecff" : "#4a5059";
    g.font = "bold 22px Arial";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(G.high, 26, 28);
    g.fillText(G.low, 26, 138);
    // tiny fuel-pump symbol
    g.save();
    g.translate(8, 60);
    g.scale(0.3, 0.3);
    g.fillStyle = g.strokeStyle = lit ? "#d9ecff" : "#4a5059";
    g.lineWidth = 7;
    g.lineCap = "round";
    ICONS.fuel(g);
    g.restore();
    G.tex.needsUpdate = true;
  }
  function drawGear() {
    const g = gearCv.getContext("2d");
    g.fillStyle = "#0a0c0f";
    g.fillRect(0, 0, 128, 160);
    const lit = state.key !== "off";
    ["P", "R", "N", "D", "D3", "2", "1"].forEach((s, i) => {
      g.font = "bold 19px Arial";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillStyle = !lit ? "#262a30" : s === "P" ? "#ffffff" : "#4f6f8a";
      g.fillText(s, 64, 22 + i * 20);
    });
    gearTex.needsUpdate = true;
  }

  // ============================================================ warning-light logic
  function setLight(id, on) {
    const L = lights[id];
    if (!L || L.on === on) return;
    L.on = on;
    L.iconMat.color.setHex(on ? L.color : UNLIT);
  }
  // t = seconds since key on
  function lightShouldBeOn(L, t) {
    if (state.key === "off" || L.run === "never") return false;
    if (state.key === "on") return true;
    if (L.run === "cold") return true; // the blue light stays on until the engine warms up
    if (L.run === "door") return state.door;
    if (L.run === "pbrake") return state.pbrake;
    if (L.run === "belt") return !state.belt;
    if (L.run === "start") return false;
    return t < L.run;
  }
  const refreshLights = (t) => {
    for (const id in lights) setLight(id, lightShouldBeOn(lights[id], t));
  };

  return {
    pod,
    lights,
    drawImid,
    refreshLights,
    // redraw every instrument screen (after the key changes)
    redraw() {
      drawSpeed();
      drawImid();
      drawTach();
      drawFuelGauge();
      drawGear();
    },
    // per frame: tach needle, fuel gauge fill and warning lights follow the key state
    update(dt, mirrored) {
      const target = state.key === "run" ? 0.09 : 0; // idle ≈ 720 rpm on the 0..1 (0–8000) dial
      state.rpm += (target - state.rpm) * Math.min(1, dt * 3);
      // same angles as the dial canvas; the needle turns about the cluster's y axis (flipped when mirrored)
      const a = Math.PI * (0.75 + 1.5 * state.rpm);
      needle.rotation.y = Math.atan2(Math.cos(a) * (mirrored ? -1 : 1), -Math.sin(a));
      const fuelT = state.key === "off" ? 0 : 0.62;
      if (Math.abs(fuelGauge.level - fuelT) > 0.01) {
        fuelGauge.level += (fuelT - fuelGauge.level) * Math.min(1, dt * 2.5);
        if (Math.abs(fuelGauge.level - fuelT) < 0.02) fuelGauge.level = fuelT;
        drawFuelGauge();
      }
      refreshLights(state.tKey);
    },
  };
}
