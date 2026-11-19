// Engine bay symptoms: "what's wrong?" entries (urgency, what you notice, and the likely parts with why and
// how to check). Re-exported by ../content.js as SYMPTOMS.
// Facts were checked against docs/research/engine.md (Honda press kits and spec sheets, owner's manual, parts
// catalog, DIY guides).

export const SYMPTOMS = [
  {
    id: "nostart",
    label: "Car won't start: clicking or slow cranking",
    urgency: "soon",
    detail: "You turn the key and hear clicking, or the engine turns over slowly and doesn't start.",
    causes: [
      {
        part: "battery",
        why: "A weak or old battery can't spin the starter fast enough. Many last roughly 3–5 years.",
        check:
          "Dim dash lights or headlights while cranking point to the battery. Many parts stores test batteries free.",
      },
      {
        part: "ground-cable",
        why: "Loose or crusty cable ends block the current, even with a good battery.",
        check:
          "Look for white or green crust on the terminals. Try to twist each clamp by hand: it shouldn't move.",
      },
      {
        part: "starter",
        why: "A worn starter (or its solenoid, the switch on the starter) just clicks once, even with a strong battery.",
        check: "If a jump start doesn't help and the lights stay bright, suspect the starter.",
      },
    ],
    note: "A jump start gets you going, but find out why the battery was low.",
    group: "Starting & electrical",
  },
  {
    id: "batlight",
    label: "Battery light comes on while driving",
    urgency: "soon",
    detail: "The red battery-shaped light comes on with the engine running.",
    causes: [
      {
        part: "alternator",
        why: "The alternator has stopped charging, so the car is running on the battery alone.",
        check:
          "With the engine running, battery voltage should read about 13.7–14.7 V. Near 12 V means it isn't charging.",
      },
      {
        part: "belt",
        why: "A broken or slipping drive belt stops turning the alternator (and the water pump and A/C).",
        check:
          "With the engine off, look at the belt. Cracks, a shiny glazed surface or a missing belt mean replace it. A squeal often comes first.",
      },
      {
        part: "alt-cable",
        why: "A loose or corroded charging cable can't carry the current.",
        check: "Check that the nut on the back of the alternator is tight, and check the battery terminals.",
      },
    ],
    note: "Honda says: turn off the heater/A-C, rear defogger and other electrical loads and contact a dealer right away. If you must stop briefly, don't turn the engine off, because restarting can drain the battery quickly. If the belt is broken, the water pump has stopped too: watch for overheating and don't keep driving.",
    group: "Starting & electrical",
  },
  {
    id: "overheat",
    label: "Engine overheating or temperature light on",
    urgency: "stop",
    detail:
      "The temperature warning comes on, steam comes from under the hood, or the heater blows cold while the engine is hot.",
    causes: [
      {
        part: "coolant-reservoir",
        why: "Low coolant is a common cause; there's not enough left to carry the heat.",
        check:
          "Only when the engine is cold: check the reservoir between MIN and MAX. Never open the radiator cap hot.",
      },
      {
        part: "fans",
        why: "If the cooling fans don't switch on, the engine overheats in traffic but is fine on the highway.",
        check: "Turn on the A/C: the fans should spin. If they don't, suspect a fan, relay or fuse.",
      },
      {
        part: "thermostat",
        why: "A thermostat stuck shut stops coolant from reaching the radiator.",
        check:
          "Carefully feel the upper radiator hose. If it stays cool while the engine is hot, the thermostat may be stuck shut.",
      },
      {
        part: "water-pump",
        why: "A failed water pump stops coolant from moving.",
        check: "Look for coolant drips or crust near the pump at the belt end of the engine.",
      },
    ],
    note: "Honda's steps: park somewhere safe, turn off accessories and turn on the hazards. If there's no steam, keep the engine running and open the hood; if there is steam or spray, turn the engine off and wait until it stops before opening the hood. Never open the radiator cap hot. Continuing to drive with the high-temperature light on can damage the engine (for example the head gasket).",
    group: "Warning lights",
  },
  {
    id: "cel",
    label: "Check-engine light is on (not flashing)",
    urgency: "watch",
    detail: "The orange engine-shaped light stays on, but the car seems to drive normally.",
    causes: [
      {
        part: "ecm",
        why: "The engine computer has stored a trouble code. The code tells you where to look.",
        check:
          "Read it with any OBD-II code scanner (it plugs into a port under the dash). Many parts stores read codes for free.",
      },
      {
        part: "coils",
        why: "A misfire code (P0300–P0304) means a cylinder isn't firing right. It usually points to a coil or spark plug.",
        check: "If the light starts flashing, see the misfire symptom on the Inside the engine tab.",
      },
      {
        part: "catalytic",
        why: "Code P0420 means the catalytic converter isn't cleaning the exhaust as well as it should.",
        check: "It often appears at high mileage. Fix any misfire first: misfires can damage converters.",
      },
      {
        part: "thermostat",
        why: "Code P0128 means the engine warms up too slowly, usually because the thermostat is stuck open. Honda bulletin A13-044 covers this on these Civics.",
        check:
          "The engine takes a long time to warm up (the blue cold-engine light stays on longer than usual), and the heater feels lukewarm.",
      },
    ],
    note: "A flashing check-engine light is more serious than a steady one. Honda says to stop somewhere safe, turn the engine off, let it cool at least 10 minutes, then take the car to a dealer.",
    group: "Warning lights",
  },
  {
    id: "beltsqueal",
    label: "Squealing from the engine at start-up or with the A/C on",
    urgency: "soon",
    detail:
      "A loud squeal or chirp from the passenger-side end of the engine, often on cold mornings or when the A/C kicks on.",
    causes: [
      {
        part: "belt",
        why: "An old, shiny (glazed) or stretched belt slips on its pulleys.",
        check: "Look for cracks, a shiny surface or frayed edges. It's inspected at Minder code 2.",
      },
      {
        part: "tensioner",
        why: "A weak automatic tensioner can't keep the belt tight.",
        check: "With the engine running, the tensioner arm shouldn't bounce a lot.",
      },
    ],
    group: "Noises",
  },
  {
    id: "sweetsmell",
    label: "Sweet smell or blue puddle under the front",
    urgency: "soon",
    detail:
      "A syrupy smell after driving, or a blue puddle under the front of the car (Honda Type 2 coolant is blue).",
    causes: [
      {
        part: "upper-hose",
        why: "Cracked or soft radiator hoses and loose clamps let coolant seep out.",
        check:
          "When cold, squeeze the hoses: they should feel firm, not mushy or cracked. Look for crust at the ends.",
      },
      {
        part: "radiator",
        why: "Radiators can leak at their plastic tanks or from rock damage.",
        check: "Look for wet spots or crust on the radiator, behind the grille.",
      },
      {
        part: "water-pump",
        why: "A leaking water pump drips at the belt end of the engine.",
        check: "Look for drips or trails below the pump.",
      },
      {
        part: "coolant-reservoir",
        why: "A cracked reservoir or loose cap lets coolant out.",
        check: "Check whether the level keeps dropping between fill-ups.",
      },
    ],
    note: "Coolant is toxic and tastes sweet to pets. Wipe up spills.",
    group: "Leaks & fluids",
  },
  {
    id: "oilleak",
    label: "Oil spots under the car or a burning-oil smell",
    urgency: "soon",
    detail: "Dark brown spots under the engine, or a burning smell after driving.",
    causes: [
      {
        part: "valve-cover",
        why: "An old valve cover gasket seeps oil down onto the hot exhaust, which smells.",
        check: "Look around the edge of the valve cover for wet, dirty oil.",
      },
      {
        part: "oil-pan",
        why: "A loose drain plug or a worn crush washer (the seal on the plug) drips from the bottom.",
        check: "Look at the drain plug after an oil change: it should be dry.",
      },
      {
        part: "oil-filter",
        why: "A loose oil filter, or one with an old gasket stuck under it, leaks quickly.",
        check: "Look for wet oil around the filter right after an oil change.",
      },
    ],
    note: "Keep checking the dipstick until it's fixed. Running low on oil is what does real damage.",
    group: "Leaks & fluids",
  },
  {
    id: "acwarm",
    label: "A/C blows warm air",
    urgency: "watch",
    detail: "The fan blows, but the air isn't cold with the A/C button on.",
    causes: [
      {
        part: "ac-low",
        why: "Low refrigerant from a slow leak is a frequent reason.",
        check:
          "A shop can measure pressures and find the leak. A DIY recharge can may restore cooling for a while, but it doesn't fix the leak.",
      },
      {
        part: "ac-compressor",
        why: "If the compressor clutch doesn't lock on, the A/C pump doesn't run.",
        check:
          "With the A/C on, the center of the compressor pulley should spin. If it doesn't, check the A/C fuse and relay first.",
      },
      {
        part: "condenser",
        why: "A condenser clogged with leaves or bugs can't shed heat, so the A/C is weak in traffic.",
        check: "Look through the grille: it should be clean, not packed with debris.",
      },
    ],
    group: "How it drives",
  },
  {
    id: "shift",
    label: "Gear shifts are harsh, slipping or late",
    urgency: "soon",
    detail:
      "The automatic jerks into gear, the engine revs up between gears, or the car waits before moving.",
    causes: [
      {
        part: "atf-dipstick",
        why: "Low or worn-out transmission fluid makes shifts harsh or slippery.",
        check:
          "Check the yellow loop dipstick with the engine warm, following the owner's manual. Replace the fluid at Minder code 3 with Honda ATF DW-1.",
      },
      {
        part: "transmission",
        why: "Worn clutches inside the transmission, or a problem with a shift solenoid (an electric valve that controls shifting).",
        check: "A shop can read transmission codes and check the fluid's color and smell.",
      },
    ],
    group: "How it drives",
  },
  {
    id: "mountchirp",
    label: "Chirp or squeak over bumps on hot days",
    urgency: "watch",
    group: "Noises",
    detail:
      "A chirp from the passenger side of the engine when driving over rough roads, mostly in hot weather.",
    causes: [
      {
        part: "engine-mount",
        why: "Parts inside the passenger-side engine mount can rub. Honda issued a service bulletin about this chirp.",
        check: "Ask a dealer to look up the bulletin for your car's VIN (its vehicle identification number).",
      },
      {
        part: "belt",
        why: "A dry or worn belt can also chirp.",
        check: "If it chirps while parked and idling, the belt is the more likely cause.",
      },
    ],
  },
];
