/**
 * GameEngine - Central Facade
 * Wires together the bounded contexts (domains) and provides a clean API for the presentation layer.
 */
import { HeroService } from './heroes/services/HeroService.js';
import { BattleService } from './shared/combat/services/BattleService.js';
import { InventoryService } from './shared/inventory/services/InventoryService.js';
import { persistence } from './shared/core/Persistence.js';
import { i18n } from './shared/core/i18n/I18nService.js';

export class GameEngine {
    constructor() {
        this.STORAGE_KEY = 'village_state';

        // Initialize Services
        this.inventoryService = new InventoryService();
        this.heroService = new HeroService(this.inventoryService);
        this.battleService = new BattleService(this.inventoryService);
        this.i18n = i18n;
        
        // Village State (MVP)
        this.state = this._loadState();
    }

    _loadState() {
        const defaultState = {
            gold: 100,
            population: {
                total: 5,
                assigned: 0,
                max: 10
            },
            infrastructure: {
                housing: 1,
                farm: 1,
                warehouse: 1,
                blacksmith: 0,
                training_grounds: 0
            },
            constructionQueue: [],
            lang: 'en',
            day: 1,
            lastUpdate: Date.now()
        };
        const loaded = persistence.load(this.STORAGE_KEY, defaultState);

        // Ensure starter items exist if it's a new game
        if (this.inventoryService.getConsumableCount('food_raw_grain') === 0 && loaded.day === 1) {
            this.inventoryService.addConsumable('food_raw_grain', 50);
            this.inventoryService.addConsumable('material_wood', 10);
        }

        this.i18n.setLanguage(loaded.lang);
        return loaded;
    }

    _saveState() {
        persistence.save(this.STORAGE_KEY, this.state);
    }

    update() {
        const now = Date.now();
        const delta = (now - this.state.lastUpdate) / 1000;
        
        // Example logic: Just tracking time for now
        this.state.lastUpdate = now;
        this._saveState();
        
        return {
            village: this.state,
            heroes: this.heroService.list()
        };
    }

    // --- Hero Facade ---
    addHero(heroData) {
        return this.heroService.add(heroData);
    }

    getHeroes() {
        return this.heroService.list();
    }

    // --- Combat Facade ---
    startBattle(enemies) {
        const activeHeroes = this.heroService.list('active');
        return this.battleService.startBattle(activeHeroes, enemies);
    }

    setLanguage(lang) {
        if (this.i18n.setLanguage(lang)) {
            this.state.lang = lang;
            this._saveState();
            return true;
        }
        return false;
    }

    // --- Time & Construction ---
    nextDay() {
        // 1. Consumption: 1 food per person
        const consumption = this.state.population.total;
        // We use food_raw_grain as the default for now
        const useResult = this.inventoryService.useConsumable('food_raw_grain', consumption);
        
        // 2. Construction Progress
        const completedBuildings = [];
        this.state.constructionQueue.forEach((project, index) => {
            project.daysRemaining--;
            if (project.daysRemaining <= 0) {
                // Building finished!
                this.state.infrastructure[project.buildingId] = project.targetLevel;
                completedBuildings.push(project.buildingId);
            }
        });
        
        // Remove completed projects from queue
        this.state.constructionQueue = this.state.constructionQueue.filter(p => p.daysRemaining > 0);

        // 3. Increment Day
        this.state.day++;
        this.state.lastUpdate = Date.now();
        this._saveState();

        return {
            day: this.state.day,
            consumed: consumption,
            completed: completedBuildings
        };
    }
}
