// The hotspot layer: one button per orange dot, placed at the screen positions core/hotspot-tracker.js computes
// each frame. Labels sit to the right of their dot and flip to the left when they would cover another
// dot or label. Created by createUI() (core/ui.js).
import { esc } from "./util.js";

// `container` is the [data-spots] layer; onOpen(areaId) runs when a dot is clicked.
export function createHotspotLayer(container, onOpen) {
  const spotEls = new Map(); // area id -> button (kept and re-used; hidden when not in the list)

  // Show the dots in `spots` ([{id, far, label, x, y}]) and hide all others.
  function draw(spots) {
    const seen = new Set();
    for (const s of spots) {
      let d = spotEls.get(s.id);
      if (!d) {
        d = document.createElement("button");
        d.type = "button";
        d.className = "ui-spot";
        d.title = `Open: ${s.label}`;
        d.innerHTML = `<i></i><span>${esc(s.label)}</span>`;
        d.onclick = () => onOpen(s.id);
        container.appendChild(d);
        spotEls.set(s.id, d);
      }
      d.classList.toggle("far", !!s.far);
      seen.add(s.id);
    }
    // place labels left to right; a label's box spans 14–22 px beside the dot plus its text width, 26 px tall
    const vis = [...spots].sort((a, b) => a.x - b.x);
    const boxes = [];
    for (const s of vis) {
      const d = spotEls.get(s.id);
      const w = d._lw || (d._lw = d.querySelector("span").offsetWidth) || 120; // label width, measured once
      const right = { l: s.x + 14, r: s.x + 22 + w, t: s.y - 13, b: s.y + 13 },
        left = { l: s.x - 22 - w, r: s.x - 14, t: s.y - 13, b: s.y + 13 };
      const hits = (bx) =>
        vis.some((o) => o !== s && o.x > bx.l - 14 && o.x < bx.r + 14 && Math.abs(o.y - s.y) < 24) ||
        boxes.some((q) => q.l < bx.r && q.r > bx.l && q.t < bx.b && q.b > bx.t);
      const flip = hits(right) && !hits(left);
      boxes.push(flip ? left : right);
      d.classList.toggle("left", flip);
      d.style.transform = `translate(${(flip ? s.x - w - 8 : s.x).toFixed(1)}px, ${s.y.toFixed(1)}px)`;
    }
    for (const [id, d] of spotEls) d.hidden = !seen.has(id);
  }

  // Make one area's dot stand out (null = none); used while hovering its chip in the panel.
  function setHighlight(areaId) {
    for (const [id, d] of spotEls) d.classList.toggle("hl", id === areaId);
  }

  return { draw, setHighlight };
}
