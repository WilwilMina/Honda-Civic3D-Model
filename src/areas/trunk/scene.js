// "Trunk" area: open the trunk lid, lift the floor board and see the compact spare, the jack and the tools; a
// button lifts them out onto the floor beside the car. This file is the area definition (docs/ARCHITECTURE.md):
// it wires up the builders and runs the animations:
//   kit.js     - dimensions, spare size, shared helpers, createKit()
//   linings.js - carpet linings, spare well, floor board
//   stowage.js - spare tire, hold-down, tool tray, jack, lug wrench
//   opening.js - trunk seal, striker, taillight access, emergency release (fitted to the exterior lid
//                surface)
import * as THREE from "three";
import { T, SPARE, createKit } from "./kit.js";
import { buildLinings, buildFloorBoard } from "./linings.js";
import { buildStowage } from "./stowage.js";
import { buildOpening } from "./opening.js";

export default {
  id: "trunk",
  label: "Trunk",
  parent: "car",
  build(ctx) {
    const group = new THREE.Group();
    group.name = "trunk";
    const kit = createKit(ctx);

    // ---------------------------------------------------------------- model (linings, stowage, board, opening)
    buildLinings(kit, ctx, group);
    const { spare, spareHome, holdDown, tools, jack, jackHome, wrench, wrenchHome } = buildStowage(
      kit,
      ctx,
      group,
    );
    const board = buildFloorBoard(kit, ctx);
    group.add(board);
    const openOnly = buildOpening(kit, ctx, group);
    // setLid(t): the exterior trunk lid (0 shut, 1 open); the opening hardware shows only while it is open
    let lidT = 0;
    const setLid = (t) => {
      lidT = t;
      ctx.car?.setTrunk?.(t);
      for (const o of openOnly) o.visible = t > 0.02;
    };
    for (const o of openOnly) o.visible = false;

    // ---------------------------------------------------------------- state + animations
    let boardT = 0,
      outT = 0;
    // The folded jack, tool tray and wing nut stand taller than the gap between the spare and the closed
    // floor board, so with the board (nearly) shut they would poke through it: hide them until the board is
    // lifted a little.
    const stowVis = () => {
      const show = boardT > 0.12 || outT > 0;
      jack.visible = wrench.visible = tools.visible = show;
      holdDown.visible = show && outT < 0.02;
    };
    // setBoard(t): floor board hinged up by t radians (0 = shut, 1 ≈ 57°)
    const setBoard = (t) => {
      boardT = t;
      board.rotation.x = -t * 1.0;
      stowVis();
    };
    const OUT = {
      // where things lie on the garage floor beside the car (driver side, behind the rear wheel)
      spare: { pos: new THREE.Vector3(1.32, -2.35, SPARE.W / 2 + 0.002) },
      jack: { pos: new THREE.Vector3(0.97, -2.07, 0.082), rotZ: Math.PI / 2 },
      wrench: { pos: new THREE.Vector3(1.09, -2.1, 0.082), rotZ: Math.PI / 2 },
      // the tray group sits at the origin (its mesh is built in place), so this is an offset from its home
      tools: { pos: new THREE.Vector3(1.0, -2.1 - T.wellY, -spareHome.z - SPARE.W / 2 + 0.07 - 0.003) },
    };
    // position at t along a hop from a to b: a straight line plus a sine bump of height h
    const arc = (a, b, t, h) =>
      new THREE.Vector3().lerpVectors(a, b, t).setZ(a.z + (b.z - a.z) * t + Math.sin(Math.PI * t) * h);
    // setOut(t): lift the pieces out onto the floor, staggered (spare, then jack + tray, then wrench)
    const setOut = (t) => {
      outT = t;
      const ts = Math.min(1, t * 1.15),
        tj = Math.max(0, Math.min(1, (t - 0.05) * 1.25)),
        tw = Math.max(0, Math.min(1, (t - 0.15) * 1.25));
      spare.position.copy(arc(spareHome, OUT.spare.pos, ts, 0.9));
      spare.rotation.y = Math.sin(Math.PI * ts) * 0.5;
      jack.position.copy(arc(jackHome, OUT.jack.pos, tj, 0.75));
      jack.rotation.z = OUT.jack.rotZ * tj;
      wrench.position.copy(arc(wrenchHome, OUT.wrench.pos, tw, 0.75));
      wrench.rotation.z = OUT.wrench.rotZ * tw;
      tools.position.copy(arc(new THREE.Vector3(), OUT.tools.pos, tj, 0.75));
      stowVis();
    };
    // gen: every new action (button, toggle, enter/exit) bumps it so older tweens stop writing (rapid clicks
    // or leaving mid-animation must not leave the spare out on the floor). active: controls do nothing while
    // entering/leaving.
    let gen = 0,
      active = false;
    const anim = (sec, from, to, fn, g = gen) =>
      ctx.tween(sec, (t) => {
        if (g === gen) fn(from + (to - from) * t);
      });
    stowVis();

    // camera views (authoring frame): looking in over the bumper, and at the pieces on the floor
    const VIEW = { pos: [0.7, -3.35, 1.8], target: [0, -1.78, 0.55] };
    const VIEW_OUT = { pos: [2.55, -4.0, 1.75], target: [0.85, -2.05, 0.35] };
    const ctlBoard = {
      type: "button",
      label: "Lift the floor",
      onClick() {
        if (!active) return;
        const g = ++gen;
        const up = boardT < 0.5;
        ctlBoard.label = up ? "Lower the floor" : "Lift the floor";
        if (!up && outT > 0) {
          ctlOut.on = false;
          ctlOut.refresh?.();
          anim(0.9 * outT, outT, 0, setOut, g).then(() => g === gen && anim(0.6, boardT, 0, setBoard, g));
        } else anim(0.6, boardT, up ? 1 : 0, setBoard, g);
      },
    };
    const ctlOut = {
      type: "toggle",
      label: "Take out the spare",
      labelOn: "Put the spare back",
      on: false,
      async onChange(on) {
        if (!active) {
          ctlOut.on = false;
          return;
        }
        const g = ++gen;
        if (on && boardT < 0.99) {
          await anim(0.5, boardT, 1, setBoard, g);
          if (g !== gen) return;
          ctlBoard.label = "Lower the floor";
          ctlBoard.refresh?.();
        }
        await Promise.all([anim(1.3, outT, on ? 1 : 0, setOut, g), ctx.flyTo(on ? VIEW_OUT : VIEW, 1.4)]);
      },
    };

    return {
      group,
      view: VIEW,
      hotspot: { pos: [0, -1.98, 1.14], label: "Trunk" },
      async enter(_ctx, { instant } = {}) {
        const g = ++gen;
        if (instant) {
          setLid(1);
          setBoard(1);
          ctlBoard.label = "Lower the floor";
          active = true;
          return;
        }
        await anim(0.9, lidT, 1, setLid, g);
        await anim(0.6, boardT, 1, setBoard, g);
        ctlBoard.label = "Lower the floor";
        ctlBoard.refresh?.();
        active = true;
      },
      async exit(_ctx, { instant } = {}) {
        active = false;
        const g = ++gen;
        const d = instant ? 0 : 1;
        ctlOut.on = false;
        if (outT > 0) await anim(0.8 * d, outT, 0, setOut, g);
        if (boardT > 0) await anim(0.5 * d, boardT, 0, setBoard, g);
        await anim(0.8 * d, lidT, 0, setLid, g);
        ctlBoard.label = "Lift the floor";
      },
      // the emergency release is on the underside of the raised lid: look up at it from behind the bumper
      reveal(key) {
        if (key !== "trunk:trunk-release") return;
        ctx.flyTo({ pos: [0, -2.66, 1.05], target: [0, -2.196, 1.231] }, 1.0);
        return "handled";
      },
      controls: [ctlBoard, ctlOut],
      status() {
        return outT > 0.5
          ? "Spare, jack and wrench are out beside the car"
          : boardT > 0.5
            ? "Floor lifted · the spare is underneath"
            : "Trunk open";
      },
    };
  },
};
