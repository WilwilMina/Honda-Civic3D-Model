// Shared toolkit for the chassis area ("Brakes & suspension"). It holds the kit-unit constants, one material
// look per part, and the loader for shapes.json (pure geometry helpers live in geometry.js). createKit(ctx)
// makes the area's groups and the add()/item() helpers that the corner builders (front-corner.js,
// rear-corner.js, brake-lines.js, wheels.js) put their meshes through, so every mesh is tagged with its
// "chassis:<part>" key the same way.

// shapes.json format and transform. The file is an earlier 2D (isometric) model of the four corners, dumped
// as 3D shapes in kit units.
//   - 1 kit unit = 5 mm (the file's "units": 0.005). Axes as the car: +x driver side, +y forward, +z up.
//   - items: {name, part, shapes:[...]}. A shape is a lathe "body" (frame F + profile poly), a "prism" (F,
//     poly, s0..s1), a "box" or a "ball". routes: {name, part, points, r} become swept tubes.
//   - Names ending in "1" are the driver-side copy (x > 0) and "-1" the passenger side. A few one-sided items
//     (hose.bracket, abs.sensor) are mirrored across x = 0 for the other side.
//   - The 2D model squeezed the wheelbase to 200 kit units (1 m), so the front and rear halves are placed
//     separately:
//       front parts (front axle at kit y = 0):    car = (x·0.005,          y·0.005 + 1.335, z·0.005)
//       rear parts  (rear axle at kit y = -200):  car = (x·0.005·0.761/0.75, y·0.005 - 0.335, z·0.005)
//     That puts the axles at y = ±1.335 m (the real 2.670 m wheelbase). The rear x stretch widens the rear
//     wheel centres from x = ±0.75 to ±0.761 m (rear track 1.522 m vs 1.499 m front). Hub centres sit at kit
//     z = 63 (0.315 m).
//   - Only the items this area uses are kept in the file. Pieces that cross the wheelbase (brake lines,
//     parking-brake cables) are drawn in metres instead (brake-lines.js), because the squeezed 2D routes
//     would be too short.
import * as THREE from "three";
import dump from "./shapes.json";
import { lathe, prism, box, ball, sweep } from "../../lib/geom.js";
import { fixWinding, mirrorX, tube } from "./geometry.js";

export const K = 0.005; // kit unit -> metres (shapes.json "units")
export const RY = -200; // rear axle line, kit y in the rear group
export const HZ = 63; // hub centre height, kit z (0.315 m)
export const A = "chassis:"; // part-key prefix
export const FRONT_AXLE_Y = 1.335; // car y of the front group's origin (front axle)
const REAR_OFFSET_Y = -0.335; // car y of the rear group's origin (kit y = -200 lands on the rear axle, -1.335)
const REAR_X_STRETCH = 0.761 / 0.75; // rear wheel centres are 11 mm further out than the front ones

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// Geometry of one shapes.json shape (see the header for the kinds).
function shapeGeom(sh) {
  if (sh.kind === "body") {
    const F = { ...sh.F };
    const a = V(...F.a),
      u = V(...F.u),
      v = V(...F.v);
    if (u.clone().cross(v).dot(a) < 0) F.v = v.negate().toArray(); // make the lathe frame right-handed
    return fixWinding(lathe(F, sh.poly, 32));
  }
  if (sh.kind === "prism") return fixWinding(prism(sh.F, sh.poly, sh.s0, sh.s1));
  if (sh.kind === "box") return box(sh.o, sh.axes, sh.half);
  if (sh.kind === "ball") return ball(sh.o, sh.r);
  return null;
}

// createKit(ctx): the area's groups plus the helpers that add tagged meshes to them.
export function createKit(ctx) {
  const { mat, C } = ctx;
  // ---------------------------------------------------------------- materials: [colour, preset] per part
  const LOOK = {
    rotor: [0xb3b7bc, "metal"],
    hub: [C.darksteel, "metal"],
    caliper: [0x7a7f86, "metal"],
    pads: [0x3b3a38, "rubber"],
    "brake-hose": [C.rubber, "rubber"],
    "brake-lines": [0xb9bec2, "chrome"],
    "abs-sensor": [C.black, "plastic"],
    knuckle: [C.iron, "metal"],
    strut: [0x9da3aa, "metal"],
    spring: [0x34373c, "paint"],
    "strut-mount": [0x3a3d42, "rubber"],
    "lower-arm": [0x5d6167, "metal"],
    "ball-joint": [C.darksteel, "metal"],
    "sway-bar": [0x303236, "paint"],
    "sway-link": [0x6e737a, "metal"],
    "tie-rod": [C.steel, "metal"],
    "steering-rack": [C.aluminum, "metal"],
    "eps-motor": [0x8a9097, "metal"],
    "steering-shaft": [C.steel, "metal"],
    "cv-axle": [0x9a9fa5, "metal"],
    differential: [C.aluminum, "metal"],
    subframe: [0x55595f, "metal"],
    drum: [0x6f7378, "metal"],
    shoes: [0x8f8f8a, "metal"],
    "wheel-cylinder": [0x80858b, "metal"],
    "parking-brake": [0x26282b, "plastic"],
    "hub-rear": [C.darksteel, "metal"],
    "rear-knuckle": [C.iron, "metal"],
    "rear-arms": [0x5d6167, "metal"],
    "trailing-arm": [0x5d6167, "metal"],
    "rear-spring": [0x34373c, "paint"],
    "rear-shock": [0x9da3aa, "metal"],
    tire: [C.rubber, "rubber"],
    wheel: [0xc4c8cd, "paint"],
  };
  // M(part[, colour, preset]): the part's own material, by default its LOOK
  const M = (part, color, preset) => mat(color ?? LOOK[part][0], preset ?? LOOK[part][1], A + part);
  const RUBBER = (part) => mat(C.rubber, "rubber", A + part);
  const CHROME = (part) => mat(C.chrome, "chrome", A + part);
  const LINING = (part) => mat(0x5a4c40, "rubber", A + part);

  const group = new THREE.Group();
  group.name = "chassis";
  group.userData.goto = "chassis";
  const frontG = new THREE.Group(); // kit units, front axle at kit y = 0
  frontG.scale.setScalar(K);
  frontG.position.set(0, FRONT_AXLE_Y, 0);
  const rearG = new THREE.Group(); // kit units, rear axle at kit y = RY
  rearG.scale.set(K * REAR_X_STRETCH, K, K);
  rearG.position.set(0, REAR_OFFSET_Y, 0);
  const worldG = new THREE.Group(); // metres (long routes under the floor, the wheel stack)
  group.add(frontG, rearG, worldG);

  // add(): one mesh tagged with its part key
  function add(parent, geom, part, material, { shadow = true } = {}) {
    const m = new THREE.Mesh(geom, material || M(part));
    m.userData.part = A + part;
    m.castShadow = shadow;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  const items = new Map(dump.items.map((it) => [it.name, it]));
  const routes = new Map(dump.routes.map((r) => [r.name, r]));
  // item(): put a shapes.json item (or route) into parent. mirror copies a driver-side item to the passenger
  // side; dx/dz shift it (kit units) where the 3D model moved a piece away from its 2D position.
  function item(name, parent, { mirror = false, part, material, dx = 0, dz = 0 } = {}) {
    const it = items.get(name);
    if (it) {
      for (const sh of it.shapes) {
        let g = shapeGeom(sh);
        if (!g) continue;
        if (mirror) g = mirrorX(g);
        if (dx || dz) g.translate(dx, 0, dz);
        add(parent, g, part || it.part, material);
      }
      return;
    }
    const r = routes.get(name);
    if (!r) {
      console.warn("chassis: missing shapes.json item", name);
      return;
    }
    let g = tube(r.points, r.r, 12);
    if (mirror) g = mirrorX(g);
    add(parent, g, part || r.part, material);
  }

  // Orange "pressure" glow shells around the brake hoses and lines, shown while the brakes are pressed.
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xff8a2a,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const glows = [];
  function glowOf(parent, geom) {
    const g = new THREE.Mesh(geom, glowMat);
    g.raycast = () => {}; // never picked: clicks go to the hose underneath
    g.renderOrder = 2;
    parent.add(g);
    glows.push(g);
    return g;
  }
  // dynTube(): a tube (hose, link, wire) whose geometry is rebuilt with set(points) when the wheel moves
  function dynTube(parent, part, r, material, glow = false) {
    const m = add(parent, new THREE.BufferGeometry(), part, material, { shadow: false });
    const gl = glow ? glowOf(parent, new THREE.BufferGeometry()) : null;
    return {
      mesh: m,
      set(pts) {
        m.geometry.dispose();
        m.geometry = tube(pts, r, 8);
        if (gl) {
          gl.geometry.dispose();
          gl.geometry = sweep(pts, r * 1.9, { radial: 8 });
        }
      },
    };
  }

  return {
    ctx,
    mat,
    C,
    M,
    RUBBER,
    CHROME,
    LINING,
    group,
    frontG,
    rearG,
    worldG,
    add,
    item,
    glowMat,
    glows,
    glowOf,
    dynTube,
  };
}
