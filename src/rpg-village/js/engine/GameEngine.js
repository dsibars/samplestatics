/**
 * GameEngine - Central Facade
 * Wires together the bounded contexts (domains) and provides a clean API for the presentation layer.
 */
import { HeroService } from './heroes/services/HeroService.js';
import { BattleService } from './shared/combat/services/BattleService.js';
import { InventoryService } from './shared/inventory/services/InventoryService.js';
import { VillageService } from './village/services/VillageService.js';
import { ExpeditionService } from './explore/services/ExpeditionService.js';
import { persistence } from './shared/core/Persistence.js';
import { i18n } from './shared/core/i18n/I18nService.js';

export class GameEngine {
    constructor() {
        this.STORAGE_KEY = 'village_state';

        // Initialize Services
        this.inventoryService = new InventoryService();
        this.villageService = new VillageService(this.inventoryService);
        this.heroService = new HeroService(this.inventoryService);
        this.battleService = new BattleService(this.inventoryService);
        this.expeditionService = new ExpeditionService(
            this.battleService, 
            this.heroService, 
            this.villageService, 
            this.inventoryService
        );
        this.i18n = i18n;
        
        // Ensure starter items exist if it's a new game
        const villageState = this.villageService.getState();
        if (this.inventoryService.getConsumableCount('food_raw_grain') === 0 && villageState.day === 1) {
            this.inventoryService.addConsumable('food_raw_grain', 50);
            this.inventoryService.addConsumable('material_wood', 10);
        }

        this.i18n.setLanguage(persistence.load('village_state', { lang: 'en' }).lang);
    }

    update() {
        const now = Date.now();
        
        return {
            village: this.villageService.getState(),
            heroes: this.heroService.list(),
            expeditions: this.expeditionService.getExpeditions(),
            activeExpedition: this.expeditionService.state.activeExpedition
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
            const state = persistence.load('village_state', {});
            state.lang = lang;
            persistence.save('village_state', state);
            return true;
        }
        return false;
    }

    // --- Time & Construction ---
    nextDay() {
        return this.villageService.nextDay();
    }
}
