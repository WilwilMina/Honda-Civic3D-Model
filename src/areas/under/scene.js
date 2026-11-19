// "Underneath" area: the car goes up on a two-post lift and you look at the bottom of the car. This file is the
// area definition (docs/ARCHITECTURE.md): it owns the lift animation, camera views, controls and reveal hooks; the
// meshes come from sibling builders:
//   underbody.js (floor pan, jacking points, drain plugs, under covers) · exhaust.js (front pipe back to the
//   tailpipe, hangers, heat shields) · fuel.js (tank, straps, filler neck, fuel/brake lines) · lift.js (the lift).
// kit.js holds the layout constants and shared helpers. The catalytic converter and oil pan belong to the bay area.
import { tempReveal } from "../shared/reveal.js";
import { createKit, LIFT_H } from "./kit.js";
import { buildFloorPan, buildJackPoints, buildDrainPlugs, buildUnderCovers } from "./underbody.js";
import { buildExhaust } from "./exhaust.js";
import { buildFuelTank, buildFuelLines } from "./fuel.js";
import { buildLift } from "./lift.js";

export default {
  id: "under",
  label: "Underneath",
  parent: "car",
  build(ctx) {
    const { THREE } = ctx;
    const group = new THREE.Group();
    group.name = "under";
    const kit = createKit(ctx, group);
    const { K } = kit;

    // ================================================================== build (this order sets the meshes' draw order)
    buildFloorPan(kit);
    buildJackPoints(kit);
    buildExhaust(kit);
    buildFuelTank(kit);
    buildFuelLines(kit);
    buildDrainPlugs(kit);
    buildUnderCovers(kit);
    const { lift, sync } = buildLift(ctx, kit);
    let armSwing = 0; // 0 = parked along the car, 1 = under the jack points
    const syncLift = () => sync(armSwing);

    // ================================================================== views, enter/exit
    let phase = 0; // 0 = on the ground, 1 = up
    // Camera poses: STAGE watches the car go up from the side; FINAL looks up at the underside from low behind the
    // passenger-side rear corner. view is read in the car frame, which rises with the lift, so the car's current
    // height is subtracted to keep the camera at a fixed height above the garage floor.
    const FINAL = { pos: [-1.05, -2.2, 0.34 - LIFT_H], target: [0.0, 0.1, 0.22] };
    const STAGE = { pos: [3.6, -3.9, 1.3], target: [0, 0, 0.7] };
    const view = {
      get pos() {
        const v = phase ? FINAL.pos : STAGE.pos;
        return [v[0], v[1], v[2] + (phase ? LIFT_H : 0) - ctx.carRoot.position.z];
      },
      get target() {
        const v = phase ? FINAL.target : STAGE.target;
        return [v[0], v[1], v[2] + (phase ? LIFT_H : 0) - ctx.carRoot.position.z];
      },
    };
    // camera move in world coordinates, bypassing flyTo (used while the car is lowered on exit). Known
    // limitation: unlike ctx.camTo it has no cancellation guard and always re-enables the controls at the end;
    // that is safe here because exit runs inside go() with the app busy, so no other flight can start.
    const camTo = (posW, tgtW, sec) => {
      const p0 = ctx.camera.position.clone(),
        t0 = ctx.controls.target.clone();
      const p1 = new THREE.Vector3(...posW),
        t1 = new THREE.Vector3(...tgtW);
      ctx.controls.enabled = false;
      return ctx
        .tween(sec, (t) => {
          const e = ctx.ease(t);
          ctx.camera.position.lerpVectors(p0, p1, e);
          ctx.controls.target.lerpVectors(t0, t1, e);
          ctx.camera.lookAt(ctx.controls.target);
        })
        .then(() => {
          ctx.controls.enabled = true;
        });
    };
    let lifted = 0; // 0 = car on the ground, 1 = fully raised (passed to ctx.setLift)
    const raise = (to, sec) => {
      const from = lifted;
      return ctx.tween(sec, (t) => {
        lifted = from + (to - from) * ctx.ease(t);
        ctx.setLift(lifted);
        syncLift();
      });
    };
    const swing = (to, sec) => {
      const from = armSwing;
      return ctx.tween(sec, (t) => {
        armSwing = from + (to - from) * ctx.ease(t);
        syncLift();
      });
    };

    // leaving: set while the car is lowered on exit, so a toggle clicked then cannot stay on
    // (it would leave a ghosted tank or hidden covers in the car view)
    let leaving = false;
    const ctlCovers = {
      type: "toggle",
      label: "Remove under covers",
      labelOn: "Put covers back",
      on: false,
      onChange(on) {
        if (on && leaving) {
          ctlCovers.on = false;
          return;
        }
        group.traverse((o) => {
          if (o.userData.part === K("engine-cover") || o.userData.part === K("under-covers")) o.visible = !on;
        });
      },
    };
    let showShield = true;
    const ctlShield = {
      type: "toggle",
      label: "Hide heat shields",
      labelOn: "Show heat shields",
      on: false,
      onChange(on) {
        if (on && leaving) {
          ctlShield.on = false;
          return;
        }
        showShield = !on;
        group.traverse((o) => {
          if (o.userData.part === K("heat-shields")) o.visible = showShield;
        });
      },
    };
    const ctlTank = {
      type: "toggle",
      label: "See-through fuel tank",
      labelOn: "Solid fuel tank",
      on: false,
      onChange(on) {
        if (on && leaving) {
          ctlTank.on = false;
          return;
        }
        ctx.ghost([K("fuel-tank"), K("tank-straps")], on, 0.22);
      },
    };

    // reveal(): camera poses (car frame, car up on the lift) that see parts the main view can't
    const RV = {
      "atf-drain-plug": [
        [0.6, 1.56, -0.01],
        [0.22, 1.56, 0.309],
      ], // from below, just outboard of the subframe
      "filler-neck": [
        [1.35, -0.58, 0.04],
        [0.618, -1.311, 0.636],
      ], // up into the rear wheel well from beside the car
    };
    // the filler neck runs up behind the rear wheel-well liners: hide those and fade the wheels while it is selected
    const RV_TEMP = {
      "filler-neck": () => {
        const liners = [];
        ctx.carRoot.traverse((o) => {
          if ((o.name === "liner-rl" || o.name === "liner-rr") && o.visible) liners.push(o);
        });
        for (const o of liners) o.visible = false;
        return {
          ghosts: ["chassis:tire", "chassis:wheel"],
          undo: () => {
            for (const o of liners) o.visible = true;
          },
        };
      },
    };
    const rv = tempReveal(ctx, "under");

    return {
      group,
      view,
      hotspot: { pos: [0.92, -0.1, 0.24], label: "Underneath (lift the car)" },
      reveal(key) {
        const id = key.slice("under:".length),
          v = RV[id];
        if (!phase || leaving || !v) return;
        if (RV_TEMP[id]) rv.set(key, RV_TEMP[id]());
        else rv.clear();
        ctx.flyTo({ pos: v[0], target: v[1] }, 1.0);
        return "handled";
      },
      async enter(_ctx, { instant } = {}) {
        leaving = false;
        lift.visible = true;
        if (instant) {
          armSwing = 1;
          lifted = 1;
          ctx.setLift(1);
          syncLift();
          phase = 1;
          return;
        }
        phase = 0;
        armSwing = 0;
        syncLift();
        await swing(1, 0.6);
        await raise(1, 1.5);
        phase = 1;
        await ctx.flyTo(view, 1.1);
      },
      async exit(_ctx, { instant } = {}) {
        leaving = true;
        rv.clear();
        if (ctlTank.on) {
          ctlTank.on = false;
          ctlTank.onChange(false);
        }
        if (ctlCovers.on) {
          ctlCovers.on = false;
          ctlCovers.onChange(false);
        }
        if (ctlShield.on) {
          ctlShield.on = false;
          ctlShield.onChange(false);
        }
        if (instant) {
          lifted = 0;
          ctx.setLift(0);
          armSwing = 0;
          syncLift();
          lift.visible = false;
          phase = 0;
          return;
        }
        phase = 0;
        await Promise.all([raise(0, 1.3), camTo([3.6, -3.9, 1.6], [0, 0, 0.7], 1.0)]);
        await swing(0, 0.45);
        lift.visible = false;
      },
      update(dt) {
        rv.update(dt);
        if (lift.visible) syncLift();
      },
      controls: [ctlCovers, ctlShield, ctlTank],
      status() {
        return phase
          ? "Car is up on the lift · click any part"
          : leaving
            ? "Lowering the car…"
            : "Raising the car…";
      },
    };
  },
};
