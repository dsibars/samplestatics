# Battle System Specification

## Overview
The Battle System is a shared, turn-based combat engine used whenever Heroes engage with Enemies (e.g., during adventures or village defense). It is agnostic of the UI and handles purely state mutations and math.

## Turn Phases
Each turn consists of three distinct phases:
1.  **Status Tick Phase**: At the start of an entity's turn, active status effects (Poison, Burn, etc.) are processed. If an entity dies during this phase, they lose their action.
2.  **Action Phase**: The entity performs a Skill or uses a Consumable.
3.  **Advance Phase**: The turn pointer moves to the next entity in the speed-sorted list.

## Combat Calculations
All core math is isolated in the `CombatCalculator`.

### Damage Multiplier (Attack vs Defense)
Damage is not a flat subtraction (Attack - Defense). Instead, it uses a ratio `R = Attack / Defense`.
- If `R >= 5`: 100% of Attack is dealt as damage.
- If `R < 1`: Damage is heavily mitigated (e.g., `R * 0.5`).

### Elemental Efficiency
Magic attacks have elements. Damage is multiplied based on target element:
- **Strong (+50%)**: Fire > Wind > Storm > Water > Fire.
- **Weak (-50%)**: Reversed relationship.

### Accuracy & Evasion
Evasion is a percentage chance calculated via the ratio of the Defender's Speed to the Attacker's Speed.

## Status Effects
Status effects are turn-based modifications to an entity's state:
- `poison`: Target takes 5% of Max HP as damage every turn.
- `burn`: Target takes 5% of Max HP as damage every turn.
- `haste`: Increases speed by 50% for 3 turns.
- `sleep`/`stun`: Skips the entity's action phase.

## Smart AI Decision Tree
The `CombatAI` uses a weighted decision tree:
1.  **Healing Priority**: If any ally is below 70% HP, the AI will prioritize support skills (Heal/Group Heal).
2.  **AoE Priority**: If multiple enemies are alive, the AI favors skills with `all_enemies` target types.
3.  **Target Focus**: Offensive actions always target the opponent with the lowest current HP to secure a kill.

## End Conditions
The battle ends when either all Heroes or all Enemies are defeated (`hp <= 0`).
