# Combat Calculator Specification

## Overview
`CombatCalculator` is a pure static utility class that computes all combat numbers: damage, healing, evasion, critical hits, and elemental multipliers. It has no side effects and depends only on its input parameters.

## File
`js/engine/shared/combat/core/CombatCalculator.js`

## Damage Multiplier Formula
Damage uses the ratio `R = Attack / Defense` (defense is clamped to minimum 1):

| R Range | Multiplier |
|---------|-----------|
| R >= 10 | R / 10 |
| R >= 5 | 1.0 |
| R >= 4 | 0.9 + (R - 4) × 0.1 |
| R >= 2 | 0.75 + (R - 2) × 0.075 |
| R >= 1 | 0.5 + (R - 1) × 0.25 |
| R < 1 | R × 0.5 |

## Elemental Efficiency
Magic attacks have elements. The rock-paper-scissors chain is:
**Fire → Wind → Storm → Water → Fire**

| Relationship | Multiplier |
|-------------|-----------|
| Strong (beats target) | 1.5× |
| Weak (target beats you) | 0.5× |
| Same element or neutral | 1.0× |
| Unrelated elements | 1.0× |

## Evasion Formula
Evasion chance is calculated from the speed ratio `R = DefenderSpeed / AttackerSpeed`:

| R Range | Evasion % |
|---------|----------|
| R <= 1 | max(0, (R - 0.5) × 20) |
| R > 1 | 10 + (R × 10) |

- Attacker `accuracyBonus` scales attacker speed: `sAttacker *= (1 + accuracyBonus / 100)`.

## Critical Hits
- `critChance` = `attacker.critChanceBonus` (base 5%, modified by equipment and origin traits).
- If `random() * 100 < critChance`, the hit is critical.
- Critical hits deal **150%** damage.

## Main `calculate()` Method
Returns an object: `{ amount, evasionChance, isMiss, elementMult, isCrit }`

### For Damage Skills:
1. Calculate `evasionChance`.
2. Roll for miss: if miss, return `{ amount: 0, ..., isMiss: true }`.
3. Roll for crit.
4. Compute `baseStatValue` from attacker stat (scaled by `magicPowerBoost` party trait if applicable).
5. Apply skill `baseMultiplier`, `multiplier` (from skill tier/level), and crit bonus.
6. Apply damage multiplier from defense.
7. Apply elemental multiplier.
8. Apply `physicalDamageReduction` party trait if skill is physical.

### For Support Skills:
- Return `amount = power * multiplier` (percentage of max HP/MP).
- `evasionChance = 0`, `isMiss = false`.

## Party Trait Integration
- `magicPowerBoost`: Scales `baseStatValue` for magicPower skills.
- `physicalDamageReduction`: Reduces final damage for physical skills.
