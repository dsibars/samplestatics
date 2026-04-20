import { PatternDetector } from './PatternDetector.js';

/**
 * Detects square/rectangular shapes.
 */
export class SquareDetector extends PatternDetector {
    constructor() {
        super('square');
    }

    detect(points) {
        if (points.length < 5) return null;

        const box = this.getBoundingBox(points);

        // A square/rectangle should fill its bounding box well.
        // We check if points are mostly near the edges of the bounding box.
        let edgeScore = 0;
        points.forEach(p => {
            const distToLeft = Math.abs(p.x - box.x);
            const distToRight = Math.abs(p.x - (box.x + box.width));
            const distToTop = Math.abs(p.y - box.y);
            const distToBottom = Math.abs(p.y - (box.y + box.height));

            const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
            // Smaller minDist means it's closer to one of the edges
            const normalizedDist = minDist / Math.max(box.width, box.height);
            edgeScore += (1 - Math.min(1, normalizedDist * 5)); // Reward being near edges
        });

        const score = edgeScore / points.length;

        // Check if start and end are close
        const startEndDist = this.getDistance(points[0], points[points.length - 1]);
        const closureScore = Math.max(0, 1 - (startEndDist / Math.max(box.width, box.height)));

        const finalScore = (score * 0.7) + (closureScore * 0.3);

        if (finalScore < 0.7) return null;

        return {
            score: finalScore,
            type: 'square',
            metadata: {
                boundingBox: box
            }
        };
    }
}
