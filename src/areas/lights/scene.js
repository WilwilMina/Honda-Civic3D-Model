// "Lights & wipers" area: the exterior lamps, wipers and washer nozzles. This file is the area definition
// (docs/ARCHITECTURE.md); the area builds no meshes of its own.
// It depends on the car body area (src/areas/car/, which must build first) through ctx.car:
//   ctx.car.parts       named lamp/wiper meshes (filled in by car/body.js, front.js and rear.js), tagged here as parts
//   ctx.car.lights      additive glow overlays per lamp function, so lamps light up without touching emissive
//   ctx.car.setLights() / sweepWipers()   switch the glows and run one wiper sweep
// Every call is guarded with ?. so the app still runs if the car body is missing.

// part key in content.js -> list name in ctx.car.parts
const PART_LISTS = {
  headlight: "headlight",
  low_beam: "lowBeam",
  high_beam: "highBeam",
  front_turn: "frontTurn",
  brake_tail: "brakeTail",
  rear_turn: "rearTurn",
  rear_marker: "rearMarker",
  inner_tail: "innerTail",
  reverse: "reverse",
  plate_light: "plateLight",
  third_brake: "thirdBrake",
  wiper_arm: "wiperArm",
  wiper_blade: "wiperBlade",
  washer_nozzle: "washer",
};
// parts at the back of the car: tapping one swings the camera round to the rear view
const REAR_PARTS = new Set([
  "brake_tail",
  "rear_turn",
  "rear_marker",
  "inner_tail",
  "reverse",
  "plate_light",
  "third_brake",
]);
// camera views from the driver-side front and rear corners
const FRONT = { pos: [2.55, 4.35, 1.45], target: [0.25, 1.75, 0.72] };
const REAR = { pos: [2.5, -4.6, 1.55], target: [0.2, -1.85, 0.82] };
const HAZARD_PERIOD = 0.7; // seconds per flash
const HAZARD_ON = 0.38; // seconds lit per flash

export default {
  id: "lights",
  label: "Lights & wipers",
  parent: "car",
  build(ctx) {
    const car = ctx.car;
    const carParts = car?.parts || {};
    for (const [key, list] of Object.entries(PART_LISTS))
      for (const o of carParts[list] || []) ctx.claim(o, "lights:" + key);

    const state = { head: true, brake: false, hazard: false, rear: false, active: false };
    let blinkClock = 0;
    // push the headlight / tail / brake switches to the car's glows (all off while the area is closed)
    const apply = () => {
      if (!car?.setLights) return;
      const on = state.active;
      car.setLights({
        head: on && state.head ? 1 : 0,
        tail: on && state.head ? 1 : 0, // tail lamps come on with the headlights
        brake: on && state.brake ? 1 : 0,
        reverse: 0,
      });
    };
    // the area's camera view follows the front/rear choice
    const view = {
      get pos() {
        return state.rear ? REAR.pos : FRONT.pos;
      },
      get target() {
        return state.rear ? REAR.target : FRONT.target;
      },
    };
    let rearBtn = null;
    const setRear = (rear) => {
      state.rear = rear;
      if (rearBtn) {
        rearBtn.label = rear ? "Show front" : "Show rear";
        rearBtn.refresh?.();
      }
    };
    const hazardCtl = {
      type: "toggle",
      label: "Hazard flashers",
      labelOn: "Hazards on",
      on: false,
      onChange(on) {
        state.hazard = on;
        if (!on) car?.setLights?.({ turn: 0 });
      },
    };

    return {
      view,
      hotspot: { pos: [0.66, 2.1, 0.8], label: "Lights & wipers" },
      async enter(_ctx, { instant }) {
        state.active = true;
        state.rear = false;
        if (rearBtn) rearBtn.label = "Show rear";
        apply();
        // one wiper sweep shortly after arriving, but not if the user already left
        if (!instant)
          setTimeout(() => {
            if (state.active) car?.sweepWipers?.();
          }, 900);
      },
      async exit() {
        state.active = false;
        state.hazard = false;
        hazardCtl.on = false; // the toggle must not show "Hazards on" next time while nothing flashes
        car?.setLights?.({ head: 0, tail: 0, brake: 0, reverse: 0, turn: 0 });
      },
      update(dt) {
        if (!car?.lights) return;
        if (state.active && state.hazard) {
          blinkClock += dt;
          const lit = blinkClock % HAZARD_PERIOD < HAZARD_ON ? 1 : 0;
          for (const o of car.lights.turn) o.material.opacity = lit * 0.85;
        }
      },
      controls: [
        {
          type: "toggle",
          label: "Headlights",
          labelOn: "Headlights on",
          on: true,
          onChange(on) {
            state.head = on;
            apply();
          },
        },
        {
          type: "toggle",
          label: "Brake lights",
          labelOn: "Brake lights on",
          on: false,
          onChange(on) {
            state.brake = on;
            apply();
          },
        },
        hazardCtl,
        {
          type: "button",
          label: "Sweep wipers",
          onClick() {
            car?.sweepWipers?.();
          },
        },
        (rearBtn = {
          type: "button",
          label: "Show rear",
          onClick() {
            setRear(!state.rear);
            ctx.flyTo(state.rear ? REAR : FRONT, 1.1);
          },
        }),
      ],
      // tapping a lamp from a list / symptom / card link: swing round to the end of the car it is on first
      reveal(key) {
        const rear = REAR_PARTS.has(key.slice("lights:".length));
        if (rear !== state.rear) setRear(rear);
        // the third brake light sits inside on the parcel shelf: look down at it through the rear glass from above the roof edge
        if (key === "lights:third_brake") {
          ctx.flyTo({ pos: [0.9, -1.2, 1.6], target: [0, -1.65, 1.06] }, 1.0);
          return "handled";
        }
        return ctx.flyTo(rear ? REAR : FRONT, 0.9);
      },
      status: () =>
        (state.head ? "Headlights on" : "Headlights off") +
        (state.brake ? " · brakes on" : "") +
        (state.hazard ? " · hazards" : ""),
    };
  },
};
