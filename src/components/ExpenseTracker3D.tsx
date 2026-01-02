import { DollarSign, Plus, TrendingUp, Calendar } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { styles } from "../styles/style";
import * as THREE from "three";

// Custom Three.js modules
import { CarouselControls } from "../three/CarouselControls";
import {
  createScene,
  createCamera,
  createRenderer,
  createLighting,
  createExpensePill, // Using the new Pill function
  Expense,
} from "../three/sceneSetup";

export default function ExpenseTracker3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stageRef = useRef<THREE.Group | null>(null); // The "rotating platform"
  const controlsRef = useRef<CarouselControls | null>(null);
  
  const expenseObjectsRef = useRef<THREE.Mesh[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // UI State
  const [showAddForm, setShowAddForm] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 1, amount: 45.99, category: "Food", date: "2024-12-01", color: 0xff6b6b },
    { id: 2, amount: 120.0, category: "Transport", date: "2024-12-02", color: 0x4ecdc4 },
    { id: 3, amount: 29.99, category: "Entertainment", date: "2024-12-02", color: 0xffe66d },
  ]);

  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "",
    date: "",
  });

  const [totalExpenses, setTotalExpenses] = useState(0);

  // Calculate total expenses
  useEffect(() => {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    setTotalExpenses(total);
  }, [expenses]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Core Setup
    const scene = createScene();
    const camera = createCamera(width, height);
    const renderer = createRenderer(width, height);
    
    // 2. Create the "Stage" (The group that actually rotates)
    const stage = new THREE.Group();
    scene.add(stage);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    stageRef.current = stage;

    createLighting(scene);
    mountRef.current.appendChild(renderer.domElement);

    // 3. Carousel Controls
    // We pass the 'stage' group instead of the camera
    const controls = new CarouselControls(stage, renderer.domElement);
    controlsRef.current = controls;

    // 4. Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Updates rotation and damping of the stage
      controls.update();

      // Individual Pill animations (gentle floating)
      expenseObjectsRef.current.forEach((pill, i) => {
        pill.rotation.y += 0.01; // Spin individual pills
        pill.position.y = Math.sin(Date.now() * 0.0015 + i) * 0.15;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      controls.removeEventListeners();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Sync Pills with Expenses array
  useEffect(() => {
    if (!stageRef.current || !controlsRef.current) return;

    // Clear previous items from the stage
    while(stageRef.current.children.length > 0){ 
      stageRef.current.remove(stageRef.current.children[0]); 
    }
    expenseObjectsRef.current = [];

    // Add new Pills to the stage
    expenses.forEach((expense, i) => {
      const pill = createExpensePill(expense, i, expenses.length);
      stageRef.current!.add(pill);
      expenseObjectsRef.current.push(pill);
    });

    // Tell controls the new count for snapping math
    controlsRef.current.setItemCount(expenses.length);  
  }, [expenses]);

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.category || !newExpense.date) return;

    const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181];
    const exp: Expense = {
      id: Date.now(),
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      date: newExpense.date,
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setExpenses([...expenses, exp]);
    setNewExpense({ amount: "", category: "", date: "" });
    setShowAddForm(false);
  };

  return (
    <div className={styles.container}>
      <div ref={mountRef} className={styles.canvas} />

      <div className={styles.overlay}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.headerTitle}>
              <DollarSign className="text-emerald-400" />
              <h1 className={styles.title}>3D Expense Carousel</h1>
            </div>
            <button onClick={() => setShowAddForm(!showAddForm)} className={styles.addButton}>
              <Plus size={20} />
            </button>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <TrendingUp size={16} className="text-emerald-400" />
              <span className={styles.statValue}>${totalExpenses.toFixed(2)}</span>
            </div>
            <div className={styles.stat}>
              <Calendar size={16} className="text-blue-400" />
              <span>{expenses.length} items</span>
            </div>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Add Expense</h2>
            <div className={styles.formContainer}>
              <div>
                <label className={styles.label}>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className={styles.input}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className={styles.label}>Category</label>
                <input
                  type="text"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className={styles.input}
                  placeholder="Food, Transport, etc."
                />
              </div>
              <div>
                <label className={styles.label}>Date</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div className={styles.buttonGroup}>
                <button onClick={handleAddExpense} className={styles.submitButton}>
                  Add Expense
                </button>
                <button onClick={() => setShowAddForm(false)} className={styles.cancelButton}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.instructions}>
        <div className={styles.instructionsBox}>
          <p className={styles.instructionsText}>
            ↔️ Swipe horizontally to spin the carousel
          </p>
        </div>
      </div>
    </div>
  );
}