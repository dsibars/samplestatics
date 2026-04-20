import { PatternDetector } from './PatternDetector.js';

/**
 * Detects "V" or "^" like shapes for Fire.
 */
export class FireDetector extends PatternDetector {
    constructor() {
        super('fire');
    }

    detect(points) {
        if (points.length < 5) return null;
        const box = this.getBoundingBox(points);

        // Find the "peak" - should be near the top
        let peakY = points[0].y;
        let peakIndex = 0;
        points.forEach((p, i) => {
            if (p.y < peakY) {
                peakY = p.y;
                peakIndex = i;
            }
        });

        const peakRelativeY = (peakY - box.y) / box.height;
        if (peakRelativeY > 0.4) return null; // Peak not at top enough

        // Start and end should be lower than the peak
        const startRelY = (points[0].y - box.y) / box.height;
        const endRelY = (points[points.length - 1].y - box.y) / box.height;
        if (startRelY < 0.5 && endRelY < 0.5) return null;

        return {
            score: 0.8,
            type: 'fire',
            metadata: { boundingBox: box }
        };
    }
}
