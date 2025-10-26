import * as RAPIER from "@dimforge/rapier3d-compat";
import {
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Scene,
  Mesh,
} from "@babylonjs/core";

export interface Ball {
  body: RAPIER.RigidBody;
  mesh: Mesh;
  id: string;
  isActive: boolean;
}

export interface BallPool {
  balls: Ball[];
  activeBalls: Ball[];
  inactiveBalls: Ball[];
  maxBalls: number;
  maxConcurrentBalls: number; // Maximum number of balls that can be active at once
}

export function createBall(
  world: RAPIER.World,
  scene: Scene,
  position: Vector3,
  ballId: string
): Ball {
  // Create ball physics body
  const ballDesc = RAPIER.RigidBodyDesc.dynamic();
  ballDesc.setTranslation(position.x, position.y, position.z);

  // Enable continuous collision detection to prevent tunneling
  ballDesc.setCcdEnabled(true);

  const ballColliderDesc = RAPIER.ColliderDesc.ball(0.2); // Radius 0.2
  ballColliderDesc.setRestitution(0.4); // Bouncy
  ballColliderDesc.setFriction(0.3); // Some friction
  ballColliderDesc.setDensity(1.0); // Standard density

  // Set active events to detect collisions
  ballColliderDesc.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

  const ballBody = world.createRigidBody(ballDesc);
  world.createCollider(ballColliderDesc, ballBody);

  // Create ball visual mesh
  const ballMaterial = new StandardMaterial(`ballMaterial_${ballId}`, scene);
  ballMaterial.diffuseColor = new Color3(0.2, 0.6, 1.0); // Blue color
  ballMaterial.specularColor = new Color3(0.3, 0.3, 0.3);

  const ballMesh = MeshBuilder.CreateSphere(
    `ball_${ballId}`,
    {
      diameter: 0.4, // Diameter = 2 * radius
      segments: 12, // Medium poly for good performance
    },
    scene
  );
  ballMesh.position = position;
  ballMesh.material = ballMaterial;

  return {
    body: ballBody,
    mesh: ballMesh,
    id: ballId,
    isActive: true,
  };
}

export function createBallPool(
  world: RAPIER.World,
  scene: Scene,
  maxBalls: number = 50,
  maxConcurrentBalls: number = 10
): BallPool {
  const balls: Ball[] = [];

  // Pre-create all rigid bodies to avoid memory leaks
  for (let i = 0; i < maxBalls; i++) {
    const ballId = `ball_${i}`;
    const ball = createBall(world, scene, new Vector3(0, -100, 0), ballId);
    ball.isActive = false; // Start inactive
    balls.push(ball);
  }

  console.log(
    `Ball pool created: ${maxBalls} total balls, max ${maxConcurrentBalls} concurrent`
  );

  return {
    balls,
    activeBalls: [],
    inactiveBalls: [...balls], // All start inactive
    maxBalls,
    maxConcurrentBalls,
  };
}

export function spawnBall(
  ballPool: BallPool,
  spawnPosition: Vector3
): Ball | null {
  // Check if we've reached the concurrent ball limit
  if (ballPool.activeBalls.length >= ballPool.maxConcurrentBalls) {
    console.log(
      `Max concurrent balls reached (${ballPool.maxConcurrentBalls}), recycling oldest ball`
    );
    // Recycle the oldest ball to make room
    const oldestBall = ballPool.activeBalls.shift();
    if (oldestBall) {
      recycleBall(oldestBall);
      ballPool.inactiveBalls.push(oldestBall);
    }
  }

  // Check if we have any inactive balls available
  if (ballPool.inactiveBalls.length === 0) {
    console.warn("No inactive balls available in pool");
    // This should not happen if maxConcurrentBalls <= maxBalls
    return null;
  }

  // Get an inactive ball and reactivate it
  const ball = ballPool.inactiveBalls.pop();
  if (!ball) {
    console.error("No balls available in pool");
    return null;
  }

  // Physics state reset - use plain objects to avoid WASM allocations
  ball.body.setEnabled(true); // Re-enable physics simulation
  ball.body.setTranslation(
    { x: spawnPosition.x, y: spawnPosition.y, z: spawnPosition.z },
    true
  );
  ball.body.setLinvel({ x: 0, y: 0, z: 0 }, true); // Zero velocity
  ball.body.setAngvel({ x: 0, y: 0, z: 0 }, true); // Zero angular velocity
  ball.body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true); // Reset rotation
  ball.body.resetForces(true); // Clear any accumulated forces
  ball.body.resetTorques(true); // Clear any accumulated torques
  ball.body.wakeUp(); // Ensure not sleeping

  // Mesh state reset
  ball.mesh.position.copyFrom(spawnPosition);
  ball.mesh.rotation.set(0, 0, 0);
  ball.mesh.rotationQuaternion = null;
  ball.mesh.isVisible = true; // Make mesh visible

  ball.isActive = true;

  ballPool.activeBalls.push(ball);

  console.log(
    `Spawned ball ${ball.id}, active balls: ${ballPool.activeBalls.length}`
  );
  return ball;
}

export function recycleBall(ball: Ball): void {
  if (!ball.isActive) return;

  ball.isActive = false;

  // Physics state reset - use plain objects to avoid WASM allocations
  ball.body.setTranslation({ x: 0, y: -100, z: 0 }, true);
  ball.body.setLinvel({ x: 0, y: 0, z: 0 }, true); // Reset linear velocity
  ball.body.setAngvel({ x: 0, y: 0, z: 0 }, true); // Reset angular velocity
  ball.body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true); // Reset rotation to identity
  ball.body.resetForces(true); // Clear accumulated forces
  ball.body.resetTorques(true); // Clear accumulated torques
  ball.body.setEnabled(false); // Disable physics simulation (key performance optimization!)

  // Mesh state reset
  ball.mesh.position.set(0, -100, 0);
  ball.mesh.rotation.set(0, 0, 0);
  ball.mesh.rotationQuaternion = null;
  ball.mesh.isVisible = false; // Hide mesh (better than moving off-screen)

  console.log(`Recycled ball ${ball.id}`);
}

export function checkBallLanded(ball: Ball, binsY: number): boolean {
  if (!ball.isActive) return false;

  const position = ball.body.translation();
  return position.y < binsY;
}

export function getBallScore(
  ball: Ball,
  bins: Array<{ x0: number; x1: number; score: number }>
): number {
  if (!ball.isActive) return 0;

  const position = ball.body.translation();
  const x = position.x;

  // Find which bin the ball is in
  for (const bin of bins) {
    if (x >= bin.x0 && x < bin.x1) {
      return bin.score;
    }
  }

  return 0; // Default score if not in any bin
}

export function getActiveBallCount(ballPool: BallPool): number {
  return ballPool.activeBalls.length;
}

export function canSpawnBall(ballPool: BallPool): boolean {
  return ballPool.activeBalls.length < ballPool.maxConcurrentBalls;
}

export function getBallPoolStats(ballPool: BallPool): {
  active: number;
  inactive: number;
  total: number;
  maxConcurrent: number;
  canSpawn: boolean;
} {
  return {
    active: ballPool.activeBalls.length,
    inactive: ballPool.inactiveBalls.length,
    total: ballPool.maxBalls,
    maxConcurrent: ballPool.maxConcurrentBalls,
    canSpawn: canSpawnBall(ballPool),
  };
}

export function resetBallPool(ballPool: BallPool): void {
  console.log(
    `Resetting ball pool: ${ballPool.activeBalls.length} active balls`
  );

  // Recycle all active balls
  const activeBallsCopy = [...ballPool.activeBalls];
  for (const ball of activeBallsCopy) {
    recycleBall(ball);
  }

  // Clear active balls array and move all to inactive
  ballPool.activeBalls = [];
  ballPool.inactiveBalls = [...ballPool.balls];

  console.log("Ball pool reset complete");
}
