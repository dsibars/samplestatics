import { persistence } from '../core/Persistence.js';
import { Result } from '../core/Result.js';
import { Hero } from '../models/Hero.js';

export class HeroService {
    constructor(inventoryService, villageService) {
        this.STORAGE_KEY = 'heroes_data';
        this.inventory = inventoryService;
        this.village = villageService;
        this.heroes = this._load();
    }

    _load() {
        const data = persistence.load(this.STORAGE_KEY, []);
        return data.map(h => {
            const hero = new Hero(h);
            this._recalculateHeroStats(hero);
            return hero;
        });
    }

    saveAll() {
        persistence.save(this.STORAGE_KEY, this.heroes.map(h => h.toJSON()));
    }

    save(hero) {
        const index = this.heroes.findIndex(h => h.id === hero.id);
        if (index !== -1) {
            this.heroes[index] = hero;
            this.saveAll();
            return Result.ok();
        }
        return Result.fail('error_hero_not_found');
    }

    get(id) {
        return this.heroes.find(h => h.id === id) || null;
    }

    list(status = null) {
        if (status) {
            return this.heroes.filter(h => h.status === status);
        }
        return [...this.heroes];
    }

    total() {
        return this.heroes.length;
    }

    add(heroData) {
        const maxRoster = 4 + (this.village ? this.village.getBuildingLevel('rosterSizeLevel') : 0);
        if (this.heroes.length >= maxRoster) {
            return Result.fail('error_roster_full');
        }

        const newHero = new Hero(heroData);
        this._recalculateHeroStats(newHero);
        this.heroes.push(newHero);
        this.saveAll();
        return Result.ok(newHero);
    }

    remove(id) {
        const index = this.heroes.findIndex(h => h.id === id);
        if (index !== -1) {
            const hero = this.heroes[index];
            if (hero.status === 'active') return Result.fail('error_hero_active');
            if (hero.status === 'training') return Result.fail('error_hero_busy');

            // Unequip all before removing
            Object.keys(hero.equipment).forEach(slot => {
                this.unequipItem(hero.id, slot);
            });

            const removed = this.heroes.splice(index, 1);
            this.saveAll();
            return Result.ok(removed[0]);
        }
        return Result.fail('error_hero_not_found');
    }

    setActive(id, active = true) {
        const hero = this.get(id);
        if (!hero) return Result.fail('error_hero_not_found');

        if (active) {
            const maxParty = 1 + (this.village ? this.village.getBuildingLevel('partySizeLevel') : 0);
            const activeCount = this.list('active').length;
            if (activeCount >= maxParty) return Result.fail('error_party_full');
            if (hero.status === 'training') return Result.fail('error_hero_busy');
            hero.status = 'active';
        } else {
            hero.status = 'resting';
        }

        this.save(hero);
        return Result.ok(hero);
    }

    increaseHeroStat(heroId, statId) {
        const hero = this.get(heroId);
        if (!hero) return Result.fail('error_hero_not_found');

        const result = hero.increaseStat(statId);
        if (result.success) {
            this._recalculateHeroStats(hero);
            this.save(hero);
        }
        return result;
    }

    equipItem(heroId, slot, equipmentId) {
        const hero = this.get(heroId);
        if (!hero) return Result.fail('error_hero_not_found');

        const item = this.inventory.getEquipment(equipmentId);
        if (!item) return Result.fail('error_item_not_found');

        // Validation
        if (item.type === 'weapon') {
            if (slot !== 'leftHand' && slot !== 'rightHand') return Result.fail('error_invalid_slot');
        } else if (item.type === 'armor') {
            if (slot !== item.slot) return Result.fail('error_invalid_slot');
        } else {
            return Result.fail('error_invalid_item_type');
        }

        // Unequip current if exists
        if (hero.equipment[slot]) {
            this.unequipItem(heroId, slot);
        }

        // Move item from inventory to hero
        hero.equipment[slot] = item.toJSON();
        this.inventory.removeEquipment(equipmentId);

        // Update stats
        this._recalculateHeroStats(hero);
        this.save(hero);

        return Result.ok(hero);
    }

    unequipItem(heroId, slot) {
        const hero = this.get(heroId);
        if (!hero) return Result.fail('error_hero_not_found');

        const itemData = hero.equipment[slot];
        if (!itemData) return Result.fail('error_slot_empty');

        hero.equipment[slot] = null;
        this.inventory.addEquipment(itemData);

        this._recalculateHeroStats(hero);
        this.save(hero);

        return Result.ok(hero);
    }

    _recalculateHeroStats(hero) {
        const upgrades = this.village ? {
            hp_boost: this.village.getBuildingLevel('gymLevel'),
            attack_boost: this.village.getBuildingLevel('weaponShopLevel'),
            defense_boost: this.village.getBuildingLevel('armorShopLevel')
        } : {};

        hero.recalculateStats(upgrades);
    }

    reset() {
        this.heroes = [];
        this.saveAll();
    }
}
