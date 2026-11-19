// Tweens and camera flights. tween() runs a short animation as a Promise (areas use it via ctx.tween for
// doors, lids and lifts); camTo() flies the camera and its orbit point to a new view. The frame loop in
// core/app.js advances every running tween once per drawn frame with step().
import * as THREE from "three";

// Ease-in-out cubic: 0..1 -> 0..1, slow at both ends.
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Create the tween runner and the camera-flight helper for one camera + OrbitControls pair.
export function createAnimator(camera, controls) {
  const tweens = new Set(); // {t0, d, fn, resolve}

  // tween(seconds, fn): calls fn(t) with t going 0..1 (linear; ease it yourself), resolves when done.
  // A zero/negative duration jumps straight to fn(1).
  function tween(seconds, fn) {
    return new Promise((resolve) => {
      if (seconds <= 0) {
        fn(1);
        resolve();
        return;
      }
      tweens.add({ t0: performance.now(), d: seconds * 1000, fn, resolve });
    });
  }

  // Advance all running tweens to time `now` (ms); finished ones are removed and resolved.
  function step(now) {
    for (const tw of [...tweens]) {
      const t = Math.min(1, (now - tw.t0) / tw.d);
      tw.fn(t);
      if (t >= 1) {
        tweens.delete(tw);
        tw.resolve();
      }
    }
  }

  // Fly the camera to position p1 looking at t1 (world coordinates). One flight at a time: a newer flight
  // cancels older ones (their tween keeps running but stops moving the camera). User orbiting is disabled
  // during the flight and re-enabled when the latest flight lands.
  let camGen = 0;
  function camTo(p1, t1, seconds) {
    const g = ++camGen,
      p0 = camera.position.clone(),
      t0 = controls.target.clone();
    controls.enabled = false;
    return tween(seconds, (t) => {
      if (g !== camGen) return;
      const e = ease(t);
      camera.position.lerpVectors(p0, p1, e);
      controls.target.lerpVectors(t0, t1, e);
      camera.lookAt(controls.target);
    }).then(() => {
      if (g === camGen) controls.enabled = true;
    });
  }

  // Fly to an area-style view {pos, target} given in car (authoring) coordinates; carRoot converts them to
  // world coordinates, which also applies the driver-side mirror and any lift height.
  function flyTo(carRoot, view, seconds) {
    carRoot.updateWorldMatrix(true, false);
    return camTo(
      carRoot.localToWorld(new THREE.Vector3(...view.pos)),
      carRoot.localToWorld(new THREE.Vector3(...view.target)),
      seconds,
    );
  }

  return {
    tween,
    step,
    camTo,
    flyTo,
    get running() {
      return tweens.size > 0;
    },
  };
}
