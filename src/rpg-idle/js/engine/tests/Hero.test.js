import test from 'node:test';
import assert from 'node:assert';
import { Hero } from '../models/Hero.js';

// Mock crypto and localStorage for Node environment
if (typeof globalThis.crypto === 'undefined') {
    globalThis.crypto = {};
}

// In some node versions crypto might be read-only on globalThis
try {
    globalThis.crypto.randomUUID = () => 'test-uuid-' + Math.random().toString(36).substring(2, 9);
} catch (e) {
    // If globalThis.crypto is read-only, we might need another way or just skip UUID test
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
    // Only check ID if we successfully mocked randomUUID or it exists
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
