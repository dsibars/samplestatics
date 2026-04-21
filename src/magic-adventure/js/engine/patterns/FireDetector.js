import { PatternDetector } from './PatternDetector.js';

/**
 * Detects "V" or "^" like shapes for Fire.
 * NOW DEPRECATED in favor of CaretDetector, but kept for legacy.
 */
export class FireDetector extends PatternDetector {
    constructor() {
        super('fire');
    }

    detect(points) {
        if (points.length < 5) return null;
        const box = this.getBoundingBox(points);

        let peakY = points[0].y;
        let peakIndex = 0;
        points.forEach((p, i) => {
            if (p.y < peakY) {
                peakY = p.y;
                peakIndex = i;
            }
        });

        const peakRelativeY = (peakY - box.y) / box.height;
        if (peakRelativeY > 0.3) return null;

        const startRelY = (points[0].y - box.y) / box.height;
        const endRelY = (points[points.length - 1].y - box.y) / box.height;
        if (startRelY < 0.4 || endRelY < 0.4) return null;

        return {
            score: 0.5, // Low score to favor caret
            type: 'fire',
            metadata: { boundingBox: box }
        };
    }
}
