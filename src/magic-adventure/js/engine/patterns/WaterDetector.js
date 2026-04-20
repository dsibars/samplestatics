import { PatternDetector } from './PatternDetector.js';

/**
 * Detects "S" or "River" like shapes for Water.
 */
export class WaterDetector extends PatternDetector {
    constructor() {
        super('water');
    }

    detect(points) {
        if (points.length < 5) return null;
        const box = this.getBoundingBox(points);
        if (box.width < box.height * 0.5) return null;

        let turns = 0;
        let lastDir = 0;
        for (let i = 2; i < points.length; i++) {
            const dir = Math.sign(points[i].y - points[i-1].y);
            if (dir !== 0 && dir !== lastDir) {
                turns++;
                lastDir = dir;
            }
        }

        // We expect at least 1 turn for an S shape (down then up or vice versa)
        if (turns < 1) return null;

        return {
            score: Math.min(1, turns / 3),
            type: 'water',
            metadata: { boundingBox: box }
        };
    }
}
