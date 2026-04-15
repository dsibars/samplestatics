import { persistence } from '../core/Persistence.js';
import { Result } from '../core/Result.js';
import { Equipment } from '../models/Equipment.js';

export class InventoryService {
    constructor() {
        this.STORAGE_KEY = 'inventory_data';
        this.data = this._load();
    }

    _load() {
        const defaultData = {
            items: {
                tiny_potion: 0,
                tiny_mana_potion: 0
            },
            equipment: []
        };
        const loaded = persistence.load(this.STORAGE_KEY, defaultData);
        // Hydrate equipment
        loaded.equipment = (loaded.equipment || []).map(e => new Equipment(e));
        return loaded;
    }

    save() {
        const toSave = {
            items: this.data.items,
            equipment: this.data.equipment.map(e => e.toJSON())
        };
        persistence.save(this.STORAGE_KEY, toSave);
    }

    // Item methods
    getItemCount(id) {
        return this.data.items[id] || 0;
    }

    addItem(id, count = 1) {
        this.data.items[id] = (this.data.items[id] || 0) + count;
        this.save();
        return Result.ok(this.data.items[id]);
    }

    useItem(id) {
        if (this.data.items[id] > 0) {
            this.data.items[id]--;
            this.save();
            return Result.ok(this.data.items[id]);
        }
        return Result.fail('error_not_enough_items');
    }

    // Equipment methods
    listEquipment() {
        return [...this.data.equipment];
    }

    getEquipment(id) {
        return this.data.equipment.find(e => e.id === id) || null;
    }

    addEquipment(item) {
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

    reset() {
        this.data = {
            items: {
                tiny_potion: 0,
                tiny_mana_potion: 0
            },
            equipment: []
        };
        this.save();
    }
}

export const inventoryService = new InventoryService();
