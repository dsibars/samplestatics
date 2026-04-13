export class ProgressionManager {
    constructor() {
        this.coreKey = 'rpg_cores';
        this.progKey = 'rpg_progression';
        this.loadState();
    }

    loadState() {
        this.cores = parseInt(localStorage.getItem(this.coreKey)) || 0;

        const defaultProg = {
            heroes: [], 
            activeHeroIndices: [], // Indices of active heroes in the roster
            village: {
                rosterSizeLevel: 0, // Max heroes = 4 + Level (Max 8)
                partySizeLevel: 0,  // Max party = 1 + Level (Max 4)
                gymLevel: 0         // % XP for passive heroes (Max 50)
            },
            milestone: 0,
            gold: 0, // Player starts with 0 money
            inventory: {
                tiny_potion: 0,
                tiny_mana_potion: 0
            }
        };

        try {
            const saved = JSON.parse(localStorage.getItem(this.progKey));
            if (saved) {
                this.prog = { ...defaultProg, ...saved };
                
                // Cleanup old village structure if it exists
                if (this.prog.village.tavernLevel !== undefined || this.prog.village.shopLevel !== undefined) {
                    this.prog.village = {
                        rosterSizeLevel: 0,
                        partySizeLevel: 0,
                        gymLevel: 0
                    };
                }

                // Ensure activeHeroIndices list exists
                if (!Array.isArray(this.prog.activeHeroIndices)) {
                    this.prog.activeHeroIndices = this.prog.heroes.length > 0 ? [0] : [];
                }

                // Migration: Rename ice skills to water
                if (this.prog.heroes) {
                    this.prog.heroes.forEach(h => {
                        if (h.skills) {
                            ['small', 'medium', 'big'].forEach(tier => {
                                if (h.skills[`${tier}_ice_ball`] !== undefined) {
                                    h.skills[`${tier}_water_ball`] = h.skills[`${tier}_ice_ball`];
                                    delete h.skills[`${tier}_ice_ball`];
                                }
                            });
                        }
                    });
                }
            } else {
                this.prog = defaultProg;
            }
        } catch (e) {
            this.prog = defaultProg;
        }
    }

    saveState() {
        localStorage.setItem(this.coreKey, this.cores);
        localStorage.setItem(this.progKey, JSON.stringify(this.prog));
    }

    addCores(amount) {
        this.cores += amount;
        this.saveState();
    }

    spendCores(amount) {
        if (this.cores >= amount) {
            this.cores -= amount;
            this.saveState();
            return true;
        }
        return false;
    }

    addGold(amount) {
        this.prog.gold += amount;
        this.saveState();
    }

    spendGold(amount) {
        if (this.prog.gold >= amount) {
            this.prog.gold -= amount;
            this.saveState();
            return true;
        }
        return false;
    }

    getMaxRosterSize() {
        return 4 + (this.prog.village.rosterSizeLevel || 0);
    }

    getMaxPartySize() {
        return 1 + (this.prog.village.partySizeLevel || 0);
    }

    addHero(hero) {
        if (this.prog.heroes.length < this.getMaxRosterSize()) {
            this.prog.heroes.push(hero);
            // If it's the first hero, auto-select
            if (this.prog.heroes.length === 1) {
                this.prog.activeHeroIndices = [0];
            }
            this.saveState();
            return true;
        }
        return false;
    }

    checkFreeHero() {
        if (this.prog.heroes.length === 0) {
            // Generate a random hero (assuming Hero.js is imported or handled elsewhere)
            // But actually this is called from app.js where Hero is available.
            // We'll return true to signal app.js to create the hero.
            return true;
        }
        return false;
    }

    updateHero(index, heroData) {
        if (this.prog.heroes[index]) {
            this.prog.heroes[index] = { ...this.prog.heroes[index], ...heroData };
            this.saveState();
        }
    }

    toggleHeroActive(index) {
        const activeIdx = this.prog.activeHeroIndices.indexOf(index);
        if (activeIdx > -1) {
            // Trying to unselect
            if (this.prog.activeHeroIndices.length > 1) {
                this.prog.activeHeroIndices.splice(activeIdx, 1);
                this.saveState();
                return true;
            }
            return false; // Must have at least 1 hero
        } else {
            // Trying to select
            if (this.prog.activeHeroIndices.length < this.getMaxPartySize()) {
                this.prog.activeHeroIndices.push(index);
                this.saveState();
                return true;
            }
            return false;
        }
    }

    swapActiveHero(index) {
        if (this.prog.heroes[index]) {
            this.prog.activeHeroIndices = [index];
            this.saveState();
            return true;
        }
        return false;
    }

    getBuildingCost(type) {
        const level = this.prog.village[type] || 0;
        if (type === 'gymLevel') {
            return 5 + level;
        } else {
            return 5 * Math.pow(10, level);
        }
    }

    buyBuilding(type) {
        const cost = this.getBuildingCost(type);
        const level = this.prog.village[type] || 0;
        
        // Limits
        if (type === 'rosterSizeLevel' && level >= 4) return false;
        if (type === 'partySizeLevel' && level >= 3) return false;
        if (type === 'gymLevel' && level >= 50) return false;

        if (this.spendCores(cost)) {
            this.prog.village[type] = level + 1;
            this.saveState();
            return true;
        }
        return false;
    }

    setMilestone(value) {
        if (value > this.prog.milestone) {
            this.prog.milestone = value;
            this.saveState();
        }
    }

    resetMilestone() {
        this.prog.milestone = 0;
        this.saveState();
    }

    removeHero(index) {
        const isActive = this.prog.activeHeroIndices.includes(index);
        if (isActive) return false; // Cannot fire active hero

        this.prog.heroes.splice(index, 1);
        
        // Adjust active indices because indices changed
        this.prog.activeHeroIndices = this.prog.activeHeroIndices.map(idx => {
            return idx > index ? idx - 1 : idx;
        });
        
        this.saveState();
        return true;
    }

    addItem(itemId, count = 1) {
        this.prog.inventory[itemId] = (this.prog.inventory[itemId] || 0) + count;
        this.saveState();
    }

    useItem(itemId) {
        if (this.prog.inventory[itemId] > 0) {
            this.prog.inventory[itemId]--;
            this.saveState();
            return true;
        }
        return false;
    }
}

export const Progression = new ProgressionManager();
