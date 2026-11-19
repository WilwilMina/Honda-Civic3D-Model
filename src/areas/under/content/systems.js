// Under-the-car systems: the groups the side panel sorts the area's parts into (each part's `sys` lists its
// ids). Re-exported by ../content.js as SYSTEMS.

export const SYSTEMS = [
  {
    id: "exhaust",
    label: "Exhaust",
    blurb:
      "Carries hot, burnt gases from the engine to the back of the car and makes them quieter on the way.",
  },
  { id: "fuel", label: "Fuel", blurb: "Stores the gasoline and sends it up to the engine." },
  {
    id: "drains",
    label: "Fluids & drains",
    blurb: "The plugs a mechanic opens to drain old oil and transmission fluid.",
  },
  {
    id: "body",
    label: "Body underside",
    blurb:
      "The floor of the car, the covers that smooth the airflow, and where a jack or lift may touch the car.",
  },
];
