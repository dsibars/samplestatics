import test from 'node:test';
import assert from 'node:assert';

// Mock LocalStorage BEFORE importing engine
class MockLocalStorage {
    constructor() {
        this.store = {};
    }
    getItem(key) {
        return this.store[key] || null;
    }
    setItem(key, value) {
        this.store[key] = value.toString();
    }
    removeItem(key) {
        delete this.store[key];
    }
    clear() {
        this.store = {};
    }
    key(index) {
        return Object.keys(this.store)[index];
    }
    get length() {
        return Object.keys(this.store).length;
    }
}

const mockLS = new MockLocalStorage();
Object.defineProperty(globalThis, 'localStorage', {
    value: mockLS,
    writable: true,
    configurable: true
});

if (!globalThis.crypto) {
    globalThis.crypto = {};
}
if (!globalThis.crypto.randomUUID) {
    globalThis.crypto.randomUUID = () => Math.random().toString(36).substring(2);
}

// Now import engine dynamically
const { engine } = await import('../../Engine.js');

test('Infinite Adventure Functional Test', async (t) => {
    // Reset state
    mockLS.clear();
    engine.resetAll();

    // Enable auto-battle to avoid infinite loop in nextTurn()
    engine.player.setAutoBattle(true);

    // 1. Initial State Check
    assert.strictEqual(engine.player.gold, 0, 'Should start with 0 gold');
    assert.strictEqual(engine.player.milestone, 0, 'Should start at milestone 0');
    assert.strictEqual(engine.heroes.total(), 0, 'Should start with 0 heroes');

    // 2. Recruit first hero
    const recruitResult = engine.heroes.add({
        name: 'Galahad',
        origin: 'origin_warrior'
    });
    assert.strictEqual(recruitResult.success, true, 'Should recruit hero');
    const hero = recruitResult.data;

    // Set as active
    engine.heroes.setActive(hero.id, true);
    assert.strictEqual(hero.status, 'active');

    // 3. Start Adventure - Expected to lose at milestone 1
    let advResult = engine.adventure.startAdventure();
    assert.strictEqual(advResult.success, true);
    assert.strictEqual(advResult.data.type, 'BATTLE');
    assert.strictEqual(advResult.data.milestone, 1);

    // Simulate Battle
    let safetyBreak = 0;
    while (!engine.battle.isOver && safetyBreak < 100) {
        engine.battle.nextTurn();
        safetyBreak++;
    }
    assert.ok(safetyBreak < 100, 'Battle should not loop forever');
    assert.strictEqual(engine.battle.isOver, true, 'Battle should be over');
    assert.strictEqual(engine.battle.winner, 'enemies', 'Hero should lose the first battle without upgrades');

    // Complete battle to get pity exp
    engine.adventure.completeBattle(engine.battle.winner);
    assert.strictEqual(engine.player.milestone, 0, 'Milestone should not advance on loss');

    // 4. "Smartly" spend stat points
    // Simulate some wins or just manual boost to allow progression
    hero.addExperience(200); // Level up
    assert.ok(hero.statPoints > 0);

    // Spend points
    const points = hero.statPoints;
    for(let i=0; i<points; i++) {
        // Spend all in strength for this test to ensure win
        engine.heroes.increaseHeroStat(hero.id, 'baseStrength');
    }
    assert.strictEqual(hero.statPoints, 0);

    // 5. Fight again - Should win now
    advResult = engine.adventure.startAdventure();
    assert.strictEqual(advResult.data.milestone, 1);

    safetyBreak = 0;
    while (!engine.battle.isOver && safetyBreak < 100) {
        engine.battle.nextTurn();
        safetyBreak++;
    }

    assert.strictEqual(engine.battle.winner, 'heroes', 'Hero should win after upgrades');
    engine.adventure.completeBattle('heroes');
    assert.strictEqual(engine.player.milestone, 1, 'Milestone should advance');

    // 6. Progress to Milestone 5 (Event)
    for (let m = 2; m <= 4; m++) {
        advResult = engine.adventure.nextStep();
        while (!engine.battle.isOver) { engine.battle.nextTurn(); }
        engine.adventure.completeBattle('heroes');
        assert.strictEqual(engine.player.milestone, m);
    }

    advResult = engine.adventure.nextStep();
    assert.strictEqual(advResult.data.milestone, 5);
    assert.strictEqual(advResult.data.type, 'EVENT', 'Milestone 5 should be an event');

    engine.adventure.handleEventChoice(advResult.data.eventId, 'pray');

    // 7. Progress to Milestone 10 (Boss)
    for (let m = 6; m <= 9; m++) {
        advResult = engine.adventure.nextStep();
        if (advResult.data.type === 'BATTLE') {
            while (!engine.battle.isOver) { engine.battle.nextTurn(); }
            engine.adventure.completeBattle('heroes');
        }
        // If it's an event (rare but possible depending on logic), we skip
    }

    advResult = engine.adventure.nextStep();
    assert.strictEqual(advResult.data.milestone, 10);
    assert.strictEqual(advResult.data.enemies[0].isBoss, true, 'Milestone 10 should be a boss');

    // Boost hero again to ensure boss win
    hero.baseStrength += 500;
    hero.baseMaxHp += 1000;
    hero.recalculateStats();
    hero.hp = hero.maxHp;

    // Reset Battle service to ensure it's fresh for the boss fight
    // Actually nextStep starts it. Let's just run it.

    let safety = 0;
    while (!engine.battle.isOver && safety < 1000) {
        engine.battle.nextTurn();
        safety++;
    }
    assert.strictEqual(engine.battle.winner, 'heroes', 'Hero should win against boss');

    engine.adventure.completeBattle('heroes');
    assert.strictEqual(engine.player.milestone, 10);
    assert.ok(engine.player.cores > 0, 'Should earn cores from boss');

    // 8. Test progression persistence
    // New adventure should start from 11
    const finalAdv = engine.adventure.startAdventure();
    assert.strictEqual(finalAdv.data.milestone, 11);
});
