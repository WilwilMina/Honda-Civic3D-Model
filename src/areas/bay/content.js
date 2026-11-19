// Learning content for the "Under the hood" (engine bay) area, shown in the side panel.
// The text lives in ./content/, one file per kind; this file re-exports it under the names the app expects
// (src/areas/index.js imports this module as the bay's DATA). Part ids are local; links to other areas use "area:id".
// Facts were checked against docs/research/engine.md.
export { SYSTEMS } from "./content/systems.js";
export { PARTS } from "./content/parts.js";
export { SYMPTOMS } from "./content/symptoms.js";
export { VIDEOS } from "./content/videos.js";
export { START } from "./content/intro.js";
