// The engine bay's base model, built from shapes.json: body structure, engine, accessories, tanks, hoses and
// cables. This file adapts that data for free 3D viewing (fixes, re-routed hoses, front/back corrections) and
// turns it into three.js meshes; scene.js then adds the hand-built details (cooling.js, belt.js, ...).
//
// What shapes.json is: a parts outline converted from an earlier 2D (isometric tabletop) model of the bay.
//   { units: 0.005, items: [{ name, part, shapes: [...] }], routes: [{ name, part, points, r }] }
//   - item shapes: "body" = solid of revolution (frame F = {o, a, u, v}, poly = [axial, radius] meridian),
//     "prism" = polygon in F's (u, v) plane extruded from s0 to s1 along a, "box", "tube";
//   - routes: hoses, cables, pipes and ducts as polylines with a radius r.
//   `part` is the part key the piece belongs to (its meshes are tagged "bay:<part>"); `name` identifies the piece.
// It is in "kit units" of 5 mm, with the same axes as the car frame (docs/ARCHITECTURE.md: +x driver side,
// +y forward, +z up). The bay's root group maps kit units to car metres with a uniform scale and an offset:
//   car = KIT_TRANSFORM.offset + KIT_TRANSFORM.scale * kit, i.e.
//   x = 0.005 * kx,   y = 1.585 + 0.005 * ky,   z = 0.18 + 0.005 * kz
// So kit (0, 0, 0) sits on the car's centre line just ahead of the front axle (y 1.335), 18 cm off the ground.
// Everything under the root group, including the hand-built parts in the sibling files, is authored in kit units.
import dump from "./shapes.json";
import { fromDump, fixWinding } from "../../lib/geom.js";
import { rightFrame, fillet } from "./geometry.js";
import { PULLEYS } from "./belt.js";
import { BATTERY_POS_POST, BATTERY_NEG_POST } from "./electrical.js";
import { kitMaterialFor } from "./colors.js";

const KIT_TRANSFORM = { scale: 0.005, offset: [0, 1.585, 0.18] };

// Parts that are bolted to the engine and shake with it.
export const ENGINE_PARTS = new Set([
  "engine-block",
  "valve-cover",
  "coils",
  "oil-cap",
  "dipstick",
  "oil-filter",
  "oil-pan",
  "intake-manifold",
  "throttle-body",
  "exhaust-manifold",
  "timing-cover",
  "alternator",
  "ac-compressor",
  "transmission",
  "starter",
  "thermostat",
  "tensioner",
  "crank-pulley",
  "water-pump",
  "belt",
  "atf-dipstick",
  "o2-sensor",
]);

// ---------------------------------------------------------------- front/back correction
// Layout fixes from docs/research/engine.md: the R18's exhaust manifold is cast into the FRONT of the head
// (radiator side) with the catalytic converter bolted to it; the plastic intake manifold is at the REAR (firewall
// side), throttle body at the driver end. The 2D model had them the other way round, so these pieces are mirrored
// front-to-back about the engine's centre.
const ENGINE_MID_Y = -8; // engine block spans kit y -30..14
const mirrorY = (y) => 2 * ENGINE_MID_Y - y;
const MIRROR_ITEMS = new Set([
  "exhaust.shield",
  "cat.body",
  "o2.boss",
  "o2.body",
  "intake.plenum",
  "intake.map",
  "throttle",
]);
const MIRROR_ROUTES = new Set([
  "intake.runner0",
  "intake.runner1",
  "intake.runner2",
  "intake.runner3",
  "cat.inlet",
]);

// ---------------------------------------------------------------- re-routed hoses and cables
// Raw corner points (kit units), rounded with fillets of radius `bend`; they replace the routes of the same name.
const [POS_X, POS_Y] = BATTERY_POS_POST;
const [NEG_X, NEG_Y] = BATTERY_NEG_POST;
const CUSTOM_ROUTES = {
  // stops before the steering rack; the underbody exhaust continues it
  "cat.outlet": {
    pts: [
      [-44, 32, 28],
      [-44, 32, 14],
      [-44, 22, 7.6],
      [-44, -60, 7.6],
    ],
    bend: 8,
  },
  "o2.wire": {
    pts: [
      [-24.4, 32, 62],
      [-18, 32, 62],
      [-18, 27, 100],
      [-10, 24, 118],
      [-10, 14, 126],
    ],
    bend: 5,
  },
  "intake.tube": {
    pts: [
      [30, -44, 112],
      [22, -47, 110],
      [15, -51, 97],
      [14, -51, 82],
      [8, -51, 80],
    ],
    bend: 7,
  },
  "coil.harness": {
    pts: [
      [-88, -23.5, 131],
      [-6, -23.5, 131],
      [14, -18, 127],
      [36, -9, 124],
      [36, -9, 122.4],
    ],
    bend: 5,
  },
  "ac.low": {
    pts: [
      [-96, -84, 136],
      [-96, -74, 136],
      [-104, -60, 130],
      [-106, -24, 126],
      [-106, 4, 118],
      [-100, 15, 104],
      [-99, 15, 74],
      [-92, 24, 68],
      [-90, 30, 67.5],
      [-90, 30, 62.6],
    ],
    bend: 8,
  },
  "cable.pos": {
    pts: [
      [POS_X, POS_Y - 2.8, 116.4],
      [POS_X, 10, 116.4],
      [118, 5, 116.4],
      [118, 2, 116.4],
    ],
    bend: 4,
  },
  "cable.ground": {
    pts: [
      [NEG_X + 2.8, NEG_Y, 116.4],
      [129, NEG_Y, 116.6],
      [131, 30, 118],
      [132, 30, 118],
    ],
    bend: 3,
  },
  "cable.alt": {
    pts: [
      [-96, 41, 100],
      [-96, 50, 96],
      [-92, 52, 62],
      [-60, 52, 50],
      [60, 50, 50],
      [100, 20, 84],
      [110, 14, 90],
      [110, 8, 90],
    ],
    bend: 8,
  },
  "harness.ecm": {
    pts: [
      [56, -9, 104],
      [80, -12, 100],
      [96, -18, 98],
      [104, -18, 98],
    ],
    bend: 6,
  },
  "dipstick.tube": {
    pts: [
      [-30, 14, 72],
      [-30, 21, 72],
      [-30, 24, 96],
      [-30, 24, 116],
    ],
    bend: 6,
  },
};

// ---------------------------------------------------------------- skipped items
// Items rebuilt by hand in the sibling files (cooling.js, electrical.js, belt.js) or dropped because they only made
// sense on the tabletop display.
const REBUILT = new Set([
  "exhaust.hanger",
  "radiator.fins",
  "radiator.core",
  "condenser",
  "fan.d.shroud",
  "fan.p.shroud",
  "fan.d.motor",
  "fan.p.motor",
  "battery.pos",
  "battery.neg",
  "pulley.crank",
  "pulley.ac",
  "pulley.ac.clutch",
  "pulley.alt",
  "pulley.wp",
  "pulley.tens",
]);
// Also skipped: the display stand, the 2D belt, the cut-down passenger strut tower (rebuilt by mirroring the driver
// one) and the crossmember (the chassis area's subframe sits there instead).
const skipItem = (name) =>
  name === "crossmember" ||
  name.startsWith("stand") ||
  name.startsWith("belt:") ||
  name.startsWith("strut.passenger") ||
  REBUILT.has(name);

const clone = (o) => JSON.parse(JSON.stringify(o));
const prisms = (shapes) => shapes.filter((o) => o.kind === "prism");

// Copies the dump's items with the 3D-viewing fixes applied (the dump itself is left untouched).
function prepareItems() {
  const items = [];
  for (const it of dump.items) {
    if (skipItem(it.name) || it.name.startsWith("strut.driver")) continue;
    const shapes = it.shapes.map((s) => {
      const o = clone(s);
      if (o.kind === "body") o.F = rightFrame(o.F);
      return o;
    });
    const isApron = it.name === "apron.passenger" || it.name === "apron.driver";
    // inner fenders: the passenger one was cut down for the tabletop view; make both full height, but low enough to
    // stay under the closed hood (hood front edge ≈ 0.76 m, kit z 116)
    if (isApron) for (const o of prisms(shapes)) o.s1 = 114;
    // the exterior's windshield base sits low (cab-forward): keep the cowl box and firewall top under the glass
    if (it.name === "cowl")
      for (const o of prisms(shapes)) {
        o.s0 = 144;
        o.s1 = 151;
      }
    if (it.name === "firewall") for (const o of prisms(shapes)) o.s1 = 144;
    // ... and keep the inner fenders short enough to stay behind the exterior's headlight housings (lamp backs
    // reach y ≈ 1.95 at x ≈ 0.68): clip the outline at kit y 68 and drop the duplicate points that leaves
    if (isApron)
      for (const o of prisms(shapes)) {
        const pts = o.poly.map(([x, y]) => [x, Math.min(y, 68)]);
        o.poly = pts.filter(
          (p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 1e-6,
        );
      }
    if (MIRROR_ITEMS.has(it.name))
      for (const o of shapes) {
        if (o.kind === "prism") o.poly = o.poly.map(([x, y]) => [x, mirrorY(y)]);
        if (o.kind === "body") {
          o.F.o[1] = mirrorY(o.F.o[1]);
          for (const k of ["a", "u", "v"]) o.F[k][1] = -o.F[k][1];
          o.F = rightFrame(o.F);
        }
      }
    if (it.name === "alt.body") shapes[0].F.o[2] = PULLEYS.alt.z; // alternator = top pulley of the belt
    if (it.name === "dipstick.handle") shapes[0].F.o[0] = -30; // on top of the re-routed dipstick tube
    // oil filter: on the front of the oil pan, vertical
    if (it.name === "oilfilter")
      shapes[0].F = rightFrame({ o: [-14, 20, 40], a: [0, 0, -1], u: [1, 0, 0], v: [0, 1, 0] });
    // ECM: in the engine room, driver side by the air box
    if (it.name === "ecm") {
      shapes[0].poly = [
        [32, -12],
        [56, -12],
        [56, -6],
        [32, -6],
      ];
      shapes[0].s0 = 96;
      shapes[0].s1 = 122;
    }
    items.push({ ...it, shapes });
  }
  // strut towers: centred over the chassis struts (car x = ±0.64, kit x = ±128) and wide enough to enclose the
  // spring; the passenger one mirrors the driver one (the 2D model had a cut-down stub there)
  for (const it of dump.items.filter((x) => x.name.startsWith("strut.driver"))) {
    for (const side of [1, -1]) {
      const shapes = it.shapes.map((s) => {
        const o = clone(s);
        o.F.o[0] = side * (o.F.o[0] + 8);
        // towers start above the tire (z ≈ 0.65 m) so they don't show as a pole in front of the rotor
        if (it.name.endsWith(".tower")) o.poly = o.poly.map(([a, r]) => [Math.max(a, 94), r > 0 ? 15 : 0]);
        o.F = rightFrame(o.F);
        return o;
      });
      items.push({
        name: side > 0 ? it.name : it.name.replace("strut.driver", "strut.passenger"),
        part: it.part,
        shapes,
      });
    }
  }
  return items;
}

// The dump's routes with the custom re-routes and front/back mirroring applied (the 2D belt is dropped).
function prepareRoutes() {
  return dump.routes
    .filter((r) => r.name !== "belt")
    .map((r) => {
      const custom = CUSTOM_ROUTES[r.name];
      if (custom) return { ...r, points: fillet(custom.pts, custom.bend) };
      if (MIRROR_ROUTES.has(r.name)) return { ...r, points: r.points.map(([x, y, z]) => [x, mirrorY(y), z]) };
      return r;
    });
}

// Builds the base bay model. Returns the root group `kit` (scaled into car metres by KIT_TRANSFORM), its meshes
// (tagged userData.part = "bay:<part>") and the prepared routes (flows.js draws over some of them).
export function buildBaseModel({ mat, C }) {
  const routes = prepareRoutes();
  const kit = fromDump(
    { items: prepareItems(), routes },
    { transform: KIT_TRANSFORM, materialFor: kitMaterialFor(mat, C) },
  );
  kit.name = "bay";
  const meshes = [...kit.children];
  // keep the strut-tower tops (caps, nuts) and the hood latch clear of the closed hood skin: down 4 kit units (20 mm)
  for (const m of meshes) {
    if (/^strut\.(driver|passenger)\.(tower|cap|nut\d)$/.test(m.name)) m.position.z -= 4;
    if (m.name === "hood.latch" || m.name === "hood.latch.lever") m.position.z -= 4;
  }
  for (const m of meshes) {
    fixWinding(m.geometry);
    m.userData.part = "bay:" + m.userData.localPart;
    const small = m.geometry.boundingSphere.radius < 6; // tiny pieces don't need to cast shadows
    m.castShadow = !small;
  }
  return { kit, meshes, routes };
}
