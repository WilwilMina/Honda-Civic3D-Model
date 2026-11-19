// Learning content for the "under" area (the bottom of the car, seen from below on a lift), shown in the side
// panel. The text lives in ./content/, one file per kind; this file re-exports it under the names the app expects
// (src/areas/index.js imports this module as the area's DATA). Part ids are the ones under/scene.js tags.
// Sources: docs/research/chassis.md, docs/research/engine.md, docs/research/exterior.md and the AAA leak guide.
export { SYSTEMS } from "./content/systems.js";
export { PARTS } from "./content/parts.js";
export { SYMPTOMS } from "./content/symptoms.js";
export { VIDEOS } from "./content/videos.js";
export { START } from "./content/intro.js";
