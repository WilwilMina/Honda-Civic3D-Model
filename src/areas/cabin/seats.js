// Seats and safety gear: the two front seats (with the side airbags in their outer bolsters), the curtain airbags
// in the roof rails, the rear bench, the driver's seat belt and the interior mirror. Called from scene.js.
// Frame: metres, +x = driver side, +y = front, z up; the front seats sit on x = ±0.37.
import { sweep } from "../../lib/geom.js";
import { COLORS } from "./kit.js";

// Build all seats, belts, side/curtain airbags and the mirror.
export function buildSeats(kit) {
  const { THREE, mat, P, root, add, at, rbox, facePlane, M } = kit;

  // front seat: cushion on a base, with a back that is its own group (reclined 0.3 rad about its bottom edge)
  function frontSeat(x, part) {
    const g = new THREE.Group();
    g.position.set(x, -0.04, 0.3);
    root.add(g);
    const sm = mat(COLORS.seat, "fabric", P(part)),
      sm2 = mat(0x33373d, "fabric", P(part));
    // base / rails, cushion, side bolsters
    add(at(new THREE.BoxGeometry(0.42, 0.46, 0.14), 0, 0.02, 0.07), mat(0x202124, "metal", P(part)), part, g);
    add(at(rbox(0.5, 0.52, 0.11, 0.04), 0, 0.03, 0.205), sm, part, g, true);
    for (const sx of [-0.21, 0.21]) add(at(rbox(0.08, 0.48, 0.05, 0.025), sx, 0.03, 0.26), sm2, part, g);
    const back = new THREE.Group();
    back.position.set(0, -0.22, 0.24);
    back.rotation.x = 0.3;
    g.add(back);
    add(at(rbox(0.5, 0.11, 0.64, 0.05), 0, -0.02, 0.32), sm, part, back, true);
    for (const sx of [-0.215, 0.215]) add(at(rbox(0.08, 0.1, 0.52, 0.04), sx, 0.025, 0.28), sm2, part, back);
    add(at(rbox(0.26, 0.09, 0.16, 0.04), 0, -0.01, 0.76), sm, part, back); // headrest
    for (const sx of [-0.07, 0.07])
      add(
        at(new THREE.CylinderGeometry(0.006, 0.006, 0.08, 8).rotateX(Math.PI / 2), sx, -0.01, 0.66),
        M.silver,
        part,
        back,
      ); // headrest posts
    return { seat: g, back };
  }
  const driver = frontSeat(0.37, "seat-driver");
  const passenger = frontSeat(-0.37, "seat-passenger");

  // side airbags live in the outer edge of each front seat-back; curtain airbags in the ceiling above the side windows
  const abM = mat(0x5b6068, "fabric", P("airbags"));
  for (const [seat, side] of [
    [driver, 1],
    [passenger, -1],
  ])
    add(at(rbox(0.012, 0.07, 0.22, 0.005), side * 0.257, 0.02, 0.36), abM, "airbags", seat.back);
  for (const side of [1, -1])
    add(
      sweep(
        [
          [side * 0.6, 0.2, 1.235],
          [side * 0.612, -0.4, 1.275],
          [side * 0.625, -1.0, 1.235],
        ],
        0.011,
        { radial: 8 },
      ),
      abM,
      "airbags",
    ); // tucked inside the roof rail (stays inside the closed body)

  // rear bench: cushion + reclined back with three headrests
  const rear = new THREE.Group();
  rear.position.set(0, -0.84, 0.3);
  root.add(rear);
  const rsm = mat(COLORS.seat, "fabric", P("rear-seat"));
  add(at(rbox(1.3, 0.5, 0.24, 0.05), 0, 0.05, 0.12), rsm, "rear-seat", rear);
  const rearBack = new THREE.Group();
  rearBack.position.set(0, -0.2, 0.22);
  rearBack.rotation.x = 0.4;
  rear.add(rearBack);
  add(at(rbox(1.3, 0.12, 0.62, 0.05), 0, 0, 0.31), rsm, "rear-seat", rearBack);
  for (const sx of [-0.45, 0, 0.45])
    add(at(rbox(0.22, 0.08, 0.13, 0.03), sx, 0, 0.66), rsm, "rear-seat", rearBack);

  // driver seat belt: from the B-pillar across the seat back to the inboard buckle, lap part to the outboard anchor
  const beltM = mat(0x1a1b1d, "fabric", P("seatbelt"));
  add(
    sweep(
      [
        [0.67, -0.36, 1.17],
        [0.58, -0.32, 1.07],
        [0.44, -0.23, 0.86],
        [0.3, -0.16, 0.64],
        [0.15, -0.22, 0.56],
      ],
      0.01,
      { radial: 8 },
    ),
    beltM,
    "seatbelt",
  );
  add(
    sweep(
      [
        [0.15, -0.22, 0.56],
        [0.37, -0.21, 0.53],
        [0.66, -0.29, 0.44],
      ],
      0.01,
      { radial: 8 },
    ),
    beltM,
    "seatbelt",
  );
  add(
    at(rbox(0.04, 0.06, 0.08, 0.01), 0.13, -0.25, 0.52),
    mat(0x2a2c30, "plastic", P("seatbelt")),
    "seatbelt",
  ); // buckle
  add(
    at(rbox(0.03, 0.05, 0.08, 0.01), 0.656, -0.36, 1.19),
    mat(0x55595f, "plastic", P("seatbelt")),
    "seatbelt",
  ); // upper anchor (inside the B-pillar skin)

  // interior mirror
  const mir = new THREE.Group();
  mir.position.set(0, 0.36, 1.27);
  root.add(mir);
  add(at(rbox(0.25, 0.03, 0.07, 0.025), 0, 0, 0), mat(0x2a2c30, "plastic", P("mirror")), "mirror", mir);
  add(at(facePlane(0.235, 0.055), 0, -0.016, 0), mat(0xc8d2dc, "chrome", P("mirror")), "mirror", mir);
  add(
    sweep(
      [
        [0, 0.005, 0.02],
        [0, 0.015, 0.035],
      ],
      0.008,
      { radial: 8 },
    ),
    mat(0x2a2c30, "plastic", P("mirror")),
    "mirror",
    mir,
  ); // short stem up to the windshield mount (stays under the glass)
}
