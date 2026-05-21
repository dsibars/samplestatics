# Time & Construction System

## Overview
`rpg-village` uses a turn-based day cycle. Time only advances when the player manually triggers the "Next Day" action. This system governs resource consumption, project completion, and population growth.

## The Day Cycle
When the player triggers a "Next Day" event, the following steps occur in order:

1.  **Daily Objectives Generation**:
    - If objectives for the current day do not exist, 2–3 random objectives are generated.
    - Objectives persist until completed or the day advances.

2.  **Consumption Phase**: 
    - The village consumes **1 Food** per **Villager** (Total Population).
    - If food is insufficient, growth stops and health/efficiency may drop.

3.  **Production Phase**:
    - The `farm` infrastructure produces food daily (+4 `food_raw_grain` per level) which is added to the inventory.
    - **Farmer Bonus**: Each assigned Farmer villager increases farm output by 10%.

4.  **Miner Phase**:
    - Each assigned Miner villager has a 20% chance to produce 1 Wood or Stone.

5.  **Construction Phase**: 
    - All active projects in the `constructionQueue` have their `daysRemaining` decremented by 1.
    - If `daysRemaining` reaches 0, the building is completed and its bonuses become active.
    - The worker assigned to the project is returned to the `availableVillagers` pool.

6.  **Growth Phase**:
    - If food is abundant and there is housing capacity, there is a chance for new villagers to join.

7.  **Recovery Phase**:
    - Idle/exhausted heroes recover HP (base +20% HP, increased by the `infirmary` level).

8.  **Meal Buff Tick**:
    - After any combat resolution, heroes' `mealBuffs` have their `battlesRemaining` decremented by 1.
    - Buffs with 0 battles remaining are removed.

9.  **Calendar Update**:
    - The `day` counter is incremented.

## Construction Mechanic
Buildings are not instantaneous. They require a "Project" to be initiated.

### Requirements to Start a Project:
1.  **Materials**: The full cost in wood, stone, etc., must be available in the inventory.
2.  **Gold**: The upgrade cost must be paid upfront.
3.  **Labor**: One (1) available villager must be assigned to the project for its entire duration.

### Project Data Model:
- `buildingId`: The ID of the building being upgraded/built.
- `targetLevel`: The level the building will reach upon completion.
- `daysRemaining`: Number of "Next Day" triggers required to finish.
- `assignedVillagerId`: (Future) The specific villager working on it.

## Implementation Details
- The state of all active projects is stored in `village.state.constructionQueue`.
- The `GameEngine.nextDay()` method is the central entry point for this logic.
- Worker roles (`population.roles`) affect Production, Miner, and Expedition phases.
