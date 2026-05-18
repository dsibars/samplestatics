import { GameEngine } from './js/engine/GameEngine.js';

const engine = new GameEngine();

// Simulate initial state
console.log("Initial state:", JSON.stringify(engine.update(), null, 2));

// Get the tutorial cave ID
const state = engine.update();
const cave = state.expeditions.find(e => e.id === 'exp_tutorial_cave');
const arthur = state.heroes[0];

console.log("\nAssigning Arthur to Tutorial Cave...");
const result = engine.assignExpedition(cave.id, [arthur.id]);
console.log("Assign Result:", result);

console.log("\nState after assignment:", JSON.stringify(engine.update(), null, 2));

