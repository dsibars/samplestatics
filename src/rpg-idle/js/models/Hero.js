import { Progression } from './Progression.js';

export class Hero {
    constructor(data) {
        this.name = data.name;
        this.level = data.level || 1;
        this.exp = data.exp || 0;

        // Base stats + permanent boosts
        const boosts = Progression.prog.upgrades || {};
        this.maxHp = data.maxHp + (boosts.hp_boost || 0) * 10;
        this.hp = data.hp ?? this.maxHp;
        this.maxMp = data.maxMp;
        this.mp = data.mp ?? data.maxMp;
        this.strength = data.strength + (boosts.attack_boost || 0);
        this.speed = data.speed;
        this.defense = data.defense + (boosts.defense_boost || 0);
        this.magicPower = data.magicPower;

        this.skills = data.skills || ['basic_attack'];
        this.type = data.type || 'warrior'; // 'warrior' or 'mage'-like
    }

    static generateRandom(level = 1) {
        const types = ['warrior', 'mage'];
        const type = types[Math.floor(Math.random() * types.length)];
        const names = {
            warrior: ['Alaric', 'Kaelen', 'Thorne', 'Valerius'],
            mage: ['Elowen', 'Zephyr', 'Ione', 'Thalric']
        };
        const name = names[type][Math.floor(Math.random() * names[type].length)];

        let stats = {
            name,
            level,
            type,
            exp: 0
        };

        if (type === 'warrior') {
            stats.maxHp = 100 + (level * 20);
            stats.maxMp = 20 + (level * 5);
            stats.strength = 15 + (level * 3);
            stats.speed = 10 + (level * 1);
            stats.defense = 10 + (level * 2);
            stats.magicPower = 5 + (level * 1);
            stats.skills = ['basic_attack', 'double_attack'];
        } else {
            stats.maxHp = 60 + (level * 10);
            stats.maxMp = 60 + (level * 15);
            stats.strength = 5 + (level * 1);
            stats.speed = 12 + (level * 1.5);
            stats.defense = 5 + (level * 1);
            stats.magicPower = 15 + (level * 4);
            stats.skills = ['basic_attack', 'basic_ice_ball'];
        }

        return new Hero(stats);
    }

    gainExp(amount) {
        this.exp += amount;
        const nextLevelExp = this.level * 100;
        if (this.exp >= nextLevelExp) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.exp = 0;
        if (this.type === 'warrior') {
            this.maxHp += 20;
            this.maxMp += 5;
            this.strength += 3;
            this.speed += 1;
            this.defense += 2;
            this.magicPower += 1;
        } else {
            this.maxHp += 10;
            this.maxMp += 15;
            this.strength += 1;
            this.speed += 1.5;
            this.defense += 1;
            this.magicPower += 4;
        }
        this.hp = this.maxHp;
        this.mp = this.maxMp;
    }

    draw(ctx, x, y, isTurn) {
        // Draw Hero as a square
        ctx.fillStyle = this.type === 'warrior' ? '#0af' : '#a0f';
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
            maxHp: this.maxHp,
            hp: this.hp,
            maxMp: this.maxMp,
            mp: this.mp,
            strength: this.strength,
            speed: this.speed,
            defense: this.defense,
            magicPower: this.magicPower,
            skills: this.skills,
            type: this.type
        };
    }
}
