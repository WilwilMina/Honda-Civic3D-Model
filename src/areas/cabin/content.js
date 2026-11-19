// Learning content for the "cabin" area, shown in the side panel. The text lives in ./content/, one file per
// kind; this file re-exports it under the names the app expects (src/areas/index.js imports this module as the
// cabin's DATA). Part ids are local; links to other areas use "area:id".
// Facts: docs/research/cabin.md (2013 Civic owner's manuals, Honda spec sheet, repair guides).
export { SYSTEMS } from "./content/systems.js";
export { PARTS } from "./content/parts.js";
export { SYMPTOMS } from "./content/symptoms.js";
export { VIDEOS } from "./content/videos.js";
export { GUIDES } from "./content/guides.js";
export { START } from "./content/intro.js";
