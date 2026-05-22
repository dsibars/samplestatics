/**
 * EngineAdapter - Orchestrates the Engine and UI.
 * Connects events from UI to Engine and updates UI from Engine state.
 */
const DEBUG = false;

export class EngineAdapter {
    constructor(engine, ui) {
        this.engine = engine;
        this.ui = ui;
        this.rafId = null;
        this.lastUpdateTime = 0;
        this.UPDATE_INTERVAL = 100; // Update UI every 100ms (10 FPS is enough for state, animations are handled by CSS)
    }

    init() {
        this.ui.engine = this.engine;
        this.ui.adapter = this;
        this.ui.combatView.engine = this.engine;
        this.ui.combatView.adapter = this;
        // Setup Global UI Events
        const btnNextDay = document.getElementById('btn-global-next-day');
        if (btnNextDay) {
            btnNextDay.addEventListener('click', () => {
                // Add click effect
                btnNextDay.style.transform = 'scale(0.95)';
                setTimeout(() => btnNextDay.style.transform = '', 100);

                const report = this.engine.nextDay();
                if (report && report.expedition) {
                    if (report.expedition.status === 'battle_started') {
                        this.ui.openCombatOverlay(report.expedition, () => {
                            this.forceUpdate();
                        });
                    } else if (report.expedition.combatLog) {
                        this.ui.playBattleLog(report.expedition.combatLog, () => {
                            this.forceUpdate();
                        });
                    } else {
                        this.forceUpdate();
                    }
                } else {
                    this.forceUpdate();
                }
            });
        }

        // Wire up view events
        this.ui.views.forEach((view, domain) => {            if (domain === 'buildings') {
                view.on('startProject', (data) => {
                    const result = this.engine.startProject(
                        data.buildingId,
                        data.targetLevel,
                        data.costGold,
                        data.costMaterials,
                        data.duration
                    );
                    if (!result.success) {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    }
                    this.forceUpdate();
                });
            }
            
            if (domain === 'village') {
                view.on('setBuilders', (data) => {
                    const village = this.engine.villageService.getState();
                    const currentBuilders = village.population.builders || 0;
                    const newCount = currentBuilders + (data.delta || 0);
                    const result = this.engine.villageService.setBuilders(newCount);
                    if (!result.success) {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    }
                    this.forceUpdate();
                });
                view.on('setWorkerRole', (data) => {
                    const result = this.engine.setWorkerRole(data.role, data.delta);
                    if (!result.success) {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    }
                    this.forceUpdate();
                });
                view.on('assignDefense', (data) => {
                    const result = this.engine.assignDefense(data.heroId);
                    if (!result.success) {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    }
                    this.forceUpdate();
                });
                view.on('unassignDefense', (data) => {
                    const result = this.engine.unassignDefense(data.heroId);
                    if (!result.success) {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    }
                    this.forceUpdate();
                });
            }
            
            if (domain === 'explore') {
                view.on('assignExpedition', (data) => {
                    const result = this.engine.assignExpedition(data.expId, data.heroIds);
                    if (!result.success) {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    }
                    this.forceUpdate();
                });
                view.on('retireExpedition', (data) => {
                    this.engine.retireExpedition(data && data.expId ? data.expId : null);
                    this.forceUpdate();
                });
            }

            if (domain === 'heroes') {
                view.on('recruitHero', () => {
                    const result = this.engine.recruitHero();
                    if (result.success) {
                        this.ui.showToast(`${this.engine.i18n.t('ui_recruit_success') || 'Recruited'} ${result.data.hero.name}! (-${result.data.cost}g)`);
                    } else {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    }
                    this.forceUpdate();
                });
                view.on('increaseStat', (data) => {
                    const result = this.engine.increaseHeroStat(data.heroId, data.statId);
                    if (!result.success) {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    }
                    this.forceUpdate();
                });
                view.on('equipItem', (data) => {
                    const result = this.engine.equipHeroItem(data.heroId, data.slot, data.itemId);
                    if (!result.success) {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    }
                    this.forceUpdate();
                });
                view.on('unequipItem', (data) => {
                    const result = this.engine.unequipHeroItem(data.heroId, data.slot);
                    if (!result.success) {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    }
                    this.forceUpdate();
                });
                view.on('learnSkill', (data) => {
                    const result = this.engine.learnHeroSkill(data.heroId, data.skillId);
                    if (!result.success) {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    }
                    this.forceUpdate();
                });
                view.on('upgradeSkill', (data) => {
                    const result = this.engine.upgradeHeroSkill(data.heroId, data.skillId);
                    if (!result.success) {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    }
                    this.forceUpdate();
                });
                view.on('unequipSkill', (data) => {
                    const result = this.engine.unequipHeroSkill(data.heroId, data.skillId);
                    if (!result.success) {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    }
                    this.forceUpdate();
                });
                view.on('inscribeSkill', (data) => {
                    const result = this.engine.inscribeHeroSkill(data.heroId, data.skillId);
                    if (!result.success) {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    }
                    this.forceUpdate();
                });
                view.on('eraseInscription', (data) => {
                    const result = this.engine.eraseHeroInscription(data.heroId, data.skillId);
                    if (!result.success) {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    }
                    this.forceUpdate();
                });
            }

            if (domain === 'shop') {
                view.on('buyItem', (data) => {
                    const result = this.engine.buyItem(data.itemData, data.costGold);
                    if (!result.success) {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    }
                    this.forceUpdate();
                });
                view.on('sellItem', (data) => {
                    const result = this.engine.sellItem(data.itemId, data.itemType, data.sellPrice);
                    if (!result.success) {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    } else {
                        this.ui.showToast(`+${result.data.goldEarned}g`);
                    }
                    this.forceUpdate();
                });
                view.on('sellResource', (data) => {
                    const result = this.engine.sellResource(data.resourceId, data.quantity);
                    if (!result.success) {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    } else {
                        this.ui.showToast(`+${result.data.goldEarned}g (${result.data.sold} ${this.engine.i18n.t(data.resourceId) || data.resourceId})`);
                    }
                    this.forceUpdate();
                });
            }

            if (domain === 'inventory') {
                view.on('cookMeal', (data) => {
                    const result = this.engine.cookMeal(data.recipeId);
                    if (result.success) {
                        this.ui.showToast(this.engine.i18n.t('ui_cooked') + ' ' + this.engine.i18n.t(data.recipeId));
                    } else {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    }
                    this.forceUpdate();
                });
                view.on('consumeMeal', (data) => {
                    const result = this.engine.consumeMeal(data.mealId);
                    if (result.success) {
                        this.ui.showToast(`${this.engine.i18n.t('ui_fed')} ${result.data.fedCount} ${this.engine.i18n.t('ui_heroes')}`);
                    } else {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    }
                    this.forceUpdate();
                });
            }

            if (domain === 'forge') {
                view.on('refineItem', (data) => {
                    const result = this.engine.refineEquipment(data.itemId);
                    if (!result.success) {
                        this.ui.showToast(this.engine.i18n.t(result.error) || result.error);
                    }
                    this.forceUpdate();
                });
            }

            if (domain === 'settings') {
                view.on('devCheatActivate', () => {
                    if (DEBUG) console.log('EngineAdapter: devCheatActivate received');
                    this.engine.activateDeveloperCheat();
                    this.forceUpdate();
                });
            }
        });

        // Handle UI actions (legacy)
        this.ui.onInitialize(() => {
            if (DEBUG) console.log('Village initialization requested via Adapter');
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
                
                // Combat Auto-Advance Tick
                if (newState.activeBattle && !newState.activeBattle.isOver) {
                    const battle = newState.activeBattle;
                    const activeActor = battle.turnOrder[battle.currentTurnIndex];
                    const isHeroTurn = activeActor && activeActor.type === 'Hero';
                    
                    if (!isHeroTurn || battle.autoBattle) {
                        const now = Date.now();
                        if (!this.lastCombatAdvanceTime) {
                            this.lastCombatAdvanceTime = now;
                        }
                        
                        if (now - this.lastCombatAdvanceTime >= 500) {
                            this.engine.nextBattleTurn();
                            this.lastCombatAdvanceTime = now;
                        }
                    } else {
                        this.lastCombatAdvanceTime = null;
                    }
                } else {
                    this.lastCombatAdvanceTime = null;
                }

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
