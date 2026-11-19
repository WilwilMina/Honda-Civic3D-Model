// Cabin area symptoms: "what does it mean when..." entries (warning lights, starting, driving, comfort), each
// pointing at the parts that can cause it. Re-exported by ../content.js. Facts: docs/research/cabin.md.

export const SYMPTOMS = [
  // ---------------------------------------------------------------- Warning lights
  {
    id: "brakelight",
    label: "Red BRAKE light stays on",
    urgency: "stop",
    group: "Warning lights",
    detail:
      "The BRAKE light is on with the parking brake set. If it stays on after you fully release the lever, the brake fluid may be low or the brake system has a fault.",
    causes: [
      {
        part: "parking-brake",
        why: 'The lever isn\'t all the way down. A beep while driving and "RELEASE PARKING BRAKE" on the i-MID confirm it.',
        check: "Pull up slightly, hold the button and lower the lever fully.",
      },
      {
        part: "bay:brake-reservoir",
        why: "Low brake fluid turns the light on. A level at or below MIN usually means worn pads or a leak.",
        check: "Look at the fluid level under the hood.",
      },
      {
        part: "chassis:pads",
        why: "As pads wear, the brake fluid level drops.",
        check: "Have the pad thickness checked.",
      },
      {
        part: "bay:abs",
        why: "If the BRAKE and ABS lights are on together, the system that balances braking between the front and rear wheels isn't working.",
        check: "Have a dealer inspect it immediately.",
      },
    ],
    note: "Press the pedal lightly. If it feels normal, check the fluid at your next stop. If it feels soft or wrong, act right away and get it repaired.",
  },
  {
    id: "abslight",
    label: "ABS light stays on",
    urgency: "soon",
    group: "Warning lights",
    detail:
      "The ABS light should go out a few seconds after key-ON. If it's on any other time, the anti-lock system has a problem. Normal braking still works, but the wheels can lock in a panic stop.",
    causes: [
      {
        part: "light-abs",
        why: "Normal at key-ON for the bulb check, then it should go out.",
        check: "Note when it comes on and whether it stays on after a restart.",
      },
      {
        part: "chassis:abs-sensor",
        why: "The ABS watches a speed sensor at each wheel. A sensor problem is one thing that sets the light.",
        check: "A shop's scan tool (code reader) shows which part set the light.",
      },
      {
        part: "bay:abs",
        why: "The ABS / stability control unit itself may have a fault.",
        check: "Have a dealer check it.",
      },
    ],
    note: "If the red BRAKE light is on too, get it inspected immediately.",
  },
  {
    id: "srslight",
    label: "Airbag (SRS) light stays on",
    urgency: "soon",
    group: "Warning lights",
    detail:
      "The SRS light comes on at key-ON and should go off. If it stays on (or never comes on), the airbags or belt tensioners may not work in a crash.",
    causes: [
      {
        part: "airbags",
        why: "A fault in the front, side or curtain airbag system.",
        check: "Have a dealer read the SRS code.",
      },
      {
        part: "seatbelt",
        why: "The front belt tensioners are part of the same system.",
        check: "Have a dealer check it.",
      },
      {
        part: "fuse-box",
        why: "The SRS has its own fuse (No. 3, 10 A) in the interior fuse box.",
        check: "Look at fuse No. 3. If it's blown, still have the system checked.",
      },
    ],
  },
  {
    id: "tpmslight",
    label: "Tire pressure light is on",
    urgency: "soon",
    group: "Warning lights",
    detail:
      'Steady = one or more tires are significantly low ("CHECK TIRE PRESSURE" on the i-MID screen). Blinks about a minute and then stays on = a problem with the tire pressure system (TPMS), or the small spare is fitted.',
    causes: [
      {
        part: "chassis:tire",
        why: "One or more tires is low. Cold weather lowers pressure too.",
        check: "Check all four tires cold and fill to the sticker in the driver's door jamb.",
      },
      {
        part: "chassis:wheel",
        why: "Your 2013 Civic has a pressure sensor inside each wheel. If the light blinked first, a sensor or the system has a problem, or the spare is on.",
        check:
          "Put the repaired full-size tire back on, or see a dealer. New sensors need a shop's scan tool.",
      },
    ],
    note: "There's no owner TPMS reset button on a 2013 Civic.",
  },
  {
    id: "vsalight",
    label: "Skid (VSA) light stays on",
    urgency: "soon",
    group: "Warning lights",
    detail:
      "A blinking VSA light just means the stability system is working on a slippery road. Steady means VSA has a problem.",
    causes: [
      {
        part: "light-vsa",
        why: "Steady = a problem with Vehicle Stability Assist. Also check the separate VSA OFF light: if it's on, VSA was switched off with its button.",
        check:
          "Press the VSA OFF button to turn VSA back on. If the VSA light stays on, have a dealer check it.",
      },
      {
        part: "bay:abs",
        why: "Stability control is run by the ABS / stability control unit.",
        check: "Have a dealer scan it for codes.",
      },
    ],
  },
  {
    id: "dblink",
    label: "The D on the dash blinks while I drive",
    urgency: "soon",
    group: "Warning lights",
    detail:
      "If the D indicator blinks while you drive, in any gear, the automatic transmission has detected a problem.",
    causes: [
      {
        part: "gear-display",
        why: "The blinking D is how the car reports a transmission problem.",
        check: "Avoid sudden starts and hard acceleration.",
      },
      {
        part: "bay:transmission",
        why: "The problem is in the 5-speed automatic transmission.",
        check: "See a dealer immediately.",
      },
    ],
  },
  {
    id: "fuellight",
    label: "Low fuel light is on",
    urgency: "watch",
    group: "Warning lights",
    detail: "About 1.9 US gallons (7.5 L) is left in the 13.2-gallon tank.",
    causes: [
      {
        part: "light-fuel",
        why: "Normal low-fuel warning. If it blinks, the fuel gauge may have a problem.",
        check: "Refuel soon.",
      },
      {
        part: "fuel-release",
        why: "Open the fuel door with this lever at the foot of the driver's seat. The filler is on the driver's side, rear.",
        check: "Use 87 octane or higher.",
      },
    ],
  },
  {
    id: "bluetemp",
    label: "Blue temperature light stays on",
    urgency: "watch",
    group: "Warning lights",
    detail: "The blue light means the engine is still cold. That's normal for the first part of a drive.",
    causes: [
      {
        part: "light-temp-low",
        why: "Normal until the engine warms up. If it stays on after the engine is fully warm, a temperature sensor may be faulty.",
        check: "If it never goes out, see a dealer.",
      },
    ],
  },
  {
    id: "doorlight",
    label: "Door-open light is on",
    urgency: "watch",
    group: "Warning lights",
    detail: "A door (or, with its own light, the trunk) isn't fully closed.",
    causes: [
      {
        part: "light-door",
        why: "A door isn't latched all the way.",
        check: "Open and firmly close each door.",
      },
      {
        part: "trunk-release",
        why: "The trunk has its own open light. Keep it closed while driving because of exhaust fumes.",
        check: "Close the trunk lid firmly.",
      },
    ],
  },
  {
    id: "service",
    label: '"SERVICE DUE SOON" on the screen',
    urgency: "watch",
    group: "Warning lights",
    detail:
      "The Maintenance Minder says service is coming up: SOON at 15–6% oil life, NOW at 5–1%, PAST DUE below zero.",
    causes: [
      {
        part: "light-wrench",
        why: "The Minder shows a code: letter A or B, plus sub-items 1–6 for extra jobs.",
        check: "Read the code, book the service, then reset it (see the DIY tab).",
      },
      {
        part: "cabin-filter",
        why: "Sub-item 2 includes replacing the cabin (dust and pollen) filter, an easy DIY job.",
        check: "See the filter card for the steps.",
      },
    ],
  },
  // ---------------------------------------------------------------- Starting & electrical
  {
    id: "keyblink",
    label: "Green key light blinks and the engine won't start",
    urgency: "soon",
    group: "Starting & electrical",
    detail:
      "The immobilizer (anti-theft system) didn't recognise the chip in your key, so it won't let the engine start.",
    causes: [
      {
        part: "light-key",
        why: "The key chip wasn't read.",
        check:
          "Turn the key to LOCK, take it out, put it back in and turn it to ON again. If it keeps blinking, see a dealer.",
      },
    ],
  },
  {
    id: "fuseout",
    label: "Power socket, wipers or radio stopped working",
    urgency: "soon",
    group: "Starting & electrical",
    detail: "When one electrical thing dies and everything else works, check its fuse first.",
    causes: [
      {
        part: "fuse-box",
        why: "Many cabin circuits are here, for example No. 27 front power socket and No. 46 wipers (30 A).",
        check:
          "Find the fuse on the side-panel label and look for a broken strip. Replace it with the same amp rating only.",
      },
      {
        part: "bay:fuse-box",
        why: "The under-hood box has others, such as headlights, horn, hazards, interior lights, rear defogger and blower.",
        check: "Its diagram is on the cover, and the fuse puller is clipped to the back of the cover.",
      },
    ],
  },
  // ---------------------------------------------------------------- How it drives
  {
    id: "stuckpark",
    label: "Shifter won't come out of Park",
    urgency: "watch",
    group: "How it drives",
    detail: "The shifter is locked in P until you press the brake.",
    causes: [
      {
        part: "brake-pedal",
        why: "You must press the brake pedal firmly to shift out of P.",
        check: "Press harder on the brake, then press the shifter's release button.",
      },
      {
        part: "shifter",
        why: "The lever also has a release button.",
        check: "Hold the button in while moving the lever.",
      },
    ],
  },
  // ---------------------------------------------------------------- Comfort
  {
    id: "weakair",
    label: "Weak air from the vents, or windows fog up easily",
    urgency: "watch",
    group: "Comfort",
    detail:
      "Honda says to replace the dust and pollen (cabin air) filter if airflow drops noticeably or the windows fog easily.",
    causes: [
      {
        part: "cabin-filter",
        why: "A clogged filter blocks the air going into the cabin.",
        check: "Drop the glove box and pull the filter out to look. Replacing it is an easy no-tool job.",
      },
      {
        part: "hvac",
        why: "Check the fan speed and mode settings. Pressing A/C helps dry the air and clear fog.",
        check: "Try a higher fan speed and the defroster button.",
      },
    ],
  },
  {
    id: "nofan",
    label: "No air comes out of the vents at all",
    urgency: "watch",
    group: "Comfort",
    detail: "No air at any fan speed.",
    causes: [
      { part: "hvac", why: "The fan dial may be at OFF (fully left).", check: "Turn the fan dial up." },
      {
        part: "bay:fuse-box",
        why: "The blower circuit is in the under-hood fuse box.",
        check: "Check the blower fuse using the diagram on the cover.",
      },
    ],
  },
];
