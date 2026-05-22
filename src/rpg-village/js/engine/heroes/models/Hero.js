import { WEAPON_FAMILIES, ARMOR_ARCHETYPES, MATERIAL_TIERS, EQUIPMENT_SET_BONUSES } from '../../shared/data/GameConstants.js';
import { Result } from '../../shared/core/Result.js';

export class Hero {
    constructor(data) {
        this.id = data.id || crypto.randomUUID();
        this.name = data.name;
        this.origin = data.origin || 'origin_warrior';
        this.level = data.level || 1;
        this.exp = data.exp || 0;
        this.statPoints = data.statPoints !== undefined ? data.statPoints : 5;
        this.avatar = data.avatar || null;

        // Base stats
        this.baseMaxHp = data.baseMaxHp || 30;
        this.baseMaxMp = data.baseMaxMp || 15;
        this.baseStrength = data.baseStrength || 8;
        this.baseSpeed = data.baseSpeed || 4;
        this.baseDefense = data.baseDefense || 4;
        this.baseMagicPower = data.baseMagicPower || 4;

        // Dynamic state (hp/mp use base values which are already set)
        this.hp = data.hp ?? this.baseMaxHp;
        this.mp = data.mp ?? this.baseMaxMp;
        this.status = data.status || 'resting'; // 'active', 'resting', 'training'

        this.skills = data.skills || { basic_attack: 0 };
        this.techniqueUses = data.techniqueUses || {};
        this.techniqueTiers = data.techniqueTiers || {};
        this.magicXp = data.magicXp || 0;
        this.glyphRepertoire = data.glyphRepertoire || ['core_fire', 'power_plus'];
        this.spellCodex = data.spellCodex || [];
        this.lifetimeStats = data.lifetimeStats || {
            enemiesDefeated: 0,
            damageDealt: 0,
            damageTaken: 0,
            expeditionsCompleted: 0,
            battlesWon: 0,
            battlesLost: 0,
            highestDamageDealt: 0
        };
        this.titles = data.titles || [];
        this.bodyInscription = data.bodyInscription || null;
        this.statusEffects = data.statusEffects || [];
        this.phoenixUsed = data.phoenixUsed || false;
        this.mealBuffs = data.mealBuffs || [];
        
        this.equipment = data.equipment || {
            head: null,
            body: null,
            legs: null,
            leftHand: null,
            rightHand: null,
            accessory: null
        };

        // Final calculated stats
        this.recalculateStats();

        // Stamina is derived from STR/DEF/Level, so it must be set AFTER recalculateStats
        this.stamina = data.stamina ?? this.maxStamina;
    }

    getTraitMultipliers() {
        const mults = {
            maxHp: 1.0,
            maxMp: 1.0,
            strength: 1.0,
            speed: 1.0,
            defense: 1.0,
            magicPower: 1.0,
            critChance: 0,
            accuracy: 1.0,
            goldBonus: 1.0,
            mpRecovery: 1.0
        };

        switch (this.origin) {
            case 'origin_clown':
                mults.critChance += 15;
                mults.accuracy -= 0.05;
                break;
            case 'origin_warrior':
                mults.defense *= 1.10;
                mults.maxHp *= 1.05;
                break;
            case 'origin_thief':
                mults.speed *= 1.10;
                mults.goldBonus *= 1.10;
                break;
            case 'origin_farmer':
                mults.maxHp *= 1.15;
                break;
            case 'origin_monk':
                mults.maxMp *= 1.15;
                mults.mpRecovery *= 1.20;
                break;
            case 'origin_cook':
                mults.maxHp *= 1.05;
                break;
            case 'origin_guard':
                mults.defense *= 1.15;
                break;
            case 'origin_poet':
                mults.maxMp *= 1.10;
                mults.magicPower *= 1.10;
                break;
            case 'origin_arcane_initiate':
                mults.magicPower *= 1.25;
                mults.maxMp *= 1.20;
                mults.strength *= 0.85;
                mults.defense *= 0.90;
                break;
        }

        return mults;
    }

    recalculateStats(villageUpgrades = {}) {
        const traitMults = this.getTraitMultipliers();

        let equipBonus = {
            maxHp: 0,
            maxMp: 0,
            strength: 0,
            speed: 0,
            defense: 0,
            magicPower: 0,
            evasion: 0,
            critChance: 0,
            accuracy: 0,
            mpCostReduction: 0,
            vampirism: 0,
            hasPhoenix: false
        };

        Object.values(this.equipment).forEach(item => {
            if (!item) return;

            if (item.type === 'weapon') {
                const family = WEAPON_FAMILIES[item.family];
                const tier = MATERIAL_TIERS[item.material];
                if (family && tier) {
                    const upgradeMult = Math.pow(1.1, item.level || 0);
                    const itemPower = 2 * tier.mult * upgradeMult;
                    equipBonus.strength += itemPower * family.dmgMult;
                    equipBonus.speed += family.spdBonus;
                    equipBonus.evasion += family.evaBonus || 0;
                    if (family.magBonus) equipBonus.magicPower += family.magBonus * tier.mult * upgradeMult;
                    if (family.mpCostReduction) equipBonus.mpCostReduction += family.mpCostReduction;
                }
            } else if (item.type === 'armor') {
                const arch = ARMOR_ARCHETYPES[item.archetype];
                const tier = MATERIAL_TIERS[item.material];
                if (arch && tier) {
                    const upgradeMult = Math.pow(1.1, item.level || 0);
                    const itemPower = 5 * tier.mult * upgradeMult;
                    equipBonus.defense += itemPower * arch.defMult;
                    equipBonus.maxHp += itemPower * (arch.hpMult || 0);
                    equipBonus.maxMp += itemPower * (arch.mpMult || 0);
                    equipBonus.magicPower += itemPower * (arch.magMult || 0);
                    equipBonus.speed += arch.spdPenalty || 0;
                    equipBonus.evasion += arch.evaBonus || arch.evaPenalty || 0;
                }
            }

            if (item.affixes) {
                item.affixes.forEach(aff => {
                    switch(aff) {
                        case 'vampire': equipBonus.vampirism += 0.05; break;
                        case 'sage': equipBonus.mpCostReduction += 0.10; break;
                        case 'titan':
                            equipBonus.maxHp += (this.baseMaxHp * 0.20);
                            equipBonus.speed -= 2;
                            break;
                        case 'assassin':
                            equipBonus.critChance += 10;
                            equipBonus.accuracy += 20;
                            break;
                        case 'phoenix':
                            equipBonus.hasPhoenix = true;
                            break;
                    }
                });
            }
        });

        // --- Set Bonuses ---
        const setCounts = {};
        Object.values(this.equipment).forEach(item => {
            if (!item || !item.set) return;
            setCounts[item.set] = (setCounts[item.set] || 0) + 1;
        });

        // --- Meal Buffs ---
        if (this.mealBuffs && this.mealBuffs.length > 0) {
            this.mealBuffs.forEach(buff => {
                if (buff.stat === 'maxHp') {
                    equipBonus.maxHp += Math.floor(this.baseMaxHp * buff.value);
                } else if (equipBonus[buff.stat] !== undefined) {
                    equipBonus[buff.stat] += buff.value;
                }
            });
        }

        this.activeSetBonuses = [];
        for (const [setId, count] of Object.entries(setCounts)) {
            const setData = EQUIPMENT_SET_BONUSES[setId];
            if (!setData) continue;

            // Find the highest threshold met
            let activeThreshold = 0;
            for (const t of setData.thresholds) {
                if (count >= t) activeThreshold = t;
            }

            if (activeThreshold > 0) {
                const bonus = setData.bonuses[activeThreshold];
                for (const [stat, val] of Object.entries(bonus)) {
                    if (equipBonus[stat] !== undefined) {
                        equipBonus[stat] += val;
                    }
                }
                this.activeSetBonuses.push({
                    setId,
                    setName: setData.name,
                    pieces: count,
                    threshold: activeThreshold,
                    bonus
                });
            }
        }

        const hpBoost = (villageUpgrades.hp_boost || 0) * 10;
        const atkBoost = (villageUpgrades.attack_boost || 0);
        const defBoost = (villageUpgrades.defense_boost || 0);

        let hasteMult = 1.0;
        if (this.statusEffects.some(e => e.type === 'haste')) hasteMult = 1.5;

        this.maxHp = Math.floor((this.baseMaxHp + hpBoost + equipBonus.maxHp) * traitMults.maxHp);
        this.maxMp = Math.floor((this.baseMaxMp + equipBonus.maxMp) * traitMults.maxMp);
        this.strength = Math.floor((this.baseStrength + atkBoost + equipBonus.strength) * traitMults.strength);
        this.speed = Math.floor((this.baseSpeed + equipBonus.speed) * traitMults.speed * hasteMult);
        this.defense = Math.floor((this.baseDefense + defBoost + equipBonus.defense) * traitMults.defense);
        this.magicPower = Math.floor((this.baseMagicPower + equipBonus.magicPower) * traitMults.magicPower);

        // maxStamina depends on strength, defense, and level — must be calculated after those
        this.maxStamina = Math.floor((this.strength * 3) + (this.defense * 2) + (this.level * 2));
        this.maxSkillSlots = Math.min(4 + Math.floor(this.level / 10), 8);

        this.evasion = equipBonus.evasion;
        this.mpCostReduction = equipBonus.mpCostReduction;
        this.vampirism = equipBonus.vampirism;
        this.critChanceBonus = (equipBonus.critChance || 0) + (traitMults.critChance || 0);
        this.accuracyBonus = (equipBonus.accuracy || 0) + (traitMults.accuracy || 0);
        this.hasPhoenix = equipBonus.hasPhoenix;

        this.hp = Math.min(this.hp, this.maxHp);
        this.mp = Math.min(this.mp, this.maxMp);
        if (this.stamina !== undefined) {
            this.stamina = Math.min(this.stamina, this.maxStamina);
        }
    }

    getExpToNextLevel() {
        return this.level * 20;
    }

    addExperience(amount) {
        this.exp += amount;
        let levelsGained = 0;
        while (true) {
            const nextLevelExp = this.getExpToNextLevel();
            if (this.exp >= nextLevelExp) {
                this.exp -= nextLevelExp;
                this.levelUp();
                levelsGained++;
            } else {
                break;
            }
        }
        return Result.ok(levelsGained);
    }

    levelUp() {
        this.level++;
        this.statPoints += (this.level % 5 === 0) ? 3 : 2;

        this.baseMaxHp += 5;
        this.baseMaxMp += 2;

        this.recalculateStats();

        this.hp = this.maxHp;
        this.mp = this.maxMp;
        this.stamina = this.maxStamina;
    }

    increaseStat(statId) {
        if (this.statPoints <= 0) return Result.fail('error_no_stat_points');

        const statMap = {
            baseMaxHp: 3,
            baseMaxMp: 2,
            baseStrength: 1,
            baseSpeed: 1,
            baseDefense: 1,
            baseMagicPower: 1
        };

        const gain = statMap[statId];
        if (gain === undefined) return Result.fail('error_invalid_stat');

        this[statId] += gain;
        this.statPoints--;

        this.recalculateStats();

        return Result.ok(this[statId]);
    }

    tickMealBuffs() {
        if (!this.mealBuffs || this.mealBuffs.length === 0) return false;
        let changed = false;
        this.mealBuffs = this.mealBuffs.map(buff => {
            const updated = { ...buff, battlesRemaining: buff.battlesRemaining - 1 };
            if (updated.battlesRemaining > 0) {
                return updated;
            }
            changed = true;
            return null;
        }).filter(Boolean);
        if (changed) {
            this.recalculateStats();
        }
        return changed;
    }

    getUsedSkillSlots() {
        return Object.keys(this.skills).filter(s => s !== 'basic_attack').length;
    }

    learnSkill(skillId) {
        if (this.skills[skillId] !== undefined) return Result.fail('error_skill_already_unlocked');
        if (this.getUsedSkillSlots() >= this.maxSkillSlots) return Result.fail('error_no_skill_slots');

        this.skills[skillId] = 0;
        return Result.ok(this.skills[skillId]);
    }

    upgradeSkill(skillId) {
        if (this.skills[skillId] === undefined) return Result.fail('error_skill_locked');
        if (this.skills[skillId] >= 5) return Result.fail('error_skill_max_level');

        this.skills[skillId]++;
        return Result.ok(this.skills[skillId]);
    }

    unequipSkill(skillId) {
        if (this.skills[skillId] === undefined) return Result.fail('error_skill_locked');
        if (skillId === 'basic_attack') return Result.fail('error_cannot_unequip_basic');

        delete this.skills[skillId];
        return Result.ok(true);
    }

    inscribeSkill(skillId) {
        const totalSkillPoints = Object.values(this.skills || {}).reduce((sum, lvl) => sum + (lvl || 0), 0);
        if (totalSkillPoints < 12) return Result.fail('error_body_inscription_not_enough_skills');
        if ((this.magicTier || 0) < 7) return Result.fail('error_body_inscription_not_enough_magic');
        if (this.skills[skillId] === undefined) return Result.fail('error_skill_locked');
        this.bodyInscription = this.bodyInscription || [];
        if (this.bodyInscription.includes(skillId)) return Result.fail('error_already_inscribed');
        if (this.bodyInscription.length >= 7) return Result.fail('error_body_circle_full');
        this.bodyInscription.push(skillId);
        return Result.ok(true);
    }

    eraseInscription(skillId) {
        if (!this.bodyInscription || !this.bodyInscription.includes(skillId)) {
            return Result.fail('error_not_inscribed');
        }
        this.bodyInscription = this.bodyInscription.filter(id => id !== skillId);
        return Result.ok(true);
    }

    /**
     * Records a technique use and checks for infinite tier evolution.
     * @returns {Object|null} evolution info if tier increased, null otherwise
     */
    recordTechniqueUse(family) {
        if (!family) return null;

        this.techniqueUses[family] = (this.techniqueUses[family] || 0) + 1;

        const currentTier = this.techniqueTiers[family] || 1;
        const uses = this.techniqueUses[family];
        const threshold = this._getTierThreshold(currentTier + 1);

        if (uses >= threshold) {
            this.techniqueTiers[family] = currentTier + 1;
            return { family, fromTier: currentTier, toTier: currentTier + 1, uses };
        }
        return null;
    }

    _getTierThreshold(tier) {
        if (tier <= 1) return 0;
        // Exponential growth: 100, 300, 900, 2700, 8100, 24300, 72900...
        return Math.floor(100 * Math.pow(3, tier - 2));
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            origin: this.origin,
            level: this.level,
            exp: this.exp,
            expToNextLevel: this.getExpToNextLevel(),
            statPoints: this.statPoints,
            maxSkillSlots: this.maxSkillSlots,
            baseMaxHp: this.baseMaxHp,
            baseMaxMp: this.baseMaxMp,
            baseStrength: this.baseStrength,
            baseSpeed: this.baseSpeed,
            baseDefense: this.baseDefense,
            baseMagicPower: this.baseMagicPower,
            maxHp: this.maxHp,
            maxMp: this.maxMp,
            maxStamina: this.maxStamina,
            strength: this.strength,
            speed: this.speed,
            defense: this.defense,
            magicPower: this.magicPower,
            hp: this.hp,
            mp: this.mp,
            stamina: this.stamina,
            status: this.status,
            skills: JSON.parse(JSON.stringify(this.skills)),
            techniqueUses: JSON.parse(JSON.stringify(this.techniqueUses)),
            techniqueTiers: JSON.parse(JSON.stringify(this.techniqueTiers)),
            magicXp: this.magicXp,
            glyphRepertoire: JSON.parse(JSON.stringify(this.glyphRepertoire)),
            spellCodex: JSON.parse(JSON.stringify(this.spellCodex)),
            lifetimeStats: JSON.parse(JSON.stringify(this.lifetimeStats)),
            titles: JSON.parse(JSON.stringify(this.titles)),
            bodyInscription: this.bodyInscription ? JSON.parse(JSON.stringify(this.bodyInscription)) : null,
            statusEffects: JSON.parse(JSON.stringify(this.statusEffects)),
            phoenixUsed: this.phoenixUsed,
            equipment: JSON.parse(JSON.stringify(this.equipment)),
            activeSetBonuses: this.activeSetBonuses || [],
            mealBuffs: this.mealBuffs || [],
            avatar: this.avatar
        };
    }
}
