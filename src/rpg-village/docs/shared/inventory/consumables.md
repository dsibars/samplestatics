# Consumables Specification

## Overview
Consumables are stackable items with immediate effects when used in or out of combat.

## Data Model
- `id`: Unique string identifier.
- `type`: `HEAL_HP`, `HEAL_MP`, `ESCAPE`.
- `amount`: The magnitude of the effect (percentage of Max HP/MP).

### Types
- `HEAL_HP`: Restores HP to a target ally.
- `HEAL_MP`: Restores MP to a target ally.
- `ESCAPE`: Immediately ends the current battle with `winner = 'escape'`. The party retreats to the village. No healing occurs.

## Usage Logic
- **Inventory**: Deducted from the global village inventory on use.
- **Battle**: Using an item does **not** consume the hero's action phase; the hero can still use a skill on the same turn.
- **Targeting**: Consumables target a single ally or the actor.

## Data Registry
See [consumables_data.md](consumables_data.md) for the full list of available consumables.
