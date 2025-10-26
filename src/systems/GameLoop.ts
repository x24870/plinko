import * as RAPIER from "@dimforge/rapier3d-compat";
import { Scene, Engine, Quaternion } from "@babylonjs/core";
import {
  Ball,
  BallPool,
  recycleBall,
  checkBallLanded,
  getBallScore,
} from "../entities/Ball";
import { ScoringSystem, recordBallLanded } from "./ScoringSystem";
import { Bin } from "../entities/ScoringBins";

export interface GameLoop {
  isRunning: boolean;
  lastTime: number;
  ballPool?: BallPool;
  scoringSystem?: ScoringSystem;
  bins?: Bin[];
  binFloorY?: number;
}

export function createGameLoop(
  world: RAPIER.World,
  _scene: Scene,
  _engine: Engine,
  _timestep: number,
  ballPool: BallPool,
  scoringSystem?: ScoringSystem,
  bins?: Bin[],
  binFloorY?: number
): GameLoop {
  const gameLoop: GameLoop = {
    isRunning: false,
    lastTime: 0,
    ballPool,
    scoringSystem,
    bins,
    binFloorY,
  };

  // Create event queue to handle collisions
  const eventQueue = new RAPIER.EventQueue(true);

  // Physics and render loop
  const update = (currentTime: number) => {
    if (!gameLoop.isRunning) return;

    gameLoop.lastTime = currentTime;

    // Step physics simulation with event queue
    world.step(eventQueue);

    // Drain collision events from the queue
    eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      // Only process collision start events
      if (started && gameLoop.ballPool) {
        // Find if any of the colliders belongs to a ball
        for (const ball of gameLoop.ballPool.activeBalls) {
          const ballCollider = ball.body.collider(0);

          if (
            ballCollider &&
            (ballCollider.handle === handle1 || ballCollider.handle === handle2)
          ) {
            // Apply random horizontal impulse when ball collides with pin
            const randomForceX = (Math.random() - 0.5) * 0.006; // -0.3 to 0.3
            const impulse = { x: randomForceX, y: 0, z: 0 };
            ball.body.applyImpulse(impulse, true);
            break; // Found the ball, no need to continue
          }
        }
      }
    });

    // Sync all active balls with their meshes and check for scoring
    if (gameLoop.ballPool) {
      const ballsToRecycle: Ball[] = [];

      for (const ball of gameLoop.ballPool.activeBalls) {
        syncBallWithMesh(ball);

        // Check if ball has landed in a bin
        if (
          gameLoop.binFloorY !== undefined &&
          checkBallLanded(ball, gameLoop.binFloorY)
        ) {
          // Calculate score
          if (gameLoop.bins && gameLoop.scoringSystem) {
            const score = getBallScore(ball, gameLoop.bins);
            const position = ball.body.translation();

            // Find which bin index
            let binIndex = -1;
            for (let i = 0; i < gameLoop.bins.length; i++) {
              const bin = gameLoop.bins[i];
              if (bin && position.x >= bin.x0 && position.x < bin.x1) {
                binIndex = i;
                break;
              }
            }

            // Record the score
            recordBallLanded(gameLoop.scoringSystem, ball, score, binIndex);
          }

          // Mark ball for recycling
          ballsToRecycle.push(ball);
        }
      }

      // Recycle balls that have landed
      for (const ball of ballsToRecycle) {
        const index = gameLoop.ballPool.activeBalls.indexOf(ball);
        if (index > -1) {
          gameLoop.ballPool.activeBalls.splice(index, 1);
        }
        recycleBall(ball);
        gameLoop.ballPool.inactiveBalls.push(ball);
      }
    }

    // Continue the loop
    requestAnimationFrame(update);
  };

  // Start the game loop
  gameLoop.isRunning = true;
  gameLoop.lastTime = performance.now();
  requestAnimationFrame(update);

  console.log("Game loop started with physics synchronization");
  return gameLoop;
}

export function syncPhysicsWithMeshes(scene: Scene): void {
  // Find all ball meshes and sync with their physics bodies
  const ballMeshes = scene.meshes.filter(
    (mesh) => mesh.name.startsWith("ball_") && mesh.metadata?.ballBody
  );

  for (const mesh of ballMeshes) {
    const ballBody = mesh.metadata.ballBody as RAPIER.RigidBody;
    if (ballBody && ballBody.isDynamic()) {
      const position = ballBody.translation();
      const rotation = ballBody.rotation();

      // Update mesh position
      mesh.position.x = position.x;
      mesh.position.y = position.y;
      mesh.position.z = position.z;

      // Update mesh rotation
      mesh.rotationQuaternion = mesh.rotationQuaternion || new Quaternion();
      mesh.rotationQuaternion.x = rotation.x;
      mesh.rotationQuaternion.y = rotation.y;
      mesh.rotationQuaternion.z = rotation.z;
      mesh.rotationQuaternion.w = rotation.w;
    }
  }
}

export function syncBallWithMesh(ball: Ball): void {
  if (!ball.isActive) return;

  const position = ball.body.translation();
  const rotation = ball.body.rotation();

  // Update mesh position
  ball.mesh.position.x = position.x;
  ball.mesh.position.y = position.y;
  ball.mesh.position.z = position.z;

  // Update mesh rotation
  ball.mesh.rotationQuaternion =
    ball.mesh.rotationQuaternion || new Quaternion();
  ball.mesh.rotationQuaternion.x = rotation.x;
  ball.mesh.rotationQuaternion.y = rotation.y;
  ball.mesh.rotationQuaternion.z = rotation.z;
  ball.mesh.rotationQuaternion.w = rotation.w;
}
