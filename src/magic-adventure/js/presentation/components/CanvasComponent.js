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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.props.drawingEngine.clear();
    }

    redraw() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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
