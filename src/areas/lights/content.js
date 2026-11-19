// Learning content for the "Lights & wipers" area (exterior lights, wipers, washers), shown in the side panel.
// The text lives in ./content/, one file per kind; this file re-exports it under the names the app expects
// (src/areas/index.js imports this module as the area's DATA). Part ids are the ones lights/scene.js tags the
// car's lamp meshes with. Facts from docs/research/exterior.md (sections 8 and 9) and docs/research/cabin.md.
export { SYSTEMS } from "./content/systems.js";
export { PARTS } from "./content/parts.js";
export { SYMPTOMS } from "./content/symptoms.js";
export { VIDEOS } from "./content/videos.js";
export { GUIDES } from "./content/guides.js";
export { START } from "./content/intro.js";
