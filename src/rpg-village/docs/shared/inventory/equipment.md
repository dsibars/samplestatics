# Equipment Specification

## Overview
Equipment represents items that Heroes can wear or wield to alter their stats and combat effectiveness.

## Data Model
- `material`: Determines base power multiplier.
- `level`: Upgrade level (+10% power per level).
- `set`: Equipment set identifier (defaults to `material`). Wearing multiple pieces of the same set grants tiered bonuses.
- `affixes`: Unique magical properties.

### Weapons
- `family`: Defines innate speed, evasion bonuses, and scaling stat (Strength vs MagicPower).
- `dmgMult`: Base damage multiplier for the family.

### Armor
- `archetype`: Defines defense multipliers, speed penalties, and HP/MP bonuses.
- `slot`: `head`, `body`, `legs`, `accessory`.

## Affixes (Magical Properties)
- `vampire`: 5% Life Steal.
- `sage`: 10% MP Cost Reduction.
- `titan`: +20% HP, -2 Speed.
- `assassin`: +10% Crit, +20 Accuracy.
- `phoenix`: Once-per-battle survive lethal blow.

## Equipment Set Bonuses
Wearing multiple pieces of the same material set grants cumulative bonuses. Thresholds are evaluated at 2, 4, and 6 pieces.

| Set | 2-Piece Bonus | 4-Piece Bonus | 6-Piece Bonus |
| :--- | :--- | :--- | :--- |
| **Wooden** | +5 HP | +10 HP, +1 STR | +15 HP, +2 STR, +1 DEF |
| **Iron** | +10 HP, +1 STR | +20 HP, +2 STR, +1 DEF | +30 HP, +3 STR, +2 DEF, +1 SPD |
| **Steel** | +15 HP, +2 STR, +1 DEF | +30 HP, +3 STR, +2 DEF, +1 SPD | +45 HP, +5 STR, +3 DEF, +2 SPD, +1 MAG |
| **Gold** | +20 HP, +3 STR, +2 DEF | +40 HP, +5 STR, +3 DEF, +2 SPD | +60 HP, +7 STR, +5 DEF, +3 SPD, +3 MAG |
| **Mythril** | +30 HP, +5 STR, +3 DEF, +2 SPD | +60 HP, +8 STR, +5 DEF, +4 SPD, +3 MAG | +100 HP, +12 STR, +8 DEF, +6 SPD, +5 MAG |

## Data Registry
See [equipment_data.md](equipment_data.md) for the full list of materials, weapons, and armor archetypes.
