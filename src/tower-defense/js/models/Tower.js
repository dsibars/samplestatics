import { Progression } from './Progression.js';

export class Tower {
    constructor(gridX, gridY, cellSize, definition) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.cellSize = cellSize;
        
        // Pixel center
        this.x = gridX * cellSize + cellSize / 2;
        this.y = gridY * cellSize + cellSize / 2;
        
        this.definition = definition;
        
        const modifiers = Progression.getTowerModifiers(definition.id);
        
        this.stats = { 
            ...definition.stats,
            damage: definition.stats.damage + modifiers.damageAdd,
            cooldownMs: Math.max(100, Math.floor(definition.stats.cooldownMs * modifiers.cooldownMult))
        };
        
        this.presentation = { ...definition.presentation };
        
        // Convert range from cells to pixels
        this.rangePixels = this.stats.range * cellSize;
        
        this.cooldownTimer = 0;
        
        // Visualization & logic state
        this.currentTarget = null;
        this.isFiring = false;
        this.fireTarget = null;
        this.fireTimer = 0;
    }

    update(deltaTime, enemies) {
        if (this.cooldownTimer > 0) {
            this.cooldownTimer -= deltaTime;
        }

        // Handle firing visual duration
        if (this.isFiring) {
            this.fireTimer -= deltaTime;
            if (this.fireTimer <= 0) {
                this.isFiring = false;
                this.fireTarget = null;
            }
        }

        if (this.cooldownTimer <= 0) {
            this.acquireAndFire(enemies);
        }
    }

    acquireAndFire(enemies) {
        // Evaluate if current target is still viable
        if (this.currentTarget) {
            if (this.currentTarget.isDead || this.currentTarget.reachedGoal) {
                this.currentTarget = null;
            } else {
                const dx = this.currentTarget.x - this.x;
                const dy = this.currentTarget.y - this.y;
                if (Math.sqrt(dx * dx + dy * dy) > this.rangePixels) {
                    this.currentTarget = null;
                }
            }
        }

        // If no target, acquire closest
        if (!this.currentTarget) {
            let bestTarget = null;
            let bestDistance = Infinity;

            for (const enemy of enemies) {
                if (enemy.isDead || enemy.reachedGoal) continue;

                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist <= this.rangePixels && dist < bestDistance) {
                    bestTarget = enemy;
                    bestDistance = dist;
                }
            }
            this.currentTarget = bestTarget;
        }

        if (this.currentTarget) {
            // FIRE!
            this.currentTarget.takeDamage(this.stats.damage);
            this.cooldownTimer = this.stats.cooldownMs;
            
            // Setup visual effect
            this.isFiring = true;
            this.fireTarget = this.currentTarget; // Keep a reference for rendering the laser hit location
            this.fireTimer = 100; // Show laser for 100ms
        }
    }

    draw(ctx) {
        // Draw Range (Subtle)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.rangePixels, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.stroke();

        // Draw Base
        const radius = this.cellSize * this.presentation.radiusMult;
        ctx.fillStyle = this.presentation.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Draw Laser Effect
        if (this.isFiring && this.fireTarget) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            // Draw slightly random line towards target for energy effect
            ctx.lineTo(this.fireTarget.x, this.fireTarget.y);
            ctx.strokeStyle = this.presentation.color;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.presentation.color;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.lineWidth = 1;
        }
    }
}
