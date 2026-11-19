// Materials, highlight glow and ghosting for every part.
// Areas create materials with mat() (or re-key existing meshes with claim()). Each part key gets its own
// material instances, recorded in `partMaterials`, so the core can make exactly that part glow (selected,
// connected, hovered) or turn see-through without affecting any other part. Areas reach these via ctx.
// The see-through layers (ghost, area fades, focus mode) all go through applyLook() at the end of this file.
import * as THREE from "three";

// Soft "real-ish" palette, available to areas as ctx.C.
export const C = {
  paint: 0xb7bcc2, // silver metallic
  paintDark: 0x8f959c,
  black: 0x2a2c30, // black plastic trim
  rubber: 0x1c1d1f,
  chrome: 0xd9dee4,
  glass: 0x5d7383,
  steel: 0x8e9398,
  darksteel: 0x5a5f65,
  aluminum: 0xc6c9cd,
  iron: 0x6a6d72,
  cast: 0x7c8086,
  red: 0xc8352d,
  amber: 0xf09a2e,
  lens: 0xeef4f8,
  yellow: 0xf2c230,
  blue: 0x3f7fd6,
  coolant: 0x63b0ff,
  copper: 0xb8733d,
  white: 0xe8e7e2,
  interior: 0x45484d,
  fabric: 0x3a3d43,
  dash: 0x2f3236,
  oil: 0xd29a1c,
  green: 0x30a46c,
  orange: 0xe8742a,
  floor: 0xdedcd6,
};

// Surface presets for mat(color, preset).
const PRESET = {
  paint: { metalness: 0.55, roughness: 0.32 },
  chrome: { metalness: 0.9, roughness: 0.18 },
  rubber: { metalness: 0, roughness: 0.85 },
  glass: { metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.38, depthWrite: false },
  lens: { metalness: 0.05, roughness: 0.1, transparent: true, opacity: 0.75 },
  plastic: { metalness: 0.05, roughness: 0.6 },
  metal: { metalness: 0.45, roughness: 0.45 },
  fabric: { metalness: 0, roughness: 0.95 },
};

const cache = new Map(); // "key|color|preset" (or "key|sourceUuid") -> material, so identical requests share
export const partMaterials = new Map(); // part key -> Set(material)

// mat(color, preset, key): a cached standard material; `key` ties it to a part so it can be highlighted.
export function mat(color = C.steel, preset = "metal", key = "") {
  const id = `${key}|${color}|${preset}`;
  if (cache.has(id)) return cache.get(id);
  const m = new THREE.MeshStandardMaterial({ color, ...(PRESET[preset] || PRESET.metal) });
  if (preset === "glass" || preset === "lens") m.side = THREE.DoubleSide;
  cache.set(id, m);
  if (key) {
    if (!partMaterials.has(key)) partMaterials.set(key, new Set());
    partMaterials.get(key).add(m);
  }
  return m;
}

// Tag every mesh under `object` with the part key and give it that part's own copy of its material.
export function claim(object, key) {
  object.traverse((o) => {
    if (!o.isMesh) return;
    o.userData.part = key;
    const src = o.material;
    if (!src) return;
    const id = `${key}|${src.uuid}`;
    let m = cache.get(id);
    if (!m) {
      m = src.clone();
      m.userData = { ...src.userData };
      cache.set(id, m);
      if (!partMaterials.has(key)) partMaterials.set(key, new Set());
      partMaterials.get(key).add(m);
    }
    o.material = m;
  });
  return object;
}

// ------------------------------------------------------------ highlight glow
// Highlighting is done with the emissive channel only, so areas must not set emissive on part materials.
const GLOW = {
  selected: 0xff8a1f, // orange: the selected part (or a symptom's most likely cause)
  linked: 0x2f6bff, // blue: parts that work together with it (or a symptom's other causes)
  hover: 0x6b7a90, // grey-blue: the part under the mouse
};

// Repaint every part's glow for the current selection state.
export function paintParts(selected, linked, hovered) {
  for (const [k, set] of partMaterials) {
    const on = k === selected,
      link = linked.has(k),
      hov = k === hovered && !on;
    for (const m of set) {
      if (!m.emissive) continue;
      m.emissive.setHex(on ? GLOW.selected : link ? GLOW.linked : hov ? GLOW.hover : 0x000000);
      m.emissiveIntensity = on ? 0.55 : link ? 0.45 : hov ? 0.35 : 0;
    }
  }
}

// Called every frame: the selected part's glow gently pulses (period ≈ 1.6 s, intensity 0.15–0.65).
export function pulseSelected(selected, now) {
  const k = 0.4 + 0.25 * Math.sin(now / 260);
  for (const m of partMaterials.get(selected) || []) if (m.emissive) m.emissiveIntensity = k;
}

// True if the part's materials currently carry the "selected" glow.
export function isSelected(key) {
  for (const m of partMaterials.get(key) || []) if (m.emissive) return m.emissive.getHex() === GLOW.selected;
  return false;
}

// ------------------------------------------------------------ ghosting and layered looks
// Three things can make a material see-through, and they may overlap on the same material:
//   ghost()   - areas ghost blockers (engine cutaway, steering wheel, reveal() helpers): m.userData.ghostOp
//   fadeTo()  - an area's own camera-driven fade (the bay's inner fenders):                m.userData.fadeOp
//   focus     - core/focus.js turns everything but the selected part into a light grey ghost:
//               m.userData.focusK (0..1 fade amount) and m.userData.focusH (0..1 hover brighten)
// None of them writes the material directly. They set their flag and call applyLook(m), which saves the
// material's own values once (m.userData.look0) when the first layer turns on, computes the effective look
// from every active layer, and puts the exact saved values back (and forgets them) when the last layer turns
// off. So the layers can turn on and off in any order without one saving the other's state as "original".

// Focus-mode ghost look (core/focus.js); tune here.
export const FOCUS_OPACITY = 0.22; // opacity of a focus ghost
export const FOCUS_HOVER_OPACITY = 0.4; // ... while the mouse is over it
export const FOCUS_COLOR = new THREE.Color(0xd3d6da); // light neutral grey the ghost's colour blends toward
export const FOCUS_TINT = 0.85; // how far toward FOCUS_COLOR (1 = flat grey; a little of the real colour helps)

// Opacity / transparency from the area layers only (ghost + fade), ignoring focus mode. Picking and the hotspot
// occlusion check use this, so a focus ghost still behaves like the solid part it really is.
export function baseLook(m) {
  const u = m.userData,
    s = u?.look0; // (a material array has no userData: its own fields are returned, undefined)
  if (!s) return { opacity: m.opacity, transparent: m.transparent };
  let o = s.o,
    t = s.t;
  if (u.ghostOp != null) {
    o = u.ghostOp;
    t = true;
  }
  if (u.fadeOp != null) {
    o = Math.min(o, u.fadeOp);
    t = true;
  }
  return { opacity: o, transparent: t };
}

// Recompute and write a material's look from its active layers (see above).
export function applyLook(m) {
  const u = m.userData;
  const k = u.focusK || 0;
  const active = u.ghostOp != null || u.fadeOp != null || k > 0;
  if (!u.look0) {
    if (!active) return; // nothing to do, nothing saved
    u.look0 = { o: m.opacity, t: m.transparent, d: m.depthWrite, c: m.color ? m.color.clone() : null };
  }
  const s = u.look0;
  let { opacity: o, transparent: t } = baseLook(m);
  let d = u.ghostOp != null || u.fadeOp != null ? false : s.d;
  if (k > 0) {
    const target = FOCUS_OPACITY + (FOCUS_HOVER_OPACITY - FOCUS_OPACITY) * (u.focusH || 0);
    o += (Math.min(o, target) - o) * k;
    t = true;
    if (k > 0.3) d = false; // keep depth writes for the first moments of the fade: fewer sorting flickers
  }
  if (m.color && s.c && (k > 0 || u.focusTinted)) {
    m.color.copy(s.c);
    if (k > 0) m.color.lerp(FOCUS_COLOR, k * FOCUS_TINT);
    u.focusTinted = k > 0;
  }
  m.opacity = o;
  m.depthWrite = d;
  if (m.transparent !== t) {
    m.transparent = t;
    m.needsUpdate = true; // the shader's OPAQUE define depends on it
  }
  if (!active) {
    // every layer is off: the exact saved values are back in place
    delete u.look0;
    delete u.focusTinted;
  }
}

// Make parts see-through (on = true) or restore them.
export function ghost(keys, on, opacity = 0.18) {
  for (const k of keys)
    for (const m of partMaterials.get(k) || []) {
      if (on) m.userData.ghostOp = opacity;
      else delete m.userData.ghostOp;
      applyLook(m);
    }
}

// An area's own fade of one material: opacity k (0..1); k >= 0.99 means fully back to normal.
export function fadeTo(m, k) {
  if (k >= 0.99) delete m.userData.fadeOp;
  else m.userData.fadeOp = k;
  applyLook(m);
}
