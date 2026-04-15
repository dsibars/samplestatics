import { Result } from '../core/Result.js';

export class ForgeService {
    constructor(playerService, villageService) {
        this.player = playerService;
        this.village = villageService;
    }

    isUnlocked() {
        return this.village.getBuildingLevel('forgeLevel') > 0;
    }

    upgradeCost() {
        return this.village.getUpgradeCost('forgeLevel');
    }

    upgradeVillageBuilding() {
        return this.village.upgradeBuilding('forgeLevel');
    }

    getLevelUpCost(item) {
        return Math.round(100 * Math.pow(1.5, item.level || 0));
    }

    levelUpItem(item) {
        const cost = this.getLevelUpCost(item);
        const result = this.player.spendGold(cost);
        if (result.success) {
            item.increaseLevel();
            return Result.ok(item);
        }
        return result;
    }

    getAwakenCost() {
        return 50;
    }

    canAwaken(item) {
        return item.level >= 10 || item.material === 'gold' || item.material === 'mythril';
    }

    awakenItem(item) {
        if (!this.canAwaken(item)) return Result.fail('error_requirements_not_met');

        const cost = this.getAwakenCost();
        const result = this.player.spendCores(cost);

        if (result.success) {
            const AFFIXES = ['vampire', 'sage', 'titan', 'assassin', 'phoenix'];
            const affix = AFFIXES[Math.floor(Math.random() * AFFIXES.length)];
            item.addAffix(affix);
            return Result.ok({ item, affix });
        }
        return result;
    }
}
