// Under-the-car symptoms: "what's wrong?" entries (leaks, noises, smoke and smells), each pointing at the parts that can
// cause it. Re-exported by ../content.js as SYMPTOMS. Leak colours follow the AAA leak guide
// https://www.acg.aaa.com/connect/blogs/4c/auto/guide-to-automotive-leaks and docs/research/*.md.

export const SYMPTOMS = [
  {
    id: "drip",
    label: "Drip or puddle under the car",
    urgency: "soon",
    group: "Leaks & fluids",
    detail:
      "Slide a piece of white cardboard under the car overnight. The color, the feel and where the spot is tell you what's leaking.",
    causes: [
      {
        part: "oil-drain-plug",
        why: "Black, amber or brown, thick and oily, under the front of the car: engine oil. A loose drain bolt or a reused washer is a common cause after an oil change.",
        check:
          "Look for a wet, dirty patch on the oil pan around the drain bolt. Check the oil level with the orange dipstick.",
      },
      {
        part: "atf-drain-plug",
        why: "Red or brown, under the middle-front of the car: transmission fluid.",
        check:
          "Check the ATF level with the yellow-loop dipstick (warm engine, then off, read within 90 seconds).",
      },
      {
        part: "bay:radiator",
        why: "Blue fluid at the front: coolant. This car uses Honda Type 2 coolant, which is blue.",
        check: "Check the coolant reservoir level with the engine cold. Never open a hot radiator cap.",
      },
      {
        part: "fuel-tank",
        why: "Clear, thin and smells like gasoline, near the back: fuel. AAA warns a single spark could light it.",
        check: "Don't drive it. Don't start the engine if the smell is strong. Have it towed and checked.",
      },
      {
        part: "bay:brake-reservoir",
        why: "Clear to light brown or yellow, slimy, near a wheel: brake fluid.",
        check:
          "Check the brake fluid reservoir. If it's low or the pedal feels soft, don't drive. Have it towed.",
      },
    ],
    note: "Clear water with no smell under the front passenger area after using the A/C is normal condensation. This car has electric power steering, so there's no power-steering fluid to leak. Leak colors are from AAA's guide to automotive leaks.",
  },
  {
    id: "fuelsmell",
    label: "I smell gasoline around the car",
    urgency: "stop",
    group: "Smoke & smells",
    detail: "A raw-gas smell (not exhaust), strongest near the back of the car or the fuel door.",
    causes: [
      {
        part: "filler-neck",
        why: "A loose or worn gas cap, or a leaking filler neck or vent hose, lets fuel and fumes escape.",
        check:
          "Turn the gas cap until it clicks. If the smell stays, look for wet spots near the left rear wheel.",
      },
      {
        part: "fuel-lines",
        why: "A leaking fuel line along the floor drips fuel under the car.",
        check: "Look for wet spots or drips along the floor. Don't drive with fuel dripping.",
      },
      {
        part: "fuel-tank",
        why: "The tank is damaged, or the pump module inside the tank is leaking.",
        check: "Look for a wet patch under the tank, ahead of the rear wheels. Have it towed to a shop.",
      },
    ],
    note: "Fuel vapor can catch fire. Don't smoke near the car, and don't keep driving with a strong gas smell.",
  },
  {
    id: "loudexhaust",
    label: "Exhaust suddenly got much louder",
    urgency: "soon",
    group: "Noises",
    detail:
      "A rumble or roar that gets louder when you press the gas, or a puffing or ticking sound at idle.",
    causes: [
      {
        part: "flex-joint",
        why: "The flexible joint's gasket (seal) blows out, or a spring bolt breaks, so gas escapes under the front seats.",
        check: "On a lift, look for black soot around the joint.",
      },
      {
        part: "front-pipe",
        why: "A crack or rust hole in the front pipe.",
        check: "Look for soot marks. A shop can find small leaks with the engine running.",
      },
      {
        part: "muffler",
        why: "The muffler or its seams rust through from the inside.",
        check: "Look for holes or rusty drips at the muffler seams.",
      },
      {
        part: "center-pipe",
        why: "The center pipe rusts through under the floor.",
        check: "Look along the pipe for holes and soot.",
      },
    ],
    note: "If you smell exhaust inside the car, open the windows and get it fixed right away. Exhaust contains carbon monoxide, which you can't see or smell.",
  },
  {
    id: "rattleunder",
    label: "Rattle or buzz from under the car",
    urgency: "watch",
    group: "Noises",
    detail: "A tinny buzz or rattle from underneath, often at idle, at certain engine speeds or over bumps.",
    causes: [
      {
        part: "heat-shields",
        why: "A heat shield's bolts rust loose and the thin metal buzzes against the pipe or the floor.",
        check: "With the exhaust cold, click the shields. A loose one will rattle.",
      },
      {
        part: "hangers",
        why: "A cracked or stretched rubber hanger lets the pipe swing and knock.",
        check: "With the exhaust cold, gently shake the tailpipe. A clunk means a hanger or pipe is loose.",
      },
      {
        part: "engine-cover",
        why: "Missing screws in the engine under cover (often after an oil change) let it vibrate or flap.",
        check: "Look under the front: is the cover hanging down or missing screws?",
      },
      {
        part: "muffler",
        why: "A broken baffle inside the muffler rattles around.",
        check: "Click the muffler when cold and listen for loose bits inside.",
      },
    ],
  },
  {
    id: "scrape",
    label: "Scraping noise over bumps",
    urgency: "watch",
    group: "Noises",
    detail: "Something drags or scrapes on speed bumps, driveways or at highway speed.",
    causes: [
      {
        part: "under-covers",
        why: "A plastic floor cover or strake has torn loose and hangs down.",
        check: "Look under the car for a hanging panel and missing clips.",
      },
      {
        part: "engine-cover",
        why: "The engine under cover is loose or bent.",
        check: "Check that all its screws are in.",
      },
      {
        part: "hangers",
        why: "A broken hanger lets the exhaust sag low enough to hit the ground.",
        check: "Look for a sagging pipe or muffler.",
      },
    ],
  },
];
