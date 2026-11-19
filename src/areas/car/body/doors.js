// The four doors: each is a group hinged at its front edge (rotation about z), holding the door skin, inner trim
// panel, beltline trim and the window (glass + black frames). The rear doors carry a pointed upper extension over
// the rear wheel arch and a fixed quarter glass. Handles and mirrors are added later by side.js.
import * as THREE from "three";
import { st } from "./section.js";
import { sideGeo } from "./surface.js";
import {
  DLO_F,
  GAP,
  YQ0,
  YQ1,
  Y_FD0,
  Y_FD1,
  Y_RD0,
  Y_RD1,
  Y_RDT,
  doorCut,
  gTop,
  qFrame,
  qTop,
  uDoor,
} from "./cut-lines.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// buildDoors(kit) -> {fl, fr, rl, rr}: {group, side, angle, skin, handleY}. side = +1 driver / -1 passenger;
// group rotates about z at the hinge (api.js setDoor); skin holds the door's meshes in world coordinates.
export function buildDoors({ g, M, mat, mesh }) {
  const doors = {};
  // one door over y0..y1 (rear edge .. front edge, hinged at the front edge, 0.6 m up). ext: y of the upper rear
  // extension over the arch (rear doors); handle: [y of the handle]; win(skin, ya, yb) builds the window
  function makeDoor(id, side, y0, y1, { ext = null, handle, win }) {
    const d = new THREE.Group();
    d.name = "door-" + id;
    const s0 = st(y1);
    const pivot = V(side * s0.W, y1, 0.6);
    d.position.copy(pivot);
    g.add(d);
    const skin = new THREE.Group();
    skin.position.copy(pivot).multiplyScalar(-1);
    d.add(skin);
    const ya = y0 + GAP,
      yb = y1 - GAP;
    mesh(sideGeo(side, ya, yb, uDoor, 1), M.doors, skin, "door-skin");
    if (ext)
      mesh(
        sideGeo(side, ext + GAP, ya, (y) => doorCut(y), 1),
        M.doors,
        skin,
        "door-skin",
      );
    // inner trim panel
    mesh(
      sideGeo(side, ya + 0.02, yb - 0.02, (y) => uDoor(y) + 0.03, 0.98, { off: -0.07, dens: 12 }),
      M.inner,
      skin,
      "door-inner",
    );
    mesh(sideGeo(side, (ext || ya) + 0.02, yb - 0.02, 1.0, 1.04), M.trim, skin, "beltline-trim");
    win(skin, ext || ya, yb);
    doors[id] = { group: d, side, angle: 0, skin, handleY: handle[0] }; // handles are added by side.js
    return d;
  }
  // front door window: glass from just ahead of the B-pillar to DLO_F, black frame, mirror sail ahead of the glass
  const frontWin = (side) => (skin, ya, yb) => {
    const gl = 1.04; // glass bottom (half u, just above the belt)
    const gr = ya + 0.042; // glass rear edge (y -0.17); most of the black B-pillar is on the rear door
    mesh(sideGeo(side, gr, DLO_F, gl, gTop, { off: -0.004 }), M.glass, skin, "door-glass");
    mesh(sideGeo(side, ya, gr, gl, 2), M.trim, skin, "frame-rear"); // B-pillar applique (front door part)
    mesh(sideGeo(side, gr, DLO_F, gTop, 2), M.trim, skin, "frame-top");
    mesh(sideGeo(side, DLO_F, yb, gl, 2), M.trim, skin, "sail"); // mirror sail
  };
  // rear door window: glass, frame, the divider and the fixed quarter glass tapering to the pointed tip
  const rearWin = (side) => (skin, ya, yb) => {
    const gl = 1.04,
      gy1 = yb - 0.153; // glass front edge (y -0.377)
    mesh(sideGeo(side, YQ0, gy1, gl, gTop, { off: -0.004 }), M.glass, skin, "door-glass");
    mesh(sideGeo(side, gy1, yb, gl, 2), M.trim, skin, "frame-front");
    mesh(sideGeo(side, YQ0, gy1, gTop, 2), M.trim, skin, "frame-top");
    mesh(sideGeo(side, YQ1, YQ0, gl, 2), M.trim, skin, "divider");
    mesh(
      sideGeo(side, ya, YQ1, gl, qTop, { off: -0.004 }),
      mat(0x2e3c44, "glass", "car:glass"),
      skin,
      "fixed-glass",
    );
    mesh(sideGeo(side, ya, YQ1, qTop, qFrame), M.trim, skin, "frame-quarter");
  };
  makeDoor("fl", 1, Y_FD0, Y_FD1, { handle: [-0.06], win: frontWin(1) });
  makeDoor("fr", -1, Y_FD0, Y_FD1, { handle: [-0.06], win: frontWin(-1) });
  makeDoor("rl", 1, Y_RD0, Y_RD1, { ext: Y_RDT, handle: [-0.975], win: rearWin(1) });
  makeDoor("rr", -1, Y_RD0, Y_RD1, { ext: Y_RDT, handle: [-0.975], win: rearWin(-1) });
  doors.fl.group.userData.goto = "cabin";
  return doors;
}
