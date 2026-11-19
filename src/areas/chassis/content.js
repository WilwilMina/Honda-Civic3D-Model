// Learning content for the "Brakes & suspension" (chassis) area, shown in the side panel. The text lives in
// ./content/, one file per kind; this file re-exports it under the names the app expects (src/areas/index.js
// imports this module as the chassis DATA). Part ids are local; links to other areas use "area:id". Facts
// were checked against docs/research/chassis.md.
export { SYSTEMS } from "./content/systems.js";
export { PARTS } from "./content/parts.js";
export { SYMPTOMS } from "./content/symptoms.js";
export { VIDEOS } from "./content/videos.js";
export { START } from "./content/intro.js";
