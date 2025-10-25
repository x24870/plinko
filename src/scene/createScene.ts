import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
} from "@babylonjs/core";

export interface GameScene {
  engine: Engine;
  scene: Scene;
  camera: ArcRotateCamera;
}

export function createScene(canvas: HTMLCanvasElement): GameScene {
  // Create BabylonJS engine
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });

  // Create scene
  const scene = new Scene(engine);

  // Create camera - ArcRotateCamera for top-down view of plinko board
  const camera = new ArcRotateCamera(
    "camera",
    Math.PI / 2, // alpha: horizontal rotation (0 = front, -π/2 = right)
    Math.PI / 3, // beta: vertical rotation (π/2 = top, π/3 = angled down)
    30, // radius: distance from target
    Vector3.Zero(), // target: center of the scene
    scene
  );

  // Attach camera controls
  camera.attachControl(canvas, true);

  // Create lighting
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.8;

  // Set up render loop
  engine.runRenderLoop(() => {
    scene.render();
  });

  // Handle window resize
  window.addEventListener("resize", () => {
    engine.resize();
  });

  return {
    engine,
    scene,
    camera,
  };
}
