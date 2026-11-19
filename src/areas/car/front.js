// Front details of the car exterior: the front fascia (bumper face and nose, a surface of its own ahead of the lofted
// body), headlights, grille with chrome smile and badge, lower intake with the LX blank bezels, black undertray, the
// hood shut line along the lamp tops and the washer nozzles. Called by body.js createBody as a section: build(ctx, B).
// The hood creases and the nose's top edge belong to the body surface itself (body/section.js, body/profile.js).
import * as THREE from "three";
import { Y_END } from "./body/profile.js";
import { half, st } from "./body/section.js";
import { sideGeo, surf } from "./body/surface.js";
import { HL0, T_HLT, Y_HOOD0 } from "./body/cut-lines.js";
import { makeFF } from "./front/fascia-surface.js";
import { frontOutlines, frontProjector, gridGeo } from "./front/geometry.js";
import { buildHeadlights } from "./front/headlights.js";
import { buildGrille, buildLowerIntake } from "./front/grille.js";

export function build(ctx, B) {
  const { M, fb, hood, hoodPivot, dbl, mesh, parts } = B;
  const F = makeFF(); // the fascia surface: F.pt(t, z), t = 0 at the seam with the loft (y = Y_S) .. 1 at the centre
  const { zB, zC, zE0 } = F; // bottom, grille-top and lamp-top heights of the fascia
  const proj = frontProjector(F);
  const { ffGeo } = proj;
  const outlines = frontOutlines(F);
  const { lampT, tGo, zG0, zL0, zLS } = outlines;

  // ---------------------------------------------------------------- fascia panels (body colour)
  // Bands of rows (constant height z), each between t-limits, leaving holes for the grille opening (inside tGo) and
  // the headlight (lampT): below the grille; beside the grille; beside the lamp's lower outer end; between the lamp's
  // inner end and the grille; above the grille top up to the lamp tops.
  const paint = M.body;
  mesh(
    ffGeo(
      zB,
      zG0,
      () => 0,
      () => 1,
      { step: 0.006, k: 80 },
    ),
    paint,
    fb,
    "front-face",
  );
  mesh(
    ffGeo(
      zG0,
      zL0,
      () => 0,
      (z) => tGo(z),
      { step: 0.004, k: 70 },
    ),
    paint,
    fb,
    "front-face",
  );
  mesh(
    ffGeo(
      zL0,
      zLS,
      () => 0,
      (z) => lampT(z)?.[0] ?? 0,
      { step: 0.003, k: 30 },
    ),
    paint,
    fb,
    "front-face",
  );
  mesh(
    ffGeo(
      zL0,
      zC,
      (z) => lampT(z)?.[1] ?? tGo(z),
      (z) => Math.max(tGo(z), lampT(z)?.[1] ?? 0),
      { step: 0.003, k: 16 },
    ),
    paint,
    fb,
    "front-face",
  );
  mesh(
    ffGeo(
      zC,
      zE0,
      (z) => lampT(z)?.[1] ?? 0,
      () => 1,
      { step: 0.0015, k: 30 },
    ),
    paint,
    fb,
    "front-face",
  );
  // backing 4 mm behind the face below the lamps (hides any pinholes at the panel seams)
  mesh(
    ffGeo(
      zB + 0.004,
      zL0 + 0.004,
      () => 0.002,
      (z) => (z <= zG0 + 0.002 ? 1 : Math.max(0.002, tGo(z) - 0.004)),
      { step: 0.008, k: 30, off: -0.004 },
    ),
    paint,
    fb,
    "front-face",
  );
  // underside plate closing the fascia's bottom row (both halves)
  {
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const p = F.pt(i / 40, zB);
      pts.push(new THREE.Vector2(p[0], p[1]));
    }
    for (let i = 39; i >= 0; i--) {
      const p = F.pt(i / 40, zB);
      pts.push(new THREE.Vector2(-p[0], p[1]));
    }
    const geo = new THREE.ShapeGeometry(new THREE.Shape(pts), 1),
      p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i), p.getY(i), zB + 0.0005);
    geo.computeVertexNormals();
    mesh(geo, dbl(M.trim), fb, "front-under");
  }

  // ---------------------------------------------------------------- lamps, grille, intake (front/*.js)
  buildHeadlights(B, F, proj, outlines);
  buildGrille(B, F, proj, outlines);
  buildLowerIntake(B, proj);

  // ---------------------------------------------------------------- black undertray, set back under the body-
  // colour chin lip
  {
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const p = F.pt(i / 40, zB + 0.003),
        n = F.normal(i / 40, zB + 0.003);
      pts.push(new THREE.Vector2(p[0] - n[0] * 0.045, p[1] - n[1] * 0.045));
    }
    for (let i = 39; i >= 0; i--) pts.push(new THREE.Vector2(-pts[i].x, pts[i].y));
    const geo = new THREE.ShapeGeometry(new THREE.Shape(pts), 1),
      p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i), p.getY(i), zB - 0.012);
    geo.computeVertexNormals();
    mesh(geo, dbl(M.trim), fb, "front-undertray");
  }

  // ---------------------------------------------------------------- hood shut line along the lamp tops
  // The lamp top is the body side's top edge (u = 1) and the hood / fender skin starts just inside it (u 2.0002): close
  // that step with a dark strip. It starts where the lamp top reaches the side's top edge (yS0); behind that, the
  // fender's crest strip (u 1..2) above the lamp is body colour instead.
  {
    let yS0 = Y_END;
    for (let y = HL0; y < Y_END; y += 0.001)
      if (T_HLT(y) >= st(y).zt - 0.002) {
        yS0 = y;
        break;
      }
    for (const sd of [-1, 1])
      mesh(sideGeo(sd, HL0, yS0, 1, 2.0002, { crease: false, dens: 40 }), M.body, fb, "fender-crest");
    const ys = [];
    for (let y = yS0; y < Y_END; y += 0.004) ys.push(y);
    ys.push(Y_END);
    const P1 = (y, uu) => {
      // surface point on the driver half (gridGeo mirrors it)
      const q = half(st(y), uu);
      return [q[0], y, q[1]];
    };
    const rows = [ys.map((y) => [P1(y, 1), [0, 0, 1]]), ys.map((y) => [P1(y, 2.0002), [0, 0, 1]])];
    mesh(gridGeo(rows, { off: 0 }), M.trim, fb, "hood-shutline");
  }

  // ---------------------------------------------------------------- washer nozzles on the hood, just ahead of the cowl
  // (children of the hood group, which sits at the hinge: positions are made relative to hoodPivot)
  for (const x of [-0.3, 0.3]) {
    const sp = surf(Y_HOOD0 + 0.045, 4 + x * 1.15, 0.002);
    const nz = new THREE.Mesh(new THREE.SphereGeometry(0.006, 10, 8), M.trim);
    nz.scale.set(1, 1.4, 0.55);
    nz.position.copy(sp.p).sub(hoodPivot);
    const ng = new THREE.Group();
    ng.name = "washer-nozzle";
    ng.userData.goto = "lights";
    ng.add(nz);
    hood.add(ng);
    parts.washer.push(nz);
  }
}
