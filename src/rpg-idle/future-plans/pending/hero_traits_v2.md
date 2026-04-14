# Feature Expansion: Hero Traits v2 (Transparency & UI)

## Goal
Improve player agency by clearly communicating the mechanical benefits of each Hero Trait (Origin) through localized descriptions and an intuitive in-game UI.

## 1. Multi-language Descriptions
To ensure all players understand their heroes' special abilities, we will add a new set of keys to [i18n.js](file:///home/dsibars/development/samplestatics/samplestatics/src/rpg-idle/js/i18n.js).

### Structure
For each origin (e.g., `origin_farmer`), we add a matching `_desc` key:
- `origin_farmer`: "Lost Turnip Farmer"
- `origin_farmer_desc`: "Roots of the Earth: Increases this hero's Max HP by 15%."

### Content (English Examples)
- **origin_clown_desc**: "Joker's Luck: Increases Crit Chance by 15%, but reduces Accuracy by 5%."
- **origin_warrior_desc**: "Battle Scars: Increases Defense by 10% and Max HP by 5%."
- **origin_thief_desc**: "Swift Hands: Increases Speed by 10%. Combat victories grant 10% more Gold."
- **origin_cook_desc**: "Hearty Meal: While in the party, all allies regenerate 5% HP at the start of their turn."
- **origin_guard_desc**: "Shield Wall: While in the party, all allies take 10% less Physical Damage."
- **origin_monk_desc**: "Inner Peace: Increases Max MP by 15% and boosts MP recovery rate."
- **origin_poet_desc**: "Inspiring Verse: While in the party, all allies have their Magic Power increased by 10%."

## 2. In-Game UI: Target Information
We will add a "Trait Info" interaction inside the **Hero Details** view.

### UI Element
- A small icon button (💡 or ❓) will be placed directly to the right of the Hero's Origin name in the details header.
- **Style**: Circular button with a subtle primary-colored border.

### Interaction (The Trait Dialog)
When the icon is tapped/clicked:
1.  A modal dialog appears (similar to the combat win/lose overlays but smaller).
2.  **Header**: The Translated Trait Name (e.g., "Shield Wall").
3.  **Body**: The full translated description of the mechanics.
4.  **Close**: A "Back" or "Got it" button to return to the Hero Details.

## 3. Technical Integration
- **app.js**: Update `showHeroDetails` to include the `info-icon` next to the origin label.
- **showTraitInfo(origin)**: A new function that takes the origin ID, retrieves the translated title and description, and updates a dedicated `info-modal` element in the DOM.

## Product Logic
Providing this information removes "Hidden Knowledge" from the game. Players can now make informed decisions about which heroes to keep, which to switch (using the "Switch Hero" feature), and which ones provide the best synergies for their specific combat milestone.
