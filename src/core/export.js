// GLB export of the whole car, for the Blender copy of the model. installExporter() adds
// window.__exportGLB(), which tools/export-glb.mjs calls in a headless browser: it un-hides every part, tags
// meshes with their part info, samples the hood/doors/trunk/wheel/engine animations into clips, and returns
// the binary GLB as base64. The hinge pivot groups are exported as nodes, so the animations keep working.
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { PARTS } from "./registry.js";

// Install window.__exportGLB() -> Promise<{b64, clips:[names], size}>. Meant for headless export runs:
// it gives every object a unique name and may leave the animated parts' own state changed.
export function installExporter(app) {
  window.__exportGLB = async function () {
    const ctx = app.ctx;
    // export the real colours, not focus-mode ghosts
    app.select(null, { focus: false });
    app.focus?.clear({ instant: true });
    const root = new THREE.Group();
    root.name = "Civic2013LX";
    // the car lives in z-up; glTF is y-up
    root.rotation.x = -Math.PI / 2;
    const car = ctx.carRoot;
    const saved = [];
    // tag every part with its name/area/summary (glTF "extras") and make it and its parents visible
    car.traverse((o) => {
      if (!o.userData.part) return;
      const p = PARTS[o.userData.part];
      if (p)
        Object.assign(o.userData, {
          partName: p.name,
          area: p.area,
          summary: String(p.what || "").slice(0, 400),
        });
      for (let q = o; q && q !== car; q = q.parent)
        if (!q.visible) {
          saved.push(q);
          q.visible = true;
        }
    });
    // remember every object's resting transform so each animation sample starts from it
    const snapshot = () => {
      const m = new Map();
      car.traverse((o) => m.set(o, [o.position.clone(), o.quaternion.clone(), o.scale.clone()]));
      return m;
    };
    const base = snapshot();
    const restore = () => {
      for (const [o, [p, q, s]] of base) {
        o.position.copy(p);
        o.quaternion.copy(q);
        o.scale.copy(s);
      }
    };
    // sample(name, frames, fps, apply): call apply(t) for t = 0..1 in `frames` steps, record every object's
    // transform, and keep tracks only for objects that actually moved (named objects, so tracks can bind)
    const clips = [];
    const sample = (name, frames, fps, apply) => {
      const recs = new Map();
      for (let i = 0; i <= frames; i++) {
        apply(i / frames);
        car.updateMatrixWorld(true);
        car.traverse((o) => {
          if (!recs.has(o)) recs.set(o, []);
          recs.get(o).push([o.position.clone(), o.quaternion.clone(), o.scale.clone()]);
        });
      }
      restore();
      const tracks = [];
      const times = Array.from({ length: frames + 1 }, (_, i) => i / fps);
      for (const [o, list] of recs) {
        const moved = list.some(
          ([p, q, s]) =>
            p.distanceTo(list[0][0]) > 1e-5 ||
            Math.abs(q.dot(list[0][1])) < 0.99999 ||
            s.distanceTo(list[0][2]) > 1e-5,
        );
        if (!moved || !o.name) continue;
        tracks.push(
          new THREE.VectorKeyframeTrack(
            `${o.name}.position`,
            times,
            list.flatMap(([p]) => [p.x, p.y, p.z]),
          ),
        );
        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            `${o.name}.quaternion`,
            times,
            list.flatMap(([, q]) => [q.x, q.y, q.z, q.w]),
          ),
        );
        tracks.push(
          new THREE.VectorKeyframeTrack(
            `${o.name}.scale`,
            times,
            list.flatMap(([, , s]) => [s.x, s.y, s.z]),
          ),
        );
      }
      if (tracks.length) clips.push(new THREE.AnimationClip(name, -1, tracks));
    };
    // unique names so animation tracks bind
    const used = new Set();
    car.traverse((o) => {
      let n = (o.name || (o.userData.part ? o.userData.part.replace(":", "_") : o.type)).replace(
        /[^A-Za-z0-9_.-]/g,
        "_",
      );
      let k = n,
        i = 1;
      while (used.has(k)) k = `${n}_${i++}`;
      used.add(k);
      o.name = k;
    });
    // the animations, at 24 fps: 30 frames for each exterior hinge, and 144 frames for one full four-stroke
    // engine cycle (two crank turns, 720°, driven through the engine area's hand-crank slider)
    const c = ctx.car || {};
    if (c.setHood) sample("Hood_open", 30, 24, (t) => c.setHood(t));
    if (c.setDoor)
      sample("Doors_open", 30, 24, (t) => ["fl", "fr", "rl", "rr"].forEach((d) => c.setDoor(d, t)));
    if (c.setTrunk) sample("Trunk_open", 30, 24, (t) => c.setTrunk(t));
    if (c.setWheelOff) sample("Front_wheel_off", 30, 24, (t) => c.setWheelOff("fl", t));
    const eng = app.areas.get("engine")?.inst;
    const slider = eng?.controls?.find((k) => k.type === "slider");
    if (slider)
      sample("Engine_running", 144, 24, (t) => {
        slider.onInput(t * 720);
        eng.update?.(0, ctx);
      });
    // leave out invisible helper meshes (unlit lamp glows, gas volumes, spark sprites at 0 opacity)
    const hiddenHelpers = [];
    car.traverse((o) => {
      const m = o.material;
      if (o.isMesh && o.visible && m && !Array.isArray(m) && m.transparent && m.opacity < 0.05) {
        hiddenHelpers.push(o);
        o.visible = false;
      }
      if ((o.isSprite || o.isPoints || o.isLight) && o.visible) {
        hiddenHelpers.push(o);
        o.visible = false;
      }
    });
    // strip non-serializable userData (functions, geometries, objects) so it doesn't bloat the GLB extras
    const stash = [];
    car.traverse((o) => {
      for (const [k, v] of Object.entries(o.userData || {})) {
        if (
          typeof v === "function" ||
          (v &&
            typeof v === "object" &&
            (v.isBufferGeometry ||
              v.isObject3D ||
              v.isMaterial ||
              v.isTexture ||
              (Array.isArray(v) && v.some((x) => x && typeof x === "object"))))
        ) {
          stash.push([o, k, v]);
          delete o.userData[k];
        }
      }
    });
    // export from the ground (lift down) under a y-up root, then put the car back
    const parent = car.parent;
    const lift = car.position.z;
    car.position.z = 0;
    root.add(car);
    const exporter = new GLTFExporter();
    const glb = await exporter.parseAsync(root, {
      binary: true,
      onlyVisible: true,
      animations: clips,
      maxTextureSize: 1024,
    });
    parent.add(car);
    car.position.z = lift;
    saved.forEach((o) => (o.visible = false));
    for (const [o, k, v] of stash) o.userData[k] = v;
    hiddenHelpers.forEach((o) => (o.visible = true));
    // base64 in 32 KB chunks (String.fromCharCode.apply has an argument-count limit)
    const bytes = new Uint8Array(glb);
    let s = "";
    for (let i = 0; i < bytes.length; i += 0x8000)
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return { b64: btoa(s), clips: clips.map((k) => k.name), size: bytes.length };
  };
}
