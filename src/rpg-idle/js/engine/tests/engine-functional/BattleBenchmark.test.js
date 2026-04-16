import test from 'node:test';
import assert from 'node:assert';
import { performance } from 'node:perf_hooks';

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

test('Battle System Benchmark: 100 Auto-Combats', async (t) => {
    mockLS.clear();
    engine.resetAll();

    // Setup 4 heroes
    const heroData = [
        { name: 'H1', origin: 'origin_warrior' },
        { name: 'H2', origin: 'origin_thief' },
        { name: 'H3', origin: 'origin_monk' },
        { name: 'H4', origin: 'origin_poet' }
    ];
    const heroes = heroData.map(data => engine.heroes.add(data).data);
    heroes.forEach(h => {
        engine.heroes.setActive(h.id, true);
        h.baseStrength += 50;
        h.baseMaxHp += 200;
        h.recalculateStats();
    });

    const NUM_BATTLES = 100;
    const MAX_DURATION_MS = 500; // Threshold: 100 full battles should take < 500ms

    engine.player.setAutoBattle(true);

    const startTime = performance.now();

    for (let i = 0; i < NUM_BATTLES; i++) {
        const enemies = [
            new Enemy({ name: 'Mob 1', maxHp: 100, strength: 10, defense: 5, speed: 5 }),
            new Enemy({ name: 'Mob 2', maxHp: 100, strength: 10, defense: 5, speed: 5 })
        ];

        engine.battle.startBattle(heroes, enemies, true);

        let turns = 0;
        while (!engine.battle.isOver && turns < 200) {
            engine.battle.nextTurn();
            turns++;
        }

        // Reset HP for next battle
        heroes.forEach(h => h.hp = h.maxHp);
    }

    const duration = performance.now() - startTime;
    console.log(`\nBenchmark: 100 battles completed in ${duration.toFixed(2)}ms`);

    assert.ok(duration < MAX_DURATION_MS, `Engine efficiency regression: 100 battles took ${duration.toFixed(2)}ms (Limit: ${MAX_DURATION_MS}ms)`);
});
