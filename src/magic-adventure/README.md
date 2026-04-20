# Magic Adventure

Magic Adventure is a drawing-based RPG combat simulator. Instead of selecting actions from a menu, players "prepare spells" by drawing mystical sigils on a canvas.

This application is built with a clean separation of concerns, following the architecture established in `rpg-idle` v2.

## 🏗 Architecture

The project is divided into two main layers:

### 1. Engine Layer (`js/engine/`)
Responsible for the "brains" of the application.
- **Core**: Contains `DrawingEngine.js` (raw data collection) and `RecognitionEngine.js` (orchestration of pattern matching).
- **Patterns**: Modular detectors for specific shapes (Circle, Square, Plus).
- **Services**: `SpellService.js` transforms recognized patterns into actionable game data.
- **Models**: Defines the `Spell` structure.

### 2. Presentation Layer (`js/presentation/`)
Responsible for rendering and user interaction.
- **Components**: Reusable UI elements like `CanvasComponent` (the drawing board) and `InfoComponent` (the spell display).
- **Views**: `MainView.js` coordinates the components and the engine.

## ✍️ Drawing Recognition System

The core of Magic Adventure is its ability to recognize hand-drawn shapes and translate them into magic.

### How it works
1. **Point Collection**: As you draw, the engine records every point $(x, y)$ with a timestamp and a `drawId`.
2. **Strokes**: Every time you lift your finger/mouse and touch again, a new `drawId` is assigned, allowing for multi-stroke sigils.
3. **Pattern Matching**: When you press **LAUNCH**, the `RecognitionEngine` passes each stroke through a series of `PatternDetectors`. Each detector returns a confidence score.
4. **Spell Mapping**: The `SpellService` looks at the highest-scoring patterns and their properties to build the final spell.

### Recognized Gestures

| Gesture | Element / Effect | Description |
| :--- | :--- | :--- |
| **Circle** | 💧 Water | Performs a Water-based attack. |
| **Square** | 🪨 Earth | Performs an Earth-based attack. |
| **Plus (+)** | 💥 Multi-Target | Modifies the spell to hit all enemies (increases MP cost). |
| **Unknown** | ✨ Neutral | If a drawing isn't recognized, it defaults to a "Basic Spark". |

### Intensity & MP
The **size** of your drawing matters.
- A **small** sigil results in a low-intensity spell with low MP cost.
- A **large** sigil (filling more of the canvas) increases the spell's damage but consumes significantly more MP.

## 🛠 Extending the System

To add a new gesture:
1. Create a new detector in `js/engine/patterns/` (e.g., `TriangleDetector.js`) extending the `PatternDetector` base class.
2. Register the new detector in `js/engine/core/RecognitionEngine.js`.
3. Add the mapping for the new shape in `js/engine/services/SpellService.js`.
