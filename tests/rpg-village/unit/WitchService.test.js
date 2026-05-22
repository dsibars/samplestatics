globalThis.localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
    clear() {}
};

import test from 'node:test';
import assert from 'node:assert';
import { WitchService } from '../../../src/rpg-village/js/engine/witch/WitchService.js';

const mockI18n = {
    t(key) {
        const map = {
            witch_novice_1: 'Tangled threads.',
            witch_novice_2: 'Come back later.',
            witch_awakened_1: 'Spark in {name}.',
            witch_awakened_2: 'Seek glyphs.',
            witch_seeker_1: 'Fragments of power.',
            witch_seeker_2: 'Combine Fire.',
            witch_practitioner_1: 'Spells have weight.',
            witch_practitioner_2: 'Multi costs much.',
            witch_master_1: 'Path of legends {name}.',
            witch_master_2: 'Circle is infinite.',
        };
        return map[key] || key;
    }
};

test('WitchService: novice for non-mage without glyphs', () => {
    const hero = { origin: 'origin_warrior', knownGlyphs: [], spellCodex: [] };
    const result = WitchService.getDialogue(hero, mockI18n);
    assert.strictEqual(result.category, 'novice');
    assert.strictEqual(result.lines.length, 2);
});

test('WitchService: awakened for mage without glyphs', () => {
    const hero = { origin: 'origin_arcane_initiate', name: 'Elara', knownGlyphs: [], spellCodex: [] };
    const result = WitchService.getDialogue(hero, mockI18n);
    assert.strictEqual(result.category, 'awakened');
    assert.ok(result.lines[0].includes('Elara'));
});

test('WitchService: seeker for hero with glyphs', () => {
    const hero = { origin: 'origin_warrior', knownGlyphs: ['core_fire', 'power_plus', 'effect_multi'], spellCodex: [] };
    const result = WitchService.getDialogue(hero, mockI18n);
    assert.strictEqual(result.category, 'seeker');
});

test('WitchService: practitioner for hero with spells', () => {
    const hero = { origin: 'origin_warrior', knownGlyphs: ['core_fire'], spellCodex: [{ mpCost: 8 }] };
    const result = WitchService.getDialogue(hero, mockI18n);
    assert.strictEqual(result.category, 'practitioner');
});

test('WitchService: master for hero with powerful spells', () => {
    const hero = { origin: 'origin_warrior', name: 'Mira', knownGlyphs: ['core_fire'], spellCodex: [{ mpCost: 35 }], magicTier: 13 };
    const result = WitchService.getDialogue(hero, mockI18n);
    assert.strictEqual(result.category, 'master');
    assert.ok(result.lines[0].includes('Mira'));
});
