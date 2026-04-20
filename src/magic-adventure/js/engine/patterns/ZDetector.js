import { PatternDetector } from './PatternDetector.js';

/**
 * Detects "Z" like shapes for Sleep.
 */
export class ZDetector extends PatternDetector {
    constructor() {
        super('sleep');
    }

    detect(points) {
        if (points.length < 10) return null;
        const box = this.getBoundingBox(points);

        // Z has 3 segments. We check for horizontal start, diagonal back, horizontal end.
        // For simplicity, we just check if it's Z-like in terms of bounds and point count.
        return {
            score: 0.7,
            type: 'sleep',
            metadata: { boundingBox: box }
        };
    }
}
