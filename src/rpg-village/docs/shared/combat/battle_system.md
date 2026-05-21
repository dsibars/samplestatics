# Battle System Specification

## Overview
The Battle System is a shared, turn-based combat engine used whenever Heroes engage with Enemies (e.g., during adventures or village defense). It is agnostic of the UI and handles purely state mutations and math.

## Turn Phases
Each turn consists of four distinct phases:
1.  **Status Tick Phase**: At the start of an entity's turn, active status effects (Poison, Burn, etc.) are processed. If an entity dies during this phase, they lose their action.
2.  **Action Phase**: The entity performs a Skill.
3.  **Consumables**: A hero can use up to 1 consumable item per turn. Using a consumable does not consume/waste the Action Phase (i.e. the hero can still execute a Skill afterwards on that same turn).
4.  **Advance Phase**: The turn pointer moves to the next entity in the speed-sorted list.

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

## Party Traits
Party-wide traits are calculated at battle start based on the active heroes' origins:
- **Cook** (`origin_cook`): +5% HP regen per turn for the whole party.
- **Guard** (`origin_guard`): +10% physical damage reduction for the whole party.
- **Poet** (`origin_poet`): +10% magic power boost for the whole party.
- **Thief** (`origin_thief`): +10% gold bonus from battle rewards.

## Critical Hits
- A critical hit occurs when a random roll is below the actor's `critChanceBonus` (base 5%, modified by equipment and origin traits).
- Critical hits deal **150%** of normal damage.

## Splash & Jump Mechanics
- **Splash**: Skills with `splash` targeting hit the primary target for full damage and adjacent targets for **50%** damage.
- **Jump**: Skills with `jump` targeting hit up to N targets in sequence, with each subsequent target receiving **75%** of the previous hit's damage.

## Status Effects
Status effects are turn-based modifications to an entity's state. They are rendered as emoji badges below the HP bar in combat:
- `poison` 🟣: Target takes 5% of Max HP as damage every turn.
- `burn` 🟠: Target takes 5% of Max HP as damage every turn.
- `haste` 🔵: Increases speed by 50% for 3 turns.
- `sleep`/`stun` 💤: Skips the entity's action phase.

## Equipment Affix Combat Effects
Certain equipment affixes have direct combat impact:
- `vampire` (Life Steal): The actor heals for 5% of damage dealt per affix stack. A `VAMP` log event is emitted showing the heal amount.
- `phoenix`: If the hero would die (HP <= 0), they survive with 1 HP once per battle. Resets after combat.

## Smart AI Decision Tree
The `CombatAI` uses a weighted decision tree:
1.  **Healing Priority**: If any ally is below 70% HP, the AI will prioritize support skills (Heal/Group Heal).
2.  **AoE Priority**: If multiple enemies are alive, the AI favors skills with `all_enemies` target types.
3.  **Target Focus**: Offensive actions always target the opponent with the lowest current HP to secure a kill.

## End Conditions
The battle ends when either all Heroes or all Enemies are defeated (`hp <= 0`).
