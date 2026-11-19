// Camera poses for bay parts that are hard to see from the main view (tucked low, or behind the headlight,
// bumper or radiator). When such a part is picked from the parts list, a symptom or a card link, scene.js's
// reveal() flies the camera to its pose. Poses are [camera, target] in car metres (docs/ARCHITECTURE.md frame),
// chosen by raycasting candidate poses around each part and keeping one that sees it.
export const REVEAL_POSES = {
  "oil-filter": [
    [0.91, 1.69, 0.14],
    [-0.07, 1.685, 0.345],
  ], // low, from ahead of the driver-side front wheel
  "oil-pan": [
    [0.36, 1.54, 0.22],
    [-0.23, 1.545, 0.34],
  ], // low, in past the driver-side wheel well
  "throttle-body": [
    [0.26, 1.33, 1.12],
    [0.005, 1.33, 0.58],
  ], // looking down behind the intake tube
  "intake-manifold": [
    [0.26, 1.37, 0.97],
    [-0.23, 1.367, 0.625],
  ], // over the back of the engine
  "ac-high": [
    [-0.22, 1.88, 1.0],
    [-0.473, 1.879, 0.455],
  ], // down past the radiator top
  "crank-pulley": [
    [-1.3, 1.55, 0.7],
    [-0.558, 1.555, 0.43],
  ], // through the passenger wheel well (see revealHelpers)
  // low/front parts hidden from the main view behind the headlight, bumper or radiator
  "ac-compressor": [
    [-0.65, 2.05, 1.25],
    [-0.466, 1.735, 0.433],
  ],
  condenser: [
    [-0.62, 1.98, 1.87],
    [-0.005, 1.975, 0.5],
  ],
  fans: [
    [-0.65, 1.89, 1.81],
    [-0.075, 1.888, 0.51],
  ],
  "lower-hose": [
    [-0.24, 1.89, 1.31],
    [-0.1, 1.808, 0.425],
  ],
  catalytic: [
    [-0.45, 1.94, 1.4],
    [-0.22, 1.542, 0.366],
  ],
  "engine-block": [
    [-1.03, 2.01, 1.71],
    [-0.23, 1.552, 0.527],
  ],
  abs: [
    [0.47, 2.01, 1.98],
    [0.47, 1.398, 0.608],
  ],
  "coolant-reservoir": [
    [0.42, 2.02, 1.53],
    [0.494, 1.881, 0.643],
  ],
  "intake-tube": [
    [0.1, 1.9, 1.37],
    [0.096, 1.347, 0.66],
  ],
  "washer-tank": [
    [-0.53, 2.05, 1.38],
    [-0.61, 1.91, 0.497],
  ], // straight down past the passenger headlight
  "water-pump": [
    [-0.87, 1.83, 1.37],
    [-0.558, 1.645, 0.55],
  ], // down over the passenger fender at the belt end
};

// Temporary scene changes some poses need, keyed like REVEAL_POSES. Each returns { ghosts, undo } for
// tempReveal() (../shared/reveal.js): part keys to fade, and a function that puts things back.
export function revealHelpers(ctx) {
  return {
    // the crank pulley hides behind the passenger front wheel and its arch liner (the inner fender fades by itself
    // from out there): fade the wheels and lift the liner out while it is selected
    "crank-pulley": () => {
      const liners = [];
      ctx.carRoot.traverse((o) => {
        if (o.name === "liner-fr" && o.visible) liners.push(o);
      });
      for (const o of liners) o.visible = false;
      return {
        ghosts: ["chassis:tire", "chassis:wheel"],
        undo: () => {
          for (const o of liners) o.visible = true;
        },
      };
    },
  };
}
