// Brakes & suspension symptoms: "what's wrong?" entries (urgency, what you notice, and the likely parts with why
// and how to check). Re-exported by ../content.js as SYMPTOMS.
// Facts were checked against docs/research/chassis.md (Honda 2013 Civic Sedan spec sheet, 2014 owner's manual,
// Honda parts catalog).

export const SYMPTOMS = [
  {
    id: "squeal",
    label: "Squealing when I brake",
    urgency: "soon",
    detail: "A high-pitched squeal or squeak when you press the brakes.",
    causes: [
      {
        part: "pads",
        why: "Pads have a small metal tab that touches the rotor and squeals on purpose when the lining gets thin.",
        check:
          "Look at the outer pad through the wheel: if the lining looks thin, get the brakes checked soon.",
      },
      {
        part: "caliper",
        why: "Dry slider pins or missing anti-rattle clips let the pad vibrate.",
        check: "At the next brake job, ask for the slider pins and contact points to be cleaned and greased.",
      },
      {
        part: "rotor",
        why: "A glazed (shiny, hardened) or rusty rotor surface can squeal, especially in the morning or after rain.",
        check:
          "A light squeal that goes away after a few stops is usually just surface rust, which is normal.",
      },
    ],
    note: "Squealing gives you warning. Don't wait for it to turn into grinding.",
    group: "Noises",
  },
  {
    id: "grind",
    label: "Grinding noise when I brake",
    urgency: "stop",
    detail: "A harsh metal-on-metal grinding or growl when you stop.",
    causes: [
      {
        part: "pads",
        why: "The lining is worn away and the steel backing plate is scraping the rotor.",
        check: "You can see metal on metal through the wheel, and stopping takes longer.",
      },
      {
        part: "rotor",
        why: "Once pads are gone, the rotor gets gouged and usually has to be replaced too.",
        check: "Deep grooves you can catch a fingernail in.",
      },
      {
        part: "shoes",
        why: "Rear shoes worn through scrape inside the drum.",
        check: "The noise comes from the back of the car.",
      },
    ],
    note: "Braking is weaker and the rotor is being cut up. Getting it fixed promptly usually keeps the job to pads and rotors; waiting can damage the calipers too.",
    group: "Noises",
  },
  {
    id: "pulse",
    label: "Brake pedal pulses or steering wheel shakes when I brake",
    urgency: "soon",
    detail: "The brake pedal pushes back in pulses, or the steering wheel shakes, when slowing from speed.",
    causes: [
      {
        part: "rotor",
        why: "The rotor has uneven thickness (often called 'warped'), so the pads grip and slip as it turns.",
        check: "It's worse when braking from highway speed. The fix is new or resurfaced rotors.",
      },
      {
        part: "hub",
        why: "A loose or worn hub, or rust between hub and rotor, makes the rotor wobble.",
        check: "A shop measures the wobble (runout) with a dial gauge.",
      },
      {
        part: "drum",
        why: "An out-of-round rear drum gives a gentler pulse, often felt in the seat.",
        check: "It's felt more when braking lightly.",
      },
    ],
    group: "Braking",
  },
  {
    id: "pull-brake",
    label: "Car pulls to one side when I brake",
    urgency: "soon",
    causes: [
      {
        part: "caliper",
        why: "A sticking caliper (brake clamp) or seized slider pin makes one side brake harder or drag.",
        check:
          "After a drive, carefully hold your hand near each front wheel (don't touch the hot brake). One much hotter than the other points here.",
      },
      {
        part: "brake-hose",
        why: "A collapsed hose can trap pressure and keep one brake applied.",
        check: "Ask a shop to check it.",
      },
      {
        part: "pads",
        why: "Oil or brake fluid on one pad makes that side grip less.",
        check: "Look for wetness around the caliper.",
      },
      {
        part: "tire",
        why: "Low pressure on one front tire also makes the car pull.",
        check: "Check both front tire pressures first: it's free.",
      },
    ],
    group: "Braking",
    detail: "The car tugs left or right only when you press the brakes.",
  },
  {
    id: "soft",
    label: "Brake pedal feels soft or sinks",
    urgency: "stop",
    detail: "The pedal feels spongy, goes closer to the floor than normal, or slowly sinks while stopped.",
    causes: [
      {
        part: "brake-lines",
        why: "A leak anywhere in the lines lets fluid escape, so there's less pressure.",
        check:
          "Look under the car for wet spots near each wheel, and check the brake fluid level under the hood.",
      },
      {
        part: "wheel-cylinder",
        why: "A leaking rear wheel cylinder drips fluid inside the drum.",
        check: "Look for a wet, dark stain on the inside of a rear wheel.",
      },
      {
        part: "brake-hose",
        why: "A swollen or leaking hose stretches under pressure.",
        check: "Look for bulges or wetness on the hoses.",
      },
      {
        part: "shoes",
        why: "Rear shoes far out of adjustment make the pedal travel longer (but firm).",
        check: "The parking brake needs many more clicks than normal.",
      },
    ],
    note: "Air in the lines or old, wet fluid also causes a soft pedal. The master cylinder (under the hood) can fail internally too. Don't drive it.",
    group: "Braking",
  },
  {
    id: "hum",
    label: "Humming or growling that gets louder with speed",
    urgency: "soon",
    detail: "A low hum, roar or growl, like driving on a rumble strip, that gets louder as you go faster.",
    causes: [
      {
        part: "hub",
        why: "A worn wheel bearing. The noise usually changes when you swerve gently, getting louder when weight shifts onto the bad side.",
        check: "A shop can confirm by spinning the wheel with the car lifted.",
      },
      {
        part: "tire",
        why: "Choppy or cupped (scalloped) tire wear makes a similar roar.",
        check: "Run your hand over the tread and feel for scalloped dips.",
      },
      {
        part: "hub-rear",
        why: "A rear bearing makes the same noise from the back.",
        check: "Have someone listen with you from inside; it's hard to tell front from back.",
      },
    ],
    group: "Noises",
  },
  {
    id: "clunk",
    label: "Clunk or knock over bumps",
    urgency: "soon",
    causes: [
      {
        part: "sway-link",
        why: "Worn end-link ball joints knock over small bumps. The part is usually inexpensive.",
        check: "Shake the link by hand with the car parked.",
      },
      {
        part: "strut-mount",
        why: "A worn top mount clunks over bumps and when steering.",
        check: "Put your hand on the strut nuts under the hood while someone bounces the car.",
      },
      {
        part: "ball-joint",
        why: "A loose ball joint knocks and makes the steering vague.",
        check: "Ask a shop to check it with the wheel off the ground.",
      },
      {
        part: "lower-arm",
        why: "Torn arm bushings (rubber cushions) let the arm shift.",
        check: "Look for cracked or torn rubber at the frame end.",
      },
      {
        part: "rear-shock",
        why: "Worn shock mounts or bushings at the back of the car.",
        check: "Listen for noise from the rear over speed bumps.",
      },
    ],
    group: "Noises",
    detail: "A dull clunk, knock or rattle from a corner of the car when you drive over bumps or potholes.",
  },
  {
    id: "bouncy",
    label: "Car feels bouncy or floaty, or dips when braking",
    urgency: "watch",
    causes: [
      {
        part: "strut",
        why: "Worn front struts can't control the springs, so the car keeps bouncing and dives when you brake.",
        check: "Do the bounce test: push down hard on a corner and let go. More than one bounce means worn.",
      },
      {
        part: "rear-shock",
        why: "Worn rear shocks make the back float and wallow.",
        check: "Look for oil on the shock body and cupped rear tires.",
      },
      {
        part: "spring",
        why: "A sagging or broken spring changes ride height.",
        check: "Compare the gap between tire and fender on each corner.",
      },
    ],
    note: "Worn struts and shocks also make stopping distances longer, so don't put them off too long.",
    group: "How it drives",
    detail: "The car keeps bobbing after a bump, feels floaty, or the nose dips a lot when you brake.",
  },
  {
    id: "click-turn",
    label: "Clicking when turning sharply",
    urgency: "soon",
    detail:
      "A rapid click-click-click when you accelerate while turning, like pulling out of a parking spot.",
    causes: [
      {
        part: "cv-axle",
        why: "The outer CV joint is worn, usually because a torn boot let dirt in and grease out.",
        check: "Look for grease splattered inside the wheel and a torn rubber boot.",
      },
      {
        part: "strut-mount",
        why: "A creak or pop (rather than a click) when steering slowly points to the top mount.",
        check: "It happens even when parked and turning the wheel.",
      },
    ],
    group: "Noises",
  },
  {
    id: "heavy",
    label: "Steering suddenly feels heavy (EPS light on)",
    urgency: "soon",
    causes: [
      {
        part: "eps-motor",
        why: "The electric assist has shut off. Honda investigated EPS-light and loss-of-assist complaints on 2012–2015 Civics.",
        check: "Note when it happened and whether a restart clears it, and tell the dealer.",
      },
      {
        part: "steering-rack",
        why: "A worn or damaged rack can also trigger an EPS fault.",
        check: "A shop can diagnose it with a scan tool (code reader).",
      },
    ],
    note: "Honda says: stop somewhere safe and restart the engine. If the EPS light stays on, have a dealer inspect it immediately. Revving the engine over and over at idle, or holding the wheel at full lock at very low speed, can also make it limit assist for a while. You can still steer without assist, but it takes real effort.",
    group: "Warning lights",
    detail: "The steering suddenly takes much more effort, often with the EPS warning light on the dash.",
  },
  {
    id: "wander",
    label: "Steering feels loose or the car wanders",
    urgency: "soon",
    causes: [
      {
        part: "tie-rod",
        why: "Worn tie-rod ends let the wheels move a little on their own.",
        check:
          "With the front lifted and on jack stands, rock the wheel side to side. Any clunk means play (looseness).",
      },
      {
        part: "ball-joint",
        why: "A worn ball joint gives the same vague feeling.",
        check: "With it lifted, rock the wheel top to bottom.",
      },
      {
        part: "tire",
        why: "Low or uneven tire pressure makes steering vague.",
        check: "Check the tire pressures first.",
      },
      {
        part: "steering-rack",
        why: "Worn rack bushings or wear inside the rack.",
        check: "Ask a shop to check it.",
      },
    ],
    group: "How it drives",
    detail:
      "The car doesn't hold a straight line and you keep correcting the wheel, or there's play before the car responds.",
  },
  {
    id: "pull-drive",
    label: "Car drifts to one side while driving",
    urgency: "watch",
    causes: [
      {
        part: "tire",
        why: "Uneven tire pressure or a tire defect is a frequent cause, and the easiest to check.",
        check:
          "Check the pressures. Then swap the front tires left to right and see if the pull changes sides.",
      },
      {
        part: "tie-rod",
        why: "The alignment (the angle of the wheels) is off, often after hitting a pothole or curb, or a tie rod is worn.",
        check: "Get an alignment, especially after replacing steering or suspension parts.",
      },
      {
        part: "caliper",
        why: "A dragging brake pulls even when you're not braking.",
        check: "After a drive, one wheel is hotter than the other.",
      },
    ],
    group: "How it drives",
    detail:
      "On a straight, flat road the car slowly drifts to one side when you let go of the wheel for a moment.",
  },
  {
    id: "vibe",
    label: "Shaking at highway speed (not when braking)",
    urgency: "watch",
    causes: [
      {
        part: "tire",
        why: "A wheel is out of balance (it lost a balance weight), or a tire is damaged.",
        check: "Usually shows up at highway speed. Have the wheels balanced.",
      },
      {
        part: "wheel",
        why: "A wheel bent by a pothole.",
        check: "A shop can spin it on the balancer to check.",
      },
      {
        part: "cv-axle",
        why: "A worn inner CV joint shakes mostly when accelerating.",
        check: "The vibration goes away when you coast.",
      },
    ],
    group: "How it drives",
    detail: "A shake through the steering wheel or seat at highway speed, even when you're not braking.",
  },
  {
    id: "parkbrake",
    label: "Parking brake won't hold",
    urgency: "soon",
    causes: [
      {
        part: "shoes",
        why: "The rear shoes are worn or out of adjustment.",
        check: "The lever comes up many more clicks than it used to.",
      },
      {
        part: "parking-brake",
        why: "A stretched or rusted cable.",
        check: "A shop can adjust the cable.",
      },
      {
        part: "drum",
        why: "The drum is worn too large inside.",
        check: "A shop measures it at a brake service.",
      },
    ],
    group: "Braking",
    detail:
      "With the parking brake on, the car still creeps on a slope, or the lever comes up much higher than it used to.",
  },
  {
    id: "tirewear",
    label: "Tires wearing on one edge",
    urgency: "watch",
    causes: [
      {
        part: "tie-rod",
        why: "The toe alignment is off: the front tires point slightly in or out and scrub. That wears the inside or outside edges fast.",
        check: "Get a four-wheel alignment.",
      },
      {
        part: "trailing-arm",
        why: "Rear alignment drifts as the rear arm bushings wear. The rear alignment is set with a cam bolt on the trailing arm.",
        check: "Ask for the rear alignment readings, not just the front, at the alignment.",
      },
      {
        part: "tire",
        why: "Underinflated tires wear both edges; overinflated tires wear the center.",
        check: "Keep them at the door-jamb pressure and rotate at Minder code 1.",
      },
    ],
    group: "How it drives",
    detail: "One edge of a tire (inside or outside) is worn much more than the rest of the tread.",
  },
];
