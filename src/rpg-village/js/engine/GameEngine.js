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
import { Result } from './shared/core/Result.js';

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

        // Resume combat if active
        if (this.expeditionService.state.activeExpedition && this.expeditionService.state.activeExpedition.status === 'combat') {
            console.log('Engine: Resuming active combat...');
            this.expeditionService.resumeActiveBattle();
        }
    }


    initNewGame() {
        console.log('Engine: Initializing New Game state...');
        
        // Add starting hero if not exists
        const currentHeroes = this.heroService.list();
        if (currentHeroes.length === 0) {
            this.heroService.add({
                name: "Arthur",
                origin: "origin_warrior",
                avatar: "arthur.png",
                level: 1,
                statPoints: 5
            });
        }
    }

    activateDeveloperCheat() {
        console.warn('🚀 Engine: Developer Cheat Activated!');

        // 1. Add 10,000 gold
        this.villageService.addGold(10000);
        this.villageService.save();

        // 2. Add 10,000 wood and 10,000 stone (bypass storage limits)
        const inv = this.inventoryService;
        inv.data.materials['material_wood'] = (inv.data.materials['material_wood'] || 0) + 10000;
        inv.data.materials['material_stone'] = (inv.data.materials['material_stone'] || 0) + 10000;
        inv.save();

        // 3. Grant 5,000 XP to all heroes (causes level ups)
        this.heroService.heroes.forEach(hero => {
            hero.addExperience(5000);
        });
        this.heroService.saveAll();

        // 4. Unlock the shop by marking tutorial cave as completed (if not already)
        const expState = this.expeditionService.state;
        if (!expState.completedIds.includes('exp_tutorial_cave')) {
            expState.completedIds.push('exp_tutorial_cave');
            // Remove tutorial cave from available nodes so it isn't shown as available
            const region = expState.regions['reg_greenfields'];
            if (region) {
                region.availableNodes = region.availableNodes.filter(n => n.id !== 'exp_tutorial_cave');
                region.clears = (region.clears || 0) + 1;
                // Generate next story/procedural nodes
                this.expeditionService._generateNextNodes('reg_greenfields');
            }
            this.expeditionService.save();
        }

        return Result.ok();
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

        const activeBattle = (this.battleService.heroes && this.battleService.heroes.length > 0) ? {
            heroes: this.battleService.heroes.map(h => h.toJSON()),
            enemies: this.battleService.enemies.map(e => e.toJSON()),
            turnOrder: this.battleService.turnOrder.map(e => ({ id: e.id, name: e.name, type: (e.origin !== undefined || e.type === 'Hero') ? 'Hero' : 'Enemy' })),
            currentTurnIndex: this.battleService.currentTurnIndex,
            log: [...this.battleService.log],
            isOver: this.battleService.isOver,
            autoBattle: this.battleService.autoBattle,
            itemUsedThisTurn: this.battleService.itemUsedThisTurn
        } : null;

        return {
            village: this.villageService.getState(),
            inventory: this.inventoryService.getState(),
            heroes: heroesDto,
            expeditions: this.expeditionService.getExpeditions(),
            activeExpedition: activeExpedition,
            completedExpeditions: this.expeditionService.state.completedIds || [],
            activeBattle
        };
    }

    // --- Hero Facade ---
    addHero(heroData) {
        return this.heroService.add(heroData);
    }

    getHeroes() {
        return this.heroService.list();
    }

    increaseHeroStat(heroId, statId) {
        const activityInfo = this.expeditionService.getHeroActivity(heroId);
        if (activityInfo && activityInfo.type === 'expedition') {
            return Result.fail('error_hero_busy');
        }
        return this.heroService.increaseHeroStat(heroId, statId);
    }

    equipHeroItem(heroId, slot, equipmentId) {
        const activityInfo = this.expeditionService.getHeroActivity(heroId);
        if (activityInfo && activityInfo.type === 'expedition') {
            return Result.fail('error_hero_busy');
        }
        return this.heroService.equipItem(heroId, slot, equipmentId);
    }

    unequipHeroItem(heroId, slot) {
        const activityInfo = this.expeditionService.getHeroActivity(heroId);
        if (activityInfo && activityInfo.type === 'expedition') {
            return Result.fail('error_hero_busy');
        }
        return this.heroService.unequipItem(heroId, slot);
    }

    // --- Shop & Forge Facade ---

    // Sell prices per unit (intentionally low)
    static SELL_PRICES = {
        'food_raw_grain':  1,
        'material_wood':   2,
        'material_stone':  3
    };

    buyItem(itemData, costGold) {
        if (this.villageService.state.gold < costGold) {
            return Result.fail('error_not_enough_gold');
        }

        const maxStorage = this.villageService.getMaxStorage();
        if (this.inventoryService.getTotalStorageUsed() + 1 > maxStorage) {
            return Result.fail('error_storage_full');
        }

        // Deduct Gold
        this.villageService.state.gold -= costGold;
        this.villageService.save();

        // Deliver item
        if (itemData.type === 'consumable') {
            this.inventoryService.addItem(itemData.id, 1);
        } else {
            this.inventoryService.addEquipment(itemData);
        }

        return Result.ok();
    }

    /**
     * Sell a raw resource (food, wood, stone) for gold.
     * @param {string} resourceId  - e.g. 'material_wood'
     * @param {number} quantity    - number of units to sell (1 / 10 / 100)
     */
    sellResource(resourceId, quantity) {
        const pricePerUnit = GameEngine.SELL_PRICES[resourceId];
        if (!pricePerUnit) {
            return Result.fail('error_item_not_found');
        }

        const available = this.inventoryService.getItemCount(resourceId);
        const toSell = Math.min(quantity, available);
        if (toSell <= 0) {
            return Result.fail('error_not_enough_items');
        }

        // Remove resources
        this.inventoryService.useItem(resourceId, toSell);

        // Grant gold
        const goldEarned = toSell * pricePerUnit;
        this.villageService.addGold(goldEarned);

        return Result.ok({ sold: toSell, goldEarned });
    }

    /**
     * Sell an inventory item (equipment or consumable) for gold.
     * @param {string} itemId    - Unique item ID or consumable ID
     * @param {string} itemType  - 'consumable' | 'equipment'
     * @param {number} sellPrice - Calculated sell price (gold)
     */
    sellItem(itemId, itemType, sellPrice) {
        if (itemType === 'consumable') {
            const result = this.inventoryService.useItem(itemId, 1);
            if (!result.success) return result;
        } else {
            const result = this.inventoryService.removeEquipment(itemId);
            if (!result.success) return result;
        }

        this.villageService.addGold(sellPrice);
        return Result.ok({ goldEarned: sellPrice });
    }

    getRefineCost(item) {
        const L = item.level || 0;
        const nextLevel = L + 1;
        const mat = item.material;
        
        const cost = {
            gold: 0,
            materials: {}
        };
        
        if (mat === 'wooden') {
            cost.gold = 30 * nextLevel;
            cost.materials.material_wood = 10 * nextLevel;
        } else if (mat === 'iron') {
            cost.gold = 75 * nextLevel;
            cost.materials.material_wood = 5 * nextLevel;
            cost.materials.material_stone = 5 * nextLevel;
            cost.materials.material_iron_ore = 3 * nextLevel;
        } else if (mat === 'steel') {
            cost.gold = 150 * nextLevel;
            cost.materials.material_stone = 10 * nextLevel;
            cost.materials.material_steel_ingot = 3 * nextLevel;
        } else if (mat === 'gold') {
            cost.gold = 300 * nextLevel;
            cost.materials.material_stone = 15 * nextLevel;
        } else if (mat === 'mythril') {
            cost.gold = 500 * nextLevel;
            cost.materials.material_mythril = 2 * nextLevel;
        }
        
        return cost;
    }

    refineEquipment(itemId) {
        let item = this.inventoryService.getEquipment(itemId);
        let equippedHero = null;
        let equippedSlot = null;

        if (!item) {
            // Check all heroes
            for (const h of this.heroService.list()) {
                for (const slot of ['head', 'body', 'legs', 'leftHand', 'rightHand', 'accessory']) {
                    const eq = h.equipment[slot];
                    if (eq && eq.id === itemId) {
                        item = eq; // Plain object representation of the equipment
                        equippedHero = h;
                        equippedSlot = slot;
                        break;
                    }
                }
                if (item) break;
            }
        }

        if (!item) return Result.fail('error_item_not_found');
        if (item.level >= 10) return Result.fail('error_refine_max');

        const cost = this.getRefineCost(item);

        // Validate resources
        if (this.villageService.state.gold < cost.gold) {
            return Result.fail('error_not_enough_gold');
        }

        for (const [matId, qty] of Object.entries(cost.materials)) {
            if (this.inventoryService.getItemCount(matId) < qty) {
                return Result.fail('error_not_enough_materials');
            }
        }

        // Spend resources
        this.villageService.state.gold -= cost.gold;
        this.villageService.save();

        for (const [matId, qty] of Object.entries(cost.materials)) {
            this.inventoryService.useItem(matId, qty);
        }

        // Increase level
        if (equippedHero) {
            item.level = (item.level || 0) + 1;
            equippedHero.recalculateStats({});
            this.heroService.saveAll();
        } else {
            item.increaseLevel();
            this.inventoryService.save();
        }

        return Result.ok(item);
    }

    // --- Combat Facade ---
    startBattle(enemies) {
        const activeHeroes = this.heroService.list('active');
        return this.battleService.startBattle(activeHeroes, enemies);
    }

    nextBattleTurn() {
        return this.battleService.nextTurn();
    }

    executeBattleAction(skillId, targetIndex = null) {
        const actor = this.battleService.turnOrder[this.battleService.currentTurnIndex];
        if (!actor) return Result.fail('error_no_active_actor');
        return this.battleService.executeAction(actor, skillId, targetIndex);
    }

    useBattleConsumable(consumableId, targetId = null) {
        const actor = this.battleService.turnOrder[this.battleService.currentTurnIndex];
        if (!actor) return Result.fail('error_no_active_actor');
        return this.battleService.useConsumable(actor, consumableId, targetId);
    }

    skipBattle() {
        if (!this.battleService.isOver) {
            this.battleService.autoBattle = true;
            while (!this.battleService.isOver) {
                this.battleService.nextTurn();
            }
        }
        return Result.ok({ skipped: true });
    }

    getBattleResolutionPreview() {
        return this.expeditionService.getBattleResolutionPreview();
    }

    resolveBattle() {
        return this.expeditionService.resolveBattle();
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
