// The global content registry: every area's learning text (src/areas/<area>/content.js) merged into one place.
// Area files use short local ids ("battery"); here everything is keyed "area:id" ("bay:battery"), so the UI,
// picking and cross-area links can refer to any part in the app. main.js fills it at boot with addData(),
// then check() reports links that point at parts that don't exist.
export const PARTS = {}; // "bay:battery" -> {name, sys:[...], what, spec, check, trouble, diy, tip, links:[keys], area, id}
export const SYSTEMS = {}; // area -> [{id, label, blurb, area}]
export const SYMPTOMS = []; // [{id:"bay:nostart", area, label, urgency, detail, group, causes:[{part:key, why, check}], note}]
export const VIDEOS = {}; // part key -> [{label, url, site}]
export const STARTS = {}; // area -> {lead, how, sections, foot} (the "You are here" intro card)
export const GUIDES = {}; // part key -> {title, steps:[...]} (optional step-by-step guides)

// Local id -> global key. Ids that already contain ":" point into another area and are kept as they are.
const key = (area, id) => (String(id).includes(":") ? id : `${area}:${id}`);

// Merge one area's content module (its PARTS, SYSTEMS, SYMPTOMS, VIDEOS, GUIDES and START exports).
export function addData(area, data) {
  for (const [id, p] of Object.entries(data.PARTS || {})) {
    PARTS[key(area, id)] = {
      ...p,
      area,
      id: key(area, id),
      // `links` are same-area ids; `cross` lists parts in other areas, already written as "area:id"
      links: (p.links || []).map((l) => key(area, l)).concat(p.cross || []),
    };
  }
  SYSTEMS[area] = (data.SYSTEMS || []).map((s) => ({ ...s, area }));
  for (const s of data.SYMPTOMS || []) {
    SYMPTOMS.push({
      ...s,
      area,
      id: key(area, s.id),
      causes: s.causes.map((c) => ({ ...c, part: key(area, c.part) })),
    });
  }
  for (const [id, v] of Object.entries(data.VIDEOS || {})) VIDEOS[key(area, id)] = v;
  for (const [id, g] of Object.entries(data.GUIDES || {})) GUIDES[key(area, id)] = g;
  if (data.START) STARTS[area] = data.START;
}

// List (and log) every reference to a part key that isn't registered. Returns the problems as strings.
export function check(log = console.warn) {
  const bad = [];
  for (const p of Object.values(PARTS))
    for (const l of p.links) if (!PARTS[l]) bad.push(`${p.id} links unknown ${l}`);
  for (const s of SYMPTOMS)
    for (const c of s.causes) if (!PARTS[c.part]) bad.push(`symptom ${s.id} names unknown ${c.part}`);
  for (const k of Object.keys(VIDEOS)) if (!PARTS[k]) bad.push(`video for unknown ${k}`);
  bad.forEach((b) => log(b));
  return bad;
}
