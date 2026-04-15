# Feature Proposal: Adventure Events (The Road)

## Goal
Break the repetitive nature of combat-only milestones by introducing non-combat choice-based encounters.

## How it Works
Every 5-10 milestones (or randomly), the player encounters an **Event** instead of a regular fight.

## Event Types
1. **The Forsaken Shrine**:
    - *Option A*: Pray (Full Party Heal).
    - *Option B*: Desecrate (Party takes 20% damage, but gain 5 Cores).
2. **The Wandering Merchant**:
    - Sells a rare, single-use item (e.g., "Phoenix Down" - revive hero mid-combat).
3. **The Hidden Cache**:
    - *Option A*: Open carefully (Find some gold).
    - *Option B*: Smash open (Higher gold, but 30% chance of a trap/damage).
4. **Mystic Fountain**:
    - Permanent +1 stat point to a random hero in the party.

## Technical Integration
- **Adventure Loop**:
    - Add a `milestoneType` check in the generator.
    - Create an `EventView` to handle the choice UI.
- **State**:
    - Effects from events (buffs) should be stored in a `temporaryBuffs` array in `Progression.prog`.

## Product Logic
Events add "Micro-choices" that keep the player engaged. It also provides a "safety valve" (healing shrines) that helps players reach bosses they otherwise couldn't.
