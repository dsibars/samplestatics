globalThis.localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
    clear() {}
};

import test from 'node:test';
import assert from 'node:assert';
import { Hero } from '../../../src/rpg-village/js/engine/heroes/models/Hero.js';

test('InfiniteTier: technique use increments counter', () => {
    const hero = new Hero({ name: 'Test', origin: 'origin_warrior', level: 1, statPoints: 5 });
    hero.recordTechniqueUse('multiple_attack');
    assert.strictEqual(hero.techniqueUses['multiple_attack'], 1);
});

test('InfiniteTier: evolution at threshold', () => {
    const hero = new Hero({ name: 'Test', origin: 'origin_warrior', level: 1, statPoints: 5 });
    // Threshold for tier 2 is 100 uses
    hero.techniqueUses['multiple_attack'] = 99;
    const result = hero.recordTechniqueUse('multiple_attack');
    assert.ok(result);
    assert.strictEqual(result.fromTier, 1);
    assert.strictEqual(result.toTier, 2);
    assert.strictEqual(hero.techniqueTiers['multiple_attack'], 2);
});

test('InfiniteTier: no evolution before threshold', () => {
    const hero = new Hero({ name: 'Test', origin: 'origin_warrior', level: 1, statPoints: 5 });
    hero.techniqueUses['multiple_attack'] = 50;
    const result = hero.recordTechniqueUse('multiple_attack');
    assert.strictEqual(result, null);
    assert.strictEqual(hero.techniqueTiers['multiple_attack'], undefined);
});

test('InfiniteTier: tier thresholds grow exponentially', () => {
    const hero = new Hero({ name: 'Test', origin: 'origin_warrior', level: 1, statPoints: 5 });
    // Tier 2: 100, Tier 3: 300, Tier 4: 900
    hero.techniqueUses['power_strike'] = 99;
    let result = hero.recordTechniqueUse('power_strike');
    assert.ok(result);
    assert.strictEqual(result.toTier, 2);

    hero.techniqueUses['power_strike'] = 299;
    result = hero.recordTechniqueUse('power_strike');
    assert.ok(result);
    assert.strictEqual(result.toTier, 3);
});

test('InfiniteTier: techniqueTiers persisted in toJSON', () => {
    const hero = new Hero({ name: 'Test', origin: 'origin_warrior', level: 1, statPoints: 5 });
    hero.techniqueUses['cleave'] = 150;
    hero.techniqueTiers['cleave'] = 2;
    const json = hero.toJSON();
    assert.deepStrictEqual(json.techniqueUses, { cleave: 150 });
    assert.deepStrictEqual(json.techniqueTiers, { cleave: 2 });
});
