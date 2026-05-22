# Hybrid Body Inscription System

## Overview

The **Body Inscription** system is a late-game hybrid unlock that rewards heroes who have invested deeply in **both** the Physical Skill System and the Magic Circle System. When a hero meets strict thresholds, they gain the ability to **draw a permanent magic circle upon their own body** — infusing their physical techniques with arcane power.

> **Status:** Brainstorming / Design Phase — Not yet implemented.  
> **Prerequisite Systems:** [Physical Skill System](physical_skill_system.md), [Magic Circle System](magic_circle_system.md)  
> **Unlock Feel:** Trophy / achievement. Not easy. Not common. Legendary.  
> **Archetype:** The "Paladin" — a warrior whose body IS a spell.

---

## Core Concept

A hero who has:
- **Mastered physical combat** (high total Skill Tier Points)
- **Completed their first full magic circle** (Core + Ring 1 = Tier 7)

...can perform a ritual to **inscribe a magic circle onto their own flesh**. This circle is not a spell in their Codex — it is **drawn directly on the hero's body**, a permanent fusion of muscle and magic.

Once inscribed:
- Every **physical skill attack** the hero uses is augmented by the circle's properties.
- The hero consumes **both Stamina AND MP** for every physical skill — the magic circle demands mana to activate.
- Fire Core → bonus fire damage on every strike.
- Multi-target glyphs → single-target skills can hit all enemies.
- Power glyphs (`++`) → the bonus scales dramatically.

> **Example:** A warrior with Multiple Attack ×13 uses it. Normally costs 45 STA. With a Fire Body Circle, costs **45 STA + 38 MP**. Each of the 13 hits gets +42 fire damage. If Multi-Target is inscribed, those 13 hits go to **all enemies**. One turn. Everything burns.

The hero effectively becomes a **living spell** — a bridge between muscle and mana. Powerful, but **doubly hungry for resources**.

---

## The Resource Duality

### Three Archetypes, Three Economies

| Archetype | Physical Skills Cost | Magic Spells Cost | Playstyle |
|-----------|---------------------|-------------------|-----------|
| **Pure Warrior** | Stamina only | Cannot cast | Simple, sustainable, consistent |
| **Pure Mage** | Basic attack only | MP only | Burst damage, resource-limited |
| **Hybrid (Inscribed)** | **Stamina + MP** | MP only | **Devastating but doubly taxed** |

> **The Hybrid Tax:** A hybrid hero's physical skills cost their normal Stamina cost **plus an additional MP cost** based on the Body Circle's potency. This is the price of wielding muscle and magic simultaneously.

### Hybrid MP Cost Formula

```
Base Hybrid MP Cost = 8
+ 2 per Potentiate glyph in the Body Circle
+ 5 if Multi-Target is present
+ 3 if Piercing is present
+ 2 if Lifesteal is present
+ 2 if Focus is present

Total MP Cost = Base Hybrid MP Cost × (1 + Magic Tier / 20)
```

**Example:** A Tier 7 Body Circle with `++`, `++`, `+`, Multi-Target, Piercing, Focus:
```
Base = 8 + 6 (3 Potentiate) + 5 (Multi) + 3 (Pierce) + 2 (Focus) = 24
Total = 24 × (1 + 7/20) = 24 × 1.35 = 32 MP per skill use
```

> A Tier 8 Flurry costs 29 Stamina + 32 MP = **61 total resources**. A pure warrior pays only 29. The hybrid pays **more than double** — but each of their 9 hits carries +33 fire damage and hits all enemies.

---

## Unlock Requirements

### Requirement 1: First Full Circle (Magic Threshold)

The hero must have **completed their first complementary magic circle**:
- Core slot filled (Tier 1)
- All 6 Ring 1 slots filled (Tiers 2–7)
- **Total Magic Tier: 7**

> **Why Tier 7?** Completing the first full circle represents true magical initiation. The hero understands not just individual Glyphs, but how they **interact in a circuit**. This is the minimum magical maturity required to safely fuse magic with flesh.

### Requirement 2: Skill Tier Points (Physical Threshold)

The hero must have accumulated **at least 12 Skill Tier Points** across all their learned techniques.

#### Skill Tier Point Calculation

| Formula | Points |
|---------|--------|
| **A skill at Tier N contributes (N + 1) points** | — |

**Examples:**

| Technique | Tier | Points |
|-----------|------|--------|
| Double Attack (Flurry) | Tier 4 | **5** (4 + 1) |
| Strong Attack (Devastation) | Tier 2 | **3** (2 + 1) |
| Shield Bash (Bulwark) | Tier 1 | **2** (1 + 1) |
| Tempest Blades (Tempest) | Tier 12 | **13** (12 + 1) |

**Full example hero:**

| Technique | Tier | Points |
|-----------|------|--------|
| Double Attack (Flurry) | Tier 4 | 5 |
| Strong Attack (Devastation) | Tier 2 | 3 |
| Shield Bash (Bulwark) | Tier 3 | 4 |
| **TOTAL** | | **12** |

> **Threshold: 12 Skill Tier Points.** With infinite tiers, a hero with one skill at Tier 11 (12 points) could technically qualify — but they'd be a one-trick pony. The system naturally rewards well-rounded warriors.

### The Unlock Moment

When both requirements are met:
1. The hero's portrait gains a **subtle arcane border shimmer**.
2. A new button appears: **"Inscribe Body Circle"**.
3. The Witch and Trainer have new dialogue.

> **The Witch:** *"You have woven your first full circle. And your body... it is strong enough to hold the weave. Few ever reach this threshold. Fewer still survive the inscription."*

> **The Trainer:** *"I've seen warriors. I've seen mages. You're something else now. Don't let the magic make you soft — and don't let the muscle make you dull."*

---

## The Inscription Ritual

### Step 1: Compose the Body Circle

The player clicks **"Inscribe Body Circle"** in the hero's detail panel.

This opens the **Body Circle Composer**:

| Magic Circle (Codex Spell) | Body Circle (Inscription) |
|---------------------------|---------------------------|
| Up to 25 slots (4 rings) | **Exactly 7 slots** (Core + Ring 1) |
| Can be swapped freely | **Permanent** — overwrite only |
| Costs MP per cast | **Passive** — always active |
| Cast as spell action | **Triggers on physical skill use** |
| Stored in spell list | **Drawn on the hero's body** |

### Step 2: Confirm Inscription

- Warning: *"This inscription is permanent. Overwriting destroys the old circle. The hero will be locked for 5 days."*
- Hero unavailable for 5 days.
- After 5 days, inscription complete.

### Step 3: Visual Feedback

- Combat sprite: faint glowing runes on body.
- Portrait: permanent arcane aura.
- Hero list: **✦** icon next to name.

---

## How Body Circle Effects Work

### Trigger Condition

The Body Circle triggers **every time the hero uses a physical skill**.

> **Not on basic attacks.** Only Technique Codex skills.

### Resource Consumption

When a hybrid uses a physical skill:
- **Stamina:** Normal skill cost (unchanged).
- **MP:** Additional Hybrid MP Cost (calculated from Body Circle composition).
- If either resource is insufficient, the skill cannot be used.

> **The hybrid must manage both bars.** A warrior can spam skills every turn. A hybrid must pace themselves — or bring MP potions.

### Effect Resolution

#### Core Glyph → Elemental Infusion

| Core Glyph | Bonus Effect per Hit |
|-----------|---------------------|
| **Fire Core** | +X fire damage |
| **Ice Core** | +X ice damage, slow chance |
| **Lightning Core** | +X lightning, chain adjacent |
| **Earth Core** | +X earth, armor shred |
| **Wind Core** | +X wind, evasion buff self |
| **Void Core** | +X void, lifesteal |

> **X = 10 × (1 + sum of Potentiate bonuses) × (1 + Magic Tier / 10)**

#### Ring Glyphs → Modifier Stack

| Glyph Type | Effect |
|-----------|--------|
| **Potentiate (`+`)** | +15% elemental damage |
| **Potentiate (`++`)** | +40% elemental damage |
| **Potentiate (`+++`)** | +80% elemental damage |
| **Potentiate (`✦`)** | +150% elemental damage |
| **Multi-Target** | Single-target → hits all enemies (÷1.5 damage) |
| **Piercing** | Ignore 20% armor |
| **Lifesteal** | Heal 5% of damage |
| **Focus** | +10% crit chance |

### Multi-Target Transformation

| Original Skill | With Multi-Target |
|---------------|------------------|
| Double Attack (2 hits, 1 target) | 2 hits on **all enemies** |
| ×13 Flurry (13 hits, 1 target) | 13 hits on **all enemies** |
| Power Blow (1 hit, 1 target) | 1 hit on **all enemies** |
| Cleave (1 hit, 2 adjacent) | 1 hit on **all enemies** |

> **Damage per hit ÷1.5** when Multi-Target activates. Against 3+ enemies, total damage still increases.

---

## Tactical Examples

### Example 1: The Infernal Duelist (Mid-Game Hybrid)

**Hero:** Level 45, Speed build. Multiple Attack ×7 (Tier 6) + Body Inscription.

**Body Circle:**
- Core: Fire Core
- Ring: `++`, `++`, `+`, Multi-Target, Focus, Focus

**Resource Cost:**
- Stamina: 8 + (6 × 3) = **26 STA**
- MP: Base 8 + 6 + 5 + 2 + 2 = 23 × 1.35 = **31 MP**
- Total: **57 resources per use**

**Damage:**
- 7 hits × all enemies
- Each hit: physical + 33 fire
- Against 3 enemies: 21 hits total

> This hero can clear a wave in one turn — but can only do it 2-3 times before running dry on both resources.

### Example 2: The God-Tier Paladin (Late Game)

**Hero:** Level 280, balanced build. Multiple Attack ×13 (Tier 12) + Tier 9 Body Circle.

**Body Circle:**
- Core: Void Core
- Ring: `✦`, `+++`, `++`, `++`, Multi-Target, Lifesteal

**Resource Cost:**
- Stamina: 8 + (12 × 3) = **44 STA**
- MP: Base 8 + 10 + 5 + 2 = 25 × 1.45 = **36 MP**
- Total: **80 resources per use**

**Damage:**
- 13 hits × all enemies
- Each hit: physical + 95 void damage + lifesteal
- Against 5 enemies: 65 hits total

> This is the fantasy. A level 300 hero who has played for months. One turn, one skill, everything dies. But it cost **80 resources** — the hero is exhausted after 2-3 uses.

---

## Comparison: Three Archetypes in Combat

| | Pure Warrior | Pure Mage | Hybrid (Inscribed) |
|---|---|---|---|
| **Resources** | Stamina only | MP only | **Both** |
| **Sustainability** | High (stamina regens fast) | Medium (MP limited) | **Low** (both drain) |
| **Burst potential** | Medium (scales with tier) | High (spell composition) | **Extreme** (skill + magic) |
| **Best for** | Long fights, consistency | Control, healing, AoE burst | **Deleting waves** |
| **Weakness** | No magic utility | Physically weak, MP runs out | **Resource-hungry** |
| **Typical turn** | Skill → Skill → Skill → Basic | Spell → Spell → Conserve | **Skill (expensive)** → Conserve → Skill |

---

## The First Mage Hero

The **second hero** recruited after Arthur **must be a mage template**:

| | Arthur (Starter) | Second Hero (Mage) |
|---|---|---|
| **Role** | Physical / skill system intro | Magic system intro |
| **Stats** | Balanced STR/DEF, decent SPD | High MAG, moderate SPD, low STR |
| **Resource** | Stamina | MP |
| **Starting ability** | Basic Attack + Double Attack | Basic Attack + Spark Glyph |
| **System intro** | Physical skills, Trainer | Magic Circle, Witch |

### Mage Template: "Elara"

```
Name: Elara
Origin: arcane_initiate
STR: 4, DEF: 5, SPD: 7, MAG: 12
HP: 65, MP: 40, Stamina: 20

Starting Glyphs:
- Spark (fire Core Glyph)
- Kindle (fire Ring Glyph)

Magic Tier: 2
Skill Slots: 0 (level 1)
```

> Elara teaches the player magic. Her low stamina means she can't fight physically — she MUST use spells. Later, she can become a hybrid if the player invests in both systems.

---

## UI Considerations

### Combat Action Bar (Hybrid Hero)

```
┌─ Action Bar ─────────────────────────────┐
│ [Basic] [×7 Flurry] [Power Blow] [Item]  │
│     0 STA    23 STA      18 STA          │
│              +31 MP      +28 MP          │
│              [████████░░] stamina          │
│              [██████░░░░] MP               │
└──────────────────────────────────────────┘
```

> Hybrid skills show **both costs**: yellow for Stamina, blue for MP. If either bar is insufficient, the button is grayed out.

### Hero Detail Panel

```
┌─ Body Inscription ─────────────────────┐
│  [Core: Fire]  [++] [++] [Multi]       │
│  [+] [Pierce] [Focus]                  │
│                                        │
│  Bonus: +33 fire dmg/hit               │
│  Multi-Target: ON                      │
│  Hybrid MP Cost: +31 per skill         │
│                                        │
│  [🔄 Overwrite Inscription]            │
└────────────────────────────────────────┘
```

### Combat Feedback

When a hybrid uses an inscribed skill:
- Damage numbers: **white** (physical) + **elemental color** (magic).
- Rune circle **briefly glows** around hero sprite.
- Combat log: *"Arthur's Multiple Attack ×7 channels the Fire Circle — 7 strikes engulf all enemies."*

---

## Balancing

| Concern | Mitigation |
|---------|-----------|
| **Too powerful** | Requires Tier 7 magic + 12 skill points. Very late game. |
| **Double resource = too punishing?** | Yes — that's the point. Hybrids are burst-only. Pure warriors outlast them. |
| **Makes pure classes obsolete** | Pure mage: 25-slot spells. Pure warrior: infinite stamina. Hybrid: 7-slot passive only. Each has a niche. |
| **Multi-Target ×13 Flurry = broken** | ÷1.5 penalty + 41 STA + 36 MP per use = 2-3 uses max. |
| **One hero dominates** | 12-point threshold + Tier 7 magic = maybe 1-2 heroes per playthrough. |

---

## Open Questions

1. **Should there be a "Battle Meditation" skill?** A non-damage skill that restores both STA and MP slowly?
2. **MP potions in combat:** Should consumables restore MP? This becomes critical for hybrids.
3. **Should the Body Circle's MP cost scale with the physical skill's tier?** E.g., a Tier 12 skill costs more MP than a Tier 3?
4. **Unique title for inscribed heroes?** "Arcane Blademaster", "Spell-Fist", "Rune-Warrior"?
