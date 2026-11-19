// The static castings of the engine cutaway: see-through block, head and oil pan, the cylinder bores,
// the head gasket, the oil in the pan, the drain plug and the oil pump with its pickup.
// Built in the engine's local frame (2 mm units, see kinematics.js); nothing here moves.
import * as THREE from "three";
import { CYL_X, BORE_R, DECK } from "./kinematics.js";
import { boxG, cylZ, keepFaces } from "./geometry.js";
import { noPick } from "./kit.js";

/** Add the block, head, pan, gasket and oil parts to the kit's root group. */
export function buildBlock(kit) {
  const { root, C, part, bucket } = kit;

  // ---------------------------------------------------------------- see-through shells
  // An open box: faint far walls (clickable as the part) plus outline edges. `keep` lists the box faces to draw
  // (+x −x +y −y +z −z = 0…5). BackSide shows the inner faces of the far walls; three.js raycasts in local space,
  // so BackSide picking stays correct under the car root's x mirror.
  const shell = (a, b, key, color, keep) => {
    const g = boxG(a, b);
    part(keepFaces(g, keep), key, color, "plastic", root, {
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      side: THREE.BackSide,
    });
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(g),
      new THREE.LineBasicMaterial({ color: 0x8a939c, transparent: true, opacity: 0.55 }),
    );
    root.add(noPick(edges));
  };
  shell([-100, -32, -8], [100, 32, DECK], "block", 0xb4bec8, [0, 1, 2, 3]);
  shell([-100, -32, DECK + 1], [100, 32, 195], "head", 0xd2d6db, [0, 1, 2, 3, 4]);
  shell([-96, -30, -70], [96, 30, -8], "oil-pan", 0x9aa3ab, [0, 1, 2, 3, 5]);

  // ---------------------------------------------------------------- cylinder bores, drawn as faint rings
  const ringG = new THREE.BufferGeometry().setFromPoints(
    Array.from({ length: 49 }, (_, i) => {
      const t = (i / 48) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(t) * BORE_R, Math.sin(t) * BORE_R, 0);
    }),
  );
  const ringMat = new THREE.LineBasicMaterial({ color: 0x7d8792, transparent: true, opacity: 0.6 });
  for (const x of CYL_X)
    for (const z of [DECK, 22, 70]) {
      const ring = noPick(new THREE.Line(ringG, ringMat));
      ring.position.set(x, 0, z);
      root.add(ring);
    }

  // ---------------------------------------------------------------- head gasket: a thin plate with four bore holes
  {
    const s = new THREE.Shape(
      [
        [-100, -32],
        [100, -32],
        [100, 32],
        [-100, 32],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    );
    for (const x of CYL_X) {
      const hole = new THREE.Path();
      hole.absarc(x, 0, BORE_R, 0, Math.PI * 2, true);
      s.holes.push(hole);
    }
    const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false, curveSegments: 20 });
    g.translate(0, 0, DECK);
    bucket(g, "head-gasket", 0xb98a5e, "metal", root, { transparent: true, opacity: 0.5, depthWrite: false });
  }

  // ---------------------------------------------------------------- oil in the pan, drain plug, pump and pickup
  bucket(boxG([-94, -28, -69.5], [94, 28, -56]), "oil-pan", C.oil, "plastic", root, {
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
    roughness: 0.25,
  });
  bucket(cylZ(-74, -70, 3.4, 6), "oil-pan", C.darksteel, "metal"); // drain plug
  bucket(boxG([74, -16, -40], [90, 10, -24]), "oil-pump", C.cast, "metal");
  bucket(cylZ(-62, -40, 2.2, 12).translate(82, -3, 0), "oil-pump", C.cast, "metal"); // pickup tube
  bucket(cylZ(-64, -62, 7, 32).translate(82, -3, 0), "oil-pump", C.darksteel, "metal"); // pickup screen
}
