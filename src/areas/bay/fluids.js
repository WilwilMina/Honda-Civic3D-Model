// See-through fluid reservoirs: turns the coolant, brake fluid and washer tanks from shapes.json into tinted
// translucent shells with a coloured fluid block inside (filled to a set level), plus the coolant MIN/MAX marks.
// Kit units throughout (see base-model.js).
import { prism, fixWinding } from "../../lib/geom.js";
import { alignedBox, shrink } from "./geometry.js";
import dump from "./shapes.json";

// The first shape of a shapes.json item (each tank is a single prism).
const shapeOf = (name) => dump.items.find((it) => it.name === name)?.shapes[0];

// Builds the three tanks. b: the shared build context from scene.js (byName finds the kit mesh for an item name).
export function buildFluids({ mat, P, add, byName }) {
  // tank: shell tint, fluid colour, fluid top (kit z) and shell opacity
  const tank = (name, part, tint, fluid, level, opacity = 0.42) => {
    const s = shapeOf(name);
    const m = byName(name)[0];
    if (!m) return;
    const shell = mat(tint, "lens", P(part));
    shell.opacity = opacity;
    shell.depthWrite = false;
    shell.roughness = 0.25;
    m.material = shell;
    // draw order: fluid (1) before the transparent shell (2)
    m.renderOrder = 2;
    m.castShadow = false;
    const g = fixWinding(prism(s.F, shrink(s.poly, 0.86), s.s0 + 1, level));
    add(g, mat(fluid, "plastic", P(part)), part, m.parent, { name: name + ".fluid" }).renderOrder = 1;
  };
  tank("reservoir", "coolant-reservoir", 0xf4f2ea, 0x3d8fe8, 93);
  tank("brake.res", "brake-reservoir", 0xf4f1e4, 0xd9b45a, 135);
  tank("washer.tank", "washer-tank", 0xf0f2f2, 0x3f8ff0, 55, 0.5);
  // MIN / MAX marks on the coolant reservoir's front face
  for (const z of [88, 99])
    add(
      alignedBox([99, 64.15, z], [3.5, 0.12, 0.25]),
      mat(0x2a2c30, "plastic", P("coolant-reservoir")),
      "coolant-reservoir",
    );
}
