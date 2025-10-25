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
  maxBalls: number = 50
): BallPool {
  const balls: Ball[] = [];

  // Pre-create all rigid bodies to avoid memory leaks
  for (let i = 0; i < maxBalls; i++) {
    const ballId = `ball_${i}`;
    const ball = createBall(world, scene, new Vector3(0, -100, 0), ballId);
    ball.isActive = false; // Start inactive
    balls.push(ball);
  }

  return {
    balls,
    activeBalls: [],
    inactiveBalls: [...balls], // All start inactive
    maxBalls,
  };
}

export function spawnBall(
  ballPool: BallPool,
  spawnPosition: Vector3
): Ball | null {
  // Check if we have any inactive balls available
  if (ballPool.inactiveBalls.length === 0) {
    console.log("No inactive balls available, recycling oldest ball");
    // Recycle the oldest ball
    const oldestBall = ballPool.activeBalls.shift();
    if (oldestBall) {
      recycleBall(oldestBall);
      ballPool.inactiveBalls.push(oldestBall);
    }
  }

  // Get an inactive ball and reactivate it
  const ball = ballPool.inactiveBalls.pop();
  if (!ball) {
    console.error("No balls available in pool");
    return null;
  }

  // Reset ball position and reactivate
  ball.body.setTranslation(spawnPosition, true);
  ball.mesh.position = spawnPosition;
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

  // Move ball far away (invisible) - rigid body stays in world for reuse
  ball.body.setTranslation(new RAPIER.Vector3(0, -100, 0), true);
  ball.mesh.position = new Vector3(0, -100, 0);

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
