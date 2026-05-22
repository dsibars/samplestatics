globalThis.localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
    clear() {}
};

import test from 'node:test';
import assert from 'node:assert';
import { Hero } from '../../../src/rpg-village/js/engine/heroes/models/Hero.js';
import { HeroService } from '../../../src/rpg-village/js/engine/heroes/services/HeroService.js';
import { InventoryService } from '../../../src/rpg-village/js/engine/shared/inventory/services/InventoryService.js';

test('MageOrigin: arcane_initiate has high magicPower multiplier', () => {
    const hero = new Hero({ name: 'Elara', origin: 'origin_arcane_initiate', level: 1, statPoints: 5 });
    const mults = hero.getTraitMultipliers();
    assert.strictEqual(mults.magicPower, 1.25);
    assert.strictEqual(mults.maxMp, 1.20);
});

test('MageOrigin: arcane_initiate has low strength/defense', () => {
    const hero = new Hero({ name: 'Elara', origin: 'origin_arcane_initiate', level: 1, statPoints: 5 });
    const mults = hero.getTraitMultipliers();
    assert.strictEqual(mults.strength, 0.85);
    assert.strictEqual(mults.defense, 0.90);
});

test('MageOrigin: arcane_initiate in random origins pool', () => {
    assert.ok(HeroService.HERO_ORIGINS.includes('origin_arcane_initiate'));
});

test('MageOrigin: generateRandomHero can produce mage', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    // Mock random to force mage origin
    const origRandom = Math.random;
    let callCount = 0;
    Math.random = () => {
        callCount++;
        // First call is for name index, second for origin index
        // Return value that selects the last origin (arcane_initiate)
        if (callCount % 2 === 0) return 0.999; // origin: force last index
        return 0.5; // name: middle index
    };
    const result = service.generateRandomHero();
    Math.random = origRandom;
    assert.strictEqual(result.data.origin, 'origin_arcane_initiate');
});
