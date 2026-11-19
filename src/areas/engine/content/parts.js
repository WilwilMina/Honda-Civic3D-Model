// Engine internals parts: one card per clickable part, keyed by the part id the 3D cutaway tags its meshes with
// ("engine:<id>"). Fields: what it is, spec, what to check, trouble signs, DIY level and tip, related parts
// (`links`), and links into other areas (`cross`, as "area:id"). Re-exported by ../content.js as PARTS.

export const PARTS = {
  piston: {
    name: "Pistons",
    sys: ["bottom"],
    what: "Pistons are metal plugs that slide up and down inside the cylinders, pushed by burning fuel. There are four, made of aluminum. Burning fuel above a piston pushes it down hard, and that push is what moves your car. Watch them: pistons 1 and 4 always move together, and so do 2 and 3.",
    spec: "81 mm across (the bore) and 87.3 mm of travel (the stroke). Each piston squeezes the air-fuel mix to 1/10.6 of its size (10.6:1 compression ratio).",
    check:
      "You can't see them without taking the engine apart. Their health shows up in a compression test (a shop measures how well each cylinder holds pressure), and in how much oil the engine uses between changes.",
    trouble:
      "Burning oil (blue smoke), low compression in one cylinder, or a light knock when cold (piston slap: the piston rocking in its cylinder). Overheating or running low on oil is what usually damages them.",
    diy: "No",
    tip: "Regular oil changes and never overheating the engine are what keep pistons healthy for the long haul.",
    links: ["rings", "rod", "oil-jets", "head"],
  },
  rings: {
    name: "Piston rings",
    sys: ["bottom", "seal"],
    what: "Piston rings are springy metal rings around each piston that seal it against the cylinder wall. There are three per piston, sitting in grooves. The top two seal in the burning gas so it pushes the piston instead of leaking past. The bottom 'oil ring' scrapes oil off the cylinder wall so it doesn't get burned.",
    check:
      "A compression or leak-down test (shop tests that measure how well a cylinder holds pressure) checks the seal. Keep an eye on oil use: if you're adding oil often between changes (say a quart every 1,000 miles or sooner), have a shop check whether the rings are the cause.",
    trouble:
      "Blue-gray smoke when accelerating, having to top up oil often, an oily spark plug, or a weaker engine.",
    diy: "No",
    links: ["piston", "spark-plug"],
  },
  rod: {
    name: "Connecting rods",
    sys: ["bottom"],
    what: "Connecting rods are steel arms that link each piston to the crankshaft. They turn the piston's up-and-down push into the crank's round-and-round spin. Honda makes the big end in one piece and then snaps it in two ('cracked' rods). That way the cap only fits back on exactly one way.",
    spec: "Thin, replaceable rod bearings (smooth metal shells) line the big end. They ride on a film of oil and never touch the crank when the oil is good.",
    check: "Nothing to check directly. Keeping the oil full and changed on time is the whole job.",
    trouble:
      "A deep, rhythmic knock that speeds up with engine speed means a worn rod bearing. Stop driving: it can break the rod.",
    diy: "No",
    tip: "Running low on oil is a leading cause of rod-bearing damage. Check the dipstick every couple of fill-ups.",
    links: ["piston", "crankshaft", "oil-pump"],
  },
  crankshaft: {
    name: "Crankshaft",
    sys: ["bottom"],
    what: "The crankshaft is the heavy steel shaft at the bottom of the engine that the pistons spin, like legs turning bike pedals. It has offset arms ('throws') that the rods push around. Big counterweights balance it. It spins the flexplate (which drives the transmission), the timing chain, and the front pulley (which drives the accessory belt).",
    spec: "Steel crankshaft. Its main bearings sit in an aluminum lower block (a 'ladder frame'). It turns 2 times for every 1 turn of the camshaft. Redline (the highest safe engine speed) is 6,700 rpm: that's about 112 turns every second.",
    check: "Nothing routine. Clean oil keeps the main bearings alive.",
    trouble:
      "A deep knock from the bottom of the engine (worn main bearings), or oil leaking from the front or rear crank seal.",
    diy: "No",
    links: ["rod", "flexplate", "chain", "oil-pump"],
  },
  flexplate: {
    name: "Flexplate (automatic)",
    sys: ["bottom"],
    what: "The flexplate is a thin steel disc that connects the engine to the automatic transmission. It's bolted to the back of the crankshaft and passes power to the transmission's torque converter (a fluid coupling). The teeth around its edge are what the starter motor spins to start the engine.",
    check: "Not checked normally; it's hidden between the engine and transmission.",
    trouble:
      "A cracked flexplate makes a rattle or knock near the transmission, worst at idle. A grinding noise while starting can be worn teeth on the starter or on the ring gear (the flexplate's toothed edge).",
    diy: "No",
    links: ["crankshaft"],
    cross: ["bay:transmission", "bay:starter"],
  },
  camshaft: {
    name: "Camshaft",
    sys: ["top", "timing"],
    what: "The camshaft is a spinning shaft on top of the engine that opens the valves at the right moment. It has egg-shaped bumps (lobes). As it turns, each lobe pushes a rocker arm, which opens valves. There's just one ('SOHC' means single overhead cam). It turns at half the crank's speed because each cylinder only needs to breathe every other turn.",
    spec: "Economy i-VTEC (Honda's valve-control system): at light load, it keeps one intake valve per cylinder open a bit longer, so the engine wastes less effort pulling air in. Honda says this cuts that wasted effort (pumping losses) by up to 16%. It switches somewhere between about 1,200 and 3,500 rpm depending on load. Honda describes no separate high-rpm 'VTEC kick' mode, and none of Honda's descriptions of this engine mention cam phasing (shifting the cam's timing).",
    check: "Not checked directly. Worn lobes are rare with regular oil changes.",
    trouble: "Ticking from the top of the engine, or check-engine codes for VTEC or cam timing.",
    diy: "No",
    links: ["rockers", "chain", "valves-in", "valves-ex"],
  },
  rockers: {
    name: "Rocker arms & valve adjusters",
    sys: ["top"],
    what: "Rocker arms are small levers that the camshaft pushes to open the valves. They're aluminum and ride on a rocker shaft (drawn here as two shafts for clarity). The cam lobe pushes one end and the other end pushes the valves open. Each has a screw and locknut that set a tiny gap (valve clearance), so the valve can close all the way when it's hot.",
    spec: "Published valve clearance for this engine family, engine cold: intake 0.18–0.22 mm, exhaust 0.23–0.27 mm. Confirm in the service manual for your engine. One intake rocker per cylinder also carries the i-VTEC switching pin.",
    check:
      "Inspected when the Maintenance Minder shows code 4 (the Minder decides when; Honda quotes about 100,000 miles without a scheduled tune-up), or sooner if the top of the engine starts ticking.",
    trouble:
      "Too loose: a ticking or tapping noise. Too tight (more dangerous): the valve doesn't fully close. That causes a rough idle, a misfire, and eventually a burnt exhaust valve.",
    diy: "Hard",
    tip: "You need a cold engine, feeler gauges (thin metal strips for measuring gaps), a new valve cover gasket and patience. Many owners have a shop do it along with the spark plugs.",
    links: ["camshaft", "valves-in", "valves-ex"],
    cross: ["bay:valve-cover"],
  },
  "valves-in": {
    name: "Intake valves",
    sys: ["top"],
    what: "The intake valves are little doors that open to let air and fuel into each cylinder. There are two per cylinder, eight total. They open on the intake stroke, then shut tight. On this engine they're on the back side (the exhaust faces the front). At light load, i-VTEC holds one of the two intake valves open a little longer to save fuel. Watch a cylinder on its 'intake' stroke and you'll see them drop open.",
    check: "Their gap is set with the valve adjustment (Minder code 4).",
    trouble:
      "Carbon build-up can make them seal poorly. A bent valve (rare) means very low compression in one cylinder.",
    diy: "No",
    links: ["rockers", "valve-springs", "head"],
  },
  "valves-ex": {
    name: "Exhaust valves",
    sys: ["top"],
    what: "The exhaust valves are little doors that open to let burned gas out of each cylinder. There are two per cylinder, eight total. They open on the exhaust stroke, letting the gas straight into the exhaust passages cast into the head, which face the front of the car. They run very hot, one reason their gap (clearance) is set a little wider than the intakes'.",
    check: "Their gap is set with the valve adjustment (Minder code 4).",
    trouble:
      "A valve set too tight can't cool against its seat and 'burns'. That causes a steady misfire and low compression in that cylinder.",
    diy: "No",
    links: ["rockers", "valve-springs", "head"],
  },
  "valve-springs": {
    name: "Valve springs & stem seals",
    sys: ["top", "seal"],
    what: "Valve springs snap each valve shut after the camshaft opens it. Each valve has its own stiff spring. A small rubber seal on each valve stem (the valve's thin shaft) keeps oil from dripping down into the cylinder.",
    check: "Nothing routine.",
    trouble:
      "Worn stem seals cause a puff of blue smoke right after starting a car that has sat overnight. Then it clears up.",
    diy: "No",
    links: ["valves-in", "valves-ex"],
  },
  "spark-plug": {
    name: "Spark plugs",
    sys: ["spark"],
    what: "A spark plug makes the spark that lights the fuel inside each cylinder. There's one per cylinder, screwed into the middle of the combustion chamber (where the fuel burns). At the top of the compression stroke it sparks and lights the squeezed fuel. Watch for the flash: the cylinders fire in the order 1-3-4-2.",
    spec: "Iridium plugs: NGK DILZKR7B11GS or DENSO DXU22HCR-D11S. Honda's gap (the space the spark jumps) for the 1.8 is 1.0–1.1 mm (0.039–0.043 in). Replace when the Maintenance Minder shows code 4 (Honda says roughly 100,000 miles, no scheduled tune-ups).",
    check:
      "When you pull them at replacement, tan or light gray tips are healthy. Black soot, wet oil or white blistering point to a problem.",
    trouble: "Worn plugs cause misfires, a shaky idle, hesitation and worse gas mileage.",
    diy: "Easy–Medium",
    tip: "Do it with the engine cold, and don't over-tighten them in the aluminum head. A torque wrench (a wrench that tightens to a set force) set to the figure in a Honda service manual is best; the owner's manual doesn't list one. Videos may show other plug brands; Honda lists the NGK or DENSO iridium plugs above.",
    links: ["coil", "head", "piston"],
  },
  coil: {
    name: "Ignition coils",
    sys: ["spark"],
    what: "An ignition coil turns the battery's 12 volts into the high voltage that fires a spark plug. One coil sits right on top of each spark plug ('coil-on-plug'). It makes tens of thousands of volts the instant the engine computer says fire.",
    check:
      "Nothing routine. Inspect the rubber boots (the ends that fit over the plugs) when you change plugs.",
    trouble:
      "A failing coil causes a misfire in that one cylinder (code P0301–P0304) and a flashing check-engine light when the engine is working hard (under load).",
    diy: "Easy",
    tip: "Quick test: swap the suspect coil with the one next to it. If the misfire code moves to the other cylinder, the coil is bad.",
    links: ["spark-plug"],
    cross: ["bay:coils"],
  },
  chain: {
    name: "Timing chain & sprockets",
    sys: ["timing"],
    what: "The timing chain links the crankshaft to the camshaft so the valves open in step with the pistons. It runs from the small crank sprocket (toothed wheel) to the cam sprocket, which is twice as big. That gives the camshaft exactly one turn for every two crank turns. Honda uses a narrow, quiet 'silent' chain.",
    spec: "There's no replacement schedule: it's meant to last the life of the engine (unlike a rubber timing belt).",
    check: "Listen at a cold start. Clean oil is what keeps a chain from stretching.",
    trouble:
      "A rattle for a few seconds at start-up, or check-engine codes for cam/crank timing, can mean a stretched chain or a weak tensioner. Separately, Honda opened an engineering investigation (reference AER14070C, filed with NHTSA, the US road-safety agency) into oil leaks at the timing chain case cover on certain 2013 Civics. Look for oil on the passenger end of the engine, and mention it to the dealer if you see it.",
    diy: "No",
    links: ["tensioner", "crankshaft", "camshaft"],
    cross: ["bay:timing-cover"],
  },
  tensioner: {
    name: "Timing chain tensioner & guide",
    sys: ["timing"],
    what: "The chain tensioner keeps the timing chain snug so it doesn't flap. An automatic tensioner presses a shoe (a sliding pad) against the slack side of the chain, and a plastic guide steadies the other side.",
    check: "Nothing routine.",
    trouble:
      "If the tensioner can't keep the chain snug, the chain can slap and rattle, most noticeably right after a cold start.",
    diy: "No",
    links: ["chain", "oil-pump"],
  },
  "oil-pan": {
    name: "Oil pan & drain plug",
    sys: ["oil"],
    what: "The oil pan is the metal tub under the engine where the oil collects when it drains down. The drain plug at the bottom is what you remove for an oil change.",
    spec: "SAE 0W-20 oil, about 3.9 US quarts (3.7 L) with a new filter. Change it when the Maintenance Minder says so (it shows SERVICE DUE SOON at 15–6% oil life and SERVICE DUE NOW at 5–1%), and at least once a year.",
    check:
      "Check the dipstick with the car level and the engine off for a few minutes. Look under the car for drips.",
    trouble:
      "A low oil level is a common, easy-to-check cause of ticking, knocking and oil-pressure-light problems. A dented pan or stripped drain plug causes leaks.",
    diy: "Medium",
    tip: "Use a new crush washer (a one-time seal) on the drain plug every time. Tighten it to Honda's 29 lbf·ft (pound-feet; 39 N·m, owner's manual), not more. An oil change means raising the front of the car: use ramps or jack stands on the lift points, never just the jack. If you'd rather not work under the car, any quick-lube or repair shop can do it.",
    links: ["oil-pump"],
    cross: ["bay:dipstick", "bay:oil-filter"],
  },
  "oil-pump": {
    name: "Oil pump & pickup",
    sys: ["oil"],
    what: "The oil pump pushes oil from the pan to every moving part of the engine. It's built into the timing chain case. It sucks oil up through a screened pickup tube in the pan, pushes it through the oil filter, and on to every bearing, the camshaft, rockers and chain.",
    check: "The red oil-can light on the dash is the pump's alarm: it means oil pressure is too low.",
    trouble:
      "Oil pressure light on while driving: Honda says park safely right away, stop the engine, wait about a minute and check the oil level. A low oil level is the first thing to rule out. A clogged pickup screen (from sludge) or a worn pump are less likely.",
    diy: "No",
    links: ["oil-pan", "oil-jets", "crankshaft", "rod"],
  },
  "oil-jets": {
    name: "Piston oil jets",
    sys: ["oil", "bottom"],
    what: "Oil jets are small nozzles that spray oil at the underside of each piston to cool it. They're built into the block. Keeping the pistons cool also helps prevent engine knock (uncontrolled burning that makes a pinging sound).",
    check: "Nothing to check.",
    trouble: "A clogged jet (from sludge) can let one piston run hot. Another reason to change oil on time.",
    diy: "No",
    links: ["piston", "oil-pump"],
  },
  "head-gasket": {
    name: "Head gasket",
    sys: ["seal"],
    what: "The head gasket is a thin seal clamped between the cylinder head and the engine block. It seals in the pressure of the burning fuel and keeps coolant and oil in their own passages.",
    check:
      "Nothing routine. Never let the engine overheat; overheating is a leading cause of head-gasket failure.",
    trouble:
      "Coolant disappearing with no visible leak, sweet-smelling white smoke, overheating, bubbles in the coolant reservoir, or milky oil.",
    diy: "No",
    links: ["head", "block"],
  },
  head: {
    name: "Cylinder head",
    sys: ["seal", "top"],
    what: "The cylinder head is the top part of the engine that holds the valves, camshaft and spark plugs. It's an aluminum casting that also holds the rockers and the dome-shaped combustion chambers where the fuel burns. Coolant flows through passages inside it. On the R18 the exhaust manifold is cast right into the head (on the front side), and the catalytic converter bolts straight onto it.",
    check: "Look for oil leaks at the valve cover edge on top of it.",
    trouble: "Severe overheating can warp (bend) it, which blows the head gasket.",
    diy: "No",
    links: ["head-gasket", "camshaft", "spark-plug", "valves-in", "valves-ex"],
  },
  block: {
    name: "Engine block",
    sys: ["seal"],
    what: "The engine block is the big main casting that holds the four cylinders and the crankshaft. It's aluminum, with cast-iron cylinder liners (sleeves). Coolant flows around the cylinders to carry heat away. It's shown see-through here so you can watch the parts move.",
    check: "Look for oil or coolant seeping from its seams.",
    trouble: "It rarely fails on its own. Freezing (no antifreeze) or extreme overheating can crack it.",
    diy: "No",
    links: ["head-gasket", "crankshaft", "piston"],
  },
};
