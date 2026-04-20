import { PatternDetector } from './PatternDetector.js';

/**
 * Detects circular shapes.
 */
export class CircleDetector extends PatternDetector {
    constructor() {
        super('circle');
    }

    detect(points) {
        if (points.length < 5) return null;

        const box = this.getBoundingBox(points);
        const radius = (box.width + box.height) / 4;
        const centerX = box.centerX;
        const centerY = box.centerY;

        // Check aspect ratio (circles should be roughly square-bounded)
        const aspectRatio = Math.min(box.width, box.height) / Math.max(box.width, box.height);
        if (aspectRatio < 0.7) return null;

        // Check if points are roughly at 'radius' distance from center
        let totalDeviation = 0;
        points.forEach(p => {
            const dist = this.getDistance(p, { x: centerX, y: centerY });
            totalDeviation += Math.abs(dist - radius);
        });

        const avgDeviation = totalDeviation / points.length;
        const score = Math.max(0, 1 - (avgDeviation / radius));

        // Also check if start and end points are close (closed loop)
        const startEndDist = this.getDistance(points[0], points[points.length - 1]);
        const closureScore = Math.max(0, 1 - (startEndDist / (radius * 2)));

        // NEW: Penalty for being too "square-like" (having points too close to corners of bounding box)
        const corners = [
            { x: box.x, y: box.y },
            { x: box.x + box.width, y: box.y },
            { x: box.x, y: box.y + box.height },
            { x: box.x + box.width, y: box.y + box.height }
        ];
        const cornerThreshold = Math.max(box.width, box.height) * 0.1;
        let cornersOccupied = 0;
        corners.forEach(corner => {
            if (points.some(p => this.getDistance(p, corner) < cornerThreshold)) {
                cornersOccupied++;
            }
        });

        const squarenessPenalty = (cornersOccupied / 4) * 0.3;
        const finalScore = (score * 0.7) + (closureScore * 0.3) - squarenessPenalty;

        if (finalScore < 0.55) return null;

        return {
            score: finalScore,
            type: 'circle',
            metadata: {
                centerX,
                centerY,
                radius,
                boundingBox: box
            }
        };
    }
}
