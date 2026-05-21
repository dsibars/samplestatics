# Party Traits Specification

## Overview
Party traits are passive bonuses granted to the entire hero party at the start of battle based on the origins of the active heroes. They are calculated once per battle in `BattleService._calculatePartyTraits()`.

## Origin-Based Traits

| Origin | Trait | Effect |
|--------|-------|--------|
| `origin_cook` | HP Regen | +5% HP regeneration per turn for all heroes |
| `origin_guard` | Physical DR | +10% physical damage reduction for all heroes |
| `origin_poet` | Magic Power Boost | +10% magic power for all heroes |
| `origin_thief` | Gold Bonus | +10% gold from battle rewards |

## Mechanics
- Traits are additive. Having two Cooks gives +10% HP regen.
- Only heroes with `hp > 0` contribute their trait.
- Traits are recalculated at the start of each battle (not persisted between battles).

## Code Location
`js/engine/shared/combat/services/BattleService.js` — `_calculatePartyTraits()`

## Integration with CombatCalculator
- `magicPowerBoost` is applied in `CombatCalculator.calculate()` when `skillData.stat === 'magicPower'`.
- `physicalDamageReduction` is applied to the final damage when `skillData.category === 'physical'`.
- `hpRegen` is applied during the trait regen phase of `BattleService.nextTurn()`.
