import * as RAPIER from "@dimforge/rapier3d-compat";
import {
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Scene,
  TransformNode,
} from "@babylonjs/core";
import { MaterialManager } from "../visual/MaterialManager";

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
  boardGroup: TransformNode;
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

// Generate rectangular pin grid with staggered rows
export function generateRectanglePins(params?: {
  rows?: number;
  cols?: number;
  spacingX?: number;
  spacingY?: number;
  topY?: number;
}): PinGrid {
  const rows = params?.rows ?? 12;
  const cols = params?.cols ?? 10;
  const spacingX = params?.spacingX ?? 0.8;
  const spacingY = params?.spacingY ?? 0.8;
  const topY = params?.topY ?? 10;

  const pins: Pin[] = [];

  // Create staggered rectangular grid
  for (let row = 0; row < rows; row++) {
    // Odd rows are offset by half spacing for staggered effect
    const offset = row % 2 === 1 ? spacingX / 2 : 0;

    for (let col = 0; col < cols; col++) {
      const x = (col - (cols - 1) / 2) * spacingX + offset; // Center + offset
      const y = topY - row * spacingY;
      pins.push({ x, y });
    }
  }

  const bottomWidth = (cols - 1) * spacingX + spacingX / 2; // Account for offset
  const binsY = topY - (rows - 1) * spacingY - spacingY;

  return {
    pins,
    s: spacingX,
    v: spacingY,
    topY,
    binsY,
    bottomWidth,
    rows,
  };
}

export function createPinBodies(
  world: RAPIER.World,
  scene: Scene,
  pinGrid: PinGrid,
  materialManager?: MaterialManager
): PinBodies {
  const pinBodies: RAPIER.RigidBody[] = [];
  const pinMeshes: any[] = [];

  // Create a parent group for the board and pins
  const boardGroup = new TransformNode("boardGroup", scene);

  // Tilt angle: 15 degrees
  const tiltAngle = -(15 * Math.PI) / 180; // Convert to radians

  // Create back board first
  const boardWidth = pinGrid.bottomWidth + 1.2;
  const boardHeight = pinGrid.topY - pinGrid.binsY + 10;
  const boardDepth = 0.1;

  // Use enhanced back board material if available
  const boardMaterial = materialManager
    ? materialManager.backBoardMaterial
    : (() => {
        const material = new StandardMaterial("boardMaterial", scene);
        material.diffuseColor = new Color3(0.9, 0.9, 0.7); // Light wood color
        material.specularColor = new Color3(0.1, 0.1, 0.1);
        return material;
      })();

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
  // Local position (before tilt)
  backBoard.position = new Vector3(
    0,
    pinGrid.topY - boardHeight / 2 + 10,
    -boardDepth / 2
  );
  backBoard.material = boardMaterial;
  backBoard.parent = boardGroup; // Parent to the group

  // Calculate rotated position for physics body
  // The backBoard position is in local space relative to boardGroup
  // After rotation, we need to calculate the world position
  const boardLocalPos = new Vector3(
    0,
    pinGrid.topY - boardHeight / 2 + 10,
    -boardDepth / 2
  );
  const boardRotatedPos = rotatePointAroundX(boardLocalPos, tiltAngle);

  // Create back board physics body with rotation
  const boardDesc = RAPIER.RigidBodyDesc.fixed();
  boardDesc.setTranslation(
    boardRotatedPos.x,
    boardRotatedPos.y,
    boardRotatedPos.z
  );

  // Apply rotation to the rigid body (using quaternion from Euler angles)
  // For rotation around X axis: quat = [sin(θ/2), 0, 0, cos(θ/2)]
  const halfAngle = tiltAngle / 2;
  const boardQuat = {
    x: Math.sin(halfAngle),
    y: 0,
    z: 0,
    w: Math.cos(halfAngle),
  };
  boardDesc.setRotation(boardQuat);

  const boardColliderDesc = RAPIER.ColliderDesc.cuboid(
    boardWidth / 2,
    boardHeight / 2,
    boardDepth / 2
  );
  const boardBody = world.createRigidBody(boardDesc);
  world.createCollider(boardColliderDesc, boardBody);

  // Use enhanced pin material if available
  const pinMaterial = materialManager
    ? materialManager.pinMaterial
    : (() => {
        const material = new StandardMaterial("pinMaterial", scene);
        material.diffuseColor = new Color3(0.7, 0.7, 0.7); // Silver color
        material.specularColor = new Color3(0.3, 0.3, 0.3);
        return material;
      })();

  const pinRadius = 0.1;
  const pinHeight = 1; // Height of cylindrical pins

  for (const pin of pinGrid.pins) {
    // Local position (before tilt)
    const pinLocalPos = new Vector3(pin.x, pin.y, pinHeight / 2);
    const pinRotatedPos = rotatePointAroundX(pinLocalPos, tiltAngle);

    // Create Rapier physics body for pin
    const pinDesc = RAPIER.RigidBodyDesc.fixed();
    pinDesc.setTranslation(pinRotatedPos.x, pinRotatedPos.y, pinRotatedPos.z);

    // Apply rotation: tilt + perpendicular to board
    const pinHalfAngle = (tiltAngle + Math.PI / 2) / 2;
    const pinQuat = {
      x: Math.sin(pinHalfAngle),
      y: 0,
      z: 0,
      w: Math.cos(pinHalfAngle),
    };
    pinDesc.setRotation(pinQuat);

    // Use capsule to avoid flat top surface
    const pinColliderDesc = RAPIER.ColliderDesc.capsule(
      pinHeight / 2 - pinRadius, // half-height of cylindrical part
      pinRadius // radius
    );
    // Adjusted physics parameters to prevent balls from getting stuck
    pinColliderDesc.setRestitution(0.5); // Higher bounce to help balls escape
    pinColliderDesc.setFriction(0.3); // Lower friction so balls slide off easily

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
    pinMesh.parent = boardGroup; // Parent to the group
    pinMeshes.push(pinMesh);
  }

  // Apply tilt to the entire board group
  boardGroup.rotation.x = tiltAngle;

  console.log(`Created ${pinBodies.length} pins in ${pinGrid.rows} rows`);
  console.log(
    `Pin grid dimensions: ${pinGrid.bottomWidth} wide, ${
      pinGrid.topY - pinGrid.binsY
    } tall`
  );
  console.log(
    `Back board created: ${boardWidth} x ${boardHeight} x ${boardDepth}`
  );
  console.log(`Board tilted ${(tiltAngle * 180) / Math.PI} degrees`);

  return {
    pinBodies,
    pinMeshes,
    backBoard,
    boardGroup,
  };
}

// Helper function to rotate a point around the X-axis
function rotatePointAroundX(point: Vector3, angle: number): Vector3 {
  const y = point.y * Math.cos(angle) - point.z * Math.sin(angle);
  const z = point.y * Math.sin(angle) + point.z * Math.cos(angle);
  return new Vector3(point.x, y, z);
}
