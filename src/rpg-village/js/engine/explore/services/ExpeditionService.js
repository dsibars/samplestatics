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
                                { type: 'battle', enemies: ['slime_green'] },
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
            reg_greenfields: { name: 'Greenfields', branching: 'low', minStages: 1, maxStages: 2, enemies: ['slime_green', 'wild_boar'], baseLevel: 1 },
            reg_tiny_cave: { name: 'Tiny Cave', branching: 'medium', minStages: 2, maxStages: 2, enemies: ['bat_small', 'spider_minor'], baseLevel: 2 },
            reg_calmed_beach: { name: 'Calmed Beach', branching: 'low', minStages: 3, maxStages: 3, enemies: ['crab_shell', 'water_spirit_minor'], baseLevel: 2 }
        };
        return REGIONS[regionId] || REGIONS['reg_greenfields'];
    }

    _generateNextNodes(regionId) {
        const region = this.state.regions[regionId];
        if (!region) return;

        if (regionId === 'reg_greenfields') {
            // 1. If tutorial cave is cleared, but Captured Guard isn't
            if (this.state.completedIds.includes('exp_tutorial_cave') && !this.state.completedIds.includes('exp_rescue_mission')) {
                // Ensure exp_rescue_mission is added
                if (!region.availableNodes.some(n => n.id === 'exp_rescue_mission')) {
                    region.availableNodes.push({
                        id: 'exp_rescue_mission',
                        name: 'The Captured Guard',
                        regionId: 'reg_greenfields',
                        isStory: true,
                        reward: { gold: 200, items: { material_wood: 15, material_stone: 5 }, special: { type: 'hero', value: 'Sir Valen' } },
                        stages: [
                            { type: 'battle', enemies: ['slime_green', 'slime_green'] },
                            { type: 'battle', enemies: ['slime_fire'], isBoss: true }
                        ]
                    });
                }
                
                // Keep exactly 1 procedural node for resource grinding
                const procCount = region.availableNodes.filter(n => !n.isStory).length;
                if (procCount === 0) {
                    region.availableNodes.push(this._createProceduralNode(regionId, this._getRegionData(regionId), region.clears));
                }
            } 
            // 2. If Captured Guard is cleared, generate 3 procedural nodes at once
            else if (this.state.completedIds.includes('exp_rescue_mission')) {
                const procCount = region.availableNodes.filter(n => !n.isStory).length;
                if (procCount < 3) {
                    const toAdd = 3 - procCount;
                    for (let i = 0; i < toAdd; i++) {
                        region.availableNodes.push(this._createProceduralNode(regionId, this._getRegionData(regionId), region.clears));
                    }
                }
            }
        } else {
            // Standard procedural nodes generation for other regions
            const rData = this._getRegionData(regionId);
            const procCount = region.availableNodes.filter(n => !n.isStory).length;
            if (procCount < 2) {
                region.availableNodes.push(this._createProceduralNode(regionId, rData, region.clears));
            }
        }
    }

    _createProceduralNode(regionId, rData, clears) {
        const id = 'proc_' + crypto.randomUUID().split('-')[0];
        
        // Stage count complexity
        let stagesCount = Math.max(rData.minStages, Math.min(rData.maxStages, rData.minStages + Math.floor(clears / 5)));
        
        // Explorer Guild reduces stage count by 10% per level (min 1 stage)
        const explorerGuildLevel = this.villageService.getState().infrastructure.explorer_guild || 0;
        if (explorerGuildLevel > 0) {
            stagesCount = Math.max(1, Math.ceil(stagesCount * (1 - (explorerGuildLevel * 0.10))));
        }
        
        // Enemy level based on region base level + clears
        const enemyLevel = (rData.baseLevel || 1) + Math.floor(clears / 3);
        
        const stages = [];
        
        for (let i = 0; i < stagesCount; i++) {
            const isBoss = (i === stagesCount - 1);
            const enemyCount = isBoss ? 1 : Math.floor(Math.random() * 3) + 1; // 1 to 3 enemies
            const encounter = [];
            for(let e=0; e<enemyCount; e++) {
                encounter.push(rData.enemies[Math.floor(Math.random() * rData.enemies.length)]);
            }
            stages.push({ type: 'battle', enemies: encounter, isBoss, enemyLevel });
        }

        // Add region-specific material items
        const rewardItems = {};
        if (regionId === 'reg_greenfields') {
            rewardItems.material_wood = Math.floor(Math.random() * 4) + 2; // 2 to 5 Wood
            if (Math.random() < 0.5) rewardItems.material_stone = Math.floor(Math.random() * 2) + 1; // 1 to 2 Stone
        } else if (regionId === 'reg_tiny_cave') {
            rewardItems.material_stone = Math.floor(Math.random() * 4) + 2; // 2 to 5 Stone
            if (Math.random() < 0.4) rewardItems.material_iron_ore = Math.floor(Math.random() * 2) + 1; // 1 to 2 Iron
        } else if (regionId === 'reg_calmed_beach') {
            rewardItems.material_stone = Math.floor(Math.random() * 3) + 2;
            rewardItems.material_wood = Math.floor(Math.random() * 3) + 2;
        }

        return {
            id,
            name: `${rData.name} Path`,
            regionId,
            isStory: false,
            reward: { 
                gold: 50 + (clears * 10),
                items: rewardItems
            },
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

        // If we are already in combat status, resume/return the ongoing combat state
        if (this.state.activeExpedition.status === 'combat') {
            const resumed = this.resumeActiveBattle();
            if (resumed) {
                return Result.ok({
                    status: 'battle_started',
                    expId: exp.id,
                    expName: exp.name,
                    battleContext: this.state.activeExpedition.battleContext
                });
            }
        }

        const stage = exp.stages[this.state.activeExpedition.currentStage];

        if (stage.type === 'battle') {
            const heroes = this.heroService.list().filter(h => this.state.activeExpedition.heroIds.includes(h.id));
            
            const enemyCounts = {};
            stage.enemies.forEach(eId => {
                enemyCounts[eId] = (enemyCounts[eId] || 0) + 1;
            });
            const enemyIndices = {};
            const enemies = stage.enemies.map(eId => {
                const enemyLevel = stage.enemyLevel || 1;
                const enemy = this._createEnemy(eId, stage.isBoss, enemyLevel);
                if (enemyCounts[eId] > 1) {
                    enemyIndices[eId] = (enemyIndices[eId] || 0) + 1;
                    const suffix = String.fromCharCode(64 + enemyIndices[eId]); // A, B, C...
                    enemy.name = `${enemy.name} ${suffix}`;
                }
                return enemy;
            });

            // Track initial HP for the log
            const initialHp = {};
            heroes.forEach(h => initialHp[h.id] = h.hp);

            // Calculate potential EXP
            const totalEnemyHp = enemies.reduce((sum, e) => sum + e.maxHp, 0);
            const expPerHero = Math.floor(totalEnemyHp / heroes.length);
            const stageNum = this.state.activeExpedition.currentStage + 1;
            const stageTotal = exp.stages.length;

            // Start battle (manual by default)
            this.battleService.startBattle(heroes, enemies, false);

            this.state.activeExpedition.status = 'combat';
            this.state.activeExpedition.battleContext = {
                enemies: enemies.map(e => e.toJSON()),
                initialHp,
                expPerHero,
                totalEnemyHp,
                stageNum,
                stageTotal,
                expName: exp.name
            };
            this.save();

            return Result.ok({
                status: 'battle_started',
                expId: exp.id,
                expName: exp.name,
                battleContext: this.state.activeExpedition.battleContext
            });
        }

        return Result.fail('error_unknown_stage_type');
    }

    resumeActiveBattle() {
        if (!this.state.activeExpedition || this.state.activeExpedition.status !== 'combat') {
            return null;
        }
        const ctx = this.state.activeExpedition.battleContext;
        const heroes = this.heroService.list().filter(h => this.state.activeExpedition.heroIds.includes(h.id));
        const enemies = ctx.enemies.map(eData => new Enemy(eData));
        
        this.battleService.startBattle(heroes, enemies, false);
        return {
            expId: this.state.activeExpedition.id,
            expName: ctx.expName,
            battleContext: ctx
        };
    }

    getBattleResolutionPreview() {
        if (!this.state.activeExpedition || this.state.activeExpedition.status !== 'combat') {
            return null;
        }
        if (!this.battleService.isOver) {
            return null;
        }

        const exp = this.getExpeditions().find(e => e.id === this.state.activeExpedition.id);
        if (!exp) return null;

        const ctx = this.state.activeExpedition.battleContext;
        const heroes = this.heroService.list().filter(h => this.state.activeExpedition.heroIds.includes(h.id));
        const enemies = this.battleService.enemies;
        
        const isVictory = this.battleService.winner === 'heroes';
        const totalDamageDone = enemies.reduce((sum, e) => sum + (e.maxHp - Math.max(0, e.hp)), 0);
        const depletionProportion = ctx.totalEnemyHp > 0 ? totalDamageDone / ctx.totalEnemyHp : 0;

        const summary = [];
        heroes.forEach(h => {
            let leveledUp = false;
            let expEarned = 0;

            if (isVictory) {
                if (h.hp > 0) {
                    expEarned = ctx.expPerHero;
                }
            } else {
                const minimumExp = Math.floor(ctx.expPerHero * 0.25);
                const damageBasedExp = Math.floor(ctx.expPerHero * depletionProportion * 0.5);
                expEarned = Math.max(minimumExp, damageBasedExp);
            }

            if (expEarned > 0) {
                let currentExp = h.exp + expEarned;
                let currentLevel = h.level;
                while (true) {
                    const nextLevelExp = currentLevel * 20;
                    if (currentExp >= nextLevelExp) {
                        currentExp -= nextLevelExp;
                        currentLevel++;
                    } else {
                        break;
                    }
                }
                leveledUp = currentLevel > h.level;
            }

            const hpLost = (ctx.initialHp[h.id] !== undefined ? ctx.initialHp[h.id] : h.maxHp) - h.hp;

            summary.push({
                heroId: h.id,
                heroName: h.name,
                expEarned,
                leveledUp,
                hpLost
            });
        });

        let rewards = null;
        let isLastStage = false;
        if (isVictory) {
            const nextStage = this.state.activeExpedition.currentStage + 1;
            if (nextStage >= exp.stages.length) {
                isLastStage = true;
                rewards = exp.reward;
            }
        }

        return {
            isVictory,
            summary,
            isLastStage,
            rewards
        };
    }

    resolveBattle() {
        if (!this.state.activeExpedition || this.state.activeExpedition.status !== 'combat') {
            return Result.fail('error_no_active_battle');
        }
        if (!this.battleService.isOver) {
            return Result.fail('error_battle_not_over');
        }

        const exp = this.getExpeditions().find(e => e.id === this.state.activeExpedition.id);
        if (!exp) return Result.fail('error_expedition_not_found');

        const ctx = this.state.activeExpedition.battleContext;
        const heroes = this.heroService.list().filter(h => this.state.activeExpedition.heroIds.includes(h.id));
        const enemies = this.battleService.enemies; // final state of enemies
        
        const isVictory = this.battleService.winner === 'heroes';
        const stageNum = ctx.stageNum;
        const stageTotal = ctx.stageTotal;

        const combatLog = {
            heroes: heroes.map(h => h.name),
            enemies: enemies.map(e => e.name),
            events: [...this.battleService.log],
            summary: [],
            isVictory
        };

        const totalDamageDone = enemies.reduce((sum, e) => sum + (e.maxHp - Math.max(0, e.hp)), 0);
        const depletionProportion = ctx.totalEnemyHp > 0 ? totalDamageDone / ctx.totalEnemyHp : 0;

        heroes.forEach(h => {
            let leveledUp = false;
            let expEarned = 0;

            if (isVictory) {
                if (h.hp > 0) {
                    const preLevel = h.level;
                    h.addExperience(ctx.expPerHero);
                    leveledUp = h.level > preLevel;
                    expEarned = ctx.expPerHero;
                }
            } else {
                const minimumExp = Math.floor(ctx.expPerHero * 0.25);
                const damageBasedExp = Math.floor(ctx.expPerHero * depletionProportion * 0.5);
                const partialExp = Math.max(minimumExp, damageBasedExp);
                if (partialExp > 0) {
                    const preLevel = h.level;
                    h.addExperience(partialExp);
                    leveledUp = h.level > preLevel;
                    expEarned = partialExp;
                }
            }

            const hpLost = (ctx.initialHp[h.id] !== undefined ? ctx.initialHp[h.id] : h.maxHp) - h.hp;

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

        let finalResult;
        if (isVictory) {
            this.state.activeExpedition.currentStage++;
            if (this.state.activeExpedition.currentStage >= exp.stages.length) {
                const result = this._finishExpedition(exp);
                result.data.combatLog = combatLog;
                finalResult = result;
            } else {
                this.state.activeExpedition.status = 'assigned'; // back to assigned/idle until next day advance
                delete this.state.activeExpedition.battleContext;
                this.save();
                finalResult = Result.ok({ status: 'progress', expId: exp.id, expName: exp.name, combatLog });
            }
        } else {
            // Defeat resets the expedition completely and loses progress
            this.state.activeExpedition = null;
            this.save();
            finalResult = Result.ok({ status: 'failed', expId: exp.id, expName: exp.name, combatLog });
        }

        // Reset battle service state
        this.battleService.reset();

        return finalResult;
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

        // Loot drop
        const loot = this._generateLootDrop(exp.regionId);
        if (loot) {
            this.inventoryService.addEquipment(loot);
        }
        if (exp.reward.special) {
            const s = exp.reward.special;
            if (s.type === 'hero') {
                const avatar = s.value === 'Sir Valen' ? 'valen.png' : null;
                const existingHeroes = this.heroService.list();
                const avgLevel = existingHeroes.length > 0
                    ? Math.floor(existingHeroes.reduce((sum, h) => sum + h.level, 0) / existingHeroes.length)
                    : 1;
                const startLevel = Math.max(1, avgLevel - 1);

                const result = this.heroService.add({ name: s.value, origin: 'origin_guard', avatar, level: startLevel });
                if (result.success) {
                    const newHero = result.data;
                    // Level up to reach target (constructor doesn't auto-level)
                    for (let i = 1; i < startLevel; i++) {
                        newHero.levelUp();
                    }
                    // Give starting equipment so they're not naked
                    newHero.equipment.leftHand = { type: 'weapon', material: 'wooden', family: 'broadsword', level: 0 };
                    newHero.equipment.body = { type: 'armor', material: 'wooden', archetype: 'leather', slot: 'body', level: 0 };
                    newHero.recalculateStats({});
                    this.heroService.saveAll();
                }
            } else if (s.type === 'villagers') {
                this.villageService.addVillagers(s.value);
            }
        }

        this.save();
        
        // Check if any new regions should unlock
        this._checkRegionUnlocks();
        
        return Result.ok({ status: 'completed', expId: exp.id, expName: exp.name, reward: exp.reward });
    }

    /**
     * Public method for GameEngine to call during nextDay()
     * to check building-based unlocks (e.g., Explorer Guild).
     */
    checkRegionUnlocks() {
        this._checkRegionUnlocks();
    }

    _checkRegionUnlocks() {
        // Tiny Cave: unlock after completing tutorial cave
        if (this.state.completedIds.includes('exp_tutorial_cave') && !this.state.regions.reg_tiny_cave) {
            this._seedRegion('reg_tiny_cave');
        }

        // Calmed Beach: unlock after 3 Greenfields clears OR Explorer Guild L1
        const greenfields = this.state.regions.reg_greenfields;
        const explorerGuildLevel = this.villageService.getState().infrastructure.explorer_guild || 0;
        const beachUnlocked = greenfields.clears >= 3 || explorerGuildLevel >= 1;
        
        if (beachUnlocked && !this.state.regions.reg_calmed_beach) {
            this._seedRegion('reg_calmed_beach');
        }
    }

    _seedRegion(regionId) {
        const rData = this._getRegionData(regionId);
        this.state.regions[regionId] = {
            clears: 0,
            unlocked: true,
            availableNodes: [this._createProceduralNode(regionId, rData, 0)]
        };
        this.save();
    }

    _generateLootDrop(regionId) {
        // 40% chance for equipment drop
        if (Math.random() >= 0.40) return null;

        const rData = this._getRegionData(regionId);
        const materialTiers = ['wooden', 'iron', 'steel', 'gold', 'mythril'];
        const material = materialTiers[Math.min(rData.baseLevel || 1, materialTiers.length) - 1];

        const isWeapon = Math.random() < 0.5;
        let item = {
            type: isWeapon ? 'weapon' : 'armor',
            material: material,
            level: 0,
            affixes: []
        };

        if (isWeapon) {
            const families = ['dagger', 'broadsword', 'battle_axe', 'wand'];
            item.family = families[Math.floor(Math.random() * families.length)];
        } else {
            const archetypes = ['plate', 'leather', 'robes'];
            const slots = ['head', 'body', 'legs', 'rightHand'];
            item.archetype = archetypes[Math.floor(Math.random() * archetypes.length)];
            item.slot = slots[Math.floor(Math.random() * slots.length)];
        }

        // Affix roll
        const affixPool = ['vampire', 'sage', 'titan', 'assassin', 'phoenix'];
        const roll = Math.random();
        const numAffixes = roll < 0.02 ? 2 : (roll < 0.12 ? 1 : 0);
        for (let i = 0; i < numAffixes; i++) {
            const affix = affixPool[Math.floor(Math.random() * affixPool.length)];
            if (!item.affixes.includes(affix)) {
                item.affixes.push(affix);
            }
        }

        return item;
    }

    _createEnemy(templateId, isBoss, level = 1) {
        // Mock data registry for enemies
        const templates = {
            slime_green: { name: 'Green Slime', type: 'beast', maxHp: 20, strength: 3, defense: 2, speed: 2 },
            slime_fire: { name: 'Fire Slime', type: 'beast', maxHp: 30, strength: 5, defense: 3, speed: 3, element: 'fire' },
            wild_boar: { name: 'Wild Boar', type: 'beast', maxHp: 40, strength: 6, defense: 4, speed: 4 },
            goblin_scout: { name: 'Goblin Scout', type: 'humanoid', maxHp: 25, strength: 4, defense: 2, speed: 6 },
            goblin_grunt: { name: 'Goblin Grunt', type: 'humanoid', maxHp: 35, strength: 5, defense: 4, speed: 2 },
            goblin_brute: { name: 'Goblin Brute', type: 'humanoid', maxHp: 55, strength: 7, defense: 5, speed: 1 },
            goblin_king: { name: 'Goblin King', type: 'humanoid', maxHp: 120, strength: 10, defense: 6, speed: 4, isBoss: true },
            bat_small: { name: 'Small Bat', type: 'beast', maxHp: 22, strength: 4, defense: 2, speed: 7 },
            spider_minor: { name: 'Minor Spider', type: 'beast', maxHp: 28, strength: 5, defense: 3, speed: 4 },
            crab_shell: { name: 'Shell Crab', type: 'beast', maxHp: 35, strength: 5, defense: 5, speed: 2 },
            water_spirit_minor: { name: 'Minor Water Spirit', type: 'elemental', maxHp: 25, strength: 4, defense: 2, speed: 5, element: 'water' }
        };
        const t = templates[templateId] || templates['slime_green'];
        
        // Apply level scaling: Base * 1.1^(level - 1)
        const levelMult = Math.pow(1.1, level - 1);
        const scaled = {
            ...t,
            maxHp: Math.floor(t.maxHp * levelMult),
            strength: Math.floor(t.strength * levelMult),
            defense: Math.floor((t.defense || 1) * levelMult),
            speed: t.speed, // Speed stays flat to preserve turn-order feel
            level: level
        };
        
        return new Enemy({ ...scaled, id: crypto.randomUUID(), isBoss });
    }
}
