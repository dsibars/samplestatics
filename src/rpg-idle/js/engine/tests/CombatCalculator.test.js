import test from 'node:test';
import assert from 'node:assert';
import { CombatCalculator } from '../core/CombatCalculator.js';

test('CombatCalculator: Damage Multiplier', () => {
    // R >= 10
    assert.strictEqual(CombatCalculator.calculateDamageMultiplier(100, 10), 1.0);
    assert.strictEqual(CombatCalculator.calculateDamageMultiplier(200, 10), 2.0);

    // R >= 5
    assert.strictEqual(CombatCalculator.calculateDamageMultiplier(50, 10), 1.0);
    assert.strictEqual(CombatCalculator.calculateDamageMultiplier(99, 10), 1.0);

    // R = 1
    assert.strictEqual(CombatCalculator.calculateDamageMultiplier(10, 10), 0.5);

    // R < 1
    assert.strictEqual(CombatCalculator.calculateDamageMultiplier(5, 10), 0.25);
});

test('CombatCalculator: Elemental Multiplier', () => {
    // Fire beats Wind
    assert.strictEqual(CombatCalculator.getElementMultiplier('fire', 'wind'), 1.5);
    // Wind loses to Fire
    assert.strictEqual(CombatCalculator.getElementMultiplier('wind', 'fire'), 0.5);
    // Neutral
    assert.strictEqual(CombatCalculator.getElementMultiplier('fire', 'neutral'), 1.0);
    assert.strictEqual(CombatCalculator.getElementMultiplier('fire', 'water'), 0.5); // Water beats Fire
});

test('CombatCalculator: Evasion Chance', () => {
    // Attacker speed 10, Defender speed 10 -> R=1. (1-0.5)*20 = 10%
    assert.strictEqual(CombatCalculator.calculateEvasionChance({ speed: 10 }, { speed: 10 }), 10);

    // Attacker speed 10, Defender speed 5 -> R=0.5. (0.5-0.5)*20 = 0%
    assert.strictEqual(CombatCalculator.calculateEvasionChance({ speed: 10 }, { speed: 5 }), 0);

    // Attacker speed 10, Defender speed 20 -> R=2. 10 + (2*10) = 30%
    assert.strictEqual(CombatCalculator.calculateEvasionChance({ speed: 10 }, { speed: 20 }), 30);
});
