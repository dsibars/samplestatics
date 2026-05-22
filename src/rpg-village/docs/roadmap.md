# RPG Village Roadmap: From Current State to Vision

> **Current Branch:** `app/project-rpg-village`  
> **Current State:** 2-hero expeditions, SP-based skill tree, MP costs for all skills, 7 regions, story beats exist.  
> **Target Vision:** 4-hero expeditions, infinite-tier physical skills with stamina, Magic Circle system, hybrid Body Inscriptions, 30-hero roster.

---

## CURRENT STATE AUDIT (What Exists Today)

### Heroes
- **Stats:** HP, MP, STR, SPD, DEF, MAG
- **Leveling:** Stat points every level, SP every level
- **Skills:** Tree-based with dependencies (`basic_attack` → `double_attack` → `triple_attack`)
- **Skills cost MP** — even physical ones
- **SP system:** Spend SP to learn/upgrade skills
- **Equipment:** 6 slots (head, body, legs, leftHand, rightHand, accessory)
- **Origins:** 8 origins with trait bonuses

### Combat
- Turn-based, speed-ordered
- Manual + auto-battle
- Party traits based on origins
- Status effects (poison, burn)
- Vampirism, crit, evasion

### Expeditions
- **Multiple heroes supported in code** (no hard limit)
- Round-robin resolution for concurrent expeditions
- 7 regions with story + procedural nodes
- Tutorial Cave → Rescue Mission (Sir Valen) → region unlocks
- Explorer Guild increases concurrent expeditions

### Village
- Buildings: Explorer Guild, housing, etc.
- Population with role assignment
- Gold, materials, inventory

### What's MISSING
- ❌ Stamina system
- ❌ Magic Circle / Glyph system
- ❌ Custom spells
- ❌ Infinite skill tiers
- ❌ Body Inscription / hybrid
- ❌ Trainer NPC
- ❌ Witch NPC
- ❌ Academy building
- ❌ Party size limited to 2 in UI (code supports more)

---

## THE NEW PHILOSOPHY: Civilization With Heroes

> **"Day 100 should feel like running a small army, not like Day 10 with bigger numbers."**

### The Hero Economy

At any point, your heroes are doing ONE of these:

| Activity | Heroes Used | Duration |
|----------|------------|----------|
| **Expedition** | 1-4 per expedition | Multiple days |
| **Village Defense** | 1-4 | Continuous |
| **Teaching / Learning** | 2-4 (1 teacher + 1-3 students) | 3-5 days |
| **Body Inscription Ritual** | 1 | 5 days |
| **Idle / Bench** | 0 | — |

> **Hero scarcity is the game.** You always need more bodies than you have. Every decision is "who do I NOT send?"

### Hero Recruitment Rate

| Day | Total Heroes | How |
|-----|-------------|-----|
| 1 | 1 (Arthur) | Starter |
| 3-5 | 2 | First story recruit |
| 10-14 | 3-4 | Tavern unlocks |
| 20-30 | 5-7 | Expedition rewards, tavern |
| 40-60 | 8-12 | Regions unlock, rescue missions |
| 80-100 | 15-25 | Multiple recruitment sources |
| 150+ | 25-30+ | Endgame bench depth |

> **Recruitment sources:** Story events, tavern rolls, expedition rescues, region unlocks, building upgrades.

---

## THE ROADMAP: 4 Eras (Fast Unlocks)

Each era is a **management explosion** — new systems, new decisions, new heroes. The player should feel overwhelmed (in a good way) by Day 50.

---

### ERA I: The Spark (Days 1–10)

**Story:** Arthur arrives at ruins. He clears a cave. A guard is rescued. Two people are not enough.

| Day | Milestone | System Unlocked |
|-----|-----------|-----------------|
| 1 | Tutorial Cave | Basic combat, Arthur |
| 2 | First building | Village tutorial |
| 3 | **Rescue Sir Valen** | **2nd hero** (physical, guard) |
| 5 | Arthur Level 5 | **First Skill Slot** — choose family |
| 5 | Build **Training Grounds** | **Trainer NPC** available |
| 7 | First skill evolves (Tier 2) | Player notices "×2" became "×3" |
| 8 | Region: Tiny Cave | Harder enemies, 2-hero expeditions feel right |
| 10 | Build **Tavern** | **Passive hero recruitment** (1 every 5-7 days) |

**Changes in Era I:**
- Replace SP skill tree with **Skill Slots at level milestones**
- Add **stamina** stat (yellow bar), but keep MP costs for now (full switch in Era II)
- Map old skills to new families
- **Tavern building** — auto-recruits random heroes over time

---

### ERA II: The Flood (Days 11–30)

**Story:** The village grows. Heroes arrive daily. The first mage appears. Magic is discovered. Everything accelerates.

| Day | Milestone | System Unlocked |
|-----|-----------|-----------------|
| 12 | Tavern recruits **Elara** | **3rd hero, FIRST MAGE** — introduces Magic Circle |
| 14 | Arthur Level 10 | **Second Skill Slot** |
| 15 | Elara finds first **Glyph Tablet** | **Magic Circle system** (Core + Ring 1 = 7 slots) |
| 15 | Build **Witch's Hut** | Vague magic progress hints |
| 16 | Elara composes first spell | **Spell Codex** — save custom spells |
| 18 | Physical skills switch to **Stamina** | Warriors no longer use MP for skills |
| 20 | Region: Dark Forest | Enemies have elemental affinities |
| 20 | Build **Explorer Guild L1** | **2 concurrent expeditions** |
| 22 | First skill reaches Tier 3 | ×4 attack or equivalent |
| 25 | Arthur Level 15 | **Third Skill Slot** |
| 25 | Tavern recruits 4th hero | Player now has 4 heroes, must choose who benches |
| 28 | **Village Defense event** | First raid — teaches defense assignment |
| 30 | Elara completes Tier 7 circle | **First full magic circle** — cutscene |

**Changes in Era II:**
- **Stamina fully activated** — physical skills cost STA, magic costs MP
- **Magic Circle live** — Core + Ring 1, Glyph Tablets as loot
- **Elara as mage template** — starts with fire Glyph, teaches player
- **Tavern auto-recruitment** — heroes arrive without player action
- **Defense system** — assign heroes to protect village
- **Explorer Guild** — more concurrent expeditions

**By Day 30:**
- 4-6 heroes in roster
- 2 concurrent expeditions possible
- Physical + Magic systems both live
- Player is managing: who explores, who defends, who learns

---

### ERA III: The Web (Days 31–60)

**Story:** The village is a hub. Heroes teach each other. Expeditions branch. The player is no longer a fighter — they are a commander.

| Day | Milestone | System Unlocked |
|-----|-----------|-----------------|
| 32 | Build **Academy** | **Glyph teaching** — teacher + students, locked for days |
| 33 | First Academy session | A warrior learns a Glyph from Elara |
| 35 | Build **Explorer Guild L2** | **Party size: 3 heroes** per expedition |
| 35 | Region: Mystic Ruins | Magic-focused enemies, Glyph Tablet drops increase |
| 38 | First 3-hero expedition | Player feels the composition difference |
| 40 | Arthur Level 20 | **Fourth Skill Slot** |
| 42 | First **Body Inscription** unlock | A hero meets the threshold (12 skill points + Tier 7 magic) |
| 45 | First inscribed hero returns | **Hybrid system live** — Stamina + MP consumption |
| 48 | Region: Frozen Peaks | Requires elemental strategy |
| 50 | Tavern has recruited 8-10 heroes | Roster management is real |
| 55 | Build **Explorer Guild L3** | **Party size: 4 heroes** per expedition |
| 55 | **3 concurrent expeditions** | Hero scarcity intensifies |
| 60 | Story: "The General" | Cutscene acknowledging player's command role |

**Changes in Era III:**
- **Academy** — teaching system consumes heroes but spreads Glyphs
- **Party size 3 → 4** — composition strategy becomes critical
- **Body Inscription** — first hybrid hero (rare, trophy)
- **3 concurrent expeditions** — maximum hero deployment pressure
- **Hero roster: 8-12** — bench vs. active decisions every day

**By Day 60:**
- 8-12 heroes
- 3 expeditions × up to 4 heroes = 12 heroes deployed
- 2-4 heroes on defense
- 2-4 heroes in Academy
- **Almost every hero is busy.** The player is managing a war room.

---

### ERA IV: The Infinite (Days 61–100+)

**Story:** There is no more tutorial. The player is building legends. Heroes reach tier 10. Spells reshape reality. The village is a fortress.

| Day | Milestone | System Unlocked |
|-----|-----------|-----------------|
| 65 | First skill reaches Tier 5-6 | ×7 attack or equivalent — power spike |
| 70 | Arthur Level 25 | **Fifth Skill Slot** |
| 75 | First spell reaches `✦` tier | Legendary Glyph mastery |
| 80 | Second hybrid inscribed | Player now has two "living spells" |
| 85 | Build **Explorer Guild L4** | **4 concurrent expeditions** |
| 90 | Region: **The Astral Plane** (endgame) | Requires hybrid damage, 4-hero parties |
| 95 | Arthur Level 30 | **Sixth (final) Skill Slot** |
| 100 | Story: "The Age of Legends" | All systems live. True game begins. |

**Changes in Era IV:**
- **4 concurrent expeditions** — maximum deployment
- **Endgame region** — Astral Plane, requires mastery of all systems
- **Multiple hybrids** — 2-3 inscribed heroes in roster
- **Hero roster: 15-25** — massive bench, specialization matters

**By Day 100:**
- 15-25 heroes
- 4 expeditions × 4 heroes = 16 deployed
- 4 defense
- 4 in Academy
- **28 heroes busy. 2-3 on bench.** The player is a general.

---

## The Daily Loop (Late Game)

```
MORNING (Player's Turn)
├─ 4 expeditions returned — review loot, injuries, level-ups
├─ 2 Academy sessions finished — reassign teachers/students  
├─ 1 Body Inscription completed — hero returns with runes
├─ New heroes arrived at Tavern — evaluate and recruit?
├─ Village defense rotation — swap tired heroes for fresh ones
├─ Equip new gear across 20+ heroes
├─ Compose new spells for mages
├─ Check skill tier evolutions (silent upgrades happened)
└─ Assign tomorrow's expeditions (4 parties of 4)

→ Click NEXT DAY

EVENING (Resolution)
├─ Expeditions fight battles (manual or auto)
├─ Village defends against raid
├─ Teaching progress advances
├─ Tavern generates new recruits
└─ Random events (merchant, wandering hero, monster attack)
```

> **Each "day" takes 5-10 minutes of management.** Like Civilization. The player is NEVER just clicking "next day" — they are always making decisions.

---

## IMPLEMENTATION PRIORITY (Revised)

### Phase 0: Foundation (Do FIRST — 1-2 sessions)
1. **Stamina stat** — add to Hero model, yellow bar in UI
2. **Skill Slot system** — replace SP tree with 6 slots at levels 5/10/15/20/25/30
3. **Family migration** — map old skills to Multiple Attack / Power Strike / Shield Bash / Poison Strike / Cleave
4. **Stamina cost** — physical skills use STA, magic uses MP
5. **Tavern building** — auto-recruits heroes every 5-7 days

### Phase 1: Physical Evolution (1 session)
6. **Infinite tier engine** — hidden counters, auto-evolution
7. **Combat submenu UI** — Skills → Family → [×N] [...] [×2]
8. **Trainer NPC** — Training Grounds dialogue

### Phase 2: Magic Arrives (1-2 sessions)
9. **Elara (mage hero)** — recruitable at Tavern, high MAG, starts with fire Glyph
10. **Magic Circle core** — Core + Ring 1, Glyph Tablets as loot
11. **Witch's Hut** — vague progress hints
12. **Spell Codex** — compose, name, save spells

### Phase 3: Management Explosion (1 session)
13. **Party size 3** — Explorer Guild L2
14. **Academy building** — Glyph teaching (teacher + students, 3-5 days)
15. **Village Defense** — assign heroes, raids happen periodically
16. **Explorer Guild L3** — 3 concurrent expeditions

### Phase 4: Endgame (1 session)
17. **Party size 4** — Explorer Guild L3/L4
18. **Body Inscription** — hybrid unlock
19. **Explorer Guild L4** — 4 concurrent expeditions
20. **Astral Plane region** — endgame content

---

## BALANCE: The Scarcity Curve

| Day | Heroes | Deployed | Bench | Scarcity Feel |
|-----|--------|----------|-------|--------------|
| 1 | 1 | 1 | 0 | "I need help." |
| 5 | 2 | 2 | 0 | "Just enough." |
| 15 | 4 | 4 | 0 | "Everyone is busy." |
| 30 | 6 | 6 | 0 | "I need MORE heroes." |
| 60 | 10 | 10 | 0 | "Still not enough!" |
| 100 | 20 | 18 | 2 | "Finally, a small bench." |
| 150 | 30 | 26 | 4 | "I can rotate. I am a general." |

> **The goal: The player should NEVER have idle heroes they don't know what to do with.** Scarcity creates value. Every hero matters.

---

## SAVE MIGRATION PLAN

Old heroes have:
```js
skills: { double_attack: 0, whirlwind: 0, small_fire_ball: 0 }
skillPoints: 5
```

Migration on load:
1. Convert `skills` object to **families**:
   - `double_attack` / `triple_attack` → `multiple_attack` family, tier = highest known
   - `whirlwind` / `blade_dance` → `cleave` family
   - `power_blow` → `power_strike` family
   - `shield_bash` → `shield_bash` family
   - `poison_dart` → `poison_strike` family
   - Magic skills → **stored as Glyphs** in new Magic Circle system (if hero has MAG > 8)
2. Refund `skillPoints` as **gold** (they're no longer used)
3. Add `stamina` and `maxStamina` to hero state
4. Set `stamina = maxStamina`

---

## THE NORTH STAR

> **"Day 1: Arthur hits a slime with a stick."**
>
> **"Day 30: Arthur's ×7 attack cleaves through goblins while Elara's fire spell burns the backline, and I'm deciding whether to send Sir Valen to teach a Glyph or defend the village."**
>
> **"Day 100: I'm managing 20 heroes across 4 expeditions, 2 Academy sessions, village defense, and a Body Inscription ritual. My ×13 warrior just one-shot a dragon. My 25-slot mage reshaped a battlefield. And I still don't have enough heroes."**
