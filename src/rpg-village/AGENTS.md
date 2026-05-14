# Agent Guidelines for RPG Village

Welcome, Agent. This document defines the architectural principles, documentation standards, and UI patterns for the **RPG Village** project.

## 1. Project Philosophy & Methodology
- **Spec-First Development**: Always check the `docs/` folder before modifying the `js/engine`.
- **Single Source of Truth**: The `*_data.md` files define the game balance. The code should mirror these values exactly.
- **Validation**: Generated code must strictly adhere to the definitions found in `docs/`.
- **Domain-Driven Design (DDD)**: The `engine` is divided into bounded contexts (domains) that mirror the `docs/` specifications.
- **Separation of Concerns**: Keep the `engine` agnostic of the DOM. All DOM interactions must happen in `presentation/ui`.

## 2. 🎨 UI & Design Standards
**CRITICAL:** All UI implementations must follow the adaptive patterns defined in:
- **[Design System & Patterns](./docs/shared/ui/design_system.md)**
  - Use **Master-Detail** for lists and profiles.
  - Use **Dashboard** for the main village overview.
  - Ensure **Mobile-First** responsiveness with distinct adaptive behaviors.

## 3. 📖 Master Index of Specifications
### Shared (Core/Combat/Inventory)
- **Combat**: [Battle System](./docs/shared/combat/battle_system.md) | [Hero Skills](./docs/shared/combat/hero_skills.md)
- **Inventory**: [Consumables](./docs/shared/inventory/consumables.md) | [Equipment](./docs/shared/inventory/equipment.md) | [Materials](./docs/shared/inventory/materials_data.md) | [Food](./docs/shared/inventory/food_data.md)
- **Core**: [Time & Construction](./docs/shared/core/time_system.md) | [I18n Architecture](./docs/shared/core/i18n.md) | [Design System](./docs/shared/ui/design_system.md)

### Heroes
- **Profiles**: [Hero Spec](./docs/heroes/hero.md)
- **Data**: [Origins & Traits](./docs/heroes/origins_data.md)

### Village
- **Infrastructure**: [Village Spec](./docs/village/village.md) | [Buildings Data](./docs/village/buildings_data.md)

### Explore (WIP)
- **Campaigns**: [Expeditions](./docs/explore/expeditions.md) | [Location Data](./docs/explore/expeditions_data.md)

## 4. Directory Structure
- `src/rpg-village/`
  - `docs/`: Master design and mechanics. Structured by domain.
  - `js/engine/`: Pure logic and state management (The "Back-end").
    - **CRITICAL RULE**: Subdirectories here MUST mirror domains in `docs/` (e.g., `shared/`, `heroes/`, `village/`).
    - Inside each domain folder:
      - `core/`: Central coordinators and state managers.
      - `models/`: Entities and data structures.
      - `services/`: Business logic and calculations.
  - `js/presentation/`:
    - `adapters/`: Orchestration layer (The "BFF").
    - `ui/`: DOM management and components (The "Front-end").
  - `pages/`: HTML partials representing UI sections.
  - `css/`: Styling system and tokens.

## 5. Iteration Workflow
1. **Document Phase**: Update specifications in `docs/`.
2. **Implementation Phase**: Implement in `js/engine/<domain>/` then `js/presentation/`.
3. **Verify**: Ensure the code perfectly matches the doc.
