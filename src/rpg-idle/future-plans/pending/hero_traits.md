# Feature Proposal: Hero Traits (Origin Archetypes)

## Goal
Transform the current "Origin" flavor text into meaningful passive bonuses that define a hero's role and strategic value.

## Proposed Traits
Each hero will receive a unique passive based on their origin:

| Origin | Trait Name | Bonus Effect |
| :--- | :--- | :--- |
| **Clown** | Joker's Luck | +15% Crit Chance, but -5% Accuracy. |
| **Warrior** | Battle Scars | +10% Defense and +5% Max HP. |
| **Thief** | Swift Hands | +10% Speed and +10% Gold from combat. |
| **Cook** | Hearty Meal | Party members receive +5% HP regeneration per turn. |
| **Farmer** | Earth's Roots | +15% Max HP. |
| **Guard** | Shield Wall | Blocks 10% of incoming physical damage for the whole party. |
| **Monk** | Inner Peace | +15% MP and faster MP recovery. |
| **Poet** | Inspiring Verse | +10% Magic Power for all allies. |

## Technical Integration
- **Hero Class**:
    - Update the constructor to parse the `origin` and apply base multipliers to stats.
    - Add a `getPassiveBonus()` method used by the `CombatAttackCalculator`.
- **CombatManager**:
    - "Cook" and "Guard" traits apply to the *party*, so the manager needs to check all active hero traits at the start of combat.

## Product Logic
By making origins functional, we encourage players to:
1.  **Roster Variety**: Aim for a balanced team (e.g., 1 Farmer for tanking, 1 Poet for magic, 1 Cook for sustain).
2.  **Strategic Recruitment**: Spend gold to "Reroll" or wait for a specific origin in the Tavern.
