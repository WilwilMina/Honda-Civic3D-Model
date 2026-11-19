// The accessory drive at the passenger end of the engine: six pulleys and the flat ribbed serpentine belt that
// wraps them, rebuilt by hand (the shapes.json versions are skipped). Everything is in kit units (see base-model.js)
// and hangs off the shaking engine group. buildBelt() returns an update() that turns the belt and pulleys.
import * as THREE from "three";
import { lathe, fixWinding } from "../../lib/geom.js";
import { frame, alignedBox, canvasTex } from "./geometry.js";

// The belt runs in the plane x = BELT_X; pulley centres are given in that plane's (y, z).
const BELT_X = -112;
// Belt order (docs/research/engine.md, section A3): A/C compressor (bottom) -> water pump -> crank (bottom) ->
// tensioner (under the side engine mount) -> idler (toward the rear) -> alternator (top). Listed here
// counter-clockwise in the (y, z) plane, which is the order the belt path is traced in.
// smooth: flat-faced idler pulley; back: the belt runs over the pulley's back (the pulley sits outside the loop).
export const PULLEYS = {
  ac: { y: 30, z: 50, r: 8.5, part: "ac-compressor" },
  alt: { y: 30, z: 100, r: 5, part: "alternator" },
  idler: { y: -13, z: 102, r: 4.5, part: "tensioner", smooth: true },
  tens: { y: -18, z: 78, r: 5, part: "tensioner", smooth: true },
  crank: { y: -6, z: 50, r: 9, part: "crank-pulley" },
  wp: { y: 12, z: 74, r: 6.5, part: "water-pump", smooth: true, back: true },
};
const BELT_HALF_THICKNESS = 0.55;
const BELT_HALF_WIDTH = 1.9;
const BELT_TEX_PERIOD = 6; // belt length per texture repeat
// Belt surface speed at idle, kit units / s. Slowed far below the real crank speed so the motion stays readable.
const BELT_SPEED = 55;

// Signed radius of the belt's centre line around a pulley: + when the pulley is inside the loop, - when the belt
// runs over its back.
const beltRadius = (p) => (p.back ? -1 : 1) * (p.r + BELT_HALF_THICKNESS);

// Builds the pulleys (each in a spinning pivot), the A/C clutch plate and the belt.
// b: the shared build context from scene.js ({ mat, C, P, add, engine }).
export function buildBelt({ mat, C, P, add, engine }) {
  const spinners = [];
  let acClutch = null;
  // pulley axis points out of the engine (-x); the lathe profile's first coordinate runs along it
  const pulleyFrame = frame([0, 0, 0], [-1, 0, 0], [0, 1, 0], [0, 0, 1]);
  for (const [key, p] of Object.entries(PULLEYS)) {
    const pivot = new THREE.Group();
    pivot.position.set(BELT_X, p.y, p.z);
    engine.add(pivot);
    const r = p.r;
    // meridian [axial, radius]: smooth idlers get raised flanges; grooved pulleys a slightly recessed belt seat
    const prof = p.smooth
      ? [
          [-4, 0],
          [-4, r + 0.4],
          [-3.4, r + 0.4],
          [-3.4, r],
          [1.4, r],
          [1.4, r + 0.4],
          [2, r + 0.4],
          [2, r * 0.45],
          [3, r * 0.45],
          [3, 0],
        ]
      : [
          [-4, 0],
          [-4, r],
          [-3.4, r],
          [-3.2, r - 0.5],
          [1.2, r - 0.5],
          [1.4, r],
          [2, r],
          [2, r * 0.42],
          [3, r * 0.42],
          [3, 0],
        ];
    add(
      fixWinding(lathe(pulleyFrame, prof, 36)),
      mat(key === "crank" ? 0x7b7f85 : 0xb8bcc0, "metal", P(p.part)),
      p.part,
      pivot,
      { shadow: true, name: "pulley." + key },
    );
    // bolts on the outer face so the turning is visible
    const n = key === "crank" ? 4 : 3;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = key === "ac" ? r * 0.75 : r * 0.68;
      add(
        fixWinding(
          lathe(
            frame([-2, Math.cos(a) * rr, Math.sin(a) * rr], [-1, 0, 0], [0, 1, 0], [0, 0, 1]),
            [
              [0, 0],
              [0, r * 0.13],
              [0.7, r * 0.13],
              [0.7, 0],
            ],
            10,
          ),
        ),
        mat(0x2b2d31, "metal", P(p.part)),
        p.part,
        pivot,
      );
    }
    spinners.push({ pivot, rho: beltRadius(p), key });
    if (key === "ac") {
      // the A/C clutch plate only turns when the A/C is on
      acClutch = new THREE.Group();
      acClutch.position.set(BELT_X, p.y, p.z);
      engine.add(acClutch);
      add(
        fixWinding(
          lathe(
            pulleyFrame,
            [
              [3, 0],
              [3, r * 0.62],
              [3.6, r * 0.62],
              [4.2, r * 0.3],
              [4.4, 0],
            ],
            30,
          ),
        ),
        mat(0x5a5e64, "metal", P("ac-compressor")),
        "ac-compressor",
        acClutch,
        { name: "pulley.ac.clutch" },
      );
      // orange marks on the plate show whether it is turning
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + 0.3;
        add(
          alignedBox([-3.9, Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42], [0.4, 1.4, 0.9]),
          mat(C.orange, "plastic", P("ac-compressor")),
          "ac-compressor",
          acClutch,
        );
      }
    }
    if (key === "idler") {
      // idler bracket back to the timing cover
      add(
        alignedBox([-104.5, p.y, p.z], [2.5, 2.2, 2.2]),
        mat(C.cast, "metal", P("tensioner")),
        "tensioner",
        engine,
      );
    }
  }

  const beltTex = buildBeltRibbon({ mat, P, add, engine });

  return {
    // runLevel: eased 0..1 engine speed; clutchEngaged: A/C on with the engine running
    update(dt, runLevel, clutchEngaged) {
      const v = BELT_SPEED * runLevel;
      beltTex.offset.x -= (v * dt) / BELT_TEX_PERIOD;
      for (const sp of spinners) {
        // no slip: angular speed = surface speed / radius (negative radius turns a back-side pulley the other way)
        sp.pivot.rotation.x += (v * dt) / sp.rho;
        // the A/C clutch plate locks to its pulley only with the A/C on
        if (sp.key === "ac" && acClutch && clutchEngaged) acClutch.rotation.x = sp.pivot.rotation.x;
      }
    },
  };
}

// The belt: a flat ribbon following the real serpentine path (tangent lines + arcs around each pulley), ribbed on
// the inside. Returns its texture, which update() scrolls to make the belt move.
function buildBeltRibbon({ mat, P, add, engine }) {
  const list = Object.values(PULLEYS).map((p) => ({ c: [p.y, p.z], rho: beltRadius(p) }));
  const n = list.length;
  // Common tangent from pulley A to pulley B for a belt running counter-clockwise. With nl the unit normal to the
  // left of travel, the contact point on a pulley is c - rho * nl; the angle k solves (rhoB - rhoA) = L cos k.
  // Of the two candidate lines, keep the one whose direction of travel points from A toward B.
  const tangent = (A, B) => {
    const dy = B.c[0] - A.c[0],
      dz = B.c[1] - A.c[1],
      L = Math.hypot(dy, dz),
      th = Math.atan2(dz, dy);
    const k = Math.acos(Math.max(-1, Math.min(1, (B.rho - A.rho) / L)));
    for (const phi of [th + k, th - k]) {
      const nl = [Math.cos(phi), Math.sin(phi)],
        t = [nl[1], -nl[0]];
      if (t[0] * dy + t[1] * dz > 0)
        return [
          [A.c[0] - A.rho * nl[0], A.c[1] - A.rho * nl[1]],
          [B.c[0] - B.rho * nl[0], B.c[1] - B.rho * nl[1]],
        ];
    }
  };
  const seg = list.map((A, i) => tangent(A, list[(i + 1) % n]));
  // closed centre-line path: arc around each pulley from where the belt arrives to where it leaves, then the
  // straight run to the next pulley
  const path = [];
  for (let i = 0; i < n; i++) {
    const P0 = list[i],
      inP = seg[(i - 1 + n) % n][1],
      outP = seg[i][0];
    let a0 = Math.atan2(inP[1] - P0.c[1], inP[0] - P0.c[0]),
      a1 = Math.atan2(outP[1] - P0.c[1], outP[0] - P0.c[0]);
    const R = Math.abs(P0.rho);
    // wrap counter-clockwise around pulleys inside the loop, clockwise over back-side ones
    if (P0.rho > 0) {
      while (a1 < a0) a1 += Math.PI * 2;
    } else {
      while (a1 > a0) a1 -= Math.PI * 2;
    }
    const steps = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 0.12));
    for (let j = 0; j <= steps; j++) {
      const a = a0 + ((a1 - a0) * j) / steps;
      path.push([P0.c[0] + Math.cos(a) * R, P0.c[1] + Math.sin(a) * R]);
    }
    // straight run to the next pulley, split so the texture spacing stays even
    const q = seg[i][1],
      l = Math.hypot(q[0] - outP[0], q[1] - outP[1]),
      m = Math.max(1, Math.ceil(l / 3));
    for (let j = 1; j < m; j++)
      path.push([outP[0] + ((q[0] - outP[0]) * j) / m, outP[1] + ((q[1] - outP[1]) * j) / m]);
  }
  const N = path.length;
  const s = [0];
  for (let i = 1; i <= N; i++) {
    const a = path[i - 1],
      b = path[i % N];
    s.push(s[i - 1] + Math.hypot(a[0] - b[0], a[1] - b[1]));
  }
  const w = BELT_HALF_WIDTH,
    t = BELT_HALF_THICKNESS,
    xc = BELT_X + 0.5;
  // per-point outward normal in the (y, z) plane
  const out = path.map((p, i) => {
    const a = path[(i - 1 + N) % N],
      b = path[(i + 1) % N];
    const ty = b[0] - a[0],
      tz = b[1] - a[1],
      l = Math.hypot(ty, tz) || 1;
    return [tz / l, -ty / l]; // right of travel = outside the loop
  });
  const pos = [],
    nrm = [],
    uv = [],
    idx = [];
  // four faces of the ribbon: outer face, inner face and the two edges; c(i, k) gives the k-th edge of the
  // face at path point i, v[k] its texture v (the edges map to the texture's thin border)
  const faces = [
    {
      c: (i, k) => [xc + (k ? w : -w), path[i][0] + out[i][0] * t, path[i][1] + out[i][1] * t],
      nr: (i) => [0, out[i][0], out[i][1]],
      v: [0, 1],
    },
    {
      c: (i, k) => [xc + (k ? -w : w), path[i][0] - out[i][0] * t, path[i][1] - out[i][1] * t],
      nr: (i) => [0, -out[i][0], -out[i][1]],
      v: [0, 1],
    },
    {
      c: (i, k) => [xc + w, path[i][0] + out[i][0] * (k ? -t : t), path[i][1] + out[i][1] * (k ? -t : t)],
      nr: () => [1, 0, 0],
      v: [0.98, 1],
    },
    {
      c: (i, k) => [xc - w, path[i][0] + out[i][0] * (k ? t : -t), path[i][1] + out[i][1] * (k ? t : -t)],
      nr: () => [-1, 0, 0],
      v: [0.98, 1],
    },
  ];
  for (const f of faces) {
    const base = pos.length / 3;
    for (let i = 0; i <= N; i++) {
      const ii = i % N;
      for (const k of [0, 1]) {
        pos.push(...f.c(ii, k));
        nrm.push(...f.nr(ii));
        uv.push(s[i] / BELT_TEX_PERIOD, f.v[k]);
      }
    }
    for (let i = 0; i < N; i++) {
      const a = base + i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  fixWinding(g);
  g.computeBoundingSphere();
  // dark rubber with a lighter band (so the motion shows) and fine lengthwise ribs
  const beltTex = canvasTex(64, 16, (c, W, H) => {
    c.fillStyle = "#2a2b2e";
    c.fillRect(0, 0, W, H);
    c.fillStyle = "#4a4c50";
    c.fillRect(0, 0, 10, H);
    c.fillStyle = "#38393d";
    for (let y = 2; y < H; y += 4) c.fillRect(0, y, W, 1);
  });
  const bm = mat(0x9a9ca0, "rubber", P("belt"));
  bm.map = beltTex;
  add(g, bm, "belt", engine, { name: "belt" });
  return beltTex;
}
