# Bestiary Specification

## Overview
The Bestiary tracks enemy types that the player has encountered during combat. It serves as a progressive discovery mechanic and reference for enemy strengths, weaknesses, and elemental affinities.

## Unlock Mechanics
- Enemies are discovered automatically upon first combat encounter.
- The Bestiary records the enemy's **template ID** (e.g., `slime_green`, `goblin_brute`).
- Each unique template ID is tracked once; encountering multiple copies of the same enemy type does not duplicate entries.

## Display

### Discovered Enemies
When an enemy type has been encountered, the Bestiary card reveals:
- **Name**: The enemy's display name.
- **Type Icon**: Emoji representing the enemy category (beast, humanoid, elemental, undead, dragon).
- **Base Stats**: HP, STR, DEF, SPD.
- **Element**: Color-coded elemental affinity.

### Undiscovered Enemies
Enemy types not yet encountered are displayed as:
- **Name**: `???`
- **Stats**: All stats hidden (`?`)
- **Visual**: Card rendered at reduced opacity (45%).

## Enemy Type Icons

| Type | Icon |
| :--- | :--- |
| `beast` | 🐺 |
| `humanoid` | 👺 |
| `elemental` | 💧 |
| `undead` | 💀 |
| `dragon` | 🐉 |

## Element Colors

| Element | Color |
| :--- | :--- |
| `fire` | `#ff6b6b` |
| `water` | `#4dabf7` |
| `earth` | `#8ce99a` |
| `wind` | `#74c0fc` |
| `neutral` | `#adb5bd` |

## Data Registry
The complete list of enemy templates is defined in [enemies_data.md](enemies_data.md).

## Persistence
Discovered enemy IDs are stored in `expedition_state.bestiary` and persist across sessions.
