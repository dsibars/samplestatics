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
            activeExpedition: null,
            regions: {
                reg_greenfields: {
                    clears: 0,
                    unlocked: true,
                    availableNodes: [
                        {
                            id: 'exp_tutorial_cave',
                            name: 'Tutorial Cave',
                            regionId: 'reg_greenfields',
                            isStory: true,
                            reward: { gold: 100, items: { material_wood: 20, material_stone: 10 } },
                            stages: [
                                { type: 'battle', enemies: ['slime_green', 'slime_green'] },
                                { type: 'battle', enemies: ['slime_fire'], isBoss: true }
                            ]
                        }
                    ]
                }
            }
        };
        return persistence.load(this.STORAGE_KEY, defaultState);
    }

    save() {
        persistence.save(this.STORAGE_KEY, this.state);
    }

    /**
     * Returns the list of all expeditions across all unlocked regions.
     */
    getExpeditions() {
        const all = [];
        for (const [regionId, regionState] of Object.entries(this.state.regions)) {
            if (regionState.unlocked) {
                regionState.availableNodes.forEach(node => {
                    all.push({ ...node, status: 'available' });
                });
            }
        }
        return all;
    }

    /**
     * Get Region definition data
     */
    _getRegionData(regionId) {
        const REGIONS = {
            reg_greenfields: { name: 'Greenfields', branching: 'low', minStages: 1, maxStages: 2, enemies: ['slime_green', 'wild_boar'] },
            reg_tiny_cave: { name: 'Tiny Cave', branching: 'medium', minStages: 2, maxStages: 2, enemies: ['bat_small', 'spider_minor'] },
            reg_calmed_beach: { name: 'Calmed Beach', branching: 'low', minStages: 3, maxStages: 3, enemies: ['crab_shell', 'water_spirit_minor'] }
        };
        return REGIONS[regionId] || REGIONS['reg_greenfields'];
    }

    _generateNextNodes(regionId) {
        const region = this.state.regions[regionId];
        if (!region) return;

        // Story triggers
        if (regionId === 'reg_greenfields' && region.clears === 5 && !this.state.completedIds.includes('exp_rescue_mission')) {
            region.availableNodes.push({
                id: 'exp_rescue_mission',
                name: 'The Captured Guard',
                regionId: 'reg_greenfields',
                isStory: true,
                reward: { gold: 300, special: { type: 'hero', value: 'Sir Valen' } },
                stages: [
                    { type: 'battle', enemies: ['goblin_scout', 'goblin_scout'] },
                    { type: 'battle', enemies: ['goblin_grunt', 'goblin_grunt', 'goblin_grunt'] },
                    { type: 'battle', enemies: ['goblin_grunt', 'goblin_grunt', 'goblin_brute'], isBoss: true }
                ]
            });
        }

        // Procedural generation
        const rData = this._getRegionData(regionId);
        let branchCount = 1;
        if (rData.branching === 'medium' && Math.random() < 0.3) branchCount = 2;
        if (rData.branching === 'high') branchCount = Math.random() < 0.5 ? 2 : (Math.random() < 0.1 ? 3 : 1);

        for (let i = 0; i < branchCount; i++) {
            region.availableNodes.push(this._createProceduralNode(regionId, rData, region.clears));
        }
    }

    _createProceduralNode(regionId, rData, clears) {
        const id = 'proc_' + crypto.randomUUID().split('-')[0];
        
        // Stage count complexity
        const stagesCount = Math.max(rData.minStages, Math.min(rData.maxStages, rData.minStages + Math.floor(clears / 5)));
        const stages = [];
        
        for (let i = 0; i < stagesCount; i++) {
            const isBoss = (i === stagesCount - 1);
            const enemyCount = isBoss ? 1 : Math.floor(Math.random() * 3) + 1; // 1 to 3 enemies
            const encounter = [];
            for(let e=0; e<enemyCount; e++) {
                encounter.push(rData.enemies[Math.floor(Math.random() * rData.enemies.length)]);
            }
            // If it's boss, maybe add a stronger enemy or boss version (mocked for now)
            stages.push({ type: 'battle', enemies: encounter, isBoss });
        }

        return {
            id,
            name: `${rData.name} Path`,
            regionId,
            isStory: false,
            reward: { gold: 50 + (clears * 10) },
            stages
        };
    }

    /**
     * Determines if a hero is currently on an expedition.
     * Future-proofed for when multiple expeditions run concurrently.
     */
    getHeroActivity(heroId) {
        // Currently we only have one active expedition, but this centralizes the check
        if (this.state.activeExpedition && this.state.activeExpedition.heroIds.includes(heroId)) {
            return {
                type: 'expedition',
                expeditionId: this.state.activeExpedition.id
            };
        }
        return { type: 'idle' };
    }

    /**
     * Assigns heroes to an expedition.
     * Can only add/modify if currentStage === 0.
     */
    assignExpedition(expId, heroIds) {
        if (this.state.activeExpedition) {
            if (this.state.activeExpedition.id !== expId) {
                return Result.fail('error_other_expedition_active');
            }
            if (this.state.activeExpedition.currentStage > 0) {
                return Result.fail('error_expedition_locked');
            }
        }
        
        const exp = this.getExpeditions().find(e => e.id === expId);
        if (!exp || exp.status !== 'available') return Result.fail('error_expedition_unavailable');

        const heroes = heroIds.map(id => this.heroService.get(id)).filter(h => h);
        if (heroes.length === 0) {
            // If they assign 0 heroes, it's effectively unassigning all.
            this.state.activeExpedition = null;
            this.save();
            return Result.ok();
        }

        const hasDeadHero = heroes.some(h => h.hp <= 0);
        if (hasDeadHero) return Result.fail('error_hero_dead');

        this.state.activeExpedition = {
            id: expId,
            currentStage: 0,
            heroIds: heroes.map(h => h.id),
            status: 'assigned'
        };

        this.save();
        return Result.ok(this.state.activeExpedition);
    }

    /**
     * Unassigns a single hero. If the expedition becomes empty, it resets.
     */
    unassignHero(heroId) {
        if (!this.state.activeExpedition) return Result.fail('error_no_active_expedition');
        
        this.state.activeExpedition.heroIds = this.state.activeExpedition.heroIds.filter(id => id !== heroId);
        
        if (this.state.activeExpedition.heroIds.length === 0) {
            this.state.activeExpedition = null;
        }
        this.save();
        return Result.ok();
    }

    /**
     * Retires the entire expedition, resetting it to stage 0.
     */
    retire() {
        this.state.activeExpedition = null;
        this.save();
        return Result.ok();
    }

    /**
     * Processes one stage of the active expedition during the day advance.
     */
    processDay() {
        if (!this.state.activeExpedition || this.state.activeExpedition.heroIds.length === 0) {
            return Result.ok();
        }

        const exp = this.getExpeditions().find(e => e.id === this.state.activeExpedition.id);
        if (!exp) return Result.fail('error_expedition_not_found');

        const stage = exp.stages[this.state.activeExpedition.currentStage];

        if (stage.type === 'battle') {
            const heroes = this.heroService.list().filter(h => this.state.activeExpedition.heroIds.includes(h.id));
            const enemies = stage.enemies.map(eId => this._createEnemy(eId, stage.isBoss));

            // Track initial HP for the log
            const initialHp = {};
            heroes.forEach(h => initialHp[h.id] = h.hp);

            // Calculate potential EXP
            const totalEnemyHp = enemies.reduce((sum, e) => sum + e.maxHp, 0);
            const expPerHero = Math.floor(totalEnemyHp / heroes.length);

            // Execute combat
            this.battleService.startBattle(heroes, enemies, true);
            while (!this.battleService.isOver) {
                this.battleService.nextTurn();
            }

            const isVictory = this.battleService.winner === 'heroes';
            const stageNum = this.state.activeExpedition.currentStage + 1;
            const stageTotal = exp.stages.length;

            const combatLog = {
                heroes: heroes.map(h => h.name),
                enemies: enemies.map(e => e.name),
                events: [...this.battleService.log],
                summary: [],
                isVictory
            };

            heroes.forEach(h => {
                let leveledUp = false;
                let expEarned = 0;

                if (isVictory && h.hp > 0) {
                    const preLevel = h.level;
                    h.addExperience(expPerHero);
                    leveledUp = h.level > preLevel;
                    expEarned = expPerHero;
                }

                const hpLost = initialHp[h.id] - h.hp;

                combatLog.summary.push({
                    heroId: h.id,
                    heroName: h.name,
                    expName: exp.name,
                    stageNum,
                    stageTotal,
                    expEarned,
                    leveledUp,
                    hpLost
                });
            });

            this.heroService.saveAll();

            if (isVictory) {
                this.state.activeExpedition.currentStage++;
                if (this.state.activeExpedition.currentStage >= exp.stages.length) {
                    const result = this._finishExpedition(exp);
                    result.data.combatLog = combatLog;
                    return result;
                } else {
                    this.save();
                    return Result.ok({ status: 'progress', expId: exp.id, expName: exp.name, combatLog });
                }
            } else {
                // Defeat resets the expedition completely and loses progress
                this.state.activeExpedition = null;
                this.save();
                return Result.ok({ status: 'failed', expId: exp.id, expName: exp.name, combatLog });
            }
        }

        return Result.fail('error_unknown_stage_type');
    }

    _finishExpedition(exp) {
        this.state.completedIds.push(exp.id);
        this.state.activeExpedition = null;

        // Update Region Discovery
        const region = this.state.regions[exp.regionId];
        if (region) {
            region.clears++;
            region.availableNodes = region.availableNodes.filter(n => n.id !== exp.id);
            this._generateNextNodes(exp.regionId);
        }

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
        return Result.ok({ status: 'completed', expId: exp.id, expName: exp.name, reward: exp.reward });
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
