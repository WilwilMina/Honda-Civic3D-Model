// The timing drive of the engine cutaway, at the +x end (x 104…108): crank and cam sprockets, the chain running
// round them, and the tensioner and guide on the two straight runs. The cam sprocket has twice the teeth of the
// crank sprocket, so the cam turns once per two crank turns. buildTiming() makes the meshes; poseTiming() turns
// the sprockets and moves every chain link. Local engine frame (2 mm units).
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { CAM_AXIS, D2R, mod } from "./kinematics.js";
import { slab, cylX, cylAB, boxG, gear, mergeable } from "./geometry.js";
import { matOf } from "./kit.js";

// Chain pitch-line radii on the two sprockets, and the distance between their centres (crank at z = 0).
const R_CRANK = 11.2;
const R_CAM = 21.2;
const CENTRES = CAM_AXIS[1];
// The straight runs are the outer tangents of the two circles; they lean by this angle from vertical.
const TANGENT = Math.asin((R_CAM - R_CRANK) / CENTRES);
const LINK_PITCH = 4.2; // target link spacing; rounded so a whole number of links fills the loop

/** Build the sprockets, chain, tensioner and guide. Returns the handles to pose. */
export function buildTiming(kit, ctx) {
  const { root, bucket, pickWhenShown } = kit;

  // ---------------------------------------------------------------- sprockets
  const crankSprocket = new THREE.Group();
  crankSprocket.name = "sprocket-crank";
  root.add(crankSprocket);
  bucket(gear(104, 108, 10, 18, 1.4), "chain", 0x9aa1a8, "chrome", crankSprocket);
  const camSprocket = new THREE.Group();
  camSprocket.name = "sprocket-cam";
  camSprocket.position.set(0, CAM_AXIS[0], CAM_AXIS[1]);
  root.add(camSprocket);
  bucket(gear(104, 108, 20, 36, 1.4), "chain", 0x9aa1a8, "chrome", camSprocket);
  bucket(cylX(103.9, 108.1, 6, 6), "chain", 0x5d636a, "metal", camSprocket); // cam bolt / hub

  // ---------------------------------------------------------------- chain path (y, z) and arc-length table
  // Half way round the cam sprocket, down one straight run, half way round the crank sprocket, up the other.
  const loop = [];
  const arc = (cz, r, a0, a1) => {
    const n = Math.max(8, Math.ceil((Math.abs(a1 - a0) * r) / 1.5));
    for (let i = 0; i < n; i++) {
      const t = a0 + ((a1 - a0) * i) / n;
      loop.push([Math.sin(t) * r, cz + Math.cos(t) * r]);
    }
  };
  arc(CENTRES, R_CAM, -Math.PI / 2 - TANGENT, Math.PI / 2 + TANGENT);
  loop.push([R_CAM * Math.cos(TANGENT), CENTRES - R_CAM * Math.sin(TANGENT)]);
  arc(0, R_CRANK, Math.PI / 2 + TANGENT, (3 * Math.PI) / 2 - TANGENT);
  loop.push([-R_CRANK * Math.cos(TANGENT), -R_CRANK * Math.sin(TANGENT)]);
  const cum = [0]; // cum[i] = path length from loop[0] to loop[i]
  for (let i = 1; i <= loop.length; i++) {
    const a = loop[i - 1],
      b = loop[i % loop.length];
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const loopLength = cum[cum.length - 1];
  const linkCount = Math.round(loopLength / LINK_PITCH),
    pitch = loopLength / linkCount;
  // point at path length s: [y, z, direction angle], by binary search in the length table
  const along = (s) => {
    s = mod(s, loopLength);
    let lo = 0,
      hi = loop.length;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (cum[m] <= s) lo = m;
      else hi = m;
    }
    const a = loop[lo],
      b = loop[(lo + 1) % loop.length],
      f = (s - cum[lo]) / (cum[lo + 1] - cum[lo] || 1);
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, Math.atan2(b[1] - a[1], b[0] - a[0])];
  };

  // ---------------------------------------------------------------- chain: one instanced mesh (plate + pin per link)
  const linkG = mergeGeometries(
    [boxG([104.3, -1.9, -1.1], [107.7, 1.9, 1.1]), cylX(103.8, 108.2, 0.75, 8).translate(0, 2.1, 0)].map(
      mergeable,
    ),
  );
  const links = new THREE.InstancedMesh(linkG, matOf(0x555b62, "chrome"), linkCount);
  links.name = "timing-chain";
  links.frustumCulled = false;
  ctx.claim(links, "engine:chain");
  pickWhenShown(links);
  root.add(links);

  // ---------------------------------------------------------------- tensioner (on the −y run) and fixed guide (+y run)
  // y of a straight run at height z (it narrows linearly from the cam sprocket to the crank sprocket), 1.2 outside it
  const runY = (z) => (R_CRANK + (R_CAM - R_CRANK) * (z / CENTRES)) * Math.cos(TANGENT) + 1.2;
  bucket(
    slab(
      [
        [-runY(40), 40],
        [-runY(130), 130],
        [-runY(130) - 3, 130],
        [-runY(40) - 3, 40],
      ],
      104,
      108,
    ),
    "tensioner",
    0x3a3e44,
    "plastic",
  ); // tensioner arm
  bucket(cylAB([106, -runY(100) - 3, 100], [106, -32, 100], 2.4, 12), "tensioner", 0x8e949a, "chrome"); // plunger
  bucket(cylX(103, 109, 4, 6).translate(0, -34, 100), "tensioner", 0x5d636a, "metal"); // tensioner body
  bucket(
    slab(
      [
        [runY(30), 30],
        [runY(140), 140],
        [runY(140) + 3, 140],
        [runY(30) + 3, 30],
      ],
      104,
      108,
    ),
    "tensioner",
    0x3a3e44,
    "plastic",
  ); // fixed guide

  return { crankSprocket, camSprocket, links, linkCount, pitch, along };
}

// scratch objects reused every frame
const m4 = new THREE.Matrix4(),
  q = new THREE.Quaternion(),
  p = new THREE.Vector3(),
  one = new THREE.Vector3(1, 1, 1),
  xAxis = new THREE.Vector3(1, 0, 0);

/** Turn the sprockets and move the chain for crank angle `theta` (degrees). */
export function poseTiming(timing, theta) {
  const { crankSprocket, camSprocket, links, linkCount, pitch, along } = timing;
  crankSprocket.rotation.x = -theta * D2R;
  camSprocket.rotation.x = (-theta * D2R) / 2;
  // the chain moves at the crank sprocket's pitch-line speed: arc length = angle × radius
  const s0 = theta * D2R * R_CRANK;
  for (let i = 0; i < linkCount; i++) {
    const [y, z, ang] = along(s0 + i * pitch);
    links.setMatrixAt(i, m4.compose(p.set(0, y, z), q.setFromAxisAngle(xAxis, ang), one));
  }
  links.instanceMatrix.needsUpdate = true;
}
