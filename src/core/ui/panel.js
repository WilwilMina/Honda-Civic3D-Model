// HTML builders for the side panel in "Explore parts" mode: the overview chips (sections to open, parts by
// job), the area intro card, the "parts by job" card and the part card with its four tabs. They only read the
// registry and return strings; core/ui.js decides what to show and handles the clicks ([data-*] attributes).
import { PARTS, SYSTEMS, SYMPTOMS, VIDEOS, STARTS, GUIDES } from "../registry.js";
import { esc, safeUrl, firstSentence, rest } from "./util.js";

// `view` arguments below are {current, label, lastTab}: the open area id, label(areaId) -> display name,
// and the part-card tab the user last picked (kept when moving between parts).

// A collapsible card section; empty bodies are left out.
const section = (title, body, open = true) =>
  body
    ? `<details class="ui-sec"${open ? " open" : ""}><summary>${title}</summary><div class="ui-sec-body">${body}</div></details>`
    : "";

// A link button to a part; parts in another area are marked with that area's name.
export const partBtn = (k, { current, label }) =>
  PARTS[k]
    ? `<button type="button" class="ui-link${PARTS[k].area !== current ? " ui-far" : ""}" data-part="${k}">${esc(PARTS[k].name)}${PARTS[k].area !== current ? ` <small>${esc(label(PARTS[k].area))}</small>` : ""}</button>`
    : "";

// Tab strip + panes; tabs without a body are dropped, and the last-used tab stays open if present.
function tabs(list, lastTab) {
  const shown = list.filter((t) => t.body);
  const pick = shown.find((t) => t.id === lastTab) ? lastTab : shown[0]?.id;
  return `<div class="ui-tabs" role="tablist">${shown.map((t) => `<button type="button" role="tab" data-tab="${t.id}" title="${esc(t.title || "")}" aria-selected="${t.id === pick}">${t.label}${t.badge ? ` <i>${t.badge}</i>` : ""}</button>`).join("")}</div>${shown.map((t) => `<div class="ui-pane" data-pane="${t.id}"${t.id === pick ? "" : " hidden"}>${t.body}</div>`).join("")}`;
}

// Overview chips: child areas to open (same as the orange dots) and the area's "parts by job" systems.
export function exploreChipsHTML(areas, { current }) {
  const children = [...areas.values()].filter(({ def }) => def.parent === current);
  const sys = SYSTEMS[current] || [];
  const title = current === "car" ? "Pick a section to look inside" : "Look closer";
  return (
    (children.length
      ? `<div class="ui-group"><div class="ui-group-label">${title}</div><div class="ui-row">${children.map(({ def, inst }) => `<button type="button" class="ui-chip ui-area" data-go="${def.id}"><i class="ui-dot"></i>${esc(inst.hotspot?.label || def.label)} →</button>`).join("")}</div>${current === "car" ? '<p class="ui-hint">Same as the orange dots on the car.</p>' : ""}</div>`
      : "") +
    (sys.length
      ? `<div class="ui-group"><div class="ui-group-label">Parts by job</div><div class="ui-row">${sys.map((s) => `<button type="button" class="ui-chip" data-sys="${s.id}">${esc(s.label)}</button>`).join("")}</div></div>`
      : "")
  );
}

// Keys of the open area's parts that belong to system `id` (they glow blue while its card is open).
export const systemParts = (id, current) =>
  Object.values(PARTS)
    .filter((p) => p.area === current && (p.sys || []).includes(id))
    .map((p) => p.id);

// The part card: name and one-line summary, then tabs What it does / Care / Problems / DIY.
export function partCardHTML(key, view) {
  const p = PARTS[key];
  // the first word decides the colour, e.g. "Medium – with a lift" -> "medium"
  const diyKey = String(p.diy || "")
    .toLowerCase()
    .split(/[–-]/)[0]
    .trim();
  const diyText =
    {
      easy: "Easy — a beginner can do this with basic tools.",
      medium: "Medium — doable with some tools and patience; follow a guide.",
      hard: "Hard — needs special tools or experience; most people use a shop.",
      no: "Leave this to a shop.",
    }[diyKey] || "";
  // connected parts, both directions
  const links = new Set(p.links || []);
  for (const q of Object.values(PARTS)) if ((q.links || []).includes(key)) links.add(q.id);
  links.delete(key);
  const related = SYMPTOMS.filter((s) => s.causes.some((c) => c.part === key));
  const vids = VIDEOS[key] || [];
  const guide = GUIDES[key];
  const what =
    section("How it works", rest(p.what) ? `<p>${esc(rest(p.what))}</p>` : "") +
    section("Your car's numbers", p.spec ? `<p>${esc(p.spec)}</p>` : "") +
    section(
      `Works together with <i>${links.size}</i>`,
      links.size
        ? `<p class="ui-hint">These glow blue on the model. Click one to jump to it.</p><div class="ui-row">${[...links].map((k) => partBtn(k, view)).join("")}</div>`
        : "",
      links.size <= 4,
    );
  const care =
    section("How to check it", p.check ? `<p>${esc(p.check)}</p>` : "") +
    section("Good to know", p.tip ? `<p>${esc(p.tip)}</p>` : "");
  const probs =
    section("Signs it's going bad", p.trouble ? `<p>${esc(p.trouble)}</p>` : "") +
    section(
      `Problems it can cause <i>${related.length}</i>`,
      related.length
        ? `<p class="ui-hint">Click one to see all its causes.</p><div class="ui-row">${related.map((s) => `<button type="button" class="ui-link ui-symlink" data-sym="${s.id}">${esc(s.label)}</button>`).join("")}</div>`
        : "",
    );
  const diy =
    (diyText ? `<p class="ui-diy" data-diy="${diyKey}">${esc(diyText)}</p>` : "") +
    (guide
      ? section(
          esc(guide.title || "Step by step"),
          `<ol class="ui-steps">${guide.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>`,
        )
      : "") +
    (vids.filter((v) => safeUrl(v.url)).length
      ? section(
          "Watch how to do it",
          `<div class="ui-vids">${vids
            .filter((v) => safeUrl(v.url))
            .map(
              (v) =>
                `<a class="ui-video" href="${esc(safeUrl(v.url))}" target="_blank" rel="noopener">▶ ${esc(v.label)} <span>${esc(v.site)}</span></a>`,
            )
            .join("")}</div>`,
        )
      : "");
  return (
    `<div class="ui-head"><div class="ui-kicker">${esc(view.label(p.area))}</div><h2>${esc(p.name)}</h2><p class="ui-short">${esc(firstSentence(p.what))}</p></div>` +
    tabs(
      [
        {
          id: "what",
          label: "What it does",
          title: "How it works and what it's connected to",
          body: what || `<p>${esc(p.what)}</p>`,
        },
        { id: "care", label: "Care", title: "How to check it yourself", body: care },
        {
          id: "problems",
          label: "Problems",
          title: "Signs it's failing and the problems it causes",
          body: probs,
          badge: related.length || "",
        },
        {
          id: "diy",
          label: "DIY",
          title: "DIY = do it yourself: can you fix it at home? Steps and videos",
          body:
            diy &&
            `<p class="ui-hint ui-diyhint">DIY means “do it yourself”: can you fix this at home?</p>${diy}`,
          badge: vids.length || guide ? "▶" : "",
        },
      ],
      view.lastTab,
    )
  );
}

// "Parts by job" card for system `id` of the open area, or null if the area has no such system.
export function systemCardHTML(id, view) {
  const s = (SYSTEMS[view.current] || []).find((x) => x.id === id);
  if (!s) return null;
  const ids = systemParts(id, view.current);
  return `<div class="ui-head"><div class="ui-kicker">${esc(view.label(view.current))} · parts by job</div><h2>${esc(s.label)}</h2><p class="ui-short">${esc(s.blurb)}</p></div><div class="ui-sub">These parts glow blue on the model · click one</div><div class="ui-row ui-pad">${ids.map((k) => partBtn(k, view)).join("")}</div>`;
}

// The "You are here" intro card of the open area (from its content START).
export function startCardHTML(view) {
  const st = STARTS[view.current];
  if (!st)
    return `<div class="ui-head"><h2>${esc(view.label(view.current))}</h2><p class="ui-short">Click any part to learn about it.</p></div>`;
  return (
    `<div class="ui-head"><div class="ui-kicker">You are here</div><h2>${esc(view.label(view.current))}</h2><p class="ui-short">${esc(st.lead)}</p></div>` +
    (st.how ? `<div class="ui-how"><b>What you can do here</b>${esc(st.how)}</div>` : "") +
    `<div class="ui-pad0">${(st.sections || []).map((x, i) => section(esc(x.title), x.html, i === 0)).join("")}</div>` +
    (st.foot ? `<p class="ui-foot">${esc(st.foot)}</p>` : "")
  );
}
