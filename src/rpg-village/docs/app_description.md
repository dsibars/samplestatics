# RPG Village - Application Description

## Overview
A village management and hero progression game built with Vanilla JS and a modular, domain-driven architecture. The game runs entirely in the browser as a static single-page application, persisting all data to `localStorage`.

## Domains
The game is divided into the following core domains:
- **Village Management**: Buildings, resources, population, construction queue, and daily cycles.
- **Hero System**: Hero recruitment, stat allocation, equipment (6 slots), skill points, leveling, and origins.
- **Combat System**: Interactive turn-based battles with speed-based turn order, status effects, skills, consumables, auto-battle, and enemy AI.
- **Inventory System**: Stackable resources (materials, food, consumables) and unique equipment with storage limits.
- **Expedition System**: Region-based discovery, story and procedural nodes, multi-stage expeditions with combat resolution.
- **Economy (Shop & Forge)**: Purchase consumables and gear, sell resources and inventory items, refine equipment up to +10.

## User Interface Layout
The application follows a single-page layout with a persistent header and navigation bar.

### Main View Sections
- **Village**: Primary area for village status, daily reports, and visual representation.
- **Buildings**: Interface for constructing and upgrading village structures.
- **Heroes**: Management of village heroes, stat allocation, and equipment.
- **Inventory**: Overview of all items, materials, food, consumables, and gear.
- **Explore**: World map, expedition assignment, and progress tracking.
- **Shop**: Purchase supplies, weaponry, and armor. Sell unwanted items and resources.
- **Forge**: Upgrade (refine) equipment to increase its power.
- **Settings**: Game configurations, language selection, data persistence, and developer options.

## Global Mechanics
- **Day Cycle**: Each day consumes food, advances construction, triggers farm production, and may cause population growth or starvation.
- **Persistence**: All game state is saved to `localStorage` automatically.
- **Internationalization**: Full UI translation support for English, Spanish, Catalan, Basque, and Galician.
- **Offline-First**: The game is designed to function without any server or internet connection after initial load.
