// "Brakes & suspension" area: all four corners of the 2013 Civic LX (front discs, rear drums, MacPherson
// struts, multi-link rear, steering rack). Opening it takes the driver-side wheels off and slides the rear
// drum off; the buttons fly to a corner, turn the steering, press the brakes or bounce the car. This file is
// the area definition (docs/ARCHITECTURE.md): it wires the pieces together:
//   kit.js          - constants, materials, the shapes.json loader (and its kit-unit transform)
//   geometry.js     - pure geometry helpers (lathes, slabs, tubes, springs)
//   front-corner.js - front corners + steering rack, subframe, front sway bar
//   rear-corner.js  - rear drum-brake corners + rear sway bar
//   brake-lines.js  - hard brake lines and parking-brake cables (car metres)
//   wheels.js       - the "tire"/"wheel" parts (the exterior's wheels, or a stand-in stack)
//   animations.js   - steering, braking, bounce and the drum slide-off
//   views.js        - area view, zoom views and reveal() camera poses
import { createKit, A } from "./kit.js";
import { buildFrontCorner, buildFrontCentre } from "./front-corner.js";
import { buildRearCorner, buildRearSwayBar } from "./rear-corner.js";
import { buildBrakeLines } from "./brake-lines.js";
import { buildWheels } from "./wheels.js";
import { createAnimator } from "./animations.js";
import { AREA_VIEW, HOTSPOT, ZOOM, REVEAL_POSES, REVEAL_GHOSTS } from "./views.js";
import { tempReveal } from "../shared/reveal.js";

export default {
  id: "chassis",
  label: "Brakes & suspension",
  parent: "car",
  build(ctx) {
    // ---------------------------------------------------------------- model (front, rear, lines, wheels)
    const kit = createKit(ctx);
    const FL = buildFrontCorner(kit, 1),
      FR = buildFrontCorner(kit, -1);
    buildFrontCentre(kit);
    const RL = buildRearCorner(kit, 1),
      RR = buildRearCorner(kit, -1);
    buildRearSwayBar(kit);
    buildBrakeLines(kit, FL, FR);
    const { stack, usedCarWheels } = buildWheels(kit);

    const anim = createAnimator(kit, { FL, FR, RL, RR });
    const { st, apply, setDrum } = anim;

    // ---------------------------------------------------------------- controls
    const steerCtl = {
      type: "toggle",
      label: "Turn the steering",
      labelOn: "Steering: turning",
      on: false,
      onChange(on) {
        if (!st.live) {
          steerCtl.on = false;
          return;
        }
        st.steerOn = on;
      },
    };
    const brakeCtl = {
      type: "toggle",
      label: "Press the brakes",
      labelOn: "Brakes: pressed",
      on: false,
      onChange(on) {
        if (!st.live) {
          brakeCtl.on = false;
          return;
        }
        st.brakeOn = on;
      },
    };
    const controls = [
      {
        type: "button",
        label: "Zoom to a front wheel",
        onClick: () => st.live && ctx.flyTo(ZOOM.front),
      },
      {
        type: "button",
        label: "Zoom to a rear wheel",
        onClick: () => st.live && ctx.flyTo(ZOOM.rear),
      },
      steerCtl,
      brakeCtl,
      {
        type: "button",
        label: "Bounce the car",
        onClick: () => {
          if (st.live) st.bounceT = 0;
        },
      },
    ];

    // ---------------------------------------------------------------- reveal helpers the strut mount sits on
    // top of the tower under the hood, so the hood is opened while it is selected
    let hoodUp = false;
    const hood = (up, sec = 0.7) => {
      if (hoodUp === up) return Promise.resolve();
      hoodUp = up;
      return ctx.tween(sec, (t) => ctx.car?.setHood?.(up ? t : 1 - t));
    };
    const RV_GHOST = { ...REVEAL_GHOSTS, "strut-mount": { undo: () => hood(false) } };
    const rv = tempReveal(ctx, "chassis");

    return {
      group: kit.group,
      view: AREA_VIEW,
      hotspot: HOTSPOT,
      controls,
      async enter(_ctx, { instant } = {}) {
        st.open = true;
        const k = instant ? 0 : 1;
        await ctx.tween(0.9 * k, (t) => {
          ctx.car?.setWheelOff?.("fl", t);
          ctx.car?.setWheelOff?.("rl", t);
        });
        if (!usedCarWheels) stack.visible = true;
        await ctx.tween(1.3 * k, (t) => setDrum(t));
        // controls work only once the corner is open (clicks while leaving must not leave the steering/brakes
        // on in the car view)
        st.live = true;
      },
      // tapping a part from a list / symptom / card link: fly to a pose that sees it past the removed wheel
      reveal(key) {
        const id = key.slice(A.length),
          v = REVEAL_POSES[id];
        if (!st.open || !v) return;
        if (RV_GHOST[id]) rv.set(key, RV_GHOST[id]);
        else rv.clear();
        if (id === "strut-mount") hood(true);
        ctx.flyTo({ pos: v[0], target: v[1] }, 1.0);
        return "handled";
      },
      async exit(_ctx, { instant } = {}) {
        if (hoodUp) await hood(false, instant ? 0 : 0.6);
        rv.clear();
        st.open = false;
        st.live = false;
        st.steerOn = steerCtl.on = false;
        st.brakeOn = brakeCtl.on = false;
        st.bounceT = -1;
        st.d = 0; // leaving mid-bounce must not freeze the car (wheels + suspension) part-way down
        const k = instant ? 0 : 1;
        await ctx.tween(0.9 * k, (t) => setDrum(1 - t));
        setDrum(0);
        stack.visible = false;
        await ctx.tween(0.8 * k, (t) => {
          ctx.car?.setWheelOff?.("fl", 1 - t);
          ctx.car?.setWheelOff?.("rl", 1 - t);
        });
        // the steering/brakes ease back per frame; make sure the front wheels end up exactly straight
        // even on a slow PC
        st.steer = 0;
        st.steerT = 0;
        st.brake = 0;
        apply();
      },
      update(dt) {
        rv.update(dt);
        anim.step(dt);
      },
      status() {
        if (st.bounceT >= 0) return "Bounce: springs squeeze, struts and shocks calm it down";
        if (st.brake > 0.5)
          return "Brakes on: fluid pushes the pads onto the rotors and the shoes into the drums";
        if (st.steerOn) return "Steering: the rack slides, the tie rods turn the knuckles";
        return st.drum > 0.9
          ? "Driver-side wheels off · rear drum pulled off"
          : "Brakes, suspension and steering";
      },
    };
  },
};
