// The car's exterior body: a 2013 Honda Civic LX sedan (9th gen, 2013 refresh), in silver.
// createBody() builds the shared measured body (panels, glass, wheels, wipers), lets the section modules
// (front.js, rear.js, side.js) add their details through the helper bag B, and installs the ctx.car API.
// The body itself lives in car/body/: profile.js (measured tables) -> section.js (cross-sections) ->
// surface.js (patch builders) -> cut-lines.js (cut lines) -> panels.js / doors.js / fittings.js -> api.js.
import { buildPanels } from "./body/panels.js";
import { buildPropRod, buildWheels, buildWipers } from "./body/fittings.js";
import { installCarApi } from "./body/api.js";

const PAINT = 0xc3c7ca; // Alabaster Silver Metallic (NH-700M) - render estimate from research

// createBody(ctx, sections): builds the exterior and returns the car area instance ({group, view, update, status}).
// Each section is a function (ctx, B) called once, in order, after the shared body is built.
export function createBody(ctx, sections = []) {
  const { THREE, mat, C } = ctx;
  const g = new THREE.Group();
  g.name = "exterior";

  // ---------------------------------------------------------------- materials
  const dbl = (m) => {
    m.side = THREE.DoubleSide;
    return m;
  };
  const M = {
    body: dbl(mat(PAINT, "paint", "car:body")),
    hood: dbl(mat(PAINT, "paint", "car:hood")),
    doors: dbl(mat(PAINT, "paint", "car:doors")),
    trunk: dbl(mat(PAINT, "paint", "car:trunk")),
    glass: mat(0x4f6a72, "glass", "car:glass"),
    trim: dbl(mat(0x1f2124, "plastic", "car:trim")),
    mesh: dbl(mat(0x15171a, "plastic", "car:grille")),
    chrome: mat(0xe4e8ec, "chrome", "car:chrome"),
    rubber: mat(C.rubber, "rubber", "car:tire"),
    steel: dbl(mat(0x5d6268, "metal", "car:wheel")),
    cover: mat(0xc9cdd1, "paint", "car:cover"),
    coverDark: mat(0x2b2e32, "plastic", "car:cover"),
    liner: dbl(mat(0x1a1b1d, "plastic", "car:liner")),
    inner: dbl(mat(0x3b3e43, "plastic", "car:doortrim")),
    plate: mat(0xf2f2ee, "plastic", "car:plate"),
    lensRed: mat(0xc0201c, "lens", "car:lensred"),
    reflector: dbl(mat(0xe9edf0, "metal", "car:reflector")),
    redBack: dbl(mat(0x6d0d0b, "plastic", "car:redback")),
    bulb: mat(0xfffbea, "glass", "car:bulb"),
    amber: mat(0xf09a2e, "lens", "car:amber"),
  };
  M.glass.opacity = 0.55;
  M.lensRed.opacity = 0.86;
  M.bulb.opacity = 0.9;
  M.amber.opacity = 0.9;

  // add a mesh to a parent (default: the exterior group), casting and receiving shadows
  function mesh(geo, m, parent = g, name = "") {
    const o = new THREE.Mesh(geo, m);
    o.name = name;
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  }

  // ---------------------------------------------------------------- body panels, wheels
  const parts = {}; // named objects other areas (lights) can claim
  const panels = buildPanels({ g, M, mat, dbl, mesh });
  const wheels = buildWheels({ g, M });

  // ---------------------------------------------------------------- lamp glow overlays and part lists
  // Lamps "light up" with separate glow meshes (MeshBasicMaterial, opacity 0 when off) so the part materials'
  // emissive stays free for the highlight; ctx.car.setLights sets their opacity.
  const glowMats = [];
  const glow = (color) => {
    const m = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    glowMats.push(m);
    return m;
  };
  const lights = { head: [], brake: [], tail: [], reverse: [], turn: [] };
  // parts the Lights & wipers area tags as clickable (filled by front.js, rear.js and the wipers below)
  for (const key of [
    "headlight",
    "lowBeam",
    "highBeam",
    "frontTurn",
    "brakeTail",
    "rearTurn",
    "rearMarker",
    "innerTail",
    "reverse",
    "plateLight",
    "thirdBrake",
    "wiperArm",
    "wiperBlade",
    "washer",
  ])
    parts[key] = [];

  const wipers = buildWipers({ g, M, mat, parts });
  const { prop, propBase, propLen } = buildPropRod({ g, mat });

  // ---------------------------------------------------------------- section details (front.js, rear.js, side.js)
  // B: the build-time state the sections add to. Shape math (profile, section, surface, cut-lines) they import directly.
  const B = {
    M, // shared materials
    g, // the exterior group
    mat, // ctx.mat
    dbl, // make a material double-sided
    mesh, // mesh(geo, material, parent = g, name)
    glow, // glow(color): a lamp glow material (off until setLights)
    lights, // glow meshes per lamp function: head, brake, tail, reverse, turn
    parts, // part lists for the Lights area
    fb: panels.fb, // front bumper group
    rb: panels.rb, // rear bumper group
    hood: panels.hood, // hood group (hinged at hoodPivot)
    hoodPivot: panels.hoodPivot,
    doors: panels.doors, // {fl, fr, rl, rr}: {group, side, skin, handleY, angle}
    trunkSkin: panels.trunkSkin, // trunk lid skin group (moves with the lid)
  };
  for (const section of sections) section(ctx, B);

  // ---------------------------------------------------------------- ctx.car API
  const update = installCarApi(ctx, {
    g,
    hood: panels.hood,
    hoodPivot: panels.hoodPivot,
    prop,
    propBase,
    propLen,
    doors: panels.doors,
    trunk: panels.trunk,
    wheels,
    wipers,
    parts,
    lights,
    glowMats,
  });

  return {
    group: g,
    view: { pos: [4.9, 4.9, 2.2], target: [0.25, 0.65, 0.6] },
    update,
    status: () => "2013 Civic LX sedan",
  };
}
