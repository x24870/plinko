import "./styles.css";
import { createScene } from "./scene/createScene";
import { initializeRapierWorld } from "./physics/rapierWorld";
import { createStaticBodies } from "./physics/staticBodies";
import { generateRectanglePins, createPinBodies } from "./entities/PegGrid";
import { generateBins, createBinBodies } from "./entities/ScoringBins";
import { createBallPool } from "./entities/Ball";
import { createGameLoop } from "./systems/GameLoop";
import { createInputHandler } from "./ui/InputHandler";
import { createScoringSystem } from "./systems/ScoringSystem";
import {
  createUIManager,
  updateScoreDisplay,
  updateBallPoolDisplay,
  showScoreNotification,
  hideInstructions,
  onResetButtonClick,
  updateFPS,
  showFPSCounter,
  hideFPSCounter,
} from "./ui/UIManager";
import { createGameManager, resetGame } from "./systems/GameManager";
import { createFPSCounter, toggleFPSCounter } from "./systems/FPSCounter";
import { createMaterialManager } from "./visual/MaterialManager";

// Main entry point for the Plinko game
console.log("Plinko Game starting...");

// Initialize the game
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
if (!canvas) {
  throw new Error("Canvas element not found!");
}

// Create UI Manager
const ui = createUIManager();

// Create BabylonJS scene
const gameScene = createScene(canvas);
console.log("BabylonJS scene created successfully");

// Create Material Manager for enhanced visuals
const materialManager = createMaterialManager(gameScene.scene);

// Initialize physics world and create static bodies
initializeRapierWorld().then((physicsWorld) => {
  console.log("Physics world initialized successfully");
  console.log("Gravity:", physicsWorld.gravity);
  console.log("Timestep:", physicsWorld.timestep);

  // Generate rectangular pin grid
  const pinGrid = generateRectanglePins({
    rows: 12, // 12 rows
    cols: 10, // 10 columns
    spacingX: 0.8, // horizontal spacing
    spacingY: 0.8, // vertical spacing
    topY: 10,
  });

  // Create static walls and ground based on pin grid dimensions
  const boardWidth = pinGrid.bottomWidth + 1.2; // Add margin
  const boardHeight = pinGrid.topY - pinGrid.binsY + 2;

  const staticBodies = createStaticBodies(
    physicsWorld.world,
    gameScene.scene,
    boardWidth,
    boardHeight,
    0,
    materialManager
  );

  // Create pin bodies and meshes with enhanced materials
  const pinBodies = createPinBodies(
    physicsWorld.world,
    gameScene.scene,
    pinGrid,
    materialManager
  );

  // Generate bins and scoring zones
  const binsInfo = generateBins({
    rows: pinGrid.rows,
    s: pinGrid.s,
    topY: pinGrid.topY,
    v: pinGrid.v,
  });

  // Create bin bodies and dividers with colorful materials
  const binBodies = createBinBodies(
    physicsWorld.world,
    gameScene.scene,
    binsInfo,
    materialManager
  );

  // Create ball pool for managing balls with colorful materials
  const ballPool = createBallPool(
    physicsWorld.world,
    gameScene.scene,
    50, // Max total balls in pool
    10, // Max concurrent active balls
    materialManager
  );

  // Create scoring system with UI callbacks
  const scoringSystem = createScoringSystem(
    (score) => {
      // Update UI when score changes
      updateScoreDisplay(ui, score);
      updateBallPoolDisplay(ui, ballPool);
      console.log(
        `Score updated: ${score.totalScore} (${score.ballsLanded}/${score.ballsDropped} balls)`
      );
    },
    (event) => {
      // Show score notification when a ball lands
      showScoreNotification(ui, event.score);
      console.log(`Ball landed! Score: ${event.score}, Bin: ${event.binIndex}`);
    }
  );

  // Initialize UI display
  updateScoreDisplay(ui, scoringSystem.gameScore);
  updateBallPoolDisplay(ui, ballPool);

  // Create FPS counter with UI update callback
  const fpsCounter = createFPSCounter(500, (fps) => {
    updateFPS(ui, fps);
  });

  // Start the game loop with physics synchronization and scoring
  createGameLoop(
    physicsWorld.world,
    gameScene.scene,
    gameScene.engine,
    physicsWorld.timestep,
    ballPool,
    scoringSystem,
    binsInfo.bins,
    (binsInfo.bins[0]?.y ?? 0) - 0.5, // Bin floor Y (slightly below bin Y position)
    fpsCounter
  );

  // Setup input handler for spawning balls on click/touch
  let firstBallDropped = false;
  const inputHandler = createInputHandler(
    canvas,
    gameScene.scene,
    ballPool,
    pinGrid.topY + 2.5, // Spawn Y position
    -2, // Spawn Z position
    gameScene.camera, // Pass camera for improved 3D picking
    scoringSystem // Pass scoring system to track dropped balls
  );

  // Hide instructions after first ball drop
  canvas.addEventListener("pointerdown", () => {
    if (!firstBallDropped) {
      firstBallDropped = true;
      hideInstructions(ui);
    }
    updateBallPoolDisplay(ui, ballPool);
  });

  // Create game manager for coordinated resets
  const gameManager = createGameManager(ballPool, scoringSystem, ui);

  // Setup reset button
  onResetButtonClick(ui, () => {
    resetGame(gameManager);
    // Reset first ball dropped flag
    firstBallDropped = false;
  });

  // Setup keyboard shortcuts
  window.addEventListener("keydown", (event) => {
    // Toggle FPS counter with 'F' key
    if (event.key === "f" || event.key === "F") {
      const isEnabled = toggleFPSCounter(fpsCounter);
      if (isEnabled) {
        showFPSCounter(ui);
      } else {
        hideFPSCounter(ui);
      }
    }
    // Reset game with 'R' key
    if (event.key === "r" || event.key === "R") {
      resetGame(gameManager);
      firstBallDropped = false;
    }
  });

  // FPS counter is hidden by default, press 'F' to toggle
  // Uncomment the lines below to enable FPS counter by default:
  // enableFPSCounter(fpsCounter);
  // showFPSCounter(ui);

  console.log("Keyboard shortcuts:");
  console.log("  F - Toggle FPS counter");
  console.log("  R - Reset game");

  console.log("Static walls and ground created successfully");
  console.log("Pin grid created successfully");
  console.log("Scoring bins created successfully");
  console.log("Ball entity system created successfully");
  console.log("Game loop with physics synchronization started");
  console.log(`Board dimensions: ${boardWidth} x ${boardHeight}`);
  console.log(`Total pins created: ${pinBodies.pinBodies.length}`);
  console.log(`Back board created: ${pinBodies.backBoard ? "yes" : "no"}`);
  console.log(
    `Total bins: ${binsInfo.bins.length}, Dividers: ${binBodies.binDividers.length}`
  );
  console.log(
    `Ball pool: ${ballPool.maxBalls} total, max ${ballPool.maxConcurrentBalls} concurrent`
  );
  console.log(`Input handler ready: cooldown ${inputHandler.cooldownMs}ms`);
  console.log(
    `Static bodies: ${staticBodies.leftWall ? "walls" : "none"}, ${
      staticBodies.ground ? "ground" : "none"
    }`
  );
});

// TODO: Initialize remaining components
// - Game loop
// - UI controls
