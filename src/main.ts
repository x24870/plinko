import "./styles.css";
import { createScene } from "./scene/createScene";
import { initializeRapierWorld } from "./physics/rapierWorld";
import { createStaticBodies } from "./physics/staticBodies";
import { generateTrianglePins, createPinBodies } from "./entities/PegGrid";

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

  console.log("Static walls and ground created successfully");
  console.log("Pin grid created successfully");
  console.log(`Board dimensions: ${boardWidth} x ${boardHeight}`);
  console.log(`Total pins created: ${pinBodies.pinBodies.length}`);
  console.log(`Back board created: ${pinBodies.backBoard ? "yes" : "no"}`);
  console.log(
    `Static bodies: ${staticBodies.leftWall ? "walls" : "none"}, ${
      staticBodies.ground ? "ground" : "none"
    }`
  );
});

// TODO: Initialize remaining components
// - Game loop
// - UI controls
