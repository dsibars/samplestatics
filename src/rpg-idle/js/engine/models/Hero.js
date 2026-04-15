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
        // Basic auto-scaling (could be more complex based on origin)
        this.baseMaxHp += 5;
        this.baseMaxMp += 2;
        this.hp = this.baseMaxHp; // Heal on level up
        this.mp = this.baseMaxMp;
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

        if (statId === 'baseMaxHp') this.hp += gain;
        if (statId === 'baseMaxMp') this.mp += gain;

        return Result.ok(this[statId]);
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
            skills: this.skills,
            equipment: this.equipment
        };
    }
}
