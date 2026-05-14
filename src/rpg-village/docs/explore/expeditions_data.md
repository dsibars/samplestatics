# Expeditions Data

> [!NOTE]
> **WORK IN PROGRESS**
> Detailed stage-by-stage data for manual expeditions with special rewards.

## Location Registry

### `exp_tutorial_cave` (Tutorial Cave)
- **Status**: `available`
- **Completion Reward**: 
  - `gold`: 100
  - `items`: 20 Wood
- **Stages**:
  1.  **Battle**: 2x `slime_green`.
  2.  **BOSS**: 1x `slime_fire`.

### `exp_rescue_mission` (The Captured Guard)
- **Status**: `locked`
- **Requirement**: Complete `exp_tutorial_cave`
- **Completion Reward**: 
  - `gold`: 300
  - `special`: **New Hero: "Sir Valen" (Guard)**
- **Stages**:
  1.  **Battle**: 3x `goblin_grunt`.
  2.  **BOSS**: 2x `goblin_scout`, 1x `goblin_brute`.

### `exp_goblin_outpost` (Goblin Outpost)
- **Status**: `locked`
- **Requirement**: Complete `exp_rescue_mission`
- **Completion Reward**: 
  - `gold`: 500
  - `special`: **+3 Rescued Villagers** (Permanent Population Increase)
- **Stages**:
  1.  **Battle**: 2x `goblin_scout`.
  2.  **BOSS**: `goblin_king`.

## Logic Rules
- **One-Time Rewards**: Special rewards (Heroes/Villagers) are only granted the first time the expedition is completed. Since completed expeditions are removed from the list, this is handled naturally by the `status` system.
