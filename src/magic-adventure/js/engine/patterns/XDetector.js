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

        // Simple heuristic: points are mostly near the two diagonals
        let diag1Score = 0;
        let diag2Score = 0;

        points.forEach(p => {
            // Distance to diagonal 1: (x-box.x)/width = (y-box.y)/height
            const d1 = Math.abs((p.x - box.x) / box.width - (p.y - box.y) / box.height);
            // Distance to diagonal 2: (x-box.x)/width = 1 - (y-box.y)/height
            const d2 = Math.abs((p.x - box.x) / box.width - (1 - (p.y - box.y) / box.height));

            if (d1 < 0.2) diag1Score++;
            if (d2 < 0.2) diag2Score++;
        });

        // An X usually needs two strokes, but here we detect it as a single stroke
        // which would be a "connected" X (like a bow tie or just very fast X)
        const score = (diag1Score + diag2Score) / points.length;
        if (score < 0.5) return null;

        return { score, type: 'poison', metadata: { boundingBox: box } };
    }
}
