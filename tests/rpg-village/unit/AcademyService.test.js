globalThis.localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
    clear() {}
};

import test from 'node:test';
import assert from 'node:assert';
import { AcademyService } from '../../../src/rpg-village/js/engine/academy/AcademyService.js';
import { HeroService } from '../../../src/rpg-village/js/engine/heroes/services/HeroService.js';
import { InventoryService } from '../../../src/rpg-village/js/engine/shared/inventory/services/InventoryService.js';

function createService() {
    const inventory = new InventoryService();
    const heroService = new HeroService(inventory);
    return new AcademyService(heroService);
}

test('AcademyService: teach glyph from teacher to student', () => {
    const service = createService();
    const teacher = service.heroService.add({ name: 'Teacher', origin: 'origin_arcane_initiate', level: 1, statPoints: 5, glyphRepertoire: ['core_fire', 'power_plus'] }).data;
    const student = service.heroService.add({ name: 'Student', origin: 'origin_warrior', level: 1, statPoints: 5, glyphRepertoire: [] }).data;

    const result = service.teachGlyph(teacher.id, student.id, 'core_fire');
    assert.strictEqual(result.success, true);
    assert.ok(student.glyphRepertoire.includes('core_fire'));
});

test('AcademyService: teach fails if teacher does not know glyph', () => {
    const service = createService();
    const teacher = service.heroService.add({ name: 'Teacher', origin: 'origin_warrior', level: 1, statPoints: 5, glyphRepertoire: [] }).data;
    const student = service.heroService.add({ name: 'Student', origin: 'origin_warrior', level: 1, statPoints: 5, glyphRepertoire: [] }).data;

    const result = service.teachGlyph(teacher.id, student.id, 'core_fire');
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'error_teacher_does_not_know_glyph');
});

test('AcademyService: save and retrieve design', () => {
    const service = createService();
    const result = service.saveDesign({ name: 'Fireball', glyphIds: ['core_fire', 'power_plus'], mpCost: 6, damage: 14 });
    assert.strictEqual(result.success, true);

    const designs = service.getDesigns();
    assert.strictEqual(designs.length, 1);
    assert.strictEqual(designs[0].name, 'Fireball');
});

test('AcademyService: copy design to hero adds missing glyphs', () => {
    const service = createService();
    service.saveDesign({ name: 'Fireball', glyphIds: ['core_fire', 'power_plus'], mpCost: 6, damage: 14 });
    const design = service.getDesigns()[0];

    const hero = service.heroService.add({ name: 'Hero', origin: 'origin_warrior', level: 1, statPoints: 5, glyphRepertoire: ['core_fire'] }).data;
    const result = service.copyDesignToHero(design.id, hero.id);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.added, 1);
    assert.ok(hero.glyphRepertoire.includes('power_plus'));
});
