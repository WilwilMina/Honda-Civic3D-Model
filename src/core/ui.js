// Everything on top of the 3D view, created once by main.js with createUI(): breadcrumbs + hint line, view
// tools, the welcome/help card, hotspot dots, the bottom control bar, and the side panel. The panel has two
// modes: "Explore parts" (overview chips, or one part / "parts by job" card) and "Something wrong?" (symptom
// search, or one symptom card), each with a clear back link. This file holds the panel's state and wiring;
// the HTML comes from core/ui/*. The app calls back into the returned object (onArea, onSelect, onHover…).
import { PARTS, SYMPTOMS } from "./registry.js";
import { $, esc, store } from "./ui/util.js";
import { SHELL_HTML } from "./ui/markup.js";
import { renderControls as buildControls } from "./ui/controls.js";
import { createHotspotLayer } from "./ui/hotspot-layer.js";
import { exploreChipsHTML, systemParts, partCardHTML, systemCardHTML, startCardHTML } from "./ui/panel.js";
import { symptomListHTML, symptomCardHTML } from "./ui/symptoms.js";

const WELCOME_KEY = "civic3d.welcome.v1"; // localStorage flag: the welcome card was dismissed once

// one plain line under the breadcrumb: what you can do right here
const HINTS = {
  car: "Drag to spin the car, then click an orange dot to look inside",
  bay: "Click any part to learn about it · try “Start the engine” below",
  engine: "The engine runs in slow motion · Pause or drag the slider below · click any part",
  chassis: "Click a brake, spring or steering part · buttons below move things",
  trunk: "Click the spare tire, jack or any part · buttons below lift things out",
  cabin: "Click any warning light, gauge or control",
  lights: "Click a light or wiper · buttons below switch them on",
  under: "The car is up on a lift · click any part underneath",
};

// Build the UI inside `root` (#ui). Call bind(app) once the app exists.
export function createUI(root) {
  root.innerHTML = SHELL_HTML;
  const el = {
    crumbs: $("[data-crumbs]", root),
    status: $("[data-status]", root),
    hint: $("[data-hint]", root),
    spots: $("[data-spots]", root),
    tip: $("[data-tip]", root),
    controls: $("[data-controls]", root),
    chips: $("[data-chips]", root),
    card: $("[data-card]", root),
    panel: $("[data-panel]", root),
    scroll: $("[data-scroll]", root),
    phead: $("[data-phead]", root),
    q: $("[data-q]", root),
    back: $("[data-backlink]", root),
    welcome: $("[data-welcome]", root),
  };

  // ---------------------------------------------------------------- panel state
  let app = null;
  let mode = "explore"; // "explore" | "problems"
  let lastTab = "what"; // part-card tab last picked
  let activeSym = null, // symptom card shown (problems mode)…
    symArea = null; // …and the area of its most likely cause
  let activeSys = null; // "parts by job" card shown (explore mode)
  let part = null, // part card shown…
    partFrom = null; // …and the symptom it was opened from (for "back")
  let query = ""; // symptom search text
  const openGroups = new Set(["Warning lights"]); // symptom groups the user has opened (kept while browsing)
  let viewKey = ""; // what the panel showed last; scroll to the top when it changes
  const label = (id) => (id === "car" ? "Whole car" : app.areas.get(id)?.def.label || id);
  const view = () => ({ current: app.current, label, lastTab }); // context for the HTML builders

  // ---------------------------------------------------------------- welcome / help
  const openWelcome = () => {
    el.welcome.hidden = false;
    setTimeout(() => $("[data-wok]", root).focus(), 0);
  };
  const closeWelcome = () => {
    el.welcome.hidden = true;
    store.set(WELCOME_KEY, "1");
  };
  $("[data-wok]", root).onclick = closeWelcome;
  el.welcome.onclick = (e) => {
    if (e.target === el.welcome) closeWelcome(); // click on the dimmed backdrop
  };
  $("[data-help]", root).onclick = openWelcome;
  $("[data-reset]", root).onclick = () => app.resetView?.();

  // ---------------------------------------------------------------- panel collapse + mode switch
  const setPanel = (on) => {
    el.panel.hidden = !on;
    $("[data-reopen]", root).hidden = on;
    root.classList.toggle("panel-off", !on);
    document.body.classList.toggle("panel-off", !on);
  };
  $("[data-collapse]", root).onclick = () => setPanel(false);
  $("[data-reopen]", root).onclick = () => setPanel(true);
  root.querySelectorAll("[data-mode]").forEach(
    (b) =>
      (b.onclick = () => {
        // clicking the active mode again only does something if a card is open (it closes it)
        if (b.dataset.mode === mode && !(mode === "problems" ? activeSym : part || activeSys)) return;
        mode = b.dataset.mode;
        activeSym = null;
        activeSys = null;
        partFrom = null;
        if (app.selected)
          app.select(null, { focus: false }); // clears glow; calls onSelect(null) -> render
        else {
          app.highlight(null, []);
          render();
        }
      }),
  );
  el.q.oninput = () => {
    query = el.q.value;
    renderSymList();
  };
  el.back.onclick = () => back();

  // ---------------------------------------------------------------- back (panel link + Esc key)
  // Steps back one level: close the welcome card, then the open card, then go up one area.
  function back() {
    if (!el.welcome.hidden) return closeWelcome();
    if (mode === "explore" && part) {
      if (partFrom) {
        const s = partFrom;
        partFrom = null;
        app.select(null, { focus: false });
        showSymptom(s);
        return;
      }
      app.select(null, { focus: false });
      app.resetView?.(); // back to this section's starting view
      return;
    }
    if (mode === "explore" && activeSys) {
      activeSys = null;
      app.highlight(null, []);
      render();
      return;
    }
    if (mode === "problems" && activeSym) {
      activeSym = null;
      app.highlight(null, []);
      render();
      return;
    }
    const chain = app.chainOf(app.current);
    if (chain.length > 1) app.go(chain[chain.length - 2]);
  }
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || e.defaultPrevented) return;
    // Esc in the search box first clears it, then leaves it
    if (document.activeElement === el.q && el.q.value) {
      el.q.value = "";
      query = "";
      renderSymList();
      return;
    }
    if (document.activeElement === el.q) el.q.blur();
    else if (document.activeElement?.matches?.("textarea, input:not([type=range])")) return; // typing somewhere else
    back();
  });

  // ---------------------------------------------------------------- breadcrumbs, hint line, controls, status
  function renderCrumbs() {
    const chain = app.chainOf(app.current);
    el.crumbs.innerHTML =
      (chain.length > 1
        ? `<button type="button" class="ui-back" data-go="${chain[chain.length - 2]}" title="Back to ${esc(label(chain[chain.length - 2]))} (Esc)">← Back</button>`
        : "") +
      chain
        .map((id, i) =>
          i === chain.length - 1
            ? `<b>${esc(label(id))}</b>`
            : `<button type="button" data-go="${id}">${esc(label(id))}</button><span>›</span>`,
        )
        .join("");
  }
  el.crumbs.onclick = (e) => {
    const b = e.target.closest("[data-go]");
    if (b) app.go(b.dataset.go);
  };
  function renderHint() {
    const t = part
      ? `Showing: ${PARTS[part]?.name || ""} · click another part, or press Esc to close`
      : activeSym
        ? "The most likely cause glows orange, other causes glow blue"
        : HINTS[app.current] || "Click any part to learn about it";
    if (el.hint.textContent !== t) el.hint.textContent = t;
  }
  function renderControls() {
    buildControls(el.controls, app.areas.get(app.current)?.inst?.controls || []);
  }
  // The area's status() readout is polled a few times a second. Parts mentioning "tap/click" are dropped
  // because the hint line already says what to click.
  setInterval(() => {
    if (!app) return;
    const inst = app.areas.get(app.current)?.inst;
    let s = "";
    try {
      s = inst?.status?.() || "";
    } catch {
      s = "";
    }
    s = s
      .split(" · ")
      .filter((x) => !/\b(tap|click)\b/i.test(x))
      .join(" · ")
      .replace(/^\w+: (tap|click).*$/i, "");
    if (el.status.textContent !== s) el.status.textContent = s;
  }, 150);

  // ---------------------------------------------------------------- hotspots + hover tooltip
  const hotspots = createHotspotLayer(el.spots, (id) => app.go(id));
  function onHover(hit) {
    if (!hit) {
      el.tip.hidden = true;
      return;
    }
    el.tip.hidden = false;
    el.tip.innerHTML = hit.part
      ? `<b>${esc(PARTS[hit.part]?.name)}</b><span>${hit.part === app.selected ? "click to close" : "click to learn"}</span>`
      : `<b>${esc(label(hit.goto))}</b><span>click to open</span>`;
  }
  window.addEventListener("pointermove", (e) => {
    el.tip.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 14}px)`;
  });

  // ---------------------------------------------------------------- panel: overview lists
  function renderSymList() {
    if (mode !== "problems" || activeSym) return;
    el.chips.innerHTML = symptomListHTML(query, openGroups);
  }
  // remember which symptom groups the user opened (not while a search forces them all open)
  el.chips.addEventListener(
    "toggle",
    (e) => {
      const d = e.target;
      if (d.matches?.(".ui-sgroup") && !query.trim()) {
        if (d.open) openGroups.add(d.dataset.g);
        else openGroups.delete(d.dataset.g);
      }
    },
    true, // "toggle" doesn't bubble, so listen in the capture phase
  );
  el.chips.onclick = (e) => {
    const g = e.target.closest("[data-go]"),
      s = e.target.closest("[data-sys]"),
      y = e.target.closest("[data-sym]");
    if (g) app.go(g.dataset.go);
    if (s) showSystem(s.dataset.sys);
    if (y) showSymptom(y.dataset.sym);
  };
  // hovering a section chip makes its orange dot stand out on the car
  el.chips.addEventListener("pointerover", (e) => {
    const g = e.target.closest("[data-go]");
    hotspots.setHighlight(g ? g.dataset.go : null);
  });
  el.chips.addEventListener("pointerleave", () => hotspots.setHighlight(null));

  // ---------------------------------------------------------------- panel: card clicks
  el.card.onclick = (e) => {
    // switch part-card tab (remembered for the next part)
    const t = e.target.closest("[data-tab]");
    if (t) {
      lastTab = t.dataset.tab;
      el.card.querySelectorAll("[data-tab]").forEach((b) => b.setAttribute("aria-selected", String(b === t)));
      el.card.querySelectorAll("[data-pane]").forEach((p) => (p.hidden = p.dataset.pane !== lastTab));
      return;
    }
    // jump to a part (opening its area first if needed); remember the symptom we came from
    const p = e.target.closest("[data-part]");
    if (p) {
      const k = p.dataset.part;
      const a = PARTS[k].area;
      const from = mode === "problems" ? activeSym : partFrom;
      const open = () => {
        app.select(k);
        if (from && part === k) {
          partFrom = from;
          render();
        }
      };
      if (a !== app.current) app.go(a).then((ok) => ok && open());
      else open();
      return;
    }
    const y = e.target.closest("[data-sym]");
    if (y) showSymptom(y.dataset.sym);
  };

  // ---------------------------------------------------------------- actions
  // Open a symptom card, go to the area of its most likely cause, and light up the causes there.
  function showSymptom(id) {
    const s = SYMPTOMS.find((x) => x.id === id);
    if (!s) return;
    mode = "problems";
    activeSym = id;
    activeSys = null;
    const top = s.causes[0].part;
    symArea = PARTS[top].area;
    render();
    const after = () => {
      if (activeSym !== id) return; // the user moved on while the area was changing
      app.highlight(
        top,
        s.causes.slice(1).map((c) => c.part),
      );
      app.focusPart(top);
    };
    if (app.current !== symArea) app.go(symArea).then((ok) => ok && after());
    else after();
  }
  // Open a "parts by job" card and make its parts glow blue.
  function showSystem(id) {
    activeSys = id;
    mode = "explore";
    app.highlight(null, systemParts(id, app.current));
    render();
  }

  // ---------------------------------------------------------------- render the panel for the current state
  function render() {
    root
      .querySelectorAll("[data-mode]")
      .forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.mode === mode)));
    const prob = mode === "problems";
    el.phead.hidden = !prob || !!activeSym;
    let backText = "";
    if (prob) {
      if (activeSym) {
        backText = "← All symptoms";
        el.chips.innerHTML = "";
        el.card.innerHTML = symptomCardHTML(activeSym, view());
      } else {
        renderSymList();
        el.card.innerHTML = "";
      }
    } else if (part && PARTS[part]) {
      const from = partFrom && SYMPTOMS.find((x) => x.id === partFrom);
      backText = from ? `← Back to “${from.label}”` : `← ${label(app.current)}: overview`;
      el.chips.innerHTML = "";
      el.card.innerHTML = partCardHTML(part, view());
    } else if (activeSys) {
      backText = `← ${label(app.current)}: overview`;
      el.chips.innerHTML = "";
      const html = systemCardHTML(activeSys, view());
      if (html === null) activeSys = null; // the system doesn't exist here: fall back to the intro card
      el.card.innerHTML = html ?? startCardHTML(view());
    } else {
      el.chips.innerHTML = exploreChipsHTML(app.areas, view());
      el.card.innerHTML = startCardHTML(view());
    }
    el.back.hidden = !backText;
    el.back.textContent = backText;
    el.back.title = backText ? "Go back (Esc)" : "";
    const key = [mode, app.current, part, activeSym, activeSys].join("|");
    if (key !== viewKey) {
      viewKey = key;
      el.scroll.scrollTop = 0;
    }
    renderHint();
  }

  // ---------------------------------------------------------------- API used by the app and main.js
  return {
    bind(a) {
      app = a;
    },
    // the open area changed (or is changing)
    onArea() {
      if (activeSym && app.current !== symArea) activeSym = null; // left the symptom's section: drop its card
      activeSys = null;
      renderCrumbs();
      renderControls();
      render();
    },
    // a part was selected (key) or the selection cleared (null)
    onSelect(key) {
      const prev = part;
      part = key && PARTS[key] ? key : null;
      if (part) {
        partFrom = mode === "problems" && activeSym ? activeSym : prev ? partFrom : null;
        mode = "explore";
        activeSym = null;
        activeSys = null;
      } else if (mode === "explore") partFrom = null;
      render();
    },
    // dim and lock the controls while an area change animates
    setBusy(b) {
      root.classList.toggle("is-busy", !!b);
      el.controls.inert = !!b;
      el.controls.style.opacity = b ? "0.6" : "";
    },
    onHover,
    drawHotspots: hotspots.draw,
    firstRun() {
      if (!store.get(WELCOME_KEY)) openWelcome();
    },
  };
}
