import { PatternDetector } from './PatternDetector.js';

/**
 * Detects cross/plus shapes or simple lines.
 * For now, let's make it a PlusDetector (represented by two intersecting lines, or just a messy scribble that looks like +)
 */
export class PlusDetector extends PatternDetector {
    constructor() {
        super('plus');
    }

    detect(points) {
        if (points.length < 3) return null;

        const box = this.getBoundingBox(points);

        // A plus sign usually has points that go through the center horizontally and vertically
        // and doesn't fill the corners.

        const centerX = box.centerX;
        const centerY = box.centerY;

        let centerPassScore = 0;
        points.forEach(p => {
            const distToVerticalAxis = Math.abs(p.x - centerX);
            const distToHorizontalAxis = Math.abs(p.y - centerY);

            if (distToVerticalAxis < box.width * 0.2 || distToHorizontalAxis < box.height * 0.2) {
                centerPassScore++;
            }
        });

        const score = centerPassScore / points.length;

        // Also, it shouldn't be closed
        const startEndDist = this.getDistance(points[0], points[points.length - 1]);
        const opennessScore = Math.min(1, startEndDist / Math.max(box.width, box.height));

        const finalScore = (score * 0.6) + (opennessScore * 0.4);

        if (finalScore < 0.6) return null;

        return {
            score: finalScore,
            type: 'plus',
            metadata: {
                boundingBox: box
            }
        };
    }
}
