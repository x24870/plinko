import './styles.css'
import { createScene } from './scene/createScene'
import { initializeRapierWorld } from './physics/rapierWorld'

// Main entry point for the Plinko game
console.log('Plinko Game starting...')

// Initialize the game
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
if (!canvas) {
  throw new Error('Canvas element not found!')
}

// Create BabylonJS scene
const gameScene = createScene(canvas)
console.log('BabylonJS scene created successfully')

// Initialize physics world
initializeRapierWorld().then((physicsWorld) => {
  console.log('Physics world initialized successfully')
  console.log('Gravity:', physicsWorld.gravity)
  console.log('Timestep:', physicsWorld.timestep)
})

// TODO: Initialize remaining components
// - Game loop
// - UI controls
