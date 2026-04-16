import test from 'node:test';
import assert from 'node:assert';
import { InventoryService } from '../../services/InventoryService.js';
import { Equipment } from '../../models/Equipment.js';

// Mock localStorage for Node environment
globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

test('InventoryService: Add Equipment', () => {
    const inventory = new InventoryService();
    const weapon = new Equipment({ type: 'weapon', family: 'dagger', material: 'wooden' });

    inventory.addEquipment(weapon);
    assert.strictEqual(inventory.listEquipment().length, 1);
    assert.strictEqual(inventory.getEquipment(weapon.id).family, 'dagger');
});

test('InventoryService: Consumable Items', () => {
    const inventory = new InventoryService();
    inventory.addItem('tiny_potion', 5);
    assert.strictEqual(inventory.getItemCount('tiny_potion'), 5);

    inventory.useItem('tiny_potion');
    assert.strictEqual(inventory.getItemCount('tiny_potion'), 4);
});
