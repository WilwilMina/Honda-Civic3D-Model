// The list of explorable areas, read by main.js at boot. Each area lives in its own folder:
//   scene.js   — builds the 3D model for that area and its controls (see docs/ARCHITECTURE.md for the area API)
//   content.js — the learning text for the side panel: parts, systems, symptoms, videos, guides, intro card
// AREAS holds the scene modules, DATA the content modules (merged by core/registry.js).
// Order matters only for building: "car" must come first because the other areas attach to the car's body.
import car from "./car/scene.js";
import bay from "./bay/scene.js";
import engine from "./engine/scene.js";
import chassis from "./chassis/scene.js";
import trunk from "./trunk/scene.js";
import cabin from "./cabin/scene.js";
import lights from "./lights/scene.js";
import under from "./under/scene.js";
import * as carContent from "./car/content.js";
import * as bayContent from "./bay/content.js";
import * as engineContent from "./engine/content.js";
import * as chassisContent from "./chassis/content.js";
import * as trunkContent from "./trunk/content.js";
import * as cabinContent from "./cabin/content.js";
import * as lightsContent from "./lights/content.js";
import * as underContent from "./under/content.js";

export const AREAS = [car, bay, engine, chassis, trunk, cabin, lights, under];
export const DATA = {
  car: carContent,
  bay: bayContent,
  engine: engineContent,
  chassis: chassisContent,
  trunk: trunkContent,
  cabin: cabinContent,
  lights: lightsContent,
  under: underContent,
};
