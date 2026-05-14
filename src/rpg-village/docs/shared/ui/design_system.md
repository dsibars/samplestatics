# Design System & Adaptive Patterns

## Overview
This document defines the core UI patterns for `rpg-village`. All modules must follow these patterns to ensure a consistent experience across Mobile and Desktop.

## Core Principles
1.  **Mobile-First**: Design the interaction for touch and small screens first.
2.  **Adaptive, Not Just Responsive**: Change the *layout behavior*, not just the size of elements.
3.  **Deterministic Breakpoints**:
    - **Mobile**: `< 768px`
    - **Desktop**: `>= 768px`

---

## Pattern 1: Master-Detail
Used for lists of entities (Heroes, Inventory, Buildings).

### Mobile Behavior (Drill-Down)
- **State A (Master)**: A scrollable list of cards.
- **State B (Detail)**: Tapping a card performs a view transition to show the full entity details. Use a "Back" button to return.
- **State C (Sub-Detail)**: Tapping an interactive element (e.g., an equipment slot) opens another full-screen sub-page or "Sheet."

### Desktop Behavior (Split-Pane)
- **Layout**: Two or three columns visible simultaneously.
- **Interaction**: Clicking a card on the left updates the content in the center/right panes without navigating away.
- **Overlays**: Sub-details appear as popovers or side-drawers.

---

## Pattern 2: Dashboard
Used for the main Village view and overview pages.

### Mobile Behavior
- **Layout**: Single vertical column of "Widgets" or "Cards."
- **Interaction**: Important metrics at the top, followed by actionable cards (e.g., "Assign Villagers," "Upgrade Farm").

### Desktop Behavior
- **Layout**: Multi-column grid.
- **Interaction**: Widgets can be expanded or have fixed positions. A "Map" or "Visual Center" occupies the middle, with sidebars for logs and resource stats.

---

## Pattern 3: Adaptive Modal
Used for settings, confirmation prompts, and quick actions.

### Mobile Behavior (Bottom Sheet)
- Slides up from the bottom of the screen.
- Covers 50% to 90% of the viewport.
- Focuses on thumb-friendly buttons.

### Desktop Behavior (Centered Modal)
- Appears as a centered box with a darkened backdrop.
- Provides a "Close" (X) button at the top right.

---

## Visual Language
- **Typography**: Use modern sans-serif (e.g., `Outfit`, `Inter`).
- **Colors**: Sleek dark mode by default with vibrant primary accents for "Action" buttons.
- **Micro-animations**: Subtle transitions for view changes and hover effects on Desktop.
