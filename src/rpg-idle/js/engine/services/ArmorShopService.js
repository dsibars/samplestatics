import { Result } from '../core/Result.js';

export class ArmorShopService {
    constructor(playerService, inventoryService, catalogService, villageService) {
        this.player = playerService;
        this.inventory = inventoryService;
        this.catalog = catalogService;
        this.village = villageService;
    }

    isUnlocked() {
        return this.village.getBuildingLevel('armorShopLevel') > 0;
    }

    getLevel() {
        return this.village.getBuildingLevel('armorShopLevel');
    }

    getUpgradeCost() {
        return this.village.getUpgradeCost('armorShopLevel');
    }

    upgrade() {
        return this.village.upgradeBuilding('armorShopLevel');
    }

    buy(archetypeId, materialId, slot) {
        if (!this.isUnlocked()) return Result.fail('error_shop_locked');

        const material = this.catalog.getMaterial(materialId);
        if (!material) return Result.fail('error_invalid_material');

        if (material.levelReq > this.getLevel()) return Result.fail('error_tier_locked');

        const cost = 80 * material.mult;
        const result = this.player.spendGold(cost);

        if (result.success) {
            const armor = {
                type: 'armor',
                material: materialId,
                archetype: archetypeId,
                slot: slot,
                level: 0
            };
            return this.inventory.addEquipment(armor);
        }

        return result;
    }
}
