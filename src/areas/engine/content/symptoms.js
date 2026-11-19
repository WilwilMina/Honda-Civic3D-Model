// Engine internals symptoms: "what's wrong?" entries (urgency, what you notice, and the likely parts with why
// and how to check). Re-exported by ../content.js as SYMPTOMS.

export const SYMPTOMS = [
  {
    id: "tick",
    label: "Ticking noise from the top of the engine",
    urgency: "soon",
    detail: "A light, fast tick-tick-tick that follows engine speed, loudest from under the valve cover.",
    causes: [
      {
        part: "rockers",
        why: "Valve clearance has opened up. A loose gap lets the rocker click the valve each time it opens.",
        check: "Have the valves adjusted (Minder code 4 job). Not urgent, but don't ignore it for years.",
      },
      {
        part: "oil-pan",
        why: "Low or very old oil reaches the top of the engine last, so the valve parts up there get noisy first.",
        check: "Check the dipstick right now. Top up with 0W-20 if it's low.",
      },
      {
        part: "spark-plug",
        why: "A loose spark plug can leak burning gas, with a ticking or puffing sound.",
        check: "If the plugs were recently changed, have them checked for proper tightness (torque).",
      },
    ],
    note: "A tick is usually not an emergency. A deep knock from lower down is a different story.",
    group: "Noises",
  },
  {
    id: "knock",
    label: "Deep knocking that gets faster when I rev",
    urgency: "stop",
    detail:
      "A heavy, rhythmic knocking from low in the engine that gets faster as you rev and louder under load.",
    causes: [
      {
        part: "rod",
        why: "A worn rod bearing lets the rod hammer the crankshaft on every turn ('rod knock').",
        check:
          "Stop driving and check the oil level. A shop can confirm with an oil-pressure test and a mechanic's stethoscope.",
      },
      {
        part: "crankshaft",
        why: "Worn main bearings knock lower and duller than rod bearings.",
        check: "Same as above: don't keep driving it.",
      },
      {
        part: "oil-pump",
        why: "Too little oil pressure starves the bearings, which is what wears them out.",
        check: "Is the oil light flickering? Look at the oil level and condition.",
      },
    ],
    note: "Driving on with a rod knock can end with a broken rod and severe engine damage, so a tow to the shop is the safer choice.",
    group: "Noises",
  },
  {
    id: "oillight",
    label: "Red oil-can light comes on",
    urgency: "stop",
    detail: "The red oil pressure warning lights up or flickers while driving.",
    causes: [
      {
        part: "oil-pan",
        why: "The oil level is very low, so the pump's pickup is sucking air.",
        check: "Pull over, shut the engine off, wait a few minutes and check the dipstick.",
      },
      {
        part: "oil-pump",
        why: "A clogged pickup screen or worn pump can't make enough pressure.",
        check: "If the level is fine and the light stays on, tow it to a shop.",
      },
      {
        part: "rod",
        why: "Worn bearings leak oil pressure away.",
        check: "It usually comes with knocking. A shop measures oil pressure with a gauge.",
      },
    ],
    note: "Honda warns that running with low oil pressure can cause serious engine damage almost immediately. Stop as soon as it's safe.",
    group: "Warning lights",
  },
  {
    id: "misfire",
    label: "Car shakes at idle, or check-engine light flashing",
    urgency: "stop",
    detail: "The engine stumbles or shakes, feels down on power, and the check-engine light may flash.",
    causes: [
      {
        part: "coil",
        why: "A failing coil stops sparking in one cylinder.",
        check:
          "Read the code (P0301–P0304 tells you which cylinder). Swap that coil with the one next to it and see if the code moves.",
      },
      {
        part: "spark-plug",
        why: "A worn or fouled (dirty) plug can't fire reliably.",
        check: "If the plugs are original at high mileage, replace all four.",
      },
      {
        part: "rockers",
        why: "A valve adjusted too tight doesn't close fully, so that cylinder leaks compression.",
        check: "Ask for a compression test on the misfiring cylinder. A valve adjustment often fixes it.",
      },
      {
        part: "valves-ex",
        why: "A burnt exhaust valve leaks, giving a steady misfire and low compression.",
        check: "Ask a shop for a compression or leak-down test.",
      },
    ],
    note: "A flashing check-engine light means unburned fuel is going into the catalytic converter and can overheat it. Honda says: stop somewhere safe away from anything flammable, turn the engine off, let it cool at least 10 minutes, then take the car to a dealer.",
    group: "Warning lights",
  },
  {
    id: "bluesmoke",
    label: "Blue-gray smoke, or the engine uses oil",
    urgency: "soon",
    detail:
      "Bluish smoke from the tailpipe, a burning-oil smell, or the dipstick keeps reading low between changes.",
    causes: [
      {
        part: "rings",
        why: "Worn or stuck rings let oil get past into the combustion chamber, where it burns.",
        check: "Look for smoke when accelerating. A compression test confirms it.",
      },
      {
        part: "valve-springs",
        why: "Hardened valve stem seals drip oil down the valves while the car sits.",
        check: "A big puff right after a cold start that clears quickly points to stem seals.",
      },
      {
        part: "piston",
        why: "A damaged piston or ring land (the ridge between ring grooves) lets oil burn in one cylinder.",
        check: "One oily spark plug shows which cylinder.",
      },
    ],
    note: "Keep the oil topped up while you sort it out; running low makes everything worse.",
    group: "Smoke & smells",
  },
  {
    id: "whitesmoke",
    label: "Sweet-smelling white smoke, coolant going down",
    urgency: "stop",
    detail: "Thick white smoke that smells sweet, plus the coolant reservoir dropping with no puddle.",
    causes: [
      {
        part: "head-gasket",
        why: "A leak in the head gasket lets coolant into the cylinder, where it turns to steam.",
        check: "A shop can test for exhaust gas in the coolant (a 'block test') or pressure-test the system.",
      },
      {
        part: "head",
        why: "A cylinder head warped or cracked from overheating leaks coolant the same way.",
        check: "This is usually found while replacing the head gasket.",
      },
    ],
    note: "Thin white vapor on a cold morning that disappears once warm is just condensation. That's normal.",
    group: "Smoke & smells",
  },
  {
    id: "milky",
    label: "Oil looks milky or light brown",
    urgency: "stop",
    detail: "Oil on the dipstick or under the oil cap looks like chocolate milk.",
    causes: [
      {
        part: "head-gasket",
        why: "Coolant is mixing into the oil through a failed gasket.",
        check: "Check whether the coolant level is dropping. Don't drive it until it's checked.",
      },
      {
        part: "block",
        why: "Rarely, a cracked block or head does the same.",
        check: "A shop pressure test finds it.",
      },
    ],
    note: "A little creamy film only under the cap, after lots of short trips in winter, is usually condensation, not a gasket.",
    group: "Smoke & smells",
  },
  {
    id: "vtec-code",
    label: "Check-engine light with a VTEC oil-pressure code",
    urgency: "soon",
    detail:
      "The check-engine light is on and a scan shows P2646, P2647, P2651 or P2652 (rocker arm oil pressure switch / circuit).",
    causes: [
      {
        part: "rockers",
        why: "i-VTEC uses oil pressure to switch one intake rocker per cylinder, and a switch reports that pressure. Honda service bulletin A13-021 (on file with NHTSA) covers these codes on 2012–13 Civics (except Si and Hybrid): the switch can fail on and off and may need replacing.",
        check: "Have the code read and ask the dealer about service bulletin (TSB) A13-021.",
      },
      {
        part: "oil-pan",
        why: "The i-VTEC switching runs on engine oil, so a low oil level is worth ruling out first.",
        check: "Check the dipstick and top up with 0W-20 if it's low.",
      },
    ],
    note: "Get it checked soon. If the red oil-pressure light comes on as well, stop the engine: that's a different, urgent problem.",
    group: "Warning lights",
  },
  {
    id: "rattle",
    label: "Rattle for a few seconds after a cold start",
    urgency: "watch",
    detail: "A chain-like rattle right after starting a cold engine that fades in a few seconds.",
    causes: [
      {
        part: "tensioner",
        why: "If the automatic tensioner isn't holding the chain snug, the chain can slap against its guides.",
        check: "Note how long it lasts. If it gets longer over time, have it checked.",
      },
      {
        part: "chain",
        why: "A stretched chain is harder to keep tight.",
        check: "A shop can check for cam/crank timing codes or look at the chain.",
      },
      {
        part: "oil-pan",
        why: "Low or wrong oil makes the tensioner slow to pump up.",
        check: "Check the level, and use 0W-20.",
      },
    ],
    group: "Noises",
  },
  {
    id: "weak",
    label: "Engine feels weak and gas mileage is worse",
    urgency: "watch",
    detail: "The car feels sluggish and mpg has dropped, but nothing dramatic is happening.",
    causes: [
      {
        part: "spark-plug",
        why: "Worn plugs make a weaker spark and burn fuel less completely.",
        check: "Original plugs past about 100,000 miles? Replace them (Minder code 4).",
      },
      {
        part: "rockers",
        why: "Valves out of adjustment open the wrong amount and hurt the engine's breathing.",
        check: "Have the valve clearance checked.",
      },
      {
        part: "rings",
        why: "Worn rings lose compression, so each bang pushes less.",
        check: "Ask for a compression test on all four cylinders.",
      },
    ],
    note: "Also check the simple stuff from the engine bay: air filter, tire pressure, and any check-engine codes.",
    group: "How it drives",
  },
];
