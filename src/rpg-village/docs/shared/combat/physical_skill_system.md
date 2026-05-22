# Physical Skill System Specification

## Overview

Physical skills scale **infinitely** through hidden usage. No fancy names — just **×2, ×3, ×4...** A level 300 warrior's "Multiple Attack" might be **×13**. Simple. Brutal. Effective.

> **Status:** Brainstorming / Design Phase — Not yet implemented.  
> **Related Docs:** [Magic Circle System](magic_circle_system.md), [Hybrid Body Inscription](hybrid_body_inscription.md)

---

## Core Philosophy

### Physical Must Compete With Magic

A level 300 mage with 25 Glyph slots casts world-ending spells. A level 300 warrior with Tier 12 "Multiple Attack" hits **13 times in one turn**. Both should feel godlike.

| | Physical | Magic |
|---|---|---|
| **Resource** | **Stamina** (recovers fast) | **MP** (limited, slow regen) |
| **Scaling** | Infinite tiers via usage | 25 slots, Glyph mastery |
| **Style** | Sustained violence | Burst + utility |
| **Endgame** | ×13 attack, 0 cooldown | 25-slot apocalypse spell |

> **Neither is better.** Physical grinds forever. Magic explodes then rests. Both kill everything.

---

## Skill Slots & Level Milestones

**Skill Slots** unlock at fixed levels. When a slot opens, pick a **skill family**.

| Slot | Level | In-Game Moment |
|------|-------|---------------|
| 1 | 5 | *"The hero's body has hardened enough to learn a true technique."* |
| 2 | 10 | *"A second path opens."* |
| 3 | 15 | *"Three disciplines."* |
| 4 | 20 | *"Muscle memory is exceptional."* |
| 5 | 25 | *"Approaching mastery."* |
| 6 | 30 | *"Six paths. Legend."* |

> **Max 6 families per hero.** Hard choices. Specialization matters.

### Learning a Family

When a slot opens:
1. Visit **Training Grounds**.
2. Pick hero + empty slot.
3. Choose a **family** from the pool.
4. Hero knows it at **×2 (Tier 1)**.

---

## Skill Families

Each family is a **single concept** that scales infinitely. The name never changes. Only the multiplier grows.

| Family | Tier 1 Effect | Scaling Philosophy |
|--------|-------------|-------------------|
| **Multiple Attack** | 2 hits, 0.70× STR each | **+1 hit per tier.** Damage/hit decreases slightly. Total damage grows slowly but efficiently. |
| **Power Strike** | 1 hit, 1.5× STR | **+0.3× STR per tier.** The warrior's "nuke." Still efficient. |
| **Shield Bash** | 1 hit, 0.8× STR + stun chance | Better stun chance, slightly more damage. Control focus. |
| **Poison Strike** | 1 hit, 0.6× STR + poison | Poison damage scales. DoT efficiency. |
| **Cleave** | 1 hit, 0.75× STR, 2 adjacent | More targets at higher tiers. AoE efficiency. |

> **Physical does NOT try to match magic burst.** A Tier 12 Multiple Attack does ~3.5× total STR. A 25-slot mage spell does ~15× MAG. But the warrior can attack 10× more often. **Efficiency wins the marathon.**

---

## Infinite Tiers

### Exponential Cost

| To Reach Tier | Uses Required | What It Means |
|--------------|---------------|---------------|
| 2 (×3) | ~100 | A few battles |
| 3 (×4) | ~400 | Several expeditions |
| 5 (×6) | ~4,000 | Main skill for a chapter |
| 7 (×8) | ~36,000 | Mastery |
| 10 (×11) | ~1,000,000 | Mythic |
| 12 (×13) | ~9,000,000 | Level 300 life's work |
| 15 (×16) | ~243,000,000 | Probably unreachable |

> **Formula:** Tier N requires `100 × 3^(N-2)` uses. Tier 12 is months. Tier 20 is fiction.

### Tier Unlocks Automatically

- The player **never sees the counter**.
- After a battle, the skill might silently upgrade.
- Next time they open the skills menu, "×7" became "×8".
- No notification. No fanfare. Just muscle memory deepening.

---

## Combat UI: The Submenu System

### Hero Turn Flow

```
┌─ Hero Turn ───────────────────────────┐
│ [Attack] [Skills] [Magic] [Item] [Flee]│
└───────────────────────────────────────┘

→ Tap [Skills]

┌─ Skills Menu ─────────────────────────┐
│ [Multiple Attack] [Power Strike]       │
│ [Shield Bash]     [Cleave]            │
│ [Poison Strike]   [— Empty —]          │
└───────────────────────────────────────┘

→ Tap [Multiple Attack]

┌─ Multiple Attack ─────────────────────┐
│ [×13]  ← Most Powerful (highest tier) │
│ [...]  ← All tiers in between         │
│ [×2]   ← Weakest (base, conserve STA) │
└───────────────────────────────────────┘

→ Tap [...]

┌─ All Tiers ───────────────────────────┐
│ [×13] [×12] [×11] [×10] [×9]         │
│ [×8]  [×7]  [×6]  [×5]  [×4]         │
│ [×3]  [×2]                           │
└───────────────────────────────────────┘
```

### The Three Quick Slots (Alternative / Future)

Instead of submenus, dedicate **3 skill buttons** in combat:

| Slot | Default | Behavior |
|------|---------|----------|
| **Left** | Most Used tier | The tier this hero uses most often (auto-detected) |
| **Center** | Most Powerful | Highest unlocked tier |
| **Right** | Weakest | ×2, for conserving stamina |

> **Start with the submenu system.** The 3-slot shortcut is a quality-of-life upgrade for later.

### Stamina Display

Each tier shows its **Stamina cost**:

```
┌─ Multiple Attack ─────────────────────┐
│ [×13]        45 STA                  │
│ [...]                                │
│ [×2]          8 STA                  │
└───────────────────────────────────────┘
```

> Grayed out if insufficient stamina.

---

## Stamina System

Physical skills cost **Stamina**, not MP.

| Aspect | Value |
|--------|-------|
| **Max Stamina** | `STR × 3 + DEF × 2 + Level × 2` |
| **Regen per turn** | `Max × 8%` |
| **Between battles** | Full restore |
| **At village** | Full restore |

### Stamina Cost Formula

```
Base Cost = 8
+ (Tier × 3) for Multiple Attack
+ (Tier × 4) for Power Strike
+ (Tier × 3) for Shield Bash
+ (Tier × 2) for Poison Strike
+ (Tier × 4) for Cleave
```

**Example:** Tier 6 Multiple Attack = 8 + (6 × 3) = **26 STA**.

> **Basic Attack costs 0 STA.** Always available as fallback.

---

## Skill Tier Points (for Hybrid Unlock)

Used for [Body Inscription](hybrid_body_inscription.md).

| Formula | Points |
|---------|--------|
| **Skill at Tier N = (N + 1) points** | — |

| Example | Tier | Points |
|---------|------|--------|
| Multiple Attack | Tier 4 | **5** (4 + 1) |
| Power Strike | Tier 2 | **3** (2 + 1) |
| Shield Bash | Tier 12 | **13** (12 + 1) |

**Hybrid threshold: 12 points.**

---

## The Trainer

At **Training Grounds**. Gruff. Honest. No numbers.

### Dialogue Examples

**Far from next tier:**
> *"Your form is sloppy. You swing like you're chopping wood."*

**Approaching:**
> *"Your Multiple Attack is getting sharper. Something's coming."*

**Just evolved:**
> *"Your technique changed. The body learns before the mind."*

**High tier (Tier 8+):**
> *"I've trained champions. I've never seen a technique pushed this far. You're a weapon with a heartbeat."*

**Underused skill:**
> *"You learned Poison Strike but never use it. Commit or forget it."*

---

## Technique Codex

Max 6 families. Unlimited tiers per family.

- **Retrain:** Replace a family at the Trainer. Resets tier to 1.
- **Cost:** Gold + 3 days locked.

---

## Migration from Old System

| Old Skill | Becomes |
|-----------|---------|
| `basic_attack` | Retained (0 STA, always available) |
| `double_attack` | Multiple Attack, Tier 1 (×2) |
| `triple_attack` | Multiple Attack, Tier 2 (×3) |
| `power_blow` | Power Strike, Tier 1 (×1.5) |
| `shield_bash` | Shield Bash, Tier 1 (×0.8) |
| `poison_dart` | Poison Strike, Tier 1 (×0.6) |
| `whirlwind` | Cleave, Tier 2 (×0.7, all enemies) |
| Magic skills | Removed → migrate to Magic Circle |

---

## Comparison: Physical vs. Magic (Endgame)

| | Level 300 Warrior | Level 300 Mage |
|---|---|---|
| **Signature** | Multiple Attack ×13 (13 hits) | 25-slot annihilation spell |
| **Resource** | Stamina (spammable) | MP (limited) |
| **Sustain** | ♾️ Infinite turns | ⚠️ 3-4 big spells |
| **Burst** | 13 × 0.4× STR = 5.2× STR total | 15× MAG in one nuke |
| **Feel** | *"I am the storm."* | *"I am the apocalypse."* |

> **Both kill everything.** The warrior grinds. The mage explodes. Pick your god.

---

## Open Questions

1. **Should basic attack cost 0 STA?** Or a small amount (2-3)?
2. **Stamina potions?** Consumables mid-combat?
3. **Should the [...] submenu show ALL tiers or paginate?** A Tier 12 hero has 12 buttons — manageable?
4. **Damage per hit scaling:** Uses diminishing returns. Total damage grows, but efficiency (dmg/STA) slowly decreases. This makes high tiers feel powerful without being strictly better in all situations.

### Damage Scaling Table (Multiple Attack)

| Tier | Hits | Dmg/Hit | Total Multiplier | STA Cost | Dmg/STA |
|------|------|---------|-----------------|----------|---------|
| 1 (×2) | 2 | 0.70× STR | 1.40× | 10 | 0.140× |
| 3 (×4) | 4 | 0.55× STR | 2.20× | 18 | 0.122× |
| 7 (×8) | 8 | 0.38× STR | 3.04× | 34 | 0.089× |
| 12 (×13) | 13 | 0.27× STR | 3.51× | 54 | 0.065× |

> **The warrior chooses each turn:** "×13 (big, expensive) or ×4 (small, cheap)?" Both are valid. Efficiency vs. burst — within the same skill.
