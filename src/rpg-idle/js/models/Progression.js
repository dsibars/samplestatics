export class ProgressionManager {
    constructor() {
        this.coreKey = 'rpg_cores';
        this.progKey = 'rpg_progression';
        this.loadState();
    }

    loadState() {
        this.cores = parseInt(localStorage.getItem(this.coreKey)) || 0;

        const defaultProg = {
            heroes: [], // Max 4
            village: {
                tavernLevel: 1,
                shopLevel: 1
            },
            milestone: 0,
            gold: 100,
            inventory: {
                tiny_potion: 0,
                tiny_mana_potion: 0
            },
            upgrades: {
                attack_boost: 0,
                defense_boost: 0,
                hp_boost: 0
            }
        };

        try {
            const saved = JSON.parse(localStorage.getItem(this.progKey));
            if (saved) {
                this.prog = { ...defaultProg, ...saved };
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

    addHero(hero) {
        if (this.prog.heroes.length < 4) {
            this.prog.heroes.push(hero);
            this.saveState();
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

    getUpgradeCost(upgradeId) {
        const level = this.prog.upgrades[upgradeId] || 0;
        return (level + 1) * 5;
    }

    buyUpgrade(upgradeId) {
        const cost = this.getUpgradeCost(upgradeId);
        if (this.spendCores(cost)) {
            this.prog.upgrades[upgradeId] = (this.prog.upgrades[upgradeId] || 0) + 1;
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
        if (this.prog.heroes.length > 1) {
            this.prog.heroes.splice(index, 1);
            this.saveState();
            return true;
        }
        return false;
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
