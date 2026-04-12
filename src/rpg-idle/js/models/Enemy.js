export class Enemy {
    constructor(name, level, isBoss = false) {
        this.name = name;
        this.level = level;
        this.isBoss = isBoss;

        const mult = isBoss ? 3 : 1;
        this.maxHp = (4 + (level * 4)) * mult;
        this.hp = this.maxHp;
        this.strength = (1.5 + (level * 1.5)) * mult;
        this.speed = (4 + (level * 1)) * (isBoss ? 1.2 : 1);
        this.defense = (level * 0.5) * mult;
        this.magicPower = (level * 0.5) * mult;
    }

    static generate(level, milestone) {
        const names = ['Slime', 'Goblin', 'Wolf', 'Skeleton', 'Orc', 'Dark Knight'];
        const name = names[Math.min(names.length - 1, Math.floor(milestone / 10))];
        const isBoss = (milestone + 1) % 5 === 0;
        return new Enemy(isBoss ? `Giant ${name}` : name, level, isBoss);
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
