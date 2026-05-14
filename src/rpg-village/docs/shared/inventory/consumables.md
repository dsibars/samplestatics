# Consumables Specification

## Overview
Consumables are stackable items with immediate effects when used in or out of combat.

## Data Model
- `id`: Unique string identifier.
- `type`: `HEAL_HP`, `HEAL_MP`, `ESCAPE`.
- `amount`: The magnitude of the effect (percentage of Max HP/MP).

## Usage Logic
- **Inventory**: Deducted from the global village inventory on use.
- **Battle**: Using an item consumes the hero's turn action. 
- **Targeting**: Consumables target a single ally or the actor.

## Data Registry
See [consumables_data.md](consumables_data.md) for the full list of available consumables.
