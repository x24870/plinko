import { BallPool, resetBallPool } from "../entities/Ball";
import { ScoringSystem, resetScore } from "./ScoringSystem";
import {
  UIManager,
  resetUI,
  updateScoreDisplay,
  updateBallPoolDisplay,
} from "../ui/UIManager";
import { AudioManager, playResetSound } from "../audio/AudioManager";

export interface GameManager {
  ballPool: BallPool;
  scoringSystem: ScoringSystem;
  ui: UIManager;
  isResetting: boolean;
  audioManager?: AudioManager;
}

export function createGameManager(
  ballPool: BallPool,
  scoringSystem: ScoringSystem,
  ui: UIManager,
  audioManager?: AudioManager
): GameManager {
  return {
    ballPool,
    scoringSystem,
    ui,
    isResetting: false,
    audioManager,
  };
}

export function resetGame(gameManager: GameManager): void {
  if (gameManager.isResetting) {
    console.log("Reset already in progress, ignoring...");
    return;
  }

  console.log("=== RESETTING GAME ===");
  gameManager.isResetting = true;

  // Play reset sound
  if (gameManager.audioManager) {
    playResetSound(gameManager.audioManager);
  }

  // Reset ball pool (recycle all active balls)
  resetBallPool(gameManager.ballPool);

  // Reset scoring system
  resetScore(gameManager.scoringSystem);

  // Reset UI
  resetUI(gameManager.ui);

  // Update displays
  updateScoreDisplay(gameManager.ui, gameManager.scoringSystem.gameScore);
  updateBallPoolDisplay(gameManager.ui, gameManager.ballPool);

  gameManager.isResetting = false;
  console.log("=== GAME RESET COMPLETE ===");
}
