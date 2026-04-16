import test from 'node:test';
import assert from 'node:assert';

// Mock LocalStorage
class MockLocalStorage {
    constructor() { this.store = {}; }
    getItem(key) { return this.store[key] || null; }
    setItem(key, value) { this.store[key] = value.toString(); }
    removeItem(key) { delete this.store[key]; }
    clear() { this.store = {}; }
    key(index) { return Object.keys(this.store)[index]; }
    get length() { return Object.keys(this.store).length; }
}

const mockLS = new MockLocalStorage();
Object.defineProperty(globalThis, 'localStorage', { value: mockLS, writable: true, configurable: true });

if (!globalThis.crypto) globalThis.crypto = {};
if (!globalThis.crypto.randomUUID) globalThis.crypto.randomUUID = () => Math.random().toString(36).substring(2);

// Import engine
const { engine } = await import('../../Engine.js');
const { Enemy } = await import('../../models/Enemy.js');

test('Battle System Functional Test: Detailed Manual and Auto Combat', async (t) => {
    mockLS.clear();
    engine.resetAll();

    // 1. Setup a diverse party of 4 heroes
    const heroData = [
        { name: 'Tank', origin: 'origin_warrior' },
        { name: 'DPS', origin: 'origin_thief' },
        { name: 'Support', origin: 'origin_monk' },
        { name: 'Hybrid', origin: 'origin_poet' }
    ];

    const heroes = heroData.map(data => engine.heroes.add(data).data);
    heroes.forEach(h => engine.heroes.setActive(h.id, true));

    // Boost them and equip some basics (simulated)
    heroes.forEach(h => {
        h.baseStrength += 20;
        h.baseDefense += 10;
        h.baseSpeed += 5;
        h.recalculateStats();
        h.hp = h.maxHp;
        h.mp = h.maxMp;
    });

    // 2. MANUAL BATTLE TEST
    await t.test('Detailed Manual Combat Flow', () => {
        engine.player.setAutoBattle(false);

        const enemies = [
            new Enemy({ id: 'e1', name: 'Goblin 1', maxHp: 50, strength: 5, defense: 2, speed: 2 }),
            new Enemy({ id: 'e2', name: 'Goblin 2', maxHp: 50, strength: 5, defense: 2, speed: 2 })
        ];

        const startRes = engine.battle.startBattle(heroes, enemies, false);
        assert.strictEqual(startRes.success, true);
        assert.strictEqual(engine.battle.turnOrder.length, 6); // 4 heroes + 2 enemies

        // Execute turns until a hero turn is reached
        let battleResult;
        let actor;

        while (!engine.battle.isOver) {
            battleResult = engine.battle.nextTurn();
            assert.strictEqual(battleResult.success, true);

            if (battleResult.data.actionRequired) {
                // Assert detailed info for manual turn
                actor = engine.battle.turnOrder[engine.battle.currentTurnIndex];
                assert.strictEqual(battleResult.data.entity.id, actor.id);
                assert.ok(heroes.some(h => h.id === actor.id), 'Manual turn should be for a hero');

                // Execute a manual action
                const target = enemies.find(e => e.hp > 0);
                const actionRes = engine.battle.executeAction(actor, 'basic_attack', target.id);

                assert.strictEqual(actionRes.success, true);
                assert.ok(actionRes.data.event, 'Should have an event log');
                assert.strictEqual(actionRes.data.event.actorId, actor.id);
                assert.strictEqual(actionRes.data.event.targetId, target.id);
                assert.ok(actionRes.data.event.damage >= 0);

                if (actionRes.data.battleOver) break;
            } else if (battleResult.data.event) {
                // Enemy turn (auto-executed)
                const event = battleResult.data.event;
                assert.ok(enemies.some(e => e.id === event.actorId), 'Auto turn should be for an enemy');
                assert.ok(heroes.some(h => h.id === event.targetId), 'Enemy should target a hero');
            }
        }
        assert.strictEqual(engine.battle.isOver, true);
    });

    // 3. AUTO BATTLE TEST
    await t.test('Detailed Auto Combat Flow', () => {
        engine.player.setAutoBattle(true);
        engine.battle.reset();

        const enemies = [
            new Enemy({ id: 'e3', name: 'Orc', maxHp: 100, strength: 15, defense: 10, speed: 1 })
        ];

        // Ensure heroes are healthy
        heroes.forEach(h => h.hp = h.maxHp);

        const startRes = engine.battle.startBattle(heroes, enemies, true);
        assert.strictEqual(startRes.success, true);

        let turns = 0;
        while (!engine.battle.isOver && turns < 100) {
            const res = engine.battle.nextTurn();
            assert.strictEqual(res.success, true);
            assert.ok(!res.data.actionRequired, 'Auto-battle should never require action');
            assert.ok(res.data.event, 'Every turn should have an event in auto-battle');
            turns++;
        }

        assert.strictEqual(engine.battle.isOver, true, 'Auto battle should complete');
        assert.ok(engine.battle.log.length > 0, 'Should have a complete battle log');
    });
});
