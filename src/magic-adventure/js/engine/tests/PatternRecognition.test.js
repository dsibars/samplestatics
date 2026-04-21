import { CaretDetector } from '../patterns/CaretDetector.js';
import { PlusDetector } from '../patterns/PlusDetector.js';
import { ZDetector } from '../patterns/ZDetector.js';
import { XDetector } from '../patterns/XDetector.js';
import assert from 'node:assert';
import test from 'node:test';

function interpolate(p1, p2, steps) {
    const points = [];
    for (let i = 0; i <= steps; i++) {
        points.push({
            x: p1.x + (p2.x - p1.x) * (i / steps),
            y: p1.y + (p2.y - p1.y) * (i / steps)
        });
    }
    return points;
}

test('CaretDetector should recognize UP caret', () => {
    const detector = new CaretDetector();
    const points = [
        ...interpolate({ x: 0, y: 100 }, { x: 50, y: 0 }, 5),
        ...interpolate({ x: 50, y: 0 }, { x: 100, y: 100 }, 5)
    ].map(p => ({ ...p, timestamp: Date.now(), drawId: 1 }));

    const result = detector.detect(points);
    assert.ok(result, 'Should recognize caret');
    assert.strictEqual(result.type, 'caret_up');
});

test('CaretDetector should recognize DOWN caret', () => {
    const detector = new CaretDetector();
    const points = [
        ...interpolate({ x: 0, y: 0 }, { x: 50, y: 100 }, 5),
        ...interpolate({ x: 50, y: 100 }, { x: 100, y: 0 }, 5)
    ].map(p => ({ ...p, timestamp: Date.now(), drawId: 1 }));

    const result = detector.detect(points);
    assert.ok(result, 'Should recognize caret');
    assert.strictEqual(result.type, 'caret_down');
});

test('CaretDetector should recognize RIGHT caret', () => {
    const detector = new CaretDetector();
    const points = [
        ...interpolate({ x: 0, y: 0 }, { x: 100, y: 50 }, 5),
        ...interpolate({ x: 100, y: 50 }, { x: 0, y: 100 }, 5)
    ].map(p => ({ ...p, timestamp: Date.now(), drawId: 1 }));

    const result = detector.detect(points);
    assert.ok(result, 'Should recognize caret');
    assert.strictEqual(result.type, 'caret_right');
});

test('PlusDetector should recognize two-stroke plus', () => {
    const detector = new PlusDetector();
    const points = [
        ...interpolate({ x: 50, y: 0 }, { x: 50, y: 100 }, 5),
        ...interpolate({ x: 0, y: 50 }, { x: 100, y: 50 }, 5)
    ].map(p => ({ ...p, timestamp: Date.now(), drawId: 1 }));

    const result = detector.detect(points);
    assert.ok(result, 'Should recognize plus');
    assert.strictEqual(result.type, 'plus');
});

test('ZDetector should recognize Z', () => {
    const detector = new ZDetector();
    const points = [
        ...interpolate({ x: 0, y: 0 }, { x: 100, y: 0 }, 5),
        ...interpolate({ x: 100, y: 0 }, { x: 0, y: 100 }, 5),
        ...interpolate({ x: 0, y: 100 }, { x: 100, y: 100 }, 5)
    ].map(p => ({ ...p, timestamp: Date.now(), drawId: 1 }));

    const result = detector.detect(points);
    assert.ok(result, 'Should recognize Z');
    assert.strictEqual(result.type, 'sleep');
});

test('XDetector should recognize X', () => {
    const detector = new XDetector();
    const points = [
        ...interpolate({ x: 0, y: 0 }, { x: 100, y: 100 }, 5),
        ...interpolate({ x: 100, y: 0 }, { x: 0, y: 100 }, 5)
    ].map(p => ({ ...p, timestamp: Date.now(), drawId: 1 }));

    const result = detector.detect(points);
    assert.ok(result, 'Should recognize X');
    assert.strictEqual(result.type, 'poison');
});
