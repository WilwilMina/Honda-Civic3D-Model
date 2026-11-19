// "Under the hood" area: the engine bay of the 2013 Civic LX (R18Z1 1.8 L, automatic). This file is the area
// definition (docs/ARCHITECTURE.md): it builds the bay and wires its controls, camera poses (views.js) and
// animation together. The base model comes from shapes.json via base-model.js (which also explains kit units
// and their transform into car metres); the sibling files add hand-built detail: see-through fluid tanks, the
// radiator and fans, battery terminals, the pulleys and ribbed belt, and the animated flows (air, coolant,
// electricity, refrigerant). geometry.js holds their shared geometry and texture helpers.
import * as THREE from "three";
import { partMaterials, fadeTo } from "../../core/materials.js";
import { tempReveal } from "../shared/reveal.js";
import { alignedBox } from "./geometry.js";
import { buildBaseModel, ENGINE_PARTS } from "./base-model.js";
import { buildFluids } from "./fluids.js";
import { buildCooling } from "./cooling.js";
import { buildElectrical } from "./electrical.js";
import { buildBelt } from "./belt.js";
import { buildFlows } from "./flows.js";
import { REVEAL_POSES, revealHelpers } from "./views.js";

// Inner fenders and strut towers that fade when the camera looks in from outside their side, so you can see the
// belt end / battery side. [mesh name, side (+1 driver, -1 passenger), only in this area]. The aprons also fade in
// the Brakes & suspension area ("chassis"), where they otherwise hide the strut, spring, tie rod and CV axle that
// sit just inboard of the wheel; the strut towers fade only there.
const FADERS = [
  ["apron.passenger", -1],
  ["apron.driver", 1],
  ["strut.passenger.tower", -1, "chassis"],
  ["strut.driver.tower", 1, "chassis"],
];
const FADE_IN = ["bay", "engine", "chassis"];

export default {
  id: "bay",
  label: "Under the hood",
  parent: "car",
  build(ctx) {
    const { mat, C } = ctx;
    const P = (part) => "bay:" + part;

    // ---------------------------------------------------------------- base model from shapes.json
    const { kit, meshes, routes } = buildBaseModel(ctx);
    const byName = (n) => meshes.filter((m) => m.name === n);

    // the fading meshes get their own material copy (still registered for part highlighting)
    const fadeables = [];
    for (const [name, side, only] of FADERS)
      for (const m of byName(name)) {
        const c = m.material.clone();
        c.userData = { ...m.material.userData };
        partMaterials.get(m.userData.part)?.add(c);
        m.material = c;
        fadeables.push({ m, side, k: 1, areas: only ? [only] : FADE_IN });
      }
    const camLocal = new THREE.Vector3();

    // engine sub-group: everything bolted to the engine, so it shakes together when running
    const engine = new THREE.Group();
    engine.name = "bay-engine";
    kit.add(engine);
    for (const m of meshes) if (ENGINE_PARTS.has(m.userData.localPart)) engine.add(m);

    // Adds a hand-built mesh tagged with its part key (parent defaults to the bay root, in kit units).
    const add = (geom, material, part, parent = kit, { shadow = false, name = "" } = {}) => {
      const m = new THREE.Mesh(geom, material);
      m.userData.part = P(part);
      m.castShadow = shadow;
      m.receiveShadow = true;
      m.name = name;
      parent.add(m);
      return m;
    };

    // ---------------------------------------------------------------- hand-built detail (sibling files)
    // shared build context handed to each sibling file
    const b = { mat, C, P, add, kit, engine, byName };
    buildFluids(b);
    const cooling = buildCooling(b);
    buildElectrical(b);
    // oil filter mounting boss on the engine block
    add(
      alignedBox([-14, 14, 41], [5, 3, 2]),
      mat(0x9a9ea3, "metal", P("engine-block")),
      "engine-block",
      engine,
    );
    const belt = buildBelt(b);
    const flows = buildFlows(routes, b);

    // ---------------------------------------------------------------- state and controls
    let running = false,
      ac = false,
      shakeT = 0,
      leaving = false; // true while the hood is closing on the way out
    let runLevel = 0; // eased 0..1 spin-up
    const acCtl = {
      type: "toggle",
      label: "A/C on",
      labelOn: "A/C on",
      on: false,
      onChange(on) {
        // the A/C needs the engine running
        if (on && !running) {
          acCtl.on = false;
          return;
        }
        ac = on;
      },
    };
    const runCtl = {
      type: "toggle",
      label: "Start the engine",
      labelOn: "Turn the engine off",
      on: false,
      onChange(on) {
        // clicked while the hood is closing: don't leave it running
        if (on && leaving) {
          runCtl.on = false;
          return;
        }
        running = on;
        if (!on) {
          ac = false;
          acCtl.on = false;
          acCtl.refresh?.();
        }
      },
    };
    const setRunning = (on) => {
      runCtl.on = on;
      runCtl.onChange(on);
      runCtl.refresh?.();
    };

    const hood = (t) => ctx.car?.setHood?.(t);
    const REVEAL_TEMP = revealHelpers(ctx);
    const rv = tempReveal(ctx, "bay");
    return {
      group: kit,
      view: { pos: [-1.25, 3.25, 2.05], target: [-0.02, 1.52, 0.62] },
      hotspot: { pos: [0, 1.72, 1.04], label: "Open the hood" },
      async enter(c, { instant } = {}) {
        leaving = false;
        if (instant) hood(1);
        else await ctx.tween(1.0, (t) => hood(t));
      },
      async exit(c, { instant } = {}) {
        leaving = true;
        rv.clear();
        if (running) setRunning(false);
        if (instant) hood(0);
        else await ctx.tween(0.8, (t) => hood(1 - t));
      },
      // tapping a part tucked low or behind others (list / symptom / card link): fly to a pose that sees it
      reveal(key) {
        const id = key.slice(4), // strip "bay:"
          v = REVEAL_POSES[id];
        if (leaving || !v) return;
        if (REVEAL_TEMP[id]) rv.set(key, REVEAL_TEMP[id]());
        else rv.clear();
        ctx.flyTo({ pos: v[0], target: v[1] }, 1.0);
        return "handled";
      },
      controls: [runCtl, acCtl],
      status() {
        if (!running) return "engine off · a healthy battery rests near 12.6 V";
        return ac ? "idling · A/C on · charging about 13.7–14.7 V" : "idling · charging about 13.7–14.7 V";
      },
      update(dt) {
        rv.update(dt);
        // fade the inner fender on the side the camera is looking in from (outside the body, x beyond ±0.72 m,
        // and lower than 1.75 m)
        const cur = ctx.current;
        ctx.carRoot.updateWorldMatrix(true, false); // only the root matrix is needed (not the whole car tree every frame)
        camLocal.copy(ctx.camera.position);
        ctx.carRoot.worldToLocal(camLocal);
        for (const f of fadeables) {
          const outside = f.side < 0 ? camLocal.x < -0.72 : camLocal.x > 0.72;
          const want = f.areas.includes(cur) && outside && camLocal.z < 1.75 ? 0.14 : 1;
          if (Math.abs(want - f.k) < 0.002) continue;
          f.k += (want - f.k) * Math.min(1, dt * 6);
          if (Math.abs(want - f.k) < 0.01) f.k = want;
          // through the shared look layers, so focus mode and ghost() can overlap this fade safely
          fadeTo(f.m.material, f.k);
        }
        // ease the engine speed up when started, down a little slower when stopped
        runLevel += ((running ? 1 : 0) - runLevel) * Math.min(1, dt * (running ? 2.2 : 1.4));
        if (runLevel < 0.001 && !running) runLevel = 0;
        belt.update(dt, runLevel, ac && running);
        cooling.update(dt, runLevel, ac);
        // engine shake: three unrelated frequencies so it never looks like a simple loop (kit units)
        shakeT += dt;
        const a = 0.16 * runLevel;
        engine.position.set(
          Math.sin(shakeT * 61) * a * 0.6,
          Math.sin(shakeT * 47 + 1) * a * 0.4,
          Math.sin(shakeT * 53 + 2) * a,
        );
        flows.update(dt, running, ac);
      },
    };
  },
};
