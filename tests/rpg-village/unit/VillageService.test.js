globalThis.localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
    clear() {}
};

import test from 'node:test';
import assert from 'node:assert';
import { VillageService } from '../../../src/rpg-village/js/engine/village/services/VillageService.js';
import { InventoryService } from '../../../src/rpg-village/js/engine/shared/inventory/services/InventoryService.js';

function createVillage() {
    const inventoryService = new InventoryService();
    const villageService = new VillageService(inventoryService);
    // Reset to known state
    villageService.state.gold = 1000;
    villageService.state.population = { total: 5, assigned: 0, builders: 5 };
    villageService.state.constructionQueue = [];
    villageService.save();
    return { villageService, inventoryService };
}

test('VillageService: Default builders equals total population', () => {
    const { villageService } = createVillage();
    const state = villageService.getState();
    assert.strictEqual(state.population.builders, 5);
    assert.strictEqual(state.population.availableBuilders, 5);
});

test('VillageService: Set builders within valid range', () => {
    const { villageService } = createVillage();
    const result = villageService.setBuilders(3);
    assert.strictEqual(result.success, true);
    assert.strictEqual(villageService.state.population.builders, 3);
    assert.strictEqual(villageService.getState().population.availableBuilders, 3);
});

test('VillageService: Cannot set builders below 0', () => {
    const { villageService } = createVillage();
    const result = villageService.setBuilders(-1);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_invalid_builder_count');
});

test('VillageService: Cannot set builders above total population', () => {
    const { villageService } = createVillage();
    const result = villageService.setBuilders(10);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_invalid_builder_count');
});

test('VillageService: Cannot reduce builders below assigned', () => {
    const { villageService } = createVillage();
    // Start a project to assign a builder
    villageService.setBuilders(3);
    villageService.startProject('farm', 1, 0, {}, 2);
    assert.strictEqual(villageService.state.population.assigned, 1);

    const result = villageService.setBuilders(0);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_builders_below_assigned');
});

test('VillageService: Construction uses builder limit not total pop', () => {
    const { villageService } = createVillage();
    villageService.setBuilders(2);
    villageService.save();

    // Should be able to start 2 projects
    const r1 = villageService.startProject('farm', 1, 0, {}, 2);
    assert.strictEqual(r1.success, true);

    const r2 = villageService.startProject('housing', 1, 0, {}, 2);
    assert.strictEqual(r2.success, true);

    // Third should fail
    const r3 = villageService.startProject('warehouse', 1, 0, {}, 2);
    assert.strictEqual(r3.success, false);
    assert.strictEqual(r3.error, 'error_no_available_builders');
});

test('VillageService: Multiple concurrent projects complete independently', () => {
    const { villageService } = createVillage();
    villageService.startProject('farm', 1, 0, {}, 2);
    villageService.startProject('housing', 1, 0, {}, 3);
    
    assert.strictEqual(villageService.state.constructionQueue.length, 2);
    assert.strictEqual(villageService.state.population.assigned, 2);

    // Day 1
    const day1 = villageService.nextDay();
    assert.strictEqual(villageService.state.constructionQueue[0].daysRemaining, 1);
    assert.strictEqual(villageService.state.constructionQueue[1].daysRemaining, 2);

    // Day 2 - farm completes
    const day2 = villageService.nextDay();
    assert.ok(day2.completed.includes('farm'));
    assert.strictEqual(villageService.state.constructionQueue.length, 1);
    assert.strictEqual(villageService.state.population.assigned, 1);

    // Day 3 - housing completes
    const day3 = villageService.nextDay();
    assert.ok(day3.completed.includes('housing'));
    assert.strictEqual(villageService.state.constructionQueue.length, 0);
    assert.strictEqual(villageService.state.population.assigned, 0);
});


test('VillageService: tavern auto-recruit cooldown increments each day', () => {
    const { villageService } = createVillage();
    villageService.state.infrastructure.tavern = 1;
    villageService.state.daysSinceLastRecruit = 0;

    const report = villageService.nextDay();
    assert.strictEqual(villageService.state.daysSinceLastRecruit, 1);
    assert.strictEqual(report.tavernRecruit, null);
});

test('VillageService: tavern auto-recruit triggers after threshold', () => {
    const { villageService } = createVillage();
    villageService.state.infrastructure.tavern = 1;
    villageService.state.daysSinceLastRecruit = 10; // Way past threshold

    const report = villageService.nextDay();
    assert.ok(report.tavernRecruit);
    assert.strictEqual(report.tavernRecruit.ready, true);
    assert.strictEqual(villageService.state.daysSinceLastRecruit, 0);
});

test('VillageService: no tavern means no auto-recruit', () => {
    const { villageService } = createVillage();
    villageService.state.infrastructure.tavern = 0;
    villageService.state.daysSinceLastRecruit = 10;

    const report = villageService.nextDay();
    assert.strictEqual(report.tavernRecruit, null);
    // Counter should not increment when tavern is 0
    assert.strictEqual(villageService.state.daysSinceLastRecruit, 10);
});

test('VillageService: daysSinceLastRecruit migration from old save', () => {
    const { villageService } = createVillage();
    // Simulate old save without daysSinceLastRecruit
    delete villageService.state.daysSinceLastRecruit;
    
    // Reload triggers migration
    const fresh = new VillageService(villageService.inventoryService);
    assert.strictEqual(fresh.state.daysSinceLastRecruit, 0);
});
