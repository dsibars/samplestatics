import { persistence } from '../../shared/core/Persistence.js';
import { Result } from '../../shared/core/Result.js';

const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
const SEASON_LENGTH = 30;

const SEASON_EFFECTS = {
    spring: { growthBonus: 0.05, label: 'season_spring' },
    summer: { farmBonus: 0.10, label: 'season_summer' },
    autumn: { minerBonus: 0.10, label: 'season_autumn' },
    winter: { farmPenalty: 0.10, label: 'season_winter' }
};

export class CalendarService {
    constructor(villageService, heroService) {
        this.villageService = villageService;
        this.heroService = heroService;
        this.STORAGE_KEY = 'calendar_state';
        this.state = this._load();
    }

    _load() {
        const defaultState = {
            events: [],         // Array of { day, type, resolved, data }
            defenseAssigned: [] // Array of hero IDs assigned to defense
        };
        const loaded = persistence.load(this.STORAGE_KEY, defaultState);
        // Fallback for fields missing in old saves
        if (!loaded.events) loaded.events = [];
        if (!loaded.defenseAssigned) loaded.defenseAssigned = [];
        return loaded;
    }

    save() {
        persistence.save(this.STORAGE_KEY, this.state);
    }

    getSeason(day) {
        const seasonIndex = Math.floor((day - 1) / SEASON_LENGTH) % 4;
        return SEASONS[seasonIndex];
    }

    getYear(day) {
        return Math.floor((day - 1) / (SEASON_LENGTH * 4)) + 1;
    }

    getDayOfSeason(day) {
        return ((day - 1) % SEASON_LENGTH) + 1;
    }

    getSeasonEffects(day) {
        const season = this.getSeason(day);
        return SEASON_EFFECTS[season] || {};
    }

    generateEvents(day) {
        // Look ahead 7 days and generate any missing events
        const existingDays = new Set(this.state.events.filter(e => !e.resolved).map(e => e.day));
        
        for (let d = day; d <= day + 14; d++) {
            if (existingDays.has(d)) continue;
            
            // First raid at day 7, then every 7-14 days
            const isRaidDay = this._isRaidDay(d);
            if (isRaidDay) {
                this.state.events.push({
                    day: d,
                    type: 'raid',
                    resolved: false,
                    data: this._generateRaid(d)
                });
            }
        }

        // Clean up old resolved events
        this.state.events = this.state.events.filter(e => e.day >= day - 1 || !e.resolved);
        this.save();
    }

    _isRaidDay(day) {
        if (day < 7) return false;
        // Use a deterministic pseudo-random based on day + seed
        const seed = day * 1337 + 42;
        const rng = this._seededRandom(seed);
        // Raids happen roughly every 10-14 days
        const lastRaid = this._getLastRaidDay(day);
        const daysSinceLast = day - lastRaid;
        if (daysSinceLast < 7) return false;
        return rng() < 0.15 || daysSinceLast >= 14;
    }

    _getLastRaidDay(beforeDay) {
        const raids = this.state.events
            .filter(e => e.type === 'raid' && e.day < beforeDay)
            .sort((a, b) => b.day - a.day);
        return raids.length > 0 ? raids[0].day : 0;
    }

    _seededRandom(seed) {
        return function() {
            seed = (seed * 16807 + 0) % 2147483647;
            return (seed - 1) / 2147483646;
        };
    }

    _generateRaid(day) {
        const totalClears = Object.values(this.villageService.state.regions || {})
            .reduce((sum, r) => sum + (r.clears || 0), 0);
        
        const raidLevel = Math.max(1, Math.floor(day / 10) + Math.floor(totalClears / 5));
        const enemyCount = Math.min(6, 2 + Math.floor(day / 20));
        
        const enemyPool = ['slime_green', 'goblin_scout', 'goblin_grunt', 'wild_boar', 'bat_small'];
        const advancedPool = ['goblin_brute', 'skeleton_warrior', 'ghost_wisp', 'spider_minor', 'crab_shell'];
        const bossPool = ['goblin_king', 'slime_fire', 'young_drake'];
        
        let pool = [...enemyPool];
        if (day > 20) pool.push(...advancedPool);
        if (day > 40) pool.push(...bossPool);
        
        const enemies = [];
        for (let i = 0; i < enemyCount; i++) {
            enemies.push(pool[Math.floor(Math.random() * pool.length)]);
        }
        
        return {
            level: raidLevel,
            enemies,
            enemyCount
        };
    }

    getUpcomingEvents(day) {
        this.generateEvents(day);
        return this.state.events
            .filter(e => !e.resolved && e.day >= day)
            .sort((a, b) => a.day - b.day);
    }

    assignDefense(heroId) {
        if (this.state.defenseAssigned.includes(heroId)) {
            return Result.fail('error_already_assigned');
        }
        const maxDefenders = 4;
        if (this.state.defenseAssigned.length >= maxDefenders) {
            return Result.fail('error_max_defenders');
        }
        this.state.defenseAssigned.push(heroId);
        this.save();
        return Result.ok();
    }

    unassignDefense(heroId) {
        const idx = this.state.defenseAssigned.indexOf(heroId);
        if (idx >= 0) {
            this.state.defenseAssigned.splice(idx, 1);
            this.save();
            return Result.ok();
        }
        return Result.fail('error_not_assigned');
    }

    getDefenseAssigned() {
        return [...this.state.defenseAssigned];
    }

    resolveRaid(day) {
        const event = this.state.events.find(e => e.day === day && e.type === 'raid' && !e.resolved);
        if (!event) return null;

        event.resolved = true;
        
        const defenders = this.heroService.list().filter(h => this.state.defenseAssigned.includes(h.id));
        const raid = event.data;
        
        // Calculate defense power
        let defensePower = defenders.reduce((sum, h) => {
            return sum + h.strength + h.defense + (h.maxHp / 10);
        }, 0);
        
        // Building bonus
        const housingLevel = this.villageService.state.infrastructure.housing || 0;
        defensePower += housingLevel * 10;
        
        // Scout bonus
        const scoutCount = (this.villageService.state.population.roles?.scout || 0);
        defensePower += scoutCount * 5;
        
        // Calculate raid power
        const levelMult = Math.pow(1.1, raid.level - 1);
        const enemyTemplates = {
            slime_green: { maxHp: 20, strength: 3, defense: 2 },
            slime_fire: { maxHp: 30, strength: 5, defense: 3 },
            wild_boar: { maxHp: 40, strength: 6, defense: 4 },
            goblin_scout: { maxHp: 25, strength: 4, defense: 2 },
            goblin_grunt: { maxHp: 35, strength: 5, defense: 4 },
            goblin_brute: { maxHp: 55, strength: 7, defense: 5 },
            goblin_king: { maxHp: 120, strength: 10, defense: 6 },
            bat_small: { maxHp: 22, strength: 4, defense: 2 },
            spider_minor: { maxHp: 28, strength: 5, defense: 3 },
            crab_shell: { maxHp: 35, strength: 5, defense: 5 },
            skeleton_warrior: { maxHp: 35, strength: 5, defense: 3 },
            ghost_wisp: { maxHp: 20, strength: 3, defense: 1 },
            young_drake: { maxHp: 70, strength: 8, defense: 6 }
        };
        
        let raidPower = 0;
        raid.enemies.forEach(eId => {
            const t = enemyTemplates[eId] || enemyTemplates['slime_green'];
            raidPower += (t.strength + t.defense + (t.maxHp / 10)) * levelMult;
        });
        
        // Auto-resolve: defensePower vs raidPower with some randomness
        const rng = Math.random();
        const powerDiff = defensePower - raidPower;
        const winChance = Math.min(0.95, Math.max(0.15, 0.5 + (powerDiff / raidPower) * 0.3));
        const isVictory = rng < winChance;
        
        // Post-combat
        const result = {
            isVictory,
            defensePower: Math.floor(defensePower),
            raidPower: Math.floor(raidPower),
            winChance,
            defenders: defenders.map(h => h.name),
            enemies: raid.enemies,
            day
        };
        
        if (isVictory) {
            // Bonus rewards
            const goldReward = Math.floor(raid.level * 10 + Math.random() * 20);
            this.villageService.state.gold += goldReward;
            result.goldReward = goldReward;
        } else {
            // Penalties
            const materialLoss = Math.floor(Math.random() * 5) + 3;
            const woodLoss = Math.min(materialLoss, this.villageService.inventoryService?.getItemCount('material_wood') || 0);
            const stoneLoss = Math.min(materialLoss, this.villageService.inventoryService?.getItemCount('material_stone') || 0);
            
            if (woodLoss > 0) this.villageService.inventoryService?.useItem('material_wood', woodLoss);
            if (stoneLoss > 0) this.villageService.inventoryService?.useItem('material_stone', stoneLoss);
            
            result.woodLoss = woodLoss;
            result.stoneLoss = stoneLoss;
            
            // Small chance to damage a building
            if (Math.random() < 0.15) {
                const buildings = Object.entries(this.villageService.state.infrastructure)
                    .filter(([_, lvl]) => lvl > 0);
                if (buildings.length > 0) {
                    const [bId] = buildings[Math.floor(Math.random() * buildings.length)];
                    this.villageService.state.infrastructure[bId]--;
                    result.damagedBuilding = bId;
                }
            }
        }
        
        // Defenders take some damage even on victory
        defenders.forEach(h => {
            const dmg = Math.floor(h.maxHp * (isVictory ? 0.15 : 0.40));
            h.hp = Math.max(1, h.hp - dmg);
        });
        
        this.heroService.saveAll();
        this.villageService.save();
        
        // Clear defense assignments after battle
        this.state.defenseAssigned = [];
        this.save();
        
        event.data.result = result;
        this.save();
        
        return result;
    }

    getState(day) {
        return {
            day,
            season: this.getSeason(day),
            year: this.getYear(day),
            dayOfSeason: this.getDayOfSeason(day),
            seasonEffects: this.getSeasonEffects(day),
            upcomingEvents: this.getUpcomingEvents(day),
            defenseAssigned: this.getDefenseAssigned()
        };
    }
}
