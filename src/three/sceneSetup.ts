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
  camera.position.set(3,3,6);
  return camera;
};

export function createRenderer(width: number, height: number): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  return renderer;
};

export function createLighting(scene: THREE.Scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);

  const pointLight2 = new THREE.PointLight(0x4ecdc4, 0.5);
  pointLight2.position.set(-5, 3, -5);
  scene.add(pointLight2);
};

export function createGrid(scene: THREE.Scene) {
  const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
  scene.add(gridHelper);
};

export function createExpenseCube (expense: Expense, index: number, total: number): THREE.Mesh {
  const size = Math.log(expense.amount + 1) * 0.5;
  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshPhongMaterial({ 
    color: expense.color,
    shininess: 100,
    emissive: expense.color,
    emissiveIntensity: 0.2
  });
  const cube = new THREE.Mesh(geometry, material);
  
  const angle = (index / total) * Math.PI * 2;
  const radius = 3;
  cube.position.x = Math.cos(angle) * radius;
  cube.position.z = Math.sin(angle) * radius;
  cube.position.y = size / 2;

  cube.castShadow = true;
  cube.receiveShadow = true;
  
  return cube;
};