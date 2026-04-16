import { catalogService } from './services/CatalogService.js';
import { playerService } from './services/PlayerService.js';
import { inventoryService } from './services/InventoryService.js';
import { VillageService } from './services/VillageService.js';
import { HeroService } from './services/HeroService.js';
import { WeaponShopService } from './services/WeaponShopService.js';
import { ArmorShopService } from './services/ArmorShopService.js';
import { ForgeService } from './services/ForgeService.js';
import { GymService } from './services/GymService.js';
import { BattleService } from './services/BattleService.js';
import { AdventureService } from './services/AdventureService.js';

class Engine {
    constructor() {
        this.catalog = catalogService;
        this.player = playerService;
        this.inventory = inventoryService;

        this.village = new VillageService(this.player);
        this.heroes = new HeroService(this.inventory, this.village);

        this.weaponShop = new WeaponShopService(this.player, this.inventory, this.catalog, this.village);
        this.armorShop = new ArmorShopService(this.player, this.inventory, this.catalog, this.village);
        this.forge = new ForgeService(this.player, this.village);
        this.gym = new GymService(this.player, this.village, this.heroes, this.inventory);

        this.battle = new BattleService();
        this.adventure = new AdventureService(this.player, this.heroes, this.battle);
    }

    resetAll() {
        this.player.reset();
        this.heroes.reset();
        this.inventory.reset();
        this.village.reset();
        this.battle.reset();
    }

    /**
     * Simulates an app restart by re-initializing all services from storage.
     * This is useful for testing persistence in functional tests.
     */
    restart() {
        // We re-instantiate services that are not singletons
        // For singletons like player/inventory, we need a way to reload them
        if (typeof this.player.reload === 'function') {
            this.player.reload();
        } else {
            // Fallback: manually trigger load logic if we can
            this.player.data = this.player._load();
        }

        if (typeof this.inventory.reload === 'function') {
            this.inventory.reload();
        } else {
            this.inventory.data = this.inventory._load();
        }

        this.village = new VillageService(this.player);
        this.heroes = new HeroService(this.inventory, this.village);

        this.weaponShop = new WeaponShopService(this.player, this.inventory, this.catalog, this.village);
        this.armorShop = new ArmorShopService(this.player, this.inventory, this.catalog, this.village);
        this.forge = new ForgeService(this.player, this.village);
        this.gym = new GymService(this.player, this.village, this.heroes, this.inventory);

        this.battle = new BattleService();
        this.adventure = new AdventureService(this.player, this.heroes, this.battle);
    }
}

export const engine = new Engine();
