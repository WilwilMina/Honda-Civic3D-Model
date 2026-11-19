// "Inside the engine" intro card: what the cutaway shows, the four strokes, the R18 engine's key numbers and the
// maintenance that protects the inside of the engine. Re-exported by ../content.js as START.

export const START = {
  lead: "This is a see-through look inside your 1.8-liter engine. The four cylinders run in slow motion as soon as you open it: press Pause, or drag the slider to step through it.",
  how: "The color above each piston shows its stroke: blue intake, dark blue compression, orange power, gray exhaust. Click any part to learn about it.",
  sections: [
    {
      title: "The four strokes",
      html: '<ol class="ui-steps"><li><b>Intake:</b> piston goes down, intake valves open, the air-fuel mix is pulled in.</li><li><b>Compression:</b> valves shut, piston goes up and squeezes the mix.</li><li><b>Power:</b> the spark plug fires and the burn shoves the piston down. This is what moves the car.</li><li><b>Exhaust:</b> exhaust valves open and the piston pushes the burned gas out.</li></ol><p>That takes two crank turns. With the cylinders taking turns (firing order 1-3-4-2), one is always on its power stroke.</p>',
    },
    {
      title: "Your R18 engine in one look",
      html: "<ul><li>1.8 L (1,798 cc), 4 cylinders in a row, 140 hp at 6,500 rpm, 128 lb-ft (pound-feet of twisting force), redline (highest safe engine speed) 6,700 rpm</li><li>81 mm bore (cylinder width) × 87.3 mm stroke (piston travel), 10.6:1 compression</li><li>SOHC 16-valve: one camshaft on top (single overhead cam), rocker arms, 4 valves per cylinder, economy i-VTEC (Honda mentions no cam phasing)</li><li>Exhaust manifold cast into the head, facing the front of the car; the catalytic converter bolts straight onto it</li><li>Timing <b>chain</b> (no scheduled replacement)</li></ul>",
    },
    {
      title: "Maintenance for the inside of the engine",
      html: '<table class="ui-minder"><tr><td>A/B</td><td>Oil change when the Minder asks (0W-20, about 3.9 qt with filter). This one habit protects every part here.</td></tr><tr><td>Often</td><td>Check the dipstick about every other fill-up</td></tr><tr><td>4</td><td>Minder code 4: replace spark plugs, check valve clearance</td></tr><tr><td>!</td><td>Never ignore the red oil light or the red high-temperature light</td></tr></table>',
    },
  ],
  foot: "Shapes are simplified and the valves are drawn straight up for clarity. Piston travel follows the real 87.3 mm stroke (the rod length is approximate), and the valves open when they should. Exhaust valves are on the front side, as Honda describes. Which end is cylinder 1 isn't confirmed by our sources; it's drawn at the timing-chain end, as on many Honda engines.",
};
