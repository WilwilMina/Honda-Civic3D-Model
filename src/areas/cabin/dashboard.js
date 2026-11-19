// Cabin shell and dashboard: carpeted floor, toe board, transmission tunnel and kick panels; the 9th-gen dash body
// (side profiles pushed across the car, with a cut-out for the glove box and a raised hood over the gauges);
// and the center stack with the audio unit and the manual heater/A-C panel. Called from scene.js with the cabin kit.
// Frame: metres, +x = driver side, +y = front, z up; the driver's centre line is x = +0.37.

// Floor, toe board, transmission tunnel and kick panels.
export function buildFloor(kit) {
  const { THREE, add, at, rbox, yzPrism, M } = kit;
  add(at(new THREE.BoxGeometry(1.44, 2.05, 0.03), 0, -0.23, 0.285), M.carpet, null);
  add(
    yzPrism(
      [
        [0.76, 0.3],
        [1.03, 0.58],
        [1.03, 0.62],
        [0.74, 0.31],
      ],
      -0.71,
      0.71,
    ),
    M.carpet,
    null,
  ); // toe board
  add(at(rbox(0.26, 1.75, 0.12, 0.04), 0, -0.05, 0.33), M.carpet, null); // transmission tunnel
  add(at(rbox(0.04, 0.42, 0.38, 0.01), 0.7, 0.78, 0.49), M.trim, null); // driver kick panel
  add(at(rbox(0.04, 0.42, 0.38, 0.01), -0.7, 0.78, 0.49), M.trim, null);
}

// Dashboard body, glove-box cavity, knee bolster, vents and the passenger airbag door.
export function buildDashboard(kit) {
  const { THREE, mat, P, add, at, rbox, yzPrism, M } = kit;
  // Side profiles as [y, z] points. The dash is made of x-slices: FULL at the outer ends and the middle,
  // TOP over the glove box (open below z = 0.79), CLUSTER behind the steering wheel (with the hood over the gauges).
  const FULL = [
    [1.03, 0.975],
    [0.86, 1.0],
    [0.7, 0.985],
    [0.62, 0.955],
    [0.595, 0.9],
    [0.62, 0.78],
    [0.68, 0.68],
    [0.82, 0.6],
    [1.03, 0.58],
  ];
  const TOP = [
    [1.03, 0.975],
    [0.86, 1.0],
    [0.7, 0.985],
    [0.62, 0.955],
    [0.595, 0.9],
    [0.615, 0.79],
    [1.03, 0.79],
  ];
  const CLUSTER = [
    [1.03, 0.975],
    [0.86, 1.0],
    [0.7, 0.99],
    [0.585, 0.985],
    [0.58, 0.97],
    [0.665, 0.955],
    [0.69, 0.86],
    [0.66, 0.8],
    [0.68, 0.68],
    [0.82, 0.6],
    [1.03, 0.58],
  ];
  add(yzPrism(FULL, -0.715, -0.63), M.dash, "dash");
  add(yzPrism(TOP, -0.63, -0.16), M.dash, "dash");
  add(yzPrism(FULL, -0.16, 0.18), M.dash, "dash");
  add(yzPrism(CLUSTER, 0.18, 0.56), M.dash, "dash");
  add(yzPrism(FULL, 0.56, 0.715), M.dash, "dash");
  add(at(new THREE.BoxGeometry(0.47, 0.3, 0.02), -0.395, 0.88, 0.585), M.dash, "dash"); // glove-box cavity floor
  add(at(new THREE.BoxGeometry(0.47, 0.02, 0.21), -0.395, 1.02, 0.69), M.black, null); // cavity back wall
  for (const x of [-0.625, -0.165])
    add(at(new THREE.BoxGeometry(0.01, 0.4, 0.21), x, 0.83, 0.69), M.black, null);
  // knee bolster and lower trim under the steering column
  add(at(rbox(0.36, 0.06, 0.12, 0.02), 0.37, 0.7, 0.66), M.trim, "dash");
  // dash top vents (centre pair) and outboard round-ish vents
  for (const x of [-0.07, 0.07]) add(at(rbox(0.11, 0.02, 0.05, 0.008), x, 0.612, 0.925), M.black, null);
  for (const x of [0.64, -0.64]) add(at(rbox(0.1, 0.02, 0.06, 0.012), x, 0.612, 0.92), M.black, null);
  // passenger airbag door outline on the dash top (part of "airbags")
  add(at(rbox(0.3, 0.18, 0.006, 0.02), -0.36, 0.8, 0.995), mat(0x2f3237, "plastic", P("airbags")), "airbags");
}

// Center stack: audio unit with its small display, and the heater/A-C panel. Returns the audio display's redraw.
export function buildCenterStack(kit, state) {
  const { THREE, mat, P, add, at, rbox, facePlane, mkTex, M } = kit;
  add(at(rbox(0.26, 0.05, 0.33, 0.015), 0, 0.615, 0.78), M.trim, null); // stack bezel
  add(at(rbox(0.22, 0.02, 0.1, 0.008), 0, 0.59, 0.845), M.glossBlack, "audio");
  const audioCv = document.createElement("canvas");
  audioCv.width = 256;
  audioCv.height = 64;
  const audioTex = mkTex(audioCv);
  add(
    at(facePlane(0.11, 0.028), 0, 0.579, 0.868),
    new THREE.MeshBasicMaterial({ map: audioTex, toneMapped: false }),
    "audio",
  );
  for (const x of [-0.085, 0.085])
    add(at(new THREE.CylinderGeometry(0.014, 0.015, 0.016, 24), x, 0.574, 0.84), M.silver, "audio");
  // six preset buttons in two rows of three
  for (let i = 0; i < 6; i++)
    add(
      at(
        rbox(0.026, 0.008, 0.012, 0.003),
        -0.0425 + (i % 3) * 0.0425,
        0.578,
        0.832 - Math.floor(i / 3) * 0.018,
      ),
      M.black,
      "audio",
    );
  // heater / A-C panel (LX = manual A/C): fan dial, temperature dial, 4 mode buttons, A/C, defrost, recirculation
  add(at(rbox(0.22, 0.02, 0.11, 0.008), 0, 0.592, 0.72), M.dash, "hvac");
  const hvacMat = mat(0x5d636b, "metal", P("hvac"));
  for (const x of [-0.072, 0.072]) {
    add(at(new THREE.CylinderGeometry(0.025, 0.027, 0.022, 32), x, 0.575, 0.73), hvacMat, "hvac");
    add(at(new THREE.BoxGeometry(0.004, 0.004, 0.03), x, 0.563, 0.73), M.black, "hvac");
  }
  for (let i = 0; i < 4; i++)
    add(
      at(rbox(0.03, 0.01, 0.014, 0.003), -0.016 + (i % 2) * 0.032, 0.58, 0.745 - Math.floor(i / 2) * 0.02),
      M.black,
      "hvac",
    ); // mode buttons
  // A/C, defrost and recirculation buttons
  for (const x of [-0.05, 0, 0.05]) add(at(rbox(0.036, 0.01, 0.013, 0.003), x, 0.58, 0.684), M.black, "hvac");

  // audio display: blank with the key off, a radio readout otherwise
  function drawAudio() {
    const g = audioCv.getContext("2d");
    g.fillStyle = "#0b1a10";
    g.fillRect(0, 0, 256, 64);
    if (state.key !== "off") {
      g.fillStyle = "#9dffb8";
      g.font = "bold 30px monospace";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("FM1  ---.-", 128, 34);
    }
    audioTex.needsUpdate = true;
  }
  return { drawAudio };
}
