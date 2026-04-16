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

We are following a phased approach to transition the RPG Idle application to this new engine:

1.  **Parallel Enhancement (Current)**: Filling and enhancing the engine services to match or exceed legacy functionality while maintaining comprehensive unit and functional tests.
2.  **V2 UX Development (Pending)**: Instead of refactoring the legacy code, we will develop a completely new UI ("V2") from scratch. This V2 will live in a separate `presentation` directory at the same level as `engine` and will be powered 100% by the engine API. During this phase, a button will be added to the legacy app to allow users to switch to the V2 preview.
3.  **Replacement**: Once the V2 experience is feature-complete and polished, we will remove the legacy "V1" code and promote V2 as the primary game interface.

## Combat Flow (Manual vs. Auto)

The `BattleService` supports both automated and manual combat:

- **Auto-Battle**: When `player.autoBattle` is `true`, `battle.nextTurn()` will automatically execute actions for both enemies and heroes.
- **Manual Combat**: When `player.autoBattle` is `false`:
    1. `battle.nextTurn()` will automatically execute turns for enemies.
    2. For heroes, `battle.nextTurn()` will return a `Result` with `actionRequired: true`.
    3. The UI (or test) must then call `battle.executeAction(actor, skillId, targetId)` to perform the hero's move.
    4. Execution of the action automatically advances the battle to the next turn.

This design ensures the UI can prompt the user for input at the correct time while the engine handles all timing and rule enforcement.

### UI Integration Example (Pseudo-code)

```javascript
// During a battle
function updateBattle() {
    const result = engine.battle.nextTurn();

    if (result.success) {
        if (result.data.event) {
            // An action was performed (by enemy or in auto-battle)
            displayActionAnimation(result.data.event);
            updateUIStats();
        }

        if (result.data.actionRequired) {
            // It's the player's turn (manual mode)
            showSkillButtons(result.data.entity);
        } else if (result.data.battleOver) {
            showBattleSummary(result.data.winner);
        } else {
            // Wait a bit then continue auto-flow
            setTimeout(updateBattle, 1000);
        }
    }
}

// When player clicks a skill
function onSkillClick(skillId, targetId) {
    const actor = engine.battle.getCurrentActor();
    const result = engine.battle.executeAction(actor, skillId, targetId);
    if (result.success) {
        displayActionAnimation(result.data.event);
        updateUIStats();
        // Continue flow
        setTimeout(updateBattle, 1000);
    }
}
```

## Persistence and State Management

The engine uses `localStorage` via the `Persistence` core utility.
- **Automatic Saving**: Most service methods (e.g., `addGold`, `recruitHero`, `equipItem`) automatically persist changes.
- **App Restarts**: To simulate an app restart or force-reload state in tests, use `engine.restart()`.
- **Manual Data Modification**: If you manually modify a model instance (e.g., `hero.baseStrength += 10`), you **must** call the corresponding service's save method (e.g., `engine.heroes.save(hero)`) to persist the change.

## Testing

- **Unit Tests**: Located in `tests/unit/`, focusing on individual services and models.
- **Functional Tests**: Located in `tests/engine-functional/`, focusing on end-to-end game scenarios using only the engine API.
    - `BattleSystem.test.js`: Detailed assertions for manual and auto-combat interactions.
    - `VillageSystem.test.js`: Verifies building unlocks, upgrades, and tier-locking logic.
    - `InfiniteAdventure.test.js`: High-level progression and persistence test.

### Ordered Test Execution

Tests should be run in order of increasing complexity to fail fast:
1.  **Unit Tests**: Verify individual building blocks.
2.  **Battle System**: Verify the core combat engine (manual & auto).
3.  **Village System**: Verify building lifecycle and feature unlocks.
4.  **Infinite Adventure**: Verify the high-level game loop and progression.

Use the provided command to run all tests in the correct order:
```bash
make test-all
```
