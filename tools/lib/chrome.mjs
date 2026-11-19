// Shared helpers for the headless-browser tools (export-glb.mjs and the qa/ scripts).
// puppeteer-core does not download a browser, so we look for an installed Chrome or Chromium:
// the CHROME_PATH environment variable first, then the usual install locations on Linux, macOS and Windows.
// Rendering uses SwiftShader (software WebGL), so the tools also work on machines and CI runners without a GPU.
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** Repository root (this file lives in tools/lib/). */
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** The built app, used when a tool is run without an HTML path. */
export const DEFAULT_HTML = join(ROOT, "dist", "index.html");

const CANDIDATES = {
  linux: [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
  ],
  darwin: [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ],
  win32: [
    join(process.env.PROGRAMFILES || "C:\\Program Files", "Google\\Chrome\\Application\\chrome.exe"),
    join(
      process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)",
      "Google\\Chrome\\Application\\chrome.exe",
    ),
    join(process.env.LOCALAPPDATA || "", "Google\\Chrome\\Application\\chrome.exe"),
  ],
};

/** Path to a Chrome/Chromium executable, or a clear error explaining how to set CHROME_PATH. */
export function findChrome() {
  const fromEnv = process.env.CHROME_PATH;
  if (fromEnv) {
    if (existsSync(fromEnv)) return fromEnv;
    throw new Error(`CHROME_PATH is set to "${fromEnv}", but there is no file at that path.`);
  }
  const found = (CANDIDATES[process.platform] || []).find((p) => p && existsSync(p));
  if (found) return found;
  throw new Error(
    "Could not find Chrome or Chromium. Install one, or point CHROME_PATH at its executable, e.g.\n" +
      '  CHROME_PATH="/path/to/chrome" npm run export:glb',
  );
}

/** Launch headless Chrome with software WebGL. `extraArgs` are appended to the Chrome command line. */
export async function launchChrome({ extraArgs = [], ...options } = {}) {
  let executablePath;
  try {
    executablePath = findChrome();
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  const args = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", ...extraArgs];
  // Chrome refuses to start its sandbox as root (common in Docker and some CI images)
  if (process.getuid?.() === 0) args.push("--no-sandbox");
  return puppeteer.launch({ executablePath, headless: true, args, ...options });
}

/** file:// URL for an HTML path given on the command line (relative to the current directory). */
export function fileUrl(htmlPath, hash = "") {
  const abs = resolve(htmlPath || DEFAULT_HTML);
  if (!existsSync(abs)) {
    console.error(`Cannot find ${abs}. Run "npm run build" first, or pass the path to a built index.html.`);
    process.exit(1);
  }
  return pathToFileURL(abs).href + (hash ? "#" + hash : "");
}
