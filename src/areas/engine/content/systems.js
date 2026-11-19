// Engine internals systems: the groups the side panel sorts the engine's parts into (each part's `sys` lists
// its ids). Re-exported by ../content.js as SYSTEMS.

export const SYSTEMS = [
  {
    id: "bottom",
    label: "Bottom end",
    blurb: "Pistons, connecting rods and the crankshaft: the parts that turn explosions into spinning.",
  },
  {
    id: "top",
    label: "Valvetrain",
    blurb:
      "The camshaft, rocker arms, valves and springs that let air in and exhaust out at exactly the right moment.",
  },
  {
    id: "spark",
    label: "Ignition",
    blurb: "Coils and spark plugs light the fuel at the top of each compression stroke.",
  },
  {
    id: "timing",
    label: "Timing",
    blurb:
      "The chain keeps the camshaft in step with the crankshaft: one cam turn for every two crank turns.",
  },
  {
    id: "oil",
    label: "Oil system",
    blurb: "Oil is pumped from the pan to every bearing, the cam and the chain. It's the engine's blood.",
  },
  {
    id: "seal",
    label: "Block, head & seals",
    blurb: "The castings that hold it all together and the gasket that seals them.",
  },
];
