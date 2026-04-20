/**
 * Base class for all pattern detectors.
 */
export class PatternDetector {
    constructor(name) {
        this.name = name;
    }

    /**
     * Should return a score (0 to 1) and optional metadata if the stroke matches the pattern.
     * @param {Array} strokePoints - Array of {x, y, timestamp, drawId}
     * @returns {Object|null} { score, metadata } or null if definitely not a match
     */
    detect(strokePoints) {
        throw new Error('detect() must be implemented by subclass');
    }

    /**
     * Utility to get bounding box of points
     */
    getBoundingBox(points) {
        if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
        let minX = points[0].x, maxX = points[0].x;
        let minY = points[0].y, maxY = points[0].y;

        points.forEach(p => {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        });

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            centerX: (minX + maxX) / 2,
            centerY: (minY + maxY) / 2
        };
    }

    /**
     * Utility to get distance between two points
     */
    getDistance(p1, p2) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }
}
