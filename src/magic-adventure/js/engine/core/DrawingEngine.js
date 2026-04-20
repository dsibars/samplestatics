/**
 * DrawingEngine is responsible for capturing raw point data from user interactions.
 */
export class DrawingEngine {
    constructor() {
        this.points = [];
        this.currentDrawId = 0;
        this.isDrawing = false;
        this.config = {
            sampleRateMs: 10 // Capture point every 10ms if moving
        };
        this.lastCaptureTime = 0;
    }

    startNewStroke() {
        this.currentDrawId++;
        this.isDrawing = true;
    }

    stopStroke() {
        this.isDrawing = false;
    }

    addPoint(x, y) {
        if (!this.isDrawing) return;

        const now = Date.now();
        if (now - this.lastCaptureTime < this.config.sampleRateMs) {
            return;
        }

        this.points.push({
            x,
            y,
            timestamp: now,
            drawId: this.currentDrawId
        });
        this.lastCaptureTime = now;
    }

    getRawData() {
        return [...this.points];
    }

    clear() {
        this.points = [];
        this.currentDrawId = 0;
        this.isDrawing = false;
        this.lastCaptureTime = 0;
    }

    /**
     * Groups points by drawId for easier processing
     */
    getStrokes() {
        const strokes = {};
        this.points.forEach(p => {
            if (!strokes[p.drawId]) {
                strokes[p.drawId] = [];
            }
            strokes[p.drawId].push(p);
        });
        return Object.values(strokes);
    }
}

export const drawingEngine = new DrawingEngine();
