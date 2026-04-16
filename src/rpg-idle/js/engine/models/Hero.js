import { WEAPON_FAMILIES, ARMOR_ARCHETYPES, MATERIAL_TIERS } from '../../constants.js';
import { Result } from '../core/Result.js';

export class Hero {
    constructor(data) {
        this.id = data.id || crypto.randomUUID();
        this.name = data.name;
        this.origin = data.origin || 'origin_warrior';
        this.level = data.level || 1;
        this.exp = data.exp || 0;
        this.statPoints = data.statPoints || 0;
        this.skillPoints = data.skillPoints || 0;

        // Base stats
        this.baseMaxHp = data.baseMaxHp || 10;
        this.baseMaxMp = data.baseMaxMp || 5;
        this.baseStrength = data.baseStrength || 1;
        this.baseSpeed = data.baseSpeed || 1;
        this.baseDefense = data.baseDefense || 1;
        this.baseMagicPower = data.baseMagicPower || 1;

        // Dynamic state
        this.hp = data.hp ?? this.baseMaxHp;
        this.mp = data.mp ?? this.baseMaxMp;
        this.status = data.status || 'resting'; // 'active', 'resting', 'training'

        this.skills = data.skills || { basic_attack: 0 };
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

        const hpBoost = (villageUpgrades.hp_boost || 0) * 10;
        const atkBoost = (villageUpgrades.attack_boost || 0);
        const defBoost = (villageUpgrades.defense_boost || 0);

        this.maxHp = Math.floor((this.baseMaxHp + hpBoost + equipBonus.maxHp) * traitMults.maxHp);
        this.maxMp = Math.floor((this.baseMaxMp + equipBonus.maxMp) * traitMults.maxMp);
        this.strength = Math.floor((this.baseStrength + atkBoost + equipBonus.strength) * traitMults.strength);
        this.speed = Math.floor((this.baseSpeed + equipBonus.speed) * traitMults.speed);
        this.defense = Math.floor((this.baseDefense + defBoost + equipBonus.defense) * traitMults.defense);
        this.magicPower = Math.floor((this.baseMagicPower + equipBonus.magicPower) * traitMults.magicPower);

        this.evasion = equipBonus.evasion;
        this.mpCostReduction = equipBonus.mpCostReduction;
        this.vampirism = equipBonus.vampirism;
        this.critChanceBonus = equipBonus.critChance;
        this.accuracyBonus = equipBonus.accuracy;
        this.hasPhoenix = equipBonus.hasPhoenix;

        this.hp = Math.min(this.hp, this.maxHp);
        this.mp = Math.min(this.mp, this.maxMp);
    }

    addExperience(amount) {
        this.exp += amount;
        let levelsGained = 0;
        while (true) {
            const nextLevelExp = this.level * 20;
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
        this.skillPoints += 1;

        this.baseMaxHp += 5;
        this.baseMaxMp += 2;

        this.recalculateStats();

        this.hp = this.maxHp;
        this.mp = this.maxMp;
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

    learnSkill(skillId, unlockCost) {
        if (this.skillPoints < unlockCost) return Result.fail('error_no_skill_points');
        if (this.skills[skillId] !== undefined) return Result.fail('error_skill_already_unlocked');

        this.skills[skillId] = 0;
        this.skillPoints -= unlockCost;
        return Result.ok(this.skills[skillId]);
    }

    upgradeSkill(skillId, upgradeCost) {
        if (this.skills[skillId] === undefined) return Result.fail('error_skill_locked');
        if (this.skillPoints < upgradeCost) return Result.fail('error_no_skill_points');

        this.skills[skillId]++;
        this.skillPoints -= upgradeCost;
        return Result.ok(this.skills[skillId]);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            origin: this.origin,
            level: this.level,
            exp: this.exp,
            statPoints: this.statPoints,
            skillPoints: this.skillPoints,
            baseMaxHp: this.baseMaxHp,
            baseMaxMp: this.baseMaxMp,
            baseStrength: this.baseStrength,
            baseSpeed: this.baseSpeed,
            baseDefense: this.baseDefense,
            baseMagicPower: this.baseMagicPower,
            hp: this.hp,
            mp: this.mp,
            status: this.status,
            skills: JSON.parse(JSON.stringify(this.skills)),
            equipment: JSON.parse(JSON.stringify(this.equipment))
        };
    }
}
