// Brakes & suspension intro card: the orientation text, the maintenance table and the "your LX in one look" spec
// list shown when the area first opens. Re-exported by ../content.js as START.

export const START = {
  lead: "These are all four corners of your Civic: front disc brakes, rear drum brakes, the springs and struts, and the steering. The driver-side wheels are off, and the rear drum slides off so you can see inside.",
  how: "Click any part to learn about it. Use the buttons to fly to a corner, turn the steering, press the brakes or bounce the car. Under Something wrong? click a symptom and the most likely part lights up, with the next suspects in blue.",
  sections: [
    {
      title: "Maintenance for this part of the car",
      html: '<table class="ui-minder"><tr><td>1</td><td>Minder code 1: rotate the tires</td></tr><tr><td>B</td><td>Every B service: brakes, hoses, suspension and steering are inspected</td></tr><tr><td>3y</td><td>Replace the brake fluid every 3 years</td></tr><tr><td>Month</td><td>Check tire pressures monthly, and tread with the penny test</td></tr><tr><td>Hit</td><td>After a big pothole or curb strike: check the alignment</td></tr></table>',
    },
    {
      title: "Your LX in one look",
      html: "<ul><li><b>Front brakes:</b> 11.1 in ventilated discs (rotors) with a sliding caliper (automatic LX)</li><li><b>Rear brakes:</b> 7.9 in drums with shoes</li><li><b>Brake fluid:</b> DOT 3, replace every 3 years</li><li><b>Suspension:</b> MacPherson struts in front (a shock absorber with the spring around it), multi-link rear (several separate arms per wheel), sway bars at both ends (19 mm / 16 mm)</li><li><b>Steering:</b> rack and pinion with an electric motor on the rack (no fluid), 2.87 turns lock to lock (full left to full right)</li><li><b>Tires:</b> P195/65R15 on 15 in steel wheels with covers. Pressure: the label on the driver's doorjamb</li><li><b>Lug nuts:</b> 80 lb-ft (pound-feet), 108 N·m</li></ul>",
    },
  ],
  foot: "Shapes and positions are simplified (where the rear spring sits, for example). Brakes and steering are safety systems: if you're unsure, have a shop check them. Specs: Honda's 2013 Civic Sedan spec sheet, the owner's manual and Honda's parts catalog.",
};
