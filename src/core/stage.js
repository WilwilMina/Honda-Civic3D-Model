// The fixed 3D stage that every area shares: WebGL renderer, scene, lights, garage floor, camera with
// orbit controls, and `carRoot`, the group every area's model is added to. Built once by createApp()
// (core/app.js), which then drives it from its frame loop.
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { C } from "./materials.js";

// High-DPI laptop screens report 1.5–2.5; above 1.5 the extra pixels cost a lot of GPU for little visible gain.
export const MAX_DPR = 1.5;

// Build the renderer (its canvas goes into `canvasHost`), scene, lights, floor, camera, controls and carRoot.
export function createStage(canvasHost) {
  // ------------------------------------------------------------ renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(MAX_DPR, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // The shadow pass re-renders the whole car, so it is redrawn on demand (throttled in app.js's frame loop).
  renderer.shadowMap.autoUpdate = false;
  canvasHost.appendChild(renderer.domElement);

  // ------------------------------------------------------------ scene + image-based lighting
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeceae4);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  // the environment map lives on the GPU, so rebuild it if the browser drops and restores the WebGL context
  renderer.domElement.addEventListener("webglcontextrestored", () => {
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
  });
  scene.environmentIntensity = 0.55;

  // ------------------------------------------------------------ camera + orbit controls (z is up)
  const camera = new THREE.PerspectiveCamera(38, 1, 0.02, 200);
  camera.up.set(0, 0, 1);
  camera.position.set(5.2, 4.6, 2.4);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0.6);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 2.8; // whole-car view (sections lower it in go())
  controls.maxDistance = 14;
  controls.maxPolarAngle = Math.PI * 0.98;
  controls.update();

  // ------------------------------------------------------------ lights
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb9b4aa, 0.9));
  // the sun casts the only shadows; its 8 m × 8 m shadow box covers the car and the floor around it
  const sun = new THREE.DirectionalLight(0xffffff, 2.0);
  sun.position.set(4, 6, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 30 });
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.5);
  fill.position.set(-6, -4, 3);
  scene.add(fill);

  // ------------------------------------------------------------ garage floor
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(9, 96),
    new THREE.MeshStandardMaterial({ color: C.floor, roughness: 0.92, metalness: 0 }),
  );
  floor.receiveShadow = true;
  floor.name = "floor";
  scene.add(floor);
  // thin decorative ring on the floor around the car (lifted 1 mm to avoid z-fighting)
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(3.4, 3.43, 128),
    new THREE.MeshBasicMaterial({ color: 0xc9c6bd }),
  );
  ring.position.z = 0.001;
  scene.add(ring);

  // ------------------------------------------------------------ car root
  const carRoot = new THREE.Group();
  carRoot.name = "car";
  // Areas are authored with +x = driver side (see docs/ARCHITECTURE.md). In a right-handed z-up frame with
  // +y forward, +x is the car's RIGHT, so mirror the whole car once here to put the driver on the left like
  // the real (US) car.
  carRoot.scale.x = -1;
  scene.add(carRoot);

  return { renderer, scene, camera, controls, carRoot };
}

// Small parts don't need their own shadows (they fall inside the body's shadow); this saves many draw calls.
// Run once after every area is built (app.start()). r = bounding-sphere radius in world units, divided by √3
// to undo the length of the (1,1,1) scale vector.
export function cullSmallShadows(root) {
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (!o.isMesh || !o.castShadow) return;
    if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
    const r =
      (o.geometry.boundingSphere.radius * o.getWorldScale(new THREE.Vector3()).length()) / Math.sqrt(3);
    if (r < 0.12) o.castShadow = false;
  });
}
