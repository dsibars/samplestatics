import { persistence } from '../../shared/core/Persistence.js';
import { Result } from '../../shared/core/Result.js';
import { Enemy } from '../../shared/combat/models/Enemy.js';

/**
 * ExpeditionService handles manual combat challenges, stage progression,
 * and quest-chain unlocking logic.
 */
export class ExpeditionService {
    constructor(battleService, heroService, villageService, inventoryService) {
        this.battleService = battleService;
        this.heroService = heroService;
        this.villageService = villageService;
        this.inventoryService = inventoryService;
        
        this.STORAGE_KEY = 'expedition_state';
        this.state = this._load();
    }

    _load() {
        const defaultState = {
            completedIds: [],
            activeExpedition: null
        };
        return persistence.load(this.STORAGE_KEY, defaultState);
    }

    save() {
        persistence.save(this.STORAGE_KEY, this.state);
    }

    /**
     * Returns the list of all expeditions with their current status (locked, available, completed).
     */
    getExpeditions() {
        const all = [
            {
                id: 'exp_tutorial_cave',
                name: 'Tutorial Cave',
                status: 'available',
                requirement: null,
                reward: { gold: 100, items: { material_wood: 20, material_stone: 10 } },
                stages: [
                    { type: 'battle', enemies: ['slime_green', 'slime_green'] },
                    { type: 'battle', enemies: ['slime_fire'], isBoss: true }
                ]
            },
            {
                id: 'exp_wild_orchard',
                name: 'The Wild Orchard',
                status: 'locked',
                requirement: { dependencyId: 'exp_tutorial_cave' },
                reward: { gold: 150, items: { food_raw_grain: 50 } },
                stages: [
                    { type: 'battle', enemies: ['wild_boar'] },
                    { type: 'battle', enemies: ['wild_boar', 'wild_boar'] },
                    { type: 'battle', enemies: ['wild_boar'], isBoss: true }
                ]
            },
            {
                id: 'exp_rescue_mission',
                name: 'The Captured Guard',
                status: 'locked',
                requirement: { dependencyId: 'exp_wild_orchard' },
                reward: { gold: 300, special: { type: 'hero', value: 'Sir Valen' } },
                stages: [
                    { type: 'battle', enemies: ['goblin_scout', 'goblin_scout'] },
                    { type: 'battle', enemies: ['goblin_grunt', 'goblin_grunt', 'goblin_grunt'] },
                    { type: 'battle', enemies: ['goblin_grunt', 'goblin_grunt', 'goblin_brute'], isBoss: true }
                ]
            },
            {
                id: 'exp_goblin_outpost',
                name: 'Goblin Outpost',
                status: 'locked',
                requirement: { dependencyId: 'exp_rescue_mission' },
                reward: { gold: 500, special: { type: 'villagers', value: 3 } },
                stages: [
                    { type: 'battle', enemies: ['goblin_scout', 'goblin_scout', 'goblin_scout', 'goblin_scout'] },
                    { type: 'battle', enemies: ['goblin_king'], isBoss: true }
                ]
            }
        ];

        return all.map(exp => {
            if (this.state.completedIds.includes(exp.id)) {
                exp.status = 'completed';
            } else if (exp.requirement) {
                const depMet = !exp.requirement.dependencyId || this.state.completedIds.includes(exp.requirement.dependencyId);
                const buildMet = !exp.requirement.buildingId || (this.villageService.state.infrastructure[exp.requirement.buildingId] >= exp.requirement.buildingLevel);
                exp.status = (depMet && buildMet) ? 'available' : 'locked';
            } else {
                exp.status = 'available';
            }
            return exp;
        });
    }

    /**
     * Starts an expedition if requirements are met.
     */
    startExpedition(expId, heroIds) {
        if (this.state.activeExpedition) return Result.fail('error_expedition_active');
        
        const exp = this.getExpeditions().find(e => e.id === expId);
        if (!exp || exp.status !== 'available') return Result.fail('error_expedition_unavailable');

        const heroes = heroIds.map(id => this.heroService.get(id)).filter(h => h);
        if (heroes.length === 0) return Result.fail('error_no_heroes_selected');

        this.state.activeExpedition = {
            id: expId,
            currentStage: 0,
            heroIds: heroes.map(h => h.id),
            status: 'in_progress'
        };

        this.save();
        return this.nextStage();
    }

    /**
     * Progresses to the next stage of the active expedition.
     */
    nextStage() {
        if (!this.state.activeExpedition) return Result.fail('error_no_active_expedition');

        const exp = this.getExpeditions().find(e => e.id === this.state.activeExpedition.id);
        const stage = exp.stages[this.state.activeExpedition.currentStage];

        if (stage.type === 'battle') {
            const enemies = stage.enemies.map(templateId => this._createEnemy(templateId, stage.isBoss));
            const heroes = this.state.activeExpedition.heroIds.map(id => this.heroService.get(id));
            
            return this.battleService.startBattle(heroes, enemies);
        }

        return Result.fail('error_unknown_stage_type');
    }

    /**
     * Called after a battle is won to decide whether to continue or retire.
     */
    completeStage() {
        if (!this.state.activeExpedition) return Result.fail('error_no_active_expedition');

        const exp = this.getExpeditions().find(e => e.id === this.state.activeExpedition.id);
        this.state.activeExpedition.currentStage++;

        if (this.state.activeExpedition.currentStage >= exp.stages.length) {
            return this._finishExpedition(exp);
        }

        this.save();
        return Result.ok({ intermission: true });
    }

    /**
     * Retires from the current expedition, losing progress but keeping hero health.
     */
    retire() {
        this.state.activeExpedition = null;
        this.save();
        return Result.ok();
    }

    _finishExpedition(exp) {
        this.state.completedIds.push(exp.id);
        this.state.activeExpedition = null;

        // Grant rewards
        if (exp.reward.gold) this.villageService.addGold(exp.reward.gold);
        if (exp.reward.items) {
            Object.entries(exp.reward.items).forEach(([id, qty]) => {
                this.villageService.addItemToInventory(id, qty);
            });
        }
        if (exp.reward.special) {
            const s = exp.reward.special;
            if (s.type === 'hero') {
                this.heroService.add({ name: s.value, origin: 'origin_guard' });
            } else if (s.type === 'villagers') {
                this.villageService.addVillagers(s.value);
            }
        }

        this.save();
        return Result.ok({ completed: true, reward: exp.reward });
    }

    _createEnemy(templateId, isBoss) {
        // Mock data registry for enemies
        const templates = {
            slime_green: { name: 'Green Slime', type: 'beast', maxHp: 15, strength: 2, speed: 1 },
            slime_fire: { name: 'Fire Slime', type: 'beast', maxHp: 20, strength: 3, speed: 2, element: 'fire' },
            wild_boar: { name: 'Wild Boar', type: 'beast', maxHp: 25, strength: 4, speed: 3 },
            goblin_scout: { name: 'Goblin Scout', type: 'humanoid', maxHp: 22, strength: 4, speed: 5 },
            goblin_grunt: { name: 'Goblin Grunt', type: 'humanoid', maxHp: 30, strength: 5, speed: 2 },
            goblin_brute: { name: 'Goblin Brute', type: 'humanoid', maxHp: 50, strength: 6, speed: 1 },
            goblin_king: { name: 'Goblin King', type: 'humanoid', maxHp: 120, strength: 10, speed: 4, isBoss: true }
        };
        const t = templates[templateId] || templates['slime_green'];
        return new Enemy({ ...t, id: crypto.randomUUID(), isBoss });
    }
}
