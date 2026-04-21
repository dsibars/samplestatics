import { PatternDetector } from './PatternDetector.js';

/**
 * Detects "X" like shapes for Poison.
 */
export class XDetector extends PatternDetector {
    constructor() {
        super('poison');
    }

    detect(points) {
        if (points.length < 5) return null;
        const box = this.getBoundingBox(points);

        // Poison (X) should be somewhat square
        const aspectRatio = Math.min(box.width, box.height) / Math.max(box.width, box.height);
        if (aspectRatio < 0.5) return null;

        // Check if points are concentrated along the two diagonals
        let diag1Points = 0;
        let diag2Points = 0;
        const threshold = 0.15;

        points.forEach(p => {
            const normX = (p.x - box.x) / box.width;
            const normY = (p.y - box.y) / box.height;

            const d1 = Math.abs(normX - normY); // Top-left to bottom-right
            const d2 = Math.abs(normX - (1 - normY)); // Top-right to bottom-left

            if (d1 < threshold) diag1Points++;
            if (d2 < threshold) diag2Points++;
        });

        // For an X drawn as two strokes, combined points should match both diagonals.
        // For an X drawn as one stroke (like a 'k' without the vertical or a cross),
        // it should still have many points on both diagonals.

        const score = (diag1Points + diag2Points) / points.length;

        // If it's a single diagonal line, it shouldn't match X.
        // So both diagonals must have some points.
        const d1Ratio = diag1Points / points.length;
        const d2Ratio = diag2Points / points.length;

        if (score < 0.6 || d1Ratio < 0.2 || d2Ratio < 0.2) return null;

        return { score: Math.min(1, score), type: 'poison', metadata: { boundingBox: box } };
    }
}
