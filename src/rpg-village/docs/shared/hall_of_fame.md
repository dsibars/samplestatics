# Hall of Fame

> **A living record of your heroes' journeys.** Not for retired legends — for the heroes fighting right now.

---

## Core Concept

Every hero accumulates **lifetime stats** across all battles and expeditions. The Hall of Fame displays these stats, awards **titles** based on achievements, and lets players compare heroes.

**Why it fits the rules:**
- ✅ **Easy to add:** Just aggregate existing data. No new mechanics.
- ✅ **Early-game relevant:** Arthur gets his first title at Level 5. Immediate dopamine.
- ✅ **Simple UI:** One page, hero cards, stats grids.

---

## Tracked Stats (Per Hero)

### Combat Stats

| Stat | What It Tracks |
|------|---------------|
| **Battles Won** | Total victories |
| **Battles Lost** | Total defeats |
| **Enemies Defeated** | Kill count |
| **Total Damage Dealt** | Cumulative damage |
| **Total Healing Done** | Cumulative heals (support mages) |
| **Highest Single Hit** | Biggest damage number |
| **Critical Hits** | Number of crits |
| **Times KO'd** | How often they died |

### Expedition Stats

| Stat | What It Tracks |
|------|---------------|
| **Expeditions Completed** | Successful runs |
| **Expeditions Failed** | Failed runs |
| **Stages Cleared** | Total stages beaten |
| **Regions Explored** | Unique regions visited |
| **Loot Found** | Items acquired |
| **Gold Earned** | Total gold from expeditions |

### Skill/Magic Stats

| Stat | What It Tracks |
|------|---------------|
| **Most Used Skill** | Which skill they used most |
| **Skill Casts** | Total ability uses |
| **Spell Casts** | Total spell casts (mages) |
| **Highest Tier Skill** | Their max skill tier (e.g., ×7) |
| **Highest Tier Spell** | Their most powerful spell composition |
| **Unique Spells Created** | Number of custom spells (mages) |
| **Glyphs Mastered** | Number of `✦` tier Glyphs |

### Village Stats

| Stat | What It Tracks |
|------|---------------|
| **Days Active** | How long they've been in the roster |
| **Training Sessions** | Days spent in Academy/Training Grounds |
| **Defenses Participated** | Village defenses fought |

---

## Titles (Merit-Based)

Titles are earned automatically when a hero meets criteria. Displayed next to their name everywhere.

### Level Titles

| Requirement | Title |
|-------------|-------|
| Level 5 | *"the Recruit"* |
| Level 15 | *"the Veteran"* |
| Level 30 | *"the Champion"* |
| Level 50 | *"the Legend"* |
| Level 100 | *"the Immortal"* |

### Combat Titles

| Requirement | Title |
|-------------|-------|
| 100 enemies defeated | *"the Slayer"* |
| 1,000 enemies defeated | *"the Reaper"* |
| 10,000 enemies defeated | *"Death Incarnate"* |
| 100,000 total damage | *"the Destroyer"* |
| 1,000,000 total damage | *"the Cataclysm"* |
| 50 battles without KO | *"the Untouchable"* |
| 100 crits landed | *"the Precise"* |

### Skill Titles

| Requirement | Title |
|-------------|-------|
| Skill Tier 5 reached | *"the Disciplined"* |
| Skill Tier 10 reached | *"the Master"* |
| Skill Tier 15 reached | *"the Transcendent"* |
| 5,000 skill casts | *"the Relentless"* |
| Created 10 spells | *"the Spellweaver"* (mages) |
| 5 Glyphs at `✦` tier | *"the Archmage"* (mages) |

### Expedition Titles

| Requirement | Title |
|-------------|-------|
| 10 expeditions completed | *"the Explorer"* |
| 50 expeditions completed | *"the Pathfinder"* |
| 100 stages cleared | *"the Pioneer"* |
| 7 regions visited | *"the Wanderer"* |
| 0 failed expeditions (min 20) | *"the Flawless"* |

### Hybrid Titles

| Requirement | Title |
|-------------|-------|
| Body Inscription unlocked | *"the Inscribed"* |
| 100 kills with inscribed skills | *"the Living Spell"* |

---

## Hall of Fame UI

### Page Layout

```
┌─ Hall of Fame ───────────────────────────────────┐
│ [🏆 Hall of Fame] [📊 Comparisons]                │
│                                                    │
│ Arthur the Veteran — Slayer                        │
│ ┌─ Portrait ─┐  Battles: 47 won, 3 lost            │
│ │   [img]    │  Enemies: 312 defeated              │
│ │  Lv.18     │  Damage: 45,891 total               │
│ └────────────┘  Highest Hit: 1,247                │
│                 Most Used: Multiple Attack ×5      │
│                 Expeditions: 12 completed, 1 fail  │
│                 Title: *the Slayer*                │
│                                                    │
│ Elara the Spellweaver                              │
│ ┌─ Portrait ─┐  Battles: 38 won, 2 lost            │
│ │   [img]    │  Enemies: 189 defeated              │
│ │  Lv.16     │  Damage: 32,104 total               │
│ └────────────┘  Spells Cast: 1,247                │
│                 Unique Spells: 8                   │
│                 Highest: Meteor Strike (21 MP)     │
│                 Title: *the Spellweaver*           │
│                                                    │
│ [Compare Heroes ▼]                                 │
└────────────────────────────────────────────────────┘
```

### Comparison Mode

Select 2-4 heroes to compare side-by-side:

```
┌─ Compare Heroes ───────────────────────────────────┐
│          Arthur        Elara        Borin          │
│ Battles   47           38           29             │
│ Damage    45,891       32,104       28,445         │
│ Kills     312          189          156            │
│ Tier      ×5           —            ×3             │
│ Expeditions 12         10           8              │
│                                                    │
│ Winner: Arthur (most damage)                       │
└────────────────────────────────────────────────────┘
```

---

## Implementation

### Data Storage

Add a `lifetimeStats` object to each hero:

```javascript
this.lifetimeStats = data.lifetimeStats || {
    battlesWon: 0,
    battlesLost: 0,
    enemiesDefeated: 0,
    totalDamageDealt: 0,
    totalHealingDone: 0,
    highestSingleHit: 0,
    criticalHits: 0,
    timesKOd: 0,
    expeditionsCompleted: 0,
    expeditionsFailed: 0,
    stagesCleared: 0,
    goldEarned: 0,
    skillCasts: {},  // { multiple_attack: 450, power_strike: 120 }
    spellCasts: {},  // { meteor_strike: 89, ... }
    trainingDays: 0,
    defensesParticipated: 0
};
```

### Where Stats Update

| Event | Stat Updated |
|-------|-------------|
| Battle won | `battlesWon++`, `enemiesDefeated += count` |
| Battle lost | `battlesLost++` |
| Damage dealt | `totalDamageDealt += amount`, check `highestSingleHit` |
| Heal cast | `totalHealingDone += amount` |
| Crit landed | `criticalHits++` |
| Hero KO'd | `timesKOd++` |
| Skill used | `skillCasts[skillId]++` |
| Spell cast | `spellCasts[spellName]++` |
| Expedition complete | `expeditionsCompleted++`, `stagesCleared += count` |
| Expedition fail | `expeditionsFailed++` |
| Training finished | `trainingDays += days` |

### Title Assignment

Check after every battle/expedition:
```javascript
if (hero.lifetimeStats.enemiesDefeated >= 100 && !hero.hasTitle('the Slayer')) {
    hero.addTitle('the Slayer');
    // Notification: "Arthur has earned the title 'the Slayer'!"
}
```

---

## Why This Engages Early/Mid Game

| Stage | Hall of Fame Moment |
|-------|-------------------|
| **Day 1-5** | Arthur gets "the Recruit" at Level 5. First dopamine hit. |
| **Day 10** | Arthur gets "the Slayer" at 100 kills. You see his journey. |
| **Day 20** | Elara gets "the Spellweaver" at 10 spells. Mage identity. |
| **Day 30** | Comparing Arthur vs Elara damage. Friendly rivalry. |
| **Day 50** | First "the Master" title at Tier 10 skill. Achievement. |
| **Day 100** | Full Hall of Fame. 20 heroes. Different titles. A tapestry. |

> **The Hall of Fame makes every hero feel like a protagonist.** Not just stats — a story.

---

## Open Questions

1. **Should titles give mechanical bonuses?** Or purely cosmetic? (I suggest cosmetic to keep it simple.)
2. **Should there be a "Hero of the Week"?** Auto-highlight the hero with most progress this week?
3. **Export/share?** "Arthur the Slayer — 312 kills, 45k damage" shareable text?
