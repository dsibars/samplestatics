/**
 * EngineAdapter - Orchestrates the Engine and UI.
 * Connects events from UI to Engine and updates UI from Engine state.
 */
export class EngineAdapter {
    constructor(engine, ui) {
        this.engine = engine;
        this.ui = ui;
        this.rafId = null;
        this.lastUpdateTime = 0;
        this.UPDATE_INTERVAL = 100; // Update UI every 100ms (10 FPS is enough for state, animations are handled by CSS)
    }

    init() {
        // Wire up view events
        this.ui.views.forEach((view, domain) => {
            if (domain === 'village') {
                view.on('nextDay', () => {
                    const report = this.engine.nextDay();
                    if (report && report.expedition && report.expedition.combatLog) {
                        this.ui.playBattleLog(report.expedition.combatLog, () => {
                            this.forceUpdate();
                        });
                    } else {
                        this.forceUpdate();
                    }
                });
            }

            if (domain === 'buildings') {
                view.on('startProject', (data) => {
                    const result = this.engine.startProject(
                        data.buildingId,
                        data.targetLevel,
                        data.costGold,
                        data.costMaterials,
                        data.duration
                    );
                    if (!result.success) {
                        alert(this.engine.i18n.t(result.error));
                    }
                    this.forceUpdate();
                });
            }
            
            if (domain === 'explore') {
                view.on('assignExpedition', (data) => {
                    const result = this.engine.assignExpedition(data.expId, data.heroIds);
                    if (!result.success) {
                        alert(this.engine.i18n.t(result.error));
                    }
                    this.forceUpdate();
                });
                view.on('retireExpedition', () => {
                    this.engine.retireExpedition();
                    this.forceUpdate();
                });
            }

            if (domain === 'heroes') {
                view.on('increaseStat', (data) => {
                    const result = this.engine.increaseHeroStat(data.heroId, data.statId);
                    if (!result.success) {
                        alert(this.engine.i18n.t(result.error));
                    }
                    this.forceUpdate();
                });
            }
        });

        // Handle UI actions (legacy)
        this.ui.onInitialize(() => {
            console.log('Village initialization requested via Adapter');
        });

        // Start the game loop
        this.startLoop();
    }

    forceUpdate() {
        const newState = this.engine.update();
        this.ui.update(newState);
    }

    startLoop() {
        const loop = (timestamp) => {
            // Throttled update to prevent UI thrashing
            if (timestamp - this.lastUpdateTime >= this.UPDATE_INTERVAL) {
                const newState = this.engine.update();
                this.ui.update(newState);
                this.lastUpdateTime = timestamp;
            }
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
