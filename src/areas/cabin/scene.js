// "Cabin" area: the driver's seat of the 9th-gen Civic, seen through the open driver's door. This file is the area
// definition (docs/ARCHITECTURE.md): it owns the area's state, animations, camera views, controls and lamps; the
// meshes come from sibling builders:
//   dashboard.js (floor, dash body, center stack) · cluster.js (gauges, screens, warning lights, bulb-check logic)
//   controls.js (wheel, stalks, pedals, releases, shifter, parking brake) · service.js (glove box, cabin filter,
//   fuse box) · seats.js (seats, belts, airbags, mirror). kit.js holds the shared helpers, icons.js the light symbols.
// Frame (docs/ARCHITECTURE.md): metres, +x = driver side, +y = front, z up. Driver centre line x = +0.37.
import { createKit } from "./kit.js";
import { buildFloor, buildDashboard, buildCenterStack } from "./dashboard.js";
import { buildInstruments, KEY_TO_START } from "./cluster.js";
import { buildSteering, buildPedalsAndReleases, buildConsole } from "./controls.js";
import { buildGloveBox, buildFuseBox } from "./service.js";
import { buildSeats } from "./seats.js";

export default {
  id: "cabin",
  label: "Cabin",
  parent: "car",
  build(ctx) {
    const { THREE, claim } = ctx;
    const kit = createKit(ctx);
    const { root, P, texs } = kit;

    // shared state read by the screens and warning lights; key: "off" | "on" (bulb check) | "run" (engine running)
    const state = {
      key: "off",
      tKey: 0, // seconds since the key was turned on
      rpm: 0, // tach needle, 0..1 of the dial
      glove: 0,
      filter: 0,
      fuse: 0,
      pbrake: true,
      belt: false,
      door: false,
    };

    // ============================================================ build (this order sets the meshes' draw order)
    buildFloor(kit);
    buildDashboard(kit);
    const instruments = buildInstruments(kit, state);
    buildSteering(kit);
    const { drawAudio } = buildCenterStack(kit, state);
    const { glove, filter, filterCover } = buildGloveBox(kit);
    const { fuseCover, fuseCoverHome } = buildFuseBox(kit);
    buildPedalsAndReleases(kit);
    const { pbrake, drawGate } = buildConsole(kit);
    buildSeats(kit);

    function redrawAll() {
      instruments.redraw();
      drawAudio();
      drawGate("P");
    }
    redrawAll();

    // ============================================================ animation state helpers
    const setGlove = (t) => {
      // 0 closed, 0.5 open, 1 = dropped all the way (stops released): first 0.95 rad, then a further 0.7 rad
      state.glove = t;
      glove.rotation.x = -Math.min(1, t * 2) * 0.95 - Math.max(0, t * 2 - 1) * 0.7;
    };
    const setFilter = (t) => {
      // first half: the cover comes off; second half: the filter slides out toward the cabin
      state.filter = t;
      filterCover.position.set(0, -0.06 * Math.min(1, t * 2), -0.05 * Math.min(1, t * 2));
      filterCover.visible = t < 0.98;
      filter.position.y = 0.96 - Math.max(0, t * 2 - 1) * 0.26;
    };
    const setFuse = (t) => {
      state.fuse = t;
      fuseCover.position.copy(fuseCoverHome).add(new THREE.Vector3(0, -0.12 * t, -0.05 * t));
      fuseCover.visible = t < 0.97; // cover off and set aside
    };
    let pbT = 1; // parking brake lever position, 0 = down .. 1 = pulled up
    let mirrored = null;

    const WHEEL_KEYS = [P("wheel"), P("airbags")];
    const clusterCenter = new THREE.Vector3(0.37, 0.664, 0.905);
    let wheelGhost = false;
    let leaving = false; // true while the door closes on exit: controls do nothing, the wheel is not re-ghosted
    const gen = { glove: 0, fuse: 0 }; // animation generations: a newer click cancels an older tween

    // stand in the open driver's doorway, just ahead of the B-pillar (y ≈ -0.04): from further back the closed
    // rear door filled a quarter of the view
    const V_MAIN = { pos: [1.4, 0.1, 1.24], target: [0.16, 0.6, 0.84] };
    // a little wider and higher than the cluster itself (the left block of red lights must stay in frame)
    const V_LIGHTS = { pos: [0.37, 0.05, 1.015], target: [0.37, 0.664, 0.93] };
    // the Maintenance Minder wrench is an i-MID message near the middle of the dash: centre on it
    // (cluster still in view)
    const V_WRENCH = { pos: [0.22, 0.12, 1.07], target: [0.08, 0.653, 0.99] };
    const V_FUSE = { pos: [0.45, 0.25, 0.7], target: [0.59, 0.76, 0.55] };
    const V_GLOVE = { pos: [0.28, -0.12, 1.02], target: [-0.33, 0.8, 0.62] };
    const V_HOUSING = { pos: [-0.35, 0.3, 0.85], target: [-0.33, 0.92, 0.62] };
    // the wiper stalk sits on the inboard side of the column, behind the wheel rim: look from the centre console
    // (the wheel is ghosted while the camera is near the stalk, see update)
    const V_STALK = { pos: [0.02, 0.16, 1.02], target: [0.26, 0.5, 0.835] };
    const stalkCenter = new THREE.Vector3(0.26, 0.5, 0.835);

    // ============================================================ controls
    const keyCtl = {
      type: "toggle",
      label: "Key on (bulb check)",
      labelOn: "Key off",
      on: false,
      onChange(on) {
        state.key = on ? "on" : "off";
        state.tKey = 0;
        state.t0 = performance.now();
        redrawAll();
        instruments.refreshLights(0);
      },
    };
    const gloveCtl = {
      type: "toggle",
      label: "Open glove box",
      labelOn: "Close glove box",
      on: false,
      onChange(on) {
        if (leaving) {
          gloveCtl.on = false;
          return;
        }
        // each click bumps gen.glove so an older open/close tween stops writing (rapid clicks no longer fight)
        const g = ++gen.glove,
          g0 = state.glove,
          f0 = state.filter;
        const tw = (sec, fn) =>
          ctx.tween(sec, (t) => {
            if (g === gen.glove) fn(t);
          });
        // (returns the animation promise so reveal() can wait for the filter to be out)
        if (on) {
          const fly = ctx.flyTo(V_GLOVE, 1.0);
          return Promise.all([
            fly,
            tw(1.0, (t) => setGlove(g0 + (1 - g0) * ctx.ease(t))).then(() =>
              g === gen.glove ? tw(1.2, (t) => setFilter(f0 + (1 - f0) * ctx.ease(t))) : null,
            ),
          ]);
        } else {
          return tw(0.8, (t) => setFilter(f0 * (1 - ctx.ease(t)))).then(() => {
            if (g !== gen.glove) return null;
            const gs = state.glove;
            return tw(0.9, (t) => setGlove(gs * (1 - ctx.ease(t))));
          });
        }
      },
    };
    const openFuse = () => {
      if (leaving) return Promise.resolve();
      const g = ++gen.fuse,
        f0 = state.fuse;
      return Promise.all([
        ctx.flyTo(V_FUSE, 1.1),
        ctx.tween(1.0, (t) => {
          if (g === gen.fuse) setFuse(f0 + (1 - f0) * ctx.ease(t));
        }),
      ]);
    };
    const pbCtl = {
      type: "toggle",
      label: "Release parking brake",
      labelOn: "Set parking brake",
      on: false,
      onChange(on) {
        state.pbrake = !on;
      },
    };

    // give every tagged mesh its own part-keyed material so it glows/ghosts with its part
    // (screens and light icons use basic materials that the code recolours, so leave those alone)
    root.traverse((o) => {
      if (o.isMesh && o.userData.part && !o.material.isMeshBasicMaterial) claim(o, o.userData.part);
    });

    // soft interior light while the cabin is open (always present at 0 so the light count never changes)
    const cabinLamp = new THREE.PointLight(0xfff4e6, 0, 2.6, 1.6);
    cabinLamp.position.set(0.25, 0.25, 1.22);
    root.add(cabinLamp);
    const dashLamp = new THREE.PointLight(0xffffff, 0, 1.6, 1.8);
    dashLamp.position.set(0.3, 0.6, 1.0);
    root.add(dashLamp);
    const setLamps = (t) => {
      cabinLamp.intensity = 2.2 * t;
      dashLamp.intensity = 1.1 * t;
    };

    return {
      group: root,
      view: V_MAIN,
      hotspot: { pos: [0.88, 0.1, 0.95], label: "Cabin" },
      async enter(ctx, { instant }) {
        leaving = false;
        state.door = true;
        await ctx.tween(instant ? 0 : 0.9, (t) => {
          ctx.car?.setDoor?.("fl", t);
          setLamps(t);
        });
      },
      async exit(ctx, { instant }) {
        leaving = true;
        gen.glove++;
        gen.fuse++;
        if (wheelGhost) {
          ctx.ghost(WHEEL_KEYS, false);
          wheelGhost = false;
        }
        await ctx.tween(instant ? 0 : 0.8, (t) => {
          ctx.car?.setDoor?.("fl", 1 - t);
          setLamps(1 - t);
        });
        state.door = false;
        // put the glove box, cabin filter and fuse cover back (there is no control to refit the fuse cover)
        setFilter(0);
        setGlove(0);
        setFuse(0);
        gloveCtl.on = false;
      },
      update(dt, ctx) {
        // mirrored car root → flip canvas textures so writing stays readable
        const m = ctx.carRoot.matrixWorld.determinant() < 0;
        if (m !== mirrored) {
          mirrored = m;
          for (const t of texs) {
            t.wrapS = THREE.RepeatWrapping;
            t.repeat.x = m ? -1 : 1;
            t.offset.x = m ? 1 : 0;
            t.needsUpdate = true;
          }
        }
        // key / bulb check sequence
        if (state.key !== "off") {
          state.tKey = (performance.now() - state.t0) / 1000; // wall-clock, so slow frames don't stretch the demo
          if (state.key === "on" && state.tKey > KEY_TO_START) {
            state.key = "run";
            instruments.drawImid();
          }
        }
        instruments.update(dt, mirrored);
        // parking brake lever
        const pbTarget = state.pbrake ? 1 : 0;
        if (pbT !== pbTarget) {
          pbT += Math.sign(pbTarget - pbT) * Math.min(Math.abs(pbTarget - pbT), dt * 3);
        }
        pbrake.rotation.x = -0.32 * pbT;
        // ghost the steering wheel when the camera is close to the cluster so the lights can be seen and clicked
        if (ctx.current === "cabin" && !leaving) {
          const local = ctx.carRoot.worldToLocal(ctx.camera.position.clone());
          const near =
            (local.distanceTo(clusterCenter) < 0.75 && local.y < 0.62) ||
            (local.distanceTo(stalkCenter) < 0.6 && local.x < 0.3 && local.y < 0.45);
          if (near !== wheelGhost) {
            wheelGhost = near;
            ctx.ghost(WHEEL_KEYS, near, 0.12);
          }
        }
      },
      // tapping a hidden part (list, symptom, card link): open / move things so it can be seen before the camera
      // frames it
      reveal(key) {
        if (leaving) return;
        const id = key.slice("cabin:".length);
        if (id === "cabin-filter" || id === "filter-housing") {
          const open =
            !gloveCtl.on || state.filter < 0.99
              ? ((gloveCtl.on = true), gloveCtl.onChange(true))
              : ctx.flyTo(V_GLOVE, 0.8);
          gloveCtl.refresh?.();
          if (id === "cabin-filter") return open;
          // the housing sits deep behind the glove box: look up into the cavity from the passenger footwell
          Promise.resolve(open).then(() => {
            if (!leaving) ctx.flyTo(V_HOUSING, 0.8);
          });
          return "handled";
        }
        if (id === "fuse-box") return openFuse();
        // warning lights: the whole cluster view (wheel ghosted there) with the tapped light glowing; zooming in from
        // further back left the steering wheel solid in front of the bottom row
        if (id.startsWith("light-")) {
          ctx.flyTo(id === "light-wrench" ? V_WRENCH : V_LIGHTS, 0.9);
          return "handled";
        }
        if (id === "stalk-wipers") return ctx.flyTo(V_STALK, 0.9);
      },
      controls: [
        keyCtl,
        pbCtl,
        gloveCtl,
        {
          type: "button",
          label: "Fuse box",
          onClick() {
            openFuse();
          },
        },
        {
          type: "button",
          label: "Dashboard lights",
          onClick() {
            ctx.flyTo(V_LIGHTS, 1.1);
          },
        },
      ],
      status() {
        if (state.key === "on") return "Key ON: every warning light lights up for a bulb check";
        if (state.key === "run") {
          // the blue cold-engine light is normal until the engine warms up, so it doesn't count as
          // "telling you something"
          const still = Object.values(instruments.lights)
            .filter((l) => l.on && l.run !== "cold")
            .map((l) => l.id);
          return still.length
            ? "Engine running: a light that stays on is telling you something (tap it)"
            : "Engine running: no warning lights on (the blue cold-engine light is normal until it warms up)";
        }
        return "Cabin: tap a warning light, a control or a gauge";
      },
    };
  },
};
