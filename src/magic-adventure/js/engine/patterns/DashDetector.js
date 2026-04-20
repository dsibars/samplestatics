import { PatternDetector } from './PatternDetector.js';

/**
 * Detects "-" like shapes for Minus.
 */
export class DashDetector extends PatternDetector {
    constructor() {
        super('dash');
    }

    detect(points) {
        if (points.length < 2) return null;
        const box = this.getBoundingBox(points);

        if (box.width < 5) return null;
        if (box.width < box.height) return null;

        const aspectRatio = box.height / box.width;
        if (aspectRatio > 0.4) return null;

        return {
            score: 0.9,
            type: 'dash',
            metadata: { boundingBox: box }
        };
    }
}
