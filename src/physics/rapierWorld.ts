import * as RAPIER from "@dimforge/rapier3d-compat";

export interface PhysicsWorld {
  world: RAPIER.World;
  gravity: RAPIER.Vector3;
  timestep: number;
}

let rapierInitialized = false;

export async function initializeRapierWorld(): Promise<PhysicsWorld> {
  // Initialize Rapier if not already done
  if (!rapierInitialized) {
    await RAPIER.init();
    rapierInitialized = true;
    console.log("Rapier3D initialized successfully");
  }

  // Create physics world with gravity
  const gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
  const world = new RAPIER.World(gravity);

  // Set fixed timestep for consistent physics
  const timestep = 1.0 / 60.0;

  console.log("Physics world created with gravity:", gravity);

  return {
    world,
    gravity,
    timestep,
  };
}

export function stepPhysics(world: RAPIER.World, timestep: number): void {
  world.timestep = timestep;
  world.step();
}
