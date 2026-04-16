import test from 'node:test';
import assert from 'node:assert';
import { Hero } from '../models/Hero.js';

// Mock crypto and localStorage for Node environment
if (typeof globalThis.crypto === 'undefined') {
    globalThis.crypto = {};
}

try {
    globalThis.crypto.randomUUID = () => 'test-uuid-' + Math.random().toString(36).substring(2, 9);
} catch (e) {
    console.warn("Could not mock crypto.randomUUID");
}

globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

test('Hero Model: Initialization', () => {
    const hero = new Hero({ name: 'Test Hero', origin: 'origin_warrior' });
    assert.strictEqual(hero.name, 'Test Hero');
    assert.strictEqual(hero.level, 1);
    assert.strictEqual(hero.exp, 0);
    if (globalThis.crypto && globalThis.crypto.randomUUID) {
        assert.ok(hero.id);
    }
});

test('Hero Model: Experience Gain and Level Up', () => {
    const hero = new Hero({ name: 'Test Hero' });
    const result = hero.addExperience(25); // Level 1 needs 20 exp

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data, 1); // 1 level gained
    assert.strictEqual(hero.level, 2);
    assert.strictEqual(hero.exp, 5);
});

test('Hero Model: Stat Increments', () => {
    const hero = new Hero({ name: 'Test Hero', statPoints: 5 });
    const initialStr = hero.baseStrength;

    const result = hero.increaseStat('baseStrength');

    assert.strictEqual(result.success, true);
    assert.strictEqual(hero.baseStrength, initialStr + 1);
    assert.strictEqual(hero.statPoints, 4);
});

test('Hero Model: Stat Increments failure when no points', () => {
    const hero = new Hero({ name: 'Test Hero', statPoints: 0 });
    const result = hero.increaseStat('baseStrength');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_no_stat_points');
});

test('Hero Model: Recalculate Stats with Equipment', () => {
    const hero = new Hero({
        name: 'Test Hero',
        baseStrength: 10,
        equipment: {
            rightHand: {
                type: 'weapon',
                family: 'broadsword',
                material: 'iron',
                level: 0
            }
        }
    });

    // Iron mult is 1.5, Broadsword dmgMult is 1.0.
    // itemPower = 2 * 1.5 * 1.0 = 3.
    // Final strength = 10 + 3 = 13.
    assert.strictEqual(hero.strength, 13);
});

test('Hero Model: Recalculate Stats with Village Boosts', () => {
    const hero = new Hero({ name: 'Test Hero', baseMaxHp: 100 });

    // Default origin_warrior has 1.05 maxHp multiplier
    // Village hp_boost: 5 levels * 10 = 50.
    // Final maxHp = (100 + 50) * 1.05 = 157.5 -> 157
    hero.recalculateStats({ hp_boost: 5 });

    assert.strictEqual(hero.maxHp, 157);
});

test('Hero Model: Origin Multipliers', () => {
    const warrior = new Hero({ name: 'Warrior', origin: 'origin_warrior', baseDefense: 10 });
    const thief = new Hero({ name: 'Thief', origin: 'origin_thief', baseSpeed: 10 });

    // Warrior: 1.10 defense mult. 10 * 1.10 = 11.
    assert.strictEqual(warrior.defense, 11);
    // Thief: 1.10 speed mult. 10 * 1.10 = 11.
    assert.strictEqual(thief.speed, 11);
});
