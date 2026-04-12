export class ProgressionManager {
    constructor() {
        this.coreKey = 'td_cores';
        this.labKey = 'td_laboratory';
        this.loadState();
    }

    loadState() {
        this.cores = parseInt(localStorage.getItem(this.coreKey)) || 0;
        
        const defaultLab = {
            towers: {
                BASIC_BLASTER: { unlocked: true, level: 1 },
                HEAVY_CANNON: { unlocked: false, level: 1 },
                PLASMA_NOVA: { unlocked: false, level: 1 }
            },
            skills: {
                STARTING_MONEY: { level: 0 },
                BOUNTY_HUNTER: { level: 0 },
                BASE_HEALTH: { level: 0 },
                CHRONO_SLOW: { level: 0 },
                WEAK_ENEMIES: { level: 0 }
            },
            specials: {
                UNLOCK_INFINITE: false
            }
        };

        try {
            const saved = JSON.parse(localStorage.getItem(this.labKey));
            if (saved) {
                // Merge to allow for backwards compatibility if we add new skills later
                this.lab = {
                    towers: { ...defaultLab.towers, ...saved.towers },
                    skills: { ...defaultLab.skills, ...saved.skills },
                    specials: { ...defaultLab.specials, ...saved.specials }
                };
            } else {
                this.lab = defaultLab;
            }
        } catch (e) {
            this.lab = defaultLab;
        }
    }

    saveState() {
        localStorage.setItem(this.coreKey, this.cores);
        localStorage.setItem(this.labKey, JSON.stringify(this.lab));
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

    // --- TOWERS ---

    getTowerCostToUnlock(towerId) {
        if (towerId === 'HEAVY_CANNON') return 50;
        if (towerId === 'PLASMA_NOVA') return 100;
        return 999; 
    }

    getTowerCostToUpgrade(towerId) {
        const level = this.lab.towers[towerId].level;
        return level * 30; // Linear scaling: 30, 60, 90...
    }

    isTowerUnlocked(towerId) {
        return !!this.lab.towers[towerId]?.unlocked;
    }

    unlockTower(towerId) {
        const cost = this.getTowerCostToUnlock(towerId);
        if (!this.isTowerUnlocked(towerId) && this.spendCores(cost)) {
            this.lab.towers[towerId].unlocked = true;
            this.saveState();
            return true;
        }
        return false;
    }

    upgradeTower(towerId) {
        const cost = this.getTowerCostToUpgrade(towerId);
        if (this.isTowerUnlocked(towerId) && this.spendCores(cost)) {
            this.lab.towers[towerId].level += 1;
            this.saveState();
            return true;
        }
        return false;
    }

    // Called by TowerDefinitions to apply base stat boosts
    getTowerModifiers(towerId) {
        const level = this.lab.towers[towerId]?.level || 1;
        const extraLevels = level - 1;
        
        return {
            damageAdd: extraLevels * (towerId === 'HEAVY_CANNON' || towerId === 'PLASMA_NOVA' ? 2 : 1), // Heavy/Plasma get +2 dmg per level
            cooldownMult: Math.max(0.2, 1 - (0.05 * extraLevels)) // 5% faster per level
        };
    }

    // --- SKILLS ---

    getSkillCostToUpgrade(skillId) {
        const level = this.lab.skills[skillId].level;
        return (level + 1) * 20; // 20, 40, 60...
    }

    upgradeSkill(skillId) {
        const cost = this.getSkillCostToUpgrade(skillId);
        if (this.spendCores(cost)) {
            this.lab.skills[skillId].level += 1;
            this.saveState();
            return true;
        }
        return false;
    }

    // Global modifiers for game.js to use
    getGlobalModifiers() {
        return {
            startingMoneyAdd: this.lab.skills.STARTING_MONEY.level * 10,
            baseHealthAdd: this.lab.skills.BASE_HEALTH.level * 2,
            bountyMult: 1 + (this.lab.skills.BOUNTY_HUNTER.level * 0.1), // +10% per level
            enemySpeedMult: 1 - (this.lab.skills.CHRONO_SLOW.level * 0.05), // -5% per level,
            enemyHpMult: 1 - (this.lab.skills.WEAK_ENEMIES.level * 0.05) // -5% per level
        };
    }
    // --- SPECIALS ---
    isInfiniteUnlocked() {
        return this.lab.specials?.UNLOCK_INFINITE;
    }
    
    unlockInfinite() {
        if (!this.isInfiniteUnlocked() && this.spendCores(100)) {
            if (!this.lab.specials) this.lab.specials = {};
            this.lab.specials.UNLOCK_INFINITE = true;
            this.saveState();
            return true;
        }
        return false;
    }
}

export const Progression = new ProgressionManager();
