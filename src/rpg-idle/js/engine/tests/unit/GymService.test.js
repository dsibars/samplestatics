import test from 'node:test';
import assert from 'node:assert';
import { GymService } from '../../services/GymService.js';
import { Result } from '../../core/Result.js';

const mockPlayer = {
    addGold() {},
    addCores() {}
};

const mockVillage = {
    getBuildingLevel: (id) => 1
};

const mockInventory = {
    addItem: () => {}
};

test('GymService: Start Training', () => {
    const hero = { id: 'h1', status: 'resting' };
    const mockHeroes = {
        get: () => hero,
        save: () => Result.ok()
    };
    const gym = new GymService(mockPlayer, mockVillage, mockHeroes, mockInventory);

    const result = gym.startTraining('h1', 'light_sparring');

    assert.strictEqual(result.success, true);
    assert.strictEqual(hero.status, 'training');
    assert.ok(hero.trainingSession);
});

test('GymService: Start Training busy hero', () => {
    const hero = { id: 'h1', status: 'active' };
    const mockHeroes = {
        get: () => hero
    };
    const gym = new GymService(mockPlayer, mockVillage, mockHeroes, mockInventory);

    const result = gym.startTraining('h1', 'light_sparring');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_hero_busy');
});

test('GymService: Claim Training', () => {
    const hero = {
        id: 'h1',
        status: 'training',
        trainingSession: { regimeId: 'light_sparring', startTime: Date.now() - 4000000 }, // 1 hour +
        addExperience: () => Result.ok(1)
    };
    const mockHeroes = {
        get: () => hero,
        save: () => Result.ok()
    };
    const gym = new GymService(mockPlayer, mockVillage, mockHeroes, mockInventory);

    const result = gym.claimTraining('h1');

    assert.strictEqual(result.success, true);
    assert.strictEqual(hero.status, 'resting');
    assert.strictEqual(hero.trainingSession, undefined);
});
