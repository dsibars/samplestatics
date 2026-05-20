# Kimi AI — RPG Village Context & Roadmap

> **Purpose**: This file serves as the "session memory" for Kimi AI when working on RPG Village.  
> **Rule**: Read this file at the start of every new session. It contains the architecture, conventions, current state, known gaps, and the prioritized roadmap. Update it after every significant change.

---

## 1. Project Identity

**RPG Village** is a static, offline-first village management + hero progression game. It runs entirely in the browser with `localStorage` persistence. Built with Vanilla JS, bundled by Vite into a single-file HTML app.

- **Entry**: `src/rpg-village/index.html`
- **Built output**: `rpg-village.html` (root)
- **Branch**: `app/project-rpg-village`
- **Linked from Hub** ✅ (fixed 2026-05-20)

### Design Philosophy (CRITICAL — READ THIS)
> This is an **active game**, not an idle game. Time only advances when the player clicks "Next Day" (Civilization-style turns). There is no real-time ticking, no offline progress, no energy system.
>
> The game is intended to be **almost endless**. The expedition system is designed around "areas" (places near the village) that can be explored infinitely, with branching ramifications, multiple simultaneous expeditions, and progressive region unlocks.
>
> Village management and hero allocation are designed as **puzzles**: you have limited builders, limited heroes, and must make strategic choices about construction queues and expedition composition (1 hard expedition with 4 heroes vs. multiple small solo runs?).
>
> **Builders are generic villagers right now** — they can do any task. Specialization (farmer, miner, smith) is a **late-game iteration** (do NOT implement or spec this yet).
>
> **Hero interaction across expeditions** (e.g., heroes in the same area helping each other) is also a **future iteration**.
>
> **Take it slow.** Quality over quantity. A skeleton with 3 strong regions beats 15 empty regions. The user explicitly wants milestones, manual testing between commits, and a project that grows with love rather than exploding in scope.

---

## 2. Architecture (3-Layer)

```
┌─────────────────────────────────────────┐
│  Presentation (UI)                      │  js/presentation/ui/*View.js
│  - BaseView (event emitter + diffing)   │
│  - UIController (registers all views)   │
├─────────────────────────────────────────┤
│  Adapter                                │  js/presentation/adapters/EngineAdapter.js
│  - Wires UI events ↔ Engine             │
│  - Throttled RAF loop (~10 FPS)         │
│  - Auto-advances combat every 500ms     │
├─────────────────────────────────────────┤
│  Engine (Pure Logic)                    │  js/engine/
│  - GameEngine.js (facade)               │
│  - Domain services + models             │
│  - Persistence (localStorage)           │
│  - I18nService (5 languages)            │
└─────────────────────────────────────────┘
```

### Domains (Bounded Contexts)
| Domain | Key Files |
|--------|-----------|
| Village | `village/services/VillageService.js` |
| Heroes | `heroes/services/HeroService.js`, `heroes/models/Hero.js` |
| Combat | `shared/combat/services/BattleService.js`, `core/CombatCalculator.js`, `core/CombatAI.js`, `models/Enemy.js` |
| Inventory | `shared/inventory/services/InventoryService.js`, `models/Equipment.js` |
| Expeditions | `explore/services/ExpeditionService.js` |
| Core | `shared/core/Persistence.js`, `Result.js`, `i18n/` |

### Conventions
- **Spec-first**: Every major system has a markdown spec in `docs/`. Implementation must match spec.
- **Result pattern**: Engine methods return `{ success, data, error }`.
- **Smart diffing**: Views serialize relevant state; skip re-render if unchanged.
- **Mobile debounce**: Any tap/click popup handler must check `performance.now() - openTime < 300` to prevent double-tap.
- **Build**: `make build APP=rpg-village` (never run vite directly). Test: `make test-rpg-village`.

---

## 3. Current State (What's Working)

| System | Status | Notes |
|--------|--------|-------|
| Village buildings (7) | ✅ | housing, farm, warehouse, blacksmith, training_grounds, explorer_guild, infirmary |
| Day cycle | ✅ | Food consumption, farm production (+4 grain/level), growth, recovery, construction progress |
| Hero stats & equipment | ✅ | 6 slots, stat allocation, leveling (2-3 pts + 1 skill pt), portraits, origins |
| Inventory | ✅ | Materials, food, consumables, equipment. Storage enforced by warehouse level |
| Shop (buy/sell resources/sell items) | ✅ | Tier-gated by blacksmith. Consumables + gear. Resources tab. No affixes. |
| Forge (refine) | ✅ | +0 to +10, ×1.1 power per level. Material/gold costs scale by tier. |
| Turn-based combat | ✅ | Speed-based turns, 20+ skills, status effects (poison, burn, haste), consumables, auto-battle, enemy AI |
| Expeditions | 🟡 | Only `reg_greenfields` wired. Tutorial chain: `exp_tutorial_cave` → `exp_rescue_mission` (unlocks Sir Valen). Procedural nodes spawn after story missions. |
| i18n | ✅ | EN, ES, CA, EU, GL |
| Tests | 🟡 | 3 test files: BattleService, InventoryService, CombatFlow |

---

## 4. Known Gaps & Issues

### Functional Gaps
| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| 1 | **No Skill UI** | High | Heroes earn `skillPoints` but there's no interface to learn/upgrade skills. Skills DO work in combat (auto-assigned), but player has zero build expression. |
| 2 | **No Sell Resources** | Medium | ✅ **Implemented 2026-05-20**. |
| 3 | **No Sell Items** | Medium | ✅ **Implemented 2026-05-20**. |
| 4 | **Workers / Labor** | Medium | `population.assigned` exists but no worker entities, specializations, or assignment UI. **DO NOT implement yet** — this is a late-game feature once the skeleton is solid. |
| 5 | **Inert Buildings** | Medium | `explorer_guild` and `training_grounds` provide no gameplay effect. These are **next priority** after region unlocks. |
| 6 | **No Affix Generation** | Medium | Affixes (`vampire`, `phoenix`, `sage`, `titan`, `assassin`) coded in stat calc but never rolled. |
| 7 | **Only 1 Region Active** | Medium | `reg_tiny_cave`, `reg_calmed_beach` defined in data but unreachable. Other 12 regions exist only in docs. |
| 8 | **Enemy Level Scaling** | Medium | Spec says `Base * 1.1^(L-1)`; code uses flat base stats. Regions track `clears` but don't use them for scaling. |
| 9 | **Not in Hub** | Low | ✅ **Fixed 2026-05-20**. |
| 10 | **No Loot Drops** | Medium | Expedition rewards are deterministic wood/stone/gold. No equipment drops, no affix rolls, no "one more run" dopamine. |
| 11 | **Single Expedition** | Medium | Only 1 active expedition at a time. Concurrent expeditions are a planned puzzle mechanic but require architecture changes. |

### Code Quality Issues
| # | Issue | Location | Status |
|---|-------|----------|--------|
| 1 | **Combat UI monolith** | `UIController.js` has ~600 lines of inline combat HTML/CSS generation. Should be extracted to `CombatView.js` | 🔴 Open |
| 2 | **Duplicate owned-count logic** | `ShopView.js` repeats inventory+equipped matching logic | ✅ **Fixed 2026-05-20**. |
| 3 | **Missing equipment affixes in shop** | Shop gear is always "clean" — no `affixes` array | 🔴 Open |
| 4 | **Hard-coded prices in view** | Shop catalog prices live in `ShopView.js` instead of data/constants | ✅ **Fixed 2026-05-20**. |
| 5 | **Test coverage** | No tests for VillageService, ExpeditionService, UI views, building construction | 🔴 Open |
| 6 | **i18n completeness** | Some combat/log keys may fallback to English or raw keys in non-EN translations | 🔴 Open |
| 7 | **App description outdated** | `docs/app_description.md` still has placeholders for Hero System and Combat System | ✅ **Fixed 2026-05-20**. |

### Docs Issues
| # | Issue | Action |
|---|-------|--------|
| 1 | `app_description.md` has placeholders | ✅ **Fixed 2026-05-20** |
| 2 | No spec for "Sell Items" (equipment/consumables) | Create new spec or extend `shop_forge.md` |
| 3 | No spec for Skill UI | Create `docs/heroes/skill_ui.md` |
| 4 | No spec for Worker Assignment | Create `docs/village/workers.md` — **but defer implementation** |
| 5 | `roadmap.md` is vague brainstorming | Convert actionable items into this roadmap; keep truly vague ideas in roadmap |

---

## 5. The PM Vision & Strategic Framework

### Core Pillars (What Makes This Game)
1. **Village Management Puzzle** — Limited builders, construction queues, resource flow. Every "Next Day" is a strategic decision.
2. **Hero Progression Puzzle** — How do you allocate 4 heroes across expeditions? Solo grind vs. full-party gauntlet?
3. **Turn-Based Combat Depth** — Speed-based turns, elemental weaknesses, 24 skills, status effects, consumable tactics.
4. **Loot Dopamine** — Diablo-like affixes, material tiers, refinement. The "what if this drops with Vampire?" fantasy.
5. **Discovery & Endlessness** — Branching expedition trees, infinite procedural nodes, 15 themed regions.

### Power Curve Design (Implemented 2026-05-20)
This was the #1 game-feel problem. The old curve had Level 1 heroes with 1 STR doing 1 damage per hit to 25-HP boars. It felt broken.

**Current Numbers:**
| Entity | HP | STR | DEF | SPD | Notes |
|--------|-----|-----|-----|-----|-------|
| Hero L1 (no gear) | 30 | 8 | 4 | 4 | Feels competent |
| Green Slime | 20 | 3 | 2 | 2 | Trivial 1v1 |
| Fire Slime | 30 | 5 | 3 | 3 | Real threat to L1 |
| Wild Boar | 40 | 6 | 4 | 4 | Dangerous without gear |
| Goblin Scout | 25 | 4 | 2 | 6 | Glass cannon, kill fast |

**Catch-Up Mechanics:**
- Rescued heroes start at `max(1, avg_party_level - 1)` with basic wooden gear
- Dead heroes get **minimum 25%** of victory EXP (guaranteed progression even on failure)
- Infirmary boosts recovery: 20% base + 10% per level, healing up to `1 + floor(level/2)` heroes per day

### The "Skeleton First" Rule
> Do NOT add new regions, story missions, or major systems until the existing 3 regions + combat + village loop feel **great**. A game with 3 excellent regions beats a game with 15 empty ones. The user explicitly wants slow, loving iteration with manual testing between milestones.

---

## 6. Roadmap

### Sprint A — Skeleton Balance ✅ DONE
| # | Feature | Spec | Implementation | Status |
|---|---------|------|----------------|--------|
| A.1 | Boost hero base stats | `docs/heroes/hero.md` | `Hero.js`, `GameEngine.js` | ✅ |
| A.2 | Rebalance enemy templates | `docs/shared/combat/enemies_data.md` | `ExpeditionService.js` | ✅ |
| A.3 | Rescued hero catch-up | `docs/heroes/hero.md` | `ExpeditionService._finishExpedition()` | ✅ |
| A.4 | Defeat minimum EXP | `docs/explore/expeditions.md` | `ExpeditionService.resolveBattle()` | ✅ |

### Sprint B — "The World Grows" (Next Milestone)
> Unlock the 2 dormant regions and make difficulty scale. Small effort, massive feel improvement.

| # | Feature | Spec | Implementation | Effort |
|---|---------|------|----------------|--------|
| B.1 | **Enemy level scaling** | `docs/shared/combat/enemies_data.md` | `ExpeditionService._createEnemy()` — use `region.clears` | Small |
| B.2 | **Unlock Tiny Cave** | `docs/explore/regions_data.md` | `ExpeditionService` — unlock after `exp_tutorial_cave` | Small |
| B.3 | **Unlock Calmed Beach** | `docs/explore/regions_data.md` | `ExpeditionService` — unlock after 3 clears OR Explorer Guild L1 | Small |
| B.4 | **Explorer Guild effect** | *NEW: `docs/village/building_effects.md`* | `ExpeditionService` — L1 unlocks Cave, L2 unlocks Beach, L3+ reduces stages by 10%/level | Small |
| B.5 | **Training Grounds effect** | *NEW: `docs/village/building_effects.md`* | `GameEngine.nextDay()` — idle heroes gain +5% passive EXP/day per level | Small |

### Sprint C — "Loot Dopamine"
> Transform expeditions from "wood chores" into "one more run" loops.

| # | Feature | Spec | Implementation | Effort |
|---|---------|------|----------------|--------|
| C.1 | **Random equipment drops** | *NEW: `docs/shared/inventory/loot_table.md`* | `ExpeditionService._finishExpedition()` — 40% drop chance, tier = region tier | Medium |
| C.2 | **Affix roll on drops** | `docs/shared/inventory/equipment.md` | `ExpeditionService` — 10% 1 affix, 2% 2 affixes | Small |
| C.3 | **Tier 3-5 gear in shop** | `docs/shared/inventory/equipment_data.md` | `ShopCatalog.js` — Steel, Gold, Mythril already defined in `MATERIAL_TIERS` | Small |

### Sprint D — "The Puzzle Emerges"
> Builders and concurrent expeditions — the core strategic layer.

| # | Feature | Spec | Implementation | Effort |
|---|---------|------|----------------|--------|
| D.1 | **Builder assignment UI** | *NEW: `docs/village/builders.md`* | `VillageView.js`, `VillageService.js` — assign villagers as builders | Medium |
| D.2 | **Concurrent expeditions** | *NEW: `docs/explore/concurrent_expeditions.md`* | `ExpeditionService` — round-robin resolution, max = 1 + Explorer Guild level | Medium |
| D.3 | **Construction queue + builders** | `docs/village/buildings_data.md` | Multiple projects simultaneously if multiple builders assigned | Medium |

### Sprint E — "Build Expression"
> Skill choices and combat UI health.

| # | Feature | Spec | Implementation | Effort |
|---|---------|------|----------------|--------|
| E.1 | **Skill Learning UI** | *NEW: `docs/heroes/skill_ui.md`* | `HeroesView.js`, skill tree, 6 active slots, respec | Medium |
| E.2 | **Extract Combat UI** | N/A | New `CombatView.js`, refactor `UIController.js` | Medium |
| E.3 | **Fix hardcoded MP costs** | N/A | `UIController.js` — read from `SKILLS_DATA` instead of hardcoding | Tiny |

### Phase 3 — Major Systems (Future — Do Not Touch Yet)
> These need full specs and a solid skeleton before implementation.

| # | Feature | Blockers |
|---|---------|----------|
| 3.1 | **Magic Circle Composition** (Wizard Tower + Runes) | Skeleton complete |
| 3.2 | **Village Calendar & Defense** (invasions, defense slots) | Skeleton complete, CombatView extracted |
| 3.3 | **Achievement / Milestone System** | Skeleton complete |
| 3.4 | **Villager Personalities** (Lazy, Hardworking, Glutton) | Worker system first (Sprint D) |
| 3.5 | **Hero interaction across expeditions** | Concurrent expeditions first (Sprint D) |
| 3.6 | **Villager specialization training** | Worker system first (Sprint D) |

---

## 7. Spec-First Workflow Reminder

When adding ANY feature:

1. **Write/update the spec** in `docs/` first.
2. **Update this file** (`kimi_ai.md`) if the gap/roadmap changes.
3. **Implement** engine → adapter → UI (in that order).
4. **Add/update tests** if the project has tests for that domain.
5. **Build**: `make build APP=rpg-village`
6. **Verify**: Open `file://<path>/rpg-village.html` in browser.

---

## 8. Quick Reference

### Build & Test
```bash
make build APP=rpg-village      # production
make build-all                  # all apps
make test-rpg-village           # run tests
make local-build APP=rpg-village # for manual browser testing
```

### Key State Keys (localStorage)
| Key | Content |
|-----|---------|
| `village_state` | Buildings, gold, population, day |
| `heroes_data` | Hero array, stats, equipment, skillPoints |
| `inventory_data` | Materials, food, consumables, equipment |
| `expedition_state` | Active/completed expeditions, region progress |
| `settings_lang` | Language code |

### File Patterns
- Specs: `docs/**/*.md`
- Engine services: `js/engine/**/services/*.js`
- Engine models: `js/engine/**/models/*.js`
- UI views: `js/presentation/ui/**/*.js`
- HTML partials: `pages/*.html` (inlined at build)
- Tests: `tests/rpg-village/**/*.test.js`

### Power Curve Constants (Current)
```javascript
// Hero L1 defaults (Hero.js)
baseMaxHp: 30, baseMaxMp: 15, baseStrength: 8,
baseSpeed: 4, baseDefense: 4, baseMagicPower: 4

// Enemy templates (ExpeditionService._createEnemy)
slime_green:  { maxHp: 20, strength: 3, defense: 2, speed: 2 }
slime_fire:   { maxHp: 30, strength: 5, defense: 3, speed: 3, element: 'fire' }
wild_boar:    { maxHp: 40, strength: 6, defense: 4, speed: 4 }
goblin_scout: { maxHp: 25, strength: 4, defense: 2, speed: 6 }
goblin_grunt: { maxHp: 35, strength: 5, defense: 4, speed: 2 }
goblin_brute: { maxHp: 55, strength: 7, defense: 5, speed: 1 }
goblin_king:  { maxHp: 120, strength: 10, defense: 6, speed: 4, isBoss: true }

// Defeat EXP minimum
Math.max(floor(expPerHero * 0.25), floor(expPerHero * damageRatio * 0.5))

// Rescued hero level
startLevel = max(1, floor(avg_party_level) - 1)
```

---

*Last updated: 2026-05-20*  
*Next milestone: Sprint B — "The World Grows" (unlock regions + enemy scaling + building effects)*
