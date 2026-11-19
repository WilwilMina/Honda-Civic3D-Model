// The two headlights. The lens spans two surfaces: its rear part sits in the fender opening on the lofted body
// (HL0..Y_S, the same outline as the hole cut in body/panels.js) and its front part on the fascia (front/geometry.js
// outline). Behind the lens: a reflector housing with walls, a chrome brow, the amber corner section, the low / high
// beam bowls and bulbs, and the glow overlays that ctx.car.setLights turns on.
import * as THREE from "three";
import { lathe } from "../../../lib/geom.js";
import { Y_S, clamp, lerp, smooth01 } from "../body/profile.js";
import { st } from "../body/section.js";
import { HL0, T_HLT, T_HLZ } from "../body/cut-lines.js";
import { gridGeo, loftN, loftPt, resample, zList } from "./geometry.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// buildHeadlights(B, F, projector, outlines): both headlights (groups named "headlight", goto "lights"); fills
// parts.headlight / lowBeam / highBeam / frontTurn and lights.head / turn.
export function buildHeadlights(B, F, { frontHit, frontN }, { lampT, zL0 }) {
  const { M, g, mat, dbl, mesh, glow, parts, lights } = B;
  // ---------------------------------------------------------------- lens outline
  // lens rows of constant height: loft part (HL0..Y_S, same outline as the fender hole) then the fascia part
  const zTopL = (y) => {
    const zt = T_HLT(y);
    return zt >= st(y).zt - 0.002 ? st(y).zt : zt;
  };
  // y-interval of the lens on the loft at height z (the longest run where the outline contains z), or null
  function loftInterval(z) {
    const N = 90,
      ys = [];
    for (let i = 0; i <= N; i++) {
      const y = lerp(HL0 + 0.0005, Y_S, i / N);
      ys.push([y, T_HLZ(y) <= z && z <= zTopL(y)]);
    }
    let best = null,
      cur = null;
    for (const [y, ok] of ys) {
      if (ok) {
        if (!cur) cur = [y, y];
        else cur[1] = y;
      } else if (cur) {
        if (!best || cur[1] - cur[0] > best[1] - best[0]) best = cur;
        cur = null;
      }
    }
    if (cur && (!best || cur[1] >= Y_S - 1e-9 || cur[1] - cur[0] > best[1] - best[0])) best = cur;
    if (!best) return null;
    const refine = (yIn, yOut) => {
      for (let k = 0; k < 24; k++) {
        const m = (yIn + yOut) / 2;
        if (T_HLZ(m) <= z && z <= zTopL(m)) yIn = m;
        else yOut = m;
      }
      return yIn;
    };
    const dy = (Y_S - HL0) / N;
    const a = best[0] > HL0 + 0.001 ? refine(best[0], best[0] - dy) : best[0];
    const b = best[1] < Y_S - 1e-9 ? refine(best[1], best[1] + dy) : Y_S;
    return [a, b];
  }
  // one lens row at height z: loft samples then fascia samples, resampled to k + 1 points
  function lensRow(z, k) {
    const s = [],
      li = loftInterval(z),
      fi = lampT(z);
    if (li) {
      const n = 30;
      for (let i = 0; i <= n; i++) {
        const y = lerp(li[0], li[1], i / n);
        s.push([loftPt(y, z), loftN(y, z)]);
      }
    }
    if (fi && (!li || li[1] >= Y_S - 1e-6 || fi[0] > 0)) {
      const n = 60;
      for (let i = li && li[1] >= Y_S - 1e-6 ? 1 : 0; i <= n; i++) {
        const t = lerp(fi[0], fi[1], i / n);
        s.push([F.pt(t, z), F.normal(t, z)]);
      }
    }
    if (s.length < 2) return null;
    return resample(s, k);
  }
  // lens rows from the lamp's lowest point (zL0) up to its top (zL1), every ~4 mm
  let zL1 = zL0;
  for (let z = zL0; z < 0.86; z += 0.002) if (loftInterval(z) || lampT(z)) zL1 = z;
  const lensRows = [];
  for (const z of zList(zL0 + 0.0003, zL1, 0.004)) {
    const r = lensRow(z, 52);
    if (r) lensRows.push(r);
  }

  // ---------------------------------------------------------------- the two lamps
  for (const s of [-1, 1]) {
    const hl = new THREE.Group();
    hl.name = "headlight";
    hl.userData.goto = "lights";
    g.add(hl);
    const body = new THREE.Group();
    body.name = "headlight";
    hl.add(body);
    // rows mirrored for the right side (s < 0): the model's +x half is the driver side
    const R =
      s > 0
        ? lensRows
        : lensRows.map((r) =>
            r.map(([p, n]) => [
              [-p[0], p[1], p[2]],
              [-n[0], n[1], n[2]],
            ]),
          );
    const one = (rows, off) => gridGeo(rows, { off, mirror: false, flip: s < 0 });
    const lensM = mat(0xeef4f8, "lens", "car:lens");
    lensM.opacity = 0.16;
    const lens = mesh(one(R, 0.003), lensM, body, "headlight-lens");
    lens.castShadow = false;
    // housing: reflector back about 45 mm in, walls round the outline
    const depthAt = (j, i) =>
      0.009 +
      0.04 *
        Math.sqrt(
          Math.max(0, Math.sin((Math.PI * j) / (R.length - 1)) * Math.sin((Math.PI * i) / (R[0].length - 1))),
        );
    const backRows = R.map((r, j) =>
      r.map(([p, n], i) => {
        const d = depthAt(j, i);
        return [[p[0] - n[0] * d, p[1] - n[1] * d, p[2] - n[2] * d], n];
      }),
    );
    // housing back: chrome-grey reflector field inside a black frame, with a thin dark edge along the bottom
    // (vertex colours: grey value c per back vertex)
    {
      const bg0 = one(backRows, 0),
        col = [];
      const nr0 = backRows.length,
        nc0 = backRows[0].length;
      for (let j = 0; j < nr0; j++)
        for (let i = 0; i < nc0; i++) {
          const fj = j / (nr0 - 1),
            fi = i / (nc0 - 1);
          const frame = Math.min((fi * nc0) / 3, ((1 - fi) * nc0) / 3, ((1 - fj) * nr0) / 2.5, 1);
          const chin = smooth01((fj - 0.05) / 0.08); // thin dark lower edge (kept thin so the lamp keeps its height)
          const k = Math.min(clamp(frame, 0, 1), chin),
            c = lerp(0.07, 0.6, k);
          col.push(c, c, c * 1.03);
        }
      bg0.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      const bm = dbl(mat(0xffffff, "plastic", "car:reflector"));
      bm.vertexColors = true;
      mesh(bg0, bm, body, "headlight-back");
    }
    // housing walls: a strip from the lens outline (ring of edge samples) back to the reflector
    const ring = [];
    const nr = R.length,
      nc = R[0].length;
    for (let i = 0; i < nc; i++) ring.push([0, i]);
    for (let j = 1; j < nr; j++) ring.push([j, nc - 1]);
    for (let i = nc - 2; i >= 0; i--) ring.push([nr - 1, i]);
    for (let j = nr - 2; j >= 0; j--) ring.push([j, 0]);
    {
      const pos = [],
        idx = [];
      for (const [j, i] of ring) {
        const a = R[j][i][0],
          b = backRows[j][i][0];
        pos.push(...a, ...b);
      }
      for (let q = 0; q < ring.length - 1; q++) {
        const a = q * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      const wg = new THREE.BufferGeometry();
      wg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      wg.setIndex(idx);
      wg.computeVertexNormals();
      mesh(wg, dbl(mat(0x34383d, "plastic", "car:housing")), body, "headlight-wall");
    }
    // chrome "eyebrow" strip across the reflector field (the bright bar above the bulbs)
    const brow = backRows
      .slice(Math.round(nr * 0.4), Math.round(nr * 0.46))
      .map((r) =>
        r
          .slice(Math.round(nc * 0.2), Math.round(nc * 0.8))
          .map(([p, n]) => [p.map((v, q) => v + n[q] * 0.006), n]),
      );
    if (brow.length > 1)
      mesh(one(brow, 0), dbl(mat(0xe6ebef, "chrome", "car:reflector")), body, "headlight-bezel");
    // amber corner section (front turn / parking) at the extreme outer end: every back row beyond |x| 0.745
    {
      const amb = [];
      for (const r of backRows.slice(2, nr - 3)) {
        // kept off the lamp's top rows and only 2 mm off the back, so it stays hidden behind the hood corners
        const sub = r.slice(1, -1).filter(([p]) => Math.abs(p[0]) > 0.745 && p[1] > Y_S - 0.06);
        if (sub.length >= 2)
          amb.push(
            resample(
              sub.map(([p, n]) => [p.map((v, q) => v + n[q] * 0.002), n]),
              8,
            ),
          );
      }
      if (amb.length > 1) {
        const am = mesh(one(amb, 0), dbl(mat(0xf2a23c, "lens", "car:amberlens")), body, "corner-lens");
        am.material.opacity = 0.9;
        parts.frontTurn.push(am);
      }
    }
    const lensGlow = mesh(one(R, 0.0045), glow(0xfff8e2), hl, "glow");
    lensGlow.castShadow = false;
    parts.headlight.push(body);
    lights.head.push(lensGlow);
    // projector bowls: low beam (projector) at the inner end, high beam reflector next to it, amber bulb at the corner
    const bulbAt = (x, z, r, key, color = M.bulb, proj = false) => {
      const p = frontHit(s * x, z),
        n = frontN(s * x, z)
          .lerp(V(0, 1, 0), 0.35)
          .normalize();
      const bg = new THREE.Group();
      bg.position.copy(p).sub(n.clone().multiplyScalar(0.05));
      bg.quaternion.setFromUnitVectors(V(0, 0, 1), n);
      hl.add(bg);
      const bowl = new THREE.Mesh(
        lathe(
          { o: [0, 0, 0], a: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
          [
            [0.036, r * 1.05],
            [0.014, r * 0.6],
            [0.0, 0.012],
          ],
          28,
        ),
        proj ? M.reflector : dbl(mat(0xa9b0b6, "chrome", "car:reflector")),
      );
      bg.add(bowl);
      if (proj) {
        // projector lens + black shroud ring
        const pl = new THREE.Mesh(
          new THREE.SphereGeometry(r * 0.62, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
          mat(0xdfe8ee, "glass", "car:lens"),
        );
        pl.rotation.x = Math.PI / 2;
        pl.scale.set(1, 0.45, 1);
        pl.position.z = 0.034;
        bg.add(pl);
        const sh = new THREE.Mesh(
          new THREE.TorusGeometry(r * 0.68, r * 0.09, 8, 24),
          mat(0x2a2d31, "plastic", "car:housing"),
        );
        sh.position.z = 0.033;
        bg.add(sh);
      }
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.0065, 14, 10), color);
      bulb.scale.set(1, 1, 1.6);
      bulb.position.z = 0.022;
      bg.add(bulb);
      const gl = new THREE.Mesh(
        new THREE.SphereGeometry(r * 0.9, 18, 12),
        glow(color === M.amber ? 0xffa030 : 0xfff3cf),
      );
      gl.scale.set(1, 1, 0.35);
      gl.position.z = 0.03;
      bg.add(gl);
      parts[key].push(bulb);
      parts.headlight.push(bowl);
      return { bg, bulb, gl, bowl };
    };
    const lo = bulbAt(0.51, 0.66, 0.045, "lowBeam");
    const hi = bulbAt(0.625, 0.69, 0.03, "highBeam");
    const tu = bulbAt(0.755, 0.712, 0.02, "frontTurn", M.amber);
    lo.gl.visible = hi.gl.visible = false;
    lights.turn.push(tu.gl);
  }
}
