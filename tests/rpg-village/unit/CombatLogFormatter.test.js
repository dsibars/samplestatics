globalThis.localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
    clear() {}
};

import test from 'node:test';
import assert from 'node:assert';
import { CombatLogFormatter } from '../../../src/rpg-village/js/engine/shared/combat/CombatLogFormatter.js';

// Minimal i18n mock that supports param replacement
const mockI18n = {
    t(key, params = {}) {
        const dict = {
            log_attack: '{attacker} attacks {target} for {damage} damage!',
            log_miss: '{attacker} missed {target}!',
            log_heal: '{attacker} heals {target} for {amount} HP!',
            log_vamp: '{actor} drains {amount} HP through vampirism.',
            log_regen: '{target} regenerates {amount} HP.',
            log_poison: '{target} takes {damage} poison damage!',
            log_burn: '{target} takes {damage} burn damage!',
            log_status_expired: "{target}'s {effect} wore off.",
            log_target_defeated: '{target} was defeated!',
            log_use_consumable: '{attacker} used {item} on {target}, restoring {amount} {stat}.',
            item_tiny_hp_potion: 'Tiny HP Potion'
        };
        let text = dict[key] || key;
        Object.keys(params).forEach(p => {
            text = text.replace(`{${p}}`, params[p]);
        });
        return text;
    }
};

test('CombatLogFormatter: DAMAGE event', () => {
    const fmt = new CombatLogFormatter(mockI18n);
    const event = {
        type: 'DAMAGE',
        actorName: 'Arthur',
        targetName: 'Goblin',
        amount: 15,
        isMiss: false,
        isCrit: false
    };
    assert.strictEqual(fmt.format(event), 'Arthur attacks Goblin for 15 damage!');
});

test('CombatLogFormatter: DAMAGE miss', () => {
    const fmt = new CombatLogFormatter(mockI18n);
    const event = {
        type: 'DAMAGE',
        actorName: 'Arthur',
        targetName: 'Goblin',
        isMiss: true
    };
    assert.strictEqual(fmt.format(event), 'Arthur missed Goblin!');
});

test('CombatLogFormatter: DAMAGE crit + defeated', () => {
    const fmt = new CombatLogFormatter(mockI18n);
    const event = {
        type: 'DAMAGE',
        actorName: 'Arthur',
        targetName: 'Goblin',
        amount: 42,
        isMiss: false,
        isCrit: true,
        targetDefeated: true
    };
    assert.strictEqual(fmt.format(event), '💥 Arthur attacks Goblin for 42 damage! Goblin was defeated!');
});

test('CombatLogFormatter: HEAL event', () => {
    const fmt = new CombatLogFormatter(mockI18n);
    const event = {
        type: 'HEAL',
        actorName: 'Mira',
        targetName: 'Arthur',
        amount: 25
    };
    assert.strictEqual(fmt.format(event), 'Mira heals Arthur for 25 HP!');
});

test('CombatLogFormatter: VAMP event', () => {
    const fmt = new CombatLogFormatter(mockI18n);
    const event = {
        type: 'VAMP',
        actorName: 'Arthur',
        amount: 8
    };
    assert.strictEqual(fmt.format(event), 'Arthur drains 8 HP through vampirism.');
});

test('CombatLogFormatter: TRAIT_REGEN event', () => {
    const fmt = new CombatLogFormatter(mockI18n);
    const event = {
        type: 'TRAIT_REGEN',
        targetName: 'Arthur',
        amount: 5
    };
    assert.strictEqual(fmt.format(event), 'Arthur regenerates 5 HP.');
});

test('CombatLogFormatter: STATUS_TICK poison', () => {
    const fmt = new CombatLogFormatter(mockI18n);
    const event = {
        type: 'STATUS_TICK',
        effectType: 'poison',
        damage: 3,
        targetName: 'Goblin'
    };
    assert.strictEqual(fmt.format(event), 'Goblin takes 3 poison damage!');
});

test('CombatLogFormatter: STATUS_TICK burn', () => {
    const fmt = new CombatLogFormatter(mockI18n);
    const event = {
        type: 'STATUS_TICK',
        effectType: 'burn',
        damage: 4,
        targetName: 'Arthur'
    };
    assert.strictEqual(fmt.format(event), 'Arthur takes 4 burn damage!');
});

test('CombatLogFormatter: STATUS_TICK unknown effect', () => {
    const fmt = new CombatLogFormatter(mockI18n);
    const event = {
        type: 'STATUS_TICK',
        effectType: 'frost',
        damage: 2,
        targetName: 'Arthur'
    };
    assert.strictEqual(fmt.format(event), 'Arthur takes 2 frost damage.');
});

test('CombatLogFormatter: STATUS_EXPIRED event', () => {
    const fmt = new CombatLogFormatter(mockI18n);
    const event = {
        type: 'STATUS_EXPIRED',
        effectType: 'haste',
        targetName: 'Arthur'
    };
    assert.strictEqual(fmt.format(event), "Arthur's haste wore off.");
});

test('CombatLogFormatter: USE_CONSUMABLE event', () => {
    const fmt = new CombatLogFormatter(mockI18n);
    const event = {
        type: 'USE_CONSUMABLE',
        actorName: 'Arthur',
        targetName: 'Arthur',
        consumableId: 'item_tiny_hp_potion',
        healType: 'HEAL_HP',
        amount: 20
    };
    assert.strictEqual(fmt.format(event), 'Arthur used Tiny HP Potion on Arthur, restoring 20 HP.');
});

test('CombatLogFormatter: unknown event type fallback', () => {
    const fmt = new CombatLogFormatter(mockI18n);
    const event = { type: 'MYSTERY', foo: 'bar' };
    assert.strictEqual(fmt.format(event), '[MYSTERY] {"type":"MYSTERY","foo":"bar"}');
});

test('CombatLogFormatter: non-object input fallback', () => {
    const fmt = new CombatLogFormatter(mockI18n);
    assert.strictEqual(fmt.format(null), 'null');
    assert.strictEqual(fmt.format('raw string'), 'raw string');
    assert.strictEqual(fmt.format(42), '42');
});
