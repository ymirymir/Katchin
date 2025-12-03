import * as THREE from 'three';

export class CameraControls {
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private isDragging = false;
  private previousTouch = { x: 0, y: 0 };
  public rotationVelocity = { x: 0, y: 0 };
  
  constructor(camera: THREE.Camera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    
    this.addEventListeners();
  }
  
  private handleStart = (e: TouchEvent | MouseEvent) => {
    this.isDragging = true;
    const touch = 'touches' in e ? e.touches[0] : e;
    this.previousTouch = { x: touch.clientX, y: touch.clientY };
  };
  
  private handleMove = (e: TouchEvent | MouseEvent) => {
    if (!this.isDragging) return;
    e.preventDefault();
    
    const touch = 'touches' in e ? e.touches[0] : e;
    const deltaX = touch.clientX - this.previousTouch.x;
    const deltaY = touch.clientY - this.previousTouch.y;
    
    this.rotationVelocity.x = deltaY * 0.01;
    this.rotationVelocity.y = deltaX * 0.01;
    
    this.previousTouch = { x: touch.clientX, y: touch.clientY };
  };
  
  private handleEnd = () => {
    this.isDragging = false;
  };
  
  private addEventListeners() {
    this.domElement.addEventListener('touchstart', this.handleStart as EventListener);
    this.domElement.addEventListener('touchmove', this.handleMove as EventListener, { passive: false });
    this.domElement.addEventListener('touchend', this.handleEnd);
    this.domElement.addEventListener('mousedown', this.handleStart as EventListener);
    this.domElement.addEventListener('mousemove', this.handleMove as EventListener);
    this.domElement.addEventListener('mouseup', this.handleEnd);
  }
  
  public removeEventListeners() {
    this.domElement.removeEventListener('touchstart', this.handleStart as EventListener);
    this.domElement.removeEventListener('touchmove', this.handleMove as EventListener);
    this.domElement.removeEventListener('touchend', this.handleEnd);
    this.domElement.removeEventListener('mousedown', this.handleStart as EventListener);
    this.domElement.removeEventListener('mousemove', this.handleMove as EventListener);
    this.domElement.removeEventListener('mouseup', this.handleEnd);
  }
  
  public update() {
    if (!this.isDragging) {
      this.rotationVelocity.x *= 0.95;
      this.rotationVelocity.y *= 0.95;
    }
    
    this.camera.position.x += this.rotationVelocity.y;
    this.camera.position.y -= this.rotationVelocity.x;
    
    const distance = Math.sqrt(
      this.camera.position.x ** 2 + 
      this.camera.position.y ** 2 + 
      this.camera.position.z ** 2
    );
    
    if (distance > 15) {
      this.camera.position.multiplyScalar(15 / distance);
    }
    
    this.camera.lookAt(0, 0, 0);
  }
}