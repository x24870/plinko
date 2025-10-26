import { GameScore } from "../systems/ScoringSystem";
import { BallPool, getBallPoolStats } from "../entities/Ball";

export interface UIElements {
  totalScore: HTMLElement;
  ballsCount: HTMLElement;
  activeBalls: HTMLElement;
  instructions: HTMLElement;
  scoreNotification: HTMLElement;
  notificationScore: HTMLElement;
  resetBtn: HTMLButtonElement;
  fpsCounter: HTMLElement;
  fpsValue: HTMLElement;
}

export interface UIManager {
  elements: UIElements;
  notificationTimeout?: number;
}

export function createUIManager(): UIManager {
  const elements: UIElements = {
    totalScore: document.getElementById("total-score")!,
    ballsCount: document.getElementById("balls-count")!,
    activeBalls: document.getElementById("active-balls")!,
    instructions: document.getElementById("instructions")!,
    scoreNotification: document.getElementById("score-notification")!,
    notificationScore: document.getElementById("notification-score")!,
    resetBtn: document.getElementById("reset-btn") as HTMLButtonElement,
    fpsCounter: document.getElementById("fps-counter")!,
    fpsValue: document.getElementById("fps")!,
  };

  // Validate all elements exist
  for (const [key, element] of Object.entries(elements)) {
    if (!element) {
      console.error(`UI element not found: ${key}`);
    }
  }

  console.log("UI Manager initialized");

  return {
    elements,
  };
}

export function updateScoreDisplay(ui: UIManager, score: GameScore): void {
  ui.elements.totalScore.textContent = score.totalScore.toString();
  ui.elements.ballsCount.textContent = `${score.ballsLanded}/${score.ballsDropped}`;
}

export function updateBallPoolDisplay(ui: UIManager, ballPool: BallPool): void {
  const stats = getBallPoolStats(ballPool);
  ui.elements.activeBalls.textContent = `${stats.active}/${stats.maxConcurrent}`;
}

export function showScoreNotification(
  ui: UIManager,
  score: number,
  duration: number = 1500
): void {
  // Clear existing timeout
  if (ui.notificationTimeout) {
    clearTimeout(ui.notificationTimeout);
  }

  // Update score text
  ui.elements.notificationScore.textContent = score.toString();

  // Show notification
  ui.elements.scoreNotification.classList.remove("hidden");
  ui.elements.scoreNotification.classList.add("show");

  // Hide after duration
  ui.notificationTimeout = window.setTimeout(() => {
    ui.elements.scoreNotification.classList.remove("show");
    ui.elements.scoreNotification.classList.add("hidden");
  }, duration);
}

export function hideInstructions(ui: UIManager): void {
  ui.elements.instructions.classList.add("hidden");
}

export function showInstructions(ui: UIManager): void {
  ui.elements.instructions.classList.remove("hidden");
}

export function updateFPS(ui: UIManager, fps: number): void {
  ui.elements.fpsValue.textContent = Math.round(fps).toString();
}

export function showFPSCounter(ui: UIManager): void {
  ui.elements.fpsCounter.classList.remove("hidden");
}

export function hideFPSCounter(ui: UIManager): void {
  ui.elements.fpsCounter.classList.add("hidden");
}

export function setResetButtonEnabled(ui: UIManager, enabled: boolean): void {
  ui.elements.resetBtn.disabled = !enabled;
}

export function onResetButtonClick(ui: UIManager, callback: () => void): void {
  ui.elements.resetBtn.addEventListener("click", callback);
}

export function resetUI(ui: UIManager): void {
  // Reset all displays to initial state
  ui.elements.totalScore.textContent = "0";
  ui.elements.ballsCount.textContent = "0/0";
  ui.elements.activeBalls.textContent = "0/10";

  // Hide score notification if visible
  ui.elements.scoreNotification.classList.remove("show");
  ui.elements.scoreNotification.classList.add("hidden");

  // Show instructions again
  showInstructions(ui);

  console.log("UI reset to initial state");
}
