# Village Specification

## Overview
The Village is the central hub and the primary state object of the game. It manages population, core finances, physical infrastructure, and global storage.

For details on how a new game begins, see the [Initialization Specification](initialization.md).

## Data Model (`Village`)

### Core Stats
- `gold`: Global currency.
- `day`: Current game day.
- `population`: 
  - `total`: Total people.
  - `available`: People not assigned to projects or tasks.
  - `max`: Capacity based on `housing` level.
  - `builders`: Number of villagers available for construction.
  - `assigned`: Villagers currently working on construction projects.
  - `roles`: Worker specialization assignments. See **Worker Specialization** below.
- `storage`:
  - `current`: Total number of items (consumables + materials + food + equipment).
  - `max`: Storage limit based on `warehouse` level.

### Infrastructure & Construction
- **Active Buildings**: Levels of completed infrastructure.
- **Construction Queue**: List of pending projects.
- See [buildings_data.md](buildings_data.md) for costs, times, and bonuses (including `warehouse` storage).

## Worker Specialization

Villagers can be assigned specialized roles via the Village UI. Each role provides a passive daily bonus. The total number of assigned roles cannot exceed the village population.

| Role | Icon | Effect |
| :--- | :--- | :--- |
| **Builder** | 🔨 | Standard construction labor. Synced with `population.builders`. |
| **Farmer** | 🌾 | +10% food production per farmer (applied to farm output). |
| **Miner** | ⛏️ | 20% chance per miner to gather 1 Wood or Stone per day. |
| **Scout** | 👁️ | Every 2 scouts reduces expedition stage count by 1 (min 1 stage). |

### Role Assignment Rules
- Total assigned roles across all types cannot exceed `population.total`.
- Builder count is kept in sync with `population.builders`.
- Roles can be reassigned at any time (no cost).

## Gameplay Loop
- Manage heroes and assign villagers.
- Initiate construction projects.
- Advance day: 
  - Consumes food.
  - **Production Phase**: Farms generate food based on their level (+4 `food_raw_grain` per level), scaled by Farmer count.
  - **Miner Phase**: Miners have a 20% chance each to produce 1 Wood or Stone.
  - Progresses construction.
  - **Recovery Phase**: Heroes recover a base 20% of their maximum HP. The `infirmary` building increases this healing percentage and the number of heroes healed simultaneously.
- **Over-capacity**: If `storage.current > storage.max`, you cannot gather new resources or buy items.

## Daily Objectives

Each in-game day, 2–3 random objectives are generated for the player to complete. Objectives track automatically through gameplay actions.

### Objective Types
- `defeat_enemies`: Defeat N enemies in combat.
- `spend_gold`: Spend N gold (shop, buildings, recruitment).
- `complete_expeditions`: Complete N expeditions.
- `upgrade_building`: Start 1 building upgrade.
- `recruit_hero`: Recruit 1 hero at the Tavern.
- `craft_items`: Craft/refine N items.

### Rewards
- Each completed objective grants a small reward (gold + materials).
- Completing **all** objectives for the day grants a bonus reward (20 Wood + 10 Stone).

See [Daily Objectives Specification](daily_objectives.md) for full details.

## Resource Management
All physical resources and items are stored in the global inventory:
- [Materials](../shared/inventory/materials_data.md)
- [Food](../shared/inventory/food_data.md)
- [Consumables](../shared/inventory/consumables.md)
- [Equipment](../shared/inventory/equipment.md)
