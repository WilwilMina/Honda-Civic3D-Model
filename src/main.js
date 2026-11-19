// Entry point. Paints a loading card, then boots the app in this order:
//   1. merge every area's learning content into the registry (core/registry.js);
//   2. create the UI shell and the 3D app, and wire them to each other;
//   3. build each area's 3D model (src/areas/index.js; "car" first, the others attach to it);
//   4. start the frame loop and open the area named in the URL hash (default "car").
// URL hash options: area=<id>, part=<area:id>, instant (skip animations and the welcome card), welcome.
import "./styles.css";
import { createApp } from "./core/app.js";
import { createUI } from "./core/ui.js";
import { addData, check } from "./core/registry.js";
import { AREAS, DATA } from "./areas/index.js";
import { installExporter } from "./core/export.js";

// Show a friendly loading card before the heavy model build starts, so there is no blank screen meanwhile.
const loading = document.querySelector(".ui-loading");
const LOADING_CARD =
  '<div class="ui-loadbox"><div class="ui-spin"></div><b>Loading your Civic…</b><span>Building the 3D model. This can take a few seconds.</span></div>';

// The app is built for a laptop or desktop (mouse, wide screen). On a phone or a small touch screen, show a short
// notice first instead of building the heavy 3D model straight away; "Try anyway" continues as normal.
// Skipped in headless tool runs (#instant) so screenshots and exports are unaffected.
const isSmallTouch =
  window.matchMedia("(max-width: 820px)").matches ||
  (window.matchMedia("(pointer: coarse)").matches && window.matchMedia("(max-width: 1100px)").matches);
if (loading && isSmallTouch && !location.hash.includes("instant")) {
  loading.innerHTML =
    '<div class="ui-loadbox ui-mobile">' +
    '<img src="car-preview.jpg" alt="The 3D Civic model with its clickable sections" onerror="this.remove()">' +
    "<b>Best on a laptop or desktop</b>" +
    "<span>This 3D model is made for a bigger screen and a mouse. On a phone it may be slow and hard to use.</span>" +
    '<button type="button" class="ui-mobile-go">Try anyway</button></div>';
  loading.querySelector(".ui-mobile-go").addEventListener("click", () => {
    loading.innerHTML = LOADING_CARD;
    requestAnimationFrame(() => setTimeout(boot, 30));
  });
} else {
  if (loading) loading.innerHTML = LOADING_CARD;
  // Wait one frame (plus a moment) so the browser actually paints the loading card before boot() blocks.
  requestAnimationFrame(() => setTimeout(boot, 30));
}

function boot() {
  // 1. content
  for (const [area, data] of Object.entries(DATA)) addData(area, data);

  // 2. UI and 3D app (each needs the other, so the UI is bound after the app exists)
  const ui = createUI(document.getElementById("ui"));
  const app = createApp(document.getElementById("stage"), ui);
  ui.bind(app);

  // 3. area models; one broken area should not take the whole app down
  for (const def of AREAS) {
    try {
      app.register(def);
    } catch (e) {
      console.error("area failed:", def.id, e);
    }
  }
  // Hooks used by the headless tools (tools/export-glb.mjs, tools/qa): window.app, __exportGLB,
  // __dataProblems (content links to unknown parts) and __ready (set once the first area is open).
  window.app = app;
  installExporter(app);
  window.__dataProblems = check();

  // 4. run (start() also turns off shadows on small meshes, now that every area is built)
  app.start();
  const params = new URLSearchParams(location.hash.slice(1));
  const startArea = params.get("area") || "car";
  app.go(startArea, { instant: params.has("instant") }).then(() => {
    ui.onArea();
    if (params.get("part")) app.select(params.get("part"));
    document.querySelector(".ui-loading")?.remove();
    // short welcome card on the first visit only (skipped in "instant" screenshot runs unless "welcome" is set)
    if (!params.has("instant") || params.has("welcome")) ui.firstRun();
    setTimeout(() => (window.__ready = true), 900);
  });
}
