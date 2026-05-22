# Magic Circle Naming & Terminology

## Why This Document Exists

The Magic Circle System introduces many new concepts. Consistent naming is critical for:
- **Code clarity** — engineers know what `Glyph` vs `Tablet` vs `Insight` means.
- **Player comprehension** — the UI uses one term, not three synonyms.
- **Lore cohesion** — the village world feels internally consistent.

> **Inspiration:** The core concept draws from *Witch Hat Atelier* (Tongari Bōshi no Atelier), where magic is performed by drawing "glyphs" (魔文字, *majimoji*) — mystical letters and symbols woven into patterns.

---

## Core Concepts

### The Knowledge Model

```
Glyph Tablet (expedition loot)
      │
      ▼  "Study" (self) or "Teach" (Academy)
Hero learns the Glyph (permanent knowledge)
      │
      ▼  "Cast spells containing this Glyph"
Glyph Mastery increases (hidden counter)
      │
      ▼  Threshold reached
Glyph upgrades to next Tier (e.g., + → ++)
      │
      ▼  "Place on Circle"
Composed into a Spell (temporary arrangement)
      │
      ▼  "Name" (custom or auto-generated)
      ▼  "Inscribe"
Saved to Spell Codex (ready for combat)
      │
      ▼  "Cast"
Executed in battle (costs MP, gains Insight)
      │
      ▼  Insight accumulates
Hero's Magic Tier increases (1 → 2 → 3)
      │
      ▼  More Circle slots unlocked
```

### Key Distinctions

| Term | What It Is | Example |
|------|-----------|---------|
| **Glyph** | Permanent knowledge of a magical drawing. | Hero A **knows** the Fire Glyph at Tier 2 (`++`). |
| **Glyph Tablet** | A physical item found in expeditions. Teaches one Glyph to one hero. | "Glyph Tablet: Fire" — consumed to teach Fire. |
| **Glyph Tier** | The quality grade of a known Glyph (`+`, `++`, `+++`, `✦`). | Hero's Potentiate Glyph is Tier 3 (`+++`). |
| **Glyph Mastery** | Hidden cast counter toward next Tier. | "Potentiate cast 487/500 times." |
| **Magic Insight** | Hidden XP gained from casting spells. | Contributes to Magic Tier progression. |
| **Magic Tier** | The hero's mage level (1, 2, or 3). Determines Circle slots. | Tier 2 = Core + 4 complementary slots. |
| **Spell** | A composed magical ability. | "Inferno's Kiss" (player-named) or "Greater Fire of Echoes" (auto). |
| **Spell Codex** | A hero's personal spellbook (max 6 slots). | Hero's Codex: 3/6 slots filled. |

> **Critical:** Glyphs are **not inventory items**. Only **Glyph Tablets** exist as physical loot.

---

## Glossary

### Core Terms

| Term | Definition | Why Chosen |
|------|------------|------------|
| **Glyph** | A permanent magical drawing that a hero knows. The fundamental "word" of magical language. | Direct parallel to *Witch Hat Atelier* (魔文字, *majimoji*). "Teaching a glyph" and "drawing a glyph on the circle" both sound natural. |
| **Glyph Tablet** | A physical stone slab found in expeditions. Teaches one Glyph to one hero. | "Tablet" signals an ancient, inscribed object. Distinguishes from the intangible Glyph knowledge. |
| **Glyph Tier** | The mastery grade of a Glyph: `+` (simple), `++` (greater), `+++` (master), `✦` (legendary). | Visual symbols communicate power at a glance. Tier 2 is literally "two of Tier 1" in slot value. |
| **Glyph Mastery** | The hidden counter tracking how many times a hero has cast a spell containing this Glyph. | "Mastery" implies earned expertise through practice. |
| **Magic Insight** | The hidden experience gained when a hero casts spells. Accumulates toward Magic Tier increases. | "Insight" suggests deepening magical perception, not generic XP. |
| **Magic Tier** | The hero's level of magical aptitude (1, 2, or 3). Unlocks more Circle slots. | "Tier" is clean and sequential. Avoids confusion with hero level or skill tiers. |
| **Magic Circle** | The crafting interface where Glyphs are arranged. Scales with Magic Tier. | Classic fantasy term. Matches the circular visual. |
| **Spell** | A completed magical ability created by arranging Glyphs on the Magic Circle. | Standard RPG term. |
| **Spell Codex** | A hero's personal spellbook (max 6 slots) containing inscribed spells. | "Codex" implies a compact, organized collection. |
| **Inscribe** | The act of saving a composed spell to the Codex. | Evokes writing magic into existence. |
| **Arcane Sanctum** | The village building that unlocks the Magic Circle and Glyph Academy. | "Sanctum" implies a sacred place of study. |
| **Glyph Academy** | A wing of the Arcane Sanctum where heroes teach Glyphs to each other. | "Academy" signals learning and teaching. |
| **Witch's Hut** | A separate village building where a mystical NPC reads heroes' magical progress. | "Hut" implies a rustic, mysterious place separate from the formal Academy. |
| **Reading** | The act of visiting the Witch with a hero to receive progress hints. | Evokes tarot, tea leaves, mystical divination. |
| **Study** | Consuming a Glyph Tablet to learn its Glyph. | Simple, academic verb. |
| **Teach** | One hero teaching a known Glyph to another at the Academy. | Direct, unambiguous. |

### Glyph Categories

| Term | Slot | Role | Example |
|------|------|------|---------|
| **Core Glyph** | Center (always available) | Defines element & base power | Fire, Water, Wind, Storm, Light, Dark |
| **Amplifier Glyph** | Complementary (Tier 2+) | Multiplies power or modifies cost | Potentiate, Focus, Extend, Efficiency, Channel |
| **Effect Glyph** | Complementary (Tier 2+) | Adds special behaviors | Multi, Pierce, Venom, Slumber, Aegis, Celerity |

### Glyph Quality Tiers

| Tier | Symbol | Name | Slot Value | Mastery Threshold |
|------|--------|------|-----------|-------------------|
| 1 | `+` | Simple | 1× | 0 (learned) |
| 2 | `++` | Greater | 2× | ~500 casts |
| 3 | `+++` | Master | 3× | ~2,000 casts |
| 4 | `✦` | Legendary | 4× | ~10,000 casts |

---

## Witch Hat Atelier References

For lore flavor:

| WHA Concept | Our Equivalent | Flavor Usage |
|-------------|----------------|--------------|
| *Majimoji* (魔文字) — magical letters | Glyphs | *"The ancient Glyphs, first drawn by the Magi of Old, are the true language of the world."* |
| *Mahougu* (魔法具) — magic tools | Enchanted Weapons | *"A blade etched with a spell inscription becomes a true Magic Tool."* |
| *Shitsuran* (失らん) — spell failure | Fizzle | *"The circle rejected the pattern — a Fizzle."* |
| *Kyouju* (教授) — learning/teaching | Study / Teach | *"The hero spent days at the Academy, teaching the Fire Glyph to eager students."* |

---

## UI Labels (Player-Facing)

| Internal Term | Player-Facing Label | Context |
|---------------|---------------------|---------|
| `glyph_fire` | "Fire Glyph" | Palette label |
| `glyph_fire_tier_2` | "Fire Glyph II" | When hero knows Tier 2 |
| `tablet_fire` | "Glyph Tablet: Fire" | Inventory item |
| `study_tablet` | "Study Tablet" | Button |
| `teach_glyph` | "Teach Glyph" | Academy button |
| `enroll_student` | "Enroll Student" | Academy button |
| `glyph_mastery` | "Mastery: 487/500" | Tooltip or subtle label |
| `magic_insight` | "Magic Insight" | Progress bar label |
| `magic_tier_1` | "Tier 1 Mage — The Spark" | Hero magic profile |
| `magic_tier_2` | "Tier 2 Mage — The Apprentice" | Hero magic profile |
| `magic_tier_3` | "Tier 3 Mage — The Archmage" | Hero magic profile |
| `inscribe` | "Inscribe to Codex" | Magic Circle button |
| `clear_circle` | "Clear Circle" | Magic Circle button |
| `custom_name` | "Name your spell..." | Input field placeholder |
| `spell_codex` | "Spell Codex (3/6)" | UI header |
| `arcane_sanctum` | "Arcane Sanctum" | Building name |
| `glyph_academy` | "Glyph Academy" | Sub-building name |
| `witchs_hut` | "Witch's Hut" | Building name |
| `request_reading` | "Request a Reading" | Witch's Hut button |
| `reading_result` | "The threads are still weaving..." | Witch dialogue |
| `mp_budget` | "MP: 32/45" | Budget bar label |
| `unknown_glyph` | "???(Find Tablet)" | Grayed-out palette slot |

---

## Dynamic Spell Naming

Auto-generated names follow prefix + core + suffix pattern. Players can override with custom names.

### Prefix (from Amplifiers)

| Amplifier | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|-----------|--------|--------|--------|--------|
| Potentiate | — | Greater | Super | Ultra |
| Focus | Precise | True | Perfect | Absolute |
| Extend | Lingering | Enduring | Eternal | Timeless |
| Efficiency | Swift | Flowing | Effortless | Weightless |
| Channel | Charged | Overcharged | Cataclysmic | Apocalyptic |

### Core (from Element)

| Element | Base Name |
|---------|-----------|
| Fire | Fire / Flame / Inferno |
| Water | Water / Tide / Tsunami |
| Wind | Wind / Gale / Tempest |
| Storm | Spark / Thunder / Cataclysm |
| Light | Light / Radiance / Divine |
| Dark | Shadow / Void / Abyss |

### Suffix (from Effects)

| Effect | Suffix |
|--------|--------|
| Multi | of Echoes |
| Pierce | of Penetration |
| Venom | of Venom |
| Slumber | of Slumber |
| Aegis | Ward |
| Celerity | of Celerity |
| Reflect | of Mirrors |
| Leech | of Hunger |

### Examples

| Composition | Auto-Generated Name | Custom Name Example |
|-------------|---------------------|---------------------|
| Fire Core + Potentiate T2 | Greater Fire | *"Inferno's Kiss"* |
| Storm Core + Focus T3 + Pierce | Perfect Thunder of Penetration | *"Zeus"* |
| Light Core + Efficiency T1 + Aegis | Swift Radiance Ward | *"Mom's Hug"* |

---

## Code Naming Conventions

### File & Class Names

```
Glyph                 → glyph (knowledge ID: glyph_<type>)
GlyphTier             → tier (1, 2, 3, 4)
GlyphTablet           → glyph_tablet (item ID: tablet_glyph_<type>_<tier>)
GlyphMastery          → glyph_mastery (hidden counter per hero per glyph)
MagicInsight          → magic_insight (hidden XP per hero)
MagicTier             → magic_tier (1, 2, 3)
MagicCircle           → MagicCircle (domain model)
GlyphAcademy          → GlyphAcademy (service)
SpellCodex            → SpellCodex (hero property)
ArcaneSanctum         → arcane_sanctum (building ID)
```

### Translation Keys

```
glyphs (plural label)           → ui_glyphs
glyph_fire (name)               → glyph_fire
glyph_fire_desc (description)   → glyph_fire_desc
tablet_fire (item name)         → tablet_fire
spell_codex_title               → ui_spell_codex
magic_tier_label                → ui_magic_tier
magic_insight_label             → ui_magic_insight
arcane_sanctum_name             → village_arcane_sanctum
glyph_academy_name              → ui_glyph_academy
witchs_hut_name                 → village_witchs_hut
request_reading_button          → ui_request_reading
study_button                    → ui_study
teach_button                    → ui_teach
inscribe_button                 → ui_inscribe
custom_name_placeholder         → ui_spell_name_placeholder
unknown_glyph_hint              → ui_unknown_glyph
```

---

## Summary Table

| Layer | What It Is | Physical? | Example |
|-------|-----------|-----------|---------|
| **Glyph Tablet** | Expedition loot | ✅ Yes (consumable) | "Glyph Tablet: Fire" |
| **Glyph** | Hero's knowledge | ❌ No (permanent) | Hero knows Fire Glyph |
| **Glyph Tier** | Quality grade of a Glyph | ❌ No | Tier 2 (`++`) |
| **Glyph Mastery** | Hidden cast counter | ❌ No | 487/500 casts |
| **Magic Insight** | Hidden XP toward Tier | ❌ No | 3,200 / 5,000 |
| **Magic Tier** | Hero's mage level | ❌ No | Tier 2 (5 slots) |
| **Magic Circle** | Crafting UI | ❌ No | 5 slots for Tier 2 hero |
| **Spell** | Composed ability | ❌ No | "Inferno's Kiss" |
| **Codex** | Spell storage | ❌ No | 6 inscribed spells |
| **Arcane Sanctum** | Building | ✅ Yes | Village building |
| **Glyph Academy** | Teaching wing | ✅ Yes | Teacher + students |
| **Witch's Hut** | Divination building | ✅ Yes | Mystical NPC readings |
| **Enchantment** | Weapon buff | ✅ Yes | Sword with Fire proc |
