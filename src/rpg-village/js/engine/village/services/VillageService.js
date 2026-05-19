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
                total: 2, // 2 Builders
                assigned: 0,
            },
            infrastructure: {
                housing: 1,
                farm: 0, // No farm initially
                warehouse: 1,
                blacksmith: 0,
                training_grounds: 0,
                explorer_guild: 0,
                infirmary: 0
            },
            constructionQueue: [],
            day: 1,
            lastUpdate: Date.now()
        };
        const loaded = persistence.load(this.STORAGE_KEY, defaultState);
        
        // Migrate old state if population was a simple number
        if (typeof loaded.population === 'number') {
            loaded.population = {
                total: loaded.population,
                assigned: 0
            };
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
        return {
            ...this.state,
            population: {
                ...this.state.population,
                max: this.getMaxPopulation()
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
        let foodProduced = 0;
        if (farmLevel > 0) {
            foodProduced = farmLevel * 4;
            this.addItemToInventory('food_raw_grain', foodProduced);
        }
        report.produced = foodProduced;

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
            // Simple growth logic: 20% chance per day if capacity exists
            if (Math.random() < 0.2) {
                this.state.population.total++;
                report.growth = 1;
            }
        }

        // 4. Calendar Update
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
        if (this.state.population.total - this.state.population.assigned <= 0) {
            return Result.fail('error_no_available_labor');
        }

        // Check materials (this logic will be refined when materials are properly categorized)
        for (const [matId, amount] of Object.entries(costMaterials)) {
            if (this.inventoryService.getConsumableCount(matId) < amount) {
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
        this.save();
    }
}
