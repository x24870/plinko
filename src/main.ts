import "./styles.css";
import { createScene } from "./scene/createScene";
import { initializeRapierWorld } from "./physics/rapierWorld";
import { createStaticBodies } from "./physics/staticBodies";

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

  // Create static walls and ground
  const boardWidth = 10; // Approximate width for 12-row triangular board
  const boardHeight = 8; // Approximate height for 12-row triangular board

  const staticBodies = createStaticBodies(
    physicsWorld.world,
    gameScene.scene,
    boardWidth,
    boardHeight
  );

  console.log("Static walls and ground created successfully");
});

// TODO: Initialize remaining components
// - Game loop
// - UI controls
