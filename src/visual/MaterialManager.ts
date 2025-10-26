import { Scene, StandardMaterial, Color3, Texture } from "@babylonjs/core";
import { createWoodTexture, createPlinkoTexture } from "./ProceduralTextures";

export interface MaterialManager {
  scene: Scene;
  ballMaterials: StandardMaterial[];
  pinMaterial: StandardMaterial;
  backBoardMaterial: StandardMaterial;
  binMaterials: Map<number, StandardMaterial>; // score -> material
  wallMaterial: StandardMaterial;
}

export function createMaterialManager(scene: Scene): MaterialManager {
  // Ball materials - colorful and emissive
  const ballColors = [
    new Color3(1, 0.2, 0.2), // Red
    new Color3(0.2, 0.5, 1), // Blue
    new Color3(1, 0.8, 0.2), // Yellow
    new Color3(0.3, 1, 0.3), // Green
    new Color3(1, 0.4, 0.8), // Pink
    new Color3(0.8, 0.3, 1), // Purple
    new Color3(1, 0.6, 0.2), // Orange
    new Color3(0.2, 1, 1), // Cyan
  ];

  const ballMaterials = ballColors.map((color, index) => {
    const material = new StandardMaterial(`ballMaterial_${index}`, scene);
    material.diffuseColor = color;
    material.emissiveColor = color.scale(0.3); // Slight glow
    material.specularColor = new Color3(0.5, 0.5, 0.5);
    material.specularPower = 32;
    return material;
  });

  // Pin material - metallic silver
  const pinMaterial = new StandardMaterial("pinMaterial", scene);
  pinMaterial.diffuseColor = new Color3(0.7, 0.7, 0.75);
  pinMaterial.specularColor = new Color3(0.9, 0.9, 0.95);
  pinMaterial.specularPower = 64;
  pinMaterial.emissiveColor = new Color3(0.1, 0.1, 0.12);

  // Back board material with procedural or image texture
  const backBoardMaterial = new StandardMaterial("backBoardMaterial", scene);

  // Option 1: Try to load custom image texture
  const useCustomTexture = true; // Set to true if you have board-texture.jpg in public/textures/

  if (useCustomTexture) {
    try {
      // Use relative path that works with Vite's base path
      const texturePath =
        (import.meta as any).env.BASE_URL + "textures/casino-girl.png";
      console.log("Loading texture from:", texturePath);

      const texture = new Texture(texturePath, scene, false, true);
      texture.onLoadObservable.addOnce(() => {
        console.log("✅ Custom board texture loaded successfully!");
        console.log("Texture size:", texture.getSize());

        // Fix texture orientation
        texture.vScale = -1; // Flip vertically
        texture.vOffset = 1; // Adjust offset after flip

        // Adjust texture size and repetition
        texture.uScale = 1; // Horizontal scale (1 = normal size)
        texture.vScale = -1; // Vertical scale (-1 = flipped)
        texture.wrapU = Texture.CLAMP_ADDRESSMODE; // Don't repeat horizontally
        texture.wrapV = Texture.CLAMP_ADDRESSMODE; // Don't repeat vertically

        // If still upside down, try horizontal flip instead:
        // texture.uScale = -1;  // Flip horizontally
        // texture.uOffset = 1;  // Adjust offset after flip
      });

      // Add timeout to detect if texture fails to load
      setTimeout(() => {
        if (!texture.isReady()) {
          console.log("⚠️ Texture failed to load, using procedural fallback");
          backBoardMaterial.diffuseTexture = createPlinkoTexture(scene, 512);
        }
      }, 3000);

      backBoardMaterial.diffuseTexture = texture;
    } catch (error) {
      // panic
      console.log("Using procedural texture");
      backBoardMaterial.diffuseTexture = createPlinkoTexture(scene, 512);
    }
  } else {
    // Option 2: Use procedural texture (no image file needed)
    // Choose one of: createWoodTexture, createCarbonFiberTexture, createPlinkoTexture
    backBoardMaterial.diffuseTexture = createWoodTexture(scene, 512);
    console.log("✅ Using procedural wood texture for board");
  }

  backBoardMaterial.specularColor = new Color3(0.2, 0.2, 0.25);
  backBoardMaterial.specularPower = 16;
  backBoardMaterial.emissiveColor = new Color3(0.05, 0.05, 0.08);

  // Wall material - transparent dark
  const wallMaterial = new StandardMaterial("wallMaterial", scene);
  wallMaterial.diffuseColor = new Color3(0.1, 0.1, 0.15);
  wallMaterial.specularColor = new Color3(0.3, 0.3, 0.4);
  wallMaterial.alpha = 0.3;

  // Bin materials based on score
  const binMaterials = new Map<number, StandardMaterial>();

  console.log("Material manager created with enhanced visuals");

  return {
    scene,
    ballMaterials,
    pinMaterial,
    backBoardMaterial,
    binMaterials,
    wallMaterial,
  };
}

export function createBinMaterial(
  materialManager: MaterialManager,
  score: number,
  maxScore: number
): StandardMaterial {
  // Check if material already exists
  if (materialManager.binMaterials.has(score)) {
    return materialManager.binMaterials.get(score)!;
  }

  const material = new StandardMaterial(
    `binMaterial_${score}`,
    materialManager.scene
  );

  // Color based on score (gold for high, silver for medium, bronze for low)
  const scoreRatio = score / maxScore;

  if (scoreRatio >= 0.8) {
    // Gold (high score)
    material.diffuseColor = new Color3(1, 0.84, 0);
    material.emissiveColor = new Color3(0.3, 0.25, 0);
    material.specularColor = new Color3(1, 0.95, 0.6);
    material.specularPower = 128;
  } else if (scoreRatio >= 0.5) {
    // Silver (medium score)
    material.diffuseColor = new Color3(0.75, 0.75, 0.75);
    material.emissiveColor = new Color3(0.2, 0.2, 0.2);
    material.specularColor = new Color3(0.9, 0.9, 0.9);
    material.specularPower = 64;
  } else if (scoreRatio >= 0.3) {
    // Bronze (medium-low score)
    material.diffuseColor = new Color3(0.8, 0.5, 0.2);
    material.emissiveColor = new Color3(0.2, 0.12, 0.05);
    material.specularColor = new Color3(0.7, 0.5, 0.3);
    material.specularPower = 32;
  } else {
    // Dark blue (low score)
    material.diffuseColor = new Color3(0.2, 0.3, 0.5);
    material.emissiveColor = new Color3(0.05, 0.08, 0.12);
    material.specularColor = new Color3(0.3, 0.4, 0.6);
    material.specularPower = 16;
  }

  materialManager.binMaterials.set(score, material);
  return material;
}

export function getRandomBallMaterial(
  materialManager: MaterialManager
): StandardMaterial {
  const randomIndex = Math.floor(
    Math.random() * materialManager.ballMaterials.length
  );
  const material = materialManager.ballMaterials[randomIndex];
  if (!material) {
    throw new Error("Ball material not found at index " + randomIndex);
  }
  return material;
}

export function getBallMaterialByIndex(
  materialManager: MaterialManager,
  index: number
): StandardMaterial {
  const material =
    materialManager.ballMaterials[index % materialManager.ballMaterials.length];
  if (!material) {
    throw new Error("Ball material not found at index " + index);
  }
  return material;
}
