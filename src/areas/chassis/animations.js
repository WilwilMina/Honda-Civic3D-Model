// Chassis area, animations: steering (the knuckles turn about their steering axes, the rack and tie rods
// follow), braking (pads squeeze the rotors, shoes spread in the drums, lines glow, brake lights on), bounce
// (the car is pushed down once and settles) and the driver-side rear drum sliding off. Kit units in the
// corner groups.
import * as THREE from "three";
import { K, FRONT_AXLE_Y } from "./kit.js";
import { smooth } from "./geometry.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// createAnimator(kit, corners): returns { st, apply, setDrum, step(dt) }. corners = { FL, FR, RL, RR } from
// the builders.
export function createAnimator(kit, { FL, FR, RL, RR }) {
  const { ctx, glowMat, glows } = kit;
  // steer: knuckle angle (rad); brake: pedal 0..1; d: bounce lift (kit units); drum: drum slide-off 0..1;
  // open: area is open; live: controls are accepted (set once the corner has finished opening)
  const st = {
    steer: 0,
    steerOn: false,
    steerT: 0,
    brake: 0,
    brakeOn: false,
    bounceT: -1,
    d: 0,
    drum: 0,
    open: false,
    live: false,
    time: 0,
  };
  const last = { steer: NaN, d: NaN, brake: NaN }; // apply() only rebuilds what changed
  const tmpM = new THREE.Matrix4(),
    tmpR = new THREE.Matrix4(),
    tmpQ = new THREE.Quaternion();
  const Y = V(0, 1, 0);
  // Knuckle pose: turn by th about the steering axis (lower ball joint kpP -> strut top, direction kpA), then
  // lift by d. Written straight into c.kn.matrix (front group, kit units).
  function knuckleMatrix(c, th, d) {
    const p = c.kpP;
    tmpR.makeRotationAxis(c.kpA, th);
    tmpM
      .makeTranslation(p.x, p.y, p.z + d)
      .multiply(tmpR)
      .multiply(new THREE.Matrix4().makeTranslation(-p.x, -p.y, -p.z));
    c.kn.matrix.copy(tmpM);
    c.kn.matrixWorldNeedsUpdate = true;
    return tmpM;
  }
  // stretch a unit-height cylinder (y-up) from a to b
  function rod(mesh, a, b) {
    const dir = b.clone().sub(a);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.scale.set(1, dir.length(), 1);
    mesh.quaternion.copy(tmpQ.setFromUnitVectors(Y, dir.normalize()));
  }
  // a hose hanging between a and b, sagging by sag in the middle
  function hosePts(a, b, sag) {
    const m = a.clone().lerp(b, 0.5);
    m.z -= sag;
    return smooth([a, a.clone().lerp(m, 0.6), m, b.clone().lerp(m, 0.6), b], 24);
  }
  // apply(): pose everything for the current steer / bounce / brake state
  function apply() {
    const th = st.steer,
      d = st.d,
      b = st.brake;
    const moved = th !== last.steer || d !== last.d;
    if (moved) {
      let rackDx = 0;
      for (const c of [FL, FR]) {
        const Mx = knuckleMatrix(c, th, d);
        const out = c.tieOut.clone().applyMatrix4(Mx);
        if (c === FL) rackDx = out.x - c.tieOut.x; // the rack is one bar: both inner tie-rod ends move with it
        const inn = c.tieIn.clone();
        inn.x += rackDx;
        const dir = out.clone().sub(inn).normalize();
        rod(c.tie, inn, out.clone().sub(dir.clone().multiplyScalar(2)));
        c.tieEnd.position.copy(out);
        c.tieBoot.position.copy(inn).add(dir.multiplyScalar(-1.5));
        c.tieBoot.scale.set(1.2, 1.2, 1.2);
        const top = c.linkTop.clone().applyMatrix4(Mx);
        const lowp = c.linkLow.clone();
        lowp.z += 1.5;
        c.link.set([lowp.toArray(), top.toArray()]);
        c.linkBalls[0].position.copy(lowp);
        c.linkBalls[1].position.copy(top);
        c.hose.set(hosePts(c.hoseB.clone().applyMatrix4(Mx), c.hoseFix, 6));
        c.abs.set(hosePts(c.absB.clone().applyMatrix4(Mx), c.absFix, 5));
        c.spring.scale.z = (c.springH - d) / c.springH;
        // the lower arm (66 kit, pivot to ball joint) and CV axle (about 104 kit) swing up with the knuckle
        c.armP.rotation.y = -c.s * Math.asin(d / 66);
        c.axP.rotation.y = -c.s * Math.atan(d / 104);
      }
      for (const c of [RL, RR]) {
        c.kn.position.z = d;
        // upper arm (about 50 kit long) and trailing arm follow the hub up
        c.upP.rotation.y = -c.s * Math.asin(d / 50);
        c.trP.rotation.x = -d / 39.5;
        c.spring.scale.z = (c.springH - d) / c.springH;
        // the slid-off driver-side drum stays on the floor
        if (c !== RL || st.drum === 0) c.drum.position.z = c.drumHome.z + d;
      }
      // the exterior's wheels (car metres) follow: the fronts swing about the steering axis, all four bounce
      for (const [id, steerable] of [
        ["fr", true],
        ["rr", false],
        ["fl", true],
        ["rl", false],
      ]) {
        const w = ctx.car?.wheel?.(id);
        if (!w || !w.userData.homeZ) {
          if (w) {
            w.userData.homeZ = w.position.z;
            w.userData.homeRot = w.rotation.z;
          } else continue;
        }
        // skip a wheel the car area has taken off (raised or pulled outward)
        if (w.position.z > w.userData.homeZ + 0.06 || Math.abs(w.position.x) > 0.8) continue;
        if (!w.userData.home) w.userData.home = w.position.clone();
        if (steerable) {
          // swing the wheel about the same steering axis as the knuckle (kit units in the front group)
          const c = id === "fl" ? FL : FR,
            h = w.userData.home;
          const q = V(h.x / K, (h.y - FRONT_AXLE_Y) / K, h.z / K).applyMatrix4(c.kn.matrix);
          w.position.set(q.x * K, q.y * K + FRONT_AXLE_Y, q.z * K);
        } else w.position.z = w.userData.homeZ + d * K;
        w.rotation.z = w.userData.homeRot + (steerable ? th : 0);
      }
      last.steer = th;
      last.d = d;
    }
    if (b !== last.brake) {
      const gap = 0.55 * (1 - b);
      for (const c of [FL, FR]) {
        c.padIn.position.x = -c.s * gap; // piston pushes the inner pad onto the rotor
        c.cal.position.x = c.s * gap; // the floating caliper pulls the outer pad in
      }
      for (const c of [RL, RR]) for (const g of c.shoes) g.position.y = g.userData.dir * 0.42 * b;
      ctx.car?.setLights?.({ brake: b }); // the brake lights come on with the pedal
      last.brake = b;
    }
    glowMat.opacity = b > 0.001 ? b * (0.5 + 0.18 * Math.sin(st.time * 7)) : 0;
    for (const g of glows) g.visible = b > 0.001;
  }
  // setDrum(t): the driver-side rear drum slides straight out (t 0..0.5), then tips flat onto the floor
  function setDrum(t) {
    st.drum = t;
    const c = RL,
      h = c.drumHome;
    if (t <= 0.5) {
      const u = t / 0.5;
      c.drum.position.set(h.x + 34 * u, h.y, h.z + st.d * (1 - u));
      c.drum.rotation.set(0, 0, 0);
    } else {
      const u = (t - 0.5) / 0.5;
      const e = u * u * (3 - 2 * u);
      c.drum.position.set(h.x + 34 + 16 * e, h.y - 46 * e, h.z * (1 - e) + 0.05);
      c.drum.rotation.set(0, (Math.PI / 2) * e, 0);
    }
  }

  // step(dt): advance the steering sweep, brake squeeze and bounce by one frame, then apply()
  function step(dt) {
    st.time += dt;
    // steering: sweep side to side while on, settle to straight when off
    if (st.steerOn) st.steerT += dt;
    const target = st.steerOn ? 0.42 * Math.sin(st.steerT * 1.25) : 0;
    if (!st.steerOn) st.steerT = 0;
    st.steer += (target - st.steer) * Math.min(1, dt * (st.steerOn ? 12 : 5));
    if (Math.abs(st.steer) < 1e-4 && !st.steerOn) st.steer = 0;
    // brakes squeeze over ~0.25 s
    const bt = st.brakeOn ? 1 : 0;
    st.brake += Math.sign(bt - st.brake) * Math.min(Math.abs(bt - st.brake), dt * 4);
    // bounce: push the car down once and let it settle (damped 1.1 Hz oscillation, peak 7.5 kit = 37 mm)
    if (st.bounceT >= 0) {
      st.bounceT += dt;
      const t = st.bounceT;
      st.d = 7.5 * Math.exp(-1.6 * t) * Math.sin(Math.PI * 2 * 1.1 * t) * (t < 0.12 ? t / 0.12 : 1);
      if (t > 3.2) {
        st.bounceT = -1;
        st.d = 0;
      }
    }
    apply();
  }

  apply();
  return { st, apply, setDrum, step };
}
