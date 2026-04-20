import { PatternDetector } from './PatternDetector.js';

/**
 * Detects ">" or "<" like shapes for Pierce.
 */
export class ArrowDetector extends PatternDetector {
    constructor() {
        super('arrow');
    }

    detect(points) {
        if (points.length < 5) return null;
        const box = this.getBoundingBox(points);

        // Find extreme X. If it's in the middle, it's likely a > or <
        let maxX = points[0].x;
        let maxIndex = 0;
        points.forEach((p, i) => {
            if (p.x > maxX) {
                maxX = p.x;
                maxIndex = i;
            }
        });

        const relMaxX = (maxX - box.x) / box.width;
        if (relMaxX < 0.8) return null; // Tip not at right

        // Tip should be somewhat in the middle vertically
        const tipRelY = (points[maxIndex].y - box.y) / box.height;
        if (tipRelY < 0.2 || tipRelY > 0.8) return null;

        return {
            score: 0.8,
            type: 'arrow',
            metadata: { boundingBox: box }
        };
    }
}
