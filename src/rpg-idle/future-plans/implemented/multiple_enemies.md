# Feature: Multiple Enemies

## Goal
Transition the combat system from a single-enemy encounter to facing groups of 1-4 enemies simultaneously.

## Functional Specs
- **Dynamic Grouping**: Regular encounters can have 1-4 enemies. Bosses can have "Minions".
- **Turn Order**: Each enemy has its own turn based on speed, just like heroes.
- **Targeting**:
    - **Manual**: Players must click on an enemy to target them for single-target skills.
    - **Auto Agent**: "Smart" mode targets the enemy with the lowest HP. "Random" mode picks any alive enemy.
- **UI/Canvas**:
    - Shift the single enemy drawn at `(x, y)` to an array of positions.
    - Enemies will be drawn in a vertical or circular formation on the right side of the screen.

## Technical Integration
- **CombatManager**: 
    - Change `this.enemy` to `this.enemies = []`.
    - Update `initTurnOrder` to include all enemies.
    - Update `checkCombatEnd` to check if `enemies.every(e => e.hp <= 0)`.
- **Enemy Class**: Add a static `generateGroup(milestone)` method that returns an array of Enemy instances.

## Difficulty Calibration
- Total HP across multiple enemies should be ~120% of a single equivalent enemy to compensate for the advantage of focus fire, but their total damage output per turn should be similar to avoid overwhelming the player.
- **Enfeeblement**: As enemies die, the total damage taken by heroes reduces, rewarding the strategy of "Finishing off" targets.

## v2 Potential
- **Enemy Formations**: Front-line (tanky) and Back-line (damage) enemies. 
- **Reinforcements**: Enemies that can call for help mid-battle.
