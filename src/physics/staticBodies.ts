import * as RAPIER from '@dimforge/rapier3d-compat'
import { MeshBuilder, StandardMaterial, Color3, Vector3 } from '@babylonjs/core'
import { Scene } from '@babylonjs/core'

export interface StaticBodies {
  leftWall: RAPIER.RigidBody
  rightWall: RAPIER.RigidBody
  ground: RAPIER.RigidBody
  leftWallMesh: any
  rightWallMesh: any
  groundMesh: any
}

export function createStaticBodies(
  world: RAPIER.World,
  scene: Scene,
  boardWidth: number,
  boardHeight: number,
  wallMargin: number = 0.6
): StaticBodies {
  const wallThickness = 0.2
  const wallHeight = boardHeight + 2
  const groundY = -2.0

  // Create left wall
  const leftWallDesc = RAPIER.RigidBodyDesc.fixed()
  const leftWallPos = new RAPIER.Vector3(
    -(boardWidth / 2 + wallMargin),
    0,
    0
  )
  leftWallDesc.setTranslation(leftWallPos.x, leftWallPos.y, leftWallPos.z)
  
  const leftWallColliderDesc = RAPIER.ColliderDesc.cuboid(
    wallThickness / 2,
    wallHeight / 2,
    1
  )
  const leftWall = world.createRigidBody(leftWallDesc)
  world.createCollider(leftWallColliderDesc, leftWall)

  // Create right wall
  const rightWallDesc = RAPIER.RigidBodyDesc.fixed()
  const rightWallPos = new RAPIER.Vector3(
    boardWidth / 2 + wallMargin,
    0,
    0
  )
  rightWallDesc.setTranslation(rightWallPos.x, rightWallPos.y, rightWallPos.z)
  
  const rightWallColliderDesc = RAPIER.ColliderDesc.cuboid(
    wallThickness / 2,
    wallHeight / 2,
    1
  )
  const rightWall = world.createRigidBody(rightWallDesc)
  world.createCollider(rightWallColliderDesc, rightWall)

  // Create ground
  const groundDesc = RAPIER.RigidBodyDesc.fixed()
  groundDesc.setTranslation(0, groundY, 0)
  
  const groundColliderDesc = RAPIER.ColliderDesc.cuboid(
    (boardWidth + wallMargin * 2) / 2,
    0.5,
    2
  )
  const ground = world.createRigidBody(groundDesc)
  world.createCollider(groundColliderDesc, ground)

  // Create visual meshes for walls
  const wallMaterial = new StandardMaterial('wallMaterial', scene)
  wallMaterial.diffuseColor = new Color3(0.3, 0.3, 0.3)
  wallMaterial.specularColor = new Color3(0.1, 0.1, 0.1)

  const leftWallMesh = MeshBuilder.CreateBox(
    'leftWall',
    {
      width: wallThickness,
      height: wallHeight,
      depth: 2
    },
    scene
  )
  leftWallMesh.position = new Vector3(leftWallPos.x, leftWallPos.y, leftWallPos.z)
  leftWallMesh.material = wallMaterial

  const rightWallMesh = MeshBuilder.CreateBox(
    'rightWall',
    {
      width: wallThickness,
      height: wallHeight,
      depth: 2
    },
    scene
  )
  rightWallMesh.position = new Vector3(rightWallPos.x, rightWallPos.y, rightWallPos.z)
  rightWallMesh.material = wallMaterial

  // Create ground mesh
  const groundMaterial = new StandardMaterial('groundMaterial', scene)
  groundMaterial.diffuseColor = new Color3(0.2, 0.2, 0.2)

  const groundMesh = MeshBuilder.CreateBox(
    'ground',
    {
      width: boardWidth + wallMargin * 2,
      height: 1,
      depth: 4
    },
    scene
  )
  groundMesh.position = new Vector3(0, groundY, 0)
  groundMesh.material = groundMaterial

  return {
    leftWall,
    rightWall,
    ground,
    leftWallMesh,
    rightWallMesh,
    groundMesh
  }
}
