# Implementation Master Plan v2

> **Branch:** `app/project-rpg-village-phase0`  
> **Goal:** Finish stamina + implement all systems. 13 phases, 13 commits.  
> **Rule:** Each commit = full release (engine + i18n + UI + CSS + tests + build). Retrocompatible.

---

## Step 0: Finish Stamina (CLOSE THIS FIRST)

**Status:** Engine + translations done. Missing: presentation + CSS + tests.

| Layer | Status | Missing |
|-------|--------|---------|
| Engine | ✅ | Hero.js, GameConstants.js, BattleService.js |
| Translations | ✅ | All 5 languages |
| Presentation | ❌ | HeroesView.js stamina display |
| CSS | ❌ | Stamina row color, bar styling |
| Tests | ❌ | Stamina calculation, combat deduction |
| Build | ❌ | `make local-build` + `node --test` |

**Commit:** `feat: stamina system complete`

---

## Step 1: Navigation Redesign

**Problem:** 6+ pages in bottom bar = unusable.

**Solution:** **4 categories** with sub-pages. Village always first.

```
Bottom Nav (always visible):
[🏘️ Village] [👥 Heroes] [⚔️ Adventure] [⚙️ Town]

Click [👥 Heroes]:
┌─ Heroes ─────────────────────┐
│ [← Back to main]             │
│                              │
│ [⚔️ Hero Roster]             │
│ [🏆 Hall of Fame]            │
│ [🎓 Training Grounds]        │
│ [📚 Academy]                 │
│ [🔮 Witch's Hut]             │
└──────────────────────────────┘

Click [⚔️ Adventure]:
┌─ Adventure ──────────────────┐
│ [← Back to main]             │
│                              │
│ [🗺️ Expeditions]             │
│ [📋 Bestiary]                │
│ [🏟️ Arena] (future)          │
└──────────────────────────────┘

Click [⚙️ Town]:
┌─ Town ───────────────────────┐
│ [← Back to main]             │
│                              │
│ [🛒 Shop]                    │
│ [📦 Inventory]               │
│ [⚙️ Settings]                │
└──────────────────────────────┘
```

**Why this grouping:**
- **Village** = default view. Buildings still clickable on canvas.
- **Heroes** = everything hero-related (roster, fame, training, academy, witch)
- **Adventure** = everything expedition/combat-related
- **Town** = services (shop, items, settings)

**Files:** `index.html`, `Navigation.js`, `style.css`

**Commit:** `feat: category-based navigation with sub-pages`

---

## Step 2: Skill Slot System

**Spec:** `physical_skill_system.md` — 6 slots at Lv.5/10/15/20/25/30. No SP.

| Layer | What |
|-------|------|
| Engine | `Hero.js` — remove SP, add `skillSlots[6]`, `techniques[]` |
| Engine | `HeroService.js` — `assignSkillSlot()`, `unassignSkillSlot()` |
| Engine | `GameConstants.js` — `TECHNIQUE_FAMILIES` |
| i18n | `slot_unlocked_at`, `family_*`, `error_slot_locked` |
| UI | HeroesView — 6 slot circles (locked/unlocked/assigned) |
| CSS | `.skill-slot` styles |
| Tests | Slot unlock, assignment, save migration |
| Retro | Old `skills` → `techniques` + `skillSlots` on load |

**Commit:** `feat: skill slot system replaces SP`

---

## Step 3: Technique Families + Combat

**Spec:** `physical_skill_system.md` — 5 families, stamina costs, submenu UI.

| Layer | What |
|-------|------|
| Engine | `GameConstants.js` — family definitions with `staminaCost` |
| Engine | `BattleService.js` — physical costs STA, magic costs MP |
| Engine | `CombatCalculator.js` — family damage formula |
| Engine | `CombatAI.js` — use families, check stamina |
| i18n | `family_*`, `error_not_enough_stamina` |
| UI | `CombatView.js` — Skills button → family submenu → tier selection |
| CSS | Combat submenu styles |
| Tests | Each family damage, stamina deduction, magic unaffected |
| Retro | Old skill IDs map to family + tier |

**Commit:** `feat: technique families with tier selection in combat`

---

## Step 4: Tavern Building

**Spec:** `roadmap.md` — auto-recruits heroes every 5-7 days.

| Layer | What |
|-------|------|
| Engine | `VillageService.js` — `tavern` infrastructure, daily recruitment roll |
| Engine | `HeroService.js` — `generateRandomHero()` |
| Engine | `GameEngine.js` — wire into `nextDay()` |
| i18n | `building_tavern`, `new_hero_arrived` |
| UI | VillageView — Tavern widget + recruitment alert |
| CSS | Tavern widget |
| Tests | Recruitment chance, hero generation |
| Retro | New saves get tavern Lv.0 |

**Commit:** `feat: tavern building auto-recruits heroes`

---

## Step 5: Infinite Tier Engine

**Spec:** `physical_skill_system.md` — hidden usage, auto-evolution.

| Layer | What |
|-------|------|
| Engine | `Hero.js` — `technique.uses++`, threshold check, silent evolve |
| Engine | `BattleService.js` — increment counter on skill use |
| i18n | Optional: `technique_evolved` notification |
| UI | Combat brief flash on evolution (optional) |
| Tests | Threshold at 100/400/1300 uses, evolution, naming update |
| Retro | Old skill levels → technique tiers + estimated uses |

**Commit:** `feat: infinite tier engine — hidden usage, auto-evolution`

---

## Step 6: Trainer NPC

**Spec:** `physical_skill_system.md` — gruff hints at Training Grounds.

| Layer | What |
|-------|------|
| Engine | `TrainerService.js` — dialogue generation by progress category |
| i18n | 20+ trainer lines (far/approaching/near/evolved/high-tier) |
| UI | Heroes category → Training Grounds → dialogue modal |
| CSS | Trainer dialogue box (gruff military theme) |
| Tests | Category selection based on progress |
| Retro | None — new system |

**Commit:** `feat: trainer npc with progress hints`

---

## Step 7: First Mage Hero (Elara)

**Spec:** `magic_circle_system_v2.md` — mage origin template.

| Layer | What |
|-------|------|
| Engine | `GameConstants.js` — `origin_arcane_initiate` (high MAG, low STR) |
| Engine | `HeroService.js` — generation supports mage origin |
| Engine | `Tavern` — can generate mage heroes |
| i18n | `origin_arcane_initiate`, `origin_arcane_initiate_desc` |
| UI | HeroesView — show origin-specific traits |
| Tests | Mage generation, stat distribution |
| Retro | None — new content |

**Commit:** `feat: mage origin and arcane heroes`

---

## Step 8: Magic Circle System

**Spec:** `magic_circle_system_v2.md` — Core + Ring, tiered Glyphs, cost puzzle.

| Layer | What |
|-------|------|
| Engine | `Hero.js` — `magicTier`, `glyphRepertoire[]`, `spellCodex[]` |
| Engine | `MagicCircleService.js` — compose, cost formula, inscribe |
| Engine | `GameConstants.js` — `GLYPH_DATA` (all types, all tiers, cost multipliers) |
| Engine | `BattleService.js` — cast spell from Codex |
| i18n | 50+ glyph names, spell terms, circle terms |
| UI | Heroes category → Magic Circle tab (mages only) → composer |
| CSS | Circle canvas, slot styling, glyph palette, MP budget bar |
| Tests | Cost formula, composition, casting, tier unlocks |
| Retro | Old magic skills → Glyph Tablets in inventory |

**Commit:** `feat: magic circle system with cost puzzle`

---

## Step 9: Witch's Hut

**Spec:** `magic_circle_system_v2.md` — vague mystical hints.

| Layer | What |
|-------|------|
| Engine | `WitchService.js` — dialogue generation |
| i18n | 15+ witch dialogue lines |
| UI | Heroes category → Witch's Hut → dialogue modal |
| CSS | Witch dialogue (mystical ethereal theme) |
| Tests | Dialogue categories |
| Retro | None — new system |

**Commit:** `feat: witch npc with magic hints`

---

## Step 10: Glyph Academy

**Spec:** `magic_circle_system_v2.md` — teaching + Design Library.

| Layer | What |
|-------|------|
| Engine | `AcademyService.js` — sessions, design library, copy logic |
| Engine | `VillageService.js` — Academy building levels |
| i18n | Academy terms, teaching terms, design library terms |
| UI | Heroes category → Academy → [Teach Glyphs] [Design Library] tabs |
| CSS | Session cards, design cards, copy flow |
| Tests | Teaching duration, design copy, prerequisites |
| Retro | None — new system |

**Commit:** `feat: glyph academy with teaching and design library`

---

## Step 11: Hall of Fame

**Spec:** `hall_of_fame.md` — lifetime stats, titles.

| Layer | What |
|-------|------|
| Engine | `Hero.js` — `lifetimeStats` object |
| Engine | `BattleService.js` — increment combat stats |
| Engine | `ExpeditionService.js` — increment expedition stats |
| Engine | `TitleService.js` — check requirements, assign titles |
| i18n | 20+ title names |
| UI | Heroes category → Hall of Fame → hero cards + comparison |
| CSS | Hall page, title badges, stat grids |
| Tests | Stat tracking, title assignment thresholds |
| Retro | New saves get empty lifetimeStats (backfill on first events) |

**Commit:** `feat: hall of fame with lifetime stats and titles`

---

## Step 12: Body Inscription

**Spec:** `hybrid_body_inscription.md` — 7-slot permanent, double resource.

| Layer | What |
|-------|------|
| Engine | `Hero.js` — `bodyInscription` (7-slot composition) |
| Engine | `MagicCircleService.js` — body circle composer (7 slots, Core+Ring1 only) |
| Engine | `BattleService.js` — physical skills cost STA + MP when inscribed |
| i18n | Inscription terms, ritual terms |
| UI | Hero detail → "Inscribe Body Circle" button (if eligible) |
| CSS | Inscribed hero aura, rune glow |
| Tests | Unlock requirements (12 skill points + Tier 7 magic), double cost |
| Retro | None — late-game system |

**Commit:** `feat: hybrid body inscription system`

---

## Step 13: Gambit System (LAST)

**Spec:** `gambit_system.md` — condition → action → target. Automates EVERYTHING.

| Layer | What |
|-------|------|
| Engine | `Hero.js` — `gambits[]` (max 6 slots, level-gated) |
| Engine | `GambitService.js` — rule evaluation, priority system |
| Engine | `CombatAI.js` — full gambit evaluation replaces dumb AI |
| i18n | Gambit terms, conditions, actions, targets |
| UI | Hero detail → "Gambits" tab → rule builder |
| CSS | Rule builder, priority reordering, condition dropdowns |
| Tests | Rule matching, priority order, fallback behavior |
| Retro | New saves get empty gambits (unlocked at Lv.5) |

**Commit:** `feat: gambit system for hero automation`

---

## Phase Summary (Final Order)

| Phase | System | Commit | Depends On |
|-------|--------|--------|-----------|
| **0** | **Stamina** (finish) | `feat: stamina system complete` | — |
| **1** | **Navigation** | `feat: category-based navigation` | Phase 0 |
| **2** | **Skill Slots** | `feat: skill slot system` | Phase 0 |
| **3** | **Technique Families** | `feat: technique families` | Phase 2 |
| **4** | **Tavern** | `feat: tavern auto-recruit` | — |
| **5** | **Infinite Tiers** | `feat: infinite tier engine` | Phase 3 |
| **6** | **Trainer** | `feat: trainer npc` | Phase 5 |
| **7** | **Mage Origin** | `feat: mage origin` | — |
| **8** | **Magic Circle** | `feat: magic circle` | Phase 7 |
| **9** | **Witch** | `feat: witch npc` | Phase 8 |
| **10** | **Academy** | `feat: glyph academy` | Phase 8 |
| **11** | **Hall of Fame** | `feat: hall of fame` | Phase 3, 5 |
| **12** | **Body Inscription** | `feat: body inscription` | Phase 3, 8 |
| **13** | **Gambits** | `feat: gambit system` | ALL ABOVE |

---

## Rules (Non-Negotiable)

1. **Each commit = full release.** Engine + i18n + UI + CSS + tests + build. All passing.
2. **Retrocompatible.** Old saves load. Missing fields get sensible defaults.
3. **No broken states.** If I break something, I fix it before committing.
4. **Gambits LAST.** They automate everything, so they come after everything.
5. **i18n every phase.** All 5 languages, every commit.
