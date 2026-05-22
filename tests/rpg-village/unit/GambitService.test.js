globalThis.localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
    clear() {}
};

import test from 'node:test';
import assert from 'node:assert';
import { GambitService } from '../../../src/rpg-village/js/engine/gambit/GambitService.js';

test('GambitService: self_hp_below matches when HP is low', () => {
    const hero = { id: 'h1', hp: 30, maxHp: 100, mp: 50, maxMp: 100, stamina: 50, maxStamina: 100, skills: { basic_attack: 0 } };
    const gambit = { condition: 'self_hp_below', threshold: 0.5, action: 'use_skill', skillId: 'basic_attack', enabled: true };
    hero.gambits = [gambit];

    const result = GambitService.evaluate(hero, [hero], []);
    assert.ok(result);
    assert.strictEqual(result.skillId, 'basic_attack');
});

test('GambitService: self_hp_below does not match when HP is high', () => {
    const hero = { id: 'h1', hp: 80, maxHp: 100, mp: 50, maxMp: 100, stamina: 50, maxStamina: 100, skills: { basic_attack: 0 } };
    const gambit = { condition: 'self_hp_below', threshold: 0.5, action: 'use_skill', skillId: 'basic_attack', enabled: true };
    hero.gambits = [gambit];

    const result = GambitService.evaluate(hero, [hero], []);
    assert.strictEqual(result, null);
});

test('GambitService: ally_hp_below matches when ally is injured', () => {
    const hero = { id: 'h1', hp: 100, maxHp: 100, mp: 50, maxMp: 100, stamina: 50, maxStamina: 100, skills: { small_heal: 1 } };
    const ally = { id: 'h2', hp: 30, maxHp: 100 };
    const gambit = { condition: 'ally_hp_below', threshold: 0.5, action: 'use_skill', skillId: 'small_heal', enabled: true };
    hero.gambits = [gambit];

    const result = GambitService.evaluate(hero, [hero, ally], []);
    assert.ok(result);
    assert.strictEqual(result.skillId, 'small_heal');
});

test('GambitService: always condition always matches', () => {
    const hero = { id: 'h1', hp: 100, maxHp: 100, mp: 50, maxMp: 100, stamina: 50, maxStamina: 100, skills: { basic_attack: 0 } };
    const gambit = { condition: 'always', action: 'use_skill', skillId: 'basic_attack', enabled: true };
    hero.gambits = [gambit];

    const result = GambitService.evaluate(hero, [hero], []);
    assert.ok(result);
    assert.strictEqual(result.skillId, 'basic_attack');
});

test('GambitService: disabled gambits are skipped', () => {
    const hero = { id: 'h1', hp: 30, maxHp: 100, mp: 50, maxMp: 100, stamina: 50, maxStamina: 100, skills: { basic_attack: 0 } };
    const gambit = { condition: 'self_hp_below', threshold: 0.5, action: 'use_skill', skillId: 'basic_attack', enabled: false };
    hero.gambits = [gambit];

    const result = GambitService.evaluate(hero, [hero], []);
    assert.strictEqual(result, null);
});

test('GambitService: first matching gambit wins', () => {
    const hero = { id: 'h1', hp: 30, maxHp: 100, mp: 50, maxMp: 100, stamina: 50, maxStamina: 100, skills: { basic_attack: 0, power_strike: 1 } };
    hero.gambits = [
        { condition: 'always', action: 'use_skill', skillId: 'basic_attack', enabled: true },
        { condition: 'self_hp_below', threshold: 0.5, action: 'use_skill', skillId: 'power_strike', enabled: true }
    ];

    const result = GambitService.evaluate(hero, [hero], []);
    assert.ok(result);
    assert.strictEqual(result.skillId, 'basic_attack');
});

test('GambitService: skips gambit if not enough resources', () => {
    const hero = { id: 'h1', hp: 100, maxHp: 100, mp: 5, maxMp: 100, stamina: 50, maxStamina: 100, skills: { small_fire_ball: 1 } };
    const gambit = { condition: 'always', action: 'use_skill', skillId: 'small_fire_ball', enabled: true };
    hero.gambits = [gambit];

    const result = GambitService.evaluate(hero, [hero], []);
    assert.strictEqual(result, null); // small_fire_ball costs 10 MP
});

test('GambitService: validateGambit accepts valid gambit', () => {
    const gambit = { condition: 'always', action: 'use_skill', skillId: 'basic_attack' };
    const result = GambitService.validateGambit(gambit);
    assert.strictEqual(result.valid, true);
});

test('GambitService: validateGambit rejects invalid condition', () => {
    const gambit = { condition: 'invalid_cond', action: 'use_skill', skillId: 'basic_attack' };
    const result = GambitService.validateGambit(gambit);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.error, 'error_invalid_gambit_condition');
});

test('GambitService: validateGambit rejects missing skillId', () => {
    const gambit = { condition: 'always', action: 'use_skill' };
    const result = GambitService.validateGambit(gambit);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.error, 'error_invalid_gambit_action');
});

test('GambitService: self_mp_below matches when MP is low', () => {
    const hero = { id: 'h1', hp: 100, maxHp: 100, mp: 20, maxMp: 100, stamina: 50, maxStamina: 100, skills: { basic_attack: 0 } };
    const gambit = { condition: 'self_mp_below', threshold: 0.3, action: 'use_skill', skillId: 'basic_attack', enabled: true };
    hero.gambits = [gambit];

    const result = GambitService.evaluate(hero, [hero], []);
    assert.ok(result);
    assert.strictEqual(result.skillId, 'basic_attack');
});

test('GambitService: self_stamina_below matches when STA is low', () => {
    const hero = { id: 'h1', hp: 100, maxHp: 100, mp: 50, maxMp: 100, stamina: 20, maxStamina: 100, skills: { basic_attack: 0 } };
    const gambit = { condition: 'self_stamina_below', threshold: 0.3, action: 'use_skill', skillId: 'basic_attack', enabled: true };
    hero.gambits = [gambit];

    const result = GambitService.evaluate(hero, [hero], []);
    assert.ok(result);
    assert.strictEqual(result.skillId, 'basic_attack');
});
