// Cabin area DIY help: step-by-step GUIDES for the owner jobs (cabin air filter, fuses, Maintenance Minder reset,
// opening the hood), keyed by part id. Re-exported by ../content.js as GUIDES.

export const GUIDES = {
  "cabin-filter": {
    title: "Replace the cabin air filter (no tools, about 10 minutes)",
    steps: [
      "Buy the right filter: Honda 80292-SDA-407 or an equivalent for a 2013 Civic.",
      "Empty the glove box.",
      "Squeeze both side walls of the glove box inward so the stops clear the dash.",
      "Let the glove box swing all the way down.",
      "Find the black blower housing behind it.",
      "Press the tabs on both sides of the filter cover and pull the cover out.",
      "Slide the old filter straight out and check how dirty it is.",
      'Slide the new filter in with the "AIR FLOW" arrow pointing DOWN, toward the floor.',
      "Clip the cover back in fully.",
      "Squeeze the glove box sides in again and swing it back up until it stays.",
    ],
  },
  "fuse-box": {
    title: "Check or replace a fuse",
    steps: [
      "Turn the key to LOCK and switch off the headlights and accessories.",
      "Find the interior fuse box under the dashboard on the driver's side, near your left knee.",
      "Take off its cover.",
      "Look up the fuse number for the dead circuit on the label on the side panel. Each row lists the circuit and its amp rating (− = empty slot, * = not on all models).",
      "Get the fuse puller from the back of the under-hood fuse box cover.",
      "Pull out the fuse and look at it. A blown fuse has a broken metal strip inside.",
      "Replace it with a fuse of the SAME amp rating. Never use a bigger one.",
      "Take the car to a shop if the new fuse blows right away: that means there's a short circuit.",
    ],
  },
  "light-wrench": {
    title: "Reset the Maintenance Minder (oil life) after service",
    steps: [
      "Turn the key to ON (the engine can be off).",
      "Press MENU on the steering wheel.",
      'Use + to choose "Vehicle Information", then press SOURCE.',
      "Press SOURCE again to show the Maintenance info (oil life %).",
      "Press SOURCE on that screen to open the oil-life reset screen.",
      'Choose "Yes" with the +/− button and press SOURCE. Oil life goes back to 100%.',
    ],
  },
  "hood-release": {
    title: "Open the hood",
    steps: [
      "Make sure the wiper arms are down.",
      "Pull the hood release handle under the lower left corner of the dashboard.",
      "Go to the front, slide your fingers under the hood and push up the latch lever at the center.",
      "Lift the hood.",
      "Take the support rod out of its clamp by the grip and put its end in the hole in the hood.",
      "To close, put the rod back in its clip.",
      "Lower the hood to about 12 inches (30 cm) and let it drop.",
    ],
  },
};
