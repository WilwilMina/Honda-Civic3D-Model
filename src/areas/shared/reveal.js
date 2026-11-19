// Helper for the areas' reveal(partKey) hooks: makes a temporary change so a focused part can be seen
// (ghosts the parts in front of it, opens a lid…) and undoes it by itself once that part is no longer
// selected or the area is left. Used by the bay, chassis and under areas; not an area itself (not in index.js).
import { isSelected } from "../../core/materials.js";

// Create one reveal tracker for `area`. Call its update(dt) from the area's update().
export function tempReveal(ctx, area) {
  let cur = null; // { key, ghosts, undo, t }
  const api = {
    // ghost `ghosts` (part keys) and/or run `undo()` later, for as long as `key` stays selected in `area`
    set(key, { ghosts = [], opacity = 0.15, undo = null } = {}) {
      api.clear();
      if (ghosts.length) ctx.ghost(ghosts, true, opacity);
      cur = { key, ghosts, undo, t: 0 };
    },
    // undo the current reveal now
    clear() {
      if (!cur) return;
      const c = cur;
      cur = null;
      if (c.ghosts.length) ctx.ghost(c.ghosts, false);
      c.undo?.();
    },
    // call every frame; the short grace period covers the moment before the core paints the new selection
    update(dt) {
      if (!cur) return;
      cur.t += dt;
      if (cur.t > 0.6 && (ctx.current !== area || !isSelected(cur.key))) api.clear();
    },
    // part key of the active reveal, or null
    get key() {
      return cur?.key || null;
    },
  };
  return api;
}
