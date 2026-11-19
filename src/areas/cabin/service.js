// Owner-serviceable spots in the cabin: the glove box (hinged at its bottom edge) with the cabin air filter housing
// behind it, the filter itself (slides out toward the cabin), and the interior fuse box under the driver's side of
// the dash with its removable cover. Called from scene.js, which animates the returned groups and meshes.
// Frame: metres, +x = driver side, +y = front, z up.
import { iconCanvas } from "./icons.js";
import { COLORS } from "./kit.js";

// Glove box, filter housing, filter and filter cover. Returns { glove, filter, filterCover }.
export function buildGloveBox(kit) {
  const { THREE, mat, claim, P, root, add, at, rbox, facePlane, mkTex, M } = kit;
  const glove = new THREE.Group(); // hinge along the bottom edge
  glove.position.set(-0.395, 0.655, 0.6);
  root.add(glove);
  const gloveMat = mat(COLORS.dash, "plastic", P("glovebox"));
  add(at(rbox(0.45, 0.025, 0.185, 0.01), 0, 0, 0.095), gloveMat, "glovebox", glove);
  add(at(rbox(0.09, 0.012, 0.025, 0.005), 0, -0.016, 0.16), M.silver, "glovebox", glove); // latch handle
  // bin (attached to the door; hidden in the dash when closed)
  const binM = mat(0x1f2124, "plastic", P("glovebox"));
  add(at(new THREE.BoxGeometry(0.43, 0.22, 0.01), 0, 0.115, 0.01), binM, "glovebox", glove);
  for (const x of [-0.212, 0.212])
    add(at(new THREE.BoxGeometry(0.01, 0.22, 0.14), x, 0.115, 0.075), binM, "glovebox", glove);
  add(at(new THREE.BoxGeometry(0.43, 0.01, 0.14), 0, 0.225, 0.075), binM, "glovebox", glove);
  // filter housing (behind the glove box, low in the cavity) + the filter that slides out toward the cabin
  const housingMat = mat(0x3d4148, "plastic", P("filter-housing"));
  add(at(rbox(0.28, 0.14, 0.055, 0.006), -0.33, 0.95, 0.62), housingMat, "filter-housing");
  const filter = new THREE.Group();
  filter.position.set(-0.33, 0.96, 0.62);
  root.add(filter);
  // pleated white filter media with a grey frame
  const fCv = iconCanvas((g) => {
    g.fillStyle = "#f3f1ea";
    g.fillRect(0, 0, 128, 128);
    g.strokeStyle = "#c9c4b4";
    g.lineWidth = 3;
    for (let x = 6; x < 128; x += 8) {
      g.beginPath();
      g.moveTo(x, 4);
      g.lineTo(x, 124);
      g.stroke();
    }
    g.strokeStyle = "#8a8f96";
    g.lineWidth = 8;
    g.strokeRect(2, 2, 124, 124);
  });
  const fTex = mkTex(fCv);
  // "AIR FLOW ↓" label printed on the filter's front edge
  const arrowCv = document.createElement("canvas");
  arrowCv.width = 512;
  arrowCv.height = 64;
  {
    const g = arrowCv.getContext("2d");
    g.fillStyle = "#8a8f96";
    g.fillRect(0, 0, 512, 64);
    g.fillStyle = "#fff";
    g.font = "bold 40px Arial";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("AIR FLOW  ↓", 256, 34);
  }
  const fSide = new THREE.MeshStandardMaterial({ color: 0x8a8f96, roughness: 0.8 });
  const fTop = new THREE.MeshStandardMaterial({ color: 0xffffff, map: fTex, roughness: 0.9 });
  const fFront = new THREE.MeshStandardMaterial({ color: 0xffffff, map: mkTex(arrowCv), roughness: 0.8 });
  // filter is about 9.5 x 9.7 x 1.3 in; it lies flat (air flows down through it) and slides out toward the cabin
  add(new THREE.BoxGeometry(0.24, 0.245, 0.033), fSide, "cabin-filter", filter);
  add(at(new THREE.PlaneGeometry(0.236, 0.241), 0, 0, 0.0167), fTop, "cabin-filter", filter);
  add(at(facePlane(0.236, 0.03), 0, -0.1228, 0), fFront, "cabin-filter", filter);
  claim(filter, P("cabin-filter"));
  const filterCover = add(
    at(rbox(0.27, 0.012, 0.05, 0.004), -0.33, 0.876, 0.62),
    mat(0x2a2d32, "plastic", P("filter-housing")),
    "filter-housing",
  );
  return { glove, filter, filterCover };
}

// Interior fuse box with a grid of colour-coded fuses and a cover. Returns { fuseCover, fuseCoverHome }.
export function buildFuseBox(kit) {
  const { THREE, mat, P, root, add, at, rbox } = kit;
  const fuse = new THREE.Group();
  fuse.position.set(0.59, 0.76, 0.55);
  root.add(fuse);
  add(
    at(rbox(0.16, 0.06, 0.11, 0.008), 0, 0.02, 0),
    mat(0x1b1c1f, "plastic", P("fuse-box")),
    "fuse-box",
    fuse,
  );
  // 4 rows × 8 fuses; the colour index just scrambles the amp-rating colours so the grid looks realistic
  const fuseCols = [0xe5484d, 0x3f7fd6, 0xf2c230, 0xd9dee4, 0x30a46c, 0xc58a3a];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 8; c++)
      add(
        at(new THREE.BoxGeometry(0.012, 0.012, 0.016), -0.063 + c * 0.018, -0.012, 0.036 - r * 0.024),
        mat(fuseCols[(r * 3 + c * 5) % 6], "plastic", P("fuse-box")),
        "fuse-box",
        fuse,
      );
  const fuseCover = add(
    at(rbox(0.19, 0.012, 0.14, 0.01), 0, -0.03, 0),
    mat(COLORS.trim, "plastic", P("fuse-cover")),
    "fuse-box",
    fuse,
  );
  // the cover's geometry is pre-translated, so its position starts at 0; the swing-off animation offsets from here
  const fuseCoverHome = fuseCover.position.clone();
  return { fuseCover, fuseCoverHome };
}
