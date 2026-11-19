// Cabin area parts: what each dashboard piece, warning light, control, filter/fuse spot and safety item is, how
// to check it and what goes wrong (PARTS, keyed by the part ids the 3D model uses in userData.part).
// Re-exported by ../content.js. Facts: docs/research/cabin.md (2013 Civic Coupe owner's manual = same year,
// engine, 5AT, dash and indicator set; 2014 Civic Sedan manual = same body; Honda spec sheet; repair guides).
// Light colours are not in the manual text; they come from Honda UK/AU and SlashGear guides (see each light's spec).

const COLOR_NOTE =
  "Colours come from Honda's general warning-light guides, not the 2013 manual text. Check your own cluster at key-ON.";

export const PARTS = {
  // ------------------------------------------------------------------ gauges & screens
  dash: {
    name: "Dashboard (two-tier)",
    sys: ["gauges"],
    what: "The dashboard shows your speed, engine speed and warnings, split into two levels on your Civic. The top level has a digital speedometer and the i-MID screen (the small info screen). The lower level, behind the steering wheel, has the tachometer (engine-speed dial) and warning lights. Honda did this so the things you look at most need only a short glance.",
    spec: 'Honda calls it a "2-tier instrument panel". Gauges are blue-backlit.',
    check:
      'When you turn the key to ON ("key-ON"), look at both levels: the screens light up and nearly every warning light comes on for a few seconds.',
    trouble:
      "If a whole screen stays dark, it's an electrical fault for a shop to look at. A fuse is one possible cause.",
    diy: "No",
    links: ["speedo", "imid", "tach"],
  },
  speedo: {
    name: "Speedometer (digital, top level)",
    sys: ["gauges"],
    what: 'The speedometer shows how fast you\'re going, as numbers on the upper display. The "Eco Assist" bars on either side change colour with how you drive: green = fuel-efficient, blue-green = moderate acceleration or braking, blue = aggressive acceleration or braking.',
    spec: "Switch between mph and km/h by pressing and holding the km/mile change knob until it beeps (owner's manual).",
    check: "If the bars stay blue a lot, you're accelerating or braking hard, which uses more fuel.",
    trouble:
      "If the speedometer reads wrong or goes blank, have a shop check it. Driving without a working speedometer isn't safe.",
    diy: "No",
    links: ["imid", "dash"],
  },
  imid: {
    name: "Info screen (i-MID, 5-inch)",
    sys: ["gauges"],
    what: 'The i-MID is the small screen next to the speedometer that shows trip info, warnings and messages. Honda\'s full name for it is "intelligent Multi-Information Display". It shows the odometer (total miles), trip meters and outside temperature. It also shows warnings, fuel-economy screens, audio and phone info, the clock/wallpaper, and the rear-view camera picture when you shift into Reverse.',
    spec: "LX: 5-inch LCD screen. You flip between screens with the Display/Information button and the MENU button on the steering wheel.",
    check:
      "Read any message that pops up. Press the Display/Information button to see the last message again.",
    trouble:
      'Messages like "SERVICE DUE SOON", "CHECK TIRE PRESSURE", "TIGHTEN FUEL CAP" or "RELEASE PARKING BRAKE" show up here, so don\'t ignore them.',
    tip: "The rear-view camera has guide lines at about 0.5 m, 1 m, 2 m and 3 m. Clean the lens with a soft damp cloth.",
    diy: "No",
    links: ["speedo", "light-wrench", "wheel"],
  },
  tach: {
    name: "Tachometer (engine-speed dial)",
    sys: ["gauges"],
    what: "The tachometer is the big dial that shows how fast the engine is spinning. It sits behind the steering wheel. It counts in thousands of revolutions per minute (x1000 r/min), so 2 means 2,000 turns a minute.",
    check: "With the engine idling, the needle should sit steady near the bottom of the dial.",
    trouble:
      "If the needle jumps around at idle and the engine shakes, look up the shaking-idle symptom under Something wrong?.",
    diy: "No",
    links: ["dash", "light-cel"],
    cross: ["engine:crankshaft"],
  },
  "fuel-gauge": {
    name: "Fuel gauge",
    sys: ["gauges"],
    what: "The fuel gauge shows how much gas is in the tank, from E (empty) to F (full).",
    spec: "Tank: 13.2 US gal (50 L). Fuel: 87 octane or higher, unleaded. The model shows it on the lower cluster, but the manual doesn't say which level it's on. Check your car.",
    check: "When the low-fuel light comes on, about 1.9 US gal (7.5 L) is left.",
    trouble: "If the low-fuel light blinks, the fuel gauge may have a problem. Have a dealer check it.",
    diy: "No",
    links: ["light-fuel", "fuel-release"],
  },
  "gear-display": {
    name: "Gear display (shift position)",
    sys: ["gauges"],
    what: "The gear display shows which gear the shifter is in: P, R, N, D, D3, 2 or 1.",
    check: "Look at it before you drive off so you know you're in D (or R) and not N.",
    trouble:
      "If the D blinks while you drive (whatever gear you're in), the transmission has a problem. Avoid sudden starts and hard acceleration, and see a dealer immediately.",
    diy: "No",
    links: ["shifter"],
    cross: ["bay:transmission"],
  },

  // ------------------------------------------------------------------ warning lights
  "light-brake": {
    name: "BRAKE light (red)",
    sys: ["lights"],
    what: "The red BRAKE light means the parking brake is on, or something is wrong with the brakes. It's on whenever the parking brake is set. If it stays on with the parking brake fully released, the brake fluid may be low or the brake system has a problem.",
    spec: "Colour: red (several Honda guides agree). " + COLOR_NOTE,
    check:
      "First make sure the parking brake is fully down. Then check the brake fluid level under the hood. Press the brake pedal lightly. If it feels normal, check the fluid at your next stop. If it doesn't feel normal, act right away.",
    trouble:
      "Urgent if it stays on with the parking brake off. If it's on together with the ABS light, the system that balances braking between the front and rear wheels isn't working, so have a dealer inspect it immediately. A beep while driving means the parking brake isn't fully released.",
    diy: "No",
    links: ["parking-brake", "light-abs", "brake-pedal"],
    cross: ["bay:brake-reservoir", "chassis:pads"],
  },
  "light-oil": {
    name: "Low oil pressure light (red oil can)",
    sys: ["lights"],
    what: "The red oil-can light warns you that the engine's oil pressure is low. It comes on when you turn the key to ON and goes off when the engine starts. If it comes on while driving, the engine's oil pressure is low.",
    spec: "Colour: red (Honda UK and Honda AU). " + COLOR_NOTE,
    check:
      "Park safely right away. Turn the engine off, wait about 1 minute, check the oil level and add oil. Restart the engine. If the light goes out, you may continue. If it stays on more than 10 seconds, turn the engine off and contact a dealer.",
    trouble:
      "Stop now. Honda warns that running with low oil pressure can cause serious engine damage almost immediately.",
    diy: "No",
    links: ["light-battery"],
    cross: ["bay:dipstick", "engine:oil-pump", "engine:oil-pan"],
  },
  "light-battery": {
    name: "Battery / charging light (red)",
    sys: ["lights"],
    what: "The red battery light warns you that the battery isn't being charged. It comes on when you turn the key to ON and goes off when the engine starts. If it's on while driving, the battery is not being charged.",
    spec: "Colour: red (Honda UK and Honda AU). " + COLOR_NOTE,
    check:
      "Turn off the heater/A-C, rear defogger and other electrical loads, and contact a dealer immediately.",
    trouble:
      "The car is running on battery power alone and will die when the battery is drained. If you must stop briefly, don't turn the engine off, because restarting can drain the battery quickly.",
    diy: "No",
    links: ["light-oil"],
    cross: ["bay:alternator", "bay:belt", "bay:battery"],
  },
  "light-cel": {
    name: "Check-engine light (amber engine shape)",
    sys: ["lights"],
    what: "The check-engine light is an amber engine-shaped light that means the car found an engine or emissions problem. Honda calls it the Malfunction Indicator Lamp. On steadily = a problem with the emissions control system (the parts that keep the exhaust clean). Blinking = the engine is misfiring (a cylinder isn't firing properly).",
    spec:
      "Colour: amber (Honda UK). " +
      COLOR_NOTE +
      " At key-ON it may blink 5 times before going off if the emissions self-tests haven't finished. That's normal.",
    check:
      "Steady: have a dealer or shop read the trouble code soon. Blinking: stop somewhere safe away from anything flammable, turn the engine off, wait at least 10 minutes to cool, then take the car in.",
    trouble:
      "Blinking is the urgent one, because a misfire can overheat the catalytic converter (the exhaust cleaner). A steady light still needs checking soon.",
    tip: 'A loose fuel cap shows its own "TIGHTEN FUEL CAP" message on the i-MID.',
    diy: "No",
    links: ["tach"],
    cross: ["bay:ecm", "bay:coils", "bay:catalytic"],
  },
  "light-abs": {
    name: "ABS (anti-lock brake) light (amber)",
    sys: ["lights"],
    what: 'The ABS light warns of a problem with the anti-lock brakes, which keep the wheels from locking in a hard stop. It shows "ABS" in a circle. It comes on when you turn the key to ON, then goes off. On at any other time = a problem with the anti-lock brakes.',
    spec: "Colour: most Honda guides show amber; one Honda guide shows red. " + COLOR_NOTE,
    check: "Have a dealer check it. Their scan tool (a code reader) shows which part set the light.",
    trouble:
      "Your normal brakes still work, but the wheels can lock in a panic stop. If the red BRAKE light is on too, get it inspected immediately.",
    diy: "No",
    links: ["light-brake", "light-vsa"],
    cross: ["chassis:abs-sensor", "bay:abs"],
  },
  "light-vsa": {
    name: "Skid-control light (VSA, amber car with skid lines)",
    sys: ["lights"],
    what: "The VSA light is about the stability system that helps keep the car from sliding. VSA stands for Vehicle Stability Assist. Blinking = VSA is working right now, for example on a slippery road. On steadily = VSA has a problem.",
    spec: 'Colour: amber (Honda UK, Honda AU, SlashGear). There is also a separate "VSA OFF" light that comes on if you press the VSA OFF button. Press the button again to turn VSA back on.',
    check:
      "Blinking: ease off and drive gently, because the road is slippery. Steady: have a dealer check it.",
    trouble: "Steady means you have no stability help, so drive carefully, especially in rain or snow.",
    diy: "No",
    links: ["light-abs"],
    cross: ["bay:abs"],
  },
  "light-eps": {
    name: "Power-steering light (EPS, amber steering wheel)",
    sys: ["lights"],
    what: 'The power-steering light warns that the electric power steering (EPS) has a problem, so steering may feel heavy. It shows a steering wheel with "!". It comes on when you turn the key to ON and goes off when the engine starts. If it stays on, the electric power steering has a problem.',
    spec: "Colour: most Honda guides show amber; one Honda guide shows red. " + COLOR_NOTE,
    check:
      "Stop somewhere safe and restart the engine. If the light stays on, have a dealer inspect it immediately.",
    trouble:
      "Revving the engine over and over at idle can also make it come on. Holding the wheel turned all the way at very low speed can overheat the system. It then gives less help until it cools.",
    diy: "No",
    links: ["wheel"],
    cross: ["chassis:eps-motor", "chassis:steering-rack"],
  },
  "light-srs": {
    name: "Airbag light (SRS, red)",
    sys: ["lights", "safety"],
    what: "The airbag light warns that the airbags or seat belt tensioners may have a problem. It shows a seated person with an airbag in front. SRS (Supplemental Restraint System) is the name for the airbags and belt tensioners together. It comes on when you turn the key to ON, then goes off. If it stays on, there's a problem with the airbags (front, side or curtain) or the seat belt tensioners.",
    spec: "Colour: red (Honda UK and Honda AU). " + COLOR_NOTE,
    check: "Have a dealer check it if it stays on, or if it never comes on when you turn the key to ON.",
    trouble: "The airbags may not go off in a crash. Get it checked soon.",
    diy: "No",
    links: ["airbags", "seatbelt"],
  },
  "light-belt": {
    name: "Seat belt reminder light (red)",
    sys: ["lights", "safety"],
    what: "The seat belt light reminds you that someone in front isn't buckled up. It shows a person wearing a belt. It comes on with a beep if the driver's belt isn't fastened. For the front passenger seat, it comes on about 6 seconds after you turn the key to ON if they're unbelted. It blinks with a beep while driving if the driver or front passenger is unbelted.",
    spec: "Colour: red (Honda UK and Honda AU). " + COLOR_NOTE,
    check: "Buckle up. If it stays on with the belts fastened, have a dealer check the belt sensor.",
    trouble: "Nothing is broken; it just means someone isn't buckled.",
    diy: "No",
    links: ["seatbelt"],
  },
  "light-temp-high": {
    name: "High temperature light (red thermometer)",
    sys: ["lights"],
    what: "The red temperature light warns that the engine is getting too hot. It's a red thermometer in waves. Your Civic has no temperature needle, just this light and a blue one. Blinking = the engine coolant is getting hot. On steadily = it's still climbing (overheating).",
    spec: "Colour: red (SlashGear; Honda UK's engine-cooling light is red). " + COLOR_NOTE,
    check:
      "Blinking: drive slowly. Steady: stop immediately somewhere safe and let the engine cool. Never open the radiator cap while it's hot.",
    trouble: "Honda warns that continuing to drive with this light on may damage the engine.",
    diy: "No",
    links: ["light-temp-low"],
    cross: ["bay:coolant-reservoir", "bay:fans", "bay:thermostat"],
  },
  "light-temp-low": {
    name: "Low temperature light (blue thermometer)",
    sys: ["lights"],
    what: "The blue temperature light just means the engine is still cold. It's on while the engine coolant is cold, which is normal after a cold start. It goes off once the engine warms up.",
    spec: "Colour: blue (SlashGear). " + COLOR_NOTE,
    check: "Drive gently until it goes out.",
    trouble:
      "If it stays on after the engine is fully warm, a temperature sensor may be faulty. See a dealer.",
    diy: "No",
    links: ["light-temp-high"],
  },
  "light-tpms": {
    name: "Tire pressure light (TPMS, amber)",
    sys: ["lights"],
    what: 'The tire pressure light warns that one or more tires are low on air. TPMS stands for tire pressure monitoring system. The light looks like a tire cross-section with "!". On = one or more tires are significantly low, and "CHECK TIRE PRESSURE" appears on the i-MID. If it blinks for about a minute and then stays on, the TPMS has a problem, or the small spare tire is fitted.',
    spec: 'Colour: amber (Honda UK and Honda AU). The 2013 Civic has a sensor inside each wheel ("direct" TPMS) and no owner reset button. That button came on 2014–15 Civics, so videos about "TPMS calibration" don\'t apply to your car.',
    check:
      "Stop safely and check all four tire pressures while the tires are cold. Fill them to the numbers on the sticker in the driver's door jamb.",
    trouble:
      "Cold weather and altitude change tire pressure. Too much air does not turn the light on. If it blinked first, see a dealer, or put the repaired full-size tire back on.",
    diy: "Easy",
    links: [],
    cross: ["chassis:tire", "chassis:wheel"],
  },
  "light-fuel": {
    name: "Low fuel light (amber pump)",
    sys: ["lights"],
    what: "The low fuel light tells you it's time to get gas. It's an amber fuel pump, and it comes on when about 1.9 US gal (7.5 L) of fuel is left.",
    spec: "Colour: amber (Honda UK, Honda AU, SlashGear). " + COLOR_NOTE,
    check:
      "Refuel soon. The fuel door is on the driver's side at the rear; its release lever is by the driver's seat.",
    trouble: "If the light blinks, the fuel gauge may have a problem. Have a dealer check it.",
    diy: "Easy",
    links: ["fuel-gauge", "fuel-release"],
  },
  "light-door": {
    name: "Door open light (red)",
    sys: ["lights"],
    what: "The door light tells you a door isn't fully closed. It shows a car seen from above with a door open. It beeps if a door is opened while driving. A separate trunk-open light works the same way for the trunk.",
    spec: "Colour: red (SlashGear and Honda UK). In this model it stays lit because the driver's door is open.",
    check:
      "Close the doors and the trunk. Keep the trunk closed while driving, because exhaust fumes can get in.",
    trouble: "If it stays on with every door shut, a door switch may need checking.",
    diy: "No",
    links: [],
  },
  "light-key": {
    name: "Anti-theft key light (immobilizer, green key)",
    sys: ["lights"],
    what: "The green key light belongs to the immobilizer, the anti-theft system that checks the chip in your key. It comes on briefly when you turn the key to ON. If it blinks, the car didn't recognise the chip in the key, so the engine won't start.",
    spec: "Colour: green (Honda AU and SlashGear). " + COLOR_NOTE,
    check:
      "Turn the key to LOCK, take it out, put it back in and turn it to ON again. If it keeps blinking, see a dealer.",
    trouble: "Don't modify the immobilizer system.",
    diy: "No",
    links: [],
  },
  "light-info": {
    name: "Message light (amber)",
    sys: ["lights"],
    what: "The message light tells you to read a new message on the i-MID screen. It comes on with a beep when the car detects a problem, and the message appears on the i-MID.",
    spec: "Colour: amber (SlashGear). " + COLOR_NOTE,
    check:
      "Press the Display/Information button on the steering wheel to read the message again, and do what it says.",
    trouble: "What it means depends on the message.",
    diy: "No",
    links: ["imid"],
  },
  "light-wrench": {
    name: "Maintenance Minder (service reminder)",
    sys: ["lights", "gauges"],
    what: "The Maintenance Minder is the car's built-in reminder that tells you when service is due. On your 2013 Civic it's a message on the i-MID, not a separate bulb. It tracks oil life and shows a code: a letter (A or B) plus numbers 1–6 for extra items.",
    spec: 'Messages: "SERVICE DUE SOON" (oil life 15–6%), "SERVICE DUE NOW" (5–1%), "SERVICE PAST DUE" (negative miles). Sub-item 2 = replace the engine air filter and the cabin (dust and pollen) filter, and inspect the drive belt.',
    check:
      'To see oil life: turn the key to ON → press MENU → use + to pick "Vehicle Information" → press SOURCE → press SOURCE again.',
    trouble:
      "Ignoring it means oil and filters wear out. Get the listed service done, then reset the Minder.",
    diy: "Easy",
    links: ["imid", "cabin-filter", "wheel"],
    cross: ["bay:air-box", "bay:belt"],
  },

  // ------------------------------------------------------------------ controls
  wheel: {
    name: "Steering wheel & controls",
    sys: ["controls"],
    what: "The steering wheel turns the car, and its buttons control cruise, audio, phone and the i-MID screen. The lit buttons are MENU, SOURCE, +/−, Display/Information, the phone voice buttons (Bluetooth HandsFreeLink) and the cruise control buttons.",
    spec: "The steering column tilts (up and down) and telescopes (in and out) (Edmunds). Power steering is electric (EPS).",
    check: "Adjust the wheel so your wrists rest on top of the rim with your back against the seat.",
    trouble: "Suddenly heavy steering with the EPS (power-steering) light on = a power-steering fault.",
    diy: "No",
    links: ["airbags", "stalk-lights", "stalk-wipers", "light-eps"],
    cross: ["chassis:steering-shaft", "chassis:eps-motor"],
  },
  "stalk-lights": {
    name: "Lights & turn-signal lever (left stalk)",
    sys: ["controls"],
    what: "This lever on the left (door side) of the steering column works the headlights, turn signals and high beams. Turn it to switch the headlights on and off.",
    spec: "LX headlights: halogen with auto-off. A green light shows when the lights are on, and a blue one when the high beams are on. LX has no fog lights.",
    check: "If a turn signal blinks fast, or doesn't blink at all, a turn-signal bulb is out.",
    trouble: "Fast blinking = replace that bulb (see the Lights area).",
    diy: "No",
    links: ["wheel"],
  },
  "stalk-wipers": {
    name: "Wiper & washer lever (right stalk)",
    sys: ["controls"],
    what: "This lever on the right (center side) of the steering column works the wipers and washer spray. Settings: MIST, OFF, INT (wipes with a pause), LO, HI. Pull it toward you to spray washer fluid.",
    spec: "LX: 2-speed wipers with an intermittent (pause) setting. Sedan blade sizes: 26 in driver, 22 in passenger.",
    check: "Replace the blades when they streak. Honda gives no time interval.",
    trouble: "Don't open the hood with the wiper arms raised, because the hood will hit them.",
    diy: "Easy",
    links: ["wheel"],
  },
  audio: {
    name: "Radio (audio unit)",
    sys: ["controls"],
    what: "The audio unit is your radio and music player. LX: a 160-watt AM/FM/CD stereo with 4 speakers, a USB input, Pandora and Bluetooth audio, and text-message (SMS) support.",
    check: "If it's completely dead, check its fuse.",
    trouble: "A dead radio with everything else working is often a fuse; look it up on the fuse label.",
    diy: "No",
    links: ["fuse-box"],
  },
  hvac: {
    name: "Heater & A/C controls",
    sys: ["controls"],
    what: "These controls set the heat, air conditioning and fan for the cabin. Your LX has manual A/C (automatic climate control was EX/EX-L only). There's a fan dial (fully left = OFF), a temperature dial, and four mode buttons for where the air goes (floor/defrost, floor, dash+floor, dash). There's also an A/C button, a windshield defroster button and a recirculation/fresh-air button (recirculation reuses the air already inside).",
    check:
      "Weak airflow on every fan speed, or windows that fog easily, can mean the cabin air filter needs replacing.",
    trouble:
      "If the fan doesn't blow at all, check that the fan dial isn't at OFF, then check the blower fuse. The blower circuit is in the engine-bay fuse box.",
    tip: "The A/C also dries the air, which helps clear a foggy windshield.",
    diy: "No",
    links: ["cabin-filter", "filter-housing"],
    cross: ["bay:ac-compressor", "bay:fans", "bay:fuse-box"],
  },
  "brake-pedal": {
    name: "Brake pedal",
    sys: ["controls"],
    what: "The brake pedal is the wide pedal on the left that slows and stops the car. Automatic cars have two pedals: brake on the left, gas (accelerator) on the right. You must press the brake firmly to shift out of Park.",
    check: "The pedal should feel firm and stop at the same height every time.",
    trouble: "A soft or sinking pedal means stop driving and get it checked.",
    diy: "No",
    links: ["gas-pedal", "shifter", "light-brake"],
    cross: ["bay:brake-booster", "bay:master-cylinder"],
  },
  "gas-pedal": {
    name: "Gas pedal (accelerator)",
    sys: ["controls"],
    what: "The gas pedal is the narrow pedal on the right that makes the car go faster. Pressing it opens the throttle (the engine's air valve) so the engine makes more power.",
    check:
      "It should spring back smoothly when you lift your foot. Keep floor mats from bunching up under it.",
    trouble: "If it ever sticks, shift to N (Neutral), brake firmly and pull over.",
    diy: "No",
    links: ["brake-pedal"],
    cross: ["bay:throttle-body"],
  },
  "hood-release": {
    name: "Hood release handle",
    sys: ["controls"],
    what: "The hood release is the handle under the lower left corner of the dashboard that unlocks the hood. Pull it to pop the hood. Then, at the front of the car, push up the latch lever at the center of the hood.",
    check:
      "The hood is held up with a support rod (prop rod), not self-lifting struts. Take the rod out of its clamp by the grip and put its end in the hole in the hood.",
    trouble:
      "To close it, lower the hood to about 12 inches (30 cm) and let it drop. Don't open it with the wiper arms raised.",
    diy: "Easy",
    links: [],
  },
  "trunk-release": {
    name: "Trunk release lever",
    sys: ["controls"],
    what: "The trunk release is a lever on the floor, to the lower left of the driver's seat, that opens the trunk. Pull it to open the trunk. The key remote also has a trunk button.",
    tip: "There's an emergency trunk opener inside the trunk too.",
    check: "If the trunk-open light stays on, close the lid firmly.",
    trouble: "Keep the trunk closed while driving, because exhaust fumes can get in.",
    diy: "No",
    links: ["fuel-release"],
  },
  "fuel-release": {
    name: "Fuel door release lever",
    sys: ["controls"],
    what: "The fuel door release is a handle at the foot of the driver's seat that opens the fuel door. The fuel door is on the driver's (left) side at the rear of the car.",
    spec: "Fuel: 87 octane or higher unleaded. Tank: 13.2 US gal (50 L).",
    check:
      'Pull up at the pump with the pump on your left. Tighten the gas cap until it clicks. A loose cap shows a "TIGHTEN FUEL CAP" message.',
    trouble: "",
    diy: "No",
    links: ["trunk-release", "light-fuel", "fuel-gauge"],
  },
  shifter: {
    name: "Gear shifter (5-speed automatic)",
    sys: ["controls"],
    what: "The shifter is the lever you use to pick Park, Reverse, Neutral or Drive. P = Park (start the engine here). R = Reverse. N = Neutral. D = normal driving; it shifts through all 5 gears by itself. D3 = for hills, up or down. 2 = stays in 2nd gear for more engine braking (the engine helps slow the car). 1 = stays in 1st gear.",
    check: "Press the brake firmly to shift out of P. Come to a full stop before shifting between D and R.",
    trouble:
      "If the D on the gear display blinks while you drive, the transmission has a problem. See a dealer immediately.",
    diy: "No",
    links: ["gear-display", "brake-pedal", "parking-brake"],
    cross: ["bay:transmission"],
  },
  "parking-brake": {
    name: "Parking brake lever",
    sys: ["controls", "safety"],
    what: "The parking brake is the hand lever between the front seats that holds the car still when you park. It holds the rear brakes on.",
    check:
      "To apply it, pull it fully up without pressing the button. To release it, pull up slightly, press and hold the button, and lower the lever all the way.",
    trouble:
      'If you drive with it on, a buzzer sounds and "RELEASE PARKING BRAKE" shows on the i-MID. The red BRAKE light stays on while it\'s set.',
    diy: "No",
    links: ["light-brake", "shifter"],
    cross: ["chassis:parking-brake"],
  },

  // ------------------------------------------------------------------ filters & fuses
  glovebox: {
    name: "Glove box",
    sys: ["filters"],
    what: "The glove box is the storage compartment on the passenger side of the dashboard. It also hides the cabin air filter. Squeeze the two side walls inward so the stops clear the dash, and the box swings all the way down.",
    check: "Empty it first, then squeeze both sides and lower it gently.",
    trouble:
      "To close it, push the sides in again and swing it up until the stops click back behind the dash.",
    diy: "Easy",
    links: ["filter-housing", "cabin-filter"],
  },
  "filter-housing": {
    name: "Cabin filter cover (blower housing)",
    sys: ["filters"],
    what: "This small cover behind the glove box holds the cabin air filter in place. It's part of the black plastic blower housing (the box with the heater/A-C fan). It has tabs on both sides.",
    check: "Press the tabs on both sides of the cover and pull it out. The filter slides out behind it.",
    trouble: "Make sure the cover clips back in fully, or air can bypass the filter.",
    diy: "Easy",
    links: ["cabin-filter", "glovebox", "hvac"],
  },
  "cabin-filter": {
    name: "Cabin air filter (dust & pollen filter)",
    sys: ["filters"],
    what: "The cabin air filter cleans the air that blows into the car through the vents. It's a pleated paper filter that catches pollen, dust and other dirt in the air.",
    spec: "Honda part 80292-SDA-407 (listed for the 2013 Civic 4-door LX), about 9.5 × 9.7 × 1.3 in. Replace it at Maintenance Minder sub-item 2, or every 15,000 mi (24,000 km) if you drive mostly in cities with a lot of soot.",
    check: "Pull it out and look. A grey, clogged filter full of leaves needs replacing.",
    trouble: "When it's clogged, airflow from the vents drops noticeably and the windows fog up easily.",
    tip: 'Fit the new one with the "AIR FLOW" arrow pointing DOWN. No tools needed.',
    diy: "Easy",
    links: ["filter-housing", "glovebox", "hvac", "light-wrench"],
  },
  "fuse-box": {
    name: "Fuse box (inside, under the dash)",
    sys: ["filters"],
    what: "The interior fuse box is a panel of small fuses under the driver's side of the dashboard, near your left knee. Each fuse is a weak link that blows (burns out) to protect one circuit. There's a second, bigger fuse box under the hood next to the brake fluid reservoir.",
    spec: "Examples from the manual: No. 3 SRS (airbags) 10 A, No. 4 fuel pump 15 A, No. 27 front power socket (20 A in the manual, 15 A on one fuse site; trust the label in your car), No. 46 wipers 30 A. The fuse map is on a label on the side panel. Fuses are low-profile mini blade fuses (the small, flat plug-in type).",
    check:
      "A blown fuse has a broken metal strip inside. The fuse puller is clipped to the back of the under-hood fuse box cover.",
    trouble:
      'Replace a fuse only with one of the same amp rating. A bigger one "greatly increases" the risk of electrical damage. If the new fuse blows right away, there\'s a short circuit; take the car to a shop.',
    diy: "Easy",
    links: ["audio", "light-srs"],
    cross: ["bay:fuse-box"],
  },

  // ------------------------------------------------------------------ safety
  airbags: {
    name: "Airbags (SRS)",
    sys: ["safety"],
    what: "Airbags are cushions that inflate in a crash to protect you, and your Civic has six. Front: the driver's is in the center of the steering wheel and the passenger's is in the dashboard (both marked SRS AIRBAG). Side: in the outer edge of both front seat-backs. Curtain: in the ceiling above the side windows; they also deploy (inflate) in a rollover.",
    spec: "The front airbags are dual-stage and multiple-threshold: they can inflate with more or less force depending on the crash. The side airbags are Honda's SmartVent type. No knee airbags.",
    check: "When you turn the key to ON, the SRS (airbag) light should come on and then go off.",
    trouble:
      "If the SRS light stays on, the airbags may not deploy. Don't put covers or objects over airbag areas.",
    diy: "No",
    links: ["light-srs", "seatbelt", "wheel"],
  },
  seatbelt: {
    name: "Seat belts",
    sys: ["safety"],
    what: "Seat belts hold you in your seat in a crash. They're three-point belts (across your lap and over your shoulder). The front belts have tensioners that tighten them in a crash; they're part of the SRS (airbag) system.",
    check: "Pull the belt out quickly: it should lock. The buckle should latch with a click.",
    trouble: "A belt that won't retract or lock needs a shop. The SRS light also covers the tensioners.",
    diy: "No",
    links: ["light-belt", "light-srs", "airbags"],
  },
  "seat-driver": {
    name: "Driver's seat",
    sys: ["safety", "controls"],
    what: "The driver's seat is a cloth seat you adjust by hand. Pull up the bar under the front to slide it, pull up the lever to recline it, and use the height lever (driver's seat only).",
    spec: "Edmunds: 6-way manual driver's seat (it adjusts by hand in 6 directions). The side airbag is in the outer edge of the seat-back.",
    check:
      "Sit with a slight bend in your knees at full brake and your wrists reaching the top of the wheel.",
    trouble: "Don't hang things on the outer side of the seat-back where the side airbag comes out.",
    diy: "No",
    links: ["seatbelt", "airbags"],
  },
  "seat-passenger": {
    name: "Front passenger seat",
    sys: ["safety"],
    what: "The front passenger seat is a cloth seat that slides and reclines by hand (Edmunds: 4-way). Its side airbag is in the outer edge of the seat-back.",
    check:
      "The seat belt reminder for this seat comes on about 6 seconds after you turn the key to ON if the passenger is unbelted.",
    trouble: "",
    diy: "No",
    links: ["airbags", "seatbelt"],
  },
  "rear-seat": {
    name: "Rear seat",
    sys: ["safety"],
    what: "The rear seat is the back bench, and its seatback folds down to make the trunk longer. On the LX it folds as one piece; the 60/40 split (two parts) was only on EX/EX-L.",
    check: "Make sure the seatback latches firmly when you raise it again.",
    trouble: "",
    diy: "No",
    links: [],
  },
  mirror: {
    name: "Rear-view mirror",
    sys: ["controls"],
    what: "The rear-view mirror is the inside mirror at the top of the windshield. Together with the side mirrors, it shows what's behind you.",
    check: "Set it so you see the whole rear window without moving your head.",
    trouble: "",
    diy: "No",
    links: [],
  },
};
