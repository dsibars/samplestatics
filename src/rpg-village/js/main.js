/**
 * RPG Village - Main Entry Point
 */

import { UIController } from './presentation/ui/UIController.js';
import { GameEngine } from './engine/GameEngine.js';
import { EngineAdapter } from './presentation/adapters/EngineAdapter.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('RPG Village Initializing...');

    // 1. Initialize Engine (The Logic)
    const engine = new GameEngine();

    // 2. Initialize UI Controller (The Components)
    const ui = new UIController();

    // 3. Initialize Adapter (The Orchestrator)
    const adapter = new EngineAdapter(engine, ui);

    // Start the loop
    adapter.init();
    
    console.log('RPG Village Ready!');
});
