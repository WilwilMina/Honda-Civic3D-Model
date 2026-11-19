// The bottom control bar: turns the open area's `controls` list (see docs/ARCHITECTURE.md) into buttons,
// toggles, button groups, sliders and free HTML boxes. The UI rebuilds it whenever the area changes.
// Hooks put back on the control objects so areas can update them: slider.set(v), button/toggle.refresh(),
// html.el (the box to fill).
import { esc, $ } from "./util.js";

// Replace the contents of `container` with widgets for `list`.
export function renderControls(container, list) {
  container.innerHTML = "";
  for (const c of list) {
    if (c.type === "slider") {
      const w = document.createElement("label");
      w.className = "ui-slider";
      w.innerHTML = `<span>${esc(c.label)}</span><input type="range" min="${c.min}" max="${c.max}" step="${c.step || 1}" value="${c.value ?? c.min}"><output></output>`;
      const inp = $("input", w),
        out = $("output", w);
      const show = () => (out.textContent = c.format ? c.format(+inp.value) : inp.value);
      inp.oninput = () => {
        c.onInput(+inp.value);
        show();
      };
      c.set = (v) => {
        inp.value = v;
        show();
      };
      show();
      container.appendChild(w);
    } else if (c.type === "html") {
      const w = document.createElement("div");
      w.className = "ui-html " + (c.className || "");
      w.innerHTML = c.html || "";
      c.el = w;
      container.appendChild(w);
    } else if (c.type === "group") {
      // a row of mutually exclusive buttons
      const w = document.createElement("div");
      w.className = "ui-btngroup";
      w.innerHTML = c.options
        .map(
          (o) =>
            `<button type="button" aria-pressed="${o.value === c.value}" data-v="${esc(o.value)}">${esc(o.label)}</button>`,
        )
        .join("");
      w.onclick = (e) => {
        const b = e.target.closest("[data-v]");
        if (!b) return;
        w.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        c.onChange(b.dataset.v);
      };
      container.appendChild(w);
    } else {
      // "button" or "toggle" (a toggle shows a status dot and can swap to labelOn)
      const b = document.createElement("button");
      b.type = "button";
      b.className = "ui-btn" + (c.type === "toggle" ? " ui-toggle" : "");
      const paint = () => {
        b.setAttribute("aria-pressed", String(!!c.on));
        b.innerHTML = (c.type === "toggle" ? "<i></i>" : "") + esc(c.on && c.labelOn ? c.labelOn : c.label);
      };
      b.onclick = () => {
        if (c.type === "toggle") {
          c.on = !c.on;
          c.onChange?.(c.on);
        } else c.onClick?.();
        paint();
      };
      c.refresh = paint;
      paint();
      container.appendChild(b);
    }
  }
}
