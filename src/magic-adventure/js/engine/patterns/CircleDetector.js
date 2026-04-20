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

        const finalScore = (score * 0.7) + (closureScore * 0.3);

        if (finalScore < 0.6) return null;

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
