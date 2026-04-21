import { PatternDetector } from './PatternDetector.js';

/**
 * Detects "Z" like shapes for Sleep.
 */
export class ZDetector extends PatternDetector {
    constructor() {
        super('sleep');
    }

    detect(points) {
        if (points.length < 8) return null;
        const box = this.getBoundingBox(points);
        if (box.width < 15 || box.height < 15) return null;

        // Z should be horizontal-ish at top, diagonal down-left, horizontal-ish at bottom
        const start = points[0];
        const end = points[points.length - 1];

        // Start should be top-left, end should be bottom-right (for a standard Z)
        // Or at least start top, end bottom.
        const startTop = (start.y - box.y) / box.height < 0.3;
        const endBottom = (end.y - box.y) / box.height > 0.7;

        if (!startTop || !endBottom) return null;

        // Check for 3 segments by looking at X velocity changes
        let xDirectionChanges = 0;
        let lastXDir = 0;
        for (let i = 1; i < points.length; i++) {
            const dir = Math.sign(points[i].x - points[i-1].x);
            if (dir !== 0 && dir !== lastXDir) {
                xDirectionChanges++;
                lastXDir = dir;
            }
        }

        // Z: Right, then Left-Down, then Right. That's 2 changes in X direction.
        if (xDirectionChanges < 2) return null;

        // Aspect ratio check: Z is usually wider than it is tall or square-ish
        const aspectRatio = box.height / box.width;
        if (aspectRatio > 2.0 || aspectRatio < 0.3) return null;

        return {
            score: 0.85,
            type: 'sleep',
            metadata: { boundingBox: box }
        };
    }
}
