# Village Specification

## Overview
The Village is the central hub and the primary state object of the game. It manages population, core finances, physical infrastructure, and global storage.

## Data Model (`Village`)

### Core Stats
- `gold`: Global currency.
- `day`: Current game day.
- `population`: 
  - `total`: Total people.
  - `available`: People not assigned to projects or tasks.
  - `max`: Capacity based on `housing` level.
- `storage`:
  - `current`: Total number of items (consumables + materials + food + equipment).
  - `max`: Storage limit based on `warehouse` level.

### Infrastructure & Construction
- **Active Buildings**: Levels of completed infrastructure.
- **Construction Queue**: List of pending projects.
- See [buildings_data.md](buildings_data.md) for costs, times, and bonuses (including `warehouse` storage).

## Gameplay Loop
- Manage heroes and assign villagers.
- Initiate construction projects.
- Advance day: Consumes food and progresses construction.
- **Over-capacity**: If `storage.current > storage.max`, you cannot gather new resources or buy items.

## Resource Management
All physical resources and items are stored in the global inventory:
- [Materials](../shared/inventory/materials_data.md)
- [Food](../shared/inventory/food_data.md)
- [Consumables](../shared/inventory/consumables.md)
- [Equipment](../shared/inventory/equipment.md)
