# Explore Module (Expeditions)

> [!NOTE]
> **WORK IN PROGRESS**
> This module is currently in the design phase.

## Overview
Expeditions are manual, single-shot combat challenges. They provide unique, high-value rewards that differ from standard idle gathering.

## Core Mechanics
1.  **Manual Start**: Player selects up to **4 available heroes**.
2.  **Intermission**: Choice to **Continue** or **Retire** after each battle.
3.  **Completion**: Winning the final stage marks it as `completed`.

## Progression & Unlocking
- **Reconciliation**: Completing a quest or building triggers a scan for `locked` expeditions.
- **Requirements**: Based on `dependencyId` and `buildingLevel`.

## Data Model (`Expedition`)
- `id`: Unique identifier.
- `status`: `locked`, `available`, or `completed`.
- `requirement`: `buildingId`, `buildingLevel`, `dependencyId`.
- `stages`: List of battles and rewards.
- **Completion Rewards**:
  - `gold`: Standard currency.
  - `items`: Materials, gear, or consumables.
  - `special`: **Unique Rewards** (One-time only):
    - `heroId`: A new unique hero joins the roster.
    - `villagers`: A permanent increase in village population (e.g. Rescued Workers).

## Data Registry
See [expeditions_data.md](expeditions_data.md) for the list of challenges and special rewards.
