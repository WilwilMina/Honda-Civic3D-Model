// The static HTML of the UI shell, written into #ui once by createUI() (core/ui.js): top bar (breadcrumbs,
// hint line, view tools), hotspot layer, hover tooltip, bottom control bar, side panel, and the welcome/help
// card. Everything dynamic is filled into the [data-*] hooks later.

// Simple mouse picture for the welcome card; `which` ("left" | "wheel" | "right") is drawn orange.
const mouse = (
  which,
) => `<svg viewBox="0 0 30 42" width="30" height="42" aria-hidden="true"><rect x="1.5" y="1.5" width="27" height="39" rx="13.5" fill="#fff" stroke="#3d3e42" stroke-width="2"/>
  ${which === "left" ? '<path d="M15 1.5v14H1.5V15A13.5 13.5 0 0 1 15 1.5z" fill="#ff8a1f"/>' : ""}${which === "right" ? '<path d="M15 1.5v14h13.5V15A13.5 13.5 0 0 0 15 1.5z" fill="#ff8a1f"/>' : ""}
  <path d="M1.5 15.5h27M15 1.5v14" stroke="#3d3e42" stroke-width="2"/><rect x="12.5" y="6" width="5" height="7" rx="2.5" fill="${which === "wheel" ? "#ff8a1f" : "#fff"}" stroke="#3d3e42" stroke-width="1.6"/></svg>`;

// circular-arrow icon for the "Reset view" button
const ICON_RESET =
  '<svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true"><path d="M4.2 7.5A6.5 6.5 0 1 1 3.5 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3 3.5v4.5h4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// The whole shell as one HTML string.
export const SHELL_HTML = `
    <div class="ui-top">
      <div class="ui-where">
        <div class="ui-where-row"><nav class="ui-crumbs" data-crumbs aria-label="Where you are"></nav><div class="ui-status" data-status></div></div>
        <div class="ui-hintline" data-hint></div>
      </div>
      <div class="ui-tools">
        <button type="button" class="ui-tool" data-reset title="Fly the camera back to the starting view of this section">${ICON_RESET}<span>Reset view</span></button>
        <button type="button" class="ui-tool ui-help" data-help title="How to use this (help)" aria-label="Help">?</button>
      </div>
    </div>
    <div class="ui-spots" data-spots></div>
    <div class="ui-tip" data-tip hidden></div>
    <div class="ui-controls" data-controls></div>
    <aside class="ui-panel" data-panel>
      <div class="ui-panel-bar">
        <div class="ui-seg" role="group" aria-label="Panel mode"><button type="button" data-mode="explore" aria-pressed="true" title="Learn about the parts">Explore parts</button><button type="button" data-mode="problems" aria-pressed="false" title="Start from a noise, smell, warning light…">Something wrong?</button></div>
        <button type="button" class="ui-collapse" data-collapse title="Hide this panel">›</button>
      </div>
      <div class="ui-scroll" data-scroll>
        <div class="ui-phead" data-phead hidden>
          <h3>What are you noticing?</h3>
          <p>Pick what you see, hear or smell. We'll light up the parts that most often cause it.</p>
          <div class="ui-search"><input type="search" data-q placeholder="Type a word: noise, smell, light, leak…" aria-label="Search symptoms"></div>
          <div class="ui-legend"><span data-u="stop">Stop driving</span><span data-u="soon">Check soon</span><span data-u="watch">Keep an eye on it</span></div>
        </div>
        <button type="button" class="ui-backlink" data-backlink hidden></button>
        <div class="ui-chips" data-chips></div>
        <div class="ui-card" data-card></div>
      </div>
    </aside>
    <button type="button" class="ui-reopen" data-reopen hidden>‹ Show info panel</button>
    <div class="ui-welcome" data-welcome hidden>
      <div class="ui-wbox" role="dialog" aria-modal="true" aria-labelledby="ui-wtitle">
        <div class="ui-kicker">Welcome</div>
        <h2 id="ui-wtitle">Your 2013 Civic LX, in 3D</h2>
        <p class="ui-wlead">Look around your car and learn what each part does. No car knowledge needed.</p>
        <ol class="ui-wsteps">
          <li><b>1</b><div><strong>Spin the car</strong><span>Hold the left mouse button and drag.</span></div></li>
          <li><b>2</b><div><strong>Click an orange dot <i class="ui-wdot"></i></strong><span>It opens a section, like under the hood or the cabin.</span></div></li>
          <li><b>3</b><div><strong>Click any part to learn about it</strong><span>What it does, how to check it, and what can go wrong.</span></div></li>
        </ol>
        <div class="ui-wsym"><span class="ui-wpill">Something wrong?</span><span>Noticed a noise, a smell or a warning light? Use this button in the panel on the right to start from what you notice.</span></div>
        <div class="ui-mice">
          <div>${mouse("left")}<span><b>Left-drag</b>spin</span></div>
          <div>${mouse("wheel")}<span><b>Scroll</b>zoom in / out</span></div>
          <div>${mouse("right")}<span><b>Right-drag</b>move sideways</span></div>
        </div>
        <div class="ui-wfoot"><span><kbd>Esc</kbd> goes back · <b>Reset view</b> if you get lost · <b>?</b> shows this again</span><button type="button" class="ui-wok" data-wok>Got it</button></div>
      </div>
    </div>`;
