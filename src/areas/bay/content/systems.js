// Engine bay systems: the groups the side panel sorts the bay's parts into (each part's `sys` lists its ids).
// Re-exported by ../content.js as SYSTEMS.

export const SYSTEMS = [
  {
    id: "fluids",
    label: "Things you check",
    blurb: "The caps and dipsticks an owner should know by sight.",
  },
  {
    id: "engine",
    label: "Engine",
    blurb: "The 1.8-litre four-cylinder that makes the power.",
  },
  {
    id: "electrical",
    label: "Electrical",
    blurb: "Battery, charging, starting and the car's computer.",
  },
  {
    id: "belt",
    label: "Drive belt",
    blurb: "One belt the engine spins to run three accessories.",
  },
  {
    id: "cooling",
    label: "Cooling",
    blurb: "Keeps the engine at its normal working temperature instead of overheating.",
  },
  {
    id: "air",
    label: "Air intake",
    blurb: "How clean air gets into the engine.",
  },
  {
    id: "exhaust",
    label: "Exhaust",
    blurb: "Where burnt gases leave and get cleaned up.",
  },
  {
    id: "ac",
    label: "A/C",
    blurb: "The loop that moves heat out of the cabin.",
  },
  {
    id: "brakes",
    label: "Brakes",
    blurb: "Turns your foot on the pedal into stopping force.",
  },
  {
    id: "body",
    label: "Body & frame",
    blurb: "The metal everything bolts to.",
  },
];
