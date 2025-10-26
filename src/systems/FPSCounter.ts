export interface FPSCounter {
  fps: number;
  frameCount: number;
  lastTime: number;
  updateInterval: number; // How often to update FPS (in ms)
  enabled: boolean;
  onUpdate?: (fps: number) => void;
}

export function createFPSCounter(
  updateInterval: number = 500,
  onUpdate?: (fps: number) => void
): FPSCounter {
  return {
    fps: 60,
    frameCount: 0,
    lastTime: performance.now(),
    updateInterval,
    enabled: false,
    onUpdate,
  };
}

export function updateFPSCounter(fpsCounter: FPSCounter): void {
  if (!fpsCounter.enabled) return;

  const currentTime = performance.now();
  fpsCounter.frameCount++;

  // Calculate FPS at specified interval
  const deltaTime = currentTime - fpsCounter.lastTime;
  if (deltaTime >= fpsCounter.updateInterval) {
    // FPS = frames / (deltaTime in seconds)
    fpsCounter.fps = Math.round((fpsCounter.frameCount * 1000) / deltaTime);

    // Trigger callback if provided
    if (fpsCounter.onUpdate) {
      fpsCounter.onUpdate(fpsCounter.fps);
    }

    // Reset for next interval
    fpsCounter.frameCount = 0;
    fpsCounter.lastTime = currentTime;
  }
}

export function enableFPSCounter(fpsCounter: FPSCounter): void {
  fpsCounter.enabled = true;
  fpsCounter.frameCount = 0;
  fpsCounter.lastTime = performance.now();
  console.log("FPS counter enabled");
}

export function disableFPSCounter(fpsCounter: FPSCounter): void {
  fpsCounter.enabled = false;
  console.log("FPS counter disabled");
}

export function toggleFPSCounter(fpsCounter: FPSCounter): boolean {
  fpsCounter.enabled = !fpsCounter.enabled;
  if (fpsCounter.enabled) {
    fpsCounter.frameCount = 0;
    fpsCounter.lastTime = performance.now();
  }
  console.log(`FPS counter ${fpsCounter.enabled ? "enabled" : "disabled"}`);
  return fpsCounter.enabled;
}

export function getFPS(fpsCounter: FPSCounter): number {
  return fpsCounter.fps;
}

export function getAverageFPS(
  fpsCounter: FPSCounter,
  samples: number[] = []
): number {
  if (samples.length === 0) return fpsCounter.fps;
  const sum = samples.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / samples.length);
}
