export class Enemy {
    constructor(data) {
        this.id = data.id || crypto.randomUUID();
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

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            level: this.level,
            maxHp: this.maxHp,
            hp: this.hp,
            maxMp: this.maxMp,
            mp: this.mp,
            strength: this.strength,
            speed: this.speed,
            defense: this.defense,
            magicPower: this.magicPower,
            element: this.element,
            skills: this.skills,
            isBoss: this.isBoss
        };
    }
}
