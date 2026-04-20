import { CircleDetector } from '../patterns/CircleDetector.js';
import { SquareDetector } from '../patterns/SquareDetector.js';
import { PlusDetector } from '../patterns/PlusDetector.js';

/**
 * RecognitionEngine orchestrates the pattern matching process.
 */
export class RecognitionEngine {
    constructor() {
        this.detectors = [
            new CircleDetector(),
            new SquareDetector(),
            new PlusDetector()
        ];
    }

    /**
     * Evaluates raw stroke data and returns recognized patterns.
     * @param {Array} strokes - Array of point arrays (one per stroke)
     */
    recognize(strokes) {
        const results = [];

        strokes.forEach((stroke, index) => {
            let bestMatch = null;

            this.detectors.forEach(detector => {
                const match = detector.detect(stroke);
                if (match && (!bestMatch || match.score > bestMatch.score)) {
                    bestMatch = match;
                }
            });

            if (bestMatch) {
                results.push({
                    strokeIndex: index,
                    ...bestMatch
                });
            } else {
                // If no specific pattern, maybe it's just a "point" or unknown
                results.push({
                    strokeIndex: index,
                    type: 'unknown',
                    score: 0,
                    metadata: {
                        boundingBox: this.calculateBoundingBox(stroke)
                    }
                });
            }
        });

        return results;
    }

    calculateBoundingBox(points) {
        if (points.length === 0) return null;
        let minX = points[0].x, maxX = points[0].x;
        let minY = points[0].y, maxY = points[0].y;
        points.forEach(p => {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        });
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
}

export const recognitionEngine = new RecognitionEngine();
