globalThis.localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
    clear() {}
};

import test from 'node:test';
import assert from 'node:assert';
import { TitleService } from '../../../src/rpg-village/js/engine/hall_of_fame/TitleService.js';

function createHero(stats = {}, titles = []) {
    return { lifetimeStats: stats, titles: [...titles] };
}

test('TitleService: awards First Blood', () => {
    const hero = createHero({ enemiesDefeated: 1 });
    const newTitles = TitleService.evaluate(hero);
    assert.ok(newTitles.includes('title_first_blood'));
    assert.ok(hero.titles.includes('title_first_blood'));
});

test('TitleService: awards Veteran at 50 kills', () => {
    const hero = createHero({ enemiesDefeated: 50 });
    const newTitles = TitleService.evaluate(hero);
    assert.ok(newTitles.includes('title_veteran'));
});

test('TitleService: awards multiple titles at once', () => {
    const hero = createHero({ enemiesDefeated: 500, damageDealt: 1500, expeditionsCompleted: 10, battlesWon: 15, highestDamageDealt: 150 });
    const newTitles = TitleService.evaluate(hero);
    assert.ok(newTitles.includes('title_first_blood'));
    assert.ok(newTitles.includes('title_veteran'));
    assert.ok(newTitles.includes('title_slayer'));
    assert.ok(newTitles.includes('title_legend'));
    assert.ok(newTitles.includes('title_titan'));
    assert.ok(newTitles.includes('title_explorer'));
    assert.ok(newTitles.includes('title_survivor'));
    assert.ok(newTitles.includes('title_unstoppable'));
});

test('TitleService: does not duplicate titles', () => {
    const hero = createHero({ enemiesDefeated: 1 }, ['title_first_blood']);
    const newTitles = TitleService.evaluate(hero);
    assert.strictEqual(newTitles.length, 0);
    assert.strictEqual(hero.titles.filter(t => t === 'title_first_blood').length, 1);
});

test('TitleService: returns all title IDs', () => {
    const all = TitleService.getAllTitles();
    assert.strictEqual(all.length, 8);
});
