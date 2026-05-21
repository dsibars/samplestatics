globalThis.localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
    clear() {}
};

import test from 'node:test';
import assert from 'node:assert';
import { CombatCalculator } from '../../../src/rpg-village/js/engine/shared/combat/core/CombatCalculator.js';

// --- Damage Multiplier Tests ---

test('CombatCalculator: damage multiplier R < 1', () => {
    assert.strictEqual(CombatCalculator.calculateDamageMultiplier(5, 10), 0.25); // R=0.5 → 0.5*0.5
    assert.strictEqual(CombatCalculator.calculateDamageMultiplier(1, 10), 0.05); // R=0.1
});

test('CombatCalculator: damage multiplier R = 1', () => {
    assert.strictEqual(CombatCalculator.calculateDamageMultiplier(10, 10), 0.5);
});

test('CombatCalculator: damage multiplier 1 < R < 2', () => {
    assert.strictEqual(CombatCalculator.calculateDamageMultiplier(15, 10), 0.625); // R=1.5 → 0.5+0.5*0.25
});

test('CombatCalculator: damage multiplier R = 2', () => {
    assert.strictEqual(CombatCalculator.calculateDamageMultiplier(20, 10), 0.75);
});

test('CombatCalculator: damage multiplier 2 < R < 4', () => {
    // R=3 → 0.75 + (3-2)*0.075 = 0.825
    assert.ok(CombatCalculator.calculateDamageMultiplier(30, 10) > 0.82);
    assert.ok(CombatCalculator.calculateDamageMultiplier(30, 10) < 0.83);
});

test('CombatCalculator: damage multiplier R = 4', () => {
    assert.strictEqual(CombatCalculator.calculateDamageMultiplier(40, 10), 0.9);
});

test('CombatCalculator: damage multiplier 4 < R < 5', () => {
    // R=4.5 → 0.9 + 0.5*0.1 = 0.95
    const result = CombatCalculator.calculateDamageMultiplier(45, 10);
    assert.ok(Math.abs(result - 0.95) < 0.0001);
});

test('CombatCalculator: damage multiplier R = 5', () => {
    assert.strictEqual(CombatCalculator.calculateDamageMultiplier(50, 10), 1.0);
});

test('CombatCalculator: damage multiplier 5 < R < 10', () => {
    assert.strictEqual(CombatCalculator.calculateDamageMultiplier(80, 10), 1.0); // R=8 still 1.0
});

test('CombatCalculator: damage multiplier R = 10', () => {
    assert.strictEqual(CombatCalculator.calculateDamageMultiplier(100, 10), 1.0);
});

test('CombatCalculator: damage multiplier R > 10', () => {
    assert.strictEqual(CombatCalculator.calculateDamageMultiplier(200, 10), 2.0); // R=20 → 20/10
});

test('CombatCalculator: damage multiplier with zero defense', () => {
    // Should treat defense as 1 to avoid division by zero
    // 10/1 = 10, R=10 → 10/10 = 1.0
    assert.strictEqual(CombatCalculator.calculateDamageMultiplier(10, 0), 1.0);
});

// --- Elemental Multiplier Tests ---

test('CombatCalculator: elemental same element', () => {
    assert.strictEqual(CombatCalculator.getElementMultiplier('fire', 'fire'), 1.0);
});

test('CombatCalculator: elemental neutral target', () => {
    assert.strictEqual(CombatCalculator.getElementMultiplier('fire', 'neutral'), 1.0);
    assert.strictEqual(CombatCalculator.getElementMultiplier('fire', null), 1.0);
});

test('CombatCalculator: elemental fire beats wind', () => {
    assert.strictEqual(CombatCalculator.getElementMultiplier('fire', 'wind'), 1.5);
    assert.strictEqual(CombatCalculator.getElementMultiplier('wind', 'fire'), 0.5);
});

test('CombatCalculator: elemental wind beats storm', () => {
    assert.strictEqual(CombatCalculator.getElementMultiplier('wind', 'storm'), 1.5);
    assert.strictEqual(CombatCalculator.getElementMultiplier('storm', 'wind'), 0.5);
});

test('CombatCalculator: elemental storm beats water', () => {
    assert.strictEqual(CombatCalculator.getElementMultiplier('storm', 'water'), 1.5);
    assert.strictEqual(CombatCalculator.getElementMultiplier('water', 'storm'), 0.5);
});

test('CombatCalculator: elemental water beats fire', () => {
    assert.strictEqual(CombatCalculator.getElementMultiplier('water', 'fire'), 1.5);
    assert.strictEqual(CombatCalculator.getElementMultiplier('fire', 'water'), 0.5);
});

test('CombatCalculator: elemental unrelated elements', () => {
    assert.strictEqual(CombatCalculator.getElementMultiplier('fire', 'earth'), 1.0);
    assert.strictEqual(CombatCalculator.getElementMultiplier('ice', 'fire'), 1.0);
});

// --- Evasion Tests ---

test('CombatCalculator: evasion R <= 1', () => {
    const attacker = { speed: 10 };
    const defender = { speed: 5 };
    // R = 5/10 = 0.5 → max(0, (0.5-0.5)*20) = 0
    assert.strictEqual(CombatCalculator.calculateEvasionChance(attacker, defender), 0);
});

test('CombatCalculator: evasion R <= 1 with some evasion', () => {
    const attacker = { speed: 10 };
    const defender = { speed: 8 };
    // R = 8/10 = 0.8 → (0.8-0.5)*20 = 6
    const result = CombatCalculator.calculateEvasionChance(attacker, defender);
    assert.ok(Math.abs(result - 6) < 0.0001);
});

test('CombatCalculator: evasion R > 1', () => {
    const attacker = { speed: 5 };
    const defender = { speed: 10 };
    // R = 10/5 = 2 → 10 + 2*10 = 30
    assert.strictEqual(CombatCalculator.calculateEvasionChance(attacker, defender), 30);
});

test('CombatCalculator: evasion with accuracy bonus', () => {
    const attacker = { speed: 5, accuracyBonus: 50 };
    const defender = { speed: 10 };
    // sAttacker = 5 * 1.5 = 7.5, R = 10/7.5 = 1.333 → 10 + 13.33 = 23.33
    const evasion = CombatCalculator.calculateEvasionChance(attacker, defender);
    assert.ok(evasion > 23 && evasion < 24);
});

// --- Main calculate() Tests ---

const mockAttacker = {
    strength: 20,
    magicPower: 15,
    speed: 10,
    critChanceBonus: 10,
    defense: 5
};

const mockDefender = {
    defense: 10,
    speed: 5,
    element: 'neutral'
};

test('CombatCalculator: calculate output shape for damage', () => {
    const skill = { id: 'basic_attack', stat: 'strength', baseMultiplier: 1.0, category: 'physical', tier: 1, targetType: 'single_enemy' };
    const result = CombatCalculator.calculate(mockAttacker, mockDefender, skill, 0);

    assert.ok(typeof result.amount === 'number');
    assert.ok(typeof result.evasionChance === 'number');
    assert.ok(typeof result.isMiss === 'boolean');
    assert.ok(typeof result.elementMult === 'number');
    assert.ok(typeof result.isCrit === 'boolean');
    assert.ok(result.amount >= 0);
});

test('CombatCalculator: calculate support skill', () => {
    const skill = { id: 'small_heal', stat: 'magicPower', power: 0.2, category: 'support', tier: 1, targetType: 'single_ally' };
    const result = CombatCalculator.calculate(mockAttacker, mockDefender, skill, 1);

    assert.ok(!result.isMiss);
    assert.strictEqual(result.evasionChance, 0);
    assert.strictEqual(result.elementMult, 1);
    assert.ok(result.amount > 0);
});

test('CombatCalculator: calculate with party trait magicPowerBoost', () => {
    const skill = { id: 'small_fire_ball', stat: 'magicPower', baseMultiplier: 1.2, category: 'magic', tier: 2, element: 'fire', targetType: 'single_enemy' };
    const resultWithout = CombatCalculator.calculate(mockAttacker, mockDefender, skill, 0, {});
    const resultWith = CombatCalculator.calculate(mockAttacker, mockDefender, skill, 0, { magicPowerBoost: 0.10 });

    assert.ok(resultWith.amount > resultWithout.amount);
});

test('CombatCalculator: calculate with party trait physicalDamageReduction', () => {
    const skill = { id: 'basic_attack', stat: 'strength', baseMultiplier: 1.0, category: 'physical', tier: 1, targetType: 'single_enemy' };
    // Mock Math.random to ensure no miss/crit variance
    const origRandom = Math.random;
    Math.random = () => 0;

    const resultWithout = CombatCalculator.calculate(mockAttacker, mockDefender, skill, 0, {});
    const resultWith = CombatCalculator.calculate(mockAttacker, mockDefender, skill, 0, { physicalDamageReduction: 0.10 });

    Math.random = origRandom;
    assert.ok(resultWith.amount < resultWithout.amount);
});

test('CombatCalculator: getFinalStat clamps to minimum 1', () => {
    assert.strictEqual(CombatCalculator.getFinalStat({ strength: 0 }, 'strength'), 1);
    assert.strictEqual(CombatCalculator.getFinalStat({ strength: -5 }, 'strength'), 1);
    assert.strictEqual(CombatCalculator.getFinalStat({ strength: 10 }, 'strength'), 10);
});
