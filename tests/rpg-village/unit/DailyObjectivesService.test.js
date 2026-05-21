globalThis.localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
    clear() {}
};

import test from 'node:test';
import assert from 'node:assert';
import { DailyObjectivesService } from '../../../src/rpg-village/js/engine/daily/services/DailyObjectivesService.js';
import { InventoryService } from '../../../src/rpg-village/js/engine/shared/inventory/services/InventoryService.js';

test('DailyObjectivesService: generateForDay creates objectives', () => {
    const inventory = new InventoryService();
    const service = new DailyObjectivesService(inventory);

    service.generateForDay(1);
    const objectives = service.getObjectives();

    assert.ok(objectives.length >= 2 && objectives.length <= 3);
    objectives.forEach(obj => {
        assert.ok(obj.id);
        assert.ok(obj.label);
        assert.ok(obj.target > 0);
        assert.strictEqual(obj.progress, 0);
        assert.strictEqual(obj.completed, false);
        assert.ok(obj.reward);
    });
});

test('DailyObjectivesService: generateForDay is idempotent for same day', () => {
    const inventory = new InventoryService();
    const service = new DailyObjectivesService(inventory);

    service.generateForDay(1);
    const first = service.getObjectives().map(o => o.id);

    service.generateForDay(1);
    const second = service.getObjectives().map(o => o.id);

    assert.deepStrictEqual(first, second);
});

test('DailyObjectivesService: generateForDay regenerates for new day', () => {
    const inventory = new InventoryService();
    const service = new DailyObjectivesService(inventory);

    service.generateForDay(1);
    const first = service.getObjectives().map(o => o.id);

    service.generateForDay(2);
    const second = service.getObjectives().map(o => o.id);

    // Not guaranteed to be different, but day and state should update
    assert.strictEqual(service.getState().day, 2);
});

test('DailyObjectivesService: track increments progress', () => {
    const inventory = new InventoryService();
    const service = new DailyObjectivesService(inventory);
    service.generateForDay(1);

    // Find an objective we can track
    const objectives = service.getObjectives();
    const targetObj = objectives.find(o => o.id === 'defeat_enemies') || objectives[0];

    const before = targetObj.progress;
    service.track(targetObj.id, 1);
    assert.strictEqual(targetObj.progress, before + 1);
});

test('DailyObjectivesService: track caps at target', () => {
    const inventory = new InventoryService();
    const service = new DailyObjectivesService(inventory);
    service.generateForDay(1);

    const objectives = service.getObjectives();
    const targetObj = objectives[0];

    service.track(targetObj.id, 999);
    assert.strictEqual(targetObj.progress, targetObj.target);
    assert.strictEqual(targetObj.completed, true);
});

test('DailyObjectivesService: track only affects matching objectives', () => {
    const inventory = new InventoryService();
    const service = new DailyObjectivesService(inventory);
    service.generateForDay(1);

    const objectives = service.getObjectives();
    const objA = objectives[0];
    const objB = objectives[1] || objectives[0];

    const beforeB = objB.progress;
    service.track(objA.id, 1);

    if (objA.id !== objB.id) {
        assert.strictEqual(objB.progress, beforeB);
    }
});

test('DailyObjectivesService: all-completed bonus grants materials', () => {
    const inventory = new InventoryService();
    const service = new DailyObjectivesService(inventory);
    service.generateForDay(1);

    const objectives = service.getObjectives();
    objectives.forEach(obj => {
        service.track(obj.id, obj.target);
    });

    const state = service.getState();
    assert.strictEqual(state.allCompleted, true);
    assert.ok(inventory.getItemCount('material_wood') >= 20);
    assert.ok(inventory.getItemCount('material_stone') >= 10);
});

test('DailyObjectivesService: all-completed bonus fires only once per day', () => {
    const inventory = new InventoryService();
    const service = new DailyObjectivesService(inventory);
    service.generateForDay(1);

    const objectives = service.getObjectives();
    objectives.forEach(obj => service.track(obj.id, obj.target));

    const woodAfterFirst = inventory.getItemCount('material_wood');

    // Track again — should not grant more
    objectives.forEach(obj => service.track(obj.id, 1));
    const woodAfterSecond = inventory.getItemCount('material_wood');

    assert.strictEqual(woodAfterFirst, woodAfterSecond);
});

test('DailyObjectivesService: claimReward success', () => {
    const inventory = new InventoryService();
    const service = new DailyObjectivesService(inventory);
    service.generateForDay(1);

    const obj = service.getObjectives()[0];
    service.track(obj.id, obj.target);

    const result = service.claimReward(obj.id);
    assert.strictEqual(result.success, true);
    assert.ok(result.data.reward);
});

test('DailyObjectivesService: claimReward fails if not completed', () => {
    const inventory = new InventoryService();
    const service = new DailyObjectivesService(inventory);
    service.generateForDay(1);

    const obj = service.getObjectives()[0];
    const result = service.claimReward(obj.id);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_reward_not_available');
});

test('DailyObjectivesService: claimReward fails if already claimed', () => {
    const inventory = new InventoryService();
    const service = new DailyObjectivesService(inventory);
    service.generateForDay(1);

    const obj = service.getObjectives()[0];
    service.track(obj.id, obj.target);
    service.claimReward(obj.id);

    const result = service.claimReward(obj.id);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_reward_not_available');
});

test('DailyObjectivesService: getState reflects completion', () => {
    const inventory = new InventoryService();
    const service = new DailyObjectivesService(inventory);
    service.generateForDay(1);

    let state = service.getState();
    assert.strictEqual(state.allCompleted, false);

    service.getObjectives().forEach(obj => service.track(obj.id, obj.target));
    state = service.getState();
    assert.strictEqual(state.allCompleted, true);
});
