import { catalogService } from './services/CatalogService.js';
import { playerService } from './services/PlayerService.js';
import { heroService } from './services/HeroService.js';
import { inventoryService } from './services/InventoryService.js';
import { VillageService } from './services/VillageService.js';
import { WeaponShopService } from './services/WeaponShopService.js';
import { ArmorShopService } from './services/ArmorShopService.js';
import { ForgeService } from './services/ForgeService.js';
import { GymService } from './services/GymService.js';

class Engine {
    constructor() {
        this.catalog = catalogService;
        this.player = playerService;
        this.heroes = heroService;
        this.inventory = inventoryService;

        this.village = new VillageService(this.player);
        this.weaponShop = new WeaponShopService(this.player, this.inventory, this.catalog, this.village);
        this.armorShop = new ArmorShopService(this.player, this.inventory, this.catalog, this.village);
        this.forge = new ForgeService(this.player, this.village);
        this.gym = new GymService(this.player, this.village, this.heroes, this.inventory);
    }

    resetAll() {
        this.player.reset();
        this.heroes.reset();
        this.inventory.reset();
        this.village.reset();
    }
}

export const engine = new Engine();
