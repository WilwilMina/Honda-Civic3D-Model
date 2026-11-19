// Cabin area systems: the groups the side panel sorts the cabin's parts into (each part's `sys` lists its ids).
// Re-exported by ../content.js as SYSTEMS.

export const SYSTEMS = [
  {
    id: "lights",
    label: "Warning lights",
    blurb:
      "The little symbols behind the steering wheel. Red = stop soon and safely; amber = get it checked; green/blue = just information.",
  },
  {
    id: "gauges",
    label: "Gauges & screens",
    blurb: "The two-tier dash: digital speedometer and i-MID screen on top, tachometer below.",
  },
  {
    id: "controls",
    label: "Controls",
    blurb:
      "Things you use every drive: wheel, stalks, pedals, shifter, parking brake, heater/A-C and the release levers.",
  },
  {
    id: "filters",
    label: "Filters & fuses",
    blurb: "Owner-serviceable bits hidden in the cabin: the cabin air filter and the interior fuse box.",
  },
  { id: "safety", label: "Safety", blurb: "Seats, seat belts and airbags." },
];
