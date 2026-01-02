import * as THREE from 'three';

export class CarouselControls {
  private target: THREE.Group;
  private domElement: HTMLElement;
  
  private isDragging = false;
  private previousX = 0;
  private velocity = 0;
  
  // Carousel logic
  private currentRotation = 0;
  private itemCount = 0;
  private targetRotation = 0;
  private isSnapping = false;

  constructor(target: THREE.Group, domElement: HTMLElement) {
    this.target = target;
    this.domElement = domElement;
    this.addEventListeners();
  }

  public setItemCount(count: number) {
    this.itemCount = count;
  }

  private handleStart = (e: TouchEvent | MouseEvent) => {
    this.isDragging = true;
    this.isSnapping = false;
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    this.previousX = clientX;
  };

  private handleMove = (e: TouchEvent | MouseEvent) => {
    if (!this.isDragging) return;
    if (e.cancelable) e.preventDefault();

    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const deltaX = clientX - this.previousX;

    // Direct rotation during drag
    this.velocity = deltaX * 0.008;
    this.currentRotation += this.velocity;
    
    this.previousX = clientX;
  };

  private handleEnd = () => {
    this.isDragging = false;
    
    // Calculate which "slot" we are closest to
    if (this.itemCount > 0) {
      const angleStep = (Math.PI * 2) / this.itemCount;
      // If velocity is high enough, push to next slot, otherwise snap to nearest
      const forceShift = Math.abs(this.velocity) > 0.05 ? Math.sign(this.velocity) : 0;
      const nearestIndex = Math.round(this.currentRotation / angleStep) + forceShift;
      
      this.targetRotation = nearestIndex * angleStep;
      this.isSnapping = true;
    }
  };

  private addEventListeners() {
    this.domElement.addEventListener('touchstart', this.handleStart as EventListener, { passive: false });
    this.domElement.addEventListener('touchmove', this.handleMove as EventListener, { passive: false });
    this.domElement.addEventListener('touchend', this.handleEnd);
    this.domElement.addEventListener('mousedown', this.handleStart as EventListener);
    this.domElement.addEventListener('mousemove', this.handleMove as EventListener);
    this.domElement.addEventListener('mouseup', this.handleEnd);
    this.domElement.addEventListener('mouseleave', this.handleEnd);
  }

  public removeEventListeners() {
    this.domElement.removeEventListener('touchstart', this.handleStart as EventListener);
    this.domElement.removeEventListener('touchmove', this.handleMove as EventListener);
    this.domElement.removeEventListener('touchend', this.handleEnd);
    this.domElement.removeEventListener('mousedown', this.handleStart as EventListener);
    this.domElement.removeEventListener('mousemove', this.handleMove as EventListener);
    this.domElement.removeEventListener('mouseup', this.handleEnd);
    this.domElement.removeEventListener('mouseleave', this.handleEnd);
  }

  public update() {
    if (this.isDragging) {
      // Manual drag
      this.target.rotation.y = this.currentRotation;
    } else if (this.isSnapping) {
      // The "Swoop": Interpolate current rotation to target rotation
      const step = 0.1; // Adjust for swoop speed (0.1 is snappy, 0.05 is lazier)
      const diff = this.targetRotation - this.currentRotation;
      
      this.currentRotation += diff * step;
      this.target.rotation.y = this.currentRotation;

      // Stop snapping when close enough
      if (Math.abs(diff) < 0.001) {
        this.currentRotation = this.targetRotation;
        this.target.rotation.y = this.currentRotation;
        this.isSnapping = false;
      }
    }
  }
}