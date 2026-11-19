// Export the 3D model to a binary glTF (.glb) file.
// Opens the built app in headless Chrome, calls the exporter the app installs as window.__exportGLB
// (src/core/export.js), and writes the result: every part, named and tagged with its area, plus sampled
// animations (hood, doors, trunk, front wheel, engine running). The .glb is the input for make-blend.mjs.
//
// Usage:  node tools/export-glb.mjs [input.html] [output.glb]
//         (defaults: dist/index.html and dist/civic-2013-lx.glb; `npm run export:glb` uses these)
// Needs:  Chrome or Chromium (set CHROME_PATH if it is not found automatically), and a build (`npm run build`).
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { ROOT, DEFAULT_HTML, launchChrome, fileUrl } from "./lib/chrome.mjs";

const html = process.argv[2] || DEFAULT_HTML;
const out = resolve(process.argv[3] || join(ROOT, "dist", "civic-2013-lx.glb"));

const browser = await launchChrome();
try {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error("page error:", e.message));
  await page.setViewport({ width: 1200, height: 800 });
  // #instant skips the intro animations and the welcome card
  await page.goto(fileUrl(html, "instant"), { waitUntil: "load", timeout: 120000 });
  await page.waitForFunction("window.__ready === true", { timeout: 180000 });
  const res = await page.evaluate(() => window.__exportGLB());
  writeFileSync(out, Buffer.from(res.b64, "base64"));
  console.log("wrote", out, (res.size / 1048576).toFixed(1) + " MB", "clips:", res.clips.join(", "));
} finally {
  await browser.close();
}
