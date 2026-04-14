# Feature: Idle Training (Gym Expansion)

## Goal
Provide a way for the "Benched" heroes (those not in the active party) to gain XP and resources over real-world time.

## How it Works
- **Gym Tab**: A new tab in the Village (or an expansion of the Gym building).
- **Assignments**: Player selects a hero and a "Training Regime".
- **Lock-in**: The hero is "Busy" and cannot be assigned to the active party until the training is finished or cancelled (no reward if cancelled).

## Training regimes
1. **Light Sparring**: 
    - *Duration*: 1 Hour.
    - *Reward*: Small XP gain.
2. **Endurance Run**:
    - *Duration*: 3 Hours.
    - *Reward*: Medium XP + small chance of finding Gold.
3. **Master Class**:
    - *Duration*: 8 Hours.
    - *Reward*: Large XP + chance of finding random Item.
4. **Heroic Pilgrimage**:
    - *Duration*: 24 Hours.
    - *Reward*: Massive XP + 1-2 Cores.

## Technical Integration
- **Progression State**: 
    - `trainingSessions: { heroIndex: { startTime, type, isFinished } }`.
- **Logic**: 
    - When the app is opened, check `Date.now()` against `startTime + duration`.
    - If finished, show a "Claim" button in the Village UI.
- **Gym Level Synergy**: The `gymLevel` building upgrade (0-50%) increases all training XP rewards.

## Balance
- XP rewards should be roughly equivalent to what a hero would gain if active, but with a slight "Idle Penalty" to encourage active play.
- **Gems/Cores**: Unlocking more "Training Slots" (to train multiple heroes at once) costs Gems or Cores.

## v2: Thematic Training (Quests)
- See [idle_training_v2.md](file:///home/dsibars/development/samplestatics/samplestatics/src/rpg-idle/future-plans/idle_training_v2.md) for details on specialized training.
