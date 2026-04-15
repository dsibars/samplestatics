import { Progression } from './Progression.js';
import { WEAPON_FAMILIES, ARMOR_ARCHETYPES, MATERIAL_TIERS } from '../constants.js';

export class Hero {
    constructor(data) {
        this.name = data.name;
        this.level = data.level || 1;
        this.exp = data.exp || 0;
        this.statPoints = data.statPoints || 0;
        this.skillPoints = data.skillPoints || 0;

        this.baseMaxHp = data.baseMaxHp || data.maxHp || 10;
        this.baseMaxMp = data.baseMaxMp || data.maxMp || 5;
        this.baseStrength = data.baseStrength || data.strength || 1;
        this.baseSpeed = data.baseSpeed || data.speed || 1;
        this.baseDefense = data.baseDefense || data.defense || 1;
        this.baseMagicPower = data.baseMagicPower || data.magicPower || 1;

        this.origin = data.origin || 'origin_warrior';
        
        this.skills = data.skills;
        if (Array.isArray(this.skills)) {
            const skillMap = {};
            this.skills.forEach(id => skillMap[id] = 0);
            this.skills = skillMap;
        } else if (!this.skills || typeof this.skills !== 'object') {
            this.skills = { basic_attack: 0 };
        }

        this.equipment = data.equipment || {
            head: null,
            body: null,
            legs: null,
            leftHand: null,
            rightHand: null,
            accessory: null
        };

        this.statusEffects = [];

        this.recalculateStats();
        this.hp = data.hp ?? this.maxHp;
        this.mp = data.mp ?? this.maxMp;
    }

    static generateRandom(level = 1, existingNames = []) {
        const pool = [
            'Alaric', 'Kaelen', 'Thorne', 'Valerius', 'Elowen', 'Zephyr', 'Ione', 'Thalric',
            'Beryn', 'Caelum', 'Drayke', 'Eryn', 'Faolan', 'Gwyn', 'Hestia', 'Indra',
            'Jareth', 'Kynan', 'Liora', 'Maelis', 'Nyx', 'Oren', 'Phaedra', 'Quill',
            'Ronen', 'Sora', 'Tavian', 'Ulric', 'Vesper', 'Wren', 'Xara', 'Yuna', 'Zarek',
            'Alistair', 'Beatrix', 'Caspian', 'Daphne', 'Evander', 'Felix', 'Gideon', 'Hazel',
            'Isla', 'Jasper', 'Kira', 'Lucius', 'Mira', 'Nico', 'Olive', 'Silas', 'Thea',
            'Vane', 'Wyatt', 'Xander', 'Yara', 'Zane', 'Aria', 'Bastian', 'Cora', 'Dante'
        ];
        
        const availableNames = pool.filter(n => !existingNames.includes(n));
        const finalPool = availableNames.length > 0 ? availableNames : pool;
        const name = finalPool[Math.floor(Math.random() * finalPool.length)];
        
        const origins = [
            'origin_clown', 'origin_warrior', 'origin_thief',
            'origin_cook', 'origin_farmer', 'origin_guard',
            'origin_monk', 'origin_poet'
        ];
        const origin = origins[Math.floor(Math.random() * origins.length)];

        let stats = {
            name,
            origin,
            level,
            exp: 0,
            statPoints: 10,
            skillPoints: (level - 1) * 1,
            baseMaxHp: 10 + (level - 1) * 5,
            baseMaxMp: 5 + (level - 1) * 2,
            baseStrength: 1,
            baseSpeed: 1,
            baseDefense: 1,
            baseMagicPower: 1,
            skills: { basic_attack: 0 },
            equipment: {
                head: null,
                body: null,
                legs: null,
                leftHand: null,
                rightHand: null,
                accessory: null
            }
        };

        return new Hero(stats);
    }

    gainExp(amount) {
        this.exp += amount;
        let leveled = false;
        while (true) {
            const nextLevelExp = this.level * 20;
            if (this.exp >= nextLevelExp) {
                this.exp -= nextLevelExp;
                this.levelUp();
                leveled = true;
            } else {
                break;
            }
        }
        return leveled;
    }

    levelUp() {
        this.level++;
        this.statPoints += (this.level % 5 === 0) ? 3 : 2;
        this.skillPoints += 1;
        this.recalculateStats();
        this.hp = this.maxHp;
        this.mp = this.maxMp;
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

    recalculateStats() {
        const boosts = Progression.prog.upgrades || {};
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
            dmgMult: 1.0,
            mpCostReduction: 0,
            vampirism: 0,
            sturdy: 0 // Phoenix chance
        };

        Object.values(this.equipment).forEach(item => {
            if (!item) return;

            let itemPower = 0;
            let itemTierMult = 1.0;

            if (item.type === 'weapon') {
                const family = WEAPON_FAMILIES[item.family];
                const tier = MATERIAL_TIERS[item.material];
                if (family && tier) {
                    itemTierMult = tier.mult;
                    const upgradeMult = Math.pow(1.1, item.level || 0);
                    itemPower = 2 * tier.mult * upgradeMult;
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
                    itemTierMult = tier.mult;
                    const upgradeMult = Math.pow(1.1, item.level || 0);
                    itemPower = 5 * tier.mult * upgradeMult;
                    equipBonus.defense += itemPower * arch.defMult;
                    equipBonus.maxHp += itemPower * (arch.hpMult || 0);
                    equipBonus.maxMp += itemPower * (arch.mpMult || 0);
                    equipBonus.magicPower += itemPower * (arch.magMult || 0);
                    equipBonus.speed += arch.spdPenalty || 0;
                    equipBonus.evasion += arch.evaPenalty || arch.evaBonus || 0;
                }
            }

            // Handle Affixes (Awakening)
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
                            equipBonus.accuracy += 20; // Using as additive bonus to internal R calculation
                            break;
                        case 'phoenix':
                            equipBonus.sturdy = 1;
                            break;
                    }
                });
            }
        });

        let hasteMult = 1.0;
        if (this.statusEffects.some(e => e.type === 'haste')) hasteMult = 1.5;

        this.maxHp = Math.floor((this.baseMaxHp + (boosts.hp_boost || 0) * 10 + equipBonus.maxHp) * traitMults.maxHp);
        this.maxMp = Math.floor((this.baseMaxMp + equipBonus.maxMp) * traitMults.maxMp);
        this.strength = Math.floor((this.baseStrength + (boosts.attack_boost || 0) + equipBonus.strength) * traitMults.strength);
        this.speed = Math.floor((this.baseSpeed + equipBonus.speed) * traitMults.speed * hasteMult);
        this.defense = Math.floor((this.baseDefense + (boosts.defense_boost || 0) + equipBonus.defense) * traitMults.defense);
        this.magicPower = Math.floor((this.baseMagicPower + equipBonus.magicPower) * traitMults.magicPower);
        this.evasion = equipBonus.evasion;
        this.mpCostReduction = equipBonus.mpCostReduction;
        this.vampirism = equipBonus.vampirism;
        this.critChanceBonus = equipBonus.critChance;
        this.accuracyBonus = equipBonus.accuracy;
        this.hasPhoenix = !!equipBonus.sturdy;
        
        this.hp = Math.min(this.hp, this.maxHp);
        this.mp = Math.min(this.mp, this.maxMp);
    }

    draw(ctx, x, y, isTurn) {
        ctx.fillStyle = '#0af';
        if (this.hp <= 0) ctx.fillStyle = '#444';
        ctx.fillRect(x - 20, y - 20, 40, 40);

        if (isTurn) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x - 22, y - 22, 44, 44);
        }

        this.statusEffects.forEach((eff, i) => {
            ctx.fillStyle = this.getStatusColor(eff.type);
            ctx.beginPath();
            ctx.arc(x - 15 + (i * 10), y - 35, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = '#fff';
        ctx.font = '12px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, x, y - 45);

        ctx.fillStyle = '#000';
        ctx.fillRect(x - 20, y + 25, 40, 5);
        ctx.fillStyle = '#0f0';
        ctx.fillRect(x - 20, y + 25, 40 * (this.hp / this.maxHp), 5);

        ctx.fillStyle = '#000';
        ctx.fillRect(x - 20, y + 32, 40, 3);
        ctx.fillStyle = '#0af';
        ctx.fillRect(x - 20, y + 32, 40 * (this.mp / this.maxMp), 3);
    }

    getStatusColor(type) {
        switch (type) {
            case 'poison': return '#0f0';
            case 'sleep': return '#88f';
            case 'stun': return '#ff0';
            case 'burn': return '#f80';
            case 'haste': return '#0ff';
            default: return '#fff';
        }
    }

    toJSON() {
        return {
            name: this.name,
            level: this.level,
            exp: this.exp,
            statPoints: this.statPoints,
            skillPoints: this.skillPoints,
            baseMaxHp: this.baseMaxHp,
            hp: this.hp,
            baseMaxMp: this.baseMaxMp,
            mp: this.mp,
            baseStrength: this.baseStrength,
            baseSpeed: this.baseSpeed,
            baseDefense: this.baseDefense,
            baseMagicPower: this.baseMagicPower,
            skills: this.skills,
            origin: this.origin,
            equipment: this.equipment
        };
    }
}
