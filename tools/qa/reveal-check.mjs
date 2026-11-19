// Reveal check: is every clickable part actually visible when it is selected?
// For each part it opens the part's area, selects the part (which runs the area's reveal() hook and the camera
// focus), waits for all motion to stop, then raycasts from the camera to sample points on the part. A part passes
// when its centre is visible and at least 10% of its samples are, or when 30% of its samples are.
// Prints PASS/FAIL per part with the names of the parts that block the view, then a summary.
//
// Usage:  node tools/qa/reveal-check.mjs [input.html] [areas-or-part-keys]
//         e.g. node tools/qa/reveal-check.mjs dist/index.html cabin,bay:battery
//         (defaults: dist/index.html and cabin,chassis,lights,under,trunk,bay; `npm run qa:reveal`)
import { launchChrome, fileUrl, DEFAULT_HTML } from "../lib/chrome.mjs";

const html = process.argv[2] || DEFAULT_HTML;
const filter = (process.argv[3] || "cabin,chassis,lights,under,trunk,bay").split(",");
const browser = await launchChrome({ extraArgs: ["--window-size=640,400"] });
const page = await browser.newPage();
await page.setViewport({ width: 640, height: 400, deviceScaleFactor: 1 });
const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push("pageerror " + e.message));
await page.goto(fileUrl(html, "instant"), { waitUntil: "load" });
await page.waitForFunction("window.__ready === true", { timeout: 120000 });
await page.evaluate(() => {
  app.ctx.renderer.shadowMap.enabled = false;
  // count running area tweens (core flyTo/focus moves show up as controls.enabled === false)
  const orig = app.ctx.tween;
  window.__tw = 0;
  app.ctx.tween = (s, fn) => {
    window.__tw++;
    return orig(s, fn).finally(() => window.__tw--);
  };
  window.__frames = 0;
  const f = () => {
    window.__frames++;
    requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
});
const keys = await page.evaluate((filter) => {
  const s = new Set();
  app.ctx.carRoot.traverse((o) => {
    if (o.isMesh && o.userData.part) s.add(o.userData.part);
  });
  return [...s].filter((k) => filter.includes(k) || filter.includes(k.split(":")[0])).sort();
}, filter);
const results = [];
for (const key of keys) {
  const area = key.split(":")[0];
  const r = await page.evaluate(
    async (key, area) => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const { THREE, camera, carRoot } = app.ctx;
      app.select(null, { focus: false });
      await app.go(area); // also re-centres the area view when the area is already open
      await sleep(200);
      app.select(key);
      // wait until no camera move or area tween is running, over at least two rendered frames
      const t0 = performance.now();
      await sleep(400);
      let calmSince = -1;
      while (performance.now() - t0 < 9000) {
        const calm = app.ctx.controls.enabled && window.__tw === 0;
        if (!calm) calmSince = -1;
        else if (calmSince < 0) calmSince = window.__frames;
        else if (window.__frames - calmSince >= 2) break;
        await sleep(100);
      }
      // a few more frames so per-frame fades (inner fenders, wheel ghost) finish even at very low headless fps
      {
        const f0 = window.__frames;
        while (window.__frames - f0 < 3 && performance.now() - t0 < 14000) await sleep(100);
      }
      carRoot.updateMatrixWorld(true);
      const visibleChain = (o) => {
        for (let q = o; q; q = q.parent) if (!q.visible) return false;
        return true;
      };
      const partOf = (o) => {
        for (let q = o; q; q = q.parent) if (q.userData.part) return q.userData.part;
        return null;
      };
      const solid = (h) => {
        const m = Array.isArray(h.object.material) ? h.object.material[0] : h.object.material;
        return (
          h.object.isMesh &&
          visibleChain(h.object) &&
          !(m?.transparent && m.opacity < 0.6) &&
          m?.visible !== false
        );
      };
      const ray = new THREE.Raycaster();
      const meshes = [];
      carRoot.traverse((o) => {
        if (o.isMesh && o.userData.part === key && visibleChain(o)) meshes.push(o);
      });
      if (!meshes.length) return { key, err: "no visible mesh" };
      let box = new THREE.Box3();
      for (const m of meshes) box.expandByObject(m);
      // a part spread over the car (all four corners…): judge only the piece the camera is looking at, like focusPart
      if (box.getSize(new THREE.Vector3()).length() > 0.9) {
        const ctr = (m) => new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3());
        const tgt = app.ctx.controls.target;
        const near = meshes.slice().sort((a, b) => ctr(a).distanceTo(tgt) - ctr(b).distanceTo(tgt))[0];
        const nc = ctr(near);
        meshes.splice(0, meshes.length, ...meshes.filter((m) => ctr(m).distanceTo(nc) < 0.5));
        box = new THREE.Box3();
        for (const m of meshes) box.expandByObject(m);
      }
      const test = (p) => {
        const ndc = p.clone().project(camera);
        if (Math.abs(ndc.x) > 1 || Math.abs(ndc.y) > 1 || ndc.z > 1) return { ok: false, why: "offscreen" };
        const dir = p.clone().sub(camera.position);
        const dist = dir.length();
        ray.set(camera.position, dir.normalize());
        ray.far = dist + 0.5;
        const hit = ray.intersectObject(carRoot, true).find(solid);
        if (!hit) return { ok: false, why: "nohit" };
        const pk = partOf(hit.object);
        if (pk === key) return { ok: true };
        if (hit.distance >= dist - 0.004) return { ok: true, why: "reached" };
        return { ok: false, why: pk || hit.object.name || "unnamed" };
      };
      const c = box.getCenter(new THREE.Vector3());
      const center = test(c);
      // sample vertices
      let n = 0,
        ok = 0;
      const blockers = {};
      const v = new THREE.Vector3();
      for (const m of meshes) {
        const pos = m.geometry.attributes.position;
        const step = Math.max(1, Math.floor(pos.count / Math.ceil(60 / meshes.length)));
        for (let i = 0; i < pos.count; i += step) {
          v.fromBufferAttribute(pos, i);
          m.localToWorld(v);
          // nudge toward the camera a hair so the vertex's own face doesn't count against it
          const p = v.clone().add(camera.position.clone().sub(v).normalize().multiplyScalar(0.003));
          const t = test(p);
          n++;
          if (t.ok) ok++;
          else blockers[t.why] = (blockers[t.why] || 0) + 1;
        }
      }
      const frac = n ? ok / n : 0;
      const top = Object.entries(blockers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([k, v]) => k + "x" + v)
        .join(",");
      return {
        key,
        center: center.ok ? "ok" : center.why,
        frac: +frac.toFixed(2),
        pass: (center.ok && frac >= 0.1) || frac >= 0.3,
        blockers: top,
      };
    },
    key,
    area,
  );
  results.push(r);
  console.log(
    (r.pass ? "PASS " : "FAIL ") +
      r.key.padEnd(28) +
      " center=" +
      r.center +
      " vis=" +
      r.frac +
      (r.pass ? "" : " blockers=" + r.blockers) +
      (r.err ? " ERR " + r.err : ""),
  );
}
await page.evaluate(async () => {
  app.select(null, { focus: false });
  await app.go("car");
});
const fails = results.filter((r) => !r.pass);
console.log(
  `\n${results.length - fails.length}/${results.length} pass. FAIL: ${fails.map((r) => r.key).join(" ")}`,
);
console.log("console errors:", errors.length, errors.slice(0, 10).join("\n"));
await browser.close();
