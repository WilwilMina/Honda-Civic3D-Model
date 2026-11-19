// Shared toolkit for the cabin builders: the cabin's root group, mesh/geometry helpers, canvas textures and the
// interior colour palette. scene.js creates one kit and passes it to dashboard.js, cluster.js, controls.js,
// service.js and seats.js, so every builder adds its meshes to the same group with the same part-key prefix.
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { prism } from "../../lib/geom.js";

// Interior colours (hex), shared so separate builders match.
export const COLORS = {
  dash: 0x2b2e33,
  dashTop: 0x26282c,
  trim: 0x3a3e45,
  silverTrim: 0x9aa1aa,
  carpet: 0x2a2b2e,
  seat: 0x3b3f46,
};

// Build the cabin kit for one build(ctx) call.
export function createKit(ctx) {
  const { THREE, mat } = ctx;
  const root = new THREE.Group();
  root.name = "cabin";
  const P = (k) => "cabin:" + k;

  // canvas textures; scene.js flips them all when the car root is mirrored so writing stays readable
  const texs = [];
  const mkTex = (cv) => {
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    texs.push(t);
    return t;
  };

  // mesh helper: geometry + material, tagged with a part (optional), added to parent
  function add(geom, material, part, parent = root, shadow = false) {
    const m = new THREE.Mesh(geom, material);
    if (part) m.userData.part = P(part);
    m.castShadow = shadow;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  // rounded box w (x) × d (y) × h (z); the radius is clamped so thin boxes stay valid
  const rbox = (w, d, h, r = 0.01, seg = 3) =>
    new RoundedBoxGeometry(w, d, h, seg, Math.min(r, w / 2 - 1e-4, d / 2 - 1e-4, h / 2 - 1e-4));
  // move a geometry to (x, y, z) and return it
  const at = (g, x, y, z) => {
    g.translate(x, y, z);
    return g;
  };
  // prism in the (y,z) plane pushed along x from x0 to x1 (dashboard side profiles)
  const yzPrism = (poly, x0, x1) =>
    prism({ o: [0, 0, 0], a: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] }, poly, x0, x1);
  // flat plane facing -y (toward the seats); a texture on it reads left→right toward +x
  const facePlane = (w, h) => {
    const g = new THREE.PlaneGeometry(w, h);
    g.rotateX(Math.PI / 2);
    return g;
  };

  // shared materials
  const M = {
    dash: mat(COLORS.dash, "plastic", P("dash")),
    dashTop: mat(COLORS.dashTop, "plastic", P("dash")),
    trim: mat(COLORS.trim, "plastic"),
    silver: mat(COLORS.silverTrim, "metal"),
    carpet: mat(COLORS.carpet, "fabric"),
    black: mat(0x18191b, "plastic"),
    glossBlack: new THREE.MeshStandardMaterial({ color: 0x0c0d0f, roughness: 0.25, metalness: 0.1 }),
  };

  return { THREE, mat, claim: ctx.claim, root, P, texs, mkTex, add, rbox, at, yzPrism, facePlane, M };
}
