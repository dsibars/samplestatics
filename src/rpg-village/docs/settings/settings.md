# Settings Specification

## Overview
The Settings section allows the user to configure global application preferences and manage persistent data. It serves as a central hub for non-gameplay configurations.

## Features

### 1. Language Selection
- **Description**: Allows the user to switch the application's current language.
- **Implementation**: 
  - Interfaces with the `I18nService`.
  - Supported language codes: `en` (English), `es` (Spanish), `ca` (Catalan), `eu` (Basque), `gl` (Galician).
  - Changing the language should update all UI text immediately and persist the choice in `localStorage`.
- **References**: See [i18n.md](../shared/core/i18n.md).

### 2. Data Management (Wipe Data)
- **Description**: Provides a way to reset all game progress and start from scratch.
- **Action**: "Wipe Data".
- **Implementation**:
  - Must call `persistence.clear()` from `Persistence.js`.
  - **Confirmation Dialog**: A mandatory modal or native confirm dialog must be shown to the user before executing the wipe.
  - **Post-Action**: After wiping, the application should reload (`window.location.reload()`) to ensure all state is reset to defaults.
- **References**: See [Persistence.js](../../js/engine/shared/core/Persistence.js).

## UI Requirements
- **Page**: `pages/settings.html`
- **Navigation**: Accessible via the main navigation bar (persistent UI shell).
- **Layout**:
  - **Preferences Group**: Language dropdown and any other visual settings.
  - **Danger Zone**: A visually distinct section (e.g., red border or background) containing the "Wipe Data" button to highlight its destructive nature.

## Data Model Impact
- **Settings Persistence**: The current language preference and any other settings should be saved using the `Persistence` service under a specific key (e.g., `app_settings`).
- **Global Reset**: Wiping data removes all keys prefixed with the application's versioned prefix (e.g., `rpg_village_v1_`), returning the village, heroes, and all other systems to their initial state.
