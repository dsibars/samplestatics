globalThis.localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
    clear() {}
};

import test from 'node:test';
import assert from 'node:assert';
import { MagicCircleService } from '../../../src/rpg-village/js/engine/magic_circle/MagicCircleService.js';
import { Hero } from '../../../src/rpg-village/js/engine/heroes/models/Hero.js';

test('MagicCircle: compose simple spell', () => {
    const result = MagicCircleService.compose(['core_fire', 'power_plus'], 2);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.element, 'fire');
    assert.ok(result.data.mpCost >= 5);
    assert.ok(result.data.damage > 12);
});

test('MagicCircle: compose multi-target spell', () => {
    const result = MagicCircleService.compose(['core_fire', 'power_plus2', 'effect_multi'], 3);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.targetType, 'all_enemies');
    assert.ok(result.data.mpCost >= 10); // 5 * 1.30 * 2.50 = ~16
});

test('MagicCircle: compose with efficiency reduces cost', () => {
    const withoutEff = MagicCircleService.compose(['core_fire', 'power_plus2'], 2);
    const withEff = MagicCircleService.compose(['core_fire', 'power_plus2', 'efficiency_stream'], 3);
    assert.ok(withEff.data.mpCost < withoutEff.data.mpCost);
});

test('MagicCircle: fails without core', () => {
    const result = MagicCircleService.compose(['power_plus']);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_no_core_glyph');
});

test('MagicCircle: fails with too many glyphs', () => {
    const result = MagicCircleService.compose(['core_fire', 'power_plus', 'power_plus2', 'effect_multi', 'efficiency_stream'], 3);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_too_many_glyphs');
});

test('MagicCircle: getAvailableGlyphs filters by tier', () => {
    const tier1 = MagicCircleService.getAvailableGlyphs(1);
    const tier2 = MagicCircleService.getAvailableGlyphs(2);
    const tier3 = MagicCircleService.getAvailableGlyphs(3);
    assert.ok(tier1.length < tier2.length);
    assert.ok(tier2.length < tier3.length);
});

test('MagicCircle: getMagicTier from XP', () => {
    assert.strictEqual(MagicCircleService.getMagicTier(0), 1);
    assert.strictEqual(MagicCircleService.getMagicTier(500), 2);
    assert.strictEqual(MagicCircleService.getMagicTier(1300), 3);
    assert.strictEqual(MagicCircleService.getMagicTier(2500), 4);
    assert.strictEqual(MagicCircleService.getMagicTier(6800), 6);
    assert.strictEqual(MagicCircleService.getMagicTier(10300), 7);
    assert.strictEqual(MagicCircleService.getMagicTier(100000), 14);
});

test('MagicCircle: arcane initiate gets default glyphs', () => {
    const hero = new Hero({ name: 'Elara', origin: 'origin_arcane_initiate', level: 1, statPoints: 5 });
    assert.ok(hero.knownGlyphs.includes('core_fire'));
    assert.ok(hero.knownGlyphs.includes('power_plus'));
});

test('MagicCircle: non-mage starts with no glyphs', () => {
    const hero = new Hero({ name: 'Grom', origin: 'origin_warrior', level: 1, statPoints: 5 });
    assert.strictEqual(hero.knownGlyphs.length, 0);
});

test('MagicCircle: hero spell codex persisted', () => {
    const hero = new Hero({ name: 'Elara', origin: 'origin_arcane_initiate', level: 1, statPoints: 5 });
    hero.spellCodex = [{ id: 's1', name: 'Fireball', mpCost: 6, damage: 14, element: 'fire' }];
    const json = hero.toJSON();
    assert.deepStrictEqual(json.spellCodex, [{ id: 's1', name: 'Fireball', mpCost: 6, damage: 14, element: 'fire' }]);
});
