globalThis.localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
    clear() {}
};

import test from 'node:test';
import assert from 'node:assert';
import { CalendarService } from '../../../src/rpg-village/js/engine/calendar/services/CalendarService.js';

function mockVillageService(opts = {}) {
    return {
        state: {
            infrastructure: opts.infrastructure || {},
            population: opts.population || { roles: {} },
            regions: opts.regions || {},
            gold: opts.gold || 0,
            inventoryService: opts.inventoryService || null
        },
        save() {}
    };
}

function mockHeroService(heroes = []) {
    return {
        list() { return heroes; },
        saveAll() {}
    };
}

// --- Season Math Tests ---

test('CalendarService: getSeason for days 1-30 is spring', () => {
    const village = mockVillageService();
    const heroes = mockHeroService();
    const cal = new CalendarService(village, heroes);

    assert.strictEqual(cal.getSeason(1), 'spring');
    assert.strictEqual(cal.getSeason(15), 'spring');
    assert.strictEqual(cal.getSeason(30), 'spring');
});

test('CalendarService: getSeason for days 31-60 is summer', () => {
    const village = mockVillageService();
    const heroes = mockHeroService();
    const cal = new CalendarService(village, heroes);

    assert.strictEqual(cal.getSeason(31), 'summer');
    assert.strictEqual(cal.getSeason(45), 'summer');
    assert.strictEqual(cal.getSeason(60), 'summer');
});

test('CalendarService: getSeason for days 61-90 is autumn', () => {
    const village = mockVillageService();
    const heroes = mockHeroService();
    const cal = new CalendarService(village, heroes);

    assert.strictEqual(cal.getSeason(61), 'autumn');
    assert.strictEqual(cal.getSeason(75), 'autumn');
    assert.strictEqual(cal.getSeason(90), 'autumn');
});

test('CalendarService: getSeason for days 91-120 is winter', () => {
    const village = mockVillageService();
    const heroes = mockHeroService();
    const cal = new CalendarService(village, heroes);

    assert.strictEqual(cal.getSeason(91), 'winter');
    assert.strictEqual(cal.getSeason(100), 'winter');
    assert.strictEqual(cal.getSeason(120), 'winter');
});

test('CalendarService: getSeason cycles after 120 days', () => {
    const village = mockVillageService();
    const heroes = mockHeroService();
    const cal = new CalendarService(village, heroes);

    assert.strictEqual(cal.getSeason(121), 'spring');
    assert.strictEqual(cal.getSeason(151), 'summer');
});

test('CalendarService: getYear increments correctly', () => {
    const village = mockVillageService();
    const heroes = mockHeroService();
    const cal = new CalendarService(village, heroes);

    assert.strictEqual(cal.getYear(1), 1);
    assert.strictEqual(cal.getYear(120), 1);
    assert.strictEqual(cal.getYear(121), 2);
    assert.strictEqual(cal.getYear(240), 2);
    assert.strictEqual(cal.getYear(241), 3);
});

test('CalendarService: getDayOfSeason', () => {
    const village = mockVillageService();
    const heroes = mockHeroService();
    const cal = new CalendarService(village, heroes);

    assert.strictEqual(cal.getDayOfSeason(1), 1);
    assert.strictEqual(cal.getDayOfSeason(30), 30);
    assert.strictEqual(cal.getDayOfSeason(31), 1);
    assert.strictEqual(cal.getDayOfSeason(121), 1);
});

// --- Raid Generation Tests ---

test('CalendarService: no raids before day 7', () => {
    const village = mockVillageService();
    const heroes = mockHeroService();
    const cal = new CalendarService(village, heroes);

    for (let d = 1; d < 7; d++) {
        assert.strictEqual(cal._isRaidDay(d), false);
    }
});

test('CalendarService: raid generation scales with day', () => {
    const village = mockVillageService();
    const heroes = mockHeroService();
    const cal = new CalendarService(village, heroes);

    const raid10 = cal._generateRaid(10);
    const raid50 = cal._generateRaid(50);

    assert.ok(raid10.level >= 1);
    assert.ok(raid50.level >= raid10.level);
    assert.ok(raid10.enemies.length >= 2);
});

test('CalendarService: defense assignment limits', () => {
    const village = mockVillageService();
    const heroes = mockHeroService();
    const cal = new CalendarService(village, heroes);

    // Assign up to 4 defenders
    for (let i = 0; i < 4; i++) {
        const result = cal.assignDefense(`hero_${i}`);
        assert.strictEqual(result.success, true);
    }

    // Duplicate should fail
    const dup = cal.assignDefense('hero_0');
    assert.strictEqual(dup.success, false);
    assert.strictEqual(dup.error, 'error_already_assigned');

    // 5th unique should fail
    const result = cal.assignDefense('hero_4');
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_max_defenders');
});

test('CalendarService: unassignDefense', () => {
    const village = mockVillageService();
    const heroes = mockHeroService();
    const cal = new CalendarService(village, heroes);

    cal.assignDefense('hero_1');
    assert.deepStrictEqual(cal.getDefenseAssigned(), ['hero_1']);

    const result = cal.unassignDefense('hero_1');
    assert.strictEqual(result.success, true);
    assert.deepStrictEqual(cal.getDefenseAssigned(), []);

    const missing = cal.unassignDefense('hero_1');
    assert.strictEqual(missing.success, false);
    assert.strictEqual(missing.error, 'error_not_assigned');
});

// --- Raid Resolution Tests ---

test('CalendarService: resolveRaid victory path', () => {
    const village = mockVillageService({
        infrastructure: { housing: 5 },
        gold: 100
    });
    const heroes = mockHeroService([
        { id: 'h1', name: 'Arthur', strength: 50, defense: 50, maxHp: 200, hp: 200 }
    ]);
    const cal = new CalendarService(village, heroes);

    // Create a low-level raid on day 10
    cal.state.events.push({
        day: 10,
        type: 'raid',
        resolved: false,
        data: { level: 1, enemies: ['slime_green'], enemyCount: 1 }
    });
    cal.assignDefense('h1');

    const result = cal.resolveRaid(10);
    assert.ok(result);
    assert.strictEqual(result.isVictory, true);
    assert.ok(result.goldReward > 0);
    assert.ok(village.state.gold > 100);

    // Defenders should take ~15% damage
    const hero = heroes.list()[0];
    assert.ok(hero.hp < 200);
    assert.ok(hero.hp >= 170); // at least 200 - 30

    // Defense assignments cleared
    assert.deepStrictEqual(cal.getDefenseAssigned(), []);
});

test('CalendarService: resolveRaid defeat path', () => {
    const village = mockVillageService({
        infrastructure: { housing: 0, farm: 1 },
        gold: 100,
        inventoryService: {
            getItemCount(id) { return id === 'material_wood' ? 10 : id === 'material_stone' ? 10 : 0; },
            useItem(id, qty) {}
        }
    });
    const heroes = mockHeroService([
        { id: 'h1', name: 'Arthur', strength: 1, defense: 1, maxHp: 10, hp: 10 }
    ]);
    const cal = new CalendarService(village, heroes);

    // Create a high-level raid
    cal.state.events.push({
        day: 100,
        type: 'raid',
        resolved: false,
        data: { level: 10, enemies: ['goblin_king', 'goblin_king'], enemyCount: 2 }
    });
    cal.assignDefense('h1');

    const result = cal.resolveRaid(100);
    assert.ok(result);
    assert.strictEqual(result.isVictory, false);

    // Defenders should take ~40% damage
    const hero = heroes.list()[0];
    assert.ok(hero.hp < 10);
    assert.ok(hero.hp >= 6); // at least 10 - 4
});

test('CalendarService: win chance clamping', () => {
    const village = mockVillageService();
    const heroes = mockHeroService();
    const cal = new CalendarService(village, heroes);

    // Create an event manually to test the math
    cal.state.events.push({
        day: 10,
        type: 'raid',
        resolved: false,
        data: { level: 1, enemies: ['slime_green'], enemyCount: 1 }
    });

    // With overwhelming defense power, winChance should be capped at 0.95
    const villageStrong = mockVillageService({ infrastructure: { housing: 100 } });
    const calStrong = new CalendarService(villageStrong, heroes);
    calStrong.state.events = [...cal.state.events];
    calStrong.assignDefense('h1');

    // We can't easily test the exact winChance without mocking Math.random,
    // but we can verify the result shape
    const result = calStrong.resolveRaid(10);
    assert.ok(result.winChance >= 0.15 && result.winChance <= 0.95);
});

test('CalendarService: getState returns correct shape', () => {
    const village = mockVillageService();
    const heroes = mockHeroService();
    const cal = new CalendarService(village, heroes);

    const state = cal.getState(45);
    assert.strictEqual(state.day, 45);
    assert.strictEqual(state.season, 'summer');
    assert.strictEqual(state.year, 1);
    assert.strictEqual(state.dayOfSeason, 15);
    assert.ok(state.seasonEffects);
    assert.ok(Array.isArray(state.upcomingEvents));
    assert.ok(Array.isArray(state.defenseAssigned));
});
