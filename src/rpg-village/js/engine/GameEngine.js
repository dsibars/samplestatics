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
        
        this.i18n = i18n;
        
        // New Game Experience
        const hasHeroes = persistence.load('heroes_data', null) !== null;
        const hasVillage = persistence.load('village_state', null) !== null;
        
        this.isNewGame = !hasHeroes || !hasVillage;
        console.log('Engine: checkNewGame?', this.isNewGame, { hasHeroes, hasVillage });
        
        if (this.isNewGame) {
            this.initNewGame();
        }

        this.i18n.setLanguage(persistence.load('settings_lang', 'en'));
    }


    initNewGame() {
        console.log('Engine: Initializing New Game state...');
        
        // Add starting hero if not exists
        const currentHeroes = this.heroService.list();
        if (currentHeroes.length === 0) {
            this.heroService.add({
                name: "Arthur",
                origin: "warrior",
                level: 1
            });
        }
    }

    update() {
        const now = Date.now();
        const activeExpedition = this.expeditionService.state.activeExpedition;
        
        const heroesDto = this.heroService.list().map(hero => {
            const dto = hero.toJSON();
            const activityInfo = this.expeditionService.getHeroActivity(hero.id);
            dto.activity = activityInfo.type;
            if (activityInfo.type === 'expedition') {
                dto.activityTargetId = activityInfo.expeditionId;
            }
            return dto;
        });

        return {
            village: this.villageService.getState(),
            inventory: this.inventoryService.getState(),
            heroes: heroesDto,
            expeditions: this.expeditionService.getExpeditions(),
            activeExpedition: activeExpedition
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
            persistence.save('settings_lang', lang);
            return true;
        }
        return false;
    }

    // --- Time & Construction ---
    nextDay() {
        const villageReport = this.villageService.nextDay();
        const expeditionResult = this.expeditionService.processDay();
        
        // --- Hero Recovery Phase ---
        const infirmaryLevel = this.villageService.getState().infrastructure.infirmary || 0;
        const healPercentage = 0.20 + (infirmaryLevel * 0.10);
        const maxHeroesHealed = 1 + Math.floor(infirmaryLevel / 2);

        const heroesNeedingHeal = this.heroService.list().filter(h => h.hp < h.maxHp);
        // Sort by lowest hp percentage first
        heroesNeedingHeal.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));

        const heroesToHeal = heroesNeedingHeal.slice(0, maxHeroesHealed);
        
        const healedLog = [];
        heroesToHeal.forEach(hero => {
            const amount = Math.floor(hero.maxHp * healPercentage);
            const actualHeal = Math.min(amount, hero.maxHp - hero.hp);
            hero.hp += actualHeal;
            healedLog.push({ heroName: hero.name, amount: actualHeal });
        });

        if (heroesToHeal.length > 0) {
            this.heroService.saveAll();
        }

        const dailyReport = {
            ...villageReport,
            expedition: expeditionResult.success ? expeditionResult.data : null,
            recovery: healedLog
        };
        
        this.villageService.setDailyReport(dailyReport);
        return dailyReport;
    }

    startProject(buildingId, targetLevel, costGold, costMaterials, duration) {
        return this.villageService.startProject(buildingId, targetLevel, costGold, costMaterials, duration);
    }

    // --- Explore Facade ---
    assignExpedition(expeditionId, heroIds) {
        return this.expeditionService.assignExpedition(expeditionId, heroIds);
    }
    unassignHero(heroId) {
        return this.expeditionService.unassignHero(heroId);
    }
    retireExpedition() {
        return this.expeditionService.retire();
    }
}
