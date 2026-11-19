// Lights & wipers parts: one card per lamp, wiper and washer part, keyed by the part ids lights/scene.js tags the
// car's meshes with. Re-exported by ../content.js as PARTS. Facts from docs/research/exterior.md (sections 8 and
// 9) and docs/research/cabin.md (sections 1, 7 and 8).

export const PARTS = {
  headlight: {
    name: "Headlight (whole lamp)",
    sys: ["front"],
    what: "The headlight is the big clear lamp at each front corner that lights the road at night. Shiny mirror-like reflectors inside bounce the bulb light forward onto the road (Honda calls this a multi-reflector halogen headlight). Each one holds a low-beam bulb, a high-beam bulb and, in the clear corner section, the amber turn-signal bulb.",
    spec: "LX: halogen headlights with auto-off (they switch themselves off). Auto-off only: the LX does not switch the headlights on by itself. Low beam HB4 (9006), high beam HB3 (9005).",
    check:
      "Park facing a wall at dusk, switch the lights on and look: both sides should be equally bright. Flash the high beams and check both come on. Walk to the corners and check the amber turn signals blink.",
    trouble:
      "One side dark usually means a burnt-out bulb on that side. Both sides out at once points to something they share, like the light switch or wiring. (Each low beam also has its own 10 A fuse in the engine-bay fuse box.)",
    diy: "Easy",
    tip: "The headlight bulbs are changed from under the hood, not by taking the headlight off the car.",
    links: ["low_beam", "high_beam", "front_turn"],
    cross: ["cabin:stalk-lights", "bay:fuse-box"],
  },
  low_beam: {
    name: "Low-beam bulb",
    sys: ["front"],
    what: "The low beam is the bulb you use for normal night driving. It lights the road ahead without blinding other drivers.",
    spec: "51 W HB4 halogen, trade number 9006 (the number you ask for at a parts store; Honda manual + parts retailers).",
    check:
      "With the car parked, turn the headlights on and look at each headlight from the front: the low beam should be lit, and equally bright, on both sides.",
    trouble:
      "One headlight is dark or noticeably dimmer than the other. A flickering beam can also mean the bulb is near the end or its plug is loose.",
    diy: "Easy",
    tip: "Don't touch the glass of a halogen bulb. Skin oil can make it overheat and shatter. If you touch it, clean it with denatured alcohol (Honda manual). Replacing both sides together keeps the brightness even.",
    links: ["headlight", "high_beam"],
    cross: ["bay:air-box", "bay:washer-tank"],
  },
  high_beam: {
    name: "High-beam bulb",
    sys: ["front"],
    what: "The high beam is the brighter, farther-reaching light for dark roads with nobody ahead. A blue light on the dash shows when it's on.",
    spec: "60 W HB3 halogen, trade number 9005 (Honda manual + parts retailers).",
    check:
      "Push or pull the light lever to switch to high beam, then look at the front of the car (or the light on a wall): both sides should get brighter.",
    trouble: "The blue high-beam light is on in the dash but one side of the car stays dim.",
    diy: "Easy",
    tip: "It's changed the same way as the low beam: unplug the connector, turn the bulb counterclockwise, fit the new one and turn it clockwise (Honda manual).",
    links: ["headlight", "low_beam"],
    cross: ["cabin:stalk-lights"],
  },
  front_turn: {
    name: "Front turn signal / parking light",
    sys: ["front"],
    what: "The front turn signal is the amber bulb in the corner of each headlight that blinks when you signal. The same bulb also glows softly as the parking light and lights the front side marker.",
    spec: "One dual-filament amber bulb, 28/8 W (Honda manual). Retailers list it as 7444NA, but the trade number varies, so compare with your old bulb.",
    check:
      "Turn the hazard flashers on and walk around the car: all four corners should blink at the same steady speed.",
    trouble:
      "The turn-signal arrow on the dash blinks much faster than normal, or not at all, when you signal that side. Honda says this means a turn-signal bulb is out.",
    diy: "Medium",
    tip: "This bulb is reached through the inner fender liner (the plastic lining inside the wheel well), not from the engine bay. Turn the steering wheel all the way the other way, pull the liner clips, fold the liner back and twist the socket out (Honda manual).",
    links: ["headlight", "rear_turn"],
    cross: ["cabin:stalk-lights"],
  },
  brake_tail: {
    name: "Taillight / brake light (outer)",
    sys: ["rear"],
    what: "This red lamp in each rear corner is both your tail light and your brake light. A dim filament (the glowing wire) is the tail light, on with the headlights. A bright filament is the brake light, on when you press the brake pedal.",
    spec: "21/5 W dual-filament bulb (two glowing wires in one bulb), trade number 7443 type (Honda manual + one retailer).",
    check:
      "At night, back up to a garage door or window, or ask a friend. Press the brake pedal and check that both rear corners and the third brake light get bright.",
    trouble:
      "One brake light stays dark when you press the pedal. If all brake lights are out at once, a shared part such as a fuse is more likely than three bulbs.",
    diy: "Easy",
    tip: "Changed from inside the trunk: pry out the clips, pull the trunk side lining back, then turn the socket counterclockwise (Honda manual).",
    links: ["rear_turn", "rear_marker", "inner_tail", "third_brake"],
    cross: ["cabin:brake-pedal"],
  },
  rear_turn: {
    name: "Rear turn signal",
    sys: ["rear"],
    what: "The rear turn signal is the part of the outer taillight that blinks amber when you signal or use the hazard flashers.",
    spec: "21 W amber bulb, trade number 7440A (Honda manual + one retailer).",
    check:
      "Turn the hazards on and look at the back: both rear corners should blink along with the front ones.",
    trouble: "If the dash arrow blinks fast when you signal that side, a bulb on that side is out.",
    diy: "Easy",
    tip: "It sits in the same outer lamp as the brake/tail bulb and is reached the same way, from inside the trunk.",
    links: ["brake_tail", "front_turn"],
    cross: ["cabin:stalk-lights"],
  },
  rear_marker: {
    name: "Rear side marker",
    sys: ["rear"],
    what: "The rear side marker is a small red light on the side of each taillight. It lets other drivers see the car from the side at night.",
    spec: "LED on the sedan. There's no bulb to change: Honda says the dealer replaces the whole unit (the assembly).",
    check: "With the headlights on, look at the rear corner from the side of the car.",
    trouble: "The side of the taillight stays dark while the rest of the lamp works.",
    diy: "No",
    links: ["brake_tail"],
  },
  inner_tail: {
    name: "Inner taillight (on the trunk lid)",
    sys: ["rear"],
    what: "The inner taillight is the red lamp on the trunk lid that glows with the tail lights. The 2013 sedan's taillights continue onto the trunk lid, so the back of the car looks wider at night.",
    spec: "3 CP (candlepower) bulb, trade number 168 type (Honda manual; trade number varies by retailer).",
    check:
      "With the headlights on, look at the back of the car: the inner lamps on the trunk lid should glow on both sides.",
    trouble: "One inner lamp dark while the outer lamps work.",
    diy: "Easy",
    tip: "Trunk-lid bulbs are reached from inside the lid. Unscrew the centre of the fastener, pry out the clips and fold back the trunk-lid lining. Then turn the socket counterclockwise (Honda manual).",
    links: ["reverse", "brake_tail", "plate_light"],
  },
  reverse: {
    name: "Back-up (reverse) light",
    sys: ["rear"],
    what: "The back-up lights are the white lights that turn on when you shift into R (Reverse). They light the ground behind you and warn people you're backing up. They sit in the inner taillights.",
    spec: "16 W bulb (sedan), trade number 921 (Honda manual + retailers).",
    check:
      "With the engine running and your foot on the brake, shift to R and have a friend look (or check the reflection in a window). Both should light.",
    trouble: "One side stays dark in reverse.",
    diy: "Easy",
    tip: "Same access as the inner taillight: from inside the trunk lid.",
    links: ["inner_tail"],
    cross: ["cabin:shifter"],
  },
  plate_light: {
    name: "License plate light",
    sys: ["rear"],
    what: "The license plate light is a small light above the rear plate so the plate can be read at night. It's required by law in most places.",
    spec: "5 W bulb, trade number 168 (Honda manual + retailers).",
    check: "With the headlights on, look at the rear plate: it should be lit evenly.",
    trouble: "The plate is dark at night, which can get you pulled over.",
    diy: "Easy",
    tip: "Fold back the trunk-lid lining, squeeze the tabs on the socket to pull it out and swap the bulb (Honda manual).",
    links: ["inner_tail"],
  },
  third_brake: {
    name: "Third (high-mount) brake light",
    sys: ["rear"],
    what: "The third brake light is the thin red light at the bottom of the rear window. It sits on the shelf behind the back seat and lights with the other brake lights. It's mounted high so drivers several cars back can see it.",
    spec: "Honda's own pages disagree: the 2014 sedan manual's bulb-replacement page says 1.8 L cars use a 21 W bulb (retailers list 7440) and only the 2.4 L Si has an LED, but the same manual's spec table and the 2013 coupe manual say LED. A 2012–15 Civic DIY guide shows a bulb being changed. Look at yours before buying anything.",
    check:
      "Press the brake pedal and check it lights across its whole width (ask a helper or look at a reflection).",
    trouble: "It's dark or partly dark when you brake.",
    diy: "Medium",
    tip: "If yours has a bulb, it is reached from the trunk ceiling, just below the light housing.",
    links: ["brake_tail"],
    cross: ["cabin:brake-pedal"],
  },
  wiper_arm: {
    name: "Wiper arms",
    sys: ["wipers"],
    what: "The wiper arms are the two spring-loaded metal arms that sweep the blades across the windshield. They rest along the bottom of the windshield when parked.",
    spec: "LX: 2-speed + intermittent wipers (intermittent = wipes with a pause). Lever settings: MIST, OFF, INT, LO, HI.",
    check:
      "Run the wipers with washer fluid and watch: both arms should sweep smoothly and park neatly at the bottom.",
    trouble:
      "An arm that doesn't press the blade firmly against the glass leaves a wide streak. Don't open the hood with the wiper arms raised: the hood will hit them (Honda manual).",
    diy: "Easy",
    tip: "When you lift an arm to change a blade, don't let it snap back onto the windshield. Lift the driver's arm first, then the passenger's (Honda manual).",
    links: ["wiper_blade", "washer_nozzle"],
    cross: ["cabin:stalk-wipers"],
  },
  wiper_blade: {
    name: "Wiper blades",
    sys: ["wipers"],
    what: "Wiper blades are the rubber strips on the arms that actually wipe the glass. The rubber wears out and hardens with time and sun.",
    spec: "Driver 650 mm (about 26 in), passenger 575 mm (about 22 in) (Honda parts catalog). Don't use the coupe's sizes; they are longer.",
    check:
      "Look at the rubber edge for cracks or torn bits, and watch a wipe in the rain: it should leave the glass clear without streaks.",
    trouble:
      "Streaks, smears, chattering or skipping across the glass, or a squeal. Honda gives no time interval: replace them when they streak.",
    diy: "Easy",
    tip: "Buy the two sizes separately (26 in and 22 in) and fit the longer one on the driver's side.",
    links: ["wiper_arm"],
    cross: ["cabin:stalk-wipers"],
  },
  washer_nozzle: {
    name: "Washer nozzles",
    sys: ["wipers"],
    what: "The washer nozzles are two small spouts that squirt washer fluid onto the windshield. They spray when you pull the wiper lever toward you.",
    spec: "Two nozzles (Honda parts catalog). The fluid comes from a 2.5 L (2.6 US qt) reservoir under the hood. Exactly where the nozzles mount was not confirmed, so the model shows them as an example.",
    check:
      "Pull the wiper lever toward you: both nozzles should spray onto the glass, not over the roof or onto the hood.",
    trouble:
      "No spray usually means an empty reservoir. Weak or uneven spray can come from a blocked nozzle.",
    diy: "Easy",
    tip: "Use washer fluid, not plain water. Fluid cleans better and the winter kind won't freeze.",
    links: ["wiper_arm", "wiper_blade"],
    cross: ["bay:washer-tank", "cabin:stalk-wipers"],
  },
};
