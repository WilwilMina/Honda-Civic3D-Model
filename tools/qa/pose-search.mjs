// Pose search: find camera positions from which given parts can be seen, without rendering anything.
// For each part it tries a grid of camera directions and distances around the part (skipping positions inside the
// body), raycasts to sample points on the part, and prints the best pose in the car frame (metres, see
// docs/ARCHITECTURE.md) as JSON. Used to pick the poses that the areas' reveal() hooks fly to.
//
// Usage:  node tools/qa/pose-search.mjs [input.html] <area> <part-key,part-key,...>
//         e.g. node tools/qa/pose-search.mjs bay bay:battery,bay:dipstick   (input defaults to dist/index.html)
import { launchChrome, fileUrl, DEFAULT_HTML } from "../lib/chrome.mjs";

const argv = process.argv.slice(2);
const html = argv[0]?.endsWith(".html") ? argv.shift() : DEFAULT_HTML;
const [area, keyList] = argv;
if (!area || !keyList) {
  console.error("usage: node tools/qa/pose-search.mjs [input.html] <area> <part-key,part-key,...>");
  process.exit(1);
}
const browser = await launchChrome({ protocolTimeout: 1800000, extraArgs: ["--window-size=200,150"] });
const page = await browser.newPage();
await page.setViewport({ width: 320, height: 200 });
page.on("pageerror", (e) => console.log("PAGEERR", e.message));
await page.goto(fileUrl(html, "instant&area=" + area), { waitUntil: "load" });
await page.waitForFunction("window.__ready === true", { timeout: 600000 });
const out = await page.evaluate(
  async (keys, area) => {
    const { THREE, carRoot, renderer } = app.ctx;
    renderer.shadowMap.enabled = false; // nothing is rendered; skip the shadow pass
    const view = app.areas.get(area).inst.view;
    carRoot.updateMatrixWorld(true);
    const vis = (o) => {
      for (let q = o; q; q = q.parent) if (!q.visible) return false;
      return true;
    };
    const partOf = (o) => {
      for (let q = o; q; q = q.parent) if (q.userData.part) return q.userData.part;
      return null;
    };
    // a hit counts only on visible, mostly opaque meshes (see-through glass and ghosted parts don't block)
    const solid = (h) => {
      const m = Array.isArray(h.object.material) ? h.object.material[0] : h.object.material;
      return h.object.isMesh && vis(h.object) && !(m?.transparent && m.opacity < 0.6) && m?.visible !== false;
    };
    const ray = new THREE.Raycaster();
    const all = [];
    carRoot.traverse((o) => {
      if (o.isMesh && vis(o)) all.push(o);
    });
    const res = {};
    const vDir = new THREE.Vector3(...view.pos).sub(new THREE.Vector3(...view.target)).normalize(); // car frame
    for (const key of keys) {
      const meshes = all.filter((o) => o.userData.part === key);
      if (!meshes.length) {
        res[key] = "no mesh";
        continue;
      }
      const box = new THREE.Box3();
      for (const m of meshes) box.expandByObject(m);
      // about 24 sample points spread over the part's vertices (world frame)
      const pts = [];
      const v = new THREE.Vector3();
      for (const m of meshes) {
        const pos = m.geometry.attributes.position;
        const step = Math.max(1, Math.floor(pos.count / Math.ceil(24 / meshes.length)));
        for (let i = 0; i < pos.count; i += step) {
          v.fromBufferAttribute(pos, i);
          m.localToWorld(v);
          pts.push(v.clone());
        }
      }
      const cW = box.getCenter(new THREE.Vector3());
      const cL = carRoot.worldToLocal(cW.clone());
      const size = box.getSize(new THREE.Vector3()).length();
      // grid search: elevation 10–80°, azimuth every 30°, two distances; score = visible fraction, nudged toward
      // the area's own view direction, higher elevations and closer cameras
      let best = null;
      for (let el = 10; el <= 80; el += 14)
        for (let az = 0; az < 360; az += 30)
          for (const d of [Math.max(0.9, size * 1.8), 1.5]) {
            const dir = new THREE.Vector3(
              Math.cos((az * Math.PI) / 180) * Math.cos((el * Math.PI) / 180),
              Math.sin((az * Math.PI) / 180) * Math.cos((el * Math.PI) / 180),
              Math.sin((el * Math.PI) / 180),
            );
            const pL = cL.clone().add(dir.clone().multiplyScalar(d)); // car frame
            if (pL.z < 0.1) continue; // keep the camera above the floor
            // skip positions inside the body (except above the open engine bay)
            const inBody = Math.abs(pL.x) < 0.9 && pL.y > -2.35 && pL.y < 2.32 && pL.z < 1.47;
            const overBay = pL.y > 1.05 && pL.y < 2.1 && pL.z > 0.98 && Math.abs(pL.x) < 0.9;
            if (inBody && !overBay) continue;
            const pW = carRoot.localToWorld(pL.clone());
            let ok = 0;
            for (const p of pts) {
              const q = p.clone().add(pW.clone().sub(p).normalize().multiplyScalar(0.003));
              const dv = q.clone().sub(pW);
              const dist = dv.length();
              ray.set(pW, dv.normalize());
              ray.far = dist + 0.5;
              const hit = ray.intersectObjects(all, false).find(solid);
              if (hit && (partOf(hit.object) === key || hit.distance >= dist - 0.004)) ok++;
            }
            const frac = ok / pts.length;
            const score = frac + 0.25 * dir.dot(vDir) + 0.1 * Math.min(1, el / 40) - 0.05 * d;
            if (!best || score > best.score)
              best = {
                score: +score.toFixed(3),
                frac: +frac.toFixed(2),
                pos: pL.toArray().map((x) => +x.toFixed(2)),
                target: cL.toArray().map((x) => +x.toFixed(3)),
                el,
                az,
                d: +d.toFixed(2),
              };
          }
      res[key] = best;
      await new Promise((r) => setTimeout(r, 0));
    }
    return res;
  },
  keyList.split(","),
  area,
);
for (const [k, v] of Object.entries(out)) console.log(k, JSON.stringify(v));
await browser.close();
