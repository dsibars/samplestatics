globalThis.localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
    clear() {}
};

import test from 'node:test';
import assert from 'node:assert';
import { InventoryService } from '../../../src/rpg-village/js/engine/shared/inventory/services/InventoryService.js';

test('InventoryService: Add and Retrieve Items', () => {
    const inventory = new InventoryService();
    
    // Add materials
    inventory.addItem('material_wood', 10);
    assert.strictEqual(inventory.getItemCount('material_wood'), 30);

    // Use materials
    const success = inventory.useItem('material_wood', 4);
    assert.strictEqual(success.success, true);
    assert.strictEqual(inventory.getItemCount('material_wood'), 26);

    // Insufficient items
    const fail = inventory.useItem('material_wood', 40);
    assert.strictEqual(fail.success, false);
    assert.strictEqual(inventory.getItemCount('material_wood'), 26);
});

test('InventoryService: Storage Constraints', () => {
    const inventory = new InventoryService();
    
    // Default items: wood (20) + stone (10) + grain (30) = 60
    inventory.addItem('material_wood', 5);
    inventory.addItem('tiny_hp_potion', 3);
    
    // Check total storage used (materials + food + consumables + equipment)
    const used = inventory.getTotalStorageUsed();
    assert.strictEqual(used, 68);
});

test('InventoryService: Equipment Management', () => {
    const inventory = new InventoryService();
    const mockEquip = {
        id: 'eq1',
        type: 'weapon',
        material: 'iron',
        slot: 'weapon'
    };

    inventory.addEquipment(mockEquip);
    
    const state = inventory.getState();
    assert.strictEqual(state.equipment.length, 1);
    assert.strictEqual(state.equipment[0].material, 'iron');

    inventory.removeEquipment('eq1');
    const newState = inventory.getState();
    assert.strictEqual(newState.equipment.length, 0);
});
