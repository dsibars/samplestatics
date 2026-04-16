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

/**
 * Helper to simulate a battle until it's over.
 * It handles both auto-turns (enemies/auto-battle) and manual turns (heroes).
 */
function runBattleSimulation() {
    let safetyBreak = 0;
    while (!engine.battle.isOver && safetyBreak < 1000) {
        const turnResult = engine.battle.nextTurn();

        if (turnResult.success && turnResult.data.actionRequired) {
            // Manual action required for a hero
            const actor = engine.battle.turnOrder[engine.battle.currentTurnIndex];

            // AI strategy for test: attack first healthy enemy
            const target = engine.battle.enemies.find(e => e.hp > 0);
            if (target) {
                engine.battle.executeAction(actor, 'basic_attack', target.id);
            }
        }

        safetyBreak++;
    }

    if (safetyBreak >= 1000) {
        throw new Error('Battle simulation timed out - possible infinite loop');
    }
}

test('Infinite Adventure Functional Test', async (t) => {
    // Reset state
    mockLS.clear();
    engine.resetAll();

    // 0. Test both modes
    console.log('--- Testing Manual and Auto Combat ---');

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

    // 3. Start Adventure - Manual Battle Mode (Default)
    engine.player.setAutoBattle(false);
    let advResult = engine.adventure.startAdventure();
    console.log('Active Heroes:', JSON.stringify(engine.heroes.list('active').map(h => ({id:h.id, name:h.name, speed:h.speed})), null, 2));
    console.log('Battle Enemies:', JSON.stringify(engine.battle.enemies.map(e => ({id:e.id, name:e.name, speed:e.speed})), null, 2));
    console.log('Battle Turn Order:', JSON.stringify(engine.battle.turnOrder.map(e => ({id:e.id, name:e.name, speed:e.speed})), null, 2));
    assert.strictEqual(advResult.success, true);
    assert.strictEqual(advResult.data.type, 'BATTLE');
    assert.strictEqual(advResult.data.milestone, 1);

    // Assert turn by turn info is available
    // First turn might be an enemy (auto-executed)
    let firstTurn = engine.battle.nextTurn();
    console.log('First Turn Result:', JSON.stringify(firstTurn, null, 2));
    assert.strictEqual(firstTurn.success, true);

    // If it was an enemy turn, we need to call it again to get to the hero turn
    if (firstTurn.data.event && engine.battle.enemies.some(e => e.id === firstTurn.data.event.actorId)) {
        console.log('Enemy moved, calling nextTurn again for hero...');
        firstTurn = engine.battle.nextTurn();
        console.log('Second Turn Result:', JSON.stringify(firstTurn, null, 2));
    }

    assert.strictEqual(firstTurn.data.actionRequired, true, 'Manual mode should require action for hero');
    assert.ok(engine.battle.turnOrder.length > 0, 'Turn order should be populated');

    // Simulate Battle (Manual)
    runBattleSimulation();
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

    // 5. Fight again - Switch to Auto-Battle
    console.log('--- Switching to Auto-Battle ---');
    engine.player.setAutoBattle(true);
    advResult = engine.adventure.startAdventure();
    assert.strictEqual(advResult.data.milestone, 1);

    // In auto-battle, nextTurn executes immediately
    let safety = 0;
    while (!engine.battle.isOver && safety < 100) {
        const turn = engine.battle.nextTurn();
        assert.ok(!turn.data.actionRequired, 'Auto-battle should not require manual action');
        safety++;
    }

    assert.strictEqual(engine.battle.winner, 'heroes', 'Hero should win in auto-battle after upgrades');
    engine.adventure.completeBattle('heroes');
    assert.strictEqual(engine.player.milestone, 1, 'Milestone should advance');

    // 6. Progress to Milestone 5 (Event) - Mixing modes
    for (let m = 2; m <= 4; m++) {
        advResult = engine.adventure.nextStep();
        // Alternate modes for testing
        engine.player.setAutoBattle(m % 2 === 0);
        runBattleSimulation(); // This helper handles both
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
            runBattleSimulation();
            engine.adventure.completeBattle('heroes');
        }
        // If it's an event (rare but possible depending on logic), we skip
    }

    advResult = engine.adventure.nextStep();
    assert.strictEqual(advResult.data.milestone, 10);
    assert.strictEqual(advResult.data.enemies[0].isBoss, true, 'Milestone 10 should be a boss');

    // Boost hero again to ensure boss win
    hero.baseStrength += 1000;
    hero.baseMaxHp += 2000;
    hero.recalculateStats();
    hero.hp = hero.maxHp;
    hero.mp = hero.maxMp;
    // We MUST save the hero after manual stat boost if we want it to persist
    engine.heroes.save(hero);

    // Reset Battle service to ensure it's fresh for the boss fight
    // Actually nextStep starts it. Let's just run it.

    runBattleSimulation();
    assert.strictEqual(engine.battle.winner, 'heroes', 'Hero should win against boss');

    engine.adventure.completeBattle('heroes');
    assert.strictEqual(engine.player.milestone, 10);
    assert.ok(engine.player.cores > 0, 'Should earn cores from boss');

    // 8. Test progression persistence
    // New adventure should start from 11
    const finalAdv = engine.adventure.startAdventure();
    assert.strictEqual(finalAdv.data.milestone, 11);

    // 9. RESTART AND PERSISTENCE CHECK
    console.log('--- Simulating App Restart ---');
    const savedGold = engine.player.gold;
    const savedMilestone = engine.player.milestone;
    const savedCores = engine.player.cores;
    const savedHeroId = hero.id;
    const savedHeroStr = hero.strength;

    engine.restart();

    assert.strictEqual(engine.player.gold, savedGold, 'Gold should persist after restart');
    assert.strictEqual(engine.player.milestone, savedMilestone, 'Milestone should persist after restart');
    assert.strictEqual(engine.player.cores, savedCores, 'Cores should persist after restart');

    const restoredHero = engine.heroes.get(savedHeroId);
    assert.ok(restoredHero, 'Hero should persist after restart');
    assert.strictEqual(restoredHero.strength, savedHeroStr, 'Hero stats should persist after restart');
    assert.strictEqual(restoredHero.status, 'active', 'Hero status should persist after restart');
});
