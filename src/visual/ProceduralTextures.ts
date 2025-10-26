import { Scene, DynamicTexture } from "@babylonjs/core";

/**
 * Generate a procedural wood grain texture using Canvas
 */
export function createWoodTexture(
  scene: Scene,
  size: number = 512
): DynamicTexture {
  const texture = new DynamicTexture("woodTexture", size, scene, false);
  const context = texture.getContext();

  // Dark wood background
  const gradient = context.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#1a1410");
  gradient.addColorStop(0.5, "#2d2419");
  gradient.addColorStop(1, "#1a1410");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  // Add wood grain lines
  context.strokeStyle = "rgba(0, 0, 0, 0.3)";
  context.lineWidth = 2;

  for (let i = 0; i < 20; i++) {
    context.beginPath();
    const y = (i / 20) * size;
    const offset = Math.sin(i * 0.5) * 10;
    context.moveTo(0, y + offset);
    context.lineTo(size, y + offset + Math.sin(i * 0.3) * 15);
    context.stroke();
  }

  // Add some noise
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const opacity = Math.random() * 0.1;
    context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    context.fillRect(x, y, 2, 2);
  }

  texture.update();
  return texture;
}

/**
 * Generate a procedural carbon fiber texture
 */
export function createCarbonFiberTexture(
  scene: Scene,
  size: number = 512
): DynamicTexture {
  const texture = new DynamicTexture("carbonTexture", size, scene, false);
  const context = texture.getContext();

  // Dark background
  context.fillStyle = "#0a0a0a";
  context.fillRect(0, 0, size, size);

  // Carbon fiber pattern
  const gridSize = 32;
  context.strokeStyle = "rgba(50, 50, 50, 0.5)";
  context.lineWidth = 1;

  for (let x = 0; x < size; x += gridSize) {
    for (let y = 0; y < size; y += gridSize) {
      // Diagonal lines
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + gridSize, y + gridSize);
      context.stroke();

      context.beginPath();
      context.moveTo(x + gridSize, y);
      context.lineTo(x, y + gridSize);
      context.stroke();
    }
  }

  // Add subtle highlights
  context.strokeStyle = "rgba(100, 100, 120, 0.2)";
  for (let i = 0; i < size; i += gridSize * 2) {
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i, size);
    context.stroke();

    context.beginPath();
    context.moveTo(0, i);
    context.lineTo(size, i);
    context.stroke();
  }

  texture.update();
  return texture;
}

/**
 * Generate a simple gradient texture
 */
export function createGradientTexture(
  scene: Scene,
  size: number = 512,
  color1: string = "#1a1a2e",
  color2: string = "#16213e"
): DynamicTexture {
  const texture = new DynamicTexture("gradientTexture", size, scene, false);
  const context = texture.getContext();

  const gradient = context.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  texture.update();
  return texture;
}

/**
 * Generate a plinko-themed texture with logo/text
 */
export function createPlinkoTexture(
  scene: Scene,
  size: number = 512
): DynamicTexture {
  const texture = new DynamicTexture("plinkoTexture", size, scene, false);
  const context = texture.getContext();

  // Dark gradient background
  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "#2d3436");
  gradient.addColorStop(1, "#1a1a1a");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  // Add "PLINKO" text in center
  const ctx = context as CanvasRenderingContext2D;
  ctx.fillStyle = "rgba(76, 175, 80, 0.15)";
  ctx.font = `bold ${size / 8}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PLINKO", size / 2, size / 2);

  // Add decorative circles
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = Math.random() * 3 + 1;
    context.fillStyle = `rgba(76, 175, 80, ${Math.random() * 0.1})`;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  texture.update();
  return texture;
}
