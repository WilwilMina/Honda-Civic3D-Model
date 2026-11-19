// Engine bay intro card: the orientation text, the 5 owner checks, the Maintenance Minder code table and the
// flow-colour legend shown when you first open the hood. Re-exported by ../content.js as START.

export const START = {
  lead: "This is the engine bay, as if you're standing at the front bumper with the hood up. The drive belt is on the passenger-side end of the engine. The battery and air box are on the driver side.",
  how: "Drag to look around, and click any part to learn about it. Press Start the engine to watch air, coolant, electricity and the belt move.",
  sections: [
    {
      title: "The 5 things to check yourself",
      html: "<ul><li><b>Engine oil</b>: orange dipstick, 0W-20</li><li><b>Coolant</b>: see-through reservoir, MIN–MAX, check cold</li><li><b>Brake fluid</b>: black cap on the firewall, MIN–MAX</li><li><b>Washer fluid</b>: blue cap</li><li><b>Transmission fluid</b>: yellow loop dipstick (check warm, per Honda's steps)</li></ul><p>There's no power-steering fluid: this Civic has electric power steering.</p>",
    },
    {
      title: "Maintenance Minder codes (the service codes on your dash)",
      html: '<table class="ui-minder"><tr><td>A</td><td>Replace engine oil</td></tr><tr><td>B</td><td>Oil and oil filter, plus a brake and fluid inspection</td></tr><tr><td>1</td><td>Rotate tires</td></tr><tr><td>2</td><td>Replace engine air filter and cabin filter, inspect the drive belt</td></tr><tr><td>3</td><td>Replace transmission fluid (Honda ATF DW-1)</td></tr><tr><td>4</td><td>Replace spark plugs, inspect valve clearance</td></tr><tr><td>5</td><td>Replace engine coolant</td></tr></table><p>Codes combine, so <b>B12</b> means oil + filter + tire rotation + filters. Brake fluid is separate: every 3 years.</p>',
    },
    {
      title: "What the moving colors mean",
      html: '<div class="ui-row" style="gap:6px 14px;display:flex;flex-wrap:wrap"><span style="color:#7d8fa6">● air</span><span style="color:#2f86e6">● coolant</span><span style="color:#d98a12">● electricity</span><span style="color:#13a9a9">● refrigerant (A/C on)</span></div><p>Press <b>Start the engine</b>: the belt and pulleys turn, the fans spin, and colors move along the hoses and cables. Turn on the A/C to see the compressor clutch lock on.</p>',
    },
  ],
  foot: "Shapes and exact positions are simplified for learning. Only open the radiator cap when the engine is cold.",
};
