globalThis.localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
    clear() {}
};

import test from 'node:test';
import assert from 'node:assert';
import { CombatAI } from '../../../src/rpg-village/js/engine/shared/combat/core/CombatAI.js';

const mockActor = {
    id: 'hero1',
    name: 'Arthur',
    hp: 100,
    maxHp: 100,
    mp: 50,
    skills: { basic_attack: 1, double_attack: 1, whirlwind: 1, small_heal: 1, small_group_heal: 1 }
};

const mockAllies = [
    { id: 'hero1', name: 'Arthur', hp: 100, maxHp: 100 },
    { id: 'hero2', name: 'Mira', hp: 100, maxHp: 100 }
];

const mockEnemies = [
    { id: 'e1', name: 'Goblin', hp: 50, maxHp: 50 },
    { id: 'e2', name: 'Orc', hp: 80, maxHp: 80 }
];

test('CombatAI: smart mode targets lowest HP enemy', () => {
    const result = CombatAI.decideAction({
        actor: mockActor,
        allies: mockAllies,
        enemies: mockEnemies,
        type: 'smart'
    });

    assert.strictEqual(result.skillId, 'whirlwind'); // AoE preferred with 2+ enemies
    assert.strictEqual(result.targetIndex, null); // all_enemies
});

test('CombatAI: random mode picks random alive enemy', () => {
    const result = CombatAI.decideAction({
        actor: mockActor,
        allies: mockAllies,
        enemies: mockEnemies,
        type: 'random'
    });

    assert.ok(result.skillId);
    assert.ok(result.targetIndex === 0 || result.targetIndex === 1);
});

test('CombatAI: smart mode healing priority when ally injured', () => {
    const injuredAllies = [
        { id: 'hero1', name: 'Arthur', hp: 100, maxHp: 100 },
        { id: 'hero2', name: 'Mira', hp: 50, maxHp: 100 } // 50% injured
    ];

    const result = CombatAI.decideAction({
        actor: mockActor,
        allies: injuredAllies,
        enemies: mockEnemies,
        type: 'smart'
    });

    assert.strictEqual(result.skillId, 'small_heal');
    assert.strictEqual(result.targetIndex, 1); // Mira is most injured
});

test('CombatAI: smart mode group heal when 2+ allies injured', () => {
    const injuredAllies = [
        { id: 'hero1', name: 'Arthur', hp: 60, maxHp: 100 }, // 60% injured
        { id: 'hero2', name: 'Mira', hp: 50, maxHp: 100 }   // 50% injured
    ];

    const result = CombatAI.decideAction({
        actor: mockActor,
        allies: injuredAllies,
        enemies: mockEnemies,
        type: 'smart'
    });

    assert.strictEqual(result.skillId, 'small_group_heal');
    assert.strictEqual(result.targetIndex, null); // AoE skill
});

test('CombatAI: smart mode prefers AoE when multiple enemies alive', () => {
    const actorWithWhirlwind = {
        ...mockActor,
        skills: { basic_attack: 1, whirlwind: 1 }
    };

    const result = CombatAI.decideAction({
        actor: actorWithWhirlwind,
        allies: mockAllies,
        enemies: mockEnemies,
        type: 'smart'
    });

    assert.strictEqual(result.skillId, 'whirlwind');
    assert.strictEqual(result.targetIndex, null); // all_enemies
});

test('CombatAI: falls back to basic_attack when no skills affordable', () => {
    const lowMpActor = {
        ...mockActor,
        mp: 0,
        skills: { double_attack: 1, whirlwind: 1 } // both cost MP
    };

    const result = CombatAI.decideAction({
        actor: lowMpActor,
        allies: mockAllies,
        enemies: mockEnemies,
        type: 'smart'
    });

    assert.strictEqual(result.skillId, 'basic_attack');
});

test('CombatAI: skill availability filter excludes unaffordable MP costs', () => {
    const lowMpActor = {
        ...mockActor,
        mp: 5,
        skills: { basic_attack: 1, double_attack: 1 } // double_attack costs 10 MP
    };

    const result = CombatAI.decideAction({
        actor: lowMpActor,
        allies: mockAllies,
        enemies: mockEnemies,
        type: 'smart'
    });

    assert.strictEqual(result.skillId, 'basic_attack');
});

test('CombatAI: target index null for all_enemies skills', () => {
    const actor = {
        ...mockActor,
        skills: { whirlwind: 1 }
    };

    const result = CombatAI.decideAction({
        actor,
        allies: mockAllies,
        enemies: mockEnemies,
        type: 'smart'
    });

    assert.strictEqual(result.skillId, 'whirlwind');
    assert.strictEqual(result.targetIndex, null);
});

test('CombatAI: target index null for all_allies skills', () => {
    const injuredAllies = [
        { id: 'hero1', name: 'Arthur', hp: 50, maxHp: 100 },
        { id: 'hero2', name: 'Mira', hp: 60, maxHp: 100 }
    ];
    const actor = {
        ...mockActor,
        skills: { small_group_heal: 1 }
    };

    const result = CombatAI.decideAction({
        actor,
        allies: injuredAllies,
        enemies: mockEnemies,
        type: 'smart'
    });

    assert.strictEqual(result.skillId, 'small_group_heal');
    assert.strictEqual(result.targetIndex, null);
});

test('CombatAI: no crash when no alive enemies', () => {
    const deadEnemies = [
        { id: 'e1', name: 'Goblin', hp: 0, maxHp: 50 },
        { id: 'e2', name: 'Orc', hp: 0, maxHp: 80 }
    ];

    const result = CombatAI.decideAction({
        actor: mockActor,
        allies: mockAllies,
        enemies: deadEnemies,
        type: 'smart'
    });

    assert.ok(result.skillId);
    // targetIndex may be 0 (default) since aliveEnemies is empty
});

test('CombatAI: single heal targets lowest hp ratio not lowest absolute hp', () => {
    const allies = [
        { id: 'hero1', name: 'Arthur', hp: 80, maxHp: 100 }, // 80%
        { id: 'hero2', name: 'Mira', hp: 40, maxHp: 60 }      // 66.7% — worse ratio
    ];

    const result = CombatAI.decideAction({
        actor: mockActor,
        allies,
        enemies: mockEnemies,
        type: 'smart'
    });

    assert.strictEqual(result.skillId, 'small_heal');
    assert.strictEqual(result.targetIndex, 1); // Mira has worse ratio
});
