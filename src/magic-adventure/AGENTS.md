# Magic Adventure - Technical Documentation

This document contains technical details about the `magic-adventure` application, intended for developers and AI agents.

## 🏗 Architecture

The application follows the "clean architecture" established in `rpg-idle` v2, strictly separating game logic from presentation.

### Engine Layer (`js/engine/`)
- **`core/DrawingEngine.js`**: Captures raw input. It groups points into "strokes" using a `drawId` which increments every time the pointer is lifted.
- **`core/RecognitionEngine.js`**: Orchestrates pattern detection. It evaluates each stroke against a list of registered `PatternDetectors`.
- **`patterns/`**: Contains specific logic for shape recognition.
    - `PatternDetector.js`: Abstract base class providing utility methods (bounding box, distance).
    - `CircleDetector.js`, `SquareDetector.js`, `PlusDetector.js`: Specific implementations using geometric heuristics.
- **`services/SpellService.js`**: The bridge between recognition and gameplay. It maps patterns to elements and effects, calculates intensity based on bounding box dimensions, and computes MP costs/damage.

### Presentation Layer (`js/presentation/`)
- **`Component.js` / `View.js`**: Base classes mimicked from `rpg-idle` v2 for a standardized UI lifecycle.
- **`components/CanvasComponent.js`**: Manages the HTML5 Canvas, handles pointer events, and interfaces with the `DrawingEngine`.
- **`views/MainView.js`**: The main entry point that coordinates state between the engine and the components.

## 🛠 Extension Guide

### Adding a New Gesture
1.  **Implement Detector**: Create `src/magic-adventure/js/engine/patterns/MyNewShapeDetector.js` extending `PatternDetector`.
2.  **Register Detector**: Add an instance of your detector to the `detectors` array in `src/magic-adventure/js/engine/core/RecognitionEngine.js`.
3.  **Map Effect**: Update the `mappings` object in `src/magic-adventure/js/engine/services/SpellService.js` to define the element, name, or effect associated with the new shape.

### Recognition Logic
The current detection uses geometric heuristics:
- **Circles**: Checks for aspect ratio near 1.0, average distance from center (radius), and loop closure.
- **Squares**: Checks if points are mostly near the edges of the bounding box and loop closure.
- **Plus**: Checks for points concentrated along the horizontal and vertical axes passing through the center.

## 🧪 Testing
Unit tests for the pattern recognition logic are located in `src/magic-adventure/js/engine/tests/PatternRecognition.test.js` and can be run using `node --test`.
