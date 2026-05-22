globalThis.localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
    clear() {}
};

import test from 'node:test';
import assert from 'node:assert';
import { HeroService } from '../../../src/rpg-village/js/engine/heroes/services/HeroService.js';
import { InventoryService } from '../../../src/rpg-village/js/engine/shared/inventory/services/InventoryService.js';

test('HeroService: add and list heroes', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);

    const result = service.add({ name: 'TestHero', origin: 'origin_warrior', level: 1, statPoints: 5 });
    assert.strictEqual(result.success, true);
    assert.ok(result.data);
    assert.strictEqual(result.data.name, 'TestHero');

    const heroes = service.list();
    assert.strictEqual(heroes.length, 1);
    assert.strictEqual(heroes[0].name, 'TestHero');
});

test('HeroService: get hero by id', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    const added = service.add({ name: 'TestHero', origin: 'origin_warrior', level: 1, statPoints: 5 });

    const hero = service.get(added.data.id);
    assert.ok(hero);
    assert.strictEqual(hero.name, 'TestHero');

    const missing = service.get('nonexistent');
    assert.strictEqual(missing, null);
});

test('HeroService: remove hero', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    const added = service.add({ name: 'TestHero', origin: 'origin_warrior', level: 1, statPoints: 5 });

    const result = service.remove(added.data.id);
    assert.strictEqual(result.success, true);
    assert.strictEqual(service.list().length, 0);

    const missing = service.remove('nonexistent');
    assert.strictEqual(missing.success, false);
    assert.strictEqual(missing.error, 'error_hero_not_found');
});

test('HeroService: increase stat success', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    const added = service.add({ name: 'TestHero', origin: 'origin_warrior', level: 1, statPoints: 5 });
    const id = added.data.id;
    const initialBaseHp = added.data.baseMaxHp;

    const result = service.increaseHeroStat(id, 'baseMaxHp');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data, initialBaseHp + 3);

    const hero = service.get(id);
    assert.strictEqual(hero.statPoints, 4);
});

test('HeroService: increase stat fails without points', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    const added = service.add({ name: 'TestHero', origin: 'origin_warrior', level: 1, statPoints: 0 });

    const result = service.increaseHeroStat(added.data.id, 'baseMaxHp');
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_no_stat_points');
});

test('HeroService: increase stat fails for unknown hero', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);

    const result = service.increaseHeroStat('nonexistent', 'baseMaxHp');
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_hero_not_found');
});

test('HeroService: equip and unequip item', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    const added = service.add({ name: 'TestHero', origin: 'origin_warrior', level: 1, statPoints: 5 });
    const heroId = added.data.id;

    // Add a weapon to inventory
    const weapon = {
        id: 'weapon_001',
        name: 'Iron Sword',
        type: 'weapon',
        family: 'broadsword',
        material: 'iron',
        slot: 'leftHand',
        level: 0,
        stats: { strength: 5 }
    };
    inventory.addEquipment(weapon);

    // Equip
    const equipResult = service.equipItem(heroId, 'leftHand', 'weapon_001');
    assert.strictEqual(equipResult.success, true);
    assert.ok(service.get(heroId).equipment.leftHand);

    // Unequip
    const unequipResult = service.unequipItem(heroId, 'leftHand');
    assert.strictEqual(unequipResult.success, true);
    assert.strictEqual(service.get(heroId).equipment.leftHand, null);
});

test('HeroService: equip fails with wrong slot', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    const added = service.add({ name: 'TestHero', origin: 'origin_warrior', level: 1, statPoints: 5 });

    const weapon = {
        id: 'weapon_001',
        name: 'Iron Sword',
        type: 'weapon',
        family: 'broadsword',
        material: 'iron',
        slot: 'leftHand',
        level: 0,
        stats: { strength: 5 }
    };
    inventory.addEquipment(weapon);

    const result = service.equipItem(added.data.id, 'head', 'weapon_001');
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_invalid_slot');
});

test('HeroService: equip fails when item not found', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    const added = service.add({ name: 'TestHero', origin: 'origin_warrior', level: 1, statPoints: 5 });

    const result = service.equipItem(added.data.id, 'leftHand', 'nonexistent');
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_item_not_found');
});

test('HeroService: unequip fails when slot empty', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    const added = service.add({ name: 'TestHero', origin: 'origin_warrior', level: 1, statPoints: 5 });

    const result = service.unequipItem(added.data.id, 'leftHand');
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_slot_empty');
});

test('HeroService: auto-unequip when equipping to occupied slot', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    const added = service.add({ name: 'TestHero', origin: 'origin_warrior', level: 1, statPoints: 5 });
    const heroId = added.data.id;

    const weapon1 = { id: 'weapon_001', name: 'Sword A', type: 'weapon', family: 'broadsword', material: 'iron', slot: 'leftHand', level: 0, stats: { strength: 5 } };
    const weapon2 = { id: 'weapon_002', name: 'Sword B', type: 'weapon', family: 'broadsword', material: 'iron', slot: 'leftHand', level: 0, stats: { strength: 8 } };
    inventory.addEquipment(weapon1);
    inventory.addEquipment(weapon2);

    service.equipItem(heroId, 'leftHand', 'weapon_001');
    assert.strictEqual(service.get(heroId).equipment.leftHand.id, 'weapon_001');

    // Equipping second weapon should auto-unequip first
    service.equipItem(heroId, 'leftHand', 'weapon_002');
    assert.strictEqual(service.get(heroId).equipment.leftHand.id, 'weapon_002');
    assert.ok(inventory.getEquipment('weapon_001')); // First weapon back in inventory
});

test('HeroService: learn and upgrade skill', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    const added = service.add({ name: 'TestHero', origin: 'origin_warrior', level: 1, statPoints: 5, skillPoints: 5 });
    const heroId = added.data.id;

    const learnResult = service.learnHeroSkill(heroId, 'double_attack', 2);
    assert.strictEqual(learnResult.success, true);
    assert.strictEqual(service.get(heroId).skills.double_attack, 0);

    const upgradeResult = service.upgradeHeroSkill(heroId, 'double_attack', 1);
    assert.strictEqual(upgradeResult.success, true);
    assert.strictEqual(service.get(heroId).skills.double_attack, 1);
});

test('HeroService: learn skill fails without points', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    const added = service.add({ name: 'TestHero', origin: 'origin_warrior', level: 1, statPoints: 5, skillPoints: 0 });

    const result = service.learnHeroSkill(added.data.id, 'double_attack', 2);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_no_skill_points');
});

test('HeroService: learn skill fails if already learned', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    const added = service.add({ name: 'TestHero', origin: 'origin_warrior', level: 1, statPoints: 5, skillPoints: 5 });
    const heroId = added.data.id;

    service.learnHeroSkill(heroId, 'double_attack', 2);
    const result = service.learnHeroSkill(heroId, 'double_attack', 2);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_skill_already_unlocked');
});

test('HeroService: tick meal buffs', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    const added = service.add({ name: 'TestHero', origin: 'origin_warrior', level: 1, statPoints: 5 });
    const hero = service.get(added.data.id);

    hero.mealBuffs = [{ stat: 'strength', value: 5, battlesRemaining: 2 }];
    hero.recalculateStats();

    // First tick: 2→1, no buff expires yet
    const changed1 = service.tickAllMealBuffs();
    assert.strictEqual(changed1, false);
    assert.strictEqual(hero.mealBuffs.length, 1);
    assert.strictEqual(hero.mealBuffs[0].battlesRemaining, 1);

    // Second tick: 1→0, buff expires
    const changed2 = service.tickAllMealBuffs();
    assert.strictEqual(changed2, true);
    assert.strictEqual(hero.mealBuffs.length, 0);

    // Third tick: nothing to tick
    const changed3 = service.tickAllMealBuffs();
    assert.strictEqual(changed3, false);
});

test('HeroService: setStatus', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    const added = service.add({ name: 'TestHero', origin: 'origin_warrior', level: 1, statPoints: 5 });

    const result = service.setStatus(added.data.id, 'active');
    assert.strictEqual(result.success, true);
    assert.strictEqual(service.get(added.data.id).status, 'active');

    const missing = service.setStatus('nonexistent', 'resting');
    assert.strictEqual(missing.success, false);
});


test('HeroService: stamina initialized on creation', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    const added = service.add({ name: 'TestHero', origin: 'origin_warrior', level: 1, statPoints: 5 });
    const hero = service.get(added.data.id);

    assert.ok(hero.maxStamina > 0, 'maxStamina should be calculated');
    assert.strictEqual(hero.stamina, hero.maxStamina, 'stamina should start at max');
});

test('HeroService: stamina formula is correct', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    const added = service.add({ 
        name: 'TestHero', 
        origin: 'origin_warrior', 
        level: 1, 
        statPoints: 5,
        baseStrength: 10,
        baseDefense: 5
    });
    const hero = service.get(added.data.id);

    // maxStamina = (strength * 3) + (defense * 2) + (level * 2)
    const expected = (hero.strength * 3) + (hero.defense * 2) + (hero.level * 2);
    assert.strictEqual(hero.maxStamina, expected, `maxStamina should be ${expected}`);
});

test('HeroService: stamina restores on level up', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    const added = service.add({ name: 'TestHero', origin: 'origin_warrior', level: 1, statPoints: 5 });
    const hero = service.get(added.data.id);

    // Drain stamina
    hero.stamina = 5;
    const preLevelMax = hero.maxStamina;

    // Level up
    hero.levelUp();

    assert.strictEqual(hero.stamina, hero.maxStamina, 'stamina should restore to max on level up');
    assert.ok(hero.maxStamina > preLevelMax, 'maxStamina should increase with level');
});

test('HeroService: assigning STR increases maxStamina', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    const added = service.add({ name: 'TestHero', origin: 'origin_warrior', level: 1, statPoints: 5 });
    const hero = service.get(added.data.id);
    const preMaxStamina = hero.maxStamina;

    service.increaseHeroStat(added.data.id, 'baseStrength');

    assert.ok(hero.maxStamina > preMaxStamina, 'maxStamina should increase after STR allocation');
    assert.strictEqual(hero.maxStamina, preMaxStamina + 3, 'maxStamina should increase by 3 per STR point');
});

test('HeroService: assigning DEF increases maxStamina', () => {
    const inventory = new InventoryService();
    const service = new HeroService(inventory);
    const added = service.add({ name: 'TestHero', origin: 'origin_warrior', level: 1, statPoints: 5 });
    const hero = service.get(added.data.id);
    const preMaxStamina = hero.maxStamina;

    service.increaseHeroStat(added.data.id, 'baseDefense');

    assert.ok(hero.maxStamina > preMaxStamina, 'maxStamina should increase after DEF allocation');
    assert.strictEqual(hero.maxStamina, preMaxStamina + 2, 'maxStamina should increase by 2 per DEF point');
});
