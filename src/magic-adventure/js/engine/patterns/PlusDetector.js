import { PatternDetector } from './PatternDetector.js';

export class PlusDetector extends PatternDetector {
    constructor() {
        super('plus');
    }

    detect(points) {
        if (points.length < 5) return null;
        const box = this.getBoundingBox(points);

        // Plus can be one stroke or two strokes.
        // RecognitionEngine combines multiple strokes in a zone into 'allPoints'.

        let horizontalPoints = 0;
        let verticalPoints = 0;
        const threshold = Math.max(box.width, box.height) * 0.25;

        points.forEach(p => {
            if (Math.abs(p.y - box.centerY) < threshold) horizontalPoints++;
            if (Math.abs(p.x - box.centerX) < threshold) verticalPoints++;
        });

        // In a plus, points are distributed along the axes.
        const hScore = horizontalPoints / points.length;
        const vScore = verticalPoints / points.length;

        // For a perfect plus drawn as a cross, many points are near center.
        // If it's a single stroke plus (like a cross without lifting), it's different.

        // Let's use a different approach: check if it covers the 4 cardinal directions from center.
        let hasTop = false, hasBottom = false, hasLeft = false, hasRight = false;
        points.forEach(p => {
            if (p.y < box.centerY - threshold && Math.abs(p.x - box.centerX) < threshold) hasTop = true;
            if (p.y > box.centerY + threshold && Math.abs(p.x - box.centerX) < threshold) hasBottom = true;
            if (p.x < box.centerX - threshold && Math.abs(p.y - box.centerY) < threshold) hasLeft = true;
            if (p.x > box.centerX + threshold && Math.abs(p.y - box.centerY) < threshold) hasRight = true;
        });

        const cardinalScore = (hasTop ? 0.25 : 0) + (hasBottom ? 0.25 : 0) + (hasLeft ? 0.25 : 0) + (hasRight ? 0.25 : 0);

        // Aspect ratio should be somewhat square
        const aspectRatio = Math.min(box.width, box.height) / Math.max(box.width, box.height);

        if (cardinalScore < 0.75) return null;

        return {
            score: cardinalScore * 0.8 + aspectRatio * 0.2,
            type: 'plus',
            metadata: { box }
        };
    }
}
