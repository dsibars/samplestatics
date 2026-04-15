import { Result } from '../core/Result.js';

export class WeaponShopService {
    constructor(playerService, inventoryService, catalogService, villageService) {
        this.player = playerService;
        this.inventory = inventoryService;
        this.catalog = catalogService;
        this.village = villageService;
    }

    isUnlocked() {
        return this.village.getBuildingLevel('weaponShopLevel') > 0;
    }

    getLevel() {
        return this.village.getBuildingLevel('weaponShopLevel');
    }

    getUpgradeCost() {
        return this.village.getUpgradeCost('weaponShopLevel');
    }

    upgrade() {
        return this.village.upgradeBuilding('weaponShopLevel');
    }

    buy(familyId, materialId) {
        if (!this.isUnlocked()) return Result.fail('error_shop_locked');

        const material = this.catalog.getMaterial(materialId);
        if (!material) return Result.fail('error_invalid_material');

        if (material.levelReq > this.getLevel()) return Result.fail('error_tier_locked');

        const cost = 100 * material.mult;
        const result = this.player.spendGold(cost);

        if (result.success) {
            const weapon = {
                type: 'weapon',
                material: materialId,
                family: familyId,
                level: 0
            };
            return this.inventory.addEquipment(weapon);
        }

        return result;
    }
}
