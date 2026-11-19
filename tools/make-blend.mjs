// Turn the exported .glb into a ready-to-open Blender file (.blend).
// Runs tools/make_blend.py inside Blender's Python, either through the `bpy` module (pip install bpy)
// or through a Blender install (5.3 or newer) in background mode. Works from any directory.
//
// Usage:  node tools/make-blend.mjs [input.glb] [output.blend]
//         (defaults: dist/civic-2013-lx.glb and dist/civic-2013-lx.blend; `npm run export:blend` uses these)
// Picks:  BLENDER_PATH (a Blender executable) if set; otherwise python3 with bpy (PYTHON overrides the
//         interpreter); otherwise `blender` on the PATH.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const SCRIPT = join(HERE, "make_blend.py");
const glb = resolve(process.argv[2] || join(ROOT, "dist", "civic-2013-lx.glb"));
const out = resolve(process.argv[3] || join(ROOT, "dist", "civic-2013-lx.blend"));

if (!existsSync(glb)) {
  console.error(`Cannot find ${glb}. Run "npm run export:glb" first.`);
  process.exit(1);
}

// Returns [command, args] for the first available way to run Blender's Python.
function pickRunner() {
  const blenderArgs = ["--background", "--factory-startup", "--python", SCRIPT, "--", glb, out];
  if (process.env.BLENDER_PATH) return [process.env.BLENDER_PATH, blenderArgs];
  const python = process.env.PYTHON || "python3";
  if (spawnSync(python, ["-c", "import bpy"], { stdio: "ignore" }).status === 0)
    return [python, [SCRIPT, "--", glb, out]];
  if (spawnSync("blender", ["--version"], { stdio: "ignore" }).status === 0) return ["blender", blenderArgs];
  console.error(
    "Could not find Blender. Either install the bpy module (pip install bpy), or install Blender 5.3+ and\n" +
      "put it on your PATH or set BLENDER_PATH to the blender executable.",
  );
  process.exit(1);
}

const [cmd, args] = pickRunner();
let log;
try {
  log = execFileSync(cmd, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
} catch (e) {
  console.error((e.stdout || "") + (e.stderr || "") || e.message);
  process.exit(1);
}
// Blender is chatty; show only the summary line and any errors
console.log(
  log
    .split("\n")
    .filter((l) => l.startsWith("saved") || l.includes("Error"))
    .join("\n"),
);
