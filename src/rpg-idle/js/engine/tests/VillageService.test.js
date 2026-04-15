import test from 'node:test';
import assert from 'node:assert';
import { VillageService } from '../services/VillageService.js';

const mockPlayer = {
    cores: 1000,
    spendCores(amount) {
        if (this.cores >= amount) {
            this.cores -= amount;
            return { success: true };
        }
        return { success: false };
    }
};

globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

test('VillageService: Upgrade Building', () => {
    const village = new VillageService(mockPlayer);
    const initialLevel = village.getBuildingLevel('gymLevel');
    const cost = village.getUpgradeCost('gymLevel');

    const result = village.upgradeBuilding('gymLevel');

    assert.strictEqual(result.success, true);
    assert.strictEqual(village.getBuildingLevel('gymLevel'), initialLevel + 1);
});

test('VillageService: Max Level Reached', () => {
    const village = new VillageService(mockPlayer);
    // Force level to max (4 for rosterSizeLevel)
    village.data.buildings.rosterSizeLevel = 4;

    const result = village.upgradeBuilding('rosterSizeLevel');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_max_level');
});
