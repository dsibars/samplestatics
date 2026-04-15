# Feature: Idle Training v2 (Thematic Quests)

## Goal
Expand the Idle Training system by adding "Quests" that target specific stats or elemental resistances.

## Thematic Sessions
Instead of generic training, heroes can be sent on specific missions:
- **Volcano Cleanup**: 
    - *Requirement*: High Fire resistance or Water skills.
    - *Reward*: Fire resistance boost (permanent stat but very slow gain) + Fire magic XP.
- **Mountain Guard**: 
    - *Requirement*: High Strength.
    - *Reward*: Bonus Strength growth + Physical skill XP.
- **Storm Tracker**:
    - *Reward*: Storm element efficacy boost.

## Environmental Hazards
- Each Quest could have a "Success Rate" based on the hero's stats.
- If they fail, they only get 50% reward.
- This encourages players to match their heroes to the right training sessions.

## Synergy with Village
- A new building "Guild Hall" could provide a list of daily rotating "Quests" alongside the static "Gym Training".
- High-level Guild Hall unlocks "Group Quests" (send 2-3 heroes together for a large objective).

## Integration
- This v2 adds a `requirements` check before starting a session.
- Requires a more complex `Quest` model in the code.
