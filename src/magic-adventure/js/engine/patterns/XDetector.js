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
        if (aspectRatio < 0.6) return null;

        let diag1Score = 0;
        let diag2Score = 0;

        points.forEach(p => {
            const d1 = Math.abs((p.x - box.x) / box.width - (p.y - box.y) / box.height);
            const d2 = Math.abs((p.x - box.x) / box.width - (1 - (p.y - box.y) / box.height));

            if (d1 < 0.15) diag1Score++;
            if (d2 < 0.15) diag2Score++;
        });

        const score = (diag1Score + diag2Score) / points.length;
        if (score < 0.6) return null;

        return { score, type: 'poison', metadata: { boundingBox: box } };
    }
}
