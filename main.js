import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000011); // Dark blue for night sky

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(10, 10, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0xffffff }) // Snowy ground
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Fog
scene.fog = new THREE.Fog(0x000011, 10, 50); // Night fog

// Moonlight
const moonLight = new THREE.DirectionalLight(0xaaaaff, 0.4); // Cool moonlight for nighttime
moonLight.position.set(10, 30, -10);
moonLight.castShadow = true;
scene.add(moonLight);

// Ambient light
const ambientLight = new THREE.AmbientLight(0x222222, 0.3); // Dim ambient light for night
scene.add(ambientLight);

// Shrine bounds
const shrineBounds = new THREE.Box3(
  new THREE.Vector3(-2, 0, -2), 
  new THREE.Vector3(2, 6, 2)
);

// Helper function
const isPositionInShrineArea = (x, y, z) => {
  const position = new THREE.Vector3(x, y, z);
  return shrineBounds.containsPoint(position);
};

// Trees with brown trunks and layered leaves
const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // Brown for tree trunks
const snowMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // Snow for leaves

for (let i = 0; i < 50; i++) {
  const x = Math.random() * 40 - 20;
  const z = Math.random() * 40 - 20;
  
  if (!isPositionInShrineArea(x, 3, z)) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.5, 6, 16),
      trunkMaterial
    );
    trunk.position.set(x, 3, z);
    trunk.castShadow = true;

    // Layered foliage
    const foliageLayers = [];
    for (let j = 0; j < 3; j++) {
      const foliage = new THREE.Mesh(
        new THREE.ConeGeometry(2 - j * 0.5, 2, 16),
        snowMaterial
      );
      foliage.position.set(x, trunk.position.y + 4 + j * 1.5, z);
      foliage.castShadow = true;
      foliageLayers.push(foliage);
    }

    scene.add(trunk, ...foliageLayers);
  }
}

// Mushrooms with red caps
const mushroomCapMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red cap
const mushroomStemMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White stem

for (let i = 0; i < 50; i++) {
  const x = Math.random() * 40 - 20;
  const z = Math.random() * 40 - 20;
  
  if (!isPositionInShrineArea(x, 0.25, z)) {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.2, 0.5),
      mushroomStemMaterial
    );
    const cap = new THREE.Mesh(
      new THREE.ConeGeometry(0.4, 0.3, 8),
      mushroomCapMaterial
    );
    stem.position.set(x, 0.25, z);
    cap.position.set(x, 0.55, z);

    stem.castShadow = true;
    cap.castShadow = true;

    scene.add(stem);
    scene.add(cap);
  }
}

// Fireflies
const fireflies = [];
for (let i = 0; i < 15; i++) {
  const firefly = new THREE.PointLight(0xffff00, 2, 7);
  firefly.position.set(
    Math.random() * 40 - 20,
    Math.random() * 5 + 1,
    Math.random() * 40 - 20
  );
  scene.add(firefly);
  fireflies.push({
    light: firefly,
    velocity: new THREE.Vector3(
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05
    ),
  });
}

// Shrine
const shrine = new THREE.Group();
const base = new THREE.Mesh(
  new THREE.BoxGeometry(3, 1, 3),
  new THREE.MeshStandardMaterial({ color: 0x555555 }) // Dark gray base
);
base.position.y = 0.5;
base.castShadow = true;

const orb = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshStandardMaterial({ emissive: 0x00ff88, emissiveIntensity: 10 }) // Bright black glow
);
orb.position.y = 2;
orb.castShadow = true;

shrine.add(base);
shrine.add(orb);
scene.add(shrine);

// Camera Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

// Animation
const clock = new THREE.Clock();
const animate = () => {
  const elapsedTime = clock.getElapsedTime();

  // Firefly movement
  fireflies.forEach(({ light, velocity }) => {
    light.position.add(velocity);
    if (light.position.y < 1 || light.position.y > 6) velocity.y *= -1;
    if (light.position.x < -20 || light.position.x > 20) velocity.x *= -1;
    if (light.position.z < -20 || light.position.z > 20) velocity.z *= -1;
  });

  // Shrine orb pulsing effect
  const intensity = Math.abs(Math.sin(elapsedTime));
  orb.material.emissiveIntensity = intensity * 10; // Amplified for a bright glow

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
