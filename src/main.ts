import "./styles.css";
import { createScene } from "./scene/createScene";
import { initializeRapierWorld } from "./physics/rapierWorld";
import { createStaticBodies } from "./physics/staticBodies";
import { generateRectanglePins, createPinBodies } from "./entities/PegGrid";
import { generateBins, createBinBodies } from "./entities/ScoringBins";
import { createBallPool } from "./entities/Ball";
import { createGameLoop } from "./systems/GameLoop";
import { createInputHandler } from "./ui/InputHandler";

// Main entry point for the Plinko game
console.log("Plinko Game starting...");

// Initialize the game
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
if (!canvas) {
  throw new Error("Canvas element not found!");
}

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
  const ballPool = createBallPool(physicsWorld.world, gameScene.scene, 50); // Max 50 balls

  // Start the game loop with physics synchronization
  createGameLoop(
    physicsWorld.world,
    gameScene.scene,
    gameScene.engine,
    physicsWorld.timestep,
    ballPool
  );

  // Setup input handler for spawning balls on click/touch
  const inputHandler = createInputHandler(
    canvas,
    gameScene.scene,
    ballPool,
    pinGrid.topY + 2.5, // Spawn Y position
    -2, // Spawn Z position
    gameScene.camera // Pass camera for improved 3D picking
  );

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
  console.log(`Ball pool created: max ${ballPool.maxBalls} balls`);
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
