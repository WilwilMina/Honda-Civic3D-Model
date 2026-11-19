// "Car" area: the whole car, outside, a 2013 Honda Civic LX sedan. This file is the area definition
// (docs/ARCHITECTURE.md): it composes the shared body and the section details:
//   car/body.js  - the measured body (car/body/: profile, sections, panels, doors, wheels, wipers, ctx.car API)
//   car/front.js - front fascia, headlights, grille + chrome smile, lower intake, washer nozzles (car/front/)
//   car/rear.js  - bumper reflectors + diffuser, lid chrome bar, badges, plate recess, tail lights (car/rear/)
//   car/side.js  - glass trim, door handles, mirrors, fuel door, wheel-well liners
import { createBody } from "./body.js";
import * as front from "./front.js";
import * as rear from "./rear.js";
import * as side from "./side.js";

export default {
  id: "car",
  label: "Car",
  parent: null,
  build(ctx) {
    return createBody(ctx, [side.build, front.build, rear.build]);
  },
};
