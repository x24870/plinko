import { Scene, Camera } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core";
import { BallPool, spawnBall } from "../entities/Ball";
import { ScoringSystem, recordBallDropped } from "../systems/ScoringSystem";

export interface InputHandler {
  enabled: boolean;
  lastSpawnTime: number;
  cooldownMs: number;
  scoringSystem?: ScoringSystem;
}

export function createInputHandler(
  canvas: HTMLCanvasElement,
  _scene: Scene,
  ballPool: BallPool,
  spawnY: number,
  spawnZ: number = 0.3,
  camera?: Camera,
  scoringSystem?: ScoringSystem
): InputHandler {
  const inputHandler: InputHandler = {
    enabled: true,
    lastSpawnTime: 0,
    cooldownMs: 300, // 0.3 second cooldown between spawns
    scoringSystem,
  };

  // Handle pointer/touch events
  const handlePointerDown = (event: PointerEvent) => {
    if (!inputHandler.enabled) return;

    const currentTime = Date.now();
    const timeSinceLastSpawn = currentTime - inputHandler.lastSpawnTime;

    // Check cooldown
    if (timeSinceLastSpawn < inputHandler.cooldownMs) {
      console.log(
        `Cooldown: ${inputHandler.cooldownMs - timeSinceLastSpawn}ms remaining`
      );
      return;
    }

    // Method 1: Simple 2D Screen-to-World (current approach)
    let spawnPosition: Vector3;

    if (camera) {
      // Method 2: Improved 3D Picking with camera
      spawnPosition = screenToWorldPosition(
        event,
        canvas,
        camera,
        spawnY,
        spawnZ
      );
    } else {
      // Fallback to simple 2D method
      spawnPosition = screenToWorldPosition2D(event, canvas, spawnY, spawnZ);
    }
    const ball = spawnBall(ballPool, spawnPosition);

    if (ball) {
      inputHandler.lastSpawnTime = currentTime;

      // Record ball dropped in scoring system
      if (inputHandler.scoringSystem) {
        recordBallDropped(inputHandler.scoringSystem);
      }

      console.log(
        `Ball spawned at x: ${spawnPosition.x.toFixed(2)}, y: ${
          spawnPosition.y
        }`
      );
    }
  };

  // Add event listeners
  canvas.addEventListener("pointerdown", handlePointerDown);

  console.log("Input handler initialized - click/tap to drop balls!");

  return inputHandler;
}

export function setInputEnabled(handler: InputHandler, enabled: boolean): void {
  handler.enabled = enabled;
  console.log(`Input ${enabled ? "enabled" : "disabled"}`);
}

export function setCooldown(handler: InputHandler, cooldownMs: number): void {
  handler.cooldownMs = cooldownMs;
  console.log(`Spawn cooldown set to ${cooldownMs}ms`);
}

// Method 1: Simple 2D Screen-to-World Picking (current approach)
function screenToWorldPosition2D(
  event: PointerEvent,
  canvas: HTMLCanvasElement,
  spawnY: number,
  spawnZ: number
): Vector3 {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const canvasWidth = rect.width;

  // Convert to world space X coordinate (-4 to 4 range, adjust as needed)
  const normalizedX = (x / canvasWidth) * 2 - 1; // -1 to 1
  const worldX = normalizedX * 4; // Scale to world coordinates

  return new Vector3(worldX, spawnY, spawnZ);
}

// Method 2: Improved 3D Picking with Camera (more accurate)
function screenToWorldPosition(
  event: PointerEvent,
  canvas: HTMLCanvasElement,
  camera: Camera,
  spawnY: number,
  spawnZ: number
): Vector3 {
  // For now, use the simple 2D method but with camera-aware scaling
  // This is still more accurate than pure 2D because it considers camera position
  const rect = canvas.getBoundingClientRect();
  const screenX = event.clientX - rect.left;

  // Convert to normalized coordinates
  const normalizedX = (screenX / rect.width) * 2 - 1;

  // Scale based on camera's view distance and field of view
  // For ArcRotateCamera, we can estimate the world width based on camera distance
  const cameraDistance = camera.position.length();
  const worldWidth = cameraDistance * 0.8; // Adjust this multiplier as needed

  var worldX = normalizedX * worldWidth;
  // correct the worldX to canvas coordinate
  worldX *= -1;

  return new Vector3(worldX, spawnY, spawnZ);
}
