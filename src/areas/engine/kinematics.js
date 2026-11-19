// Engine numbers and the pure animation math for the "Inside the engine" area (no three.js here).
// Everything is in the engine's local frame: 1 unit = 2 mm, x along the crank (cylinder 1 at +x, the timing-chain
// end), y across the engine (+y = intake side), z up from the crank centre. scene.js places this frame in the car.
// The cycle angle `phi` of a cylinder runs 0…720° and starts at top dead centre of its power stroke.

export const D2R = Math.PI / 180;
/** Positive remainder: mod(-30, 720) = 690. */
export const mod = (a, m) => ((a % m) + m) % m;

// ------------------------------------------------------------------ dimensions (2 mm units)
// Cylinder centres along x, cylinders 1–4. Cylinder 1 is drawn at the timing-chain end (not confirmed by a source).
export const CYL_X = [67.5, 22.5, -22.5, -67.5];
export const BORE_R = 20.6; // drawn bore radius (the real 81 mm bore would be 20.25)
export const CRANK_R = 21.83; // crank throw radius: half the 87.3 mm stroke
export const ROD = 78.75; // connecting rod, centre to centre (a drawing value: Honda's figure was not found)
export const DECK = 117; // top of the block / underside of the head
export const CAM_AXIS = [0, 176]; // camshaft axis (y, z); the cam sprocket shares it

// Where the engine frame sits in the car: turned 180° about z (so cylinder 1 / the timing chain ends up at the
// passenger side and local +y points to the car's rear), scaled to metres, with the crank centre on the bay's
// crank pulley (car z 0.43).
export const PLACE = { offset: [-0.23, 1.545, 0.43], scale: 0.002 };

// How far each cylinder's cycle lags cylinder 1, in crank degrees. Spacing the four cylinders 180° apart in the
// order 1-3-4-2 (cyl 1 at 0, cyl 3 at 180, cyl 4 at 360, cyl 2 at 540) gives Honda's firing order 1-3-4-2.
export const FIRING_OFFSET = [0, 540, 180, 360];

// Valves. Honda: the R18's exhaust (manifold cast into the head) faces the front of the car, intake the rear.
// After the 180° placement in the car, local +y = car rear, so intake sits on +y and exhaust on −y.
//   y: valve row offset   xs: the two valves' x offsets from the bore centre   r: head radius
//   max: peak lift        open/close: cycle angles (phi) where the valve starts to open and finishes closing
// Exhaust opens 30° before bottom dead centre of the power stroke and closes 10° after TDC; intake opens 10° before
// TDC and closes 30° after BDC, so both are briefly open together around TDC (valve overlap), as in a real engine.
export const VALVES = {
  in: { y: 10, xs: [-9.5, 9.5], r: 7, max: 4.5, open: 350, close: 570 },
  ex: { y: -10, xs: [-5.5, 5.5], r: 6, max: 4, open: 150, close: 370 },
};

// The four strokes, 180° of crank each, in cycle order starting at phi = 0.
const STROKES = ["power", "exhaust", "intake", "compression"];

// Animation speeds: seconds for one full 720° cycle.
export const SPEEDS = { slow: 14, medium: 6, fast: 1.6 };

// ------------------------------------------------------------------ cycle bookkeeping
/** Cycle angle (0…720°) of cylinder index `c` (0-based) at crank angle `theta`. */
export const cyclePhase = (theta, c) => mod(theta - FIRING_OFFSET[c], 720);

/** Which stroke a cylinder is on at cycle angle `phi`. */
export const strokeAt = (phi) => STROKES[Math.floor(phi / 180)];

/** Index (0-based) of the cylinder on its power stroke at crank angle `theta`; exactly one always is. */
export const firingCylinder = (theta) => {
  const c = FIRING_OFFSET.findIndex((_, i) => cyclePhase(theta, i) < 180);
  return c < 0 ? 0 : c;
};

// ------------------------------------------------------------------ slider-crank: crank angle -> piston position
/**
 * Piston and rod pose for cycle angle `phi`. The crank pin goes round a circle of radius CRANK_R:
 *   pin = CRANK_R · (sin a, cos a) in (y, z), a = crank angle from top dead centre.
 * The wrist pin slides straight up the bore (y = 0) and the rod length is fixed, so by Pythagoras
 *   wristZ = pinZ + sqrt(ROD² − pinY²).
 * The rod leans by atan2(pinY, wristZ − pinZ) from vertical.
 */
export function sliderCrank(phi) {
  const a = mod(phi, 360) * D2R;
  const pinY = CRANK_R * Math.sin(a);
  const pinZ = CRANK_R * Math.cos(a);
  const wristZ = pinZ + Math.sqrt(ROD * ROD - pinY * pinY);
  return { pinY, pinZ, wristZ, rodAngle: Math.atan2(pinY, wristZ - pinZ) };
}

// ------------------------------------------------------------------ cam lobe -> valve lift
/**
 * Valve lift at cycle angle `phi` for one of VALVES. Between `open` and `close` the lift follows a smooth bump,
 * max · sin²(π·t) with t going 0→1 across the window (zero slope at both ends, like a real lobe's ramps).
 * A window that runs past 720° is handled by also trying phi + 720.
 */
export function valveLift(phi, valve) {
  const span = valve.close - valve.open;
  let t = (phi - valve.open) / span;
  if (t <= 0 || t >= 1) {
    t = (phi + 720 - valve.open) / span;
    if (t <= 0 || t >= 1) return 0;
  }
  return valve.max * Math.sin(Math.PI * t) ** 2;
}
