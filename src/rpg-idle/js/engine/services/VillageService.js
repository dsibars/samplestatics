import { persistence } from '../core/Persistence.js';
import { Result } from '../core/Result.js';

export class VillageService {
    constructor(playerService) {
        this.STORAGE_KEY = 'village_data';
        this.player = playerService;
        this.data = this._load();
    }

    _load() {
        const defaultData = {
            buildings: {
                rosterSizeLevel: 0,
                partySizeLevel: 0,
                gymLevel: 0,
                weaponShopLevel: 0,
                armorShopLevel: 0,
                forgeLevel: 0
            }
        };
        return persistence.load(this.STORAGE_KEY, defaultData);
    }

    save() {
        persistence.save(this.STORAGE_KEY, this.data);
    }

    getBuildingLevel(id) {
        return this.data.buildings[id] || 0;
    }

    getUpgradeCost(id) {
        const level = this.getBuildingLevel(id);
        if (id === 'gymLevel') {
            return 5 + level;
        } else {
            return 5 * Math.pow(10, level);
        }
    }

    upgradeBuilding(id) {
        const cost = this.getUpgradeCost(id);

        // Limits from existing code
        const level = this.getBuildingLevel(id);
        if (id === 'rosterSizeLevel' && level >= 4) return Result.fail('error_max_level');
        if (id === 'partySizeLevel' && level >= 3) return Result.fail('error_max_level');
        if (id === 'gymLevel' && level >= 50) return Result.fail('error_max_level');
        if (id === 'weaponShopLevel' && level >= 5) return Result.fail('error_max_level');
        if (id === 'armorShopLevel' && level >= 5) return Result.fail('error_max_level');
        if (id === 'forgeLevel' && level >= 1) return Result.fail('error_max_level');

        const result = this.player.spendCores(cost);
        if (result.success) {
            this.data.buildings[id] = level + 1;
            this.save();
            return Result.ok(this.data.buildings[id]);
        }
        return result;
    }

    reset() {
        this.data = {
            buildings: {
                rosterSizeLevel: 0,
                partySizeLevel: 0,
                gymLevel: 0,
                weaponShopLevel: 0,
                armorShopLevel: 0,
                forgeLevel: 0
            }
        };
        this.save();
    }
}
