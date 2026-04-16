import { persistence } from '../core/Persistence.js';
import { Result } from '../core/Result.js';

export class PlayerService {
    constructor() {
        this.STORAGE_KEY = 'player_data';
        this.data = this._load();
    }

    _getDefaultData() {
        return {
            gold: 0,
            cores: 0,
            milestone: 0,
            autoBattle: false,
            inventory: {
                tiny_potion: 0,
                tiny_mana_potion: 0
            },
            equipmentInventory: []
        };
    }

    _load() {
        return persistence.load(this.STORAGE_KEY, this._getDefaultData());
    }

    save() {
        persistence.save(this.STORAGE_KEY, this.data);
    }

    get gold() { return this.data.gold; }
    get cores() { return this.data.cores; }
    get milestone() { return this.data.milestone; }
    get autoBattle() { return this.data.autoBattle; }

    setAutoBattle(value) {
        this.data.autoBattle = !!value;
        this.save();
        return Result.ok(this.data.autoBattle);
    }

    addGold(amount) {
        this.data.gold = Math.round((this.data.gold + amount) * 100) / 100;
        this.save();
        return Result.ok(this.data.gold);
    }

    spendGold(amount) {
        if (this.data.gold >= amount) {
            this.data.gold = Math.round((this.data.gold - amount) * 100) / 100;
            this.save();
            return Result.ok(this.data.gold);
        }
        return Result.fail('error_not_enough_gold');
    }

    addCores(amount) {
        this.data.cores = Math.round((this.data.cores + amount) * 100) / 100;
        this.save();
        return Result.ok(this.data.cores);
    }

    spendCores(amount) {
        if (this.data.cores >= amount) {
            this.data.cores = Math.round((this.data.cores - amount) * 100) / 100;
            this.save();
            return Result.ok(this.data.cores);
        }
        return Result.fail('error_not_enough_cores');
    }

    setMilestone(value) {
        if (value > this.data.milestone) {
            this.data.milestone = value;
            this.save();
        }
        return Result.ok(this.data.milestone);
    }

    reset() {
        this.data = this._getDefaultData();
        this.save();
    }
}

export const playerService = new PlayerService();
