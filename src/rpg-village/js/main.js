import { UIController } from './presentation/ui/UIController.js';
import { GameEngine } from './engine/GameEngine.js';
import { EngineAdapter } from './presentation/adapters/EngineAdapter.js';

// Domain Views
import { VillageView } from './presentation/ui/village/VillageView.js';
import { BuildingsView } from './presentation/ui/buildings/BuildingsView.js';
import { HeroesView } from './presentation/ui/heroes/HeroesView.js';
import { InventoryView } from './presentation/ui/inventory/InventoryView.js';
import { ExploreView } from './presentation/ui/explore/ExploreView.js';
import { SettingsView } from './presentation/ui/settings/SettingsView.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('RPG Village Initializing...');

    // 1. Initialize Engine (The Logic)
    const engine = new GameEngine();
    window.engine = engine; // Expose for debugging/subagent

    // 2. Initialize UI Controller (The Components)
    const ui = new UIController(engine.i18n);
    window.ui = ui; // Expose for debugging/subagent

    // Register Domain Views
    ui.registerView('village', new VillageView());
    ui.registerView('buildings', new BuildingsView());
    ui.registerView('heroes', new HeroesView());
    ui.registerView('inventory', new InventoryView());
    ui.registerView('explore', new ExploreView());
    ui.registerView('settings', new SettingsView());

    // Set initial view
    ui.switchView('village');

    // Show Intro if it's a new game
    if (engine.isNewGame) {
        ui.showIntroDialog();
    }

    // 3. Initialize Adapter (The Orchestrator)
    const adapter = new EngineAdapter(engine, ui);

    // Start the loop
    adapter.init();
    
    console.log('RPG Village Ready!');
});
