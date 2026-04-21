import { CircleDetector } from '../patterns/CircleDetector.js';
import { SquareDetector } from '../patterns/SquareDetector.js';
import { PlusDetector } from '../patterns/PlusDetector.js';
import assert from 'node:assert';
import test from 'node:test';

test('CircleDetector should recognize a circle', () => {
    const detector = new CircleDetector();
    const points = [];
    const centerX = 100, centerY = 100, radius = 50;
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        points.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            timestamp: Date.now(),
            drawId: 1
        });
    }
    // Close the circle
    points.push(points[0]);

    const result = detector.detect(points);
    assert.ok(result, 'Should recognize circle');
    assert.strictEqual(result.type, 'circle');
    assert.ok(result.score > 0.8, 'Score should be high');
});

test('SquareDetector should recognize a square', () => {
    const detector = new SquareDetector();
    const points = [
        { x: 0, y: 0 }, { x: 50, y: 0 }, { x: 100, y: 0 },
        { x: 100, y: 50 }, { x: 100, y: 100 },
        { x: 50, y: 100 }, { x: 0, y: 100 },
        { x: 0, y: 50 }, { x: 0, y: 0 }
    ].map(p => ({ ...p, timestamp: Date.now(), drawId: 1 }));

    const result = detector.detect(points);
    assert.ok(result, 'Should recognize square');
    assert.strictEqual(result.type, 'square');
});

test('PlusDetector should recognize a plus', () => {
    const detector = new PlusDetector();
    // A simple plus shape: vertical line and horizontal line
    const points = [
        { x: 50, y: 0 }, { x: 50, y: 25 }, { x: 50, y: 50 }, { x: 50, y: 75 }, { x: 50, y: 100 }, // vertical
        { x: 0, y: 50 }, { x: 25, y: 50 }, { x: 75, y: 50 }, { x: 100, y: 50 }  // horizontal
    ].map(p => ({ ...p, timestamp: Date.now(), drawId: 1 }));

    const result = detector.detect(points);
    assert.ok(result, 'Should recognize plus');
    assert.strictEqual(result.type, 'plus');
});
