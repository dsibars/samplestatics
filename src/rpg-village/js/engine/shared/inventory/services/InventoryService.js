import { Result } from '../../core/Result.js';
import { Equipment } from '../models/Equipment.js';
import { persistence } from '../../core/Persistence.js';

export class InventoryService {
    constructor() {
        this.STORAGE_KEY = 'inventory_data';
        this.data = this._load();
    }

    _load() {
        const defaultData = {
            consumables: {},
            equipment: []
        };
        const loaded = persistence.load(this.STORAGE_KEY, defaultData);
        // Hydrate equipment models
        loaded.equipment = (loaded.equipment || []).map(e => new Equipment(e));
        return loaded;
    }

    save() {
        const toSave = {
            consumables: this.data.consumables,
            equipment: this.data.equipment.map(e => e.toJSON())
        };
        persistence.save(this.STORAGE_KEY, toSave);
    }

    getTotalItemCount() {
        const consumableTotal = Object.values(this.data.consumables).reduce((a, b) => a + b, 0);
        const equipmentTotal = this.data.equipment.length;
        return consumableTotal + equipmentTotal;
    }

    // --- Consumables ---
    getConsumableCount(id) {
        return this.data.consumables[id] || 0;
    }

    addConsumable(id, count = 1) {
        this.data.consumables[id] = (this.data.consumables[id] || 0) + count;
        this.save();
        return Result.ok(this.data.consumables[id]);
    }

    useConsumable(id, count = 1) {
        const current = this.data.consumables[id] || 0;
        if (current >= count) {
            this.data.consumables[id] -= count;
            this.save();
            return Result.ok(this.data.consumables[id]);
        }
        return Result.fail('error_not_enough_consumables');
    }

    // --- Equipment ---
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
}
