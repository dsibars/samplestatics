# RPG Idle Engine

The RPG Idle Engine is a standalone, framework-agnostic logic layer that handles all data management, game rules, and progression for the RPG Idle application. It is designed to be decoupled from any UI implementation, facilitating testing and future migrations.

## Core Concepts

### 1. Entry Point: `Engine.js`
The `Engine` class (exported as a singleton `engine`) is the central orchestrator. It initializes and provides access to all services. Communication between services is handled via dependency injection during initialization.

### 2. Services
Services are responsible for specific domains of game logic. They maintain state and provide an API for the UI (or functional tests) to interact with the game.

- **`PlayerService`**: Manages player-wide resources (Gold, Cores) and highest milestone reached.
- **`HeroService`**: Handles hero lifecycle (recruitment, removal, stat increases, equipment).
- **`InventoryService`**: Manages the player's inventory of items and equipment.
- **`CatalogService`**: Provides read-only access to game data (skills, weapon families, etc.).
- **`VillageService`**: Handles village building levels and their associated bonuses.
- **`AdventureService`**: Manages the progression of the infinite adventure mode, including enemy generation and milestone rewards.
- **`BattleService`**: Manages individual combat encounters, turn order, and action execution.
- **`WeaponShopService` / `ArmorShopService`**: Handle purchasing equipment.
- **`ForgeService`**: Handles equipment upgrades.
- **`GymService`**: Manages hero training sessions for experience.

### 3. Models
Models are plain JavaScript classes representing game entities. They often contain logic for self-recalculation (e.g., `Hero.recalculateStats`).
- **`Hero`**: Represents a player-controlled hero with stats, level, and equipment.
- **`Enemy`**: Represents a combatant encountered in adventures.
- **`Equipment`**: Represents a piece of gear.

### 4. Core Utilities
- **`Result.js`**: All service methods that can fail return a `Result` object. It contains `success` (boolean), `data` (optional), and `error` (optional translation key).
- **`Persistence.js`**: An abstraction over `localStorage` used by services to persist data.
- **`CombatCalculator.js`**: Centralized logic for damage, evasion, and elemental formulas.

## Coding Standards

- **Uniform Returns**: Every service method intended for external use must return a `Result` object.
- **No UI Logic**: The engine must never reference the DOM or any UI-specific global.
- **UUIDs**: All entities (Heroes, Equipment) are identified by persistent UUIDs.

## Project Roadmap

We are currently following a phased approach to migrate the legacy RPG Idle application to this engine:

1.  **Parallel Enhancement (Current)**: Filling and enhancing the engine services to match or exceed legacy functionality while maintaining comprehensive unit and functional tests.
2.  **Data Model Migration**: Refactoring the legacy code to use UUIDs and ID-based logic instead of array indices, preparing the ground for the engine without switching to it yet.
3.  **Engine Integration**: Refactoring the legacy app to use the engine services for all logic and state management.
4.  **Concerns Separation**: Once the legacy code is fully replaced, we will iterate to enforce a strict separation between visual components and the engine logic.

## Testing

- **Unit Tests**: Located in `tests/unit/`, focusing on individual services and models.
- **Functional Tests**: Located in `tests/engine-functional/`, focusing on end-to-end game scenarios using only the engine API.
