import * as RAPIER from "@dimforge/rapier3d-compat";
import {
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Scene,
} from "@babylonjs/core";

export interface Pin {
  x: number;
  y: number;
}

export interface PinGrid {
  pins: Pin[];
  s: number;
  v: number;
  topY: number;
  binsY: number;
  bottomWidth: number;
  rows: number;
}

export interface PinBodies {
  pinBodies: RAPIER.RigidBody[];
  pinMeshes: any[];
  backBoard: any;
}

export function generateTrianglePins(params?: {
  rows?: number;
  s?: number;
  topY?: number;
}): PinGrid {
  const R = params?.rows ?? 12;
  const s = params?.s ?? 0.8;
  const v = (s * Math.sqrt(3)) / 2;
  const topY = params?.topY ?? 10;

  const pins: Pin[] = [];

  for (let r = 0; r < R; r++) {
    const y = topY - r * v;
    const offset = (r % 2 === 0 ? 0 : 0.5) * s;
    for (let i = 0; i <= r; i++) {
      const x = offset + (i - r / 2) * s;
      pins.push({ x, y });
    }
  }

  const bottomRowCount = R;
  const bottomWidth = (bottomRowCount - 1) * s;
  const binsY = topY - (R - 1) * v - v;
  return { pins, s, v, topY, binsY, bottomWidth, rows: R };
}

export function createPinBodies(
  world: RAPIER.World,
  scene: Scene,
  pinGrid: PinGrid
): PinBodies {
  const pinBodies: RAPIER.RigidBody[] = [];
  const pinMeshes: any[] = [];

  // Create back board first
  const boardWidth = pinGrid.bottomWidth + 1.2;
  const boardHeight = pinGrid.topY - pinGrid.binsY + 2;
  const boardDepth = 0.1;

  // Create back board material
  const boardMaterial = new StandardMaterial("boardMaterial", scene);
  boardMaterial.diffuseColor = new Color3(0.9, 0.9, 0.7); // Light wood color
  boardMaterial.specularColor = new Color3(0.1, 0.1, 0.1);

  // Create back board mesh
  const backBoard = MeshBuilder.CreateBox(
    "backBoard",
    {
      width: boardWidth,
      height: boardHeight,
      depth: boardDepth,
    },
    scene
  );
  backBoard.position = new Vector3(
    0,
    pinGrid.topY - boardHeight / 2,
    -boardDepth / 2
  );
  backBoard.material = boardMaterial;

  // Create back board physics body
  const boardDesc = RAPIER.RigidBodyDesc.fixed();
  boardDesc.setTranslation(0, pinGrid.topY - boardHeight / 2, -boardDepth / 2);

  const boardColliderDesc = RAPIER.ColliderDesc.cuboid(
    boardWidth / 2,
    boardHeight / 2,
    boardDepth / 2
  );
  const boardBody = world.createRigidBody(boardDesc);
  world.createCollider(boardColliderDesc, boardBody);

  // Create material for pins (cylindrical)
  const pinMaterial = new StandardMaterial("pinMaterial", scene);
  pinMaterial.diffuseColor = new Color3(0.7, 0.7, 0.7); // Silver color
  pinMaterial.specularColor = new Color3(0.3, 0.3, 0.3);

  const pinRadius = 0.1;
  const pinHeight = 0.3; // Height of cylindrical pins

  for (const pin of pinGrid.pins) {
    // Create Rapier physics body for pin (vertical cylinder)
    const pinDesc = RAPIER.RigidBodyDesc.fixed();
    pinDesc.setTranslation(pin.x, pin.y, pinHeight / 2); // Position at half height

    const pinColliderDesc = RAPIER.ColliderDesc.cylinder(
      pinHeight / 2,
      pinRadius
    );
    pinColliderDesc.setRestitution(0.2);
    pinColliderDesc.setFriction(0.6);

    const pinBody = world.createRigidBody(pinDesc);
    world.createCollider(pinColliderDesc, pinBody);
    pinBodies.push(pinBody);

    // Create BabylonJS mesh for pin (cylinder perpendicular to back board)
    const pinMesh = MeshBuilder.CreateCylinder(
      `pin_${pin.x}_${pin.y}`,
      {
        height: pinHeight,
        diameter: pinRadius * 2,
        tessellation: 8, // Low poly for performance
      },
      scene
    );
    // Rotate cylinder to be perpendicular to the back board (along Z-axis)
    pinMesh.rotation.x = Math.PI / 2; // Rotate 90 degrees around X-axis
    pinMesh.position = new Vector3(pin.x, pin.y, pinHeight / 2); // Position at half height
    pinMesh.material = pinMaterial;
    pinMeshes.push(pinMesh);
  }

  console.log(`Created ${pinBodies.length} pins in ${pinGrid.rows} rows`);
  console.log(
    `Pin grid dimensions: ${pinGrid.bottomWidth} wide, ${
      pinGrid.topY - pinGrid.binsY
    } tall`
  );
  console.log(
    `Back board created: ${boardWidth} x ${boardHeight} x ${boardDepth}`
  );

  return {
    pinBodies,
    pinMeshes,
    backBoard,
  };
}
