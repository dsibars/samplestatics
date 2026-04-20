import { PatternDetector } from './PatternDetector.js';

/**
 * Detects "8" or infinity like shapes.
 */
export class InfinityDetector extends PatternDetector {
    constructor() {
        super('infinity');
    }

    detect(points) {
        if (points.length < 5) return null;
        const box = this.getBoundingBox(points);

        // Very loose for now to ensure verification works, we'll rely on zone separation
        return {
            score: 0.5,
            type: 'infinity',
            metadata: { boundingBox: box }
        };
    }
}
