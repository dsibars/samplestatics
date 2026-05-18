# Initialization Specification

## Overview
This document defines the starting conditions for a new game of RPG Village. It covers initial resources, population, and the introductory narrative experience that occurs when no previous game data is detected.

## Initial State

### 1. Resources
- **Gold**: 100
- **Inventory**:
  - **Food**: 30x `food_raw_grain` (Calculated to sustain the initial population of 3 for 10 days).
  - **Materials**: 20x `material_wood`, 10x `material_stone`.

### 2. Population
- **Heroes**: 1 (Default or randomly generated starting hero).
- **Villagers**: 2 (Builders/Laborers).
- **Total Population**: 3.

### 3. Infrastructure
- **Village Level**: 1 (Initial settlement).
- **Buildings**: All buildings at Level 0 (not built) or Level 1 for core infrastructure (e.g., Housing).

## New Game Experience

### 1. Persistence Check
On application launch, the `Persistence` service checks for existing data. If the primary state key is missing, the game enters the "Initialization Phase".

### 2. Introductory Narrative
A narrative dialog is presented to the player to establish context and lore:

- **Lore Background**: "In a world consumed by the flames of eternal war, a small group of survivors has fled the chaos. Led by a brave hero, they seek a remote valley to build a sanctuary of peace. The journey has been long, and resources are scarce, but hope remains."
- **Presentation**:
    - Uses a modal/overlay with a premium aesthetic (glassmorphism, subtle animations).
    - **Header**: "A New Beginning"
    - **Body**: The lore text above.
    - **Action**: A "Start Journey" button that dismisses the dialog and initializes the `GameEngine` state with the values defined in this spec.

### 3. Initial Objectives
The game starts with a primary objective to guide the player:
- "Construct your first building" or "Assign a worker to gather resources."

## Integration
- This spec is the source of truth for the `GameEngine.resetState()` or `GameEngine.initializeNewGame()` methods.
- Referenced by [village.md](village.md).
