import * as THREE from 'three';

export interface Expense {
  id: number;
  amount: number;
  category: string;
  date: string;
  color: number;
}

export function createScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0e27);
  return scene;
};

export function createCamera(width: number, height: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  // Fixed camera position - looking straight at the carousel
  camera.position.set(0, 0, 11); 
  camera.lookAt(0, 0, 0);
  return camera;
};

export function createRenderer(width: number, height: number): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  return renderer;
};

export function createLighting(scene: THREE.Scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));

  // The "Hero" Spotlight - stays fixed at the front center
  const spotLight = new THREE.SpotLight(0xffffff, 2);
  spotLight.position.set(0, 5, 10);
  spotLight.angle = Math.PI / 6;
  spotLight.penumbra = 0.5;
  spotLight.decay = 2;
  spotLight.distance = 20;
  scene.add(spotLight);

  // Subtle accent light
  const pointLight = new THREE.PointLight(0x4ecdc4, 0.5);
  pointLight.position.set(-5, 2, 5);
  scene.add(pointLight);
}

// RENAMED: createExpensePill
export function createExpensePill(expense: Expense, index: number, total: number): THREE.Mesh {
  // Logic for Pill Dimensions
  // Radius grows slowly, Height grows more noticeably with cost
  const radius = Math.max(0.3, Math.log(expense.amount + 1) * 0.15);
  const length = Math.max(1, Math.log(expense.amount + 1) * 0.8);

  // CapsuleGeometry(radius, length, capSubdivisions, radialSegments)
  const geometry = new THREE.CapsuleGeometry(radius, length, 4, 16);
  
  const material = new THREE.MeshPhongMaterial({ 
    color: expense.color,
    shininess: 150, // Higher shininess looks better on curves
    emissive: expense.color,
    emissiveIntensity: 0.1
  });
  
  const pill = new THREE.Mesh(geometry, material);
  
  // Arrange in a circle
  const angle = (index / total) * Math.PI * 2;
  const orbitRadius = 4.5; // Distance from center
  
  pill.position.x = Math.cos(angle) * orbitRadius;
  pill.position.z = Math.sin(angle) * orbitRadius;
  pill.position.y = 0; // Centered vertically

  pill.castShadow = true;
  pill.receiveShadow = true;
  
  return pill;
};