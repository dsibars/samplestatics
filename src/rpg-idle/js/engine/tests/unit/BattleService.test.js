import test from 'node:test';
import assert from 'node:assert';
import { BattleService } from '../../services/BattleService.js';

const mockHero = {
    id: 'h1',
    name: 'Hero 1',
    hp: 100,
    maxHp: 100,
    strength: 10,
    defense: 5,
    speed: 10,
    constructor: { name: 'Hero' }
};

const mockEnemy = {
    id: 'e1',
    name: 'Enemy 1',
    hp: 50,
    maxHp: 50,
    strength: 5,
    defense: 2,
    speed: 5,
    constructor: { name: 'Enemy' }
};

test('BattleService: Turn Order', () => {
    const battle = new BattleService();
    battle.startBattle([mockHero], [mockEnemy]);

    assert.strictEqual(battle.turnOrder[0].id, 'h1');
    assert.strictEqual(battle.turnOrder[1].id, 'e1');
});

test('BattleService: Action Execution', () => {
    const battle = new BattleService();
    battle.startBattle([mockHero], [mockEnemy]);

    const initialHp = mockEnemy.hp;
    const result = battle.executeAction(mockHero, 'basic_attack', 'e1');

    assert.strictEqual(result.success, true);
    assert.ok(mockEnemy.hp < initialHp);
});

test('BattleService: Battle End (Win)', () => {
    const battle = new BattleService();
    // Use a fresh copy to avoid modifying shared mock
    const weakEnemy = { ...mockEnemy, hp: 1 };
    battle.startBattle([mockHero], [weakEnemy]);

    const result = battle.executeAction(mockHero, 'basic_attack', 'e1');

    assert.strictEqual(result.data.battleOver, true);
    assert.strictEqual(result.data.winner, 'heroes');
});
