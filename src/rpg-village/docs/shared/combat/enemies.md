# Enemy Specification

## Overview
Enemies are the primary combat obstacles for Heroes during adventures. They share many stat structures with Heroes to allow for a unified combat calculation system.

## Data Model (`Enemy`)

### Identity & Type
- `id`: Unique UUID.
- `name`: String.
- `type`: Category (e.g., `beast`, `humanoid`, `undead`).
- `isBoss`: Boolean. Flags the enemy as a major encounter.
- `element`: Elemental affinity (Fire, Water, Wind, Storm, Neutral).

### Base Attributes
Matches the Hero attribute system for combat compatibility:
- `hp`, `mp`, `strength`, `defense`, `magicPower`, `speed`.

## AI Logic
Enemies use the `CombatAI` decision tree (Smart AI):
1.  **Targeting**: Favor the opponent with the lowest current HP.
2.  **Skill Usage**: Use higher-damage skills if MP is available.

## Data Registry
See [enemies_data.md](enemies_data.md) for the full list of base enemy types and scaling rules.
