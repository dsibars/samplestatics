export class ProgressionManager {
    constructor() {
        this.coreKey = 'rpg_cores';
        this.progKey = 'rpg_progression';
        this.versionKey = 'rpg_data_version';
        this.currentVersion = '2025-04-15-v1'; // REMOVE AUTOWIPE BEFORE PUBLIC RELEASE
        this.loadState();
    }

    loadState() {
        const savedVersion = localStorage.getItem(this.versionKey);
        if (savedVersion !== this.currentVersion) {
            console.warn("RPG Idle: Version mismatch, autowiping data.");
            localStorage.removeItem(this.coreKey);
            localStorage.removeItem(this.progKey);
            localStorage.setItem(this.versionKey, this.currentVersion);
        }

        this.cores = parseInt(localStorage.getItem(this.coreKey)) || 0;

        const defaultProg = {
            version: this.currentVersion,
            heroes: [], 
            activeHeroIndices: [],
            village: {
                rosterSizeLevel: 0,
                partySizeLevel: 0,
                gymLevel: 0,
                weaponShopLevel: 0,
                armorShopLevel: 0,
                debugLevel: 0
            },
            milestone: 0,
            gold: 0,
            inventory: {
                tiny_potion: 0,
                tiny_mana_potion: 0
            },
            equipmentInventory: [],
            trainingSessions: {} // { heroIndex: { startTime, regimeId } }
        };

        try {
            const saved = JSON.parse(localStorage.getItem(this.progKey));
            if (saved) {
                this.prog = { ...defaultProg, ...saved };
                
                if (this.prog.village.tavernLevel !== undefined || this.prog.village.shopLevel !== undefined) {
                    this.prog.village = {
                        rosterSizeLevel: 0,
                        partySizeLevel: 0,
                        gymLevel: 0,
                        weaponShopLevel: 0,
                        armorShopLevel: 0
                    };
                }

                if (!Array.isArray(this.prog.activeHeroIndices)) {
                    this.prog.activeHeroIndices = this.prog.heroes.length > 0 ? [0] : [];
                }

                if (!this.prog.equipmentInventory) this.prog.equipmentInventory = [];
                if (!this.prog.trainingSessions) this.prog.trainingSessions = {};

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
        if (this.prog.trainingSessions[index]) return false; // Busy training

        const activeIdx = this.prog.activeHeroIndices.indexOf(index);
        if (activeIdx > -1) {
            if (this.prog.activeHeroIndices.length > 1) {
                this.prog.activeHeroIndices.splice(activeIdx, 1);
                this.saveState();
                return true;
            }
            return false;
        } else {
            if (this.prog.activeHeroIndices.length < this.getMaxPartySize()) {
                this.prog.activeHeroIndices.push(index);
                this.saveState();
                return true;
            }
            return false;
        }
    }

    swapActiveHero(index) {
        if (this.prog.trainingSessions[index]) return false;
        if (this.prog.heroes[index]) {
            this.prog.activeHeroIndices = [index];
            this.saveState();
            return true;
        }
        return false;
    }

    getBuildingCost(type) {
        if (type === 'debugLevel') return 0;
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
        
        if (type === 'rosterSizeLevel' && level >= 4) return false;
        if (type === 'partySizeLevel' && level >= 3) return false;
        if (type === 'gymLevel' && level >= 50) return false;
        if (type === 'weaponShopLevel' && level >= 5) return false;
        if (type === 'armorShopLevel' && level >= 5) return false;

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
        if (isActive) return false;
        if (this.prog.trainingSessions[index]) return false;

        const hero = this.prog.heroes[index];
        if (hero.equipment) {
            Object.values(hero.equipment).forEach(item => {
                if (item) this.prog.equipmentInventory.push(item);
            });
        }

        this.prog.heroes.splice(index, 1);
        
        this.prog.activeHeroIndices = this.prog.activeHeroIndices.map(idx => {
            return idx > index ? idx - 1 : idx;
        });

        // Adjust training sessions
        const newSessions = {};
        Object.keys(this.prog.trainingSessions).forEach(key => {
            const k = parseInt(key);
            if (k === index) return;
            const newKey = k > index ? k - 1 : k;
            newSessions[newKey] = this.prog.trainingSessions[key];
        });
        this.prog.trainingSessions = newSessions;
        
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

    addEquipment(item) {
        item.id = Date.now() + Math.random().toString(36).substr(2, 9);
        this.prog.equipmentInventory.push(item);
        this.saveState();
    }

    equipItem(heroIndex, slot, itemIndex) {
        const hero = this.prog.heroes[heroIndex];
        const item = this.prog.equipmentInventory[itemIndex];
        if (!hero || !item) return false;

        if (hero.equipment[slot]) {
            this.prog.equipmentInventory.push(hero.equipment[slot]);
        }

        hero.equipment[slot] = item;
        this.prog.equipmentInventory.splice(itemIndex, 1);
        this.saveState();
        return true;
    }

    unequipItem(heroIndex, slot) {
        const hero = this.prog.heroes[heroIndex];
        if (!hero || !hero.equipment[slot]) return false;

        this.prog.equipmentInventory.push(hero.equipment[slot]);
        hero.equipment[slot] = null;
        this.saveState();
        return true;
    }

    startTraining(heroIndex, regimeId) {
        if (this.prog.activeHeroIndices.includes(heroIndex)) return false;
        if (this.prog.trainingSessions[heroIndex]) return false;

        this.prog.trainingSessions[heroIndex] = {
            startTime: Date.now(),
            regimeId: regimeId
        };
        this.saveState();
        return true;
    }

    cancelTraining(heroIndex) {
        if (this.prog.trainingSessions[heroIndex]) {
            delete this.prog.trainingSessions[heroIndex];
            this.saveState();
            return true;
        }
        return false;
    }

    completeTraining(heroIndex, regimeData) {
        const session = this.prog.trainingSessions[heroIndex];
        if (!session) return null;

        const gymMult = 1 + (this.prog.village.gymLevel / 100);
        const rewards = {
            exp: Math.floor(regimeData.exp * gymMult),
            gold: 0,
            cores: 0,
            item: null
        };

        if (regimeData.goldChance && Math.random() < regimeData.goldChance) {
            rewards.gold = Math.floor(50 * gymMult);
        }
        if (regimeData.coreReward) {
            rewards.cores = regimeData.coreReward;
        }
        if (regimeData.itemChance && Math.random() < regimeData.itemChance) {
            rewards.item = 'tiny_potion'; // Simple for now
        }

        delete this.prog.trainingSessions[heroIndex];
        this.saveState();
        return rewards;
    }
}

export const Progression = new ProgressionManager();
