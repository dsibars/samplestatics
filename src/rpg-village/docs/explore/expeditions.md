# Explore Module (Regions & Discovery)

## Overview
Exploration is a **Discovery Process**. Instead of a flat list, players explore a branching tree of missions within themed **Regions**.

## Core Concepts

### 1. The Region (The Generator)
A Region is a persistent world area (e.g., "The Whispering Forest"). It acts as a template for generating expeditions and tracks the overall progression of discovery within its boundaries.

### 2. The Expedition Instance (The Node)
When a hero explores a region, they choose an **Expedition Instance**. 
- **Deterministic**: Once generated, an expedition's stages, enemies, and rewards are fixed.
- **Persistent**: Completed expeditions remain in the region's history.
- **Dependency**: Most expeditions are `locked` until their "Parent" expedition is completed.

## The Discovery Lifecycle

1. **Unlocking a Region**: When a region is first discovered, it contains a single `available` starting expedition.
2. **Clearing a Node**: When an expedition is completed:
   - The node's status changes to `completed`.
   - The Region's **Discovery Logic** triggers.
3. **Spawning Ramifications**: The Region generates 1 or more new "Child" expeditions.
   - **Linear**: One new path opens deeper into the region.
   - **Branching**: Multiple paths open (e.g., "The Forest Clearing" leads to "The Deep Woods" AND "The River Bank").
   - **Scaling**: Each new generation is slightly harder than the last, reflecting the team's venture deeper into dangerous territory.

## Discovery Mechanics

### Branching Factor
Each region has a `Branching` profile:
- **Low (Linear)**: Mostly a single path (Tutorial regions).
- **Medium**: Occasional choices between two paths.
- **High**: Multiple paths leading to different sub-areas and rewards.

### Story Nodes (Fixed Content)
Hand-crafted "Story Missions" are injected into the discovery tree at specific milestones. Unlike procedural nodes, these have unique requirements and rewards (e.g., "Rescue the Guard").
- **Discovery**: When a requirement is met (e.g., 10 clears in a region), the next discovery roll is guaranteed to spawn the Story Node as a branch.
- **Persistence**: If failed, the Story Node remains available. If completed, it is permanently removed from the "Available" pool.

## The Assignment & Execution Lifecycle

Expedition progression is tied to the village's day cycle. Battles and exploration take time, and heroes will be unavailable while they work.

### 1. Assignment Phase
- **Assigning Heroes**: Heroes can be assigned to an available expedition node.
- **Lock-in**: While an expedition is in its initial stage (Stage 0), you can assign or unassign heroes freely.
- **Mid-Expedition Restrictions**: Once an expedition has progressed past the first stage, **no new heroes can be assigned** to it.

### 2. Execution Phase (Day Advance)
- **Automatic Resolution**: Combat and exploration do not happen instantly upon clicking. They are executed automatically when the game advances to the next day (`GameEngine.nextDay()`).
- **1 Stage = 1 Day**: A single stage of an expedition is resolved each time a day passes. For example, a 3-stage expedition requires at least 3 days to complete.
- **Rewards**: Rewards are granted automatically when the final stage is successfully completed.

### 3. Failing & Retiring (Unassigning)
An expedition is failed if all heroes are defeated during a daily combat resolution.
- **Retreat (Unassign)**: Players can "Retire" by unassigning all heroes from an active expedition. If unassigned mid-expedition (Stage 1 or higher), the expedition is aborted and its progress resets to Stage 0. The players keep any rewards gained from previous full expeditions, but this specific instance resets.
- **Defeat**: If defeated in battle, the expedition is immediately aborted and reset.
- **Retry**: Procedural nodes can be retried as long as they remain in the "Available" pool.

### 4. Discovery on Success
Failing an expedition **does not** trigger the Discovery Logic. New paths are only revealed when the final stage of an expedition is completed successfully.

## Data Registries
- **[Regions Data](regions_data.md)**: Details on the 15 regions and their generation patterns.
- **[Special Missions](expeditions_data.md)**: Registry of unique story-driven milestones.
- **[Enemies Data](../shared/combat/enemies_data.md)**: Enemy templates used for generation.
