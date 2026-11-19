// The grille and the lower intake on the front fascia. Grille: the opening (a hole in the fascia panels), a black
// surround wall back to the recessed honeycomb mesh, the chrome "smile" band round the opening and the Honda badge.
// Lower intake: the narrow centre slot and corner pockets, the LX's blank fog-lamp bezels and the chrome strip.
import * as THREE from "three";
import { lerp, mono, smooth01 } from "../body/profile.js";
import { gridGeo } from "./geometry.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// buildGrille(B, F, projector, outlines): the grille in the front bumper group (fb)
export function buildGrille(B, F, { frontHit, frontN, frontGeo, frontRibbon }, { xGo, zG0 }) {
  const { M, fb, mat, dbl, mesh } = B;
  const { zC } = F;
  // the opening is a hole in the fascia (above); the mesh sits 28 mm back, a black surround joins the two
  const REC = 0.028;
  const edge = []; // opening outline from the centre bottom up to the top corner (x >= 0)
  for (let k = 0; k <= 48; k++) {
    const z = lerp(zG0 + 1e-4, zC, Math.pow(k / 48, 0.8));
    edge.push([xGo(z), z]);
  }
  // surround wall: from the fascia opening edge back to the mesh plane (both halves)
  {
    const top = edge.map(([x, z]) => {
      const p = frontHit(x, z),
        n = frontN(x, z);
      return [
        [p.x, p.y, p.z],
        [n.x, n.y, n.z],
      ];
    });
    const bot = top.map(([p, n]) => [[p[0] - n[0] * REC, p[1] - n[1] * REC, p[2] - n[2] * REC], n]);
    mesh(
      gridGeo([top, bot], { flip: false }),
      dbl(mat(0x111214, "plastic", "car:grille")),
      fb,
      "grille-surround",
    );
    // top wall under the hood front edge
    const tr = [],
      br = [];
    for (let i = 0; i <= 24; i++) {
      const x = (xGo(zC - 1e-4) * i) / 24,
        p = frontHit(x, zC - 1e-4),
        n = frontN(x, zC - 1e-4);
      tr.push([
        [p.x, p.y, p.z],
        [n.x, n.y, n.z],
      ]);
      br.push([
        [p.x - n.x * REC, p.y - n.y * REC, p.z - n.z * REC],
        [n.x, n.y, n.z],
      ]);
    }
    mesh(gridGeo([tr, br]), dbl(mat(0x111214, "plastic", "car:grille")), fb, "grille-surround");
  }
  // mesh back plate (very dark) and the honeycomb lattice in front of it
  const inX = (z) => Math.max(0.002, xGo(z) - 0.004);
  mesh(
    frontGeo(zG0 + 0.002, zC - 0.001, (z) => -inX(z), inX, -REC - 0.012, 16, 48),
    dbl(mat(0x0b0c0d, "plastic", "car:grille")),
    fb,
    "grille",
  );
  {
    // hexagonal cells CW x CH, bars BW wide, in staggered rows; bars are clipped to the opening
    const CW = 0.058,
      CH = 0.044,
      BW = 0.005,
      geoms = []; // pointy-top hexagons, staggered rows
    const quad = (a, b, w) => {
      // bar from front-view a to b, w wide, 10 mm deep, on the mesh plane
      const dx = b[0] - a[0],
        dz = b[1] - a[1],
        L = Math.hypot(dx, dz),
        nx = ((-dz / L) * w) / 2,
        nz = ((dx / L) * w) / 2;
      const pts = [
        [a[0] + nx, a[1] + nz],
        [b[0] + nx, b[1] + nz],
        [b[0] - nx, b[1] - nz],
        [a[0] - nx, a[1] - nz],
      ];
      const P = (q, d) => {
        const p = frontHit(q[0], q[1]),
          n = frontN(q[0], q[1]);
        return p.sub(n.multiplyScalar(REC - d));
      };
      const f = pts.map((q) => P(q, 0)),
        bk = pts.map((q) => P(q, -0.01)),
        pos = [];
      const tri = (A, Bv, Cv) => pos.push(A.x, A.y, A.z, Bv.x, Bv.y, Bv.z, Cv.x, Cv.y, Cv.z);
      tri(f[0], f[1], f[2]);
      tri(f[0], f[2], f[3]);
      for (let q = 0; q < 4; q++) {
        const q2 = (q + 1) % 4;
        tri(f[q], bk[q], bk[q2]);
        tri(f[q], bk[q2], f[q2]);
      }
      const gq = new THREE.BufferGeometry();
      gq.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      gq.computeVertexNormals();
      geoms.push(gq);
    };
    const inside = (x, z) => z > zG0 + 0.004 && z < zC - 0.003 && Math.abs(x) < xGo(z) - 0.006;
    const seg = (a, b) => {
      // clip a segment to the opening by sampling
      const N = 8;
      let run = null;
      for (let i = 0; i <= N; i++) {
        const q = [lerp(a[0], b[0], i / N), lerp(a[1], b[1], i / N)],
          ok = inside(q[0], q[1]);
        if (ok && !run) run = [q, q];
        else if (ok) run[1] = q;
        if ((!ok || i === N) && run) {
          if (Math.hypot(run[1][0] - run[0][0], run[1][1] - run[0][1]) > 0.004) quad(run[0], run[1], BW);
          run = null;
        }
      }
    };
    for (let r = -1; r < 7; r++) {
      const zc = zG0 + 0.012 + r * CH * 0.75 + 0.02,
        off = (r & 1) * CW * 0.5;
      for (let c = -10; c <= 10; c++) {
        const xc = c * CW + off,
          hx = CW / 2,
          hz = CH / 2;
        const v = [
          [xc, zc + hz],
          [xc + hx, zc + hz / 2],
          [xc + hx, zc - hz / 2],
          [xc, zc - hz],
          [xc - hx, zc - hz / 2],
          [xc - hx, zc + hz / 2],
        ];
        seg(v[0], v[1]);
        seg(v[1], v[2]);
        seg(v[2], v[3]); // each cell draws its upper half; neighbours close the rest
        seg(v[3], v[4]);
        seg(v[4], v[5]);
        seg(v[5], v[0]);
      }
    }
    if (geoms.length) {
      const pos = [];
      for (const gq of geoms) pos.push(...gq.attributes.position.array);
      const gm = new THREE.BufferGeometry();
      gm.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      gm.computeVertexNormals();
      mesh(gm, dbl(mat(0x222428, "plastic", "car:grille")), fb, "grille-cells");
    }
  }
  // chrome smile: a flat band on the opening border, ~30 mm wide, slightly proud, with a rolled inner edge
  const path = [];
  for (let k = edge.length - 1; k > 0; k--) path.push([-edge[k][0], edge[k][1]]);
  for (let k = 0; k < edge.length; k++) path.push([edge[k][0], edge[k][1]]);
  const sw = (i, n) => {
    const t = Math.abs((2 * i) / (n - 1) - 1);
    return lerp(0.036, 0.042, smooth01((t - 0.5) / 0.3)) * (1 - 0.7 * smooth01((t - 0.86) / 0.14));
  }; // swells up the sides, tapers to a point at the lamp tips
  mesh(frontRibbon(path, sw, 0.004, 1), dbl(M.chrome), fb, "grille-chrome");
  // chrome thickness: a short wall at the band's inner edge down into the opening
  {
    const r0 = [],
      r1 = [];
    for (let i = 0; i < path.length; i++) {
      const a = path[Math.max(0, i - 1)],
        b = path[Math.min(path.length - 1, i + 1)];
      let tx = b[0] - a[0],
        tz = b[1] - a[1];
      const L = Math.hypot(tx, tz) || 1;
      tx /= L;
      tz /= L;
      const wi = sw(i, path.length),
        x = path[i][0] - tz * wi,
        z = path[i][1] + tx * wi,
        p = frontHit(x, z),
        n = frontN(x, z);
      r0.push([
        [p.x + n.x * 0.004, p.y + n.y * 0.004, p.z + n.z * 0.004],
        [n.x, n.y, n.z],
      ]);
      r1.push([
        [p.x - n.x * 0.012, p.y - n.y * 0.012, p.z - n.z * 0.012],
        [n.x, n.y, n.z],
      ]);
    }
    mesh(gridGeo([r0, r1], { mirror: false }), dbl(M.chrome), fb, "grille-chrome");
  }
  // thin black line just outside the chrome (the dark seam under the smile)
  const below = path.map(([x, z], i) => {
    const a = path[Math.max(0, i - 1)],
      b = path[Math.min(path.length - 1, i + 1)];
    let tx = b[0] - a[0],
      tz = b[1] - a[1];
    const L = Math.hypot(tx, tz) || 1;
    return [x - (-tz / L) * 0.011, z - (tx / L) * 0.011];
  });
  mesh(
    frontRibbon(
      below,
      (i, n) => lerp(0.011, 0.004, smooth01((Math.abs((2 * i) / (n - 1) - 1) - 0.6) / 0.4)),
      0.002,
      1,
    ),
    M.trim,
    fb,
    "grille-chrome-line",
  );
  // H badge on the mesh, standing out to the chrome plane
  const bz = 0.651,
    bp = frontHit(0, bz),
    bn = frontN(0, bz);
  const bg = new THREE.Group();
  bg.position.copy(bp).add(bn.clone().multiplyScalar(-0.004));
  bg.quaternion.setFromUnitVectors(V(0, 1, 0), bn);
  fb.add(bg);
  // Honda emblem: rounded-trapezoid frame (125 top / 105 bottom / 99 tall, 9 mm band) and a flared H
  const toLocal = (geo, d) => {
    geo.rotateX(Math.PI / 2);
    geo.translate(0, d, 0);
    return geo;
  };
  const rtrap = (wt, wb, h, r) => {
    // rounded trapezoid outline (x across, y up), r = corner radius
    const sh = [],
      c = [
        [-wb / 2, -h / 2],
        [wb / 2, -h / 2],
        [wt / 2, h / 2],
        [-wt / 2, h / 2],
      ];
    for (let k = 0; k < 4; k++) {
      const P0 = c[(k + 3) % 4],
        P1 = c[k],
        P2 = c[(k + 1) % 4];
      const a = [P0[0] - P1[0], P0[1] - P1[1]],
        b = [P2[0] - P1[0], P2[1] - P1[1]],
        la = Math.hypot(...a),
        lb = Math.hypot(...b);
      const A = [P1[0] + (a[0] / la) * r, P1[1] + (a[1] / la) * r],
        Bp = [P1[0] + (b[0] / lb) * r, P1[1] + (b[1] / lb) * r];
      for (let i = 0; i <= 6; i++) {
        const t = i / 6,
          u = 1 - t;
        sh.push(
          new THREE.Vector2(
            u * u * A[0] + 2 * u * t * P1[0] + t * t * Bp[0],
            u * u * A[1] + 2 * u * t * P1[1] + t * t * Bp[1],
          ),
        );
      }
    }
    return sh;
  };
  const outer = new THREE.Shape(rtrap(0.125, 0.105, 0.099, 0.02));
  outer.holes.push(new THREE.Path(rtrap(0.107, 0.087, 0.081, 0.012).reverse()));
  bg.add(
    new THREE.Mesh(
      toLocal(
        new THREE.ExtrudeGeometry(outer, { depth: 0.007, bevelEnabled: false, curveSegments: 4 }),
        0.007,
      ),
      M.chrome,
    ),
  );
  const disc = new THREE.Mesh(
    toLocal(new THREE.ShapeGeometry(new THREE.Shape(rtrap(0.108, 0.088, 0.082, 0.012))), 0.001),
    mat(0x1c1e21, "plastic", "car:grille"),
  );
  bg.add(disc);
  // H: uprights flare out toward the top, thin crossbar
  const Hs = new THREE.Shape(
    [
      [-0.034, 0.033],
      [-0.019, 0.033],
      [-0.016, 0.006],
      [0.016, 0.006],
      [0.019, 0.033],
      [0.034, 0.033],
      [0.026, -0.033],
      [0.014, -0.033],
      [0.0125, -0.004],
      [-0.0125, -0.004],
      [-0.014, -0.033],
      [-0.026, -0.033],
    ].map(([x, y]) => new THREE.Vector2(x, y)),
  );
  bg.add(
    new THREE.Mesh(
      toLocal(new THREE.ExtrudeGeometry(Hs, { depth: 0.008, bevelEnabled: false }), 0.009),
      M.chrome,
    ),
  );
}

// buildLowerIntake(B, projector): the lower intake below the bumper crease, in the front bumper group (fb)
export function buildLowerIntake(B, { frontGeo, frontRibbon }) {
  const { M, fb, mat, dbl, mesh } = B;
  // a narrow centre slot (IB..ISLOT high) plus a taller pocket at each corner, all on one straight bottom edge;
  // T_ITOP: the pocket's top edge height over |x|; xIn / xOut: the pocket's inner / outer half-width at height z
  const IB = 0.328,
    ISLOT = 0.395;
  const T_ITOP = mono([
    [0.3, ISLOT],
    [0.33, 0.397],
    [0.39, 0.41],
    [0.47, 0.434],
    [0.545, 0.45],
    [0.62, 0.456],
    [0.7, 0.459],
    [0.745, 0.46],
  ]);
  const xIn = (z) => {
    let a = 0.3,
      b = 0.745;
    for (let k = 0; k < 30; k++) {
      const m = (a + b) / 2;
      if (T_ITOP(m) < z) a = m;
      else b = m;
    }
    return (a + b) / 2;
  };
  const xOut = (z) =>
    0.745 +
    0.018 * Math.sqrt(Math.max(0, 1 - ((z - 0.395) / 0.066) ** 2)) -
    0.03 * (1 - Math.sqrt(Math.max(0, 1 - ((z - 0.395) / 0.066) ** 2)));
  const blk = dbl(mat(0x0f1012, "plastic", "car:grille"));
  mesh(
    frontGeo(IB, ISLOT, (z) => -xOut(z), xOut, 0.0025, 8, 90),
    blk,
    fb,
    "lower-intake",
  );
  for (const sg of [-1, 1]) {
    const lo = (z) => (sg > 0 ? xIn(z) : -xOut(z)),
      hi = (z) => (sg > 0 ? xOut(z) : -xIn(z));
    mesh(frontGeo(ISLOT - 0.001, 0.4605, lo, hi, 0.0025, 10, 30), blk, fb, "lower-intake");
    // LX: black blank bezel (fog-lamp shaped rounded panel) in the outer pocket, slightly proud and lighter
    const bx = 0.632,
      bzc = 0.384,
      rw = 0.075,
      rh = 0.034;
    const bl = (z) => {
      const q = Math.sqrt(Math.max(0, 1 - ((z - bzc) / rh) ** 4));
      return sg > 0 ? bx - rw * q : -(bx + rw * q);
    };
    const bh = (z) => {
      const q = Math.sqrt(Math.max(0, 1 - ((z - bzc) / rh) ** 4));
      return sg > 0 ? bx + rw * q : -(bx - rw * q);
    };
    mesh(
      frontGeo(bzc - rh + 0.001, bzc + rh - 0.001, bl, bh, 0.006, 10, 20),
      dbl(mat(0x2a2e33, "plastic", "car:grille")),
      fb,
      "fog-bezel",
    );
  }
  // chrome strip: straight across the centre (10 mm), kinking up ~50 mm at each end into the pocket brows
  const strip = [];
  for (let k = 0; k <= 80; k++) {
    const x = -0.548 + (1.096 * k) / 80,
      ax = Math.abs(x);
    strip.push([x, 0.349 + 0.05 * smooth01((ax - 0.325) / 0.22)]);
  }
  const sww = (i, n) => {
    const t = Math.abs((2 * i) / (n - 1) - 1);
    return lerp(0.01, 0.012, smooth01((t - 0.6) / 0.4));
  };
  const cb = mesh(frontRibbon(strip, sww, 0.007, 1), dbl(M.chrome), fb, "intake-chrome");
  cb.castShadow = false;
}
