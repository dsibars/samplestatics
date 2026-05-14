import { Result } from '../../shared/core/Result.js';
import { Hero } from '../models/Hero.js';
import { persistence } from '../../shared/core/Persistence.js';

export class HeroService {
    constructor(inventoryService) {
        this.STORAGE_KEY = 'heroes_data';
        this.inventory = inventoryService;
        this.heroes = this._load();
    }

    _load() {
        const data = persistence.load(this.STORAGE_KEY, []);
        return data.map(h => {
            const hero = new Hero(h);
            hero.recalculateStats({});
            return hero;
        });
    }

    saveAll() {
        persistence.save(this.STORAGE_KEY, this.heroes.map(h => h.toJSON()));
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

    add(heroData) {
        const newHero = new Hero(heroData);
        // For MVP, we pass empty village upgrades
        newHero.recalculateStats({});
        this.heroes.push(newHero);
        this.saveAll();
        return Result.ok(newHero);
    }

    remove(id) {
        const index = this.heroes.findIndex(h => h.id === id);
        if (index !== -1) {
            const removed = this.heroes.splice(index, 1);
            this.saveAll();
            return Result.ok(removed[0]);
        }
        return Result.fail('error_hero_not_found');
    }

    setStatus(id, status) {
        const hero = this.get(id);
        if (!hero) return Result.fail('error_hero_not_found');

        hero.status = status;
        this.saveAll();
        return Result.ok(hero);
    }

    increaseHeroStat(heroId, statId) {
        const hero = this.get(heroId);
        if (!hero) return Result.fail('error_hero_not_found');

        const result = hero.increaseStat(statId);
        if (result.success) {
            hero.recalculateStats({});
            this.saveAll();
        }
        return result;
    }

    learnHeroSkill(heroId, skillId, unlockCost) {
        const hero = this.get(heroId);
        if (!hero) return Result.fail('error_hero_not_found');

        const result = hero.learnSkill(skillId, unlockCost);
        if (result.success) this.saveAll();
        return result;
    }

    upgradeHeroSkill(heroId, skillId, upgradeCost) {
        const hero = this.get(heroId);
        if (!hero) return Result.fail('error_hero_not_found');

        const result = hero.upgradeSkill(skillId, upgradeCost);
        if (result.success) this.saveAll();
        return result;
    }

    // --- Equipment ---
    equipItem(heroId, slot, equipmentId) {
        const hero = this.get(heroId);
        if (!hero) return Result.fail('error_hero_not_found');

        if (!this.inventory) return Result.fail('error_inventory_not_linked');
        
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
        hero.recalculateStats({});
        this.saveAll();
        return Result.ok(hero);
    }

    unequipItem(heroId, slot) {
        const hero = this.get(heroId);
        if (!hero) return Result.fail('error_hero_not_found');

        if (!this.inventory) return Result.fail('error_inventory_not_linked');

        const itemData = hero.equipment[slot];
        if (!itemData) return Result.fail('error_slot_empty');

        hero.equipment[slot] = null;
        this.inventory.addEquipment(itemData);

        hero.recalculateStats({});
        this.saveAll();
        return Result.ok(hero);
    }
}
