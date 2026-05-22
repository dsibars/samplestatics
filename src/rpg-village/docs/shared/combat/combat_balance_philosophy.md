# Combat Balance Philosophy

> **The x86 vs. ARM Principle**  
> x86 has more raw power per core. ARM has efficiency. ARM is winning.  
> Magic has more raw power per turn. Physical has efficiency. Both win — in different fights.

---

## The Three Archetypes

| | **Pure Warrior** | **Pure Mage** | **Hybrid (Paladin)** |
|---|---|---|---|
| **Analogy** | ARM chip | x86 chip | Overclocked x86 |
| **Per-turn damage** | Medium | **High** | **Very High** |
| **Sustainability** | **♾️ Infinite** | ⚠️ Limited | 🔥 **Brief** |
| **Resource** | Stamina (8%/turn regen) | MP (limited pool) | **Both** |
| **Best fight length** | Long (10+ turns) | Short (1-3 turns) | Burst window (2-4 turns) |
| **Weakness** | Slow kills, takes damage | Runs dry, vulnerable after | **Burns both bars, exhausted fast** |

---

## The Core Insight: Efficiency Wins Long Fights

### Example: Level 100 Heroes vs. Boss (20 turns)

| | Warrior | Mage | Hybrid |
|---|---|---|---|
| **Turn 1** | ×8 Attack, 800 dmg | 20-slot spell, **2,400 dmg** | ×8 + Fire Circle, **1,600 dmg** |
| **Turn 2** | ×8 Attack, 800 dmg | 15-slot spell, **1,500 dmg** | ×8 + Fire Circle, **1,600 dmg** |
| **Turn 3** | ×8 Attack, 800 dmg | Out of MP, basic attack 200 dmg | Out of MP, ×8 only, **800 dmg** |
| **Turn 4-10** | ×8 Attack ×7 turns = **5,600 dmg** | Basic attack ×7 = **1,400 dmg** | ×8 only ×5, then basic = **4,200 dmg** |
| **Total (10 turns)** | **9,600 dmg** | **5,500 dmg** | **8,200 dmg** |
| **Turn 11-20** | ×8 Attack ×10 = **8,000 dmg** | Basic attack ×10 = **2,000 dmg** | Basic attack ×10 = **2,000 dmg** |
| **Total (20 turns)** | **17,600 dmg** | **7,500 dmg** | **10,200 dmg** |

> **The warrior wins the marathon.** The mage wins the sprint. The hybrid wins the middle distance — then collapses.

---

## Why Physical Does NOT Need to Match Magic's Burst

### The Efficiency Argument

| Turn | Warrior (Stamina) | Mage (MP) |
|------|------------------|-----------|
| 1 | Uses 35 STA. Has 180 max. **Regens 14 STA next turn.** | Uses 120 MP. Has 150 max. **Regens 5 MP next turn.** |
| 2 | Uses 35 STA. Net: -21. Can do this **8 times** before resting. | Uses 120 MP. Net: -115. Can do this **1 time**. |
| 3-8 | Keeps attacking. | Basic attacks only. |

> **The warrior attacks 8 times while the mage attacks 2 times.** Even if the mage's hits are 3× bigger, the warrior wins over time.

### The HP Factor

Neither stamina nor MP matter if the hero is dead.

- **Warrior:** High HP, high DEF. Can afford long fights. The efficiency lets them outlast enemies.
- **Mage:** Low HP, low DEF. Needs to end fights quickly. If the boss survives the first 2 spells, the mage is in trouble.
- **Hybrid:** Medium everything. Bursts hard, but if the burst doesn't kill, they're stranded with empty bars.

> **HP is the ultimate resource.** Physical's efficiency means they take fewer turns to kill — which means they take fewer hits — which means they conserve HP.

---

## Magic Must Cost DEVASTATING Mana

### The MP Economy

| Spell Size | MP Cost | % of Max (Lv.100 Mage) | Usable Per Fight |
|-----------|---------|----------------------|-----------------|
| 7-slot (1 ring) | 40 MP | 27% | ~3 casts |
| 13-slot (2 rings) | 85 MP | 57% | ~1-2 casts |
| 19-slot (3 rings) | 140 MP | 93% | ~1 cast |
| 25-slot (full) | 200+ MP | **130%+** | Requires overcharge or MP potions |

> **A 25-slot spell should cost MORE than max MP.** The mage must use MP potions, or accept HP damage (blood magic overcharge), or build up MP over multiple turns. This makes the spell feel **earned and risky**.

### Blood Magic Overcharge (Optional)

If a mage casts a spell they can't afford:
- The spell drains **remaining MP + HP** to cover the deficit.
- *"You pushed too deep. The magic took its price from your flesh."*
- This lets mages cast devastating spells even when dry — but at lethal risk.

> **Warriors don't need this.** Their stamina always recovers. This is the mage's unique tension.

---

## Physical Damage Scaling (Revised)

Physical damage per tier should **not** try to match magic burst. It should scale **steadily and efficiently**.

### Multiple Attack Family

| Tier | Name | Hits | Damage/Hit | Total Multiplier | STA Cost |
|------|------|------|-----------|-----------------|----------|
| 1 | ×2 | 2 | 0.70× STR | 1.40× | 10 |
| 2 | ×3 | 3 | 0.62× STR | 1.86× | 14 |
| 3 | ×4 | 4 | 0.55× STR | 2.20× | 18 |
| 5 | ×6 | 6 | 0.45× STR | 2.70× | 26 |
| 7 | ×8 | 8 | 0.38× STR | 3.04× | 34 |
| 10 | ×11 | 11 | 0.30× STR | 3.30× | 46 |
| 12 | ×13 | 13 | 0.27× STR | 3.51× | 54 |

> **Total multiplier grows slowly.** ×13 does ~2.5× the damage of ×2. But the warrior can use ×13 every 5-6 turns forever. The mage uses their 25-slot nuke once and is done.

### Power Strike Family

| Tier | Multiplier | STA Cost |
|------|-----------|----------|
| 1 | 1.5× STR | 12 |
| 2 | 1.8× STR | 18 |
| 3 | 2.1× STR | 24 |
| 5 | 2.6× STR | 36 |
| 7 | 3.1× STR | 48 |
| 10 | 3.8× STR | 66 |
| 12 | 4.3× STR | 78 |

> **Power Strike is the warrior's "nuke."** It still doesn't match a 25-slot spell, but it costs stamina that regenerates. The warrior can Power Strike every 6-7 turns. The mage can 25-slot nuke once.

---

## Encounter Design Implications

### Short Fight (3-5 turns) — Trash Mobs

| Best | Why |
|------|-----|
| **Mage** | One or two spells ends it. No need for sustain. |
| **Hybrid** | One inscribed skill deletes the wave. Move on. |
| Warrior | Works fine, but slower. |

### Medium Fight (6-12 turns) — Elite

| Best | Why |
|------|-----|
| **Hybrid** | Burst down the dangerous phase, then sustain with basic attacks. |
| **Warrior** | Consistent damage, no downtime. |
| Mage | Dangerous if the elite survives the opening salvo. |

### Long Fight (15+ turns) — Boss

| Best | Why |
|------|-----|
| **Warrior** | Infinite stamina. Grinds the boss down while the mage is out of MP. |
| **Mage** | Needs MP potions or blood magic. High risk. |
| Hybrid | Exhausts both bars in 3-4 turns. Then is a liability. |

### Marathon (Multiple back-to-back fights) — Dungeon

| Best | Why |
|------|-----|
| **Warrior** | Full stamina between battles. Always ready. |
| **Mage** | MP doesn't restore between battles (or restores slowly). Needs rest. |
| Hybrid | Even worse — both bars drain across fights. |

---

## The Verdict

| Question | Answer |
|----------|--------|
| Should physical match magic's burst? | **No.** Physical wins on efficiency and sustain. |
| Should magic cost devastating MP? | **Yes.** Every spell is a commitment. |
| Is the hybrid the best? | **Sometimes.** In burst windows. Then it collapses. |
| Who wins a 1-turn fight? | **Mage.** |
| Who wins a 20-turn fight? | **Warrior.** |
| Who wins a 5-turn fight? | **Hybrid.** |

> **Neither is better. Each is better at different things.** The player builds their party to cover all fight lengths.

---

## Open Questions

1. **Should MP restore between battles in an expedition?** Or does the mage need to camp/rest?
2. **Should there be MP potions?** This becomes critical for mage/hybrid viability in long dungeons.
3. **Should stamina have a "tired" state?** Below 20% stamina = -10% damage until it recovers?
4. **Blood magic overcharge:** Should this be a mechanic, or too punishing?
