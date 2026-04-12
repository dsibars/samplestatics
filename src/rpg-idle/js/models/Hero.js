import { Progression } from './Progression.js';

export class Hero {
    constructor(data) {
        this.name = data.name;
        this.level = data.level || 1;
        this.exp = data.exp || 0;
        this.statPoints = data.statPoints || 0;
        this.skillPoints = data.skillPoints || 0;

        // Base stats + permanent boosts
        const boosts = Progression.prog.upgrades || {};
        
        this.baseMaxHp = data.baseMaxHp || data.maxHp || 10;
        this.maxHp = this.baseMaxHp + (boosts.hp_boost || 0) * 10;
        this.hp = data.hp ?? this.maxHp;
        
        this.baseMaxMp = data.baseMaxMp || data.maxMp || 5;
        this.maxMp = this.baseMaxMp;
        this.mp = data.mp ?? this.maxMp;
        
        this.baseStrength = data.baseStrength || data.strength || 1;
        this.strength = this.baseStrength + (boosts.attack_boost || 0);
        
        this.baseSpeed = data.baseSpeed || data.speed || 1;
        this.speed = this.baseSpeed;
        
        this.baseDefense = data.baseDefense || data.defense || 1;
        this.defense = this.baseDefense + (boosts.defense_boost || 0);
        
        this.baseMagicPower = data.baseMagicPower || data.magicPower || 1;
        this.magicPower = this.baseMagicPower;
        
        // skills is now an object { skill_id: level }
        this.skills = data.skills;
        if (Array.isArray(this.skills)) {
            // Migration if old data exists
            const skillMap = {};
            this.skills.forEach(id => skillMap[id] = 0);
            this.skills = skillMap;
        } else if (!this.skills || typeof this.skills !== 'object') {
            this.skills = { basic_attack: 0 };
        }

        this.origin = data.origin || 'origin_warrior_frustrated';
    }

    static generateRandom(level = 1) {
        const names = ['Alaric', 'Kaelen', 'Thorne', 'Valerius', 'Elowen', 'Zephyr', 'Ione', 'Thalric'];
        const name = names[Math.floor(Math.random() * names.length)];
        
        const origins = [
            'origin_clown', 'origin_warrior_frustrated', 'origin_thief_bored', 
            'origin_cook_angry', 'origin_farmer_lost', 'origin_guard_lazy', 
            'origin_monk_silent', 'origin_poet_sad'
        ];
        const origin = origins[Math.floor(Math.random() * origins.length)];

        let stats = {
            name,
            origin,
            level,
            exp: 0,
            statPoints: (level - 1) * 2,
            skillPoints: (level - 1) * 1,
            baseMaxHp: 10 + (level - 1) * 5,
            baseMaxMp: 5 + (level - 1) * 2,
            baseStrength: 1,
            baseSpeed: 1,
            baseDefense: 1,
            baseMagicPower: 1,
            skills: { basic_attack: 0 }
        };

        return new Hero(stats);
    }

    gainExp(amount) {
        this.exp += amount;
        const nextLevelExp = this.level * 20;
        if (this.exp >= nextLevelExp) {
            this.levelUp();
            return true;
        }
        return false;
    }

    levelUp() {
        this.level++;
        this.exp = 0;
        this.statPoints += 2;
        this.skillPoints += 1;
        this.hp = this.maxHp;
        this.mp = this.maxMp;
    }

    recalculateStats() {
        const boosts = Progression.prog.upgrades || {};
        // Stat point efficiency: HP +3, MP +2
        this.maxHp = this.baseMaxHp + (boosts.hp_boost || 0) * 10;
        this.maxMp = this.baseMaxMp;
        this.strength = this.baseStrength + (boosts.attack_boost || 0);
        this.speed = this.baseSpeed;
        this.defense = this.baseDefense + (boosts.defense_boost || 0);
        this.magicPower = this.baseMagicPower;
        
        // Ensure current HP/MP don't exceed max
        this.hp = Math.min(this.hp, this.maxHp);
        this.mp = Math.min(this.mp, this.maxMp);
    }

    draw(ctx, x, y, isTurn) {
        // Draw Hero as a square
        ctx.fillStyle = '#0af';
        if (this.hp <= 0) ctx.fillStyle = '#444';
        ctx.fillRect(x - 20, y - 20, 40, 40);

        if (isTurn) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x - 22, y - 22, 44, 44);
        }

        // Name
        ctx.fillStyle = '#fff';
        ctx.font = '12px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, x, y - 30);

        // HP Bar
        ctx.fillStyle = '#000';
        ctx.fillRect(x - 20, y + 25, 40, 5);
        ctx.fillStyle = '#0f0';
        ctx.fillRect(x - 20, y + 25, 40 * (this.hp / this.maxHp), 5);

        // MP Bar
        ctx.fillStyle = '#000';
        ctx.fillRect(x - 20, y + 32, 40, 3);
        ctx.fillStyle = '#0af';
        ctx.fillRect(x - 20, y + 32, 40 * (this.mp / this.maxMp), 3);
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
            origin: this.origin
        };
    }
}
