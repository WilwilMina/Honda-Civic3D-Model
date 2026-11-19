// End-to-end QA walkthrough with real mouse clicks, run in headless Chrome.
// Phases (pick with the 2nd argument, comma-separated):
//   welcome  loading screen, welcome card, "?" help and Esc, welcome not shown again after a reload
//   areas    opens every area from its orange hotspot, clicks a few parts, checks the card, framing and
//            overlapping UI, presses every control, then leaves mid-animation and checks nothing is left open
//   sym      symptom finder: search, one symptom per group, its top cause glows and is framed, "Learn about" links
//   sizes    framing and overlaps at 1920x1080, 1280x720 and 1024x700
// Prints every issue found, the console errors/warnings and the registry's data problems. Screenshots go to
// shots/ (or QA_SHOTS). ONLY=bay,cabin limits the areas phase; NOCARD=1 skips the part card in the sizes phase.
//
// Usage:  node tools/qa/final-qa.mjs [input.html] [phases] [width height]
//         (defaults: dist/index.html, all phases, 1440x900; `npm run qa`)
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { launchChrome, fileUrl, DEFAULT_HTML, ROOT } from "../lib/chrome.mjs";

const html = process.argv[2] || DEFAULT_HTML;
const phases = (process.argv[3] || "welcome,areas,sym,sizes").split(",");
const W = +(process.argv[4] || 1440),
  H = +(process.argv[5] || 900);
const SHOTS = resolve(process.env.QA_SHOTS || join(ROOT, "shots"));
mkdirSync(SHOTS, { recursive: true });
const browser = await launchChrome({
  protocolTimeout: 1800000,
  extraArgs: ["--hide-scrollbars", `--window-size=${W},${H}`],
});
let page = await browser.newPage();
// viewport, timeouts and console/error collection for a (new) page
async function setupPage() {
  page.setDefaultTimeout(600000);
  await page.setViewport({ width: W, height: H });
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning")
      errs.push(`[${tag}] ${m.type()}: ${m.text().slice(0, 300)}`);
  });
  page.on("pageerror", (e) => errs.push(`[${tag}] PAGEERR ${e.message}`));
  page.on("error", (e) => {
    errs.push(`[${tag}] PAGE CRASH ${e.message}`);
    console.log("PAGE CRASH", tag, e.message);
  });
}
await setupPage();
// replace a crashed or wedged page with a new one, loaded and past the welcome card
async function freshPage() {
  try {
    await page.close();
  } catch {}
  page = await browser.newPage();
  await setupPage();
  await load("", true);
  await page.waitForFunction("window.__ready === true", { timeout: 900000, polling: 300 });
  await inject();
  await ev(() => document.querySelector("[data-wok]")?.click());
}
const errs = [],
  issues = [];
let tag = "load";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const bad = (m) => {
  issues.push(`[${tag}] ${m}`);
  log("ISSUE", m);
};
// screenshot at full pixel ratio after two fresh frames (the walkthrough otherwise renders at 0.5x for speed)
const shot = async (n) => {
  const hasApp = await page
    .evaluate(() => {
      if (!window.__qa) return false;
      const r = app.ctx.renderer;
      r.shadowMap.needsUpdate = true;
      r.setPixelRatio(1);
      window.__f0 = window.__fr || 0;
      return true;
    })
    .catch(() => false);
  if (hasApp) await page.waitForFunction("(window.__fr||0) >= window.__f0 + 2", { polling: 100 });
  await page.screenshot({ path: join(SHOTS, `final-${n}.png`) });
  if (hasApp)
    await page.evaluate(() => {
      app.ctx.renderer.setPixelRatio(0.5);
    });
  log("shot", n);
};
const ev = (fn, ...a) => page.evaluate(fn, ...a);

// install window.__qa helpers in the page: tween counter, frame counter, picking that mirrors the core's,
// a click point for a part, framing and overlap checks, and a snapshot of the car's open/closed state
async function inject() {
  await ev(() => {
    const app = window.app,
      ctx = app.ctx,
      THREE = ctx.THREE;
    const q = (window.__qa = {});
    const orig = ctx.tween;
    window.__tw = 0;
    ctx.tween = (s, fn) => {
      window.__tw++;
      return orig(s, fn).finally(() => window.__tw--);
    };
    ctx.renderer.shadowMap.autoUpdate = false;
    ctx.renderer.shadowMap.needsUpdate = true;
    ctx.renderer.setPixelRatio(0.5);
    window.__fr = 0;
    const fc = () => {
      window.__fr++;
      requestAnimationFrame(fc);
    };
    requestAnimationFrame(fc);
    q.calm = () => !app.busy && ctx.controls.enabled && window.__tw === 0;
    q.wheelHome = {};
    for (const w of ["fl", "fr", "rl", "rr"]) {
      const g = ctx.car?.wheel?.(w);
      if (g) q.wheelHome[w] = g.position.clone();
    }
    q.vis = (o) => {
      for (let x = o; x; x = x.parent) if (!x.visible) return false;
      return true;
    };
    q.meshes = (key) => {
      const r = [];
      ctx.carRoot.traverse((o) => {
        if (o.isMesh && o.userData.part === key && q.vis(o)) r.push(o);
      });
      return r;
    };
    const ray = new THREE.Raycaster(),
      ndc = new THREE.Vector2();
    q.pick = (cx, cy) => {
      // client coords; mirrors core pickAt
      const r = ctx.renderer.domElement.getBoundingClientRect();
      ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, ctx.camera);
      const chain = app.chainOf(app.current);
      for (const h of ray.intersectObject(ctx.carRoot, true)) {
        const o = h.object;
        if (!q.vis(o) || o.material?.opacity < 0.3) continue;
        let goto = null,
          part = null;
        for (let x = o; x; x = x.parent) {
          if (!goto && x.userData.goto) goto = x.userData.goto;
          if (!part && x.userData.part) part = x.userData.part;
        }
        const pa = part ? part.split(":")[0] : null;
        if (part && pa === app.current) return part;
        if (goto && app.areas.get(goto)?.def.parent === app.current) return "goto:" + goto;
        if (part && chain.includes(pa)) continue;
        if (goto && !part) continue;
        if (part || goto) return "block:" + (part || goto);
      }
      return null;
    };
    // a screen point (client coords) where a real click would select key
    q.pixelFor = (key) => {
      ctx.carRoot.updateMatrixWorld(true);
      const el = ctx.renderer.domElement,
        r = el.getBoundingClientRect();
      const pts = [];
      const v = new THREE.Vector3();
      const ms = q.meshes(key);
      const box = new THREE.Box3();
      for (const m of ms) {
        box.expandByObject(m);
        const pos = m.geometry.attributes.position;
        const step = Math.max(1, Math.floor(pos.count / Math.ceil(16 / ms.length)));
        for (let i = 0; i < pos.count; i += step) {
          v.fromBufferAttribute(pos, i);
          m.localToWorld(v);
          pts.push(v.clone());
        }
      }
      if (!ms.length) return null;
      const c = box.getCenter(new THREE.Vector3());
      pts.push(c);
      const toS = (p) => {
        const s = p.clone().project(ctx.camera);
        return s.z > 1 || Math.abs(s.x) > 0.97 || Math.abs(s.y) > 0.97
          ? null
          : [r.left + (s.x * 0.5 + 0.5) * r.width, r.top + (-s.y * 0.5 + 0.5) * r.height];
      };
      const cs = toS(c) || [r.width / 2, r.height / 2];
      // pull vertex points 25% toward the centre so we click inside the part, not on its edge
      const cands = pts
        .map(toS)
        .filter(Boolean)
        .map(([x, y]) => [x + (cs[0] - x) * 0.25, y + (cs[1] - y) * 0.25]);
      cands.sort((a, b) => Math.hypot(a[0] - cs[0], a[1] - cs[1]) - Math.hypot(b[0] - cs[0], b[1] - cs[1]));
      let n = 0;
      for (const [x, y] of cands) {
        if (++n > 10) break;
        if (document.elementFromPoint(x, y) !== el) continue;
        if (q.pick(x, y) === key) return [x, y];
      }
      return null;
    };
    // how the selected part sits on screen: fraction of its box corners inside the visible canvas (not under the panel)
    q.framing = (key) => {
      const ms = q.meshes(key);
      if (!ms.length) return null;
      const el = ctx.renderer.domElement,
        r = el.getBoundingClientRect();
      const panel = document.querySelector("[data-panel]");
      const pr = panel && !panel.hidden ? panel.getBoundingClientRect() : null;
      const box = new THREE.Box3();
      for (const m of ms) box.expandByObject(m);
      const c = box.getCenter(new THREE.Vector3()).project(ctx.camera);
      const cx = r.left + (c.x * 0.5 + 0.5) * r.width,
        cy = r.top + (-c.y * 0.5 + 0.5) * r.height;
      const camIn = ms.some((m) => new THREE.Box3().setFromObject(m).containsPoint(ctx.camera.position));
      return {
        cx: Math.round(cx),
        cy: Math.round(cy),
        onScreen: cx > 0 && cy > 0 && cx < (pr ? pr.left : r.right) && cy < r.bottom,
        underPanel: !!pr && cx > pr.left,
        camInside: camIn,
        dist: +ctx.camera.position.distanceTo(ctx.controls.target).toFixed(2),
      };
    };
    q.state = () => {
      const car = ctx.car,
        wheels = {};
      for (const w in q.wheelHome) wheels[w] = +car.wheel(w).position.distanceTo(q.wheelHome[w]).toFixed(3);
      const ghosted = [];
      ctx.carRoot.traverse((o) => {
        if (o.isMesh && o.userData.part && q.vis(o)) {
          const m = Array.isArray(o.material) ? o.material[0] : o.material;
          if (m?.userData?.ghostSaved && m.transparent && m.opacity < 0.5 && !m.userData.ghostSaved.t)
            ghosted.push(o.userData.part);
        }
      });
      return {
        cur: app.current,
        hood: +(car.hood ?? 0).toFixed(3),
        trunk: +(car.trunk ?? 0).toFixed(3),
        doors: Object.fromEntries(
          Object.entries(car.doors || {}).map(([k, d]) => [k, +(d.angle || 0).toFixed(3)]),
        ),
        lift: +ctx.carRoot.position.z.toFixed(3),
        wheels,
        engVisible: app.areas.get("engine").inst.group?.visible,
        ghosted: [...new Set(ghosted)].slice(0, 8),
        bay: app.areas.get("bay").inst.status?.(),
      };
    };
    q.overlaps = () => {
      const R = (e) => e.getBoundingClientRect();
      const out = [];
      const panel = document.querySelector("[data-panel]");
      const pr = !panel.hidden ? R(panel) : null;
      const ctl = [...document.querySelectorAll("[data-controls] > *")]
        .filter((e) => e.offsetParent)
        .map((e) => ({ e, r: R(e) }));
      const inter = (a, b) =>
        a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
      for (let i = 0; i < ctl.length; i++) {
        const a = ctl[i].r;
        if (pr && inter(a, pr)) out.push("control under panel: " + ctl[i].e.textContent.trim().slice(0, 30));
        if (a.left < 0 || a.right > innerWidth || a.bottom > innerHeight || a.top < 0)
          out.push("control off-screen: " + ctl[i].e.textContent.trim().slice(0, 30));
        for (let j = i + 1; j < ctl.length; j++)
          if (inter(a, ctl[j].r))
            out.push(
              "controls overlap: " +
                ctl[i].e.textContent.trim().slice(0, 20) +
                " / " +
                ctl[j].e.textContent.trim().slice(0, 20),
            );
      }
      for (const s of ["[data-crumbs]", ".ui-tools", "[data-status]", "[data-hint]"]) {
        const e = document.querySelector(s);
        if (e && e.offsetParent && pr && inter(R(e), pr) && e.textContent.trim())
          out.push(s + " under panel");
      }
      const tools = document.querySelector(".ui-tools");
      if (tools && pr && inter(R(tools), pr)) out.push("tools under panel");
      const box = document.querySelector("[data-controls]");
      if (box && ctl.length) {
        const br = R(box);
        if (br.right > (pr ? pr.left : innerWidth) + 1)
          out.push(`controls bar right ${Math.round(br.right)} > panel left ${pr && Math.round(pr.left)}`);
      }
      const spots = [...document.querySelectorAll(".ui-spot")]
        .filter((e) => !e.hidden)
        .map((e) => ({ t: e.textContent, r: R(e.querySelector("span")) }));
      for (let i = 0; i < spots.length; i++)
        for (let j = i + 1; j < spots.length; j++)
          if (inter(spots[i].r, spots[j].r))
            out.push("spot labels overlap: " + spots[i].t + " / " + spots[j].t);
      for (const s of spots) {
        if (pr && inter(s.r, pr)) out.push("spot label under panel: " + s.t);
        for (const c of ctl) if (inter(s.r, c.r)) out.push("spot label over controls: " + s.t);
      }
      return out;
    };
  });
}
// wait until no area change, camera flight or tween is running (3 checks in a row)
async function calm(max = 15000) {
  const t0 = Date.now();
  await sleep(250);
  let n = 0;
  while (Date.now() - t0 < max) {
    if (await ev(() => window.__qa.calm())) {
      if (++n >= 3) return true;
    } else n = 0;
    await sleep(120);
  }
  return false;
}
// open the app (optionally via about:blank to drop all state)
async function load(hash, fresh) {
  if (fresh) {
    await page.goto("about:blank");
  }
  await page.goto(fileUrl(html, hash), {
    waitUntil: "domcontentloaded",
    timeout: 900000,
  });
}
// open an area by clicking its orange hotspot dot with the mouse, like a user
async function spotClick(id) {
  const lbl = await ev((id) => app.areas.get(id).inst.hotspot.label, id);
  const r = await ev((lbl) => {
    const d = [...document.querySelectorAll(".ui-spot")].find((x) => !x.hidden && x.title === "Open: " + lbl);
    if (!d) return null;
    const b = d.querySelector("i").getBoundingClientRect();
    return [b.left + b.width / 2, b.top + b.height / 2, d.classList.contains("far")];
  }, lbl);
  if (!r) {
    bad(`no hotspot for ${id}`);
    await ev((id) => app.go(id), id);
    return;
  }
  if (r[2]) log(`note: hotspot ${id} is 'far' (behind geometry)`);
  const at = await ev((x, y) => document.elementFromPoint(x, y)?.closest(".ui-spot")?.title, r[0], r[1]);
  if (at !== "Open: " + lbl) bad(`hotspot dot for ${id} covered by ${at}`);
  await page.mouse.click(r[0], r[1]);
  await sleep(300);
  await calm();
  const cur = await ev(() => app.current);
  if (cur !== id) bad(`clicking ${id} dot went to ${cur}`);
}
// after leaving an area everything it opened must be closed again: list what isn't
const sanity = (s) => {
  const b = [],
    c = s.cur;
  if (c !== "bay" && c !== "engine" && s.hood > 0.001) b.push(`hood=${s.hood}`);
  if (c !== "trunk" && s.trunk > 0.001) b.push(`trunk=${s.trunk}`);
  if (c !== "cabin")
    for (const [k, v] of Object.entries(s.doors)) if (Math.abs(v) > 0.001) b.push(`door ${k}=${v}`);
  if (c !== "under" && s.lift !== 0) b.push(`lift=${s.lift}`);
  if (c !== "chassis")
    for (const [k, v] of Object.entries(s.wheels)) if (v > 0.002) b.push(`wheel ${k} off ${v}`);
  if (c !== "engine" && s.engVisible) b.push("engine internals visible");
  if (s.ghosted.length) b.push("ghosted: " + s.ghosted.join(","));
  if (c !== "bay" && c !== "engine" && s.bay && !/off/i.test(s.bay)) b.push("bay status: " + s.bay);
  return b;
};

// ============================================================ phase: welcome / loading
if (phases.includes("welcome")) {
  tag = "welcome";
  await load("", true);
  await sleep(150);
  // read the DOM before taking the screenshot: on a slow (software-rendered) machine the screenshot can wait
  // until the model has finished building, by which time the loading screen is already gone
  const ld = await ev(
    () => !!document.querySelector(".ui-loading") && document.querySelector(".ui-loading").textContent,
  );
  await shot(`${W}-loading`);
  log("loading screen:", ld);
  if (!ld) bad("no loading screen visible right after load");
  await page.waitForFunction("window.__ready === true", { timeout: 900000, polling: 300 });
  await inject();
  const wv = await ev(() => !document.querySelector("[data-welcome]").hidden);
  if (!wv) bad("welcome card not shown on first open");
  await shot(`${W}-welcome`);
  await page.click("[data-wok]");
  await sleep(400);
  if (!(await ev(() => document.querySelector("[data-welcome]").hidden))) bad("Got it did not close welcome");
  await shot(`${W}-car`);
  log("car overlaps:", await ev(() => __qa.overlaps()));
  await page.click("[data-help]");
  await sleep(400);
  if (await ev(() => document.querySelector("[data-welcome]").hidden)) bad("? did not reopen welcome");
  await page.keyboard.press("Escape");
  await sleep(300);
  if (!(await ev(() => document.querySelector("[data-welcome]").hidden))) bad("Esc did not close welcome");
  // reload: welcome should NOT show again (stored)
  await load("", false);
  await page.waitForFunction("window.__ready === true", { timeout: 900000, polling: 300 });
  await inject();
  log("welcome on 2nd open:", await ev(() => !document.querySelector("[data-welcome]").hidden));
}

// ============================================================ phase: areas
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;
const AREAS = [
  ["bay", "car"],
  ["engine", "bay"],
  ["chassis", "car"],
  ["trunk", "car"],
  ["cabin", "car"],
  ["lights", "car"],
  ["under", "car"],
];
if (phases.includes("areas")) {
  if (!phases.includes("welcome")) {
    await page.evaluateOnNewDocument(() => {
      const raf = window.requestAnimationFrame.bind(window);
      let first = true;
      window.requestAnimationFrame = (f) => {
        if (first) {
          first = false;
          return setTimeout(() => raf(f), 2500);
        }
        return raf(f);
      };
    });
    await load("", true);
    await sleep(700);
    await shot(`${W}-loading`);
    await page.waitForFunction("window.__ready === true", { timeout: 900000, polling: 300 });
    await inject();
    await ev(() => document.querySelector("[data-wok]")?.click());
  }
  for (const [id, parent] of AREAS) {
    if (ONLY && !ONLY.includes(id)) continue;
    tag = id;
    try {
      // hotspots are only drawn for children of the open area, so open the parent first (e.g. bay for engine)
      if ((await ev(() => app.current)) !== parent) {
        await ev((p) => app.go(p), parent);
        await calm();
      }
      await spotClick(id);
      await sleep(400);
      await shot(`${W}-${id}`);
      const ov = await ev(() => __qa.overlaps());
      if (ov.length) bad("overlaps: " + ov.join(" | "));
      const ctls = await ev(() =>
        [...document.querySelectorAll("[data-controls] > *")].map((e) => e.textContent.trim().slice(0, 30)),
      );
      log(id, "controls:", JSON.stringify(ctls));
      // parts
      const keys = await ev((id) => {
        const s = new Set();
        app.ctx.carRoot.traverse((o) => {
          if (o.isMesh && o.userData.part?.startsWith(id + ":") && __qa.vis(o)) s.add(o.userData.part);
        });
        return [...s];
      }, id);
      let done = 0,
        tried = 0;
      const order = keys
        .map((k, i) => [k, (i * 7919) % 101])
        .sort((a, b) => a[1] - b[1])
        .map((x) => x[0]); // deterministic spread
      for (const key of order) {
        if (done >= 3 || tried >= 8) break;
        const px = await ev((k) => __qa.pixelFor(k), key);
        if (!px) continue; // not clickable from this view (e.g. rear lamps from the front): costs no click
        tried++;
        await page.mouse.move(px[0], px[1]);
        await sleep(150);
        await page.mouse.click(px[0], px[1]);
        await calm();
        await sleep(300);
        const r = await ev(
          (k) => ({
            sel: app.selected,
            tabs: document.querySelectorAll("[data-card] [data-tab]").length,
            h2: document.querySelector("[data-card] h2")?.textContent,
            back: document.querySelector("[data-backlink]").textContent,
            fr: __qa.framing(k),
            html: /<[a-z]/i.test(document.querySelector("[data-card] .ui-short")?.textContent || ""),
          }),
          key,
        );
        if (r.sel !== key) {
          bad(`click on ${key} selected ${r.sel}`);
          continue;
        }
        if (r.tabs < 2) bad(`${key} card has ${r.tabs} tabs`);
        if (r.html) bad(`${key} card shows raw html`);
        if (!r.fr?.onScreen || r.fr?.camInside) bad(`${key} framing ${JSON.stringify(r.fr)}`);
        log("part", key, r.h2, JSON.stringify(r.fr));
        if (done === 0) await shot(`${W}-${id}-part`);
        // close: alternate back link / Escape
        if (done % 2 === 0) await page.click("[data-backlink]");
        else await page.keyboard.press("Escape");
        await calm();
        await sleep(200);
        const after = await ev(() => ({ sel: app.selected, cur: app.current }));
        if (after.sel || after.cur !== id) bad(`after closing ${key}: ${JSON.stringify(after)}`);
        done++;
      }
      if (done < 2) bad(`only ${done} parts clickable from the view (clicked ${tried} of ${keys.length})`);
      // reset view
      await ev(() => {
        const { camera } = app.ctx;
        camera.position.add(new app.ctx.THREE.Vector3(0.6, 0.4, 0.3));
      });
      await page.click("[data-reset]");
      await calm();
      const err = await ev(() => {
        const inst = app.areas.get(app.current).inst,
          c = app.ctx;
        const p = c.carRoot.localToWorld(new c.THREE.Vector3(...inst.view.pos));
        return +c.camera.position.distanceTo(p).toFixed(3);
      });
      if (err > 0.02) bad(`reset view off by ${err}`);
      // controls: click every button/toggle with the real mouse; group options; sliders
      const n = ctls.length;
      for (let i = 0; i < n; i++) {
        const info = await ev((i) => {
          const e = document.querySelectorAll("[data-controls] > *")[i];
          return {
            cls: e.className,
            txt: e.textContent.trim().slice(0, 30),
            nb: e.querySelectorAll("button").length,
          };
        }, i);
        if (/ui-slider/.test(info.cls)) {
          await ev((i) => {
            const inp = document.querySelectorAll("[data-controls] > *")[i].querySelector("input");
            inp.value = +inp.max * 0.37;
            inp.dispatchEvent(new Event("input"));
          }, i);
          await sleep(600);
        } else if (/ui-btngroup/.test(info.cls)) {
          for (let j = info.nb - 1; j >= 0; j--) {
            await page.click(`[data-controls] > :nth-child(${i + 1}) button:nth-child(${j + 1})`);
            await sleep(700);
          }
        } else if (/ui-btn/.test(info.cls)) {
          await page.click(`[data-controls] > :nth-child(${i + 1})`);
          await sleep(1600);
          await calm(8000);
          if (i < 3 || /light|fuse/i.test(info.txt)) await shot(`${W}-${id}-ctl${i}`);
        }
      }
      log(id, "status:", await ev(() => document.querySelector("[data-status]").textContent));
      // mid-animation leave: click the first toggle/button again, then leave immediately
      const firstBtn = await ev(() =>
        [...document.querySelectorAll("[data-controls] > *")].findIndex((e) => /ui-btn/.test(e.className)),
      );
      if (firstBtn >= 0) {
        await page.click(`[data-controls] > :nth-child(${firstBtn + 1})`);
        await sleep(250);
      }
      await page.keyboard.press("Escape");
      await calm();
      await sleep(1200);
      if (id === "engine") {
        await ev(() => app.go("car"));
        await calm();
        await sleep(800);
      }
      const st = await ev(() => __qa.state());
      const b = sanity(st);
      if (b.length) bad(`after leaving ${id} mid-animation: ${b.join("; ")}`);
      log("left", id, "->", st.cur, b.length ? "BAD" : "clean");
    } catch (e) {
      bad("EXCEPTION " + e.message.slice(0, 200));
      await freshPage();
    }
  }
}

// ============================================================ phase: sym (symptom finder)
if (phases.includes("sym")) {
  tag = "sym";
  if (!(await ev(() => !!window.__qa))) {
    await load("", true);
    await page.waitForFunction("window.__ready === true", { timeout: 900000, polling: 300 });
    await inject();
    await ev(() => document.querySelector("[data-wok]")?.click());
  }
  await ev(() => app.go("car"));
  await calm();
  await page.click('[data-mode="problems"]');
  await sleep(400);
  for (const w of ["noise", "light", "smell"]) {
    await page.click("[data-q]", { clickCount: 3 });
    await page.keyboard.type(w);
    await sleep(400);
    const n = await ev(() => document.querySelectorAll("[data-chips] [data-sym]").length);
    log(`search "${w}":`, n);
    if (!n) bad(`search ${w} found nothing`);
    await shot(`${W}-search-${w}`);
  }
  await page.click("[data-q]", { clickCount: 3 });
  await page.keyboard.press("Backspace");
  await sleep(300);
  const groups = await ev(() => [...document.querySelectorAll(".ui-sgroup")].map((d) => d.dataset.g));
  log("groups:", groups.join(" | "));
  let gi = 0;
  for (const g of groups) {
    tag = "sym:" + g;
    // back to list
    if (await ev(() => !document.querySelector("[data-backlink]").hidden)) {
      await page.click("[data-backlink]");
      await sleep(300);
    }
    if (
      await ev(() => document.querySelector('[data-mode="problems"]').getAttribute("aria-pressed") !== "true")
    ) {
      await page.click('[data-mode="problems"]');
      await sleep(300);
    }
    await ev((g) => {
      const d = [...document.querySelectorAll(".ui-sgroup")].find((x) => x.dataset.g === g);
      d.open = true;
      d.scrollIntoView({ block: "center" });
    }, g);
    await sleep(200);
    const sid = await ev((g) => {
      const d = [...document.querySelectorAll(".ui-sgroup")].find((x) => x.dataset.g === g);
      const b = d.querySelectorAll("[data-sym]");
      const pick = b[Math.min(b.length - 1, 1)];
      pick.scrollIntoView({ block: "center" });
      return pick.dataset.sym;
    }, g);
    await page.click(`[data-chips] [data-sym="${sid}"]`);
    await sleep(500);
    await calm();
    await sleep(1500);
    await calm();
    const r = await ev((sid) => {
      const card = document.querySelector("[data-card]");
      const top = card.querySelector(".ui-cause [data-part]")?.dataset.part;
      const m = __qa.meshes(top)[0];
      const mat = m && (Array.isArray(m.material) ? m.material[0] : m.material);
      return {
        cur: app.current,
        sel: app.selected,
        top,
        glow: mat?.emissive?.getHex().toString(16),
        fr: top && __qa.framing(top),
        title: card.querySelector("h2")?.textContent,
      };
    }, sid);
    if (r.sel !== r.top) bad(`symptom ${sid}: selected ${r.sel} != top ${r.top}`);
    if (r.glow !== "ff8a1f") bad(`symptom ${sid}: top ${r.top} not glowing (${r.glow})`);
    if (!r.fr?.onScreen || r.fr?.camInside) bad(`symptom ${sid}: top framing ${JSON.stringify(r.fr)}`);
    log("sym", sid, r.title, "->", r.cur, r.top, r.glow, JSON.stringify(r.fr));
    if (gi < 3 || gi % 3 === 0) await shot(`${W}-sym-${gi}`);
    // Learn about: prefer a cause in another area
    const link = await ev(() => {
      const ls = [...document.querySelectorAll("[data-card] .ui-learn")];
      const far = ls.find((l) => l.classList.contains("ui-far"));
      const l = far || ls[0];
      const i = ls.indexOf(l);
      l.closest("details").open = true;
      l.scrollIntoView({ block: "center" });
      return { k: l.dataset.part, i, far: !!far };
    });
    await sleep(200);
    await page.click(`[data-card] .ui-learn[data-part="${link.k}"]`);
    await sleep(500);
    await calm();
    await sleep(1200);
    await calm();
    const r2 = await ev(
      (k) => ({
        cur: app.current,
        sel: app.selected,
        back: document.querySelector("[data-backlink]").textContent,
        fr: __qa.framing(k),
      }),
      link.k,
    );
    const wantArea = link.k.split(":")[0];
    if (r2.sel !== link.k || r2.cur !== wantArea) bad(`Learn about ${link.k}: now ${r2.cur}/${r2.sel}`);
    if (!r2.fr?.onScreen || r2.fr?.camInside) bad(`Learn about ${link.k}: framing ${JSON.stringify(r2.fr)}`);
    log(
      "  learn",
      link.k,
      link.far ? "(other area)" : "",
      "->",
      r2.cur,
      r2.sel,
      r2.back,
      JSON.stringify(r2.fr),
    );
    if (gi === 1) await shot(`${W}-sym-learn`);
    // back to symptom then list
    await page.click("[data-backlink]");
    await sleep(500);
    await calm();
    gi++;
  }
  await ev(() => app.go("car"));
  await calm();
  const st = await ev(() => __qa.state());
  const b = sanity(st);
  if (b.length) bad("after symptoms: " + b.join("; "));
}

// ============================================================ phase: sizes (framing at other viewports)
if (phases.includes("sizes")) {
  tag = "sizes";
  if (!(await ev(() => !!window.__qa))) {
    await load("", true);
    await page.waitForFunction("window.__ready === true", { timeout: 900000, polling: 300 });
    await inject();
    await ev(() => document.querySelector("[data-wok]")?.click());
  }
  await ev(() => {
    if (document.querySelector('[data-mode="explore"]').getAttribute("aria-pressed") !== "true")
      document.querySelector('[data-mode="explore"]').click();
  });
  for (const [w, h, list] of [
    [1920, 1080, ["car", "bay", "cabin"]],
    [1280, 720, ["car", "bay", "engine", "cabin"]],
    [1024, 700, ["car"]],
  ]) {
    await page.setViewport({ width: w, height: h });
    await sleep(600);
    for (const a of list) {
      tag = `sizes:${w}:${a}`;
      if (a === "car") {
        await ev(() => app.go("car"));
        await calm();
      } else {
        const par = await ev((a) => app.areas.get(a).def.parent, a);
        if ((await ev(() => app.current)) !== par) {
          await ev((p) => app.go(p), par);
          await calm();
        }
        await spotClick(a);
      }
      await sleep(400);
      const ov = await ev(() => __qa.overlaps());
      if (ov.length) bad("overlaps: " + ov.join(" | "));
      await shot(`${w}x${h}-${a}`);
    }
    if (process.env.NOCARD) continue;
    // one part card at this size
    tag = `sizes:${w}:card`;
    const px = await ev(() =>
      __qa.pixelFor(
        [
          "cabin:speedo",
          ...[
            ...new Set(
              (() => {
                const s = [];
                app.ctx.carRoot.traverse((o) => {
                  if (o.isMesh && o.userData.part?.startsWith(app.current + ":")) s.push(o.userData.part);
                });
                return s;
              })(),
            ),
          ],
        ].find((k) => __qa.pixelFor(k)),
      ),
    );
    if (px) {
      await page.mouse.click(px[0], px[1]);
      await calm();
      await sleep(400);
      await shot(`${w}x${h}-card`);
      const ov = await ev(() => __qa.overlaps());
      if (ov.length) bad("overlaps(card): " + ov.join(" | "));
      await page.keyboard.press("Escape");
      await calm();
    }
  }
}

tag = "end";
const dp = await ev(() => (window.__dataProblems || []).length);
console.log("\n==== ISSUES (" + issues.length + ")\n" + issues.join("\n"));
console.log("==== CONSOLE errors/warnings (" + errs.length + ")\n" + errs.join("\n"));
console.log("dataProblems=" + dp);
await browser.close();
