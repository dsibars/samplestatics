import { Component } from '../Component.js';

export class CanvasComponent extends Component {
    constructor(props) {
        super(props); // props should include drawingEngine
        this.canvas = null;
        this.ctx = null;
    }

    render() {
        return `
            <div class="canvas-container" style="width: 100%; height: 50vh; background: #fff; border: 2px solid #333; cursor: crosshair; touch-action: none;">
                <canvas id="drawing-canvas"></canvas>
            </div>
        `;
    }

    onMount() {
        this.canvas = this.element.querySelector('#drawing-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        window.addEventListener('resize', () => this.resize());
        this.drawMagicCircle();

        this.canvas.addEventListener('pointerdown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('pointermove', (e) => this.draw(e));
        this.canvas.addEventListener('pointerup', () => this.stopDrawing());
        this.canvas.addEventListener('pointercancel', () => this.stopDrawing());
    }

    resize() {
        const rect = this.element.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.redraw();
    }

    startDrawing(e) {
        this.canvas.setPointerCapture(e.pointerId);
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.props.drawingEngine.startNewStroke();
        this.props.drawingEngine.addPoint(x, y);

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
    }

    draw(e) {
        if (!this.props.drawingEngine.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.props.drawingEngine.addPoint(x, y);

        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    stopDrawing() {
        this.props.drawingEngine.stopStroke();
    }

    clear() {
        if (this.clearTimer) clearTimeout(this.clearTimer);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMagicCircle();
        this.props.drawingEngine.clear();
    }

    highlightRecognized(recognizedItems) {
        if (!this.ctx) return;

        const typeColors = {
            'fire': '#ff5722',
            'water': '#2196f3',
            'square': '#795548',
            'circle': '#ffeb3b',
            'sleep': '#9c27b0',
            'poison': '#4caf50',
            'plus': '#ffc107',
            'dash': '#607d8b',
            'infinity': '#00bcd4',
            'arrow': '#e91e63'
        };

        recognizedItems.forEach(item => {
            if (item.type === 'unknown' || !item.strokes) return;

            const color = typeColors[item.type] || '#000';
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 5;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = color;

            item.strokes.forEach(stroke => {
                if (stroke.length < 1) return;
                this.ctx.beginPath();
                this.ctx.moveTo(stroke[0].x, stroke[0].y);
                for (let i = 1; i < stroke.length; i++) {
                    this.ctx.lineTo(stroke[i].x, stroke[i].y);
                }
                this.ctx.stroke();
            });
        });

        // Reset context styles
        this.ctx.lineWidth = 3;
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = 'transparent';
    }

    drawMagicCircle() {
        if (!this.ctx) return;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const outerRadius = Math.min(width, height) * 0.45;
        const innerRadius = outerRadius * 0.5;

        // Draw 4 slices (as annular sectors to avoid overlapping the core)
        const colors = ['#e0f2f1', '#b2dfdb', '#80cbc4', '#4db6ac']; // Greenish to Bluish
        for (let i = 0; i < 4; i++) {
            const startAngle = i * Math.PI / 2 - Math.PI / 4;
            const endAngle = (i + 1) * Math.PI / 2 - Math.PI / 4;

            this.ctx.beginPath();
            // Outer arc
            this.ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
            // Inner arc (backwards)
            this.ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
            this.ctx.closePath();

            this.ctx.fillStyle = colors[i];
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            this.ctx.stroke();
        }

        // Draw Core Circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        this.ctx.setLineDash([5, 5]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    redraw() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMagicCircle();

        const strokes = this.props.drawingEngine.getStrokes();
        strokes.forEach(stroke => {
            if (stroke.length < 1) return;
            this.ctx.beginPath();
            this.ctx.moveTo(stroke[0].x, stroke[0].y);
            for (let i = 1; i < stroke.length; i++) {
                this.ctx.lineTo(stroke[i].x, stroke[i].y);
            }
            this.ctx.stroke();
        });
    }
}
