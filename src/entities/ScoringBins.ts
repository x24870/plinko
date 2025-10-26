import * as RAPIER from "@dimforge/rapier3d-compat";
import {
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Scene,
} from "@babylonjs/core";
import { MaterialManager, createBinMaterial } from "../visual/MaterialManager";

export interface Bin {
  idx: number;
  x0: number;
  x1: number;
  y: number;
  score: number;
}

export interface BinsInfo {
  bins: Bin[];
  binsY: number;
  gapXs: number[];
}

export interface BinBodies {
  binBodies: RAPIER.RigidBody[];
  binMeshes: any[];
  binDividers: RAPIER.RigidBody[];
  dividerMeshes: any[];
}

export function generateBins(info: {
  rows: number;
  s: number;
  topY: number;
  v: number;
}): BinsInfo {
  const { rows: R, s, topY, v } = info;
  const bottomY = topY - (R - 1) * v;
  const binsY = bottomY - v;

  const gapXs: number[] = [];
  for (let i = 0; i < R; i++) {
    const xi = (i - (R - 1) / 2) * s;
    const nextXi = (i + 1 - (R - 1) / 2) * s;
    const gap = (xi + nextXi) / 2;
    gapXs.push(gap);
  }

  const binBoundaries: number[] = [-Infinity, ...gapXs, Infinity];

  const bins = Array.from({ length: R + 1 }, (_, k) => ({
    idx: k,
    x0: binBoundaries[k] as number,
    x1: binBoundaries[k + 1] as number,
    y: binsY,
    score: scoreFor(k, R),
  }));

  return { bins, binsY, gapXs };
}

function scoreFor(k: number, R: number): number {
  const center = R / 2;
  const dist = Math.abs(k - center);
  const base = 150;
  const step = 15;
  return Math.max(10, Math.round(base - dist * step));
}

export function createBinBodies(
  world: RAPIER.World,
  scene: Scene,
  binsInfo: BinsInfo,
  materialManager?: MaterialManager
): BinBodies {
  const binBodies: RAPIER.RigidBody[] = [];
  const binMeshes: any[] = [];
  const binDividers: RAPIER.RigidBody[] = [];
  const dividerMeshes: any[] = [];

  // Create bin floor material
  const binFloorMaterial = new StandardMaterial("binFloorMaterial", scene);
  binFloorMaterial.diffuseColor = new Color3(0.2, 0.2, 0.2);

  // Create bin floor (single large floor for all bins)
  const floorWidth = binsInfo.gapXs.length * 0.8; // Approximate total width
  const floorDepth = 2;
  const floorHeight = 0.1;

  const floorDesc = RAPIER.RigidBodyDesc.fixed();
  floorDesc.setTranslation(0, binsInfo.binsY - floorHeight / 2, 0);

  const floorColliderDesc = RAPIER.ColliderDesc.cuboid(
    floorWidth / 2,
    floorHeight / 2,
    floorDepth / 2
  );
  const floorBody = world.createRigidBody(floorDesc);
  world.createCollider(floorColliderDesc, floorBody);
  binBodies.push(floorBody);

  // Create floor mesh
  const floorMesh = MeshBuilder.CreateBox(
    "binFloor",
    {
      width: floorWidth,
      height: floorHeight,
      depth: floorDepth,
    },
    scene
  );
  floorMesh.position = new Vector3(0, binsInfo.binsY - floorHeight / 2, 0);
  floorMesh.material = binFloorMaterial;
  binMeshes.push(floorMesh);

  // Find max score for color scaling
  const maxScore = Math.max(...binsInfo.bins.map((bin) => bin.score));

  // Create dividers between bins with colored materials
  for (let i = 0; i < binsInfo.gapXs.length; i++) {
    const gapX = binsInfo.gapXs[i]!; // Non-null assertion since we know the array has values
    const dividerWidth = 0.05;

    // Get color based on adjacent bins' scores
    let dividerMaterial: StandardMaterial;
    const bin = binsInfo.bins[i];
    if (materialManager && bin) {
      dividerMaterial = createBinMaterial(materialManager, bin.score, maxScore);
    } else {
      // Fallback material
      dividerMaterial = new StandardMaterial(`dividerMaterial_${i}`, scene);
      dividerMaterial.diffuseColor = new Color3(0.4, 0.4, 0.4);
    }
    const dividerHeight = 1.0;
    const dividerDepth = 0.1;

    // Create divider physics body
    const dividerDesc = RAPIER.RigidBodyDesc.fixed();
    dividerDesc.setTranslation(gapX, binsInfo.binsY + dividerHeight / 2, 0);

    const dividerColliderDesc = RAPIER.ColliderDesc.cuboid(
      dividerWidth / 2,
      dividerHeight / 2,
      dividerDepth / 2
    );
    const dividerBody = world.createRigidBody(dividerDesc);
    world.createCollider(dividerColliderDesc, dividerBody);
    binDividers.push(dividerBody);

    // Create divider mesh
    const dividerMesh = MeshBuilder.CreateBox(
      `divider_${i}`,
      {
        width: dividerWidth,
        height: dividerHeight,
        depth: dividerDepth,
      },
      scene
    );
    dividerMesh.position = new Vector3(
      gapX,
      binsInfo.binsY + dividerHeight / 2,
      0
    );
    dividerMesh.material = dividerMaterial;
    dividerMeshes.push(dividerMesh);
  }

  console.log(
    `Created ${binsInfo.bins.length} bins with ${binDividers.length} dividers`
  );
  console.log(`Bin scores: ${binsInfo.bins.map((b) => b.score).join(", ")}`);

  return {
    binBodies,
    binMeshes,
    binDividers,
    dividerMeshes,
  };
}
