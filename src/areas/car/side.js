// Side details of the car exterior: black frit bands round the windshield and rear glass, the in-glass antenna, door
// handles, mirrors, the fuel door and the wheel-well liners with their dark arch lips. Called by body.js createBody
// as a section: build(ctx, B). Door skins, window frames, rockers and the lower crease are body panels
// (body/panels.js, body/doors.js); the wheels are in body/fittings.js.
import * as THREE from "three";
import { prism, sweep } from "../../lib/geom.js";
import { ARCHES, WHEEL, WZ } from "./body/profile.js";
import { st, uz } from "./body/section.js";
import { patchGeo, sideGeo, surf } from "./body/surface.js";
import { RGL, RGR, WSL, WSR, Y_ROOF0, Y_ROOF1, Y_TRUNK0, Y_WS } from "./body/cut-lines.js";

export function build(ctx, B) {
  const { M, doors, g, mat, mesh } = B;
  // ---------------------------------------------------------------- glass trim
  // black frit band (the painted black edge of the glass) round the windshield and rear glass
  for (const [y0, y1, Lf, Rf] of [
    [Y_ROOF1 - 0.004, Y_WS, WSL, WSR],
    [Y_TRUNK0 + 0.004, Y_ROOF0, RGL, RGR],
  ]) {
    mesh(
      patchGeo(y0, y1, Lf, (y) => Lf(y) + 0.03, { off: -0.001, dens: 40 }),
      M.trim,
      g,
    );
    mesh(
      patchGeo(y0, y1, (y) => Rf(y) - 0.03, Rf, { off: -0.001, dens: 40 }),
      M.trim,
      g,
    );
  }
  mesh(patchGeo(Y_WS - 0.03, Y_WS, WSL, WSR, { off: -0.001 }), M.trim, g);
  mesh(patchGeo(Y_ROOF1 - 0.004, Y_ROOF1 + 0.04 - 0.004, WSL, WSR, { off: -0.001 }), M.trim, g);
  mesh(patchGeo(Y_ROOF0 - 0.03, Y_ROOF0, RGL, RGR, { off: -0.001 }), M.trim, g);
  mesh(patchGeo(Y_TRUNK0 + 0.004, Y_TRUNK0 + 0.035, RGL, RGR, { off: -0.001 }), M.trim, g);
  // in-glass antenna lines on the rear window (the LX has no roof mast)
  for (let k = 0; k < 4; k++) {
    const yy = Y_TRUNK0 + 0.14 + k * 0.1;
    mesh(
      patchGeo(
        yy,
        yy + 0.003,
        (y) => RGL(y) + 0.08,
        (y) => RGR(y) - 0.08,
        { off: 0.001, dens: 20 },
      ),
      mat(0x8a6a4a, "plastic", "car:antenna"),
      g,
      "antenna",
    );
  }

  // ---------------------------------------------------------------- door handles (on each door's skin, so they swing)
  for (const id of ["fl", "fr", "rl", "rr"]) {
    const { side, skin, handleY: hy } = doors[id];
    // pull-type handle, body colour, just under the shoulder line near the rear edge
    const hz = st(hy).zsh - 0.022; // just under the crisp shoulder line
    const sp = surf(hy, side > 0 ? 7 - uz(hy, hz) : uz(hy, hz) + 1, 0);
    const h = new THREE.Mesh(new THREE.CapsuleGeometry(0.019, 0.172, 4, 12), M.doors); // ~210 x 38 mm horizontal pull
    h.scale.set(0.45, 1, 1);
    const hg = new THREE.Group();
    hg.position.copy(sp.p.clone().add(sp.n.clone().multiplyScalar(0.012)));
    hg.add(h);
    skin.add(hg);
    const rec = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.015, 0.13, 4, 10),
      mat(0x8c9196, "paint", "car:doors"),
    );
    rec.scale.set(0.25, 1, 1);
    rec.position.copy(sp.p.clone().add(sp.n.clone().multiplyScalar(0.0015)));
    rec.position.z -= 0.012;
    skin.add(rec);
  }
  // ---------------------------------------------------------------- mirrors
  // on the front doors, at the front corner of the glass (matched to the reference photos): a body-colour cap
  // (~160 mm fore-aft x 110 mm tall, tapering toward its outer end, reaching ~0.98 m from the centre line) on a
  // black wedge base that sits on the door skin just under the belt
  for (const s of [-1, 1]) {
    const d = doors[s > 0 ? "fl" : "fr"].group.children[0];
    const my = 0.62,
      sp = surf(my, s > 0 ? 7 - 1.0 : 2.0, 0);
    const mg = new THREE.Group();
    mg.position.copy(sp.p);
    d.add(mg);
    // black triangular foot on the door corner + a short arm up into the cap's black underside
    const base = new THREE.Mesh(
      prism(
        { o: [0, 0, 0], a: [s, 0, 0], u: [0, 1, 0], v: [0, 0, 1] },
        [
          [-0.07, -0.02],
          [0.085, -0.02],
          [0.03, 0.065],
          [-0.05, 0.065],
        ],
        -0.012,
        0.016,
      ),
      M.trim,
    );
    base.name = "mirror-base";
    mg.add(base);
    const arm = new THREE.Mesh(
      prism(
        { o: [0, 0, 0], a: [s, 0, 0], u: [0, 1, 0], v: [0, 0, 1] },
        [
          [-0.06, 0.03],
          [0.045, 0.03],
          [0.03, 0.1],
          [-0.05, 0.1],
        ],
        0.0,
        0.11,
      ),
      M.trim,
    );
    arm.name = "mirror-arm";
    mg.add(arm);
    const cg = new THREE.SphereGeometry(1, 28, 18);
    {
      const p = cg.attributes.position,
        f = (v) => Math.sign(v) * Math.pow(Math.abs(v), 0.55);
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i),
          y = p.getY(i),
          z = p.getZ(i),
          out = Math.max(0, s * f(x));
        p.setXYZ(
          i,
          f(x),
          f(y) * (y < 0 ? 0.55 : 1) * (1 - 0.12 * out),
          f(z) * (1 - 0.28 * out * out) + 0.12 * out * out,
        );
      }
      cg.computeVertexNormals();
    }
    const cap = new THREE.Mesh(cg, M.doors);
    cap.name = "mirror-cap";
    cap.scale.set(0.082, 0.108, 0.056);
    cap.position.set(s * 0.116, -0.046, 0.12);
    cap.rotation.z = -s * 0.18; // outer end swept back
    mg.add(cap);
    const under = new THREE.Mesh(cg, M.trim); // black lower housing showing as a band under the cap
    under.scale.set(0.08, 0.105, 0.022);
    under.position.set(s * 0.116, -0.045, 0.083);
    under.rotation.z = -s * 0.18;
    mg.add(under);
    const glassM = new THREE.Mesh(new THREE.CircleGeometry(1, 24), mat(0x9fb3c0, "chrome", "car:mirror"));
    glassM.scale.set(0.068, 0.042, 1);
    glassM.rotation.x = Math.PI / 2;
    glassM.rotation.y = -s * 0.18;
    glassM.position.set(s * 0.116, -0.112, 0.12);
    mg.add(glassM);
  }

  // ---------------------------------------------------------------- fuel door
  // on the driver's (left, +x) rear quarter, above the rear wheel (round, ~130 mm)
  {
    const s = 1,
      q = g.getObjectByName("quarter-left");
    const fy = -1.403,
      fz = 0.895,
      r = 0.065;
    const hw = (y) => Math.sqrt(Math.max(0, r * r - (y - fy) * (y - fy)));
    mesh(
      sideGeo(
        s,
        fy - r + 0.001,
        fy + r - 0.001,
        (y) => uz(y, fz - hw(y)),
        (y) => uz(y, fz + hw(y)),
        { off: 0.0015, dens: 90, crease: false },
      ),
      M.body,
      q,
      "fuel-door",
    );
    const ring = [];
    for (let k = 0; k <= 40; k++) {
      const a = (k / 40) * Math.PI * 2,
        yy = fy + Math.cos(a) * r,
        zz = fz + Math.sin(a) * r;
      ring.push(surf(yy, 7 - uz(yy, zz), 0.0012).p.toArray());
    }
    mesh(sweep(ring, 0.0016, { radial: 6, closed: true }), M.trim, q, "fuel-door-gap");
  }
  // ---------------------------------------------------------------- wheel-well liners
  for (const [id, [x, y]] of Object.entries(WHEEL)) {
    const s = Math.sign(x);
    const R = (y > 0 ? ARCHES[0][1] : ARCHES[1][1]) + 0.03;
    // (kept inside the body: outer edge at |x| 0.83 behind the arch lip, ends stop above the tucked-in rocker/bumper)
    const lg = new THREE.CylinderGeometry(R, R, 0.21, 36, 1, true, -Math.PI * 0.52, Math.PI * 1.04);
    // cylinder axis y -> car x; theta measured so the open side faces down
    lg.rotateZ(Math.PI / 2);
    const l = mesh(lg, M.liner, g, "liner-" + id);
    l.position.set(s * 0.725, y, WZ + 0.004);
    // dark inboard wall over the band between the tyre top and the liner, so the bay / trunk / cabin parts don't show
    // as light specks through the arch from outside (the wheel area itself stays open for the chassis views)
    // ends stay above the body's lower edge
    const iw = new THREE.RingGeometry(0.322, R + 0.002, 40, 1, 0.03 * Math.PI, 0.94 * Math.PI);
    iw.rotateX(Math.PI / 2);
    iw.rotateZ(Math.PI / 2);
    const iwm = mesh(iw, M.liner, g, "liner-wall-" + id);
    iwm.position.set(s * 0.62, y, WZ + 0.004);
    iwm.castShadow = false;
    // (no full inner well wall: it would hide the bay parts seen through the arch)
    // black return flange just inside the arch lip (hides the inside of the fender skin)
    const Ra = y > 0 ? ARCHES[0][1] : ARCHES[1][1];
    // ends stay above the body's lower edge
    const lip = new THREE.RingGeometry(Ra - 0.004, R + 0.004, 40, 1, 0.05 * Math.PI, 0.9 * Math.PI);
    lip.rotateX(Math.PI / 2);
    lip.rotateZ(Math.PI / 2);
    const lm = mesh(lip, M.liner, g, "liner-lip-" + id);
    lm.position.set(s * 0.835, y, WZ + 0.004);
    lm.castShadow = false;
    l.castShadow = false;
  }
}
