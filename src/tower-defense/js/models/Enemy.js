export class Enemy {
    constructor(path, cellSize, stats, presentation, adjustments = {}) {
        this.path = path;
        this.cellSize = cellSize;
        
        // Stats: Logic properties
        this.stats = { 
            hp: stats.hp || 5,
            speed: stats.speed || 2,
            damage: stats.damage || 1,
            reward: stats.reward || 5,
            ...stats 
        };
        
        this.maxHp = this.stats.hp;
        
        // Presentation: Visual properties
        this.presentation = {
            color: presentation.color || '#ff0055',
            radiusMult: presentation.radiusMult || 0.3,
            ...presentation
        };

        // Apply adjustments (e.g. from difficulty or mode)
        if (adjustments.speedMult) this.stats.speed *= adjustments.speedMult;
        if (adjustments.damageMult) this.stats.damage *= adjustments.damageMult;

        this.currentPathIndex = 0;
        this.x = path[0].x * cellSize + cellSize / 2;
        this.y = path[0].y * cellSize + cellSize / 2;
        
        this.targetX = path[0].x * cellSize + cellSize / 2;
        this.targetY = path[0].y * cellSize + cellSize / 2;
        
        this.isDead = false;
        this.reachedGoal = false;
        this.speedBoostTimer = 0;
        
        this.nextTarget();
    }

    nextTarget() {
        this.currentPathIndex++;
        if (this.currentPathIndex < this.path.length) {
            this.targetX = this.path[this.currentPathIndex].x * this.cellSize + this.cellSize / 2;
            this.targetY = this.path[this.currentPathIndex].y * this.cellSize + this.cellSize / 2;
        } else {
            this.reachedGoal = true;
            this.isDead = true;
        }
    }

    takeDamage(amo) {
        if (this.isDead) return;
        this.stats.hp -= amo;
        if (this.stats.hp <= 0) {
            this.stats.hp = 0;
            this.isDead = true;
        } else if (this.stats.burstDuration) {
            this.speedBoostTimer = this.stats.burstDuration;
        }
    }

    update(deltaTime = 16) {
        if (this.isDead) return;

        let currentSpeed = this.stats.speed;
        if (this.speedBoostTimer > 0) {
            this.speedBoostTimer -= deltaTime;
            currentSpeed *= this.stats.burstSpeedMult || 1;
        }

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < currentSpeed) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.nextTarget();
        } else {
            this.x += (dx / distance) * currentSpeed;
            this.y += (dy / distance) * currentSpeed;
        }
    }

    draw(ctx) {
        if (this.isDead) return;

        const radius = this.cellSize * this.presentation.radiusMult;

        ctx.fillStyle = this.presentation.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.presentation.color;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Draw Healthbar if damaged
        if (this.stats.hp < this.maxHp) {
            const hpPerc = Math.max(0, this.stats.hp / this.maxHp);
            const barLength = this.cellSize * 0.5;
            const barThickness = 4;
            
            // Detect if the coordinate system is flipped (Portrait Mode)
            const transform = ctx.getTransform();
            const isFlipped = Math.abs(transform.b) > 0.5; // setTransform(0, 1, 1, 0, 0, 0)
            
            let bx, by, bw, bh, bFillW, bFillH;
            
            if (isFlipped) {
                // In flipped coords (Portrait), we want a bar that stays visual-horizontal
                // Visual Horizontal = Logic Vertical
                // Visual Vertical = Logic Horizontal
                bx = this.x - radius - 10; // Offset on LogicX (ScreenY) to be "above"
                by = this.y - barLength / 2; // Centered on LogicY (ScreenX)
                bw = barThickness; // Logic width (Screen height)
                bh = barLength;    // Logic height (Screen width)
                bFillW = barThickness;
                bFillH = barLength * hpPerc;
            } else {
                // Standard orientation
                bx = this.x - barLength / 2;
                by = this.y - radius - 10;
                bw = barLength;
                bh = barThickness;
                bFillW = barLength * hpPerc;
                bFillH = barThickness;
            }
            
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(bx, by, bw, bh);
            
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(bx, by, bFillW, bFillH);
        }
    }
}
