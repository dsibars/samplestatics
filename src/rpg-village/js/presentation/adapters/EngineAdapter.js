/**
 * EngineAdapter - Orchestrates the Engine and UI.
 * Connects events from UI to Engine and updates UI from Engine state.
 */
export class EngineAdapter {
    constructor(engine, ui) {
        this.engine = engine;
        this.ui = ui;
        this.rafId = null;
    }

    init() {
        // Handle UI actions
        this.ui.onInitialize(() => {
            console.log('Village initialization requested via Adapter');
            this.engine.addVillager();
        });

        // Start the game loop
        this.startLoop();
    }

    startLoop() {
        const loop = () => {
            const newState = this.engine.update();
            this.ui.update(newState);
            this.rafId = requestAnimationFrame(loop);
        };
        this.rafId = requestAnimationFrame(loop);
    }

    stopLoop() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
    }
}
