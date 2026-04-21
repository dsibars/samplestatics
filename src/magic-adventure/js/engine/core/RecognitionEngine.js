import { CircleDetector } from '../patterns/CircleDetector.js';
import { SquareDetector } from '../patterns/SquareDetector.js';
import { PlusDetector } from '../patterns/PlusDetector.js';
import { WaterDetector } from '../patterns/WaterDetector.js';
import { FireDetector } from '../patterns/FireDetector.js';
import { ZDetector } from '../patterns/ZDetector.js';
import { XDetector } from '../patterns/XDetector.js';
import { InfinityDetector } from '../patterns/InfinityDetector.js';
import { ArrowDetector } from '../patterns/ArrowDetector.js';
import { DashDetector } from '../patterns/DashDetector.js';

/**
 * RecognitionEngine orchestrates the pattern matching process.
 */
export class RecognitionEngine {
    constructor() {
        this.detectors = [
            new FireDetector(),
            new WaterDetector(),
            new SquareDetector(), // Earth
            new CircleDetector(), // Light/Shield
            new ZDetector(),      // Sleep
            new XDetector(),      // Poison
            new PlusDetector(),   // Boost
            new DashDetector(),   // Reduce
            new InfinityDetector(), // All
            new ArrowDetector()    // Pierce
        ];
    }

    /**
     * Evaluates raw stroke data and returns recognized patterns with zone info.
     * @param {Array} strokes - Array of point arrays (one per stroke)
     * @param {Object} canvasSize - { width, height }
     */
    recognize(strokes, canvasSize) {
        const width = canvasSize.width;
        const height = canvasSize.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const outerRadius = Math.min(width, height) * 0.45;
        const innerRadius = outerRadius * 0.5;

        // Group strokes by zone
        const zoneStrokes = { 'core': [] };
        for (let i = 0; i < 4; i++) zoneStrokes[`complement-${i}`] = [];

        strokes.forEach(stroke => {
            const box = this.calculateBoundingBox(stroke);
            const zone = this.getZone(box.centerX, box.centerY, centerX, centerY, innerRadius);
            if (zoneStrokes[zone]) zoneStrokes[zone].push(stroke);
        });

        const results = [];

        Object.entries(zoneStrokes).forEach(([zone, strokesInZone]) => {
            if (strokesInZone.length === 0) return;

            // Option A: Try to recognize strokes individually (for stacking same symbols)
            // Option B: Try to recognize them as a single combined gesture (for multi-stroke symbols like Fire or Plus)

            // Let's try combining them first. If we find a strong match, we use it.
            const allPoints = strokesInZone.flat();
            let bestCombinedMatch = null;
            this.detectors.forEach(detector => {
                const match = detector.detect(allPoints);
                if (match && (!bestCombinedMatch || match.score > bestCombinedMatch.score)) {
                    bestCombinedMatch = match;
                }
            });

            if (bestCombinedMatch && bestCombinedMatch.score > 0.4) {
                results.push({
                    zone,
                    ...bestCombinedMatch,
                    strokes: strokesInZone // Keep reference to original strokes for visual feedback
                });
            } else {
                // Fallback: Individual recognition
                strokesInZone.forEach(stroke => {
                    let bestMatch = null;
                    this.detectors.forEach(detector => {
                        const match = detector.detect(stroke);
                        if (match && (!bestMatch || match.score > bestMatch.score)) {
                            bestMatch = match;
                        }
                    });

                    if (bestMatch) {
                        results.push({ zone, ...bestMatch, strokes: [stroke] });
                    } else {
                        results.push({
                            zone,
                            type: 'unknown',
                            score: 0,
                            metadata: { boundingBox: this.calculateBoundingBox(stroke) },
                            strokes: [stroke]
                        });
                    }
                });
            }
        });

        return results;
    }

    getZone(x, y, centerX, centerY, innerRadius) {
        const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        if (dist <= innerRadius) return 'core';

        // Angle for slices: top, right, bottom, left (rotated 45deg)
        // atan2 returns -PI to PI. We want 0 to 2PI.
        let angle = Math.atan2(y - centerY, x - centerX) + Math.PI / 4;
        if (angle < 0) angle += 2 * Math.PI;

        const slice = Math.floor(angle / (Math.PI / 2)) % 4;
        return `complement-${slice}`;
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
        return {
            x: minX, y: minY, width: maxX - minX, height: maxY - minY,
            centerX: (minX + maxX) / 2,
            centerY: (minY + maxY) / 2
        };
    }
}

export const recognitionEngine = new RecognitionEngine();
