// The body panels, cut from the shared surface along the lines in cut-lines.js: hood (hinged at the cowl), cowl cover,
// front bumper sides and nose strip, fenders, rockers, roof, pillars, windshield / rear glass, the four doors
// (doors.js), rear quarters, rear bumper and the trunk lid with its gooseneck hinges. Dark "backing" strips sit just
// under the shut lines so the panel gaps read as thin dark lines instead of showing the inside of the car.
import * as THREE from "three";
import { sweep } from "../../../lib/geom.js";
import { T_TOP, Y_END, Y_REAR, Y_S, lerp, smooth01 } from "./profile.js";
import { P, st, uz } from "./section.js";
import { capGeo, patchGeo, sideGeo } from "./surface.js";
import { buildDoors } from "./doors.js";
import {
  AP_F,
  AP_R,
  GAP,
  GAP_U,
  HL0,
  RGL,
  RGR,
  T_HLZ,
  TL0,
  TL1,
  U_EDGE,
  WSL,
  WSR,
  YQ1,
  Y_FB,
  Y_FD0,
  Y_FD1,
  Y_HOOD0,
  Y_HOOD1,
  Y_LID1,
  Y_LIDC,
  Y_LIP,
  Y_RB,
  Y_RBA,
  Y_RD0,
  Y_RD1,
  Y_RDT,
  Y_ROOF0,
  Y_ROOF1,
  Y_TRUNK0,
  Y_WS,
  chinU,
  doorCut,
  hlHi,
  hlLo,
  lidEdge,
  qFrame,
  tlLo,
  tlTop,
  uBump,
  uDoor,
  uFB,
  uFBlo,
  uRBump,
  zFB,
} from "./cut-lines.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// buildPanels(kit): builds every body panel into kit.g and returns the groups other code needs:
// {hood, hoodPivot, fb (front bumper), rb (rear bumper), doors, trunk, trunkSkin}.
// Hinged panels (hood, trunk lid) are a group at the hinge line holding a "skin" group offset back by the pivot, so
// the skin keeps world coordinates and rotating the outer group swings it about the hinge.
export function buildPanels({ g, M, mat, dbl, mesh }) {
  // ---------------------------------------------------------------- hood (hinged at its rear edge, rotates about x)
  const hoodPivot = V(0, Y_HOOD0 + GAP, P(Y_HOOD0 + GAP, 4)[2]);
  const hood = new THREE.Group();
  hood.name = "hood";
  hood.position.copy(hoodPivot);
  g.add(hood);
  const hoodSkin = new THREE.Group();
  hoodSkin.position.copy(hoodPivot).multiplyScalar(-1);
  hood.add(hoodSkin);
  const HOOD_GAP = 0.0055; // hood side gap (half u each side, ~8 mm in all), wide enough to read as a crisp shut line
  mesh(
    patchGeo(Y_HOOD0 + GAP, Y_HOOD1 - GAP, U_EDGE + 1 + HOOD_GAP, 7 - U_EDGE - HOOD_GAP, { dens: 60 }),
    M.hood,
    hoodSkin,
    "hood",
  );
  // hood inner frame (darker, slightly below the skin) so the open hood reads as a panel
  mesh(
    patchGeo(Y_HOOD0 + 0.03, Y_HOOD1 - 0.03, U_EDGE + 1.06, 7 - U_EDGE - 0.06, { off: -0.012, dens: 10 }),
    mat(0x9ea3a8, "metal", "car:hood"),
    hoodSkin,
    "hood-inner",
  );
  hood.userData.goto = "bay";

  // cowl cover (black plastic between hood and windshield)
  mesh(
    patchGeo(Y_WS - 0.005, Y_HOOD0 - 0.001, U_EDGE + 1, 7 - U_EDGE, { off: -0.03, dens: 12 }),
    M.trim,
    g,
    "cowl-cover",
  );

  // ---------------------------------------------------------------- front bumper (sides; the face is front.js)
  const fb = new THREE.Group();
  fb.name = "front-bumper";
  g.add(fb);
  for (const s of [-1, 1]) {
    mesh(sideGeo(s, Y_FB + GAP, Y_S, -1, uFBlo, { crease: false, dens: 50 }), M.body, fb);
    // dark backing behind the fascia / fender cut: one continuous line from the lamp's lower rear corner down
    // past the arch
    mesh(
      sideGeo(
        s,
        Y_FB - 0.004,
        Y_S,
        (y) => uz(y, zFB(y) - 0.02),
        (y) => uz(y, Math.min(zFB(y) + 0.012, T_HLZ(y) - 0.002)),
        { off: -0.008, crease: false, dens: 60 },
      ),
      M.trim,
      fb,
      "seam-backing",
    );
    mesh(
      sideGeo(s, Y_FB - 0.012, Y_FB + 0.014, 0, (y) => uz(y, 0.63), {
        off: -0.008,
        crease: false,
        dens: 40,
      }),
      M.trim,
      fb,
      "seam-backing",
    );
  }
  // top-surface strip ahead of the hood; its front edge is pulled onto the fascia's top line (straight in front view
  // from the grille top at the centre to the inner lamp tip), where the front.js fascia rows end
  {
    const sE = st(Y_END),
      zC = sE.zt + sE.crown,
      zE0 = sE.zt,
      xE0 = sE.Wbelt - 0.008;
    const geo = patchGeo(Y_HOOD1, Y_END, 3.0002, 4.9998, { crease: false }),
      p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const w = smooth01((p.getY(i) - (Y_END - 0.014)) / 0.014);
      if (w > 0) p.setZ(i, lerp(p.getZ(i), zC + (zE0 - zC) * Math.min(1, Math.abs(p.getX(i)) / xE0), w));
    }
    mesh(geo, M.trim, fb, "nose"); // thin black seal between the hood edge and the grille rim
  }

  // ---------------------------------------------------------------- fenders
  for (const s of [-1, 1]) {
    const fe = new THREE.Group();
    fe.name = s > 0 ? "fender-left" : "fender-right";
    g.add(fe);
    mesh(sideGeo(s, Y_FD1 + GAP, Y_FB, 0, 1), M.body, fe);
    mesh(sideGeo(s, Y_WS, Y_FB, 1, U_EDGE - HOOD_GAP), M.body, fe);
    mesh(
      sideGeo(s, Y_FB, HL0, (y) => uBump(y), U_EDGE - GAP_U),
      M.body,
      fe,
    );
    mesh(
      sideGeo(
        s,
        HL0,
        Y_S,
        (y) => (y < Y_FB ? uBump(y) : uFB(y)),
        (y) => hlLo(y) - 0.002,
        { dens: 70 },
      ),
      M.body,
      fe,
    ); // split at the creases and dense, so the shading behind the lamp tip stays clean
    mesh(
      sideGeo(s, HL0, Y_S, (y) => Math.min(1, hlHi(y) + 0.002), 1, { dens: 70 }),
      M.body,
      fe,
    ); // side strip above the lamp top (vanishes where the lamp top reaches u = 1)
    // fender top beside the lamp (front.js closes the step to the lamp)
    mesh(sideGeo(s, HL0, Y_S, 2.0002, U_EDGE - HOOD_GAP), M.body, fe);
    // fender top strip beside the hood, above the lamp
    mesh(sideGeo(s, Y_S, Y_HOOD1, 2.0002, U_EDGE - HOOD_GAP), M.body, fe);
    // dark flange under the hood / fender gap: the shut line reads as one crisp continuous line from the cowl to
    // the nose
    mesh(
      sideGeo(s, Y_HOOD0 - 0.004, Y_HOOD1 - 0.004, U_EDGE - 0.012, U_EDGE + 0.045, {
        off: -0.017,
        crease: false,
        dens: 40,
      }),
      M.trim,
      fe,
      "hood-gap-backing",
    );
    // black A-pillar base trim (triangle between the cowl and the front door)
    mesh(sideGeo(s, Y_FD1 + GAP, Y_WS, 1, 2, { off: 0.001 }), M.trim, fe, "a-pillar-base");
    mesh(
      sideGeo(s, Y_FD1 - 0.03, Y_FD1 + 0.01, 0.9, 2, { off: -0.006, dens: 12 }),
      M.trim,
      fe,
      "a-pillar-seal",
    );
    mesh(
      sideGeo(s, Y_FD1 - 0.03, Y_HOOD0 + 0.02, 0.85, 2.25, { off: -0.012, dens: 12, crease: false }),
      M.trim,
      fe,
      "a-pillar-backing",
    );
  }

  // ---------------------------------------------------------------- rockers (with a dark lower lip) and door
  // shut lines
  const seamM = dbl(mat(0x3c4045, "plastic", "car:trim")); // shut-line backing: dark grey, not black (thin even gaps)
  for (const s of [-1, 1]) {
    mesh(
      sideGeo(s, Y_RD0, Y_FD1, -0.15, (y) => uDoor(y) - GAP_U),
      M.body,
      g,
      "rocker",
    );
    mesh(
      sideGeo(s, Y_RD0 + 0.02, Y_FD1 - 0.02, -0.15, (y) => uz(y, 0.228), { off: 0.002 }),
      M.trim,
      g,
      "rocker-lip",
    );
    // dark backing behind the door shut-lines so the gaps read as thin dark lines
    mesh(
      sideGeo(
        s,
        Y_RD0 - 0.01,
        Y_FD1 + 0.01,
        (y) => uDoor(y) - 0.03,
        (y) => uDoor(y) + 0.03,
        { off: -0.008, crease: false, dens: 12 },
      ),
      seamM,
      g,
      "seam-backing",
    );
    for (const ys of [Y_FD1, (Y_FD0 + Y_RD1) / 2])
      mesh(
        sideGeo(s, ys - 0.025, ys + 0.025, (y) => uDoor(y), 1.0, { off: -0.01, crease: false, dens: 40 }),
        seamM,
        g,
        "seam-backing",
      );
    mesh(
      sideGeo(
        s,
        Y_RD0 - 0.025,
        Y_RD0 + 0.012,
        (y) => uDoor(y),
        (y) => doorCut(y) + 0.03,
        { off: -0.01, crease: false, dens: 40 },
      ),
      seamM,
      g,
      "seam-backing",
    );
    // continuous backing under the whole rear-door rear cut (tip -> arch), so the gap never shows through as dashes
    mesh(
      sideGeo(
        s,
        Y_RDT - 0.01,
        Y_RD0 - 0.02,
        (y) => Math.max(0, doorCut(y) - 0.04),
        (y) => Math.min(1.0, doorCut(y) + 0.04),
        { off: -0.006, crease: false, dens: 60 },
      ),
      seamM,
      g,
      "seam-backing",
    );
  }

  // ---------------------------------------------------------------- roof, pillars, glass, doors
  mesh(patchGeo(Y_ROOF0, Y_ROOF1, 3, 5), M.body, g, "roof");
  // roof skin laps ~40 mm over the windshield header and the rear-glass top (hides the ends of the black frit bands)
  mesh(patchGeo(Y_ROOF1 - 0.004, Y_ROOF1 + 0.036, 3.02, 4.98, { off: 0.001 }), M.body, g, "roof-lap");
  mesh(patchGeo(Y_ROOF0 - 0.032, Y_ROOF0 + 0.002, 3.02, 4.98, { off: 0.001 }), M.body, g, "roof-lap");
  for (const s of [-1, 1]) {
    mesh(
      sideGeo(s, Y_ROOF1, Y_WS, 2, (y) => 2 + AP_F(y)),
      M.body,
      g,
      "a-pillar",
    );
    // painted pillar cover lip standing ~4 mm proud over the windshield edge (the glass edge tucks behind it)
    mesh(
      sideGeo(
        s,
        Y_ROOF1 + 0.01,
        Y_WS - 0.01,
        (y) => 2 + AP_F(y) - 0.01,
        (y) => 2 + AP_F(y) + 0.045,
        { off: 0.011, crease: false, dens: 60 },
      ),
      M.body,
      g,
      "a-pillar-cover",
    );
    mesh(
      sideGeo(
        s,
        Y_ROOF1 + 0.01,
        Y_WS - 0.01,
        (y) => 2 + AP_F(y) + 0.043,
        (y) => 2 + AP_F(y) + 0.047,
        { off: 0.0, crease: false, dens: 60 },
      ),
      M.trim,
      g,
      "a-pillar-cover-edge",
    );
    mesh(
      sideGeo(s, Y_TRUNK0, Y_ROOF0, 2, (y) => 2 + AP_R(y)),
      M.body,
      g,
      "c-pillar-top",
    );
  }
  const windshield = mesh(
    patchGeo(Y_ROOF1 - 0.004, Y_WS, WSL, WSR, { off: -0.002 }),
    M.glass,
    g,
    "windshield",
  );
  windshield.castShadow = false;
  const rearGlass = mesh(
    patchGeo(Y_TRUNK0 + 0.004, Y_ROOF0, RGL, RGR, { off: -0.002 }),
    M.glass,
    g,
    "rear-window",
  );
  rearGlass.castShadow = false;
  const doors = buildDoors({ g, M, mat, mesh });
  // B-pillar (black applique) between the doors
  for (const s of [-1, 1])
    mesh(
      sideGeo(s, Y_RD1 - 0.012, Y_FD0 + 0.012, 1.0, 2.0, { off: -0.003, dens: 10 }),
      M.trim,
      g,
      "b-pillar",
    ); // overlaps both frames: no light seam

  // ---------------------------------------------------------------- rear quarters
  for (const s of [-1, 1]) {
    const q = new THREE.Group();
    q.name = s > 0 ? "quarter-left" : "quarter-right";
    g.add(q);
    mesh(sideGeo(s, Y_RBA, Y_RDT - GAP, 0, 1.0), M.body, q);
    mesh(
      sideGeo(s, Y_RDT - GAP, Y_RD0 - GAP, 0, (y) => doorCut(y) - GAP_U),
      M.body,
      q,
    ); // around the arch under the rear door tip
    mesh(sideGeo(s, Y_TRUNK0, Y_RDT - GAP, 1.0, 2.0), M.body, q, "c-pillar");
    mesh(
      sideGeo(s, Y_RDT - GAP, YQ1, (y) => qFrame(y) + 0.003, 2.0),
      M.body,
      q,
      "c-pillar",
    ); // body above the pointed tip of the rear side window
    mesh(
      sideGeo(s, -2.0, Y_TRUNK0, 2.0, (y) => lidEdge(y) - 0.003),
      M.body,
      q,
      "deck-gutter",
    );
    mesh(
      sideGeo(
        s,
        Y_LID1,
        -2.0,
        (y) => Math.max(2.0, tlTop(y) + 0.003),
        (y) => Math.max(Math.max(2.0, tlTop(y) + 0.003) + 0.0005, lidEdge(y) - 0.003),
        { crease: false },
      ),
      M.body,
      q,
      "deck-gutter",
    );
    // rear corner above the bumper, cut around the outer taillight
    mesh(
      sideGeo(s, Y_REAR, TL0, (y) => uRBump(y) + GAP_U, 1.0, { crease: false, dens: 34 }),
      M.body,
      q,
    );
    mesh(
      sideGeo(
        s,
        TL0,
        TL1,
        (y) => uRBump(y) + GAP_U,
        (y) => tlLo(y) - 0.003,
        { crease: false, dens: 34 },
      ),
      M.body,
      q,
    );
    mesh(
      sideGeo(s, TL0, TL1, (y) => Math.min(1, tlTop(y) + 0.003), 1.0, { crease: false, dens: 34 }),
      M.body,
      q,
    );
    mesh(
      sideGeo(s, TL1, Y_RBA, (y) => uRBump(y) + GAP_U, 1.0),
      M.body,
      q,
    );
  }

  // ---------------------------------------------------------------- rear bumper
  const rb = new THREE.Group();
  rb.name = "rear-bumper";
  g.add(rb);
  for (const s of [-1, 1]) {
    // fine enough for the ledge / turn-under shading (rear/bumper.js)
    mesh(sideGeo(s, Y_REAR, Y_RB, -1, uRBump, { crease: false, dens: 56 }), M.body, rb);
    // tapering front tip down to the arch lip
    mesh(sideGeo(s, Y_RB, Y_RBA, 0, uRBump, { crease: false, dens: 56 }), M.body, rb);
  }
  {
    // centre of the bumper face: rows ~4 mm apart in height for the ledge line (rear/bumper.js)
    const y1 = Y_LIDC - 0.0015,
      ys = [Y_REAR];
    let zl = T_TOP(Y_REAR);
    for (let y = Y_REAR + 0.0002; y < y1 - 0.0005; y += 0.0002)
      if (Math.abs(T_TOP(y) - zl) >= 0.004 || y - ys[ys.length - 1] >= 0.005) {
        ys.push(y);
        zl = T_TOP(y);
      }
    ys.push(y1);
    mesh(patchGeo(Y_REAR, y1, 3, 5, { crease: false, ys, dens: 60 }), M.body, rb, "bumper-top");
  }
  mesh(
    patchGeo(Y_LIDC - 0.0015, Y_LID1 - 0.0015, 3, (y) => 4 - chinU(y) - 0.0035, { crease: false }),
    M.body,
    rb,
    "bumper-top",
  );
  mesh(
    patchGeo(Y_LIDC - 0.0015, Y_LID1 - 0.0015, (y) => 4 + chinU(y) + 0.0035, 5, { crease: false }),
    M.body,
    rb,
    "bumper-top",
  );
  mesh(capGeo(Y_REAR, -1), M.body, rb, "rear-face");

  // ---------------------------------------------------------------- trunk lid (hinged at its front edge)
  const trunkPivot = V(0, Y_TRUNK0 - GAP, P(Y_TRUNK0 - GAP, 4)[2]);
  const trunk = new THREE.Group();
  trunk.name = "trunk-lid";
  trunk.position.copy(trunkPivot);
  g.add(trunk);
  const trunkSkin = new THREE.Group();
  trunkSkin.position.copy(trunkPivot).multiplyScalar(-1);
  trunk.add(trunkSkin);
  // the lid face (below the ducktail lip) gets rows ~2.5 mm apart in height and fine columns so rear/lid.js can inset
  // the plate recess into it with crisp edges
  const faceRows = (y0, y1, dz = 0.0025) => {
    const out = [y0];
    let zl = T_TOP(y0),
      yl = y0;
    for (let y = y0 + 0.0001; y < y1 - 0.0004; y += 0.0001)
      if (Math.abs(T_TOP(y) - zl) >= dz || y - yl >= 0.003) {
        out.push(y);
        zl = T_TOP(y);
        yl = y;
      }
    out.push(y1);
    return out;
  };
  const lidL = (y) => lidEdge(y) + 1 + 0.003,
    lidR = (y) => 7 - lidEdge(y) - 0.003;
  mesh(patchGeo(Y_LIP, Y_TRUNK0 - GAP, lidL, lidR), M.trunk, trunkSkin, "trunk-skin");
  mesh(
    patchGeo(Y_LID1, Y_LIP, lidL, lidR, { ys: faceRows(Y_LID1, Y_LIP), dens: 96 }),
    M.trunk,
    trunkSkin,
    "trunk-skin",
  ).userData.lidFace = true;
  mesh(
    patchGeo(
      Y_LIDC - 0.0008,
      Y_LID1,
      (y) => 4 - chinU(y),
      (y) => 4 + chinU(y),
      { ys: faceRows(Y_LIDC - 0.0008, Y_LID1), dens: 96 },
    ),
    M.trunk,
    trunkSkin,
    "trunk-skin",
  ).userData.lidFace = true;
  mesh(
    patchGeo(
      Y_LID1 + 0.03,
      Y_TRUNK0 - 0.04,
      (y) => lidEdge(y) + 1.08,
      (y) => 7 - lidEdge(y) - 0.08,
      { off: -0.015, dens: 10 },
    ),
    mat(0x9ea3a8, "metal", "car:trunk"),
    trunkSkin,
    "trunk-inner",
  );
  trunk.userData.goto = "trunk";
  // gooseneck hinges
  for (const s of [-1, 1]) {
    const x = s * 0.5,
      z0 = P(Y_TRUNK0, 4)[2] - 0.035;
    mesh(
      sweep(
        [
          [x, Y_TRUNK0 - 0.02, z0],
          [x, Y_TRUNK0 + 0.05, z0],
          [x, Y_TRUNK0 + 0.12, z0 - 0.03],
          [x, Y_TRUNK0 + 0.16, z0 - 0.09],
        ],
        0.008,
        { radial: 8 },
      ),
      M.trim,
      trunkSkin,
      "hinge",
    );
  }
  return { hood, hoodPivot, fb, rb, doors, trunk, trunkSkin };
}
