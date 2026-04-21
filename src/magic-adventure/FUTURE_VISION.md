# Magic Adventure: Future Vision & Roadmap

This document captures the long-term vision and brainstorming ideas for the Magic Adventure spellcasting system.

## 🚀 The Vision: Interactive Transmutation

The goal is to make spellcasting feel like a deliberate, powerful, and interactive ritual. Instead of just drawing everything at once, the process will be broken into steps that provide immediate feedback.

### 1. Step-by-Step Construction
- **Focus Mode**: The UI will guide the user through the process.
  - **Step 1: The Core**: The full circle is shown, then the camera zooms/focuses on the Core. Only drawing in the Core is allowed. Once a valid symbol is recognized, it "consolidates" (glows/colors) and the UI advances.
  - **Step 2: The Complements**: The camera zooms out and then focuses on each of the four outer sections one by one (or allows free choice).
- **Consolidation**: When a stroke or group of strokes forms a recognized pattern, it transforms from a "sketch" (black lines) into a "magical construct" (glowing, colored lines representing the element).

### 2. Spell Templates & Simulator
- **Design Mode**: A dedicated section where players can experiment with different combinations, see their stats, and "save" them as templates.
- **Combat Usage**: During a fight, players can either:
  - Quickly select a **Saved Template** for a fast cast.
  - Draw a **Custom Spell** on the fly for situational needs.

### 3. Advanced Naming & Linguistics
- Implement a rule-based naming system where adjectives and prefixes are applied in a specific order.
- **Examples**:
  - `1 Boost (+)` -> "Super Fire"
  - `2 Boosts (++)` -> "Mega Fire"
  - `3+ Boosts (+++)` -> "Ultra Fire"
  - `All (∞)` -> "Multi"
  - `Pierce (>)` -> "Piercing"
  - `Special Effect Complement` -> "Burning Fire" (becomes "Burning")
- **Complex Result**: "Multi Ultra Piercing Burning"

### 4. Elemental Resonance & Statuses
- Core symbols define the base element.
- Complementary symbols can be added later to inject specific status effects:
  - **Fire** + *Heat Complement* -> **Burning** (DoT)
  - **Water** + *Chill Complement* -> **Wet** (Slows / Increases Lightning damage)
  - **Earth** + *Weight Complement* -> **Stun**

## 🛠 Strategic Depth
- The "Failure to Cast" mechanic is central. Designing a spell wrong (breaking the "Magic Rules") should feel like a real risk for inexperienced mages.
- Expertise grows not through level-ups, but through the player's own ability to draw complex, valid circles quickly.
