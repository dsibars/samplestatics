import { t } from '../i18n.js';

export class Enemy {
    constructor(data) {
        this.id = data.id || 'enemy_' + Math.random().toString(36).substr(2, 9);
        this.name = data.name;
        this.type = data.type || 'slime';
        this.level = data.level || 1;
        
        this.maxHp = data.maxHp || 10;
        this.hp = data.hp ?? this.maxHp;

        this.maxMp = data.maxMp || 5;
        this.mp = data.mp ?? this.maxMp;
        
        this.strength = data.strength || 1;
        this.speed = data.speed || 1;
        this.defense = data.defense || 1;
        this.magicPower = data.magicPower || 1;
        this.element = data.element || 'neutral';

        this.skills = data.skills || { basic_attack: 0 };
        this.isBoss = data.isBoss || false;

        this.statusEffects = [];
    }

    static generate(level = 1, milestone = 1, index = 0) {
        const types = [
            { id: 'slime', name: 'Slime', hp: 8, str: 1, spd: 1, def: 1, mag: 1, el: 'water' },
            { id: 'goblin', name: 'Goblin', hp: 12, str: 2, spd: 3, def: 1, mag: 0, el: 'wind' },
            { id: 'wolf', name: 'Wolf', hp: 10, str: 3, spd: 4, def: 1, mag: 0, el: 'neutral' },
            { id: 'wisp', name: 'Wisp', hp: 6, str: 1, spd: 5, def: 0, mag: 3, el: 'storm' },
            { id: 'golem', name: 'Golem', hp: 25, str: 4, spd: 1, def: 5, mag: 1, el: 'fire' }
        ];

        const isBoss = milestone % 10 === 0 && milestone > 0 && index === 0;
        const type = types[Math.floor(Math.random() * types.length)];
        
        const mult = 1 + (level - 1) * 0.2;
        const bossMult = isBoss ? 4.0 : 1.0;

        const nameSuffix = index > 0 ? ` ${String.fromCharCode(65 + index)}` : '';

        return new Enemy({
            name: (isBoss ? 'BOSS: ' : '') + type.name + nameSuffix,
            type: type.id,
            level,
            maxHp: Math.floor(type.hp * mult * bossMult),
            strength: Math.floor(type.str * mult * bossMult),
            speed: Math.floor(type.spd * mult * (isBoss ? 1.5 : 1.0)),
            defense: Math.floor(type.def * mult * bossMult),
            magicPower: Math.floor(type.mag * mult * bossMult),
            element: type.el,
            isBoss,
            skills: { basic_attack: 0 }
        });
    }

    static generateGroup(milestone) {
        const level = Math.max(1, Math.floor(milestone / 2));
        const isBossMilestone = milestone % 10 === 0 && milestone > 0;

        let count = 1;
        if (isBossMilestone) {
            count = milestone >= 50 ? 3 : 1;
        } else {
            const roll = Math.random();
            if (milestone < 5) count = 1;
            else if (milestone < 15) count = roll < 0.7 ? 1 : 2;
            else if (milestone < 30) count = roll < 0.4 ? 1 : (roll < 0.8 ? 2 : 3);
            else count = roll < 0.3 ? 2 : (roll < 0.7 ? 3 : 4);
        }

        const group = [];
        for (let i = 0; i < count; i++) {
            group.push(this.generate(level, milestone, i));
        }

        if (count > 1) {
            const hpReduction = 1.2 / count;
            group.forEach(e => {
                e.maxHp = Math.floor(e.maxHp * hpReduction);
                e.hp = e.maxHp;
                e.strength = Math.floor(e.strength * (1.1 / count) + 1);
                e.magicPower = Math.floor(e.magicPower * (1.1 / count) + 1);
            });
        }

        return group;
    }

    draw(ctx, x, y, isTurn) {
        ctx.fillStyle = this.isBoss ? '#f0f' : '#f00';
        if (this.hp <= 0) ctx.fillStyle = '#444';

        const size = this.isBoss ? 30 : 20;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        if (isTurn) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Status indicators
        this.statusEffects.forEach((eff, i) => {
            ctx.fillStyle = this.getStatusColor(eff.type);
            ctx.beginPath();
            ctx.arc(x - 15 + (i * 10), y - size - 20, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = '#fff';
        ctx.font = '12px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, x, y - size - 30);

        ctx.fillStyle = '#000';
        ctx.fillRect(x - size, y + size + 5, size * 2, 5);
        ctx.fillStyle = '#f00';
        ctx.fillRect(x - size, y + size + 5, (size * 2) * (this.hp / this.maxHp), 5);
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
}
