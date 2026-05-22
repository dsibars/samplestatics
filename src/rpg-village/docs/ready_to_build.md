# Phase 0: Ready to Build — Engine First

> **Rule:** Engine files are PRIMARY. Presentation files are SECONDARY. We build engine logic first, then wire UI to it.

---

## 1. Hero Model: Stamina + Skill Slots (No More SP)

### Engine Files

| File | What to Change |
|------|---------------|
| **`engine/heroes/models/Hero.js`** | Add `stamina`, `maxStamina`. Remove `skillPoints`. Add `skillSlots[]` (6 max, level-gated). Add `staminaRegen`. |
| **`engine/heroes/models/Hero.js`** | `recalculateStats()` — calculate `maxStamina = STR×3 + DEF×2 + Level×2`. |
| **`engine/heroes/models/Hero.js`** | `levelUp()` — remove `skillPoints += 1`. Add `unlockSkillSlot()` at levels 5/10/15/20/25/30. |
| **`engine/heroes/models/Hero.js`** | Replace `skills: {double_attack: 0}` with `techniques: [{familyId: 'multiple_attack', tier: 1, uses: 0}]`. |
| **`engine/heroes/services/HeroService.js`** | `add()` — new heroes start with `stamina = maxStamina`. |
| **`engine/heroes/services/HeroService.js`** | `saveAll()` / load — migration: convert old `skills` → new `techniques` + refund SP as gold. |

### What Changes in Hero.js

```javascript
// BEFORE
this.skillPoints = data.skillPoints || 0;
this.skills = data.skills || { basic_attack: 0 };

// AFTER
this.stamina = data.stamina ?? this.maxStamina;
this.maxStamina = 0; // calculated in recalculateStats()
this.techniques = data.techniques || []; // [{familyId, tier, uses}]
this.skillSlots = data.skillSlots || [
    { unlockedAt: 5, familyId: null },
    { unlockedAt: 10, familyId: null },
    { unlockedAt: 15, familyId: null },
    { unlockedAt: 20, familyId: null },
    { unlockedAt: 25, familyId: null },
    { unlockedAt: 30, familyId: null }
];
```

---

## 2. Combat: Stamina Costs + Family Execution

### Engine Files

| File | What to Change |
|------|---------------|
| **`engine/shared/data/GameConstants.js`** | Replace `SKILLS_DATA` tree with `TECHNIQUE_FAMILIES` (5 families, infinite tiers). Remove dependencies, unlockCosts. Add `staminaCost` per family. |
| **`engine/shared/combat/services/BattleService.js`** | `executeAction()` — check `stamina` for physical, `mp` for magic. Deduct correct resource. |
| **`engine/shared/combat/services/BattleService.js`** | `executeAction()` — resolve technique by `familyId` + `tier`, not by `skillId`. |
| **`engine/shared/combat/core/CombatCalculator.js`** | Calculate damage based on family + tier (e.g., Multiple Attack ×N = N hits at scaled damage). |
| **`engine/shared/combat/core/CombatAI.js`** | Auto-battle AI uses families, considers stamina. |

### What Changes in GameConstants.js

```javascript
// BEFORE
export const SKILLS_DATA = {
    double_attack: { id: 'double_attack', baseMultiplier: 0.7, mpCost: 10, dependency: 'basic_attack', ... },
    triple_attack: { id: 'triple_attack', baseMultiplier: 0.6, mpCost: 20, dependency: 'double_attack', ... },
    ...
};

// AFTER
export const TECHNIQUE_FAMILIES = {
    multiple_attack: {
        id: 'multiple_attack',
        category: 'physical',
        stat: 'strength',
        baseStaminaCost: 8,
        staminaPerTier: 3,
        // Tier 1 = 2 hits, Tier N = N+1 hits
        // Damage per hit = baseMultiplier / sqrt(tier + 1)
    },
    power_strike: { ... },
    shield_bash: { ... },
    poison_strike: { ... },
    cleave: { ... }
};
```

---

## 3. Save Migration: Old → New

### Engine Files

| File | What to Change |
|------|---------------|
| **`engine/shared/core/Persistence.js`** | Add migration version check. On load v1 → v2: convert `skills` to `techniques`, add `stamina`, remove `skillPoints`. |
| **`engine/heroes/services/HeroService.js`** | `_loadHeroes()` — run migration if `skills` field exists (old save). |

### Migration Logic

```javascript
function migrateHeroV1toV2(heroData) {
    // Old: skills: { basic_attack: 0, double_attack: 0, triple_attack: 0 }
    // New: techniques: [{familyId: 'multiple_attack', tier: 2, uses: 0}]
    
    const techniqueMap = {
        double_attack: { family: 'multiple_attack', tier: 1 },
        triple_attack: { family: 'multiple_attack', tier: 2 },
        whirlwind: { family: 'cleave', tier: 2 },
        blade_dance: { family: 'cleave', tier: 3 },
        power_blow: { family: 'power_strike', tier: 1 },
        shield_bash: { family: 'shield_bash', tier: 1 },
        poison_dart: { family: 'poison_strike', tier: 1 }
    };
    
    const techniques = [];
    for (const [skillId, skillLevel] of Object.entries(heroData.skills || {})) {
        if (skillId === 'basic_attack') continue;
        const mapped = techniqueMap[skillId];
        if (mapped) {
            techniques.push({
                familyId: mapped.family,
                tier: mapped.tier + (skillLevel || 0),
                uses: 0 // reset usage counter, or estimate from level
            });
        }
    }
    
    return {
        ...heroData,
        techniques,
        stamina: heroData.maxStamina || 30,
        skillSlots: [
            { unlockedAt: 5, familyId: techniques[0]?.familyId || null },
            { unlockedAt: 10, familyId: techniques[1]?.familyId || null },
            // ... fill from existing skills, rest empty
        ],
        skillPoints: undefined, // removed
        skills: undefined // removed
    };
}
```

---

## 4. Tavern Building (Auto-Recruitment)

### Engine Files

| File | What to Change |
|------|---------------|
| **`engine/village/services/VillageService.js`** | Add `tavern` to infrastructure. `processDay()` — if tavern built, roll for hero recruitment. |
| **`engine/village/services/VillageService.js`** | `buildTavern()` / `upgradeTavern()` — increases recruitment frequency and hero quality. |
| **`engine/heroes/services/HeroService.js`** | `generateRandomHero()` — create procedurally generated hero (origin, stats, name). |
| **`engine/GameEngine.js`** | `nextDay()` — trigger tavern recruitment check. |

### Tavern Logic

```javascript
// In VillageService.processDay()
if (infrastructure.tavern >= 1) {
    const baseChance = 0.15; // 15% per day
    const levelBonus = infrastructure.tavern * 0.05;
    if (Math.random() < (baseChance + levelBonus)) {
        const newHero = heroService.generateRandomHero();
        // Notify player: "A wanderer arrived at the Tavern!"
    }
}
```

---

## 5. Presentation (After Engine is Solid)

| File | What to Change |
|------|---------------|
| `presentation/ui/heroes/HeroesView.js` | Show stamina bar. Show Skill Slots (6 circles, locked/unlocked). Remove SP display. |
| `presentation/ui/combat/CombatView.js` | Combat action bar shows technique families → submenu → tier selection. Show stamina cost. |
| `presentation/ui/village/VillageView.js` | Add Tavern widget. Show "Wanderer arrived!" notifications. |
| `css/style.css` | Stamina bar styles (yellow). Skill slot styles. |

---

## Build Order (Engine First)

1. **`GameConstants.js`** — define `TECHNIQUE_FAMILIES`, remove old `SKILLS_DATA`
2. **`Hero.js`** — add stamina, techniques, skillSlots; remove skillPoints
3. **`HeroService.js`** — migration logic, `generateRandomHero()`
4. **`BattleService.js`** — stamina/MP split, family execution
5. **`CombatCalculator.js`** — family + tier damage formula
6. **`VillageService.js`** — Tavern building, recruitment
7. **`GameEngine.js`** — wire tavern into day cycle
8. **Presentation** — UI for all the above

---

## Files NOT to Touch (Yet)

| File | Why |
|------|-----|
| `ExpeditionService.js` | Already supports multiple heroes. No changes needed for Phase 0. |
| `CalendarService.js` | Unrelated to Phase 0. |
| `DailyObjectivesService.js` | Unrelated to Phase 0. |
| `InventoryService.js` | Equipment system stays. May add stamina potions later. |

---

## Tests to Update

| Test File | What to Check |
|-----------|--------------|
| `tests/rpg-village/**/*.test.js` | Hero creation, level-up, skill execution. Will need updates for new model. |

> **Current tests:** 115 passing. After Phase 0, we'll need to update hero-related tests.
