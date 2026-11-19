// Small helpers shared by the UI modules (core/ui.js and core/ui/*): HTML escaping, link checking,
// DOM lookup, sentence splitting and a localStorage wrapper that never throws.

// Escape text for use inside HTML (content and attribute values).
export const esc = (t) =>
  String(t ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Only https:// links are ever rendered; anything else becomes "".
export const safeUrl = (u) => (/^https:\/\//i.test(String(u || "")) ? String(u) : "");

// querySelector shorthand.
export const $ = (s, r = document) => r.querySelector(s);

// First sentence of a text (up to the first . ! or ?), and everything after it.
export const firstSentence = (t) => {
  const m = String(t || "").match(/^.*?[.!?](\s|$)/);
  return m ? m[0].trim() : String(t || "");
};
export const rest = (t) => {
  const s = String(t || "");
  const m = s.match(/^.*?[.!?](\s|$)/); // same match as firstSentence, but sliced by its untrimmed length
  return m ? s.slice(m[0].length).trim() : "";
};

// localStorage that fails quietly (file:// pages and private windows may refuse it).
export const store = {
  get(k) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* file:// or private mode */
    }
  },
};
