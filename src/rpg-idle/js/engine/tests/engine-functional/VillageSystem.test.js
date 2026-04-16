import test from 'node:test';
import assert from 'node:assert';

// Mock LocalStorage
class MockLocalStorage {
    constructor() { this.store = {}; }
    getItem(key) { return this.store[key] || null; }
    setItem(key, value) { this.store[key] = value.toString(); }
    removeItem(key) { delete this.store[key]; }
    clear() { this.store = {}; }
    key(index) { return Object.keys(this.store)[index]; }
    get length() { return Object.keys(this.store).length; }
}

const mockLS = new MockLocalStorage();
Object.defineProperty(globalThis, 'localStorage', { value: mockLS, writable: true, configurable: true });

if (!globalThis.crypto) globalThis.crypto = {};
if (!globalThis.crypto.randomUUID) globalThis.crypto.randomUUID = () => Math.random().toString(36).substring(2);

// Import engine
const { engine } = await import('../../Engine.js');

test('Village System Functional Test', async (t) => {
    mockLS.clear();
    engine.resetAll();

    // 1. Initial state check: All buildings locked
    assert.strictEqual(engine.village.getBuildingLevel('weaponShopLevel'), 0);
    assert.strictEqual(engine.village.getBuildingLevel('armorShopLevel'), 0);
    assert.strictEqual(engine.village.getBuildingLevel('forgeLevel'), 0);
    assert.strictEqual(engine.village.getBuildingLevel('gymLevel'), 0);

    // Actions should fail when locked
    const buyRes = engine.weaponShop.buy('sword', 'wooden');
    assert.strictEqual(buyRes.success, false, 'Should not be able to buy from locked shop');
    assert.strictEqual(buyRes.error, 'error_shop_locked');

    const trainRes = engine.gym.startTraining('h1', 'light_sparring');
    assert.strictEqual(trainRes.success, false, 'Should not be able to train in locked gym');

    // 2. Unlock and Upgrade
    // Give cores to upgrade
    engine.player.addCores(100);

    // Upgrade Weapon Shop
    const upgradeRes = engine.weaponShop.upgrade();
    assert.strictEqual(upgradeRes.success, true);
    assert.strictEqual(engine.village.getBuildingLevel('weaponShopLevel'), 1);
    assert.strictEqual(engine.weaponShop.isUnlocked(), true);

    // Now buying should work (with enough gold)
    engine.player.addGold(1000);
    const buyRes2 = engine.weaponShop.buy('sword', 'wooden');
    assert.strictEqual(buyRes2.success, true, 'Buying should work after unlock');
    assert.ok(engine.inventory.listEquipment().length > 0);

    // 3. Tier Locking
    // At level 1, should not be able to buy iron (requires level 2)
    const buyIronRes = engine.weaponShop.buy('broadsword', 'iron');
    assert.strictEqual(buyIronRes.success, false, 'Should not be able to buy iron at shop level 1');
    assert.strictEqual(buyIronRes.error, 'error_tier_locked');

    // Upgrade to level 2
    engine.weaponShop.upgrade();
    assert.strictEqual(engine.village.getBuildingLevel('weaponShopLevel'), 2);
    const buyIronRes2 = engine.weaponShop.buy('broadsword', 'iron');
    assert.strictEqual(buyIronRes2.success, true, 'Should be able to buy iron at shop level 2');

    // 4. Persistence Check
    console.log('--- Simulating App Restart for Village ---');
    engine.restart();

    assert.strictEqual(engine.village.getBuildingLevel('weaponShopLevel'), 2, 'Shop level should persist');
    assert.strictEqual(engine.weaponShop.isUnlocked(), true, 'Unlock state should persist');
    assert.strictEqual(engine.inventory.listEquipment().length, 2, 'Purchased items should persist');

    // 5. Upgrade other buildings
    engine.village.upgradeBuilding('gymLevel');
    assert.strictEqual(engine.gym.isUnlocked(), true);

    engine.village.upgradeBuilding('forgeLevel');
    assert.strictEqual(engine.forge.isUnlocked(), true);
});
