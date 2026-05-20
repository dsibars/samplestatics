# Kimi AI — RPG Village Context & Roadmap

> **Purpose**: This file serves as the "session memory" for Kimi AI when working on RPG Village.  
> **Rule**: Read this file at the start of every new session. It contains the architecture, conventions, current state, known gaps, and the prioritized roadmap. Update it after every significant change.

---

## 1. Project Identity

**RPG Village** is a static, offline-first village management + hero progression game. It runs entirely in the browser with `localStorage` persistence. Built with Vanilla JS, bundled by Vite into a single-file HTML app.

- **Entry**: `src/rpg-village/index.html`
- **Built output**: `rpg-village.html` (root)
- **Branch**: `app/project-rpg-village`
- **Not linked from Hub** (orphaned — see Roadmap)

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
| Shop (buy) | ✅ | Tier-gated by blacksmith. Consumables + gear. No affixes. |
| Forge (refine) | ✅ | +0 to +10, ×1.1 power per level. Material/gold costs scale by tier. |
| Turn-based combat | ✅ | Speed-based turns, 20+ skills, status effects (poison, burn, haste), consumables, auto-battle, enemy AI |
| Expeditions | 🟡 | Only `reg_greenfields` wired. Tutorial chain: `exp_tutorial_cave` → `exp_rescue_mission` (unlocks Sir Valen) |
| i18n | ✅ | EN, ES, CA, EU, GL |
| Tests | 🟡 | 3 test files: BattleService, InventoryService, CombatFlow |

---

## 4. Known Gaps & Issues

### Functional Gaps
| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| 1 | **No Skill UI** | High | Heroes earn `skillPoints` but there's no interface to learn/upgrade skills |
| 2 | **No Sell Resources** | Medium | ✅ **Implemented 2026-05-20**. Sell wood/stone/grain for gold via Resources tab in Shop. |
| 3 | **No Sell Items** | Medium | ✅ **Implemented 2026-05-20**. Sell tab in Shop. Equipment & consumables at ~30% buy price. |
| 4 | **Workers / Labor** | Medium | `population.assigned` exists but no worker entities, specializations, or assignment UI |
| 5 | **Inert Buildings** | Medium | `explorer_guild` and `training_grounds` provide no gameplay effect |
| 6 | **No Affix Generation** | Medium | Affixes (`vampire`, `phoenix`, `sage`, `titan`, `assassin`) coded in stat calc but never rolled |
| 7 | **Only 1 Region** | Medium | `reg_tiny_cave`, `reg_calmed_beach` defined in data but unreachable |
| 8 | **Enemy Level Scaling** | Low | Spec says `Base * 1.1^(L-1)`; enemies use flat base stats. Not yet implemented. |
| 9 | **Not in Hub** | Low | ✅ **Fixed 2026-05-20**. Card added to `src/hub/index.html` with i18n for all 5 languages. |

### Code Quality Issues
| # | Issue | Location | Status |
|---|-------|----------|--------|
| 1 | **Combat UI monolith** | `UIController.js` has ~600 lines of inline combat HTML/CSS generation. Should be extracted to `CombatView.js` | 🔴 Open |
| 2 | **Duplicate owned-count logic** | `ShopView.js` repeats inventory+equipped matching logic | ✅ **Fixed 2026-05-20**. Extracted `_getOwnedBreakdown()` and `_getOwnedCount()` |
| 3 | **Missing equipment affixes in shop** | Shop gear is always "clean" — no `affixes` array | 🔴 Open |
| 4 | **Hard-coded prices in view** | Shop catalog prices live in `ShopView.js` instead of data/constants | ✅ **Fixed 2026-05-20**. Moved to `js/engine/shared/data/ShopCatalog.js` |
| 5 | **Test coverage** | No tests for VillageService, ExpeditionService, UI views, building construction | 🔴 Open |
| 6 | **i18n completeness** | Some combat/log keys may fallback to English or raw keys in non-EN translations | 🔴 Open |
| 7 | **App description outdated** | `docs/app_description.md` still has placeholders for Hero System and Combat System | ✅ **Fixed 2026-05-20**. Rewrote to reflect all implemented systems |

### Docs Issues
| # | Issue | Action |
|---|-------|--------|
| 1 | `app_description.md` has placeholders | ✅ **Fixed 2026-05-20** |
| 2 | No spec for "Sell Items" (equipment/consumables) | Create new spec or extend `shop_forge.md` |
| 3 | No spec for Skill UI | Create `docs/heroes/skill_ui.md` |
| 4 | No spec for Worker Assignment | Create `docs/village/workers.md` |
| 5 | `roadmap.md` is vague brainstorming | Convert actionable items into this roadmap; keep truly vague ideas in roadmap |

---

## 5.1 Completed This Session (Skeleton Balance)
- ✅ **Hero base stats boosted** (HP 30, MP 15, STR 8, DEF 4, SPD 4, MAG 4) — heroes feel competent from level 1
- ✅ **Enemy templates rebalanced** with defense values and clearer tier spectrum
- ✅ **Rescued heroes catch up** — start at `max(1, avg_party_level - 1)` with basic wooden gear
- ✅ **Defeat minimum EXP** — dead heroes guaranteed 25% of victory EXP, preventing death spirals
- ✅ **Specs updated** — `hero.md`, `enemies_data.md`, `expeditions.md` reflect new balance

## 5. Roadmap

### Phase 1 — Foundation & Polish (Current Priority)
> These are small-to-medium features that fix existing gaps without adding new domains.

| # | Feature | Spec File | Implementation Files | Effort |
|---|---------|-----------|----------------------|--------|
| 1.1 | **Sell Resources panel** in Shop | `docs/village/shop_forge.md` (exists) | `ShopView.js`, `EngineAdapter.js` | Small ✅ |
| 1.1b | **Skeleton Balance Pass** | *NEW* | `Hero.js`, `ExpeditionService.js`, `hero.md`, `enemies_data.md`, `expeditions.md` | Small ✅ |
| 1.2 | **Sell Items** (equipment & consumables at ~30% buy price) | `docs/village/shop_forge.md` | `ShopView.js`, `GameEngine.js`, `EngineAdapter.js`, `pages/shop.html` | Small ✅ |
| 1.3 | **Add RPG Village to Hub** | N/A | `src/hub/index.html` | Tiny |
| 1.4 | **Skill Learning UI** | *NEW: `docs/heroes/skill_ui.md`* | `HeroesView.js`, `HeroService.js`, `EngineAdapter.js` | Medium |
| 1.5 | **Explorer Guild effect** (faster expeditions? better rewards?) | *NEW: `docs/village/building_effects.md`* | `VillageService.js`, `ExpeditionService.js` | Small |
| 1.6 | **Training Grounds effect** (passive XP or stat boosts?) | *NEW: `docs/village/building_effects.md`* | `VillageService.js`, `HeroService.js` | Small |

### Phase 2 — Content Expansion
> These add new playable content.

| # | Feature | Spec File | Implementation Files | Effort |
|---|---------|-----------|----------------------|--------|
| 2.1 | **Wire up `reg_tiny_cave`** | `docs/explore/regions_data.md` | `ExpeditionService.js`, `GameConstants.js` | Medium |
| 2.2 | **Wire up `reg_calmed_beach`** | `docs/explore/regions_data.md` | `ExpeditionService.js`, `GameConstants.js` | Medium |
| 2.3 | **Enemy level scaling** | `docs/shared/combat/enemies.md` | `Enemy.js`, `CombatCalculator.js` | Small |
| 2.4 | **Equipment affix generation** (shop, loot, forge?) | `docs/shared/inventory/equipment.md` | `Equipment.js`, `ShopView.js`, `BattleService.js` | Medium |
| 2.5 | **Worker / Labor Assignment system** | *NEW: `docs/village/workers.md`* | New domain: `village/services/WorkerService.js`, `VillageView.js` | Large |

### Phase 3 — Major Systems (Roadmap Drafts)
> These are from `docs/drafts/roadmap.md`. They need full specs before implementation.

| # | Feature | Draft Source | Blockers |
|---|---------|------------|----------|
| 3.1 | **Magic Circle Composition** (Wizard Tower + Runes) | `roadmap.md` | Needs new building, new item type, new UI |
| 3.2 | **Village Calendar & Defense** (invasions, defense slots) | `roadmap.md` | Needs calendar UI, defense combat variant |
| 3.3 | **Achievement / Milestone System** | `roadmap.md` | Needs global stats tracking, UI panel |
| 3.4 | **Villager Personalities** (Lazy, Hardworking, Glutton) | `roadmap.md` | Needs worker system first (2.5) |

### Phase 4 — Tech Debt & Quality
> Non-functional improvements. Can be done in parallel with any phase.

| # | Task | Files | Effort |
|---|------|-------|--------|
| 4.1 | **Extract Combat UI from UIController** | New `CombatView.js`, refactor `UIController.js` | Medium 🔴 |
| 4.2 | **Refactor ShopView duplicate logic** | `ShopView.js` — extract `getOwnedCount()` helper | Small ✅ |
| 4.3 | **Move shop catalog to data/constants** | `GameConstants.js` or new `ShopCatalog.js` | Small ✅ |
| 4.4 | **Update `app_description.md`** | `docs/app_description.md` | Small ✅ |
| 4.5 | **Add tests for VillageService** | `tests/rpg-village/unit/VillageService.test.js` | Medium 🔴 |
| 4.6 | **Add tests for ExpeditionService** | `tests/rpg-village/unit/ExpeditionService.test.js` | Medium 🔴 |
| 4.7 | **Combat UI accessibility / mobile polish** | `UIController.js` combat section | Small 🔴 |
| 4.8 | **Hub integration + PWA manifest consideration** | `src/hub/index.html`, maybe `manifest.json` | Small ✅ |

---

## 6. Spec-First Workflow Reminder

When adding ANY feature:

1. **Write/update the spec** in `docs/` first.
2. **Update this file** (`kimi_ai.md`) if the gap/roadmap changes.
3. **Implement** engine → adapter → UI (in that order).
4. **Add/update tests** if the project has tests for that domain.
5. **Build**: `make build APP=rpg-village`
6. **Verify**: Open `file://<path>/rpg-village.html` in browser.

---

## 7. Quick Reference

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

---

*Last updated: 2026-05-20*
