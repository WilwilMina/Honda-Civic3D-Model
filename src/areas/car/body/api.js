// The ctx.car API used by the other areas (see docs/ARCHITECTURE.md): open the hood / doors / trunk, take a wheel off,
// switch the lamps, sweep the wipers, and reach the exterior parts (parts, lights, doors, wipers) and the surface
// (stationAt, surfacePoint). Also returns the per-frame update for the wheel and wiper animations.
import * as THREE from "three";
import { clamp, lerp, smooth01 } from "./profile.js";
import { P, st } from "./section.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const HOOD_DEG = 68; // hood opening angle (cab-forward cowl: a bit more than 60 so the bay stays visible)

// installCarApi(ctx, state): sets ctx.car and returns update(dt).
// All t arguments are 0..1 (0 = closed or fitted, 1 = open or removed).
export function installCarApi(
  ctx,
  { g, hood, hoodPivot, prop, propBase, propLen, doors, trunk, wheels, wipers, parts, lights, glowMats },
) {
  let hoodT = 0,
    trunkT = 0;
  const propRest = V(-1, -0.04, 0).normalize(); // prop rod direction when stowed
  const hoodAttachLocal = V(0.36, 1.8, 0).sub(hoodPivot); // point on the hood underside (hood frame)
  hoodAttachLocal.z = P(1.8, 4)[2] - 0.03 - hoodPivot.z;
  // hood: rotates up about the hinge line (x axis) by up to HOOD_DEG
  function setHood(t) {
    hoodT = clamp(t, 0, 1);
    hood.rotation.x = (hoodT * HOOD_DEG * Math.PI) / 180;
    // rod swings up once the hood is high enough
    const open = hoodAttachLocal
      .clone()
      .applyAxisAngle(V(1, 0, 0), (HOOD_DEG * Math.PI) / 180)
      .add(hoodPivot)
      .sub(propBase);
    const k = smooth01((hoodT - 0.55) / 0.45);
    const dir = propRest.clone().lerp(open.clone().normalize(), k).normalize();
    prop.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
    prop.scale.y = lerp(1, open.length() / propLen, k);
  }
  // door "fl" | "fr" | "rl" | "rr": swings out about its front hinge (z axis) by up to 65 deg
  function setDoor(id, t) {
    const d = doors[id];
    if (!d) return;
    d.angle = clamp(t, 0, 1);
    d.group.rotation.z = d.side * ((d.angle * 65 * Math.PI) / 180);
  }
  // trunk lid: rotates up about its front hinge by up to 70 deg
  function setTrunk(t) {
    trunkT = clamp(t, 0, 1);
    trunk.rotation.x = -(trunkT * 70 * Math.PI) / 180;
  }
  // wheel removal: slide out 0.35 m (first half), then tip over outward and lie on the floor (second half); the floor
  // height is corrected for the lift (ctx.carRoot moves up when the car is on the lift)
  function placeWheel(w) {
    const t = w.t,
      lift = ctx.carRoot.position.z;
    const slide = smooth01(t / 0.5) * 0.35;
    const fall = smooth01((t - 0.5) / 0.5);
    const floorZ = 0.1 - lift;
    w.group.position.set(w.home.x + w.side * (slide + fall * 0.34), w.home.y, lerp(w.home.z, floorZ, fall));
    w.group.rotation.set(0, -w.side * fall * (Math.PI / 2), w.baseRotZ);
  }
  function setWheelOff(id, t) {
    const w = wheels[id];
    if (!w) return;
    w.t = clamp(t, 0, 1);
    placeWheel(w);
  }
  // see-through pieces must not swallow clicks: lamp glow overlays (opaque enough to block the lamp parts in
  // the Lights area when lit) and window glass (rays to parts seen through a door window were stopped)
  const glowSet = new Set(glowMats);
  const GLASS = new Set(["windshield", "rear-window", "door-glass", "fixed-glass"]);
  g.traverse((o) => {
    if (o.isMesh && (glowSet.has(o.material) || GLASS.has(o.name))) o.raycast = () => {};
  });
  let wiperPhase = -1;
  // last brake and tail levels set, so setLights({tail}) keeps the brake glow and vice versa
  let brakeLevel = 0,
    tailLevel = 0;
  ctx.car = {
    setHood,
    setDoor,
    setTrunk,
    setWheelOff,
    wheel: (id) => wheels[id]?.group,
    get hood() {
      return hoodT;
    },
    get trunk() {
      return trunkT;
    },
    parts,
    lights,
    glowMats,
    doors,
    wipers,
    // lamps on/off: {head, tail, brake, reverse, turn} -> 0..1
    setLights(state) {
      for (const [k, list] of Object.entries(lights)) {
        const v = state[k];
        if (v === undefined) continue;
        for (const o of list) o.material.opacity = k === "head" ? v * 0.62 : k === "tail" ? v * 0.6 : v * 0.8;
      }
      // tail and brake share the outer lamp glow: use the brighter (the third brake light has no tail function)
      const brakeOnly = state.brake ?? brakeLevel;
      const b = Math.max(brakeOnly, (state.tail ?? tailLevel) * 0.55);
      if (state.brake !== undefined) brakeLevel = state.brake;
      if (state.tail !== undefined) tailLevel = state.tail;
      for (const o of lights.brake) o.material.opacity = (lights.tail.includes(o) ? b : brakeOnly) * 0.8;
    },
    sweepWipers() {
      if (wiperPhase < 0) wiperPhase = 0;
    },
    get sweeping() {
      return wiperPhase >= 0;
    },
    stationAt: st,
    surfacePoint: P,
  };
  setHood(0);

  // per frame: keep removed wheels on the floor while the lift moves; run a wiper sweep (1.6 s out and back)
  function update(dt) {
    for (const w of Object.values(wheels)) if (w.t > 0) placeWheel(w);
    if (wiperPhase >= 0) {
      wiperPhase += dt / 1.6;
      const t = wiperPhase >= 1 ? 0 : Math.sin(Math.PI * wiperPhase);
      for (const w of wipers) w.sweepG.rotation.z = -t * w.max;
      if (wiperPhase >= 1) wiperPhase = -1;
    }
  }
  return update;
}
