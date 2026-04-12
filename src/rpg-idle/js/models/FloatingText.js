export class FloatingText {
    constructor(x, y, text, color = '#fff') {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        
        this.life = 1.0;
        this.decay = 0.015; // roughly 1 second at 60fps
        this.vy = -1.5; // moving up
    }

    update() {
        this.y += this.vy;
        this.life -= this.decay;
    }

    draw(ctx) {
        if (this.life <= 0) return;

        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.font = 'bold 16px Outfit';
        ctx.textAlign = 'center';
        
        // optional: add small black stroke for visibility
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillText(this.text, this.x, this.y);
        
        ctx.globalAlpha = 1.0;
    }
}
