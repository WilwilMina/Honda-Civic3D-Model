// "Inside the engine" area: an animated see-through cutaway of the R18Z1 (1.8 L SOHC i-VTEC, 4 cylinders),
// opened from the engine bay. This file is the area definition (docs/ARCHITECTURE.md): it places the engine
// frame in the car, assembles the parts from the sibling builders (block, bottom-end, valvetrain, timing,
// ignition), poses them all for one crank angle, and provides the play / speed / turn-by-hand controls and
// the stroke cards. The numbers and the animation math (slider-crank, valve lift, firing order 1-3-4-2) are
// in kinematics.js.
import { PLACE, SPEEDS, mod, cyclePhase, strokeAt, firingCylinder } from "./kinematics.js";
import { createKit } from "./kit.js";
import { buildBlock } from "./block.js";
import { buildBottomEnd, poseBottomEnd } from "./bottom-end.js";
import { buildValvetrain, poseValvetrain } from "./valvetrain.js";
import { buildTiming, poseTiming } from "./timing.js";
import { buildIgnition, poseIgnition, hideSpark } from "./ignition.js";

// Engine-bay parts faded out while the cutaway is shown, so it can be seen through them.
const GHOST_KEYS = [
  "bay:engine-block",
  "bay:valve-cover",
  "bay:timing-cover",
  "bay:oil-pan",
  "bay:intake-manifold",
  "bay:exhaust-manifold",
  "bay:coils",
  "bay:oil-cap",
  "bay:throttle-body",
  "bay:intake-tube",
  "bay:air-box",
  "bay:dipstick",
  "bay:thermostat",
  "bay:engine-mount",
  "bay:alternator",
  "bay:water-pump",
  "bay:belt",
  "bay:tensioner",
  "bay:crank-pulley",
  "bay:ac-compressor",
  "bay:oil-filter",
  "bay:upper-hose",
  "bay:lower-hose",
  "bay:alt-cable",
  "bay:starter",
  "bay:catalytic",
  "bay:o2-sensor",
];
const STROKE_NAMES = { intake: "Intake", compression: "Compression", power: "Power", exhaust: "Exhaust" };

export default {
  id: "engine",
  label: "Inside the engine",
  parent: "bay",
  build(ctx) {
    const { THREE } = ctx;
    const root = new THREE.Group();
    root.name = "engine-internals";
    root.visible = false;
    // the engine's local frame (2 mm units, see kinematics.js) placed in the car
    const frame = new THREE.Group();
    frame.rotation.z = Math.PI;
    frame.scale.setScalar(PLACE.scale);
    frame.position.set(...PLACE.offset);
    root.add(frame);

    let shown = false; // area open: parts clickable, spark light allowed
    const kit = createKit(ctx, frame, () => shown);

    // ---------------------------------------------------------------- build the parts
    buildBlock(kit);
    const bottom = buildBottomEnd(kit);
    const valvetrain = buildValvetrain(kit);
    const timing = buildTiming(kit, ctx);
    const ignition = buildIgnition(kit, ctx);
    kit.flush(); // merge the queued rigid pieces into one mesh per part and look

    // ---------------------------------------------------------------- pose everything for a crank angle
    let theta = 30, // crank angle in degrees, 0…720 (two turns = one full four-stroke cycle)
      playing = false,
      cycle = SPEEDS.slow,
      dirty = true,
      statusText = "",
      sliderClock = 0;
    const strokes = ["", "", "", ""]; // current stroke per cylinder, for the cards
    function pose(th) {
      poseBottomEnd(bottom, th);
      poseValvetrain(valvetrain, th);
      poseTiming(timing, th);
      poseIgnition(ignition, th, shown);
      for (let c = 0; c < strokes.length; c++) strokes[c] = strokeAt(cyclePhase(th, c));
      statusText = `crank ${Math.round(mod(th, 720))}° · cylinder ${firingCylinder(th) + 1} firing`;
    }

    // ---------------------------------------------------------------- controls
    const playCtl = {
      type: "toggle",
      label: "Play",
      labelOn: "Pause",
      on: false,
      onChange(on) {
        playing = on;
      },
    };
    const speedCtl = {
      type: "group",
      options: [
        { label: "Slow-mo", value: "slow" },
        { label: "Medium", value: "medium" },
        { label: "Fast", value: "fast" },
      ],
      value: "slow",
      onChange(v) {
        cycle = SPEEDS[v] || SPEEDS.slow;
        speedCtl.value = v;
        if (!playing) {
          playing = playCtl.on = true;
          playCtl.refresh?.();
        }
      },
    };
    const angleCtl = {
      type: "slider",
      label: "Turn it by hand",
      min: 0,
      max: 720,
      step: 1,
      value: theta,
      format: (v) => `${Math.round(v)}°`,
      onInput(v) {
        theta = +v;
        dirty = true;
        if (playing) {
          playing = playCtl.on = false;
          playCtl.refresh?.();
        }
      },
    };
    // one card per cylinder showing its stroke (styled by data-s in styles.css)
    const strokeCtl = {
      type: "html",
      className: "ui-strokes",
      html: [1, 2, 3, 4]
        .map((n) => `<div class="ui-stroke" data-s="intake"><b>Cyl ${n}</b><span>Intake</span></div>`)
        .join(""),
    };
    let lastCards = "",
      lastEl = null;
    function paintCards() {
      const sig = strokes.join();
      // repaint when a stroke changes, or when the UI has rebuilt the div (it does on area changes)
      if (!strokeCtl.el || (sig === lastCards && strokeCtl.el === lastEl)) return;
      lastCards = sig;
      lastEl = strokeCtl.el;
      strokeCtl.el.querySelectorAll(".ui-stroke").forEach((el, i) => {
        el.dataset.s = strokes[i];
        el.querySelector("span").textContent = STROKE_NAMES[strokes[i]];
      });
    }
    pose(theta);

    return {
      group: root,
      view: { pos: [-0.62, 2.28, 1.12], target: [-0.235, 1.545, 0.55] },
      hotspot: { pos: [-0.23, 1.545, 0.9], label: "Inside the engine" },
      controls: [playCtl, speedCtl, angleCtl, strokeCtl],
      async enter() {
        ctx.ghost(GHOST_KEYS, true, 0.12);
        shown = true;
        root.visible = true;
        cycle = SPEEDS.slow;
        speedCtl.value = "slow";
        playing = playCtl.on = true;
        playCtl.refresh?.();
        dirty = true;
        lastCards = "";
      },
      async exit() {
        playing = playCtl.on = false;
        shown = false;
        root.visible = false;
        hideSpark(ignition);
        ctx.ghost(GHOST_KEYS, false);
      },
      update(dt) {
        if (playing && shown) {
          theta = mod(theta + (720 * dt) / cycle, 720);
          dirty = true;
        }
        if (strokeCtl.el !== lastEl) paintCards();
        if (!dirty) return;
        dirty = false;
        angleCtl.value = Math.round(theta);
        pose(theta);
        paintCards();
        // while playing, move the slider knob about 10 times a second rather than every frame
        sliderClock += dt;
        if (playing && (sliderClock > 0.1 || dt === 0)) {
          sliderClock = 0;
          angleCtl.set?.(Math.round(theta));
        }
      },
      status: () => statusText,
    };
  },
};
