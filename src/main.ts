import './styles.css'
import { createScene } from './scene/createScene'

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

// TODO: Initialize remaining components
// - Physics world
// - Game loop
// - UI controls
