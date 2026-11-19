// "Start here" text for the whole car (the root area). Facts from docs/research/exterior.md (Honda spec sheet,
// owner's manuals, parts catalog). The car area has no parts of its own: its sections open the other areas.
export const SYSTEMS = [];
export const PARTS = {};
export const SYMPTOMS = [];
export const VIDEOS = {};
export const START = {
  lead: "This is your 2013 Honda Civic LX sedan in silver. Spin around it, then click an orange dot (or a part of the car) to open that section.",
  how: "Drag to spin · scroll to zoom · right-drag to slide · click an orange dot to go inside.",
  sections: [
    {
      title: "How to explore",
      html: "<ul><li><b>Hood</b> → what's under the hood (engine, battery, fluids).</li><li><b>A wheel</b> → brakes and suspension.</li><li><b>Trunk lid</b> → the trunk and spare tire.</li><li><b>Driver's door</b> → the cabin, dashboard and warning lights.</li><li><b>A headlight, taillight or wiper</b> → lights and wipers.</li></ul><p>Inside a section, click any part to see what it does, how to check it and what goes wrong. <i>Something wrong?</i> lets you start from a symptom instead.</p>",
    },
    {
      title: "Words you'll see",
      html: "<ul><li><b>Maintenance Minder:</b> the car's built-in service reminder on the i-MID screen. It shows a code like <b>B12</b> when service is due.</li><li><b>i-MID:</b> the small info screen next to the speedometer (trip info, warnings and messages).</li><li><b>Key-ON:</b> turning the key to ON. Almost every warning light comes on for a few seconds as a bulb check.</li><li><b>Check-engine light:</b> the amber engine-shaped light. Steady = get it checked soon. Blinking = a misfire: stop somewhere safe.</li><li><b>Misfire:</b> a cylinder isn't firing properly, so the engine shakes or stumbles.</li><li><b>Engine computer (ECM):</b> the car's brain that controls the engine and the automatic transmission.</li><li><b>OBD-II scanner:</b> a code reader that plugs into the port under the dashboard. Many parts stores read codes for free.</li><li><b>Coolant:</b> the engine's cooling liquid. Yours is Honda Type 2, which is blue.</li><li><b>ATF:</b> automatic transmission fluid. Use only Honda ATF DW-1.</li><li><b>Rotor, pads and caliper:</b> the front brakes: the caliper is a clamp that squeezes the pads against the rotor, a metal disc that spins with the wheel.</li><li><b>Drum and shoes:</b> the rear brakes on your LX: curved shoes press outward inside a metal cup (the drum).</li><li><b>Strut:</b> the front shock absorber, with the coil spring around it. It stops the car bouncing after bumps.</li><li><b>ABS / VSA:</b> anti-lock brakes keep the wheels from locking in a hard stop; VSA is Honda's stability control that helps keep the car from sliding.</li><li><b>EPS:</b> electric power steering. An electric motor helps you turn the wheel, so there's no power-steering fluid.</li><li><b>SRS:</b> the airbags and the seat belt tensioners.</li><li><b>TPMS:</b> the tire pressure monitoring system. Its light means one or more tires are low.</li><li><b>lb-ft / lbf·ft (pound-feet):</b> how tight a bolt should be (torque). Example: wheel nuts 80 lb-ft.</li><li><b>Service bulletin (TSB):</b> a repair notice Honda sends to dealers about a known problem. Ask a dealer to check your VIN.</li></ul>",
    },
    {
      title: "Your Civic LX at a glance",
      html: "<ul><li><b>Size:</b> 4.56 m long, 1.75 m wide, 1.44 m tall, 2.67 m between the front and rear wheels.</li><li><b>Weight:</b> about 1,277 kg (2,815 lb) with the automatic.</li><li><b>Ground clearance:</b> about 157 mm (6.2 in) empty.</li><li><b>Wheels and tires:</b> 15-inch steel wheels with silver 5-split-spoke covers held on by the lug nuts; tires P195/65R15. The spare is a small T135/80D15 temporary tire.</li><li><b>Lights:</b> halogen headlights (9006 low beam, 9005 high beam); no fog lights on the LX.</li><li><b>Wipers:</b> 650 mm (26 in) driver, 575 mm (22 in) passenger.</li></ul>",
    },
    {
      title: "Handy to know",
      html: "<ul><li><b>Fuel door:</b> driver's side, at the rear. The release is a handle at the foot of the driver's seat.</li><li><b>Hood:</b> pull the release under the lower left of the dashboard, push up the latch lever in the middle of the hood, then hold it up with the <b>prop rod</b> (there are no gas struts).</li><li><b>Antenna:</b> built into the rear window glass, so there is no antenna mast to break off.</li><li><b>Paint:</b> silver Civics of this year are usually Alabaster Silver Metallic (NH-700M); the darker gray is Polished Metal Metallic (NH-737M). The color label in the driver's door jamb tells you which yours is.</li><li><b>What changed for 2013:</b> new front with a black honeycomb grille and chrome trim, new hood and trunk lid, taillights that continue onto the trunk lid, and a chrome bar across the trunk.</li></ul>",
    },
    {
      title: "Where this information comes from",
      html: "<ul><li><b>Honda first:</b> the 2012–2014 Civic owner's manuals (the 2013 Coupe and 2014 Sedan editions share this car's engine, dash and body), Honda's 2012–2013 Civic Sedan spec sheets and press releases, and Honda's parts catalog for the 2013 Civic LX sedan with the automatic. All fluids, capacities, torque values and service intervals come from these.</li><li><b>Government records:</b> NHTSA's recall and service-bulletin database, for Honda bulletins and investigations on this car (check your own VIN at nhtsa.gov/recalls).</li><li><b>Reference guides:</b> Edmunds and similar auto references, and parts makers' fitment lists (for example the battery size), for a few equipment details.</li><li><b>DIY guides and videos:</b> CarCareKiosk, iFixit, 1A Auto and Paul's Travel Pictures, used for where things are and how a job goes. Where a detail comes only from one of these, the text says so.</li></ul><p><b>Your owner's manual and the labels on your car come first.</b> If anything here disagrees with the manual in your glove box, or with the tire label in the driver's door jamb, go with those. Honda's manual says to see a dealer for most repairs; any qualified repair shop can usually do the same work, while a dealer handles recalls and Honda bulletin repairs.</p>",
    },
  ],
  foot: "The shape is simplified, and some measurements (overhangs, hood and roof heights) are estimates. Lengths, width, height and wheelbase are Honda's numbers.",
};
