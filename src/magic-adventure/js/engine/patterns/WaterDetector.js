import { PatternDetector } from './PatternDetector.js';

/**
 * Detects "S" or "River" like shapes for Water.
 * NOW DEPRECATED in favor of CaretDetector(LEFT), but kept for backwards compat or if we want to reuse it.
 */
export class WaterDetector extends PatternDetector {
    constructor() {
        super('water');
    }

    detect(points) {
        // We will make this less aggressive so it doesn't conflict with caret
        if (points.length < 15) return null;
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

        if (turns < 2) return null; // S shape has at least 2 turns

        return {
            score: 0.5, // Low score to favor caret
            type: 'water',
            metadata: { boundingBox: box }
        };
    }
}
