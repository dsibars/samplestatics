# Hero Specification

## Overview
Heroes are the defenders of the village and the primary means of progressing the game. They venture out to fight, gather resources, and rescue new villagers.

## Data Model (`Hero`)

### Identity
- `id`: Unique UUID.
- `name`: String.
- `status`: Enum (`active`, `resting`, `training`).
- `origin`: The hero's background, which provides unique stat multipliers and party-wide traits.
  - See [origins_data.md](origins_data.md) for the full registry.

### Attributes
- `maxHp` / `maxMp`: Resource pools.
- `strength` / `defense`: Physical combat stats.
- `magicPower`: Magic damage and healing power.
- `speed`: Turn order and evasion frequency.

## Progression
- **Leveling**: Every level grants `statPoints` (2-3) and `skillPoints` (1).
- **Attributes**: Base HP/MP increase automatically on level up.
- **Skills**: Heroes can learn and upgrade skills using `skillPoints`.
  - See [../shared/combat/hero_skills.md](../shared/combat/hero_skills.md) for logic and [../shared/combat/hero_skills_data.md](../shared/combat/hero_skills_data.md) for the registry.

## Equipment
Heroes have 6 equipment slots: `head`, `body`, `legs`, `leftHand`, `rightHand`, and `accessory`. 
- See [../shared/inventory/equipment.md](../shared/inventory/equipment.md) for details on gear and [../shared/inventory/equipment_data.md](../shared/inventory/equipment_data.md) for values.
