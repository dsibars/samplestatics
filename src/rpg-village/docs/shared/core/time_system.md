# Time & Construction System

## Overview
`rpg-village` uses a turn-based day cycle. Time only advances when the player manually triggers the "Next Day" action. This system governs resource consumption, project completion, and population growth.

## The Day Cycle
When the player triggers a "Next Day" event, the following steps occur in order:

1.  **Consumption Phase**: 
    - The village consumes **1 Food** per **Villager** (Total Population).
    - If food is insufficient, growth stops and health/efficiency may drop.
2.  **Construction Phase**: 
    - All active projects in the `constructionQueue` have their `daysRemaining` decremented by 1.
    - If `daysRemaining` reaches 0, the building is completed and its bonuses become active.
    - The worker assigned to the project is returned to the `availableVillagers` pool.
3.  **Growth Phase**:
    - If food is abundant and there is housing capacity, there is a chance for new villagers to join.
4.  **Calendar Update**:
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
