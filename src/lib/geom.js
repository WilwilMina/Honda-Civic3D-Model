// Shape helpers shared by every area: each returns a THREE.BufferGeometry built from plain arrays, in the
// car's z-up frame (metres, see docs/ARCHITECTURE.md) or in whatever units the caller scales later.
// Several take a frame F = {o, a, u, v}: origin o, axis a, and two directions u, v across the axis
// (all [x, y, z]; directions need not be normalized). fromDump() turns a whole shape dump into meshes.
import * as THREE from "three";

const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);

// Make every triangle's winding agree with its vertex normals (outward = front face). Idempotent.
// Used on all geometry built here, and by areas on geometry they transform (e.g. mirror) themselves.
export function fixWinding(g) {
  const p = g.attributes.position,
    n = g.attributes.normal;
  if (!p || !n || !g.index) return g;
  const idx = g.index.array;
  const a = new THREE.Vector3(),
    b = new THREE.Vector3(),
    c = new THREE.Vector3(),
    vn = new THREE.Vector3(),
    t = new THREE.Vector3();
  for (let i = 0; i < idx.length; i += 3) {
    const ia = idx[i],
      ib = idx[i + 1],
      ic = idx[i + 2];
    a.fromBufferAttribute(p, ia);
    b.fromBufferAttribute(p, ib).sub(a);
    c.fromBufferAttribute(p, ic).sub(a);
    vn.fromBufferAttribute(n, ia).add(t.fromBufferAttribute(n, ib)).add(t.fromBufferAttribute(n, ic));
    if (b.cross(c).dot(vn) < 0) {
      idx[i + 1] = ic;
      idx[i + 2] = ib;
    }
  }
  g.index.needsUpdate = true;
  return g;
}

// Pack flat position/normal/index arrays into an indexed geometry with consistent winding.
function finish(pos, nrm, idx) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  if (idx) {
    g.setIndex(idx);
    fixWinding(g);
  }
  g.computeBoundingSphere();
  return g;
}

// Solid of revolution around F.a. poly = [[s, r], ...] is the profile (meridian): s = distance along the axis
// from F.o, r = radius. Each profile segment gets its own vertices so edges stay crisp; smooth around the axis.
export function lathe(F, poly, segments = 32) {
  const o = v3(F.o),
    a = v3(F.a).normalize(),
    u = v3(F.u).normalize(),
    v = v3(F.v).normalize();
  const pos = [],
    nrm = [],
    idx = [];
  for (let i = 0; i < poly.length - 1; i++) {
    const [s0, r0] = poly[i],
      [s1, r1] = poly[i + 1];
    if (Math.abs(s1 - s0) < 1e-9 && Math.abs(r1 - r0) < 1e-9) continue;
    const ds = s1 - s0,
      dr = r1 - r0;
    const len = Math.hypot(ds, dr);
    const na = -dr / len,
      nr = ds / len; // meridian normal (axial, radial)
    const base = pos.length / 3;
    for (let j = 0; j <= segments; j++) {
      const t = (j / segments) * Math.PI * 2;
      const radial = u
        .clone()
        .multiplyScalar(Math.cos(t))
        .add(v.clone().multiplyScalar(Math.sin(t)));
      for (const [s, r] of [
        [s0, r0],
        [s1, r1],
      ]) {
        const p = o.clone().add(a.clone().multiplyScalar(s)).add(radial.clone().multiplyScalar(r));
        pos.push(p.x, p.y, p.z);
        const n = a.clone().multiplyScalar(na).add(radial.clone().multiplyScalar(nr)).normalize();
        nrm.push(n.x, n.y, n.z);
      }
    }
    for (let j = 0; j < segments; j++) {
      const p0 = base + j * 2,
        p1 = p0 + 1,
        p2 = p0 + 2,
        p3 = p0 + 3;
      idx.push(p0, p2, p1, p1, p2, p3);
    }
  }
  return finish(pos, nrm, idx);
}

// Prism: polygon poly = [[x, y], ...] in the (u, v) plane, extruded along a from s0 to s1.
// The polygon may be concave and either winding; flat normals on the caps and on every side face.
export function prism(F, poly, s0, s1) {
  const o = v3(F.o),
    a = v3(F.a).normalize(),
    u = v3(F.u).normalize(),
    v = v3(F.v).normalize();
  const P = (x, y, s) =>
    o
      .clone()
      .add(u.clone().multiplyScalar(x))
      .add(v.clone().multiplyScalar(y))
      .add(a.clone().multiplyScalar(s));
  let pts = poly.map(([x, y]) => new THREE.Vector2(x, y));
  if (THREE.ShapeUtils.isClockWise(pts)) pts = pts.reverse();
  const pos = [],
    nrm = [],
    idx = [];
  const tris = THREE.ShapeUtils.triangulateShape(pts, []);
  const handed = u.clone().cross(v).dot(a) > 0 ? 1 : -1; // flips windings when (u, v, a) is left-handed
  for (const [s, sign] of [
    [s0, -1],
    [s1, 1],
  ]) {
    const base = pos.length / 3;
    const n = a.clone().multiplyScalar(sign);
    for (const p of pts) {
      const q = P(p.x, p.y, s);
      pos.push(q.x, q.y, q.z);
      nrm.push(n.x, n.y, n.z);
    }
    for (const [i, j, k] of tris)
      sign * handed > 0 ? idx.push(base + i, base + j, base + k) : idx.push(base + i, base + k, base + j);
  }
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i],
      q = pts[(i + 1) % pts.length];
    const e = new THREE.Vector2(q.x - p.x, q.y - p.y);
    if (e.length() < 1e-9) continue;
    const n2 = new THREE.Vector2(e.y, -e.x).normalize(); // outward for CCW polygon
    const n = u
      .clone()
      .multiplyScalar(n2.x)
      .add(v.clone().multiplyScalar(n2.y))
      .normalize()
      .multiplyScalar(handed);
    const base = pos.length / 3;
    for (const [pp, s] of [
      [p, s0],
      [q, s0],
      [q, s1],
      [p, s1],
    ]) {
      const w = P(pp.x, pp.y, s);
      pos.push(w.x, w.y, w.z);
      nrm.push(n.x, n.y, n.z);
    }
    handed > 0
      ? idx.push(base, base + 1, base + 2, base, base + 2, base + 3)
      : idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
  }
  return finish(pos, nrm, idx);
}

// Box centred at o with its edges along axes = [ax, ay, az] and half-sizes half = [hx, hy, hz].
export function box(o, axes, half) {
  const g = new THREE.BoxGeometry(half[0] * 2, half[1] * 2, half[2] * 2);
  const m = new THREE.Matrix4().makeBasis(
    v3(axes[0]).normalize(),
    v3(axes[1]).normalize(),
    v3(axes[2]).normalize(),
  );
  m.setPosition(v3(o));
  g.applyMatrix4(m);
  return g;
}

// Sphere of radius r at o; `seg` segments around, half as many (at least 8) pole to pole.
export function ball(o, r, seg = 20) {
  const g = new THREE.SphereGeometry(r, seg, Math.max(8, seg >> 1));
  g.rotateX(Math.PI / 2); // poles on z (three.js builds them on y)
  g.translate(o[0], o[1], o[2]);
  return g;
}

// Tube along a polyline (hoses, wires, pipes). radii: one radius, or one per point. Cross-section frames are
// parallel-transported from point to point so the tube doesn't twist. closed = loop back to the first point
// (belts); caps = close the two open ends.
export function sweep(points, radii, { radial = 12, closed = false, caps = true } = {}) {
  const P = points.map(v3);
  const n = P.length;
  if (n < 2) return new THREE.BufferGeometry();
  const R = Array.isArray(radii) ? radii : P.map(() => radii);
  // tangent at each point (central difference; wraps around for closed loops)
  const T = P.map((p, i) => {
    const a = P[Math.max(0, i - 1)],
      b = P[Math.min(n - 1, i + 1)];
    if (closed)
      return P[(i + 1) % n]
        .clone()
        .sub(P[(i - 1 + n) % n])
        .normalize();
    return b.clone().sub(a).normalize();
  });
  // first normal: z (or x if the tube starts out vertical), made perpendicular to the first tangent;
  // then rotate it along with the tangent from point to point
  let N = new THREE.Vector3(0, 0, 1);
  if (Math.abs(N.dot(T[0])) > 0.9) N = new THREE.Vector3(1, 0, 0);
  N = N.sub(T[0].clone().multiplyScalar(N.dot(T[0]))).normalize();
  const frames = [];
  for (let i = 0; i < n; i++) {
    if (i > 0) {
      const axis = T[i - 1].clone().cross(T[i]);
      const s = axis.length();
      // Known limitation: for a turn over 90° the exact angle is π − asin(s), not −asin(s). The re-projection
      // below keeps the frame valid, so a hairpin bend can only add some twist; left as is because changing
      // it would alter existing hose shapes.
      if (s > 1e-8)
        N.applyAxisAngle(axis.normalize(), Math.asin(Math.min(1, s)) * (T[i - 1].dot(T[i]) < 0 ? -1 : 1));
      N.sub(T[i].clone().multiplyScalar(N.dot(T[i]))).normalize();
    }
    frames.push([N.clone(), T[i].clone().cross(N).normalize()]);
  }
  const pos = [],
    nrm = [],
    idx = [];
  for (let i = 0; i < n; i++) {
    const [nn, bb] = frames[i];
    for (let j = 0; j <= radial; j++) {
      const t = (j / radial) * Math.PI * 2;
      const d = nn
        .clone()
        .multiplyScalar(Math.cos(t))
        .add(bb.clone().multiplyScalar(Math.sin(t)));
      const q = P[i].clone().add(d.clone().multiplyScalar(R[i]));
      pos.push(q.x, q.y, q.z);
      nrm.push(d.x, d.y, d.z);
    }
  }
  const ring = radial + 1;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const i2 = (i + 1) % n;
    for (let j = 0; j < radial; j++) {
      const a = i * ring + j,
        b = i2 * ring + j,
        c = a + 1,
        d = b + 1;
      idx.push(a, b, c, c, b, d);
    }
  }
  if (caps && !closed) {
    for (const [i, sign] of [
      [0, -1],
      [n - 1, 1],
    ]) {
      const base = pos.length / 3;
      const t = T[i].clone().multiplyScalar(sign);
      pos.push(P[i].x, P[i].y, P[i].z);
      nrm.push(t.x, t.y, t.z);
      for (let j = 0; j <= radial; j++) {
        const k = i * ring + j;
        pos.push(pos[k * 3], pos[k * 3 + 1], pos[k * 3 + 2]);
        nrm.push(t.x, t.y, t.z);
      }
      for (let j = 0; j < radial; j++)
        sign > 0 ? idx.push(base, base + 1 + j, base + 2 + j) : idx.push(base, base + 2 + j, base + 1 + j);
    }
  }
  return finish(pos, nrm, idx);
}

// Build meshes from a shape dump of the older 2D model kit:
//   {items:[{name, part, shapes:[{kind:"body"|"prism"|"box"|"ball"|"tube", ...}]}], routes:[{name, part, points, r}]}
// Shapes stay in kit units; the returned group carries `transform` (uniform scale + offset) into car metres.
// Every mesh is named after its item and tagged userData.localPart (the area adds its "area:" prefix);
// materialFor(part, name) picks its material. Used by the engine bay (src/areas/bay/base-model.js).
export function fromDump(dump, { materialFor, transform = { scale: 1, offset: [0, 0, 0] } } = {}) {
  const group = new THREE.Group();
  group.scale.setScalar(transform.scale);
  group.position.set(...transform.offset);
  const add = (geom, part, name) => {
    const mesh = new THREE.Mesh(geom, materialFor(part, name));
    mesh.name = name;
    mesh.userData.localPart = part;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };
  for (const it of dump.items) {
    for (const s of it.shapes) {
      let g = null;
      if (s.kind === "body") g = lathe(s.F, s.poly, 32);
      else if (s.kind === "prism") g = prism(s.F, s.poly, s.s0, s.s1);
      else if (s.kind === "box") g = box(s.o, s.axes, s.half);
      else if (s.kind === "ball") g = ball(s.o, s.r);
      else if (s.kind === "tube") g = sweep(s.points, s.radii, { radial: 10 });
      if (g) add(g, it.part, it.name);
    }
  }
  // routes are hoses/wires/belts: tubes along a point list; a route named "belt" is a closed loop
  for (const r of dump.routes) {
    const part = r.part || r.name;
    add(sweep(r.points, r.r, { radial: 12, closed: r.name === "belt" }), part, r.name);
  }
  return group;
}
