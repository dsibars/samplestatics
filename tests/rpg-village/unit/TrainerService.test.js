globalThis.localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
    clear() {}
};

import test from 'node:test';
import assert from 'node:assert';
import { TrainerService } from '../../../src/rpg-village/js/engine/trainer/TrainerService.js';

const mockI18n = {
    t(key) {
        const map = {
            family_multiple_attack: 'Multiple Attack',
            family_power_strike: 'Power Strike',
            trainer_no_family_1: 'No family.',
            trainer_no_family_2: 'Equip something.',
            trainer_far_1: 'Weak {family}.',
            trainer_far_2: 'Use it more.',
            trainer_approaching_1: 'Improving {family}.',
            trainer_approaching_2: 'Push harder.',
            trainer_near_1: 'Close {family}.',
            trainer_near_2: 'Do not stop.',
            trainer_high_tier_1: 'Tier {tier} {family}.',
            trainer_high_tier_2: 'Legends forged.',
        };
        return map[key] || key;
    }
};

test('TrainerService: no family dialogue', () => {
    const hero = { techniqueUses: {}, techniqueTiers: {} };
    const result = TrainerService.getDialogue(hero, mockI18n);
    assert.strictEqual(result.category, 'no_family');
    assert.strictEqual(result.lines.length, 2);
    assert.ok(result.lines[0].includes('No family'));
});

test('TrainerService: far progress dialogue', () => {
    const hero = { techniqueUses: { multiple_attack: 10 }, techniqueTiers: { multiple_attack: 1 } };
    const result = TrainerService.getDialogue(hero, mockI18n);
    assert.strictEqual(result.category, 'far');
    assert.ok(result.lines[0].includes('Multiple Attack'));
});

test('TrainerService: approaching progress dialogue', () => {
    // Threshold for tier 2 is 100, 50 uses = 50% progress
    const hero = { techniqueUses: { multiple_attack: 50 }, techniqueTiers: { multiple_attack: 1 } };
    const result = TrainerService.getDialogue(hero, mockI18n);
    assert.strictEqual(result.category, 'approaching');
});

test('TrainerService: near progress dialogue', () => {
    // 80 uses = 80% progress
    const hero = { techniqueUses: { multiple_attack: 80 }, techniqueTiers: { multiple_attack: 1 } };
    const result = TrainerService.getDialogue(hero, mockI18n);
    assert.strictEqual(result.category, 'near');
});

test('TrainerService: high tier dialogue', () => {
    const hero = { techniqueUses: { power_strike: 5000 }, techniqueTiers: { power_strike: 5 } };
    const result = TrainerService.getDialogue(hero, mockI18n);
    assert.strictEqual(result.category, 'high_tier');
    assert.ok(result.lines[0].includes('5'));
    assert.ok(result.lines[0].includes('Power Strike'));
});

test('TrainerService: picks best progress across families', () => {
    const hero = {
        techniqueUses: { multiple_attack: 10, power_strike: 80 },
        techniqueTiers: { multiple_attack: 1, power_strike: 1 }
    };
    const result = TrainerService.getDialogue(hero, mockI18n);
    // power_strike at 80/100 = 80% → near category
    assert.strictEqual(result.category, 'near');
    assert.ok(result.lines[0].includes('Power Strike'));
});
