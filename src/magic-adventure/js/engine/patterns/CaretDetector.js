import { PatternDetector } from './PatternDetector.js';

/**
 * Detects caret-like shapes (^, v, >, <) in four directions.
 */
export class CaretDetector extends PatternDetector {
    constructor() {
        super('caret');
        this.DIRECTIONS = {
            UP: 'caret_up',
            DOWN: 'caret_down',
            LEFT: 'caret_left',
            RIGHT: 'caret_right'
        };
    }

    detect(points) {
        if (points.length < 5) return null;
        const box = this.getBoundingBox(points);

        // Minimum size to avoid noise
        if (box.width < 10 && box.height < 10) return null;

        // We look for a "peak" in the stroke.
        // For UP, the peak is min Y.
        // For DOWN, the peak is max Y.
        // For LEFT, the peak is min X.
        // For RIGHT, the peak is max X.

        let peakIndex = 0;
        let minX = points[0].x, maxX = points[0].x, minY = points[0].y, maxY = points[0].y;
        let minXIdx = 0, maxXIdx = 0, minYIdx = 0, maxYIdx = 0;

        points.forEach((p, i) => {
            if (p.x < minX) { minX = p.x; minXIdx = i; }
            if (p.x > maxX) { maxX = p.x; maxXIdx = i; }
            if (p.y < minY) { minY = p.y; minYIdx = i; }
            if (p.y > maxY) { maxY = p.y; maxYIdx = i; }
        });

        // Calculate scores for each direction
        const scores = [
            { dir: this.DIRECTIONS.UP, peakIdx: minYIdx, score: this.evaluateCaret(points, minYIdx, 'y', -1, box) },
            { dir: this.DIRECTIONS.DOWN, peakIdx: maxYIdx, score: this.evaluateCaret(points, maxYIdx, 'y', 1, box) },
            { dir: this.DIRECTIONS.LEFT, peakIdx: minXIdx, score: this.evaluateCaret(points, minXIdx, 'x', -1, box) },
            { dir: this.DIRECTIONS.RIGHT, peakIdx: maxXIdx, score: this.evaluateCaret(points, maxXIdx, 'x', 1, box) }
        ];

        const best = scores.reduce((prev, curr) => (curr.score > prev.score) ? curr : prev);

        if (best.score > 0.6) {
            return {
                score: best.score,
                type: best.dir,
                metadata: { direction: best.dir, boundingBox: box }
            };
        }

        return null;
    }

    evaluateCaret(points, peakIdx, axis, sign, box) {
        // Peak should not be at the very start or end of the stroke (must have two sides)
        const minPointsSide = Math.max(2, points.length * 0.2);
        if (peakIdx < minPointsSide || peakIdx > points.length - 1 - minPointsSide) return 0;

        const peak = points[peakIdx];
        const otherAxis = axis === 'x' ? 'y' : 'x';

        // Start and end points
        const start = points[0];
        const end = points[points.length - 1];

        // For UP: axis='y', sign=-1. Peak should have lowest Y. Start and End should have higher Y.
        // For RIGHT: axis='x', sign=1. Peak should have highest X. Start and End should have lower X.

        const peakVal = peak[axis];
        const startVal = start[axis];
        const endVal = end[axis];

        // Distance from peak to start/end in the primary axis
        const distStart = Math.abs(startVal - peakVal);
        const distEnd = Math.abs(endVal - peakVal);
        const boxDim = axis === 'y' ? box.height : box.width;

        if (distStart < boxDim * 0.4 || distEnd < boxDim * 0.4) return 0;

        // Check if it's "pointy" enough. The peak should be extreme.
        // Also check if the two legs go "away" from the peak.

        // Let's check monotonicity
        let monotonicCount = 0;
        for (let i = 1; i <= peakIdx; i++) {
            if (sign === -1) { // UP or LEFT
                if (points[i][axis] <= points[i-1][axis]) monotonicCount++;
            } else { // DOWN or RIGHT
                if (points[i][axis] >= points[i-1][axis]) monotonicCount++;
            }
        }
        for (let i = peakIdx + 1; i < points.length; i++) {
            if (sign === -1) {
                if (points[i][axis] >= points[i-1][axis]) monotonicCount++;
            } else {
                if (points[i][axis] <= points[i-1][axis]) monotonicCount++;
            }
        }

        const monotonicity = monotonicCount / (points.length - 1);

        // Aspect ratio: a caret should be longer in the axis perpendicular to its direction?
        // Actually, ^ is usually taller than wide or vice versa.
        // Let's just use monotonicity and extremity.

        return monotonicity * 0.9;
    }
}
