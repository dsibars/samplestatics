globalThis.localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
    clear() {}
};

import test from 'node:test';
import assert from 'node:assert';
import { GameEngine } from '../../../src/rpg-village/js/engine/GameEngine.js';

test('Combat Flow: End-To-End Combat and Item Rules', () => {
    const engine = new GameEngine();
    let state = engine.update();

    // 1. Setup Hero and Expedition
    const arthur = state.heroes[0];
    const cave = state.expeditions.find(e => e.id === 'exp_tutorial_cave');
    assert.ok(arthur, 'Arthur should exist');
    assert.ok(cave, 'Tutorial Cave should exist');

    // Assign Hero
    const assignRes = engine.assignExpedition(cave.id, [arthur.id]);
    assert.strictEqual(assignRes.success, true);

    // 2. Advance day to trigger battle stage
    const dayReport = engine.nextDay();
    assert.strictEqual(dayReport.expedition.status, 'battle_started');
    
    state = engine.update();
    assert.ok(state.activeBattle, 'Active battle context should be active');

    const battle = state.activeBattle;
    assert.strictEqual(battle.turnOrder[0].id, arthur.id, 'Arthur should have first turn');
    assert.strictEqual(battle.itemUsedThisTurn, false, 'No item used yet');

    // 3. Test Potion Turn Limit Rule
    engine.inventoryService.addItem('tiny_hp_potion', 3);
    
    // First potion usage should succeed
    const itemRes1 = engine.useBattleConsumable('tiny_hp_potion', arthur.id);
    assert.strictEqual(itemRes1.success, true, 'First item usage should succeed');
    
    state = engine.update();
    assert.strictEqual(state.activeBattle.itemUsedThisTurn, true, 'Item used flag should be true');

    // Second potion usage on same turn should be blocked
    const itemRes2 = engine.useBattleConsumable('tiny_hp_potion', arthur.id);
    assert.strictEqual(itemRes2.success, false, 'Second item usage should fail');
    assert.strictEqual(itemRes2.error, 'error_item_already_used');

    // 4. Test Attack Action
    const attackRes = engine.executeBattleAction('basic_attack', 0);
    assert.strictEqual(attackRes.success, true, 'Basic attack should succeed');

    // 5. Step Combat turn to process enemy action
    engine.nextBattleTurn();
    state = engine.update();
    
    // Check combat log for basic attack damage events
    const logs = state.activeBattle.log;
    assert.ok(logs.some(l => l.type === 'DAMAGE' && l.actorIsHero), 'Should record hero damage action');
    assert.ok(logs.some(l => l.type === 'DAMAGE' && !l.actorIsHero), 'Should record enemy reaction damage');

    // 6. Test Skip Combat (instant resolution)
    const skipRes = engine.skipBattle();
    assert.strictEqual(skipRes.success, true, 'Skip Combat should succeed');

    state = engine.update();
    assert.strictEqual(state.activeBattle.isOver, true, 'Active battle should be marked as over, waiting for close');
    
    // 7. Resolve first battle (stage 1 of 2)
    engine.resolveBattle();
    state = engine.update();
    assert.strictEqual(state.activeBattle, null, 'Active battle should clear after resolve');
    // Tutorial Cave has 2 stages; after winning stage 1, expedition advances to stage 2
    assert.strictEqual(state.activeExpedition.currentStage, 1, 'Expedition should advance to stage 2');

    // 8. Advance day to trigger second (boss) battle
    engine.nextDay();
    state = engine.update();
    assert.ok(state.activeBattle, 'Boss battle should be active');

    // 9. Resolve boss battle
    engine.skipBattle();
    engine.resolveBattle();
    state = engine.update();
    assert.strictEqual(state.activeExpedition, null, 'Active expedition should complete after final stage');
});
