// HTML builders for the side panel's "Something wrong?" mode: the searchable symptom list (grouped into
// collapsible kinds of problem) and the symptom card listing its possible causes, most likely first.
// core/ui.js shows them and handles the clicks.
import { PARTS, SYMPTOMS } from "../registry.js";
import { esc } from "./util.js";
import { partBtn } from "./panel.js";

// What each urgency level tells the driver.
const URG = {
  stop: "Stop driving — get it checked now",
  soon: "Get it checked soon",
  watch: "Keep an eye on it",
};
// Display order of the symptom groups (unknown groups go last).
const GROUP_ORDER = [
  "Warning lights",
  "Noises",
  "Smoke & smells",
  "Leaks & fluids",
  "Braking",
  "How it drives",
  "Starting & electrical",
  "Lights & visibility",
  "Tires & wheels",
  "Comfort",
];

// Does symptom `s` match every search word? Searches its label, group, detail and its causes' part names;
// a plural word ("noises") also matches its singular.
function symMatches(s, words) {
  if (!words.length) return true;
  const hay = [s.label, s.group, s.detail, ...s.causes.map((c) => PARTS[c.part]?.name)]
    .join(" ")
    .toLowerCase();
  return words.every(
    (w) => hay.includes(w) || (w.length > 3 && w.endsWith("s") && hay.includes(w.slice(0, -1))),
  );
}

// The symptom list for search text `query`. Groups in `openGroups` start open (all do while searching).
export function symptomListHTML(query, openGroups) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const groups = new Map();
  for (const s of SYMPTOMS) {
    if (!symMatches(s, words)) continue;
    const g = s.group || "Other";
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(s);
  }
  // indexOf -1 (unknown group) becomes 98, so those sort after the known ones
  const order = [...groups.keys()].sort(
    (a, b) => ((GROUP_ORDER.indexOf(a) + 99) % 99) - ((GROUP_ORDER.indexOf(b) + 99) % 99),
  );
  return order.length
    ? (words.length ? "" : '<div class="ui-group-label ui-sg-title">Or pick a kind of problem</div>') +
        order
          .map(
            (g) =>
              `<details class="ui-sgroup" data-g="${esc(g)}"${words.length || openGroups.has(g) ? " open" : ""}><summary>${esc(g)} <i>${groups.get(g).length}</i></summary><div class="ui-row">${groups
                .get(g)
                .map(
                  (s) =>
                    `<button type="button" class="ui-chip" data-u="${s.urgency}" data-sym="${s.id}" title="${esc(URG[s.urgency])}">${esc(s.label)}</button>`,
                )
                .join("")}</div></details>`,
          )
          .join("")
    : `<p class="ui-empty">Nothing matches “${esc(query)}”. Try a simpler word like <b>noise</b>, <b>smell</b>, <b>light</b> or <b>leak</b>.</p>`;
}

// The symptom card. `view` is {current, label}: causes in the open area say which colour they glow,
// causes elsewhere name their area.
export function symptomCardHTML(id, view) {
  const s = SYMPTOMS.find((x) => x.id === id);
  const { current, label } = view;
  return (
    `<div class="ui-head"><div class="ui-kicker">${esc(s.group || "Symptom")}</div><h2>${esc(s.label)}</h2><span class="ui-urg" data-u="${s.urgency}">${URG[s.urgency]}</span>${s.detail ? `<p class="ui-short">${esc(s.detail)}</p>` : ""}</div>` +
    `<div class="ui-sub">Possible causes — most likely first</div><div class="ui-causes">${s.causes
      .map(
        (c, i) =>
          `<details class="ui-cause"${i === 0 ? " open" : ""}><summary><b>${i + 1}</b><span>${esc(PARTS[c.part]?.name || c.part)}</span>${PARTS[c.part]?.area === current ? `<em>${i === 0 ? "glows orange" : "glows blue"}</em>` : `<em class="ui-elsewhere">${esc(label(PARTS[c.part]?.area))}</em>`}</summary><div class="ui-sec-body"><p>${esc(c.why)}</p><p class="ui-check"><b>How to check:</b> ${esc(c.check)}</p>${partBtn(
            c.part,
            view,
          )
            .replace("ui-link", "ui-link ui-learn")
            .replace(/(data-part="[^"]+">)/, "$1Learn about: ")}</div></details>`,
      )
      .join("")}</div>` +
    (s.note ? `<div class="ui-note">${esc(s.note)}</div>` : "")
  );
}
