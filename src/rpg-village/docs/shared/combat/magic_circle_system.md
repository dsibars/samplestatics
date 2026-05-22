# Magic Circle System Specification

## Overview

The **Magic Circle System** is a spellcrafting subsystem where players compose spells by arranging **Glyphs** — permanent magical drawings that heroes learn — on an expanding, concentric-circle interface. Inspired by the glyph-weaving magic of *Witch Hat Atelier* and the Lumina composition system from *Clair Obscur: Expedition 33*.

A Glyph is **knowledge of a drawing**. Once learned, a hero knows it forever. The Magic Circle is not a fixed board — it is a **living mandala that expands** as the hero's magical power grows.

> **Status:** Brainstorming / Design Phase — Not yet implemented.  
> **Prerequisite Building:** [Arcane Sanctum](#unlocking-the-system) (contains the **Glyph Academy**)  
> **Related Docs:** [Naming & Terminology](magic_circle_naming.md)

---

## The Visual: An Expanding Mandala

The Magic Circle is a set of **concentric rings** centered on a single **Core** slot. As a hero's **Magic Tier** increases, new slots light up one by one, expanding outward like ripples.

### Tier 1 — The Spark (Core only)
```
              ╭──────╮
             │ [CORE] │
              ╰──────╯
```
Only the **Core** slot is available.

### Tier 4 — The First Ring (Core + 3 complementary slots)
```
                    ╭──────────────╮
                   ╱  [C-0]  [C-1]  ╲
                  │ [C-5]  [CORE]  [C-2] │
                   ╲  [C-4]  [C-3]  ╱
                    ╰──────────────╯
```
The first **donut ring** appears around the Core. Each tier unlocks **one slot** on this ring.

### Tier 7 — The First Ring Complete (Core + 6 complementary slots)
```
                    ╭──────────────╮
                   ╱  [C-0]  [C-1]  ╲
                  │ [C-5]  [CORE]  [C-2] │
                   ╲  [C-4]  [C-3]  ╱
                    ╰──────────────╯
```
All 6 slots of Ring 1 are now open.

### Tier 8 — The Second Ring Opens
```
              ╭────────────────────────╮
             ╱    [R2-0]    [R2-1]     ╲
            │  [R2-5]              [R2-2]  │
            │       ╭──────────────╮        │
            │      ╱  [C-0]  [C-1]  ╲       │
            │     │ [C-5]  [CORE]  [C-2]     │
            │      ╲  [C-4]  [C-3]  ╱       │
            │       ╰──────────────╯        │
            │  [R2-4]              [R2-3]  │
             ╲    [R2-?]    [R2-?]     ╱
              ╰────────────────────────╯
```
Tier 8 adds a **second concentric ring** (Ring 2). Its first slot lights up. The pattern continues outward.

### Tier 13 — Two Full Rings (Core + 12 complementary slots)
```
              ╭────────────────────────╮
             ╱    [R2-0]    [R2-1]     ╲
            │  [R2-5]              [R2-2]  │
            │       ╭──────────────╮        │
            │      ╱  [C-0]  [C-1]  ╲       │
            │     │ [C-5]  [CORE]  [C-2]     │
            │      ╲  [C-4]  [C-3]  ╱       │
            │       ╰──────────────╯        │
            │  [R2-4]              [R2-3]  │
             ╲    [R2-5]    [R2-?]     ╱
              ╰────────────────────────╯
```
Both Ring 1 and Ring 2 are full. A Tier 13 hero has **13 total slots** to work with.

### Late Game — Tier 25+ (Level 376 Hero)
```
              ╭────────────────────────────────╮
             ╱        [R4]        [R4]          ╲
            │    [R4]                  [R4]       │
            │         ╭──────────────╮            │
            │        ╱    [R2]  [R2]   ╲          │
            │       │ [R2]  [CORE]  [R2] │         │
            │        ╲    [R2]  [R2]   ╱          │
            │         ╰──────────────╯            │
            │    [R4]                  [R4]       │
             ╲        [R4]        [R4]          ╱
              ╰────────────────────────────────╯
```
A legendary mage could have **4 full rings** = Core + 24 complementary slots = **25 total slots**. With 5,879 MP, they can compose spells of cataclysmic power.

---

## Hero Magic Tiers

When the Magic Circle system is unlocked, **all heroes are Tier 1 mages by default**. As heroes cast spells, they gain hidden **Magic Insight** experience. Each Magic Tier increase unlocks **exactly one new slot** on their personal Magic Circle.

### Tier Progression

| Magic Tier | Slots Unlocked | Visual State |
|-----------|---------------|--------------|
| **Tier 1** | 1 slot (Core only) | A single inner circle |
| **Tier 2** | 2 slots (Core + 1 complementary) | First slot of Ring 1 lights up |
| **Tier 3** | 3 slots (Core + 2 complementary) | Second slot of Ring 1 lights up |
| **...** | ... | ... |
| **Tier 7** | 7 slots (Core + 6 complementary) | Ring 1 is complete |
| **Tier 8** | 8 slots (Core + 6 + 1) | First slot of Ring 2 lights up |
| **...** | ... | ... |
| **Tier 13** | 13 slots (Core + 12) | Ring 2 is complete |
| **Tier 14** | 14 slots (Core + 12 + 1) | First slot of Ring 3 lights up |
| **...** | ... | ... |

### Ring Capacity

Each concentric ring (donut) holds a fixed number of slots. When a ring is full, the next tier adds a new outer ring.

| Ring | Slots | Tier Range to Fill |
|------|-------|-------------------|
| Core (center) | 1 | Always available (Tier 1) |
| Ring 1 | 6 | Tiers 2–7 |
| Ring 2 | 6 | Tiers 8–13 |
| Ring 3 | 6 | Tiers 14–19 |
| Ring 4 | 6 | Tiers 20–25 |
| Ring N | 6 | Tiers (6N-4) to (6N+1) |

> **Why 6 slots per ring?** Hexagonal symmetry looks stunning visually, gives satisfying progression milestones every 6 tiers, and scales well into late game.

### Magic Insight (Hidden)

Magic Insight is the hidden XP gained when a hero casts spells. It is **completely invisible** to the player — no bars, no numbers, no percentages.

```
Insight Gained = Spell MP Cost × 0.5 × (1 + Average Glyph Tier in Spell)
```

| Tier Transition | Insight Required | Approx. Spells (avg 20 MP) |
|----------------|------------------|---------------------------|
| 1 → 2 | 500 | ~50 |
| 2 → 3 | 800 | ~80 |
| 3 → 4 | 1,200 | ~120 |
| 4 → 5 | 1,800 | ~180 |
| 5 → 6 | 2,500 | ~250 |
| 6 → 7 | 3,500 | ~350 |
| 7 → 8 (new ring!) | 5,000 | ~500 |
| 8 → 9 | 6,500 | ~650 |
| 9 → 10 | 8,500 | ~850 |
| 10 → 11 | 11,000 | ~1,100 |
| 11 → 12 | 14,000 | ~1,400 |
| 12 → 13 | 18,000 | ~1,800 |
| 13 → 14 (new ring!) | 23,000 | ~2,300 |

> **The player never sees these numbers.** The only way to gauge progress is through the [Witch's Hut](#the-witchs-hut).

### Tier-Up Moment

When a hero crosses a tier threshold, a **mystical event** fires:
- The hero's portrait gains a subtle new aura (elemental color based on most-used Core Glyph).
- A notification appears: *"[Hero] feels the weave of magic shift within them..."*
- The Magic Circle screen, when next opened, animates — a new slot lights up with a particle burst.
- If a new ring is born, the entire circle subtly expands outward.

The hero themselves does not know what changed — only that *something* changed. The player must discover the new slot by opening the Circle.

---

## The Witch's Hut

The **Witch's Hut** is a separate village building (not part of the Arcane Sanctum) where a mystical NPC reads the magical "vibes" of heroes. It is the **only source of progress information** for the hidden Magic Insight and Glyph Mastery systems.

### Building

| Property | Value |
|----------|-------|
| **Name** | Witch's Hut |
| **Cost** | 200g, 80 Wood, 30 Stone |
| **Unlock** | Available from the start (does not require Arcane Sanctum) |
| **Function** | Visit with a hero to receive a cryptic reading about their magical progress |
| **Cooldown** | 1 reading per hero per day |

### How It Works

1. Player enters the Witch's Hut.
2. Selects a hero from the roster.
3. The Witch delivers a **short, poetic dialogue** based on the hero's hidden state.
4. The reading hints at:
   - How close the hero is to their next Magic Tier.
   - Which Glyphs are nearing mastery thresholds.
   - General magical "attunement" (most-used element, casting frequency).

### Dialogue Categories

The Witch's responses are drawn from pools based on the hero's hidden progress ranges.

#### Category A: Far from Next Tier (>50% remaining)

> *"The threads are still weaving, child. The pattern is there, but faint. Cast more. Feel more. The circle will widen when it is ready."*

> *"Your mana flows like a quiet stream. Steady, patient... but no rapids yet. Continue."*

> *"I see embers, not flames. Tend them."*

#### Category B: Approaching Tier (20–50% remaining)

> *"The water stirs. Something is waking beneath the surface. Do you feel it?"*

> *"Your glyphs hum with restless energy. The weave tightens. Not long now."*

> *"The old patterns shift when you cast. The circle senses your growth."*

#### Category C: Near Tier (<20% remaining — imminent!)

> *"I read a VERY POWERFUL MANA inside you! Something is going to happen very soon!"*

> *"The air crackles when you speak your spells. The veil thins. Prepare yourself."*

> *"A new ring calls to you. It is almost within reach. One more push."*

#### Category D: Just Reached New Tier (within 48 hours)

> *"Your effort had a recent reward... let the cycle begin again."*

> *"The mandala has expanded. You stand in a wider circle now. Do you feel the space?"*

> *"A door opened. You walked through without seeing the threshold. Now you see."*

#### Category E: Glyph Mastery Hints

> *"Your Fire Glyph... it no longer feels like a stranger's hand. It is becoming *yours*."* (near 500 casts)

> *"The Potentiate symbol you draw — it has changed. Subtly. The lines remember your hand."* (near 2,000 casts)

> *"There is a depth to your glyphs that I have not seen before. You are not merely drawing. You are *becoming*."* (near 10,000 casts)

#### Category F: First Visit (New Player Introduction)

> *"So. You wish to know the unseen. I can show you glimpses — threads, ripples, whispers. But the true pattern? That lives inside your heroes. Cast. Learn. Return to me when the embers stir."*

### Witch Personality Rules

- The Witch **never gives exact numbers**. No "You are 73% to Tier 4." Only moods and metaphors.
- The Witch **references the hero's most-used element**. A fire mage gets fire metaphors. A water mage gets water metaphors.
- The Witch **remembers previous visits**. If you visit twice in a row with the same hero, she might say: *"Back so soon? The threads have not moved much since yesterday. Patience, child."*
- The Witch **reacts to tier-ups**. If you visit *after* a tier-up without having visited before, she says: *"Something shifted in you since we last spoke. The circle has grown. Did you not feel it?"*

### Optional: The Witch's Name

The Witch could have a generated or fixed name that adds personality:
- **Fixed:** "Madam Vesper" or "The Seer of Ash"
- **Generated:** Based on village name + random suffix ("Elder Mira of [VillageName]")

---

## Tier Implications (Updated with Mysticism)

| Phase | Tier Range | Experience |
|-------|-----------|------------|
| **The Spark** | 1 | Core only. The hero barely knows they have magic. |
| **The Awakening** | 2–3 | First complementary slots open. The hero feels "something" when casting. |
| **The Apprentice** | 4–6 | Ring 1 fills. The hero dreams of geometric patterns. |
| **The Adept** | 7 | Ring 1 complete. The Witch calls them "promising." |
| **The Seeker** | 8–12 | Ring 2 opens and fills. The hero senses mana in the air around them. |
| **The Archmage** | 13 | Ring 2 complete. Other heroes comment on their "glow." |
| **The Legend** | 14–25 | Rings 3 and 4. The hero is recognized as one of the greats. Children whisper stories. |

### Tier Implications

- **Tier 1–6:** Apprentice phase. Simple spells, limited composition.
- **Tier 7:** First milestone — Ring 1 complete. The hero is now a full mage.
- **Tier 8–12:** Expert phase. Two rings allow for complex synergies.
- **Tier 13:** Second milestone — Ring 2 complete. The hero is an archmage.
- **Tier 14+:** Legendary phase. Each new ring is a major achievement.
- **Tier 25:** Four full rings. A god-tier mage capable of world-ending spells.

Not every hero needs to reach Tier 25. A warrior who dabbles in magic might happily stay at Tier 4 (Core + 3 slots) for occasional elemental strikes.

---

## Glyphs

### Glyph Quality Tiers

Each Glyph concept exists in **multiple quality grades**. Higher-tier Glyphs represent the same drawing with greater mastery.

**Two ways to unlock higher tiers:**
1. **Find a higher-tier Glyph Tablet** in expeditions (RNG).
2. **Master the Glyph through use** — casting spells containing a Tier 1 Glyph slowly unlocks Tier 2, then Tier 3, then Tier 4.

| Tier | Symbol | Slot Value | MP Modifier | Mastery Threshold |
|------|--------|-----------|-------------|-------------------|
| 1 | `+` | 1× base effect | +0% | 0 (learned immediately) |
| 2 | `++` | 2× base effect | +15% | ~500 casts |
| 3 | `+++` | 3× base effect | +30% | ~2,000 casts |
| 4 | `✦` | 4× base effect | +50% | ~10,000 casts |

> When a hero unlocks Tier 2 through mastery: *"[Hero] has deepened their understanding of the Potentiate Glyph! The simple `+` has evolved into `++`!"*

### Glyph Categories

**Core Glyphs** — Placed in the center slot. Determine element and base power.

| ID | Element | Base DMG | Base MP |
|----|---------|----------|---------|
| `glyph_fire` | 🔥 Fire | High | Medium |
| `glyph_water` | 💧 Water | Low | Low |
| `glyph_wind` | 🌪️ Wind | Medium | Low |
| `glyph_storm` | ⚡ Storm | Medium | High |
| `glyph_light` | ✨ Light | Low | High |
| `glyph_dark` | 🌑 Dark | Very High | Very High |

**Complementary Glyphs** — Placed in any complementary slot (Tier 2+).

*Amplifiers:*
| ID | Name | Effect per Tier |
|----|------|----------------|
| `glyph_potentiate` | Potentiate | ×1.2 damage, ×1.15 MP cost |
| `glyph_focus` | Focus | ×1.15 damage, +5% crit |
| `glyph_extend` | Extend | +1 turn duration |
| `glyph_efficiency` | Efficiency | −15% MP cost, −10% damage |
| `glyph_channel` | Channel | +20% damage, 2-turn cast |

*Effects:*
| ID | Name | Effect per Tier |
|----|------|----------------|
| `glyph_multi` | Multi | +1 target |
| `glyph_pierce` | Pierce | Ignore 15% DEF |
| `glyph_venom` | Venom | Apply poison DoT |
| `glyph_slumber` | Slumber | 20% Sleep chance |
| `glyph_aegis` | Aegis | Convert to ally shield |
| `glyph_celerity` | Celerity | Grant +20% SPD |
| `glyph_reflect` | Reflect | 30% reflect chance |
| `glyph_leech` | Leech | Heal 10% of damage |

---

## Spell Composition

### The Crafting Flow

1. **Select Hero**: Open their Magic Circle. The UI shows only slots unlocked by their Magic Tier.
2. **Place Glyphs**: Drag Glyphs from the palette into available slots.
3. **Preview**: Live calculation of damage, MP cost, and effects.
4. **Name**: Enter a **custom name** or accept the auto-generated one.
5. **Inscribe**: Save to the hero's Spell Codex.

> **Glyphs are never consumed during composition.**

### Custom Spell Naming

Before inscribing, the player sees:
- **Auto-generated name**: "Greater Fire of Echoes"
- **Custom name field**: Free text input (max 30 chars)

The custom name is stored with the spell and displayed in combat. Auto-generated names are used as fallback.

> **Player examples:**
> - *"Inferno's Kiss"* — Fire + Potentiate `++` ×3
> - *"Zeus"* — Storm + Focus `+++` + Pierce
> - *"Mom's Hug"* — Light + Aegis + Extend
> - *"The Hell"* — Dark + Potentiate `✦` ×6, Multi, Leech (Tier 20+ mage)

### The Circle Registry (Sealed Names)

Every unique Glyph combination is a **discoverable entity**. The first hero to create it becomes its **inventor**.

**How It Works:**

```
1. Elara composes: [Fire Core] + [++] + [++] + [+] + [AoE]
2. She names it: "☄️ Meteor Strike"
3. The game checks: Has this exact combination been created before?
4. No → "☄️ Meteor Strike" is SEALED. Elara is recorded as inventor.
5. Later, Selene composes the SAME combination.
6. The game shows: "This circle already exists as '☄️ Meteor Strike' (invented by Elara)"
7. Selene can still inscribe it, but the name is locked.
```

**Circle Identity Formula:**
```
circleHash = hash(coreGlyph + ringSlot1 + ringSlot2 + ... + ringSlot6)
```

> **Order matters.** `[Fire] + [++] + [AoE]` is different from `[Fire] + [AoE] + [++]`. Different hash = different name.

**What the Player Sees:**

| Scenario | UI Message |
|----------|-----------|
| **First creation** | *"You have discovered a new circle! Name it:"* |
| **Already exists** | *"This circle already exists as '☄️ Meteor Strike' (invented by Elara). Inscribe it?"* |
| **Inscribing** | Spell saves to Codex with the **sealed name**. Inventor noted in tooltip. |

**Why This Matters:**

1. **Shared Language:** Every hero calls the same composition by the same name. No confusion.
2. **Discovery Feel:** "I invented something new!" vs "Oh, this already has a name."
3. **Lore Depth:** Your heroes have a documented history of magical invention.
4. **Design Library Clarity:** The Library shows "☄️ Meteor Strike (Elara)" — everyone knows what it does.

**The Registry UI:**

```
┌─ Circle Registry ──────────────────────┐
│ Discovered Spells: 47                  │
│                                        │
│ ☄️ Meteor Strike        — Elara (Day 33)│
│ ❄️ Frost Prison         — Kira (Day 41) │
│ ⚡ Thunder Cage          — Thorne (Day 52)│
│ 🌿 Verdant Restoration  — Selene (Day 38)│
│ 🔥 Inferno Bloom        — Player (Day 45)│
│ ...                                    │
│                                        │
│ [Sort: Name | Inventor | Day | Power]  │
└────────────────────────────────────────┘
```

**Registry Rules:**
- **Names are permanent.** Cannot rename a sealed circle.
- **Inventor is permanent.** Even if the hero dies, they remain the inventor.
- **Registry is per-save.** Each playthrough discovers its own language.
- **Auto-suggest on creation:** If your composition is CLOSE to an existing one, the game suggests: *"This resembles 'Meteor Strike' but with Ice instead of Fire. Name it?"*

### Stat Calculation

```
Base Damage  = Core Glyph Base Damage
Amplifier Product = Product of all Amplifier Glyph effects
Effect Union = All unique Effect Glyph behaviors

Final Damage = Base Damage × Amplifier Product × (1 + 0.02 × Hero MagicPower)
Final MP     = Core Glyph Base MP × (1 + sum of all cost modifiers)
```

### Composition Examples by Tier

| Hero Tier | Slots | Glyphs Placed | Result Spell | DMG | MP |
|-----------|-------|--------------|-------------|-----|-----|
| Tier 1 | 1 | Fire Core | Fire Bolt | 15 | 8 |
| Tier 4 | 4 | Fire Core + `+` ×3 | Lesser Fire | 22 | 20 |
| Tier 7 | 7 | Fire Core + `++` ×3, `+` ×3 | Greater Fire | 38 | 42 |
| Tier 13 | 13 | Fire Core + `++` ×6, Multi `+` ×2, Pierce `+` ×2, Venom `+` ×2 | Super Piercing Venom Fire of Echoes | 65 | 78 |
| Tier 20 | 20 | Dark Core + `✦` ×4, `+++` ×6, Multi `++` ×2, Leech `++` ×2, Reflect `+` ×4 | Apocalyptic Swarming Void of Hunger and Mirrors | 340 | 420 |

### The MP Budget Puzzle

A hero's max MP limits what they can inscribe. The UI shows an **MP Budget Bar**:
- 🟢 Green: Within budget
- 🟡 Yellow: 75–90% of budget
- 🔴 Red: Over budget (cannot inscribe)

This creates natural build gates:
- **Tier 4 mage** (40 MP): Simple 4-slot compositions.
- **Tier 13 archmage** (150 MP): Complex 13-slot spells with multiple effects.
- **Tier 25 legend** (800+ MP): Can afford 20-slot cataclysms that one-shot bosses.

---

## Glyph Academy

The **Glyph Academy** is a wing of the Arcane Sanctum where heroes teach Glyphs to each other.

### Academy Tiers

| Level | Cost | Teaching Slots | Max Students/Slot | Learning Speed |
|-------|------|---------------|-------------------|----------------|
| Lv 1 | 500g, 100 Wood, 50 Stone | 1 | 1 student | 100% |
| Lv 2 | 1500g, 200 Wood, 100 Stone | 1 | 2 students | 120% |
| Lv 3 | 3000g, 400 Wood, 200 Stone | 2 | 2 students | 140% |
| Lv 4 | 6000g, 800 Wood, 400 Stone | 2 | 3 students | 160% |

### Teaching Duration

```
Base Days = Glyph Tier × 2
Teacher Bonus = −0.3 days per 10 MagicPower
Student Penalty = +0.2 days per extra student
Building Bonus = × speed multiplier
Final Days = max(1, round((Base + Penalty) / (1 + Bonus) × Building))
```

### Strategic Decisions

- **Who discovers?** Send scouts on expeditions for Glyph Tablets.
- **Who teaches?** Your highest-tier mage (fastest) — but they're off the battlefield.
- **Batch efficiency:** Teaching 3 students at once is gold-efficient but slower.
- **Tier priority:** Teach Tier 1 first to get everyone started. Higher tiers come through mastery or rare tablets.

### Academy Design Library (Circle Sharing)

With 30 heroes, recreating the same spell for 5 mages is tedious. The Academy's **Design Library** solves this.

**How It Works:**
1. Any hero with a spell in their Codex can **"publish"** the design to the Academy Library.
2. Another hero can **"study"** the design to copy it into their own Codex.
3. The target hero must have **all required Glyphs** in their repertoire.
4. If Glyphs are missing, the Academy shows which ones — queue them for Glyph Teaching first.

**Cost:**
- **Gold:** Scales with circle complexity (Core = 10g, +5g per Ring slot)
- **Time:** 2 days (hero locked, studying the design)
- **No teacher required** — the design is in the library. The hero studies alone.

**UI Flow:**
```
┌─ Academy ──────────────────────────────┐
│ Tab: [Teach Glyphs] [Design Library]   │
│                                         │
│ Design Library:                         │
│ ┌─ ☄️ Meteor Strike (Elara) ─────────┐ │
│ │ Core: Fire | Ring: ++, ++, +, AoE   │ │
│ │ Cost: 40g | Time: 2 days            │ │
│ │ [📋 Copy to...]                     │ │
│ └─────────────────────────────────────┘ │
│ ┌─ ❄️ Frost Prison (Kira) ───────────┐ │
│ │ Core: Ice | Ring: +, +, Slow, Slow  │ │
│ │ Cost: 25g | Time: 2 days            │ │
│ │ [📋 Copy to...]                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [+ Publish New Design]                  │
└─────────────────────────────────────────┘

→ Click [📋 Copy to...]

┌─ Copy Meteor Strike ───────────────────┐
│ Select target hero:                     │
│ [Arthur] [Borin] [Selene] [—] [—]      │
│                                         │
│ Selene: ✅ Has all Glyphs               │
│ Arthur: ❌ Missing: AoE Glyph           │
│         [🎓 Teach AoE Glyph First]      │
│                                         │
│ [Confirm: 40g, 2 days]                 │
└─────────────────────────────────────────┘
```

**Design Library Rules:**
- A design can be copied **unlimited times**.
- The original hero is **not affected** — publishing doesn't remove their spell.
- Designs are **named by the creator** — "Meteor Strike (Elara)" vs "Meteor Strike (Selene)" may differ.
- Designs can be **deleted** from the library by the player.
- **Auto-publish option:** When a hero composes a new spell, prompt: *"Publish 'Meteor Strike' to Academy Library? Other mages can copy it."*

**Design Library Capacity (by Academy Level):**

| Academy Level | Max Stored Designs |
|--------------|-------------------|
| Lv 1 | 3 designs |
| Lv 2 | 6 designs |
| Lv 3 | 10 designs |
| Lv 4 | 15 designs |

> **Example workflow:** Elara creates "☄️ Meteor Strike" (Fire Core + 3 Potentiate + AoE). She publishes it. Now Selene, Kira, and 3 other mages can copy it in 2 days each — no teacher needed, just the library.

---

## Spell Codex

Each hero has a personal **Spell Codex** (max 6 slots) where inscribed spells are stored.

- **Unlimited casts:** Codex spells are **not consumed** on use. They are a 6-spell loadout.
- **Replacement:** Inscribing when full prompts the player to replace an existing spell.
- **Tier-locked:** The Codex remembers the spell's composition. A Tier 5 hero cannot cast a Tier 13 spell even if it's in their Codex from before.

---

## Migration from Current Magic Skills

On first entering the Arcane Sanctum:

| Old Skill | Migration Reward |
|-----------|-----------------|
| `small_fire_ball` | Glyph Tablet: Fire Core T1 |
| `medium_fire_ball` | Glyph Tablet: Fire Core T2 + Potentiate T1 |
| `meteor` | Glyph Tablet: Fire Core T3 + Potentiate T2 + Multi T2 |
| `small_heal` | Glyph Tablet: Light Core T1 |
| `haste` | Glyph Tablet: Light Core T1 + Celerity T1 |

Heroes who knew these skills auto-learn the Glyphs. Others receive the tablets in inventory.

---

## UI Specification

### Magic Circle Screen

- **Dynamic Canvas**: The circle grows as the hero's Tier increases.
  - Tier 1: Small circle, 1 slot.
  - Tier 7: Medium circle, 7 slots (Core + full Ring 1).
  - Tier 13: Large circle, 13 slots (two full rings).
  - Tier 25: Massive mandala, 25 slots (four full rings).
- **Slot Animation**: When a new tier unlocks, the new slot lights up with a particle burst. If a new ring is born, the entire circle subtly expands outward.
- **Glyph Palette**: Bottom panel, grouped by category.
- **Preview Panel**: Right side — damage, MP cost, effects, and **MP Budget Bar**.
- **Name Input**: Custom spell name field below preview.
- **Buttons**: "Inscribe to Codex" | "Clear Circle"

### Glyph Academy Screen

- **Tabs**: [Teach Glyphs] | [Design Library]
- **Active Sessions**: Cards showing teacher, students, Glyph, days remaining, cost.
- **Enroll Flow**: Select teacher → select Glyph → select students → confirm.
- **Cancel**: Pro-rata gold refund, heroes return to idle.

### Design Library Screen

- **Stored Designs**: Cards showing spell name, creator, Core, Ring composition, copy cost.
- **Copy Flow**: Select design → select target hero → check Glyph prerequisites → confirm.
- **Missing Glyphs Warning**: Red text showing which Glyphs the target lacks. Button to queue Glyph teaching.
- **Publish Flow**: Select hero → select spell from their Codex → confirm publish.
- **Delete**: Remove design from library (no cost).

---

## Open Questions

1. **Ring size:** 6 slots per ring (hexagonal) feels right visually. Should inner rings have fewer slots (4) and outer rings have more (8)?
2. **Insight visibility:** Show the exact number or keep it as a subtle glow?
3. **Mastery thresholds:** Are 500 / 2,000 / 10,000 casts reasonable, or should they scale with Glyph rarity?
4. **Tier cap:** Is Tier 25 the practical maximum, or should it go higher?
5. **Codex sharing:** Can a player copy a spell composition from one hero's Codex to another's?
6. **Spell deletion:** Can players delete spells from the Codex?
