import test from 'node:test';
import assert from 'node:assert';
import { PlayerService } from '../../services/PlayerService.js';

// Mock localStorage for Node environment
globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

test('PlayerService: Spend Gold Success', () => {
    const player = new PlayerService();
    player.data = { gold: 100, cores: 10, milestone: 0 };

    const result = player.spendGold(40);
    assert.strictEqual(result.success, true);
    assert.strictEqual(player.gold, 60);
});

test('PlayerService: Spend Gold Failure', () => {
    const player = new PlayerService();
    player.data = { gold: 10, cores: 10, milestone: 0 };

    const result = player.spendGold(40);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_not_enough_gold');
    assert.strictEqual(player.gold, 10);
});
