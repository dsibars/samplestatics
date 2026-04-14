# Feature Proposal: The Forge (Gear Awakening)

## Goal
Add a late-game vertical progression sink for Cores, allowing players to create "Legendary" gear with unique properties.

## Awakening Mechanism
- **Requirement**: A weapon or armor piece must be at Level 10 (Gold material tier or higher).
- **Cost**: 50 Cores.
- **Process**: "Awakening" adds a permanent suffix to the item with a random powerful bonus.

## Potential Suffixes (Random)
- **... of the Vampire**: 5% of damage dealt is returned as HP.
- **... of the Sage**: reduces all MP costs by 10%.
- **... of the Titan**: +20% HP but -10% Speed.
- **... of the Assassin**: +10% Crit Chance and +20% Accuracy.
- **... of the Phoenix**: 10% chance to survive a fatal hit with 1 HP (once per battle).

## Technical Integration
- **Village Building**: A new building "The Mystic Forge" (unlocked after milestone 50).
- **Item Logic**: 
    - Add an `affixes` array to the `Equipment` object in `Hero.js`.
    - `CombatAttackCalculator` needs to check for these affixes during damage resolution.

## Product Logic
The Forge creates "Gacha-like" excitement for late-game players. It turns Cores (which can become stale once buildings are maxed) into a valuable resource for infinite optimization.
