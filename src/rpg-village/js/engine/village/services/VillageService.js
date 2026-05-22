import { persistence } from '../../shared/core/Persistence.js';
import { Result } from '../../shared/core/Result.js';

/**
 * VillageService handles the village's internal state, resource consumption,
 * population growth, and infrastructure effects.
 */
export class VillageService {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
        this.STORAGE_KEY = 'village_state';
        this.state = this._load();
    }

    _load() {
        const defaultState = {
            gold: 100,
            population: {
                total: 2,
                assigned: 0,
                builders: 2,
                roles: { builder: 2, farmer: 0, miner: 0, scout: 0 }
            },
            infrastructure: {
                housing: 1,
                farm: 0, // No farm initially
                warehouse: 1,
                blacksmith: 0,
                training_grounds: 0,
                explorer_guild: 0,
                infirmary: 0,
                tavern: 0
            },
            constructionQueue: [],
            day: 1,
            lastUpdate: Date.now(),
            daysSinceLastRecruit: 0
        };
        const loaded = persistence.load(this.STORAGE_KEY, defaultState);
        
        // Migrate old state if population was a simple number
        if (typeof loaded.population === 'number') {
            loaded.population = {
                total: loaded.population,
                assigned: 0,
                builders: loaded.population
            };
        }

        // Migrate old state without builders field
        if (loaded.population && loaded.population.builders === undefined) {
            loaded.population.builders = loaded.population.total;
        }

        // Migrate old state without roles field
        if (loaded.population && loaded.population.roles === undefined) {
            loaded.population.roles = { builder: loaded.population.builders || loaded.population.total, farmer: 0, miner: 0, scout: 0 };
        }

        // Migrate old state if max was stored
        if (loaded.population && loaded.population.max !== undefined) {
            delete loaded.population.max;
        }

        return loaded;
    }

    save() {
        persistence.save(this.STORAGE_KEY, this.state);
    }

    getState() {
        const roles = this.state.population.roles || { builder: 0, farmer: 0, miner: 0, scout: 0 };
        return {
            ...this.state,
            population: {
                ...this.state.population,
                max: this.getMaxPopulation(),
                availableBuilders: Math.max(0, this.state.population.builders - this.state.population.assigned),
                roles
            },
            maxStorage: this.getMaxStorage()
        };
    }

    // --- Building Effects ---

    getMaxPopulation() {
        const level = this.state.infrastructure.housing || 0;
        if (level === 0) return 0;
        if (level === 1) return 3;
        if (level === 2) return 10;
        if (level === 3) return 20;
        // Extendable for higher levels
        return 20 + (level - 3) * 10;
    }

    getMaxStorage() {
        const level = this.state.infrastructure.warehouse || 0;
        if (level === 0) return 100; // Base storage
        if (level === 1) return 200;
        if (level === 2) return 500;
        // Extendable for higher levels
        return 500 + (level - 2) * 500;
    }

    // --- Time & Growth ---

    nextDay() {
        const report = {
            day: this.state.day,
            consumed: 0,
            completed: [],
            growth: 0,
            starvation: false
        };

        // 1. Consumption Phase: 1 food per villager
        const totalPop = this.state.population.total;
        const foodConsumed = totalPop;
        
        // Use food_raw_grain as default sustenance
        const useResult = this.inventoryService.useConsumable('food_raw_grain', foodConsumed);
        report.consumed = foodConsumed;

        if (!useResult.success) {
            report.starvation = true;
            // Potential future: decrease health/efficiency
        }

        // 1.5. Production Phase: Farm generates food
        const farmLevel = this.state.infrastructure.farm || 0;
        const roles = this.state.population.roles || { builder: 0, farmer: 0, miner: 0, scout: 0 };
        let foodProduced = 0;
        if (farmLevel > 0) {
            const farmerBonus = 1 + (roles.farmer * 0.10);
            foodProduced = Math.floor(farmLevel * 4 * farmerBonus);
            this.addItemToInventory('food_raw_grain', foodProduced);
        }
        report.produced = foodProduced;

        // 1.6. Miner Phase: Chance for materials
        let minerYield = { wood: 0, stone: 0 };
        if (roles.miner > 0) {
            for (let i = 0; i < roles.miner; i++) {
                if (Math.random() < 0.20) {
                    if (Math.random() < 0.5) {
                        minerYield.wood++;
                    } else {
                        minerYield.stone++;
                    }
                }
            }
            if (minerYield.wood > 0) this.addItemToInventory('material_wood', minerYield.wood);
            if (minerYield.stone > 0) this.addItemToInventory('material_stone', minerYield.stone);
        }
        report.minerYield = minerYield;

        // 2. Construction Phase
        const completed = [];
        this.state.constructionQueue.forEach(project => {
            project.daysRemaining--;
            if (project.daysRemaining <= 0) {
                this.state.infrastructure[project.buildingId] = project.targetLevel;
                completed.push(project.buildingId);
                // Return labor (assigned villagers)
                this.state.population.assigned--;
            }
        });
        this.state.constructionQueue = this.state.constructionQueue.filter(p => p.daysRemaining > 0);
        report.completed = completed;

        // 3. Growth Phase
        // Only grow if not starving and under capacity
        const maxPop = this.getMaxPopulation();
        if (!report.starvation && this.state.population.total < maxPop) {
            // Getting new villagers is much harder during the first 100 days (1% chance)
            const growthChance = this.state.day <= 100 ? 0.01 : 0.10;
            if (Math.random() < growthChance) {
                this.state.population.total++;
                report.growth = 1;
            }
        }

        // 4. Tavern Auto-Recruit Phase
        const tavernLevel = this.state.infrastructure.tavern || 0;
        let tavernRecruit = null;
        if (tavernLevel > 0) {
            this.state.daysSinceLastRecruit++;
            const recruitThreshold = 5 + Math.floor(Math.random() * 3); // 5-7 days
            if (this.state.daysSinceLastRecruit >= recruitThreshold) {
                // Trigger auto-recruit (GameEngine will handle hero generation)
                tavernRecruit = { threshold: recruitThreshold, ready: true };
                this.state.daysSinceLastRecruit = 0;
            }
        }
        report.tavernRecruit = tavernRecruit;

        // 5. Calendar Update
        this.state.day++;
        this.state.lastUpdate = Date.now();
        this.save();

        report.day = this.state.day;
        return report;
    }

    setDailyReport(report) {
        this.state.lastDailyReport = report;
        this.save();
    }

    // --- Construction ---

    startProject(buildingId, targetLevel, costGold, costMaterials, duration) {
        if (this.state.constructionQueue.some(p => p.buildingId === buildingId)) {
            return Result.fail('error_already_in_queue');
        }
        
        if (this.state.gold < costGold) return Result.fail('error_not_enough_gold');
        
        // Check labor
        if (this.state.population.builders - this.state.population.assigned <= 0) {
            return Result.fail('error_no_available_builders');
        }

        // Check materials
        for (const [matId, amount] of Object.entries(costMaterials)) {
            if (this.inventoryService.getItemCount(matId) < amount) {
                return Result.fail('error_not_enough_materials');
            }
        }

        // Pay costs
        this.state.gold -= costGold;
        for (const [matId, amount] of Object.entries(costMaterials)) {
            this.inventoryService.useConsumable(matId, amount);
        }

        // Assign labor
        this.state.population.assigned++;

        // Add to queue
        this.state.constructionQueue.push({
            buildingId,
            targetLevel,
            daysRemaining: duration,
            assignedVillagerId: null // Future: link to specific villager
        });

        this.save();
        return Result.ok();
    }

    /**
     * Helper to add items to inventory respecting village storage limits.
     */
    addItemToInventory(id, count = 1) {
        return this.inventoryService.addItem(id, count, this.getMaxStorage());
    }
    
    addGold(amount) {
        this.state.gold += amount;
        this.save();
    }
    
    addVillagers(amount) {
        this.state.population.total += amount;
        this.state.population.builders = Math.min(this.state.population.total, this.state.population.builders + amount);
        this.save();
    }

    setBuilders(count) {
        const total = this.state.population.total;
        const assigned = this.state.population.assigned;
        if (count < 0 || count > total) {
            return Result.fail('error_invalid_builder_count');
        }
        if (count < assigned) {
            return Result.fail('error_builders_below_assigned');
        }
        this.state.population.builders = count;
        // Keep builder role in sync
        if (!this.state.population.roles) {
            this.state.population.roles = { builder: count, farmer: 0, miner: 0, scout: 0 };
        } else {
            this.state.population.roles.builder = count;
        }
        this.save();
        return Result.ok();
    }

    setWorkerRole(role, delta) {
        const validRoles = ['builder', 'farmer', 'miner', 'scout'];
        if (!validRoles.includes(role)) {
            return Result.fail('error_invalid_role');
        }

        const roles = this.state.population.roles || { builder: this.state.population.builders, farmer: 0, miner: 0, scout: 0 };
        const current = roles[role] || 0;
        const newCount = Math.max(0, current + delta);

        // Calculate total used roles
        const totalUsed = validRoles.reduce((sum, r) => sum + (r === role ? newCount : (roles[r] || 0)), 0);
        if (totalUsed > this.state.population.total) {
            return Result.fail('error_not_enough_villagers');
        }

        roles[role] = newCount;
        this.state.population.roles = roles;

        // Sync builders count with builder role
        this.state.population.builders = roles.builder;
        this.save();
        return Result.ok();
    }
}
