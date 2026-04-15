import { persistence } from '../core/Persistence.js';
import { Result } from '../core/Result.js';
import { Hero } from '../models/Hero.js';

export class HeroService {
    constructor() {
        this.STORAGE_KEY = 'heroes_data';
        this.heroes = this._load();
    }

    _load() {
        const data = persistence.load(this.STORAGE_KEY, []);
        return data.map(h => new Hero(h));
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
        // Here we could check constraints (roster size, etc)
        const newHero = new Hero(heroData);
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

    setActive(id, active = true) {
        const hero = this.get(id);
        if (!hero) return Result.fail('error_hero_not_found');

        hero.status = active ? 'active' : 'resting';
        this.save(hero);
        return Result.ok(hero);
    }

    reset() {
        this.heroes = [];
        this.saveAll();
    }
}

export const heroService = new HeroService();
