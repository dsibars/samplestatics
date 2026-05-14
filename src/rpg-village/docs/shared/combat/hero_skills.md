# Hero Skills Specification

## Overview
Skills are active abilities used in combat. They follow a unified data model and are referenced by ID in the `SKILLS_DATA` registry.

## Data Model
Each skill definition contains the following properties:
- `id`: Unique string identifier.
- `category`: `physical` (Strength), `magic` (MagicPower), `tricker` (Strength/Speed), `support` (MagicPower/Speed).
- `stat`: The base stat used for scaling damage or power.
- `mpCost`: Mana required to cast.
- `targetType`: `single_enemy`, `all_enemies`, `single_ally`, `all_allies`, `self`.
- `baseMultiplier`: Multiplier for damage skills.
- `power`: Multiplier for support/healing skills (usually % of target's max HP).
- `element`: Optional (Fire, Water, Wind, Storm).
- `splash` / `jump`: Optional properties for multi-target behavior.

## Combat Logic Flow
1.  **MP Check**: Actor must have current MP >= `mpCost`.
2.  **Accuracy Check**: Based on Attacker Speed vs Defender Speed.
3.  **Power Calculation**: `Base Stat * Multiplier * (1 + 0.005 * Skill Level * Tier)`.
4.  **Targeting**: 
    - `splash`: Deals reduced damage to all other enemies.
    - `jump`: Chains to the next enemy with reduced power.
5.  **Elemental Modifiers**: Applied if the skill has an element.

## Data Registry
See [hero_skills_data.md](hero_skills_data.md) for the full list of available skills.
