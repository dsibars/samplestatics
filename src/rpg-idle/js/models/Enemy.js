export class Enemy {
    constructor(name, level, stats, isBoss = false, element = 'neutral') {
        this.name = name;
        this.level = level;
        this.isBoss = isBoss;
        this.element = element;

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
        
        // Multiplier stacks from Milestone 11 onwards (except for themed overrides)
        const bossesPassed = Math.floor(milestone / 5);
        const postBossesPassed = Math.floor((milestone - 1) / 5);
        const totalStacks = Math.max(0, (bossesPassed - 2) + (postBossesPassed - 2)); 
        const multiplier = Math.pow(1.3, totalStacks);

        let stats = {
            hp: Math.floor((8 + (level * 4)) * multiplier),
            strength: Number(((2 + (level * 1.5)) * multiplier).toFixed(1)),
            speed: Number(((1 + (level * 0.5)) * multiplier).toFixed(1)),
            defense: Number(((level * 0.5) * multiplier).toFixed(1)),
            magicPower: Number(((level * 0.5) * multiplier).toFixed(1))
        };

        let element = 'neutral';

        // --- THEMED PROGRESSION BLOCKS ---
        if (milestone <= 10) {
            element = 'neutral';
            if (milestone <= 3) {
                stats.speed = 1; stats.defense = 0; stats.strength = 3;
            } else if (milestone === 4) {
                stats.speed = 2; stats.defense = 0.5; stats.strength = 5;
            } else if (milestone === 5) {
                stats.speed = 3.5; stats.defense = 1; stats.strength = 10; stats.hp *= 1.5;
            } else if (milestone <= 9) {
                stats.speed = 4; stats.defense = 2; stats.strength = 12;
            } else if (milestone === 10) {
                stats.speed = 5; stats.defense = 4; stats.strength = 20; stats.hp *= 1.5;
            }
        } else if (milestone <= 15) {
            // BLOCK 11-15: "THE WALL" (Defense Focus)
            stats.defense *= 1.5;
            if (isBoss) { // Milestone 15
                stats.defense *= 1.7; // Even harder defense test
                stats.hp *= 1.5; 
            }
        } else if (milestone <= 20) {
            // BLOCK 16-20: "THE BRUTE" (Strength Focus, Slow)
            stats.strength *= 1.7;
            stats.speed *= 0.7;
            if (isBoss) { // Milestone 20
                stats.strength *= 1.3;
                stats.speed *= 0.8; // Actually 0.7 * 0.8 = 0.56 total
                stats.hp *= 1.5;
            }
        } else if (milestone <= 40) {
            // ELEMENTAL BLOCKS
            if (milestone <= 25) element = 'fire';
            else if (milestone <= 30) element = 'water';
            else if (milestone <= 35) element = 'wind';
            else if (milestone <= 40) element = 'storm';
            
            if (isBoss) {
                stats.hp *= 1.5;
                stats.strength *= 1.2;
                stats.speed *= 1.2;
            }
        } else {
            // POST-THEMED (41+): Random elements
            const elementRand = Math.random();
            if (elementRand > 0.33) {
                const elements = ['fire', 'water', 'wind', 'storm'];
                element = elements[Math.floor(Math.random() * elements.length)];
            }
            if (isBoss) {
                stats.hp *= 1.5;
                stats.strength *= 1.2;
                stats.speed *= 1.2;
            }
        }

        // Final rounding to ensure integers for HP and clean decimals for others
        stats.hp = Math.floor(stats.hp);
        stats.strength = Number(stats.strength.toFixed(1));
        stats.speed = Number(stats.speed.toFixed(1));
        stats.defense = Number(stats.defense.toFixed(1));
        stats.magicPower = Number(stats.magicPower.toFixed(1));

        return new Enemy(isBoss ? `Giant ${name}` : name, level, stats, isBoss, element);
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

        this.drawElementDiagram(ctx, x - 100, y);
    }

    drawElementDiagram(ctx, x, y) {
        const positions = {
            fire: { x: 0, y: -25, color: '#ff4444' },
            wind: { x: 25, y: 0, color: '#44ff44' },
            storm: { x: 0, y: 25, color: '#ffff44' },
            water: { x: -25, y: 0, color: '#4444ff' }
        };

        const elements = ['fire', 'wind', 'storm', 'water'];
        
        ctx.save();
        ctx.translate(x, y);

        // Draw Arrows
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        elements.forEach((el, i) => {
            const start = positions[el];
            const next = positions[elements[(i + 1) % 4]];
            this.drawArrow(ctx, start.x, start.y, next.x, next.y);
        });

        // Draw Circles
        elements.forEach(el => {
            const pos = positions[el];
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
            ctx.strokeStyle = pos.color;
            ctx.lineWidth = 1;
            ctx.stroke();

            if (this.element === el) {
                ctx.fillStyle = pos.color;
                ctx.fill();
            }
        });

        ctx.restore();
    }

    drawArrow(ctx, x1, y1, x2, y2) {
        const headlen = 5;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        
        // Offset from center of circles (radius 8)
        const ox = Math.cos(angle) * 10;
        const oy = Math.sin(angle) * 10;
        
        const sx = x1 + ox;
        const sy = y1 + oy;
        const ex = x2 - ox;
        const ey = y2 - oy;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - headlen * Math.cos(angle - Math.PI / 6), ey - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - headlen * Math.cos(angle + Math.PI / 6), ey - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    }
}
