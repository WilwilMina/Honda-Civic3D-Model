// Animated flows shown while the engine runs: a slightly fatter, glowing tube over each intake duct, coolant
// hose, power cable and A/C line, with a dash texture that scrolls in the direction the air, coolant, current or
// refrigerant moves. The refrigerant flow only shows with the A/C on. Kit units (see base-model.js).
import * as THREE from "three";
import { canvasTex, uvTube } from "./geometry.js";
import { ENGINE_PARTS } from "./base-model.js";

// Colour and dash speed (kit units / s) of each kind of flow (the intro card in content/intro.js has the legend).
const FLOW = {
  air: { color: 0x9fb0c4, speed: 44 },
  coolant: { color: 0x2f8cff, speed: 26 },
  power: { color: 0xffa424, speed: 70 },
  refrigerant: { color: 0x22d3d3, speed: 34 },
};
// Which shapes.json routes carry which flow.
const FLOW_ROUTES = {
  "air.snorkel": "air",
  "intake.tube": "air",
  "intake.runner0": "air",
  "intake.runner1": "air",
  "intake.runner2": "air",
  "intake.runner3": "air",
  "hose.upper": "coolant",
  "hose.lower": "coolant",
  "cable.pos": "power",
  "cable.starter": "power",
  "cable.alt": "power",
  "ac.high": "refrigerant",
  "ac.low": "refrigerant",
};
// Routes drawn against the flow direction (lower hose: radiator -> engine; snorkel: front inlet -> air box).
const REVERSED = new Set(["hose.lower", "air.snorkel"]);
const DASH_PERIOD = 12; // tube length per dash

// Builds the flow tubes over the given routes (base-model.js output). Tubes on engine-mounted parts go in the
// shaking engine group. Returns an update() that fades them in/out and scrolls the dashes.
export function buildFlows(routes, { kit, engine }) {
  // one soft white dash per repeat; each flow tints it with its material colour
  const dashTex = canvasTex(128, 8, (c, W, H) => {
    c.clearRect(0, 0, W, H);
    const grd = c.createLinearGradient(0, 0, W, 0);
    grd.addColorStop(0, "rgba(255,255,255,0)");
    grd.addColorStop(0.15, "rgba(255,255,255,1)");
    grd.addColorStop(0.45, "rgba(255,255,255,1)");
    grd.addColorStop(0.6, "rgba(255,255,255,0)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = grd;
    c.fillRect(0, 0, W, H);
  });
  const flows = {};
  for (const [kind, f] of Object.entries(FLOW)) {
    const tex = dashTex.clone();
    tex.needsUpdate = true;
    const m = new THREE.MeshBasicMaterial({
      color: f.color,
      map: tex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false,
    });
    flows[kind] = { mat: m, tex, speed: f.speed, level: 0, meshes: [] };
  }
  for (const r of routes) {
    const kind = FLOW_ROUTES[r.name];
    if (!kind) continue;
    const rr = r.r + Math.max(0.35, r.r * 0.12); // just outside the hose or cable
    const pts = REVERSED.has(r.name) ? [...r.points].reverse() : r.points;
    const m = new THREE.Mesh(uvTube(pts, rr, DASH_PERIOD, 12), flows[kind].mat);
    m.raycast = () => {}; // clicks go through to the part underneath
    m.renderOrder = 3;
    m.visible = false;
    m.name = "flow." + r.name;
    (ENGINE_PARTS.has(r.part) ? engine : kit).add(m);
    flows[kind].meshes.push(m);
  }

  return {
    update(dt, running, ac) {
      for (const [kind, f] of Object.entries(flows)) {
        const want = running && (kind !== "refrigerant" || ac) ? 1 : 0;
        f.level += (want - f.level) * Math.min(1, dt * 3);
        if (f.level < 0.01 && !want) f.level = 0;
        f.mat.opacity = 0.95 * f.level;
        const vis = f.level > 0;
        for (const m of f.meshes) m.visible = vis;
        f.tex.offset.x -= (f.speed * dt) / DASH_PERIOD;
      }
    },
  };
}
