export class Enemy {
    constructor(name, level, stats, isBoss = false) {
        this.name = name;
        this.level = level;
        this.isBoss = isBoss;

        this.maxHp = stats.hp;
        this.hp = this.maxHp;
        this.strength = stats.strength;
        this.speed = stats.speed;
        this.defense = stats.defense;
        this.magicPower = stats.magicPower || 1;
    }

    static generate(level, milestone) {
        const names = ['Slime', 'Goblin', 'Wolf', 'Skeleton', 'Orc', 'Dark Knight'];
        const nameIdx = Math.min(names.length - 1, Math.floor(milestone / 10));
        const name = names[nameIdx];
        const isBoss = milestone % 5 === 0;
        
        let stats = {
            hp: 8 + (level * 4),
            strength: 2 + (level * 1.5),
            speed: 1 + (level * 0.5),
            defense: level * 0.5,
            magicPower: level * 0.5
        };

        if (milestone <= 10) {
            // "Hidden Tutorial" Overrides
            if (milestone <= 3) {
                stats.speed = 1;
                stats.defense = 0;
                stats.strength = 3;
            } else if (milestone === 4) {
                stats.speed = 2;
                stats.defense = 0.5;
                stats.strength = 5;
            } else if (milestone === 5) {
                stats.speed = 3.5;
                stats.defense = 1;
                stats.strength = 10;
                stats.hp *= 1.5;
            } else if (milestone <= 9) {
                stats.speed = 4;
                stats.defense = 2;
                stats.strength = 12;
            } else if (milestone === 10) {
                stats.speed = 5;
                stats.defense = 4;
                stats.strength = 20;
                stats.hp *= 1.5;
            }
        } else {
            // Growth Phase (Milestone 11+)
            // Multiplier jumps at every boss (5, 10, 15...) and post-boss (6, 11, 16...)
            const bossesPassed = Math.floor(milestone / 5);
            const postBossesPassed = Math.floor((milestone - 1) / 5);
            const totalStacks = (bossesPassed - 2) + (postBossesPassed - 2); 
            // -2 because we start counting stacks from Milestone 11. 
            // At M=11, bossesPassed=2, postBossesPassed=2. totalStacks = 0.
            // At M=15 (Boss), bossesPassed=3, postBossesPassed=2. totalStacks = 1.
            // At M=16 (Post-Boss), bossesPassed=3, postBossesPassed=3. totalStacks = 2.
            
            const multiplier = Math.pow(1.3, Math.max(0, totalStacks));
            
            stats.hp *= multiplier;
            stats.strength *= multiplier;
            stats.speed *= multiplier;
            stats.defense *= multiplier;
            
            if (isBoss) {
                stats.hp *= 1.5;
                stats.strength *= 1.2;
                stats.speed *= 1.2;
            }
        }

        return new Enemy(isBoss ? `Giant ${name}` : name, level, stats, isBoss);
    }

    draw(ctx, x, y) {
        // Draw Enemy as a circle
        ctx.fillStyle = this.isBoss ? '#f0f' : '#f55';
        if (this.hp <= 0) ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.arc(x, y, this.isBoss ? 40 : 30, 0, Math.PI * 2);
        ctx.fill();

        // Name
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(`Lvl ${this.level} ${this.name}`, x, y - 50);

        // HP Bar
        const barWidth = 120;
        ctx.fillStyle = '#000';
        ctx.fillRect(x - barWidth/2, y + 50, barWidth, 10);
        ctx.fillStyle = '#f55';
        ctx.fillRect(x - barWidth/2, y + 50, barWidth * (this.hp / this.maxHp), 10);

        ctx.fillStyle = '#fff';
        ctx.font = '10px Outfit';
        ctx.fillText(`${Math.ceil(this.hp)} / ${this.maxHp}`, x, y + 60);
    }
}
