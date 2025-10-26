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
} from "./ui/UIManager";
import { createGameManager, resetGame } from "./systems/GameManager";

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
    boardHeight
  );

  // Create pin bodies and meshes
  const pinBodies = createPinBodies(
    physicsWorld.world,
    gameScene.scene,
    pinGrid
  );

  // Generate bins and scoring zones
  const binsInfo = generateBins({
    rows: pinGrid.rows,
    s: pinGrid.s,
    topY: pinGrid.topY,
    v: pinGrid.v,
  });

  // Create bin bodies and dividers
  const binBodies = createBinBodies(
    physicsWorld.world,
    gameScene.scene,
    binsInfo
  );

  // Create ball pool for managing balls (pre-creates all rigid bodies)
  const ballPool = createBallPool(
    physicsWorld.world,
    gameScene.scene,
    50, // Max total balls in pool
    10 // Max concurrent active balls
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

  // Start the game loop with physics synchronization and scoring
  createGameLoop(
    physicsWorld.world,
    gameScene.scene,
    gameScene.engine,
    physicsWorld.timestep,
    ballPool,
    scoringSystem,
    binsInfo.bins,
    (binsInfo.bins[0]?.y ?? 0) - 0.5 // Bin floor Y (slightly below bin Y position)
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
