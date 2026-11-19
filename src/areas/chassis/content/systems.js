// Brakes & suspension systems: the groups the side panel sorts the chassis parts into (each part's `sys` lists
// its ids). Re-exported by ../content.js as SYSTEMS.

export const SYSTEMS = [
  {
    id: "brakes",
    label: "Brakes",
    blurb:
      "Front disc brakes do most of the stopping; the rear uses drum brakes on your LX. Brake fluid carries the push from your pedal to every wheel.",
  },
  {
    id: "suspension",
    label: "Suspension",
    blurb:
      "Springs hold the car up, struts and shocks calm the bounce, and arms and joints let each wheel move up and down on its own.",
  },
  {
    id: "steering",
    label: "Steering",
    blurb:
      "Turning the wheel slides a rack left or right; tie rods push the front wheels to point where you want. An electric motor helps.",
  },
  {
    id: "drive",
    label: "Wheels & axles",
    blurb: "How the engine's power reaches the front tires, and the tires themselves.",
  },
  {
    id: "check",
    label: "Things you check",
    blurb: "What you can look at yourself without lifting the car much.",
  },
];
