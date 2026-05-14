import { Result } from '../../core/Result.js';
import { Equipment } from '../models/Equipment.js';
import { persistence } from '../../core/Persistence.js';

/**
 * InventoryService manages all physical items, including stackable resources 
 * (materials, food, consumables) and unique equipment.
 * It enforces storage limits based on village infrastructure.
 */
export class InventoryService {
    constructor() {
        this.STORAGE_KEY = 'inventory_data';
        this.data = this._load();
    }

    _load() {
        const defaultData = {
            materials: {},
            food: {},
            consumables: {},
            equipment: []
        };
        const loaded = persistence.load(this.STORAGE_KEY, defaultData);
        
        // Migration: Move old consumables if they exist
        if (loaded.consumables && Object.keys(loaded.consumables).length > 0) {
            for (const id in loaded.consumables) {
                if (id.startsWith('material_')) {
                    loaded.materials[id] = (loaded.materials[id] || 0) + loaded.consumables[id];
                    delete loaded.consumables[id];
                } else if (id.startsWith('food_')) {
                    loaded.food[id] = (loaded.food[id] || 0) + loaded.consumables[id];
                    delete loaded.consumables[id];
                }
            }
        }

        // Hydrate equipment models
        loaded.equipment = (loaded.equipment || []).map(e => new Equipment(e));
        return loaded;
    }

    save() {
        const toSave = {
            materials: this.data.materials,
            food: this.data.food,
            consumables: this.data.consumables,
            equipment: this.data.equipment.map(e => e.toJSON())
        };
        persistence.save(this.STORAGE_KEY, toSave);
    }

    /**
     * Calculates the total storage used by all stackable items and equipment.
     */
    getTotalStorageUsed() {
        const matTotal = Object.values(this.data.materials).reduce((a, b) => a + b, 0);
        const foodTotal = Object.values(this.data.food).reduce((a, b) => a + b, 0);
        const consumableTotal = Object.values(this.data.consumables).reduce((a, b) => a + b, 0);
        const equipmentTotal = this.data.equipment.length;
        
        return matTotal + foodTotal + consumableTotal + equipmentTotal;
    }

    // --- Stackable Items (Materials, Food, Consumables) ---

    getItemCount(id) {
        if (id.startsWith('material_')) return this.data.materials[id] || 0;
        if (id.startsWith('food_')) return this.data.food[id] || 0;
        return this.data.consumables[id] || 0;
    }

    /**
     * Adds an item to the inventory, respecting the maxStorage limit.
     */
    addItem(id, count = 1, maxStorage = Infinity) {
        const currentUsed = this.getTotalStorageUsed();
        if (currentUsed + count > maxStorage) {
            // Partial add if possible? For now, just fail or add up to limit
            const allowed = Math.max(0, maxStorage - currentUsed);
            if (allowed <= 0) return Result.fail('error_storage_full');
            count = Math.min(count, allowed);
        }

        if (id.startsWith('material_')) {
            this.data.materials[id] = (this.data.materials[id] || 0) + count;
        } else if (id.startsWith('food_')) {
            this.data.food[id] = (this.data.food[id] || 0) + count;
        } else {
            this.data.consumables[id] = (this.data.consumables[id] || 0) + count;
        }

        this.save();
        return Result.ok(this.getItemCount(id));
    }

    useItem(id, count = 1) {
        const current = this.getItemCount(id);
        if (current >= count) {
            if (id.startsWith('material_')) {
                this.data.materials[id] -= count;
            } else if (id.startsWith('food_')) {
                this.data.food[id] -= count;
            } else {
                this.data.consumables[id] -= count;
            }
            this.save();
            return Result.ok(this.getItemCount(id));
        }
        return Result.fail('error_not_enough_items');
    }

    // Compatibility aliases for older code
    getConsumableCount(id) { return this.getItemCount(id); }
    addConsumable(id, count = 1) { return this.addItem(id, count); }
    useConsumable(id, count = 1) { return this.useItem(id, count); }

    // --- Equipment ---

    listEquipment() {
        return [...this.data.equipment];
    }

    getEquipment(id) {
        return this.data.equipment.find(e => e.id === id) || null;
    }

    addEquipment(item, maxStorage = Infinity) {
        if (this.getTotalStorageUsed() + 1 > maxStorage) {
            return Result.fail('error_storage_full');
        }
        const instance = item instanceof Equipment ? item : new Equipment(item);
        this.data.equipment.push(instance);
        this.save();
        return Result.ok(instance);
    }

    removeEquipment(id) {
        const index = this.data.equipment.findIndex(e => e.id === id);
        if (index !== -1) {
            const removed = this.data.equipment.splice(index, 1);
            this.save();
            return Result.ok(removed[0]);
        }
        return Result.fail('error_item_not_found');
    }
}
