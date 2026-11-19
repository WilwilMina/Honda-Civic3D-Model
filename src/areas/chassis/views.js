// Chassis area, camera views (authoring frame, car metres): the area view and hotspot, the per-corner zoom
// views used by the buttons, and the reveal() poses. Each reveal pose was picked by raycasting candidate
// camera positions around the part so the part is actually visible on the open driver-side corners (most look
// in past the removed wheel).
import { A } from "./kit.js";

// camera when the area opens, and the orange dot shown in the car view
export const AREA_VIEW = { pos: [6.1, 0.15, 1.35], target: [0.45, -0.05, 0.38] };
export const HOTSPOT = { pos: [0.93, 1.335, 0.62], label: "Brakes & suspension" };

// "Zoom to a front / rear wheel" buttons: the driver-side corners
export const ZOOM = {
  front: { pos: [1.85, 1.86, 0.74], target: [0.64, 1.31, 0.4] },
  rear: { pos: [1.85, -0.84, 0.7], target: [0.66, -1.34, 0.36] },
};

// reveal(partKey): part id -> [camera position, target]
export const REVEAL_POSES = {
  rotor: [
    [1.17, 1.67, 0.42],
    [0.69, 1.335, 0.315],
  ],
  caliper: [
    [1.27, 1.22, 0.23],
    [0.68, 1.224, 0.355],
  ],
  pads: [
    [1.28, 1.23, 0.46],
    [0.691, 1.23, 0.36],
  ],
  "brake-hose": [
    [1.07, 0.92, 0.6],
    [0.588, 1.262, 0.5],
  ],
  "brake-lines": [
    [1.27, 1.88, 0.69],
    [0.504, 1.343, 0.524],
  ],
  "abs-sensor": [
    [1.16, 1.38, 0.38],
    [0.577, 1.38, 0.501],
  ],
  hub: [
    [1.19, 1.67, 0.42],
    [0.708, 1.335, 0.315],
  ],
  knuckle: [
    [1.13, 0.96, 0.43],
    [0.65, 1.295, 0.33],
  ],
  strut: [
    [1.55, 1.32, 0.48],
    [0.62, 1.325, 0.675],
  ],
  spring: [
    [1.21, 1.32, 0.65],
    [0.62, 1.325, 0.77],
  ],
  "strut-mount": [
    [0.62, 2.1, 1.36],
    [0.62, 1.325, 0.915],
  ],
  "lower-arm": [
    [0.95, 0.98, 0.28],
    [0.466, 1.315, 0.178],
  ],
  "ball-joint": [
    [1.24, 1.33, 0.29],
    [0.65, 1.335, 0.191],
  ],
  "sway-bar": [
    [0.88, 1.46, 0.57],
    [0.385, 1.458, 0.228],
  ],
  "sway-link": [
    [1.07, 1.74, 0.5],
    [0.581, 1.398, 0.391],
  ],
  "tie-rod": [
    [1.11, 1.21, 0.13],
    [0.519, 1.215, 0.255],
  ],
  "cv-axle": [
    [0.86, 1.69, 0.41],
    [0.374, 1.355, 0.31],
  ],
  "eps-motor": [
    [0.74, 1.15, 0.13],
    [0.15, 1.153, 0.255],
  ],
  "steering-rack": [
    [0.49, 1.21, 0.58],
    [0.0, 1.215, 0.239],
  ],
  "steering-shaft": [
    [0.78, 1.1, 0.57],
    [0.185, 1.1, 0.461],
  ],
  differential: [
    [0.59, 1.35, 0.4],
    [0.0, 1.355, 0.295],
  ],
  subframe: [
    [0.62, 1.33, 0.4],
    [0.03, 1.335, 0.3],
  ],
  drum: [
    [1.25, -2.04, 0.28],
    [0.98, -1.565, 0.022],
  ],
  shoes: [
    [1.46, -1.87, 0.48],
    [0.697, -1.335, 0.315],
  ],
  "wheel-cylinder": [
    [1.29, -1.33, 0.51],
    [0.698, -1.335, 0.406],
  ],
  "parking-brake": [
    [1.29, -1.38, 0.2],
    [0.699, -1.381, 0.325],
  ],
  "hub-rear": [
    [1.2, -1.67, 0.42],
    [0.72, -1.335, 0.315],
  ],
  "rear-knuckle": [
    [1.14, -1.65, 0.43],
    [0.656, -1.311, 0.33],
  ],
  "rear-arms": [
    [1.1, -1.26, 0.57],
    [0.512, -1.255, 0.465],
  ],
  "trailing-arm": [
    [1.09, -1.17, 0.43],
    [0.499, -1.172, 0.321],
  ],
  "rear-spring": [
    [1.25, -1.86, 0.51],
    [0.482, -1.325, 0.349],
  ],
  "rear-shock": [
    [1.4, -1.93, 0.63],
    [0.629, -1.395, 0.47],
  ],
};

// parts still tucked behind something from their best pose: fade the blocker while the part is selected
// (scene.js adds the strut mount, which opens the hood instead)
export const REVEAL_GHOSTS = {
  "ball-joint": { ghosts: [A + "rotor"] },
  knuckle: { ghosts: [A + "rotor"] },
  "steering-shaft": { ghosts: ["bay:firewall"] },
  "rear-spring": { ghosts: [A + "shoes"] },
};
