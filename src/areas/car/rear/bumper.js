// Rear bumper details and the finishing of the rear panels: bumper reflectors and the black diffuser, the black
// underside, a strip closing the crack between the body side and the top surface at the rear corners, dark backing
// under the panel gaps round the lid and the outer lamps, and shading fixes that fair the normals of the rear
// corners and give the bumper its ledge and turn-under lines.
import * as THREE from "three";
import { clamp, lerp, smooth01 } from "../body/profile.js";
import { half, st } from "../body/section.js";
import { patchGeo, rearGeo, rearRibbon, sideGeo, stationsIn, surfNormal } from "../body/surface.js";
import { TL0, Y_LID1, Y_LIDC, Y_RBA, Y_TRUNK0, chinU, lidEdge, tlLo, uRBump } from "../body/cut-lines.js";
import { sideFn } from "./geometry.js";

// buildBumperDetails(B): adds the bumper parts to the rear bumper group (rb) and the gap backing to the exterior (g),
// then adjusts the normals of the rear bumper and quarter meshes built by body/panels.js
export function buildBumperDetails(B) {
  const { M, g, rb, mat, dbl, mesh } = B;
  // ---------------------------------------------------------------- bumper: reflectors + diffuser
  for (const s of [-1, 1]) {
    // ~175 x 32 mm, |x| 0.571-0.745, z 0.359-0.391; rounded outer end, chamfered lower inner corner; sits in a shallow
    // pocket under the bumper's turn-under crease (dark pocket rim)
    const ZR0 = 0.359,
      ZR1 = 0.391;
    const outer = (z) => 0.745 - 0.008 * Math.pow(Math.abs((z - (ZR0 + ZR1) / 2) / ((ZR1 - ZR0) / 2)), 3);
    const inner = (z) => 0.571 + 0.016 * clamp((ZR0 + 0.014 - z) / 0.014, 0, 1);
    const [lo, hi] = sideFn(s, inner, outer);
    mesh(
      rearGeo(ZR0, ZR1, lo, hi, 0.0035, 4, 16),
      mat(0x9a1612, "lens", "car:reflector-red"),
      rb,
      "bumper-reflector",
    );
    const ring = [];
    for (let k = 0; k <= 8; k++) {
      const z = ZR0 + ((ZR1 - ZR0) * k) / 8;
      ring.push([s * (outer(z) + 0.003), z]);
    }
    for (let k = 8; k >= 0; k--) {
      const z = ZR0 + ((ZR1 - ZR0) * k) / 8;
      ring.push([s * (inner(z) - 0.003), z]);
    }
    ring.push(ring[0]);
    const rim = [];
    for (let k = 0; k < ring.length - 1; k++)
      for (let m = 0; m < 4; m++) {
        const t = m / 4;
        rim.push([lerp(ring[k][0], ring[k + 1][0], t), lerp(ring[k][1], ring[k + 1][1], t)]);
      }
    rim.push(ring[ring.length - 1]);
    mesh(
      rearRibbon(rim, 0.004, 0.0028),
      dbl(mat(0x3d4044, "plastic", "car:reflector-red")),
      rb,
      "reflector-pocket",
    );
  }
  {
    // black diffuser: ~65 mm tall in the centre, the body colour sweeping down around its ends in a concave curve
    const DZ0 = 0.247,
      DZ1 = 0.336;
    const hx = (z) =>
      0.4 + 0.105 * (1 - Math.sqrt(Math.max(0, 1 - Math.pow(clamp((DZ1 - z) / (DZ1 - 0.262), 0, 1), 2))));
    mesh(
      rearGeo(DZ0, DZ1, (z) => -hx(z), hx, 0.0015, 14, 48),
      M.mesh,
      rb,
      "diffuser",
    );
    const band = mat(0x2c2f33, "plastic", "car:grille");
    for (const z of [0.326, 0.313])
      mesh(
        rearRibbon(
          [
            [-0.38, z],
            [0, z],
            [0.38, z],
          ],
          0.0026,
          0.0026,
        ),
        dbl(band),
        rb,
        "diffuser",
      );
    // the bumper's underside and bottom flange are black plastic (no pale strip under the diffuser)
    for (const s of [-1, 1])
      mesh(
        sideGeo(s, -2.235, -1.95, -1, -0.015, { off: 0.0012, crease: false, dens: 20 }),
        M.trim,
        rb,
        "bumper-undertray",
      );
  }

  {
    // close the thin crack between the body side (u <= 1) and the top surface (u >= 2) around the rear corners (the
    // top surface's turned-down edge would otherwise leave see-through specks on the bumper face)
    for (const s of [-1, 1]) {
      const pos = [],
        nrm = [],
        idx = [],
        ys = stationsIn(-2.292, -2.0);
      for (const y of ys) {
        const s0 = st(y);
        // behind the outer lamp (y > -2.17) it stays a hairline (it would show through the lens); below it,
        // body.js fillets
        // u 1..2, so the strip spans the joint 1.5 mm under the skin and the T-junction cracks stay closed
        const wide = y < -2.17;
        for (const u of wide ? [0.95, 2.05] : [0.999, 2.0005]) {
          const q = half(s0, u),
            nn = surfNormal(y, s > 0 ? 7 - Math.min(u, 1) : Math.min(u, 1) + 1, s > 0 ? 1 : -1),
            o = wide ? 0.0015 : 0;
          pos.push(s * q[0] - nn.x * o, y - nn.y * o, q[1] - nn.z * o - (wide ? 0 : 0.0005));
          nrm.push(nn.x, nn.y, nn.z);
        }
      }
      for (let i = 0; i < ys.length - 1; i++) {
        const a = i * 2;
        idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
      geo.setIndex(idx);
      mesh(geo, M.body, rb, "bumper-edge-fill");
    }
  }

  {
    // dark backing under the panel gaps around the lid and under the outer lamps, so the gaps read as thin dark lines
    // instead of letting the car's far side show through
    const back = M.trim,
      o = { off: -0.008, crease: false, dens: 40 };
    for (const s of [-1, 1]) {
      mesh(
        sideGeo(
          s,
          Y_LID1 - 0.004,
          Y_TRUNK0 + 0.004,
          (y) => lidEdge(y) - 0.02,
          (y) => lidEdge(y) + 0.02,
          o,
        ),
        back,
        g,
        "lid-gap-backing",
      );
      mesh(
        sideGeo(
          s,
          Y_LIDC - 0.004,
          Y_LID1 + 0.002,
          (y) => 3 - chinU(y) - 0.02,
          (y) => 3 - chinU(y) + 0.02,
          o,
        ),
        back,
        g,
        "lid-gap-backing",
      );
      mesh(
        sideGeo(
          s,
          TL0 - 0.006,
          -1.95,
          (y) => uRBump(y) - 0.02,
          (y) => Math.min(1.02, tlLo(y) + 0.015),
          o,
        ),
        M.body,
        g,
        "lamp-gap-backing",
      ).castShadow = false;
      // dark backing under the bumper / quarter cut from the lamp down to the arch lip (no see-through slit)
      mesh(
        sideGeo(
          s,
          -1.962,
          Y_RBA + 0.002,
          (y) => Math.max(0, uRBump(y) - 0.03),
          (y) => Math.min(1, uRBump(y) + 0.03),
          { off: -0.007, crease: false, dens: 40 },
        ),
        dbl(mat(0x3c4045, "plastic", "car:trim")),
        g,
        "seam-backing",
      ).castShadow = false;
    }
    const cu = chinU(Y_LIDC);
    mesh(
      patchGeo(Y_LIDC - 0.01, Y_LIDC + 0.008, 4 - cu - 0.02, 4 + cu + 0.02, o),
      back,
      g,
      "lid-gap-backing",
    );
  }

  // ---------------------------------------------------------------- shading fixes
  // the bumper sides' last station (y = Y_REAR) has a degenerate section, so some analytic normals there point forward
  // and would light a small bright triangle on each side of the bumper face (|x| ~0.36, z ~0.51): reuse the next
  // row's normals
  for (const o of rb.children) {
    if (!o.isMesh || o.name) continue;
    const p = o.geometry.attributes.position,
      n = o.geometry.attributes.normal;
    let row = 0;
    while (row < p.count && p.getY(row) < -2.2915) row++;
    if (!row || row >= p.count) continue;
    for (let i = 0; i < row; i++)
      if (n.getY(i) > -0.9) n.setXYZ(i, n.getX(i + row), n.getY(i + row), n.getZ(i + row));
    n.needsUpdate = true;
  }

  {
    // fair the shading of the rear corners: average the paint normals of the bumper and the rear quarters over ~30 mm
    // (weighted, within R = 50 mm, using a hash grid of CELL-sized cells), across panel joins, for everything behind
    // y -1.85 (fading in over 80 mm). This smooths away small dents and seam lines where the side patches meet.
    const groups = [rb, g.getObjectByName("quarter-left"), g.getObjectByName("quarter-right")].filter(
      Boolean,
    );
    const recs = [];
    for (const grp of groups)
      for (const o of grp.children) {
        if (!o.isMesh || o.material !== M.body || !o.geometry.attributes.normal) continue;
        const p = o.geometry.attributes.position;
        for (let i = 0; i < p.count; i++) if (p.getY(i) < -1.85) recs.push(o.geometry, i);
      }
    const N = recs.length / 2,
      X = new Float32Array(N * 3),
      NN = new Float32Array(N * 3),
      CELL = 0.05,
      R = 0.05,
      grid = new Map();
    const key = (a, b, c) => (a + 512) * 1048576 + (b + 512) * 1024 + (c + 512);
    for (let k = 0; k < N; k++) {
      const geo = recs[2 * k],
        i = recs[2 * k + 1],
        p = geo.attributes.position,
        n = geo.attributes.normal;
      X[3 * k] = p.getX(i);
      X[3 * k + 1] = p.getY(i);
      X[3 * k + 2] = p.getZ(i);
      NN[3 * k] = n.getX(i);
      NN[3 * k + 1] = n.getY(i);
      NN[3 * k + 2] = n.getZ(i);
      const kk = key(
        Math.floor(X[3 * k] / CELL),
        Math.floor(X[3 * k + 1] / CELL),
        Math.floor(X[3 * k + 2] / CELL),
      );
      if (!grid.has(kk)) grid.set(kk, []);
      grid.get(kk).push(k);
    }
    for (let k = 0; k < N; k++) {
      const x = X[3 * k],
        y = X[3 * k + 1],
        z = X[3 * k + 2],
        cx = Math.floor(x / CELL),
        cy = Math.floor(y / CELL),
        cz = Math.floor(z / CELL);
      let sx = 0,
        sy = 0,
        sz = 0;
      for (let a = -1; a <= 1; a++)
        for (let b = -1; b <= 1; b++)
          for (let c = -1; c <= 1; c++) {
            const list = grid.get(key(cx + a, cy + b, cz + c));
            if (!list) continue;
            for (const j of list) {
              const d = Math.hypot(X[3 * j] - x, X[3 * j + 1] - y, X[3 * j + 2] - z);
              if (d > R) continue;
              const dot =
                NN[3 * j] * NN[3 * k] + NN[3 * j + 1] * NN[3 * k + 1] + NN[3 * j + 2] * NN[3 * k + 2];
              if (dot < 0.3) continue;
              const w = (1 - d / R) * (1 - d / R);
              sx += NN[3 * j] * w;
              sy += NN[3 * j + 1] * w;
              sz += NN[3 * j + 2] * w;
            }
          }
      const L = Math.hypot(sx, sy, sz) || 1,
        b = smooth01((-1.85 - y) / 0.08);
      let nx = lerp(NN[3 * k], sx / L, b),
        ny = lerp(NN[3 * k + 1], sy / L, b),
        nz = lerp(NN[3 * k + 2], sz / L, b);
      const l2 = Math.hypot(nx, ny, nz) || 1;
      recs[2 * k].attributes.normal.setXYZ(recs[2 * k + 1], nx / l2, ny / l2, nz / l2);
    }
    // bumper ledge and turn-under: between the turn-under crease at z ~0.40 and the ledge roll at z ~0.54 the lower
    // bumper face stands ~6 mm further back than the face above; the normals follow the slope analytically, so both
    // lines read crisply even on the coarse bumper mesh. Faded out where the surface turns to the sides.
    const A = 0.0055,
      sOf = (z) => A * (1 - smooth01((z - 0.512) / 0.05)) * smooth01((z - 0.372) / 0.036);
    for (const o of rb.children) {
      if (!o.isMesh || o.material !== M.body || !o.geometry.attributes.normal) continue;
      const p = o.geometry.attributes.position,
        n = o.geometry.attributes.normal;
      for (let i = 0; i < p.count; i++) {
        const z = p.getZ(i);
        if (z < 0.37 || z > 0.565 || p.getY(i) > -1.9) continue;
        const nx = n.getX(i),
          ny = n.getY(i),
          nz = n.getZ(i),
          w = smooth01((-ny - 0.35) / 0.4);
        if (w <= 0) continue;
        const sv = sOf(z) * w,
          ds = ((sOf(z + 0.001) - sOf(z - 0.001)) / 0.002) * w;
        p.setXYZ(i, p.getX(i) + nx * sv, p.getY(i) + ny * sv, z + nz * sv);
        let ux = -nz * nx,
          uy = -nz * ny,
          uz2 = 1 - nz * nz;
        const ul = Math.hypot(ux, uy, uz2) || 1;
        ux /= ul;
        uy /= ul;
        uz2 /= ul;
        const mx = nx - ds * ux,
          my = ny - ds * uy,
          mz = nz - ds * uz2,
          ml = Math.hypot(mx, my, mz) || 1;
        n.setXYZ(i, mx / ml, my / ml, mz / ml);
      }
      p.needsUpdate = n.needsUpdate = true;
      o.geometry.computeBoundingSphere();
    }
    for (const grp of groups)
      for (const o of grp.children)
        if (o.isMesh && o.geometry.attributes.normal) o.geometry.attributes.normal.needsUpdate = true;
  }
}
