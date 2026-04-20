import { PatternDetector } from './PatternDetector.js';

export class PlusDetector extends PatternDetector {
    constructor() {
        super('plus');
    }

    detect(points) {
        if (points.length < 5) return null;
        const box = this.getBoundingBox(points);

        let horizontalPoints = 0;
        let verticalPoints = 0;
        const threshold = Math.max(box.width, box.height) * 0.35;

        points.forEach(p => {
            if (Math.abs(p.y - box.centerY) < threshold) horizontalPoints++;
            if (Math.abs(p.x - box.centerX) < threshold) verticalPoints++;
        });

        const hScore = horizontalPoints / points.length;
        const vScore = verticalPoints / points.length;

        const score = (hScore + vScore) / 2;
        // Even more relaxed for the complex multi-stroke combination
        if (score < 0.2) return null;

        return { score, type: 'plus', metadata: { box } };
    }
}
