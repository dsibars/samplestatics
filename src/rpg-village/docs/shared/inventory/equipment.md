# Equipment Specification

## Overview
Equipment represents items that Heroes can wear or wield to alter their stats and combat effectiveness.

## Data Model
- `material`: Determines base power multiplier.
- `level`: Upgrade level (+10% power per level).
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

## Data Registry
See [equipment_data.md](equipment_data.md) for the full list of materials, weapons, and armor archetypes.
