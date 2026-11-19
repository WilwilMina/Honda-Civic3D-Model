// Rear lamps: the outer tail lights in the quarter corners (brake / tail above, turn strip below, side marker at the
// forward tip), the inner tail / reverse lights on the trunk lid, the licence-plate light and the third brake light.
// The lens colours (red, clear ribbed strip, amber, dark rims) are small textures mapped in rear-view coordinates.
import * as THREE from "three";
import { box } from "../../../lib/geom.js";
import { clamp, lerp, smooth01 } from "../body/profile.js";
import { P, half, st, uz } from "../body/section.js";
import { rearGeo, surf } from "../body/surface.js";
import { T_SEAM, T_TLZ_, TL0, TL1, Y_TRUNK0, tlDead, tlHi, tlLo, tlTop } from "../body/cut-lines.js";
import {
  COL,
  RECESS_DEPTH,
  XTIP,
  dataTex,
  foldGeo,
  lampF,
  ribs,
  setUV,
  sideFn,
  texMat,
  yFace,
} from "./geometry.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// buildRearLamps(ctx, B): tail lights (groups "taillight" on g, "inner-taillight" on the lid skin, goto "lights"),
// plate light and third brake light; fills parts.brakeTail / rearTurn / rearMarker / innerTail / reverse /
// plateLight / thirdBrake and lights.brake / tail / turn / reverse
export function buildRearLamps(ctx, B) {
  const { M, g, mat, mesh, glow, parts, lights, trunkSkin } = B;
  const { C } = ctx;
  // ---------------------------------------------------------------- tail lights
  // outer lens texture: U = height above the lamp's bottom edge (0..0.25 m), V = |x| (0.45..0.90 m)
  const clearTop = (ax) => lerp(0.049, 0.038, clamp((ax - 0.53) / 0.25, 0, 1));
  const outerTex = dataTex(256, 256, (u, v) => {
    const d = u * 0.25,
      ax = 0.45 + v * 0.45,
      ct = clearTop(ax);
    if (d < 0.008) return COL.rim;
    if (d < ct) return ax > 0.55 && ax < 0.62 && d > 0.013 && d < ct - 0.005 ? COL.amber : ribs(ax);
    if (d < ct + 0.004) return COL.sep;
    const e = d - ct;
    if (e < 0.014) return COL.redD;
    if (e < 0.05) return COL.red;
    if (e < 0.075) return ax > 0.62 ? COL.redL : COL.red;
    if (e < 0.15) return COL.red;
    return COL.redD;
  });
  const outerMat = texMat(mat, "car:lensred", outerTex);
  const zLoAt = (y) => {
    const yc = clamp(y, TL0, TL1),
      s0 = st(yc);
    return tlDead(yc) ? s0.zt : half(s0, tlLo(yc))[1];
  };
  // toward the forward tip the strips narrow with the lamp so the red runs out to the point
  const tipScale = (y) => {
    if (y < -2.04) return 1;
    const yc = clamp(y, TL0, TL1),
      s0 = st(yc),
      h = half(s0, tlHi(yc))[1] - zLoAt(yc);
    return lerp(clamp(h / 0.1, 0.18, 1), 1, smooth01((-2.0 - y) / 0.04));
  };
  const uvOuter = (x, y, z) => [
    clamp((z - zLoAt(y)) / tipScale(y) / 0.25, 0, 1),
    clamp((Math.abs(x) - 0.45) / 0.45, 0, 1),
  ];
  // inner lens texture: U = |x| (0.25..0.65 m), V = z (0.74..0.92 m)
  const ZT = 0.903,
    ZB = 0.752,
    ZR = 0.826;
  const innerX = (z) => lerp(0.291, XTIP, (z - 0.75) / (0.906 - 0.75));
  const border = (z) => lerp(0.034, 0.009, clamp((z - ZB) / (ZT - ZB), 0, 1));
  const outerX = (z) => T_SEAM(z) - 0.005;
  const innerTex = dataTex(512, 256, (u, v) => {
    const ax = 0.25 + u * 0.4,
      z = 0.74 + v * 0.18;
    if (ax < innerX(z) + border(z) || z < ZB + 0.007 || z > ZT - 0.004 || ax > outerX(z) - 0.004)
      return COL.black;
    if (z < ZR)
      return ax > 0.39 && ax < 0.47 && z > ZB + 0.014 && z < ZR - 0.01
        ? ribs(ax, 0.004).map((c) => c - 22)
        : ribs(ax);
    if (z < ZR + 0.004) return COL.sep;
    const e = z - ZR;
    return e < 0.009 ? COL.redD : e < 0.03 ? COL.red : e < 0.06 ? COL.redL : COL.red;
  });
  const innerMat = texMat(mat, "car:innerlens", innerTex);
  const uvInner = (x, y, z) => [clamp((Math.abs(x) - 0.25) / 0.4, 0, 1), clamp((z - 0.74) / 0.18, 0, 1)];

  for (const s of [-1, 1]) {
    // outer taillight in the quarter panel: brake/tail (upper), turn strip (lower, clear with amber), side
    // marker at the tip
    const tl = new THREE.Group();
    tl.name = "taillight";
    tl.userData.goto = "lights";
    g.add(tl);
    const tlMid = (y) => (tlDead(y) ? 1.003 : Math.min(tlHi(y) - 0.01, uz(y, T_TLZ_(y) + 0.045)));
    const wall = mat(0x2a0c0c, "plastic", "car:redback");
    // (the lens UVs must exist before the back is cloned from it)
    const outer = lampF(B, s, TL0, -1.935, tlMid, tlTop, {
      depth: 0.014,
      wall,
      lens: outerMat,
      parent: tl,
      name: "brake-tail",
    });
    const turnL = lampF(B, s, TL0, -1.935, tlLo, tlMid, {
      depth: 0.012,
      wall,
      lens: outerMat,
      parent: tl,
      name: "rear-turn",
    });
    const marker = lampF(B, s, -1.935, TL1, tlLo, tlHi, {
      depth: 0.01,
      wall,
      lens: outerMat,
      parent: tl,
      name: "rear-marker",
    });
    for (const l of [outer, turnL, marker]) setUV(l.userData.lensGeo, uvOuter);
    parts.brakeTail.push(outer);
    parts.rearTurn.push(turnL);
    parts.rearMarker.push(marker);
    const glB = mesh(foldGeo(s, TL0, -1.935, tlMid, tlTop, 0.0045), glow(0xff2a1a), tl, "glow");
    glB.castShadow = false;
    lights.brake.push(glB);
    lights.tail.push(glB);
    const glT = mesh(foldGeo(s, TL0, -1.935, tlLo, tlMid, 0.0045), glow(0xffa030), tl, "glow");
    glT.castShadow = false;
    lights.turn.push(glT);

    // inner taillight + reverse light on the trunk lid: a trapezoid, top just under the chrome bar, flat
    // bottom, inner end cut on a diagonal (bottom corner ~95 mm further inboard) with a thick black border
    const it = new THREE.Group();
    it.name = "inner-taillight";
    it.userData.goto = "lights";
    trunkSkin.add(it);
    const [LO, HI] = sideFn(s, innerX, outerX);
    const lensTail = mesh(
      setUV(rearGeo(ZR, ZT, LO, HI, 0.003, 10, 24), uvInner),
      innerMat,
      it,
      "inner-tail-lens",
    );
    const lensRev = mesh(setUV(rearGeo(ZB, ZR, LO, HI, 0.003, 8, 24), uvInner), innerMat, it, "reverse-lens");
    lensTail.castShadow = lensRev.castShadow = false;
    const tail = new THREE.Group();
    tail.add(lensTail);
    it.add(tail);
    const rev = new THREE.Group();
    rev.add(lensRev);
    it.add(rev);
    parts.innerTail.push(tail);
    parts.reverse.push(rev);
    const [LO2, HI2] = sideFn(
      s,
      (z) => innerX(z) + border(z),
      (z) => outerX(z) - 0.004,
    );
    const glI = mesh(rearGeo(ZR + 0.004, ZT - 0.004, LO2, HI2, 0.0045, 6, 12), glow(0xff2a1a), it, "glow");
    lights.tail.push(glI);
    const glR = mesh(rearGeo(ZB + 0.007, ZR, LO2, HI2, 0.0045, 4, 12), glow(0xffffff), it, "glow");
    lights.reverse.push(glR);
  }
  // licence plate light (just under the bar, above the plate)
  {
    const sp = surf(yFace(0.895), 4, 0.004 - RECESS_DEPTH);
    const pl = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.008, 0.008),
      mat(0xf3f6f8, "lens", "car:platelens"),
    );
    pl.position.copy(sp.p);
    pl.quaternion.setFromUnitVectors(V(0, -1, 0), sp.n);
    const plg = new THREE.Group();
    plg.name = "plate-light";
    plg.userData.goto = "lights";
    plg.add(pl);
    trunkSkin.add(plg);
    parts.plateLight.push(pl);
    const gl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.02), glow(0xfff6dd));
    gl.position.copy(pl.position);
    plg.add(gl);
    lights.tail.push(gl);
  }
  // third brake light on the parcel shelf under the rear glass
  {
    const tb = new THREE.Group();
    tb.name = "third-brake";
    tb.userData.goto = "lights";
    g.add(tb);
    const zg = P(Y_TRUNK0 + 0.07, 4)[2] - 0.05;
    const housing = new THREE.Mesh(
      box(
        [0, Y_TRUNK0 + 0.07, zg],
        [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
        ],
        [0.15, 0.025, 0.014],
      ),
      M.trim,
    );
    tb.add(housing);
    const lens = new THREE.Mesh(
      box(
        [0, Y_TRUNK0 + 0.045, zg + 0.002],
        [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
        ],
        [0.14, 0.003, 0.009],
      ),
      M.lensRed,
    );
    tb.add(lens);
    const shelf = new THREE.Mesh(
      box(
        [0, Y_TRUNK0 + 0.16, zg - 0.023],
        [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
        ],
        [0.66, 0.2, 0.008],
      ),
      mat(C.interior, "fabric", "car:shelf"),
    );
    g.add(shelf);
    parts.thirdBrake.push(tb);
    const gl = new THREE.Mesh(
      box(
        [0, Y_TRUNK0 + 0.044, zg + 0.002],
        [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
        ],
        [0.15, 0.006, 0.012],
      ),
      glow(0xff2a1a),
    );
    tb.add(gl);
    lights.brake.push(gl);
  }
}
