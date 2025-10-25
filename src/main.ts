import "./styles.css";
import { createScene } from "./scene/createScene";
import { initializeRapierWorld } from "./physics/rapierWorld";
import { createStaticBodies } from "./physics/staticBodies";
import { generateTrianglePins, createPinBodies } from "./entities/PegGrid";
import { generateBins, createBinBodies } from "./entities/ScoringBins";
import { createBallPool, spawnBall } from "./entities/Ball";
import { createGameLoop } from "./systems/GameLoop";
import { Vector3 } from "@babylonjs/core";

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

  // Generate pin grid using PRD algorithm
  const pinGrid = generateTrianglePins({
    rows: 12,
    s: 0.8,
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

  // Test: Spawn a ball at the top of the board
  const testBallPosition = new Vector3(0, pinGrid.topY + 2, -2);
  const testBall = spawnBall(ballPool, testBallPosition);

  // Start the game loop with physics synchronization AFTER spawning balls
  createGameLoop(
    physicsWorld.world,
    gameScene.scene,
    gameScene.engine,
    physicsWorld.timestep,
    ballPool
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
  console.log(`Test ball spawned: ${testBall ? testBall.id : "failed"}`);
  console.log(
    `Static bodies: ${staticBodies.leftWall ? "walls" : "none"}, ${
      staticBodies.ground ? "ground" : "none"
    }`
  );
});

// TODO: Initialize remaining components
// - Game loop
// - UI controls
