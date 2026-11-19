// Under-the-car parts: one card per part seen from below on a lift, keyed by the part ids under/scene.js tags.
// Re-exported by ../content.js as PARTS. Sources: docs/research/chassis.md (Honda 2013 spec sheet, 2014 Civic
// Sedan owner's manual, Honda parts catalog), docs/research/engine.md (2012 Civic Sedan owner's manual "OM12",
// Honda press releases), docs/research/exterior.md.

export const PARTS = {
  "front-pipe": {
    name: "Front exhaust pipe (Pipe A)",
    sys: ["exhaust"],
    what: "The front exhaust pipe carries hot exhaust from the catalytic converter back under the car. On this engine the converter bolts straight to the cylinder head at the front of the engine. So this pipe drops down and runs back under the engine toward the middle of the car.",
    spec: 'Honda\'s parts catalog calls it "Pipe A". There is one catalytic converter on this car, mounted at the engine.',
    check:
      "With the car up on a lift, look for black soot marks or rust holes, especially at the joints. Listen for a ticking or puffing sound at idle.",
    trouble:
      "A cracked pipe or leaking joint makes the car sound louder, like a tractor, especially when you speed up. Exhaust fumes can also get into the cabin.",
    diy: "Hard",
    tip: "This pipe gets very hot. Never touch it right after driving.",
    links: ["flex-joint", "hangers", "heat-shields"],
    cross: ["bay:catalytic", "bay:exhaust-manifold"],
  },
  "flex-joint": {
    name: "Flexible exhaust joint (spring-loaded bolts)",
    sys: ["exhaust"],
    what: "The flexible joint is the bendy connection between the front and center exhaust pipes. It's where Pipe A meets Pipe B. Two flanges (flat rings on the pipe ends) are pulled together by bolts with coil springs on them, so the joint can flex a little as the engine rocks.",
    spec: "Honda's catalog lists flexible-joint gaskets and spring-loaded bolts between the exhaust pipes.",
    check: "Look for soot around the joint, a broken spring, or a rusty, loose bolt.",
    trouble:
      "A blown gasket here gives a puffing or rumbling sound under the front seats and a louder exhaust.",
    diy: "Hard",
    tip: "Old exhaust bolts often rust and snap. That's a big part of why exhaust work is usually left to a shop.",
    links: ["front-pipe", "center-pipe"],
  },
  "center-pipe": {
    name: "Center exhaust pipe (Pipe B)",
    sys: ["exhaust"],
    what: "The center pipe is the long exhaust pipe that runs under the middle of the car to the muffler. It starts at the flexible joint and runs back along the tunnel (the raised channel) in the floor.",
    spec: 'Honda\'s catalog calls it "Pipe B". One parts seller lists its package as about 88.6 in long. Some aftermarket kits call this section a "resonator pipe", but Honda\'s parts list doesn\'t show where a resonator would be, so none is drawn here.',
    check: "Look for rust holes and make sure each rubber hanger is still holding it up.",
    trouble:
      "A rusted-through pipe makes the car louder. If a hanger breaks, the pipe sags and can bang or scrape.",
    diy: "Hard",
    links: ["flex-joint", "muffler", "hangers", "heat-shields"],
  },
  muffler: {
    name: "Muffler",
    sys: ["exhaust"],
    what: "The muffler is the can near the back of the car that makes the exhaust quiet. It sits at the end of Pipe B. Inside, chambers and baffles (inner walls) cancel out the engine's sound pulses.",
    spec: 'One muffler, with a "muffler baffle" heat plate near it (Honda catalog names). Its exact position and shape are simplified in this model.',
    check:
      "Click it gently when it's cold. A rattle inside or rust holes at the seams mean it's wearing out.",
    trouble: "A loud, deep exhaust, a rattle from the back of the car, or drips of rusty water from holes.",
    diy: "Hard",
    tip: "It's normal to see a few drops of clear water from the tailpipe on a cold morning. That's moisture from the burnt fuel.",
    links: ["center-pipe", "tailpipe", "hangers", "heat-shields"],
  },
  tailpipe: {
    name: "Tailpipe",
    sys: ["exhaust"],
    what: "The tailpipe is the end of the exhaust, where gases leave the car. On the LX it's a plain pipe tucked under the rear bumper. A chrome tip came only on the Si.",
    spec: "Single exhaust on the LX. Which side it exits on was not confirmed in any source, so the side shown is a best guess. Check your own car.",
    check:
      "Watch the tailpipe when someone starts the car. After warm-up you should see little or nothing coming out.",
    trouble:
      "Blue smoke can mean the engine is burning oil. Thick white smoke that smells sweet can mean it's burning coolant.",
    diy: "No",
    links: ["muffler"],
    cross: ["engine:rings", "engine:head-gasket"],
  },
  hangers: {
    name: "Exhaust hangers (rubber mounts)",
    sys: ["exhaust"],
    what: "Exhaust hangers are rubber mounts that hang the exhaust from the floor of the car. The rubber soaks up vibration so you don't feel the exhaust buzzing in the car.",
    spec: 'Honda\'s catalog lists three types of "Rubber, Exhaust Mounting".',
    check:
      "Look for cracked, stretched or missing rubbers. With the engine off and cool, gently shake the tailpipe: it should move a little, not clunk.",
    trouble: "A broken hanger lets the pipe sag, bang over bumps, or rattle at idle.",
    diy: "Medium",
    tip: "Hangers are cheap and are one of the few exhaust parts a beginner can often replace, but only with the car safely up on ramps or stands.",
    links: ["center-pipe", "muffler", "front-pipe"],
  },
  "heat-shields": {
    name: "Heat shields (floor heat baffles)",
    sys: ["exhaust", "body"],
    what: "Heat shields are thin, shiny metal plates that keep the exhaust's heat away from the car. They sit between the hot exhaust and the floor, fuel tank and spare-tire well, so heat doesn't cook the cabin floor or the tank.",
    spec: 'Honda\'s catalog lists "Floor Heat Baffle" plates A and B and a "Muffler Baffle" plate.',
    check: "Look for loose or rusted-through spots, especially around the bolts.",
    trouble:
      "The classic sign is a tinny buzz or rattle from under the car at certain engine speeds, often at idle or when you start moving.",
    diy: "Medium",
    tip: "Don't just pull a rattling shield off and throw it away. It's there to protect the floor and fuel tank from heat.",
    links: ["front-pipe", "center-pipe", "muffler", "fuel-tank"],
  },
  "fuel-tank": {
    name: "Fuel tank",
    sys: ["fuel"],
    what: "The fuel tank holds your gasoline. Honda says it sits ahead of the multi-link rear suspension (the rear arms), which most likely puts it under the rear seat area. The fuel pump, filter and pressure regulator are one module inside the tank.",
    spec: "13.2 US gallons (50 L). Honda says it's lightweight polypropylene (plastic). Returnless fuel system (no return line carries extra fuel back to the tank). Its exact position is approximate in this model.",
    check:
      "You can't see much: a plastic cover protects it from below. Look for wet spots or a raw-gas smell near the back of the car.",
    trouble: "A strong gasoline smell near the rear of the car, or fuel dripping, is a fire risk.",
    diy: "No",
    tip: "Refuel soon after the low-fuel light comes on (about 1.9 US gal / 7.5 L left). A common piece of mechanic advice (not from Honda's manual) is to avoid running the tank very low often, because the fuel around the in-tank pump helps cool it.",
    links: ["filler-neck", "tank-straps", "fuel-lines", "under-covers", "heat-shields"],
  },
  "tank-straps": {
    name: "Fuel tank straps",
    sys: ["fuel"],
    what: "The tank straps are steel straps that hold the fuel tank up against the floor of the car. Most cars use them. The number and position of the straps on your Civic weren't confirmed, so they're drawn as an example.",
    check: "On a lift, look for heavy rust on the straps and their bolts.",
    trouble: "Rusted straps can let the tank sag or rattle. Get that fixed right away.",
    diy: "No",
    links: ["fuel-tank"],
  },
  "filler-neck": {
    name: "Fuel filler neck",
    sys: ["fuel"],
    what: "The filler neck is the pipe that carries fuel from the gas cap down into the tank. Filler necks usually have a thin vent hose beside them so air can escape while you fill up.",
    spec: "The fuel door is on the left (driver's) side at the rear. The release handle is on the floor by the driver's seat.",
    check:
      "A loose or missing gas cap is the simplest thing to check first. After every fill-up, turn the cap until it clicks (ratchets).",
    trouble:
      "A gas smell near the fuel door, or the pump nozzle clicking off again and again while you fill (often a blocked vent).",
    diy: "No",
    links: ["fuel-tank"],
  },
  "fuel-lines": {
    name: "Fuel & brake lines (along the floor)",
    sys: ["fuel"],
    what: "These are thin metal and plastic tubes along the floor that carry fuel and brake fluid. The fuel feed line takes gasoline from the tank pump up to the engine, and a vapor line carries fumes. The brake lines run back to the rear wheels.",
    spec: "Shown simplified: the feed line, a vapor line, and two brake lines. Brake fluid is Honda DOT 3, replaced every 3 years.",
    check:
      'At oil changes, ask the shop to look for rust, wet spots or kinks. Honda\'s Maintenance Minder "B" service includes checking fuel lines and brake lines.',
    trouble:
      "A gas smell (fuel line), or a soft, sinking brake pedal (brake line leak). A brake-line leak is a stop-driving problem.",
    diy: "No",
    links: ["fuel-tank"],
    cross: ["chassis:brake-lines"],
  },
  "oil-drain-plug": {
    name: "Oil drain bolt",
    sys: ["drains"],
    what: "The oil drain bolt is the bolt you remove to drain old engine oil. It's on the rear edge of the oil pan, at the bottom of the engine.",
    spec: "17 mm bolt. Use a new 14 mm crush washer (a one-time seal) every time. Tighten to 29 lbf·ft (pound-feet; 39 N·m), the figure in Honda's owner's manual. Oil: SAE 0W-20, about 3.9 US quarts with a new filter.",
    check: "Look for oil drips or a wet, dirty patch around the bolt.",
    trouble:
      "A loose bolt or a reused washer can drip oil. Brown or black spots on your driveway under the front of the car are a clue.",
    diy: "Medium",
    tip: "You need the front of the car safely raised on ramps or jack stands (never just the jack) to reach it. First take off the silver metal engine under cover (held by screws). The oil filter is at the front of the oil pan, behind that same cover. Change the oil when the Maintenance Minder says so.",
    links: ["engine-cover", "atf-drain-plug"],
    cross: ["bay:oil-pan", "bay:oil-filter", "engine:oil-pan"],
  },
  "atf-drain-plug": {
    name: "Transmission fluid drain plug",
    sys: ["drains"],
    what: "This plug lets the automatic transmission fluid (ATF) drain out when it's changed.",
    spec: "Honda ATF DW-1 only, about 2.5 US quarts on a drain-and-fill. Honda's catalog lists an 18 mm plug with an 18 mm washer on the transmission case. Its exact spot and torque weren't found, so its position here is approximate.",
    check: "Look for reddish drips under the middle-front of the car.",
    trouble: "Red or brown drips under the middle of the car. Low ATF can cause slipping or harsh shifts.",
    diy: "Medium",
    tip: "Change ATF when the Maintenance Minder shows code 3. Check the level with the yellow-loop dipstick using Honda's steps: warm engine, then off, and read within 90 seconds. The owner's manual doesn't give this plug's torque (how tight it goes), so use a Honda service manual figure or have a shop do the drain-and-fill.",
    links: ["oil-drain-plug"],
    cross: ["bay:transmission", "bay:atf-dipstick"],
  },
  "floor-pan": {
    name: "Floor pan & tunnel",
    sys: ["body"],
    what: "The floor pan is the steel floor of the car. The raised channel down the middle is the tunnel, which makes room for the exhaust. Farther back, the fuel tank is tucked up under the floor ahead of the rear suspension.",
    check:
      "Look for rust or deep dents, and for undercoating (the protective coating underneath) that's peeling away.",
    trouble: "Bumping hard on a curb or speed bump can dent the floor or bend the lines clipped to it.",
    diy: "No",
    links: ["jack-points", "under-covers", "fuel-lines"],
    cross: ["chassis:subframe"],
  },
  "jack-points": {
    name: "Jacking points",
    sys: ["body"],
    what: "Jacking points are the reinforced spots under the car where a jack can safely lift it. Each has a tab that sits in the jack's notch. The owner's manual shows them only in a picture; on Hondas they're usually on the seam under each side, one near each wheel.",
    spec: "Owner's manual: use the jacking point nearest the flat tire, with the jacking-point tab sitting in the jack's notch. The exact spots are only shown in pictures in the manual. Usually they are just behind each front wheel and just ahead of each rear wheel, so the positions here are approximate.",
    check:
      "Compare with the picture in your owner's manual to find each spot. A crushed or bent seam means someone jacked in the wrong place.",
    trouble:
      "Jacking anywhere else can bend the floor or the rocker panel (the strip below the doors), and the car can slip off the jack.",
    diy: "Easy",
    tip: "Never get under a car held up only by a jack. On a lift or jack stands, the shop uses Honda's lift points.",
    links: ["floor-pan"],
    cross: ["trunk:jack"],
  },
  "engine-cover": {
    name: "Engine under cover",
    sys: ["body", "drains"],
    what: "The engine under cover is a silver metal plate under the engine that protects it. It also smooths the airflow. It has to come off for an oil change.",
    spec: 'Honda\'s catalog: "Cover Assy., Engine (LOWER)" with front and rear plates. An oil-change guide removes it with 4 Phillips screws.',
    check: "Make sure every screw is back in after an oil change, and the cover isn't hanging down.",
    trouble: "A loose cover scrapes on speed bumps or makes a flapping or buzzing noise.",
    diy: "Easy",
    links: ["oil-drain-plug", "under-covers"],
  },
  "under-covers": {
    name: "Plastic floor covers",
    sys: ["body"],
    what: "These plastic panels under the floor smooth the airflow under the car, which helps fuel economy. They cover the floor and the fuel tank, plus small fins (strakes) ahead of the rear tires. Honda added them for this.",
    spec: "Honda's catalog lists front floor lower covers (left and right), a fuel tank lower cover, a rear floor lower cover and rear strakes.",
    check: "Look for cracked or missing panels and missing clips, especially after a curb or snowbank.",
    trouble: "A loose panel scrapes the ground or makes a flapping noise at speed.",
    diy: "Easy",
    links: ["fuel-tank", "floor-pan", "engine-cover"],
  },
};
