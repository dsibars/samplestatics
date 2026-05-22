globalThis.localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
    clear() {}
};

import test from 'node:test';
import assert from 'node:assert';
import { BattleService } from '../../../src/rpg-village/js/engine/shared/combat/services/BattleService.js';
import { InventoryService } from '../../../src/rpg-village/js/engine/shared/inventory/services/InventoryService.js';

const mockHero = {
    id: 'h1',
    name: 'Hero 1',
    type: 'Hero',
    origin: 'origin_warrior',
    level: 1,
    hp: 100,
    maxHp: 100,
    mp: 10,
    maxMp: 10,
    strength: 10,
    defense: 5,
    speed: 10,
    avatar: '⚔️',
    skills: ['double_attack']
};

const mockEnemy = {
    id: 'e1',
    name: 'Enemy 1',
    type: 'Enemy',
    level: 1,
    hp: 50,
    maxHp: 50,
    mp: 5,
    maxMp: 5,
    strength: 5,
    defense: 2,
    speed: 5
};

test('BattleService: Start Battle and Turn Order', () => {
    const inventory = new InventoryService();
    const battle = new BattleService(inventory);
    battle.startBattle([mockHero], [mockEnemy]);

    assert.strictEqual(battle.turnOrder.length, 2);
    // Hero speed is 10, enemy is 5, so Hero goes first
    assert.strictEqual(battle.turnOrder[0].id, 'h1');
    assert.strictEqual(battle.turnOrder[1].id, 'e1');
    assert.strictEqual(battle.currentTurnIndex, 0);
    assert.strictEqual(battle.itemUsedThisTurn, false);
});

test('BattleService: Execute Basic Attack', () => {
    const inventory = new InventoryService();
    const battle = new BattleService(inventory);
    
    // Create copies so we don't mutate mock globals
    const hero = { ...mockHero };
    const enemy = { ...mockEnemy };
    battle.startBattle([hero], [enemy]);

    const initialEnemyHp = enemy.hp;
    const result = battle.executeAction(hero, 'basic_attack', 0); // Target enemy at index 0

    assert.strictEqual(result.success, true);
    assert.ok(enemy.hp < initialEnemyHp);
    assert.strictEqual(battle.log.length, 1);
    assert.strictEqual(battle.log[0].type, 'DAMAGE');
});

test('BattleService: Potion Usage Rules', () => {
    const inventory = new InventoryService();
    inventory.addItem('tiny_hp_potion', 2);

    const battle = new BattleService(inventory);
    const hero = { ...mockHero, hp: 50 }; // Half HP
    const enemy = { ...mockEnemy };
    battle.startBattle([hero], [enemy]);

    // Use consumable potion on hero
    const result = battle.useConsumable(hero, 'tiny_hp_potion', 'h1');
    assert.strictEqual(result.success, true);
    assert.ok(hero.hp > 50);
    assert.strictEqual(battle.itemUsedThisTurn, true);
    assert.strictEqual(inventory.getItemCount('tiny_hp_potion'), 1);

    // Try using another item on the same turn (should be blocked)
    const secondResult = battle.useConsumable(hero, 'tiny_hp_potion', 'h1');
    assert.strictEqual(secondResult.success, false);
    assert.strictEqual(secondResult.error, 'error_item_already_used');
});


test('BattleService: inscribed physical skill costs both STA and MP', () => {
    const inventory = new InventoryService();
    const battle = new BattleService(inventory);
    const hero = {
        id: 'h1', name: 'Hero 1', type: 'Hero', origin: 'origin_warrior', level: 1,
        hp: 100, maxHp: 100, mp: 20, maxMp: 20, stamina: 50, maxStamina: 50,
        strength: 10, defense: 5, speed: 10, avatar: '⚔️',
        skills: { power_strike: 1 }, bodyInscription: ['power_strike']
    };
    const enemy = { ...mockEnemy };
    battle.startBattle([hero], [enemy]);

    const initialSta = hero.stamina;
    const initialMp = hero.mp;
    const result = battle.executeAction(hero, 'power_strike', 0);

    assert.strictEqual(result.success, true);
    assert.strictEqual(hero.stamina, initialSta - 12); // power_strike staminaCost
    assert.strictEqual(hero.mp, initialMp - 6); // 50% of staminaCost rounded up
});

test('BattleService: inscribed magic skill costs both MP and STA', () => {
    const inventory = new InventoryService();
    const battle = new BattleService(inventory);
    const hero = {
        id: 'h1', name: 'Hero 1', type: 'Hero', origin: 'origin_warrior', level: 1,
        hp: 100, maxHp: 100, mp: 20, maxMp: 20, stamina: 50, maxStamina: 50,
        strength: 10, defense: 5, speed: 10, magicPower: 10, avatar: '⚔️',
        skills: { small_fire_ball: 1 }, bodyInscription: ['small_fire_ball']
    };
    const enemy = { ...mockEnemy };
    battle.startBattle([hero], [enemy]);

    const initialSta = hero.stamina;
    const initialMp = hero.mp;
    const result = battle.executeAction(hero, 'small_fire_ball', 0);

    assert.strictEqual(result.success, true);
    assert.strictEqual(hero.mp, initialMp - 10); // small_fire_ball mpCost
    assert.strictEqual(hero.stamina, initialSta - 5); // 50% of mpCost rounded up
});

test('BattleService: non-inscribed skill costs only primary resource', () => {
    const inventory = new InventoryService();
    const battle = new BattleService(inventory);
    const hero = {
        id: 'h1', name: 'Hero 1', type: 'Hero', origin: 'origin_warrior', level: 1,
        hp: 100, maxHp: 100, mp: 20, maxMp: 20, stamina: 50, maxStamina: 50,
        strength: 10, defense: 5, speed: 10, avatar: '⚔️',
        skills: { power_strike: 1 }, bodyInscription: []
    };
    const enemy = { ...mockEnemy };
    battle.startBattle([hero], [enemy]);

    const initialSta = hero.stamina;
    const initialMp = hero.mp;
    const result = battle.executeAction(hero, 'power_strike', 0);

    assert.strictEqual(result.success, true);
    assert.strictEqual(hero.stamina, initialSta - 12);
    assert.strictEqual(hero.mp, initialMp); // MP unchanged
});

test('BattleService: inscribed physical skill fails if not enough MP', () => {
    const inventory = new InventoryService();
    const battle = new BattleService(inventory);
    const hero = {
        id: 'h1', name: 'Hero 1', type: 'Hero', origin: 'origin_warrior', level: 1,
        hp: 100, maxHp: 100, mp: 3, maxMp: 3, stamina: 50, maxStamina: 50,
        strength: 10, defense: 5, speed: 10, avatar: '⚔️',
        skills: { power_strike: 1 }, bodyInscription: ['power_strike']
    };
    const enemy = { ...mockEnemy };
    battle.startBattle([hero], [enemy]);

    const result = battle.executeAction(hero, 'power_strike', 0);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_not_enough_mp');
});
