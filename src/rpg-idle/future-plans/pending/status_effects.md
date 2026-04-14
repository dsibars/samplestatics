# Feature: Status Effects (The Tricker's Kit)

## Goal
Add depth to combat with turn-based buffs and debuffs for both Heroes and Enemies.

## Primary Effects
- **Poison (DoT)**: Target loses 5% of Max HP each turn for 3 turns. Damage ignores defense.
- **Sleep (CC)**: Target skips their turn. Skill/Attack hits on a sleeping target have 100% accuracy and guaranteed Crit (v2), but wake the target up. 
- **Stun (CC)**: Target skips 1 turn. Does not wake up on hit. 
- **Burn (Debuff)**: Target takes extra damage from all sources and loses 2% HP per turn.
- **Haste (Buff)**: Increases Speed stat by 50% for 3 turns.

## Technical Integration
- **Actor Model (Hero/Enemy)**: 
    - Add `this.statusEffects = []`.
    - Each effect: `{ type: 'poison', duration: 3, power: 0.05, stackable: false }`.
- **CombatManager**:
    - **Turn Start Phase**: Iterate `actor.statusEffects`.
        - Reduce duration.
        - Apply damage/skips.
        - Remove if duration <= 0.
- **CombatAttackCalculator**:
    - Add logic to skills to "Inflict" status effects with a certain probability (e.g., `poison_dart` has 50% poison chance).

## UI/UX
- **Visuals**: Small icons or colored glowing auras around the circles.
- **Log**: "Alaric is poisoned! ( -5 HP )", "Goblin is asleep!".

## v2: Elemental Synergy
- Using a Water skill on a "Burning" target removes the debuff but creates "Steam" (reduces accuracy for 1 turn).
- Using a Storm skill on a "Wet" target (new status) deals 50% more damage.
