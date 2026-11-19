// Trunk lid details (all on the lid skin, so they open with it): the chrome bar, the H badge and CIVIC script, the
// inset licence-plate recess and the plate, and the ducktail lip (a small kick-up of the deck's rear edge with a
// rounded nose). The lid outline and its face rows come from body/panels.js.
import * as THREE from "three";
import { sweep } from "../../../lib/geom.js";
import { clamp, lerp, smooth01 } from "../body/profile.js";
import { P } from "../body/section.js";
import { rearHit, rearN, rearRibbon, surf, surfNormal } from "../body/surface.js";
import { T_SEAM, Y_LIP, lidEdge } from "../body/cut-lines.js";
import { RECESS_DEPTH, XTIP, ZBAR, yFace } from "./geometry.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// buildLidDetails(B): adds the lid details to the trunk lid skin (trunkSkin) and insets the plate recess into the lid
// face patches (those marked userData.lidFace by body/panels.js)
export function buildLidDetails(B) {
  const { M, mat, dbl, mesh, trunkSkin } = B;
  {
    // the chrome bar: one raised strip from lid seam to lid seam across the tops of the inner lenses,
    // ~13 mm tall, standing ~5.5 mm proud with a round section, a dark shadow line under it
    const R = 0.0068,
      xs = T_SEAM(ZBAR) - 0.004,
      bar = [];
    for (let k = 0; k <= 60; k++) bar.push([-xs + (2 * xs * k) / 60, ZBAR]);
    const pts = bar.map(([x, z]) => rearHit(x, z).add(rearN(x, z).multiplyScalar(-0.0013)).toArray());
    mesh(sweep(pts, R, { radial: 14 }), M.chrome, trunkSkin, "chrome-bar");
    for (const q of [pts[0], pts[pts.length - 1]]) {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(R, 12, 8), M.chrome);
      cap.position.set(...q);
      trunkSkin.add(cap);
      cap.name = "chrome-bar";
    }
    mesh(
      rearRibbon(
        bar.map(([x, z]) => [x * 0.995, z - R - 0.0012]),
        0.0026,
        0.0012,
      ),
      dbl(M.trim),
      trunkSkin,
      "chrome-bar-shadow",
    );
  }
  {
    // H badge above the bar, centred (~93 x 72 mm, centre z 0.984)
    const bp = surf(yFace(0.984), 4, 0.008);
    const hb = new THREE.Group();
    hb.position.copy(bp.p);
    hb.quaternion.setFromUnitVectors(V(0, -1, 0), bp.n);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.031, 0.0045, 8, 32), M.chrome);
    ring.rotation.x = Math.PI / 2;
    ring.scale.set(1.45, 1.13, 1);
    hb.add(ring);
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.006, 0.05), M.chrome);
      leg.position.x = sx * 0.019;
      leg.rotation.y = sx * 0.12;
      hb.add(leg);
    }
    hb.add(new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.006, 0.008), M.chrome));
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.031, 0.031, 0.003, 32),
      mat(0x6b7075, "plastic", "car:trunk"),
    );
    disc.scale.set(1.45, 1, 1.13);
    disc.position.y = 0.002;
    hb.add(disc);
    trunkSkin.add(hb);
    // CIVIC script at the left (driver side, +x), above the bar: |x| 0.38-0.553, z 0.951-0.966
    const X0 = 0.553,
      WID = 0.173,
      Z0 = 0.951,
      HGT = 0.015,
      sl = 0.18;
    const P2 = (u, v) => [X0 - WID * (u + sl * v * 0.09), Z0 + HGT * v];
    const arc = (cu, a0, a1, rx = 0.085, n = 10) => {
      const o = [];
      for (let k = 0; k <= n; k++) {
        const a = a0 + ((a1 - a0) * k) / n;
        o.push(P2(cu + rx * Math.cos(a), 0.5 + 0.5 * Math.sin(a)));
      }
      return o;
    };
    // italic capitals C I V I C (Honda's wide script reduced to strokes)
    const strokes = [
      arc(0.09, 0.3 * Math.PI, 1.7 * Math.PI, 0.09, 12),
      [P2(0.255, 0), P2(0.255, 1)],
      [P2(0.34, 1), P2(0.455, 0), P2(0.57, 1)],
      [P2(0.66, 0), P2(0.66, 1)],
      arc(0.84, 0.3 * Math.PI, 1.7 * Math.PI, 0.09, 12),
    ];
    const edge = dbl(mat(0x5c6166, "plastic", "car:trunk"));
    for (const st0 of strokes) {
      mesh(rearRibbon(st0, 0.0085, 0.0028), edge, trunkSkin, "civic-badge");
      mesh(rearRibbon(st0, 0.0052, 0.0036), dbl(M.chrome), trunkSkin, "civic-badge");
    }
  }

  // ---------------------------------------------------------------- plate recess: a real inset panel below the bar
  // Outline (rear view): top under the bar between the inner-lens tips (|x| XTIP), sides along the lenses' diagonal
  // inner ends, rounded into a flat bottom at z 0.705. The lid face vertices inside it are pushed in by up to
  // RECESS_DEPTH along their normals, with a rounded edge EDGE wide; the edge band gets recomputed normals.
  const EDGE = 0.0045; // width of the rounded edge between the lid face and the recess floor
  const recHalf = [
    [0, 0.906],
    [XTIP, 0.906],
  ];
  for (let k = 1; k <= 10; k++) {
    const t = k / 10;
    recHalf.push([lerp(XTIP, 0.287, t), lerp(0.906, 0.743, t)]);
  }
  for (let k = 1; k <= 10; k++) {
    const t = k / 10,
      a = [0.287, 0.743],
      b = [0.263, 0.705],
      c = [0.212, 0.705];
    recHalf.push([
      (1 - t) * (1 - t) * a[0] + 2 * t * (1 - t) * b[0] + t * t * c[0],
      (1 - t) * (1 - t) * a[1] + 2 * t * (1 - t) * b[1] + t * t * c[1],
    ]);
  }
  recHalf.push([0, 0.705]);
  const recPoly = [
    ...recHalf,
    ...recHalf
      .slice(1, -1)
      .reverse()
      .map(([x, z]) => [-x, z]),
  ].filter((q, i, a) => i === 0 || q[0] !== a[i - 1][0] || q[1] !== a[i - 1][1]);
  const sdRec = (x, z) => {
    // signed distance to the recess outline, + inside
    let d = Infinity,
      inside = false;
    for (let i = 0, j = recPoly.length - 1; i < recPoly.length; j = i++) {
      const [xi, zi] = recPoly[i],
        [xj, zj] = recPoly[j];
      if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
      const ex = xj - xi,
        ez = zj - zi,
        t = clamp(((x - xi) * ex + (z - zi) * ez) / (ex * ex + ez * ez || 1), 0, 1);
      d = Math.min(d, Math.hypot(x - xi - ex * t, z - zi - ez * t));
    }
    return inside ? d : -d;
  };
  for (const o of trunkSkin.children) {
    if (!o.userData?.lidFace) continue;
    const geo = o.geometry,
      p = geo.attributes.position,
      n = geo.attributes.normal,
      band = new Uint8Array(p.count);
    let any = false;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        z = p.getZ(i);
      if (Math.abs(x) > 0.45 || z < 0.66 || z > 0.95) continue;
      const sd = sdRec(x, z);
      if (sd < -0.003) continue;
      const k = RECESS_DEPTH * smooth01(sd / EDGE);
      p.setXYZ(i, x - n.getX(i) * k, p.getY(i) - n.getY(i) * k, z - n.getZ(i) * k);
      if (sd < EDGE + 0.003) band[i] = 1;
      any = true;
    }
    if (!any) continue;
    const tmp = geo.clone();
    tmp.computeVertexNormals();
    const tn = tmp.attributes.normal;
    let dot = 0; // computed normals may face inward depending on winding
    for (let i = 0; i < p.count; i += 97)
      dot += tn.getX(i) * n.getX(i) + tn.getY(i) * n.getY(i) + tn.getZ(i) * n.getZ(i);
    const sg = dot < 0 ? -1 : 1;
    for (let i = 0; i < p.count; i++)
      if (band[i]) n.setXYZ(i, sg * tn.getX(i), sg * tn.getY(i), sg * tn.getZ(i));
    p.needsUpdate = true;
    n.needsUpdate = true;
    geo.computeBoundingSphere();
    geo.computeBoundingBox();
  }
  {
    // ducktail: the last ~45 mm of the deck kicks up ~7 mm into a crisp lip edge above the face; the
    // kick fades out toward the lid's top corners. The deck and the face patches meet at Y_LIP and keep their own
    // normals there, so the edge reads as a sharp highlight line.
    const KICK = 0.007;
    const kick = (x, y) =>
      KICK *
      (1 - smooth01((Math.abs(x) - 0.42) / 0.17)) *
      (y >= Y_LIP ? smooth01((-2.07 - y) / 0.048) : smooth01((y + 2.1285) / 0.0105));
    for (const o of trunkSkin.children) {
      if (!o.isMesh || o.name !== "trunk-skin") continue;
      const geo = o.geometry,
        p = geo.attributes.position,
        n = geo.attributes.normal,
        hit = new Uint8Array(p.count);
      let any = false;
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i);
        if (y > -2.065 || y < -2.13) continue;
        const k = kick(p.getX(i), y);
        if (k <= 1e-6) continue;
        p.setZ(i, p.getZ(i) + k);
        hit[i] = 1;
        any = true;
      }
      if (!any) continue;
      const tmp = geo.clone();
      tmp.computeVertexNormals();
      const tn = tmp.attributes.normal;
      let dot = 0;
      for (let i = 0; i < p.count; i += 53)
        dot += tn.getX(i) * n.getX(i) + tn.getY(i) * n.getY(i) + tn.getZ(i) * n.getZ(i);
      const sg = dot < 0 ? -1 : 1;
      for (let i = 0; i < p.count; i++)
        if (hit[i]) n.setXYZ(i, sg * tn.getX(i), sg * tn.getY(i), sg * tn.getZ(i));
      p.needsUpdate = n.needsUpdate = true;
      geo.computeBoundingSphere();
      geo.computeBoundingBox();
    }
  }
  {
    // the lip's rounded nose: a thin paint-colour roll along the deck/face edge catches the light as one crisp line
    const R = 0.0042,
      ue = lidEdge(Y_LIP) + 1 + 0.012,
      pts = [];
    for (let k = 0; k <= 60; k++) {
      const U = ue + ((8 - 2 * ue) * k) / 60,
        q = P(Y_LIP, U);
      const nd = surfNormal(Y_LIP + 0.006, U),
        nf = surfNormal(Y_LIP - 0.004, U),
        nb = nd.clone().add(nf).normalize();
      const x = q[0],
        kz = 0.007 * (1 - smooth01((Math.abs(x) - 0.42) / 0.17));
      pts.push([x - nb.x * R * 0.9, q[1] - nb.y * R * 0.9, q[2] + kz - nb.z * R * 0.9]);
    }
    mesh(sweep(pts, R, { radial: 10 }), M.trunk, trunkSkin, "lid-lip");
  }
  {
    // licence plate on the recess floor
    const sp = surf(yFace(0.795), 4, 0.006 - RECESS_DEPTH);
    const pg = new THREE.Group();
    pg.position.copy(sp.p);
    pg.quaternion.setFromUnitVectors(V(0, -1, 0), sp.n);
    pg.add(new THREE.Mesh(new THREE.BoxGeometry(0.305, 0.005, 0.152), M.plate));
    const band = new THREE.Mesh(
      new THREE.BoxGeometry(0.27, 0.006, 0.03),
      mat(0x2f5d9e, "plastic", "car:plate"),
    );
    band.position.set(0, -0.001, 0.045);
    pg.add(band);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.325, 0.008, 0.17), M.trim);
    frame.position.y = 0.004;
    pg.add(frame);
    trunkSkin.add(pg);
  }
}
