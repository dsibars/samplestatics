import test from 'node:test';
import assert from 'node:assert';
import { AdventureService } from '../services/AdventureService.js';

const mockPlayer = {
    milestone: 0,
    autoBattle: false,
    setMilestone(v) { this.milestone = v; },
    addGold() {},
    addCores() {}
};

test('AdventureService: Start Adventure Heals Heroes', () => {
    const hero = {
        id: 'h1',
        name: 'Hero 1',
        hp: 10,
        maxHp: 100,
        mp: 5,
        maxMp: 50,
        addExperience: () => {},
        status: 'active'
    };
    const mockHeroes = {
        list: (status) => status === 'active' ? [hero] : []
    };
    const mockBattle = {
        startBattle: () => {}
    };

    const adv = new AdventureService(mockPlayer, mockHeroes, mockBattle);

    adv.startAdventure();

    assert.strictEqual(hero.hp, 100);
    assert.strictEqual(hero.mp, 50);
});

test('AdventureService: Next Step Increments Milestone', () => {
    const mockHeroes = { list: () => [] };
    const mockBattle = { startBattle: () => {} };
    const adv = new AdventureService(mockPlayer, mockHeroes, mockBattle);
    adv.currentMilestone = 0;

    adv.nextStep();

    assert.strictEqual(adv.currentMilestone, 1);
});

test('AdventureService: Milestone 5 triggers EVENT', () => {
    const mockHeroes = { list: () => [] };
    const mockBattle = { startBattle: () => {} };
    const adv = new AdventureService(mockPlayer, mockHeroes, mockBattle);
    adv.currentMilestone = 4;

    const result = adv.nextStep();

    assert.strictEqual(result.data.type, 'EVENT');
});
