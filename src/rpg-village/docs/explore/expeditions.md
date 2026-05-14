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

## Failure & Retries

### Failing an Expedition
An expedition is failed if all heroes are defeated.
- **Retreat**: Players can "Retire" during an intermission to keep current rewards and progress.
- **Defeat**: If defeated in battle, all gathered rewards from the current expedition are lost.
- **Retry**: Procedural nodes can be retried as long as they are "Available". If a branch is part of a "Collapsing" region (like Crystal Hollow), it may disappear if not cleared in time.

### Discovery on Failure
Failing an expedition **does not** trigger the Discovery Logic. New paths are only revealed upon a successful `completed` status.

## Data Registries
- **[Regions Data](regions_data.md)**: Details on the 15 regions and their generation patterns.
- **[Special Missions](expeditions_data.md)**: Registry of unique story-driven milestones.
- **[Enemies Data](../shared/combat/enemies_data.md)**: Enemy templates used for generation.
