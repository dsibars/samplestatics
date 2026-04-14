# Feature: Weapons & Equipment Expansion

## Goal
Fill the "Empty Weapon stores" and add meaningful progression via equipment specialization and upgrading.

## Weapon Families & Trade-offs
- **Daggers**: 
    - *Pros*: High Speed (+2), High Evasion (+5%).
    - *Cons*: Low Damage (0.8x multiplier).
- **Broadswords**:
    - *Pros*: Balanced.
    - *Cons*: None.
- **Battle Axes**:
    - *Pros*: Very High Damage (1.5x multiplier).
    - *Cons*: Reduces Speed (-2).
- **Magic Wands / Staves**:
    - *Pros*: Increases Magic Power. Allows some magic skills to cost less MP.
    - *Cons*: Very weak Physical Attack.

## Material Tiers (Progression)
1. **Wooden**: Base.
2. **Iron**: Unlock at Weapon Shop Lvl 2.
3. **Steel**: Unlock at Weapon Shop Lvl 3.
4. **Gold**: Unlock at Weapon Shop Lvl 4 (High damage, low weight).
5. **Mythril**: Unlock at Weapon Shop Lvl 5.

## Technical Integration
- **Equipment Slot Logic**:
    - Weapons can be `One-Handed` or `Two-Handed`.
    - If a `Two-Handed` weapon (e.g., Greatsword) is equipped in `rightHand`, the `leftHand` slot is locked.
    - Players cannot equip the exact same instance of a weapon in both hands (needs two separate items).
- **Stats**: Weapons add "Hidden" bonuses summed during `getFinalStat`.
- **Upgrading**:
    - Weapons have levels (e.g., "Steel Sword +5").
    - Upgrading costs Gold at the Blacksmith (to be added or a tab in Weapon Shop).
    - Costs scale exponentially: `Cost = Base * Math.pow(1.5, level)`.

## UI/UX
- **Weapon Shop**: A grid of available weapons with "Buy" buttons.
- **Inventory/Hero**: Display icons for the equipped weapons.

## v2: Random Enchants
- Weapons found in high-level milestones can have random suffixes: "... of Fire" (+Fire Damage), "... of the Wind" (+Speed).
