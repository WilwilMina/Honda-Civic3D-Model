// Learning content for the "trunk" area.
// Sources: docs/research/chassis.md §5 (2013 Honda spec sheet; 2014 Civic Sedan owner's manual pp. 412-419, same 9th-gen
// body and LX 15-inch wheel; Honda parts catalog "Tools - Jack"), docs/research/exterior.md (lid hinges, lights),
// 2014 Civic Sedan owner's manual p.124 "Emergency Trunk Opener": https://www.manualowl.com/am/Honda/2014-Civic/Manual/8870?page=125
export const SYSTEMS = [
  {
    id: "spare",
    label: "Spare tire & tools",
    blurb: "Everything you need to change a flat is under the trunk floor.",
  },
  {
    id: "lid",
    label: "Trunk lid & opening",
    blurb: "The seal, the latch, and the lever that opens the trunk from inside.",
  },
  {
    id: "access",
    label: "Linings & access",
    blurb: "Carpet panels, the floor lid, and the flaps you open to reach the taillight bulbs.",
  },
];

export const PARTS = {
  "spare-tire": {
    name: 'Spare tire (compact "donut")',
    sys: ["spare"],
    what: "The spare is a small, temporary tire you put on when you get a flat. It's a compact \"donut\" that lies flat in a well under the trunk floor. It only gets you to a tire shop; it isn't meant for normal driving.",
    spec: "T135/80D15 99M on a 15 × 4T black steel wheel. Keep it at 60 psi (420 kPa). Drive under 50 mph (80 km/h). Never put snow chains on it.",
    check:
      "Check its pressure every few months with a gauge. It's easy to forget, and a flat spare is no help.",
    trouble: "Low pressure, cracks in the rubber from age, or a missing spare (check before a road trip).",
    diy: "Easy",
    tip: "With the spare on, the tire-pressure (TPMS) light blinks for about a minute and then stays on. That's normal (2013 Civic manual). Get the full-size tire fixed soon and put it back on. Your 2013 has no owner TPMS calibration button.",
    links: ["hold-down", "jack", "lug-wrench", "floor-board"],
    cross: ["chassis:tire", "chassis:wheel"],
  },
  "hold-down": {
    name: "Spare tire hold-down (wing bolt & spacer cone)",
    sys: ["spare"],
    what: "The wing bolt holds the spare tire down so it can't fly around in a crash. It's a long bolt with a wing-shaped knob that screws down through the middle of the spare wheel, with a cone-shaped spacer.",
    check: "It should be snug when tightened by hand. A loose spare rattles in the back.",
    trouble: "A rattle from the trunk over bumps often means the wing bolt has loosened.",
    diy: "Easy",
    tip: "If you store the flat tire in the well, put it in face-down and flip the spacer cone over on the wing bolt to hold it.",
    links: ["spare-tire"],
  },
  "tool-tray": {
    name: "Tool case (jack & wrench)",
    sys: ["spare"],
    what: "The tool case holds the jack and the wheel-nut wrench you use to change a tire. You lift it out after opening the trunk floor lid.",
    spec: "Honda's tool kit: a pantograph (scissor) jack, a wheel wrench and a jack bar. Its position in the trunk is approximate in this model.",
    check: "Make sure all the pieces are in it before a long trip.",
    trouble: "Missing tools: used cars often lose the jack bar or the wrench.",
    diy: "Easy",
    links: ["jack", "lug-wrench", "spare-tire"],
  },
  jack: {
    name: "Scissor jack",
    sys: ["spare"],
    what: "The jack is a small tool that lifts one corner of the car so you can change a tire. It folds flat. Turning its screw makes the arms close together and push the top up. It's only for changing a tire.",
    spec: 'Honda calls it a "Jack Assy., Pantograph" (a scissor jack). You turn it with the jack bar plus the wheel wrench, which works as the jack handle.',
    check: "Wind it up and down once at home so you know how it works before you need it on a roadside.",
    trouble: "A bent or rusty screw makes it hard to turn. Replace a damaged jack.",
    diy: "Easy",
    tip: "Use the jacking point (the reinforced lifting spot) nearest the flat. Seat the tab under the car in the jack's notch. Never get under the car, and don't let anyone stay inside while it's on the jack.",
    links: ["lug-wrench", "spare-tire", "tool-tray"],
    cross: ["under:jack-points"],
  },
  "lug-wrench": {
    name: "Wheel-nut wrench (lug wrench) & jack bar",
    sys: ["spare"],
    what: "The wheel-nut wrench loosens and tightens the nuts that hold the wheel on. It also hooks onto the jack bar to crank the jack up and down.",
    spec: "The wheel nuts are 19 mm (one aftermarket source). Tighten them to 80 lbf·ft (pound-feet; 108 N·m) in a criss-cross order, going around 2–3 times.",
    check:
      "Make sure the wrench fits your wheel nuts, especially if anyone has fitted aftermarket (non-Honda) wheels or locking nuts.",
    trouble:
      "Nuts that won't budge: don't stand on the wrench or add a pipe to it (Honda warns against this). Call roadside help instead.",
    diy: "Easy",
    tip: "Loosen each nut about one turn while the tire is still on the ground, before you jack up the car.",
    links: ["jack", "spare-tire", "tool-tray"],
    cross: ["chassis:hub"],
  },
  "floor-board": {
    name: "Trunk floor lid",
    sys: ["access", "spare"],
    what: "The floor lid is the carpeted board that makes the flat trunk floor. Lift it up to reach the spare tire and the tools underneath.",
    check: "Keep heavy cargo off it when you need to get to the spare, or be ready to unload the trunk.",
    trouble: "A warped or wet board can mean water is getting into the trunk. Check the trunk seal.",
    diy: "Easy",
    links: ["spare-tire", "lining"],
  },
  lining: {
    name: "Trunk linings & spare-tire well",
    sys: ["access"],
    what: "The linings are carpet panels that cover the metal inside the trunk. They cover the sides, the bumps over the rear wheels, and the back wall. Under the floor is a pressed steel well shaped to fit the spare.",
    check: "Lift the floor lid now and then and look for water in the spare-tire well.",
    trouble: "Water in the well or a musty smell usually means a leaking trunk seal or taillight gasket.",
    diy: "Easy",
    links: ["floor-board", "taillight-access", "trunk-seal"],
  },
  "trunk-seal": {
    name: "Trunk seal (weatherstrip)",
    sys: ["lid"],
    what: "The trunk seal is the rubber strip around the trunk opening that keeps water out. The lid presses against it to keep out water, dust and exhaust fumes.",
    check: "Look for cracks, flat spots, or places where it's pulling off the metal edge (flange).",
    trouble: "Water in the spare-tire well, a damp carpet, or more road and exhaust noise from the back.",
    diy: "Easy",
    tip: "Wipe the seal clean when you wash the car. Grit wears it out.",
    links: ["lining", "striker"],
  },
  striker: {
    name: "Trunk latch striker",
    sys: ["lid"],
    what: "The striker is the metal loop at the trunk opening that the lid latches onto. It's on the rear sill, the edge you lift things over. The latch inside the lid grabs it to keep the trunk shut.",
    check: "The lid should close with a firm push and sit even with the body.",
    trouble: "A trunk that won't latch, pops open, or rattles. The striker may be loose or out of line.",
    diy: "Medium",
    links: ["trunk-seal", "trunk-release"],
  },
  "trunk-release": {
    name: "Emergency trunk opener",
    sys: ["lid"],
    what: "The emergency trunk opener is a lever inside the trunk that opens the lid from the inside. It's there so no one can get trapped in the trunk.",
    spec: "Owner's manual: slide the release lever in the direction of the arrow. Its exact spot is only shown in the manual's picture, so its position here near the latch is approximate.",
    check: "Find it once with the trunk open so you know where it is.",
    trouble: "If it doesn't open the latch, get it repaired. It's a safety feature.",
    diy: "No",
    tip: "Honda: parents should decide whether to show their children how to use it.",
    links: ["striker"],
  },
  "taillight-access": {
    name: "Taillight access (bulb flaps)",
    sys: ["access"],
    what: "This is how you reach the taillight bulbs from inside the trunk. The taillights come in two parts. The outer lamp sits in the body and is reached through the trunk side lining. The inner lamp (taillight and back-up light) and the license-plate lights are in the trunk lid and reached from its lining.",
    spec: "Outer lamp: brake/tail bulb 21/5 W, rear turn 21 W amber, LED side marker. Inner lamp on the lid: 3 CP (candlepower) taillight and 16 W back-up light. The flap position shown is approximate.",
    check:
      "With the parking brake set and the ignition on, have someone hold the brake pedal and shift to Reverse while you walk around and check every light.",
    trouble: "A burned-out bulb, or water inside a lamp from a bad gasket.",
    diy: "Easy",
    links: ["lining"],
  },
};

export const GUIDES = {
  "spare-tire": {
    title: "Change a flat tire (from the owner's manual)",
    steps: [
      "Slow down gradually and stop on firm, level, non-slippery ground away from traffic.",
      "Set the parking brake, shift to P and turn on the hazard lights. Turn the ignition to LOCK.",
      "Open the trunk and lift the trunk floor lid.",
      "Take out the tool case, and remove the jack and the wheel-nut wrench.",
      "Unscrew the wing bolt, remove the spacer cone, and lift out the spare.",
      "Put a wheel block or a rock in front of and behind the wheel diagonally opposite the flat.",
      "Lay the spare under the car near the flat, wheel side up. If the jack slips, the car lands on the spare instead of the ground.",
      "Loosen each wheel nut about one turn with the wrench, while the tire is still on the ground.",
      "Place the jack under the jacking point nearest the flat. The owner's manual shows the spots in a picture; on Hondas they are usually on the seam under the side of the car.",
      "Wind the jack up until the jacking-point tab sits in the jack's notch.",
      "Raise the car with the jack bar and wrench until the flat is off the ground. Never go under the car, and keep everyone out of it.",
      "Remove the wheel nuts and the wheel cover (it only comes off once the nuts are off), then take off the flat.",
      "Wipe the mounting surfaces clean and put on the spare.",
      "Spin the nuts on until they touch the wheel.",
      "Lower the car and remove the jack.",
      "Tighten the nuts in a criss-cross order, going around 2–3 times, to 80 lbf·ft (pound-feet; 108 N·m).",
      "Put the flat tire face-down in the spare well, flip the spacer cone over on the wing bolt to hold it, and stow the tools.",
      "Drive under 50 mph and get the full-size tire repaired or replaced soon. The TPMS (tire pressure) light will blink and then stay on with the spare; that's normal. (The 2014 manual's \"recalibrate TPMS\" step is for 2014–15 Civics; a 2013 has no calibration button.)",
    ],
  },
};
GUIDES.jack = GUIDES["spare-tire"];

export const SYMPTOMS = [
  {
    id: "flat",
    label: "Flat tire: how do I put on the spare?",
    urgency: "soon",
    group: "Tires & wheels",
    detail:
      "Pull over somewhere safe and level. Everything you need is under the trunk floor. Open a part below for the step-by-step owner's-manual procedure.",
    causes: [
      {
        part: "spare-tire",
        why: "The compact spare lies flat in the well under the trunk floor lid, held by a wing bolt.",
        check: "Check it's inflated to 60 psi. Drive under 50 mph on it.",
      },
      {
        part: "jack",
        why: "The scissor jack is in the tool case under the floor lid. It goes under the jacking point nearest the flat.",
        check: "Seat the car's jacking-point tab in the jack's notch before lifting.",
      },
      {
        part: "lug-wrench",
        why: "The wrench loosens the wheel nuts (do this before lifting) and cranks the jack.",
        check: "Tighten the nuts to 80 lbf·ft (pound-feet) as soon as you can.",
      },
    ],
    note: "If you're on a busy road shoulder or don't feel safe, stay in the car with your belt on and call roadside help.",
  },
  {
    id: "trunkwater",
    label: "Water in the trunk or spare-tire well",
    urgency: "watch",
    group: "Leaks & fluids",
    detail: "A damp carpet, a musty smell, or a puddle in the spare-tire well.",
    causes: [
      {
        part: "trunk-seal",
        why: "A torn, flattened or loose seal (weatherstrip) lets rain in around the lid.",
        check: "Look all the way around the seal for gaps, cracks or places where it's pulling off.",
      },
      {
        part: "taillight-access",
        why: "A leaking taillight gasket lets water run into the trunk behind the side lining.",
        check: "Open the access flap after rain or a car wash and look for drips around the lamp.",
      },
    ],
  },
  {
    id: "trunkrattle",
    label: "Rattle from the trunk over bumps",
    urgency: "watch",
    group: "Noises",
    detail: "A clunk or rattle from the very back of the car on rough roads.",
    causes: [
      {
        part: "hold-down",
        why: "The wing bolt holding the spare has loosened, so the spare bounces.",
        check: "Lift the floor lid and hand-tighten the wing bolt.",
      },
      {
        part: "tool-tray",
        why: "The jack or wrench is loose in its case.",
        check: "Make sure each tool is clipped in or wrapped.",
      },
      {
        part: "striker",
        why: "The latch or striker is out of line, so the lid rattles.",
        check: "Close the lid and press on it. It should not move.",
      },
    ],
  },
];

export const VIDEOS = {
  "spare-tire": [
    {
      label: "Change a flat tire (2012 Civic)",
      url: "https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/tires_and_wheels/change_a_flat_tire",
      site: "CarCareKiosk",
    },
  ],
  jack: [
    {
      label: "Use your jack to raise your car (2012 Civic)",
      url: "https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/jack_up_car/use_your_jack_to_raise_your_car",
      site: "CarCareKiosk",
    },
  ],
};

export const START = {
  lead: "The trunk is open and the floor lid is up. The compact spare, the jack and the wheel wrench are all down here.",
  how: 'Click any part to zoom in on it. Use "Take out the spare" to lift the spare and tools out and lay them beside the car, the first steps of changing a flat.',
  sections: [
    {
      title: "Got a flat?",
      html: "<p>Click the <b>spare tire</b> or the <b>jack</b>, then open the <b>DIY</b> tab for Honda's step-by-step procedure from the owner's manual. Key numbers: spare at <b>60 psi</b>, stay <b>under 50 mph</b>, wheel nuts to <b>80 lbf·ft</b> (pound-feet).</p>",
    },
    {
      title: "What's in here",
      html: "<p>Under the floor lid: the <b>compact spare</b> (T135/80D15) held by a <b>wing bolt</b>, and the <b>tool case</b> with a <b>scissor jack</b>, a <b>wheel wrench</b> and a jack bar. Around the opening: the <b>weatherstrip</b> (rubber seal), the <b>latch striker</b> and the <b>emergency trunk opener</b>.</p>",
    },
    {
      title: "Check every few months",
      html: "<p>Spare tire pressure (60 psi), and the spare-tire well for water. Water in the well usually means a leaking seal or taillight gasket.</p>",
    },
  ],
  foot: "The tool case and the emergency opener are placed approximately. Honda's manual shows them only in pictures.",
};
