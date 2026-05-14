# RPG Village

A premium village management and hero progression game built with Vanilla JS.

## The Concept

Set in a world torn apart by endless conflicts and wars, a small group of villagers sets out to found a new settlement in search of peace. 

**Gameplay Style:** The game focuses heavily on management, strategy, and progression through menus, text descriptions, and UI sections, rather than complex graphics or real-time action (similar to `rpg-idle`).

### Core Mechanics Roadmap

- **Population Types**:
  - **Heroes**: Capable of combat. They defend the village from attacks and go on adventures to gather resources and fight enemies.
  - **Workers**: Non-combatant villagers who live in and contribute to the settlement through specializations (e.g., farming for food, blacksmithing).
- **The Core Loop**: Initially, the primary way to grow the village population is by sending Heroes on adventures to rescue new villagers.
- **Iterative Complexity**: The game systems (combat, economy, buildings) will start simple and be expanded iteratively following a strict "Spec-First" approach.

## Project Structure

- `index.html`: Entry point.
- `docs/`: The **Single Source of Truth** for game design and mechanics.
- `css/`: Styling using Vanilla CSS and a premium design system.
- `js/`:
  - `engine/`: Pure game logic structured in Domain-Driven Design (DDD) bounded contexts (`core`, `models`, `services`).
  - `presentation/`:
    - `adapters/`: Orchestration layer (connecting logic to view).
    - `ui/`: DOM management, event listeners, and UI components.
- `pages/`: HTML partials injected via Vite.

## Development

Build the project using:
```bash
make build APP=rpg-village
```
