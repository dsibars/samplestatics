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

        let score = edgeScore / points.length;

        // NEW: Check for corners to distinguish from circles
        // We look for points that are very close to the bounding box corners
        const corners = [
            { x: box.x, y: box.y }, // Top-left
            { x: box.x + box.width, y: box.y }, // Top-right
            { x: box.x, y: box.y + box.height }, // Bottom-left
            { x: box.x + box.width, y: box.y + box.height } // Bottom-right
        ];

        let cornerHits = 0;
        const cornerThreshold = Math.max(box.width, box.height) * 0.2;

        corners.forEach(corner => {
            const hasPointNearCorner = points.some(p => this.getDistance(p, corner) < cornerThreshold);
            if (hasPointNearCorner) cornerHits++;
        });

        // Boost score if we have 3 or 4 corners hit
        if (cornerHits >= 3) {
            score += 0.2;
        } else if (cornerHits < 2) {
            score -= 0.2;
        }

        // Check if start and end are close
        const startEndDist = this.getDistance(points[0], points[points.length - 1]);
        const closureScore = Math.max(0, 1 - (startEndDist / Math.max(box.width, box.height)));

        const finalScore = (score * 0.7) + (closureScore * 0.3);

        if (finalScore < 0.6) return null; // Lowered slightly from 0.7 but corner check adds reliability

        return {
            score: finalScore,
            type: 'square',
            metadata: {
                boundingBox: box
            }
        };
    }
}
