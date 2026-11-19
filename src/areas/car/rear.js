// Rear details of the car exterior: bumper reflectors and diffuser, panel-gap backing and rear shading fixes
// (rear/bumper.js), trunk lid chrome bar, badges, plate recess and ducktail lip (rear/lid.js), and the tail lights,
// plate light and third brake light (rear/lamps.js). Called by body.js createBody as a section: build(ctx, B).
// The lid outline, chin and bumper panels themselves are cut from the shared body surface in body/panels.js.
import { buildBumperDetails } from "./rear/bumper.js";
import { buildLidDetails } from "./rear/lid.js";
import { buildRearLamps } from "./rear/lamps.js";

export function build(ctx, B) {
  buildBumperDetails(B);
  buildLidDetails(B);
  buildRearLamps(ctx, B);
}
