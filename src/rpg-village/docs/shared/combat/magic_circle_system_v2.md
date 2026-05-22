# Magic Circle System v2: The Cost Puzzle

> **Core Philosophy:** The Magic Circle is a **resource puzzle**. Every Glyph adds power, but every Glyph adds cost. The mage asks: *"Can I afford this?"*

---

## The Cost Puzzle

### Base Formula

```
Base MP = Core.baseCost

Total MP = Base MP
    × (1 + sum of Power Glyph cost penalties)
    × (1 + sum of Effect Glyph cost penalties)
    × (1 + sum of Control Glyph cost penalties)
    × (1 - Efficiency Glyph reduction)
```

> **Order doesn't matter for cost.** Only the set of Glyphs matters. But order DOES matter for effect resolution (see below).

### Cost Penalty Examples

| Glyph Type | Example | Power Gain | Cost Penalty |
|-----------|---------|-----------|-------------|
| **Core** | Fire | 10 damage | Base = 5 MP |
| **Power `+`** | Potentiate `+` | +20% damage | +15% MP cost |
| **Power `++`** | Potentiate `++` | +50% damage | +30% MP cost |
| **Power `+++`** | Potentiate `+++` | +100% damage | +60% MP cost |
| **Effect: Multi** | Target All | Hits all enemies | +250% MP cost |
| **Effect: Repeat** | Wave | 3 waves | +180% MP cost |
| **Effect: Chain** | Chain Lightning | Jumps to 2nd target | +120% MP cost |
| **Control: Degrade** | Fading | Each wave -25% | -10% MP cost (reduces!) |
| **Control: Escalate** | Building | Each wave +25% | +40% MP cost |
| **Control: Focus** | Concentrate | +30% crit | +25% MP cost |
| **Efficiency** | Streamline | — | -20% total MP cost |

### Real Spell Cost Examples

#### Example 1: Simple Fireball (Early Game)
```
Core: Fire (5 MP base)
Power: + (×1.15)

Total MP = 5 × 1.15 = 5.75 ≈ 6 MP
Damage = 10 × 1.20 = 12 fire damage
```
> Cheap. Reliable. Mage can cast this 10+ times.

#### Example 2: Meteor Strike (Mid Game)
```
Core: Fire (5 MP base)
Power: ++ (×1.30)
Power: ++ (×1.30)
Effect: Multi (×2.50)

Total MP = 5 × 1.30 × 1.30 × 2.50 = 21.1 ≈ 21 MP
Damage = 10 × 1.50 × 1.50 = 22.5 fire damage to ALL enemies
```
> Expensive. Only 2-3 casts per fight. But clears trash mobs.

#### Example 3: Tsunami Storm (Complex)
```
Core: Water (5 MP base, 8 damage)
Effect: Repeat ×3 waves (×1.80)
Effect: Multi-target (×2.50)
Secondary: Lightning (×1.40)
Control: Degrade (×0.90) — each wave -25%
Control: Escalate focus (×1.40) — waves 2-3 target fewer enemies

Total MP = 5 × 1.80 × 2.50 × 1.40 × 0.90 × 1.40 = 39.7 ≈ 40 MP

Wave 1: 8 water + 4 lightning = 12 dmg to ALL enemies
Wave 2: 6 water + 3 lightning = 9 dmg to 2 enemies (focus)
Wave 3: 4.5 water + 2.2 lightning = 6.7 dmg to 1 enemy (single target)
```
> 40 MP. One cast. But it's a tactical nuke that adapts across waves.

---

## Glyph Types

### 1. Core Glyphs (The Foundation)

Every spell has exactly **1 Core**. Determines element and base damage. Cores also have tiers — higher tier = more base damage AND more base MP.

| Core | T1 Dmg | T1 MP | T2 Dmg | T2 MP | T3 Dmg | T3 MP | Element |
|------|--------|-------|--------|-------|--------|-------|---------|
| **Ignis** (Fire) | 10 | 5 | 14 | 7 | 20 | 10 | Fire |
| **Glacius** (Ice) | 8 | 5 | 11 | 7 | 16 | 10 | Ice (slow) |
| **Fulgur** (Lightning) | 12 | 6 | 17 | 9 | 24 | 13 | Lightning (chain) |
| **Terra** (Earth) | 9 | 5 | 13 | 7 | 18 | 10 | Earth (shred) |
| **Aer** (Wind) | 7 | 4 | 10 | 6 | 14 | 8 | Wind (evasion) |
| **Lux** (Light) | 6 | 5 | 9 | 7 | 13 | 10 | Light (heal) |
| **Umbra** (Dark) | 14 | 7 | 20 | 10 | 28 | 14 | Dark (lifesteal) |
| **Aqua** (Water) | 8 | 5 | 12 | 7 | 17 | 10 | Water (DoT) |

### 2. Power Glyphs (More Damage, More Cost)

Stackable. Each adds multiplicative damage AND multiplicative cost.

**But here's the key: Glyphs have TIERS too.** Just like skills, you choose which tier to drag into your circle.

| Tier | Damage Multiplier | Cost Multiplier | Unlock By |
|------|------------------|-----------------|-----------|
| `+` Potentiate | ×1.20 | ×1.15 | Learned (base) |
| `++` Amplify | ×1.50 | ×1.30 | Cast `+` 300× |
| `+++` Surge | ×2.00 | ×1.60 | Cast `++` 1,000× |
| `✦` Transcend | ×3.00 | ×2.20 | Cast `+++` 3,000× |
| `✦5` Apotheosis | ×4.50 | ×3.00 | Cast `✦` 10,000× |
| `✦6` ... | ×6.00 | ×4.00 | Cast `✦5` 30,000× |

> **Infinite tiers.** A level 300 mage's Power Glyph might be `✦12` — ×15 damage, ×10 cost. They can choose to use the cheap `+` for trash mobs or the devastating `✦12` for bosses.

**In the composer, you see ALL unlocked tiers:**
```
┌─ Glyph Palette ────────────────────────┐
│ Power                                  │
│  [+]  +20% dmg, +15% cost     [drag]   │
│  [++] +50% dmg, +30% cost     [drag]   │
│  [+++] +100% dmg, +60% cost   [drag]   │
│  [✦]  +200% dmg, +120% cost   [drag]   │
│                                        │
│ Effect                                 │
│  [Multi] All targets, ×2.50   [drag]   │
│  [Repeat] 3 waves, ×1.80      [drag]   │
│                                        │
│ Control                                │
│  [Degrade] -25%/wave, ×0.90   [drag]   │
│  [Escalate] +25%/wave, ×1.40  [drag]   │
└────────────────────────────────────────┘
```

> Two `+` Glyphs = ×1.20 × 1.20 = ×1.44 damage. ×1.15 × 1.15 = ×1.32 cost. But two `++` Glyphs = ×1.50 × 1.50 = ×2.25 damage, ×1.30 × 1.30 = ×1.69 cost. The tier choice matters.

### 3. Effect Glyphs (New Mechanics)

Add spell behaviors. Each Effect Glyph has tiers that improve the effect but increase cost.

| Glyph | T1 | T2 | T3 | T4 |
|-------|----|----|----|----|
| **Multi** | Hits all, ×2.50 | Hits all, ×2.30 | Hits all, ×2.10 | Hits all, ×1.90 |
| **Repeat** | 3 waves, ×1.80 | 4 waves, ×2.20 | 5 waves, ×2.60 | 6 waves, ×3.00 |
| **Chain** | 1 jump, ×1.20 | 2 jumps, ×1.50 | 3 jumps, ×1.80 | 4 jumps, ×2.10 |
| **Pierce** | 25% ignore, ×1.30 | 40% ignore, ×1.50 | 55% ignore, ×1.70 | 70% ignore, ×1.90 |
| **Leech** | 10% heal, ×1.40 | 15% heal, ×1.60 | 20% heal, ×1.80 | 25% heal, ×2.00 |
| **Mark** | +15% dmg, ×1.15 | +25% dmg, ×1.25 | +35% dmg, ×1.35 | +50% dmg, ×1.50 |
| **Secondary** | 50% element, ×1.40 | 75% element, ×1.60 | 100% element, ×1.80 | 125% element, ×2.00 |

> **Higher tier = better effect, higher cost.** But notice Multi T4 has LOWER cost than T1 — it's a different trade-off (same effect, cheaper but harder to unlock).

### 4. Control Glyphs (How It Behaves)

Modify execution. Higher tiers = stronger modifiers.

| Glyph | T1 | T2 | T3 | T4 |
|-------|----|----|----|----|
| **Degrade** | -25%/wave, ×0.90 | -20%/wave, ×0.85 | -15%/wave, ×0.80 | -10%/wave, ×0.75 |
| **Escalate** | +25%/wave, ×1.40 | +35%/wave, ×1.55 | +50%/wave, ×1.70 | +70%/wave, ×1.85 |
| **Focus** | +25% crit, ×1.25 | +40% crit, ×1.40 | +55% crit, ×1.55 | +75% crit, ×1.70 |
| **Dispersion** | -20% dmg, +1 target, ×1.10 | -15% dmg, +2 targets, ×1.20 | -10% dmg, +3 targets, ×1.30 | -5% dmg, +4 targets, ×1.40 |
| **Hasten** | Next turn, ×1.50 | Same turn, ×2.00 | Same turn -30% cost, ×1.70 | Same turn -50% cost, ×1.40 |
| **Delay** | +50% dmg, 2 turns, ×1.20 | +75% dmg, 2 turns, ×1.35 | +100% dmg, 1 turn, ×1.50 | +150% dmg, instant, ×1.80 |
| **Overcharge** | +100% dmg, HP cost, ×1.00 | +150% dmg, HP cost, ×1.00 | +200% dmg, HP cost, ×1.00 | +300% dmg, HP cost, ×1.00 |

### 5. Efficiency Glyphs (Reduce Cost)

Rare. The puzzle-solver's best friend. Also tiered.

| Glyph | T1 | T2 | T3 | T4 |
|-------|----|----|----|----|
| **Streamline** | -20%, ×0.80 | -30%, ×0.70 | -40%, ×0.60 | -50%, ×0.50 |
| **Condense** | -30% cost, -15% dmg, ×0.70 | -35% cost, -10% dmg, ×0.65 | -40% cost, -5% dmg, ×0.60 | -45% cost, -0% dmg, ×0.55 |
| **Recycle** | 50% no cost, ×0.85 | 65% no cost, ×0.80 | 80% no cost, ×0.75 | 90% no cost, ×0.70 |

---

## The Composer UI: Category → Glyph → Tier

When building a spell, the left panel shows a three-level hierarchy:

```
┌─ Glyph Palette ──────────────────────────────────┐
│                                                   │
│ ▼ Power                                           │
│   ▼ Damage Increaser                              │
│     [+]  +20% dmg, +15% cost     [drag] ✓ known  │
│     [++] +50% dmg, +30% cost     [drag] ✓ known  │
│     [+++] +100% dmg, +60% cost   [locked] 847/1000│
│                                                   │
│ ▼ Effect                                          │
│   ▼ Target All                                    │
│     [Multi T1] All, ×2.50 cost   [drag] ✓ known  │
│     [Multi T2] All, ×2.30 cost   [drag] ✓ known  │
│     [Multi T3] All, ×2.10 cost   [locked]        │
│                                                   │
│ ▼ Control                                         │
│   ▼ Wave Behavior                                 │
│     [Degrade T1] -25%/wave, ×0.90 [drag] ✓ known │
│     [Degrade T2] -20%/wave, ×0.85 [drag] ✓ known │
│                                                   │
│ ▼ Efficiency                                      │
│   ▼ Cost Reduction                                │
│     [Streamline T1] -20%, ×0.80   [drag] ✓ known │
│                                                   │
└───────────────────────────────────────────────────┘
```

**Flow:**
1. Click category (Power, Effect, Control, Efficiency)
2. Click glyph type (Damage Increaser, Target All, Wave Behavior...)
3. See all unlocked tiers with their stats
4. Drag the specific tier into the circle

**Tooltip on hover:**
```
┌─ [++] Amplify ───────────┐
│ Tier 2 of Power Glyph    │
│                          │
│ Damage: ×1.50            │
│ Cost: ×1.30              │
│                          │
│ Unlocked: 847/1000 casts │
│ Next tier: +++ (×2.00)   │
└──────────────────────────┘
```

---

## The Puzzle: Why This Is Fun

### Scenario: You Have 25 MP Max

**Option A: Safety**
```
Core: Fulgur (6 base)
Power: + (×1.15)
Efficiency: Streamline (×0.80)

Total: 6 × 1.15 × 0.80 = 5.5 MP
Damage: 12 × 1.20 = 14.4 lightning
```
> Cast 4 times. Safe. Boring. But reliable.

**Option B: Burst**
```
Core: Umbra (7 base)
Power: ++ (×1.30)
Effect: Multi (×2.50)

Total: 7 × 1.30 × 2.50 = 22.8 MP
Damage: 14 × 1.50 = 21 dark to ALL enemies
```
> Cast once. Huge. Then basic attacks for 3 turns while MP recovers.

**Option C: The Puzzle Solution**
```
Core: Aqua (5 base)
Effect: Repeat (×1.80)
Effect: Multi (×2.50)
Control: Degrade (×0.90)
Efficiency: Streamline (×0.80)

Total: 5 × 1.80 × 2.50 × 0.90 × 0.80 = 16.2 MP
```
> 3 waves, all enemies, degrading, under budget. Clever.

### The Decision Matrix

| Question | Glyph Answer |
|----------|-------------|
| "I need more damage" | Add Power `+` or `++` |
| "I can't afford this" | Add Efficiency, or remove an Effect |
| "I want to hit everyone" | Add Multi — but can you afford ×2.50? |
| "I want a second element" | Add Secondary — but that's ×1.40 |
| "My spell is too expensive" | Add Degrade control (saves MP) or Condense |
| "I want crits" | Add Focus — but is the +25% crit worth ×1.25 cost? |

---

## Effect Resolution Order

Cost is calculated from the SET of Glyphs. But effects resolve in a specific order:

```
1. Core damage calculated
2. Power multipliers applied
3. Secondary element added (if present)
4. Targeting determined (Single → Multi → Chain)
5. Control modifiers applied (Focus crit, Degrade scaling, etc.)
6. Repeat/Chain/Delay execution scheduled
7. Leech healing calculated
```

> **Example:** Degrade + Escalate on the same spell = Degrade applies first, then Escalate modifies the degraded values. The result is complex but deterministic.

---

## Tier Expansion (Magic Growth)

As the mage's **Magic Tier** increases, they unlock more Ring slots. But slots alone don't make spells stronger — they allow **more Glyphs**, which means **more complex puzzles**.

| Tier | Slots | What You Can Build |
|------|-------|-------------------|
| 1 | 1 (Core only) | Single element, no frills |
| 3 | 3 | Core + Power + Effect |
| 7 | 7 | Core + 2 Power + 2 Effect + Control + Efficiency |
| 13 | 13 | Core + 3 Power + 3 Effect + 2 Control + 2 Efficiency + Secondary |
| 19 | 19 | Core + 4 Power + 4 Effect + 3 Control + 3 Efficiency + 2 Secondary |
| 25 | 25 | Core + 5 Power + 5 Effect + 4 Control + 4 Efficiency + 3 Secondary + 1 Wild |

> **Wild Slot** (Tier 25): Can hold ANY Glyph type, breaking normal slot limits.

---

## Example Spells (The Puzzle Solutions)

### ☄️ Meteor Strike (Elara's Signature)
```
Core: Ignis T2 (Fire, 14 dmg, 7 MP base)
Power: ++ (×1.50 dmg, ×1.30 cost)
Power: + (×1.20 dmg, ×1.15 cost)  ← She uses + here to save MP
Effect: Multi T1 (all, ×2.50)

MP: 7 × 1.30 × 1.15 × 2.50 = 26.2
Damage: 14 × 1.50 × 1.20 = 25.2 fire to ALL
```

> **Why `++` and `+` instead of `++` and `++`?** Because `++` + `++` would cost 7 × 1.30 × 1.30 × 2.50 = 29.6 MP. Too expensive. Using `+` for the second slot saves 3.4 MP for only a small damage loss. **This is the puzzle.**

### ❄️ Frost Prison
```
Core: Glacius (Ice)
Power: +
Effect: Multi
Control: Focus

MP: 5 × 1.15 × 2.50 × 1.25 = 18
Damage: 8 × 1.20 = 9.6 ice to ALL
Bonus: +25% crit chance, slow on hit
```

### ⚡ Thunder Cage
```
Core: Fulgur (Lightning)
Power: +++
Effect: Chain
Effect: Chain
Control: Escalate

MP: 6 × 1.60 × 1.20 × 1.20 × 1.40 = 19.3
Damage: 12 × 2.00 = 24 lightning
Chain: Jumps to 2 targets, then 2 more
Escalate: Each jump +25% damage
```

### 🌊 Tsunami Storm (The Complex One)
```
Core: Aqua (Water)
Effect: Repeat (3 waves)
Effect: Multi
Secondary: Fulgur (Lightning)
Control: Degrade (waves weaken)
Control: Escalate Focus (later waves target fewer)

MP: 5 × 1.80 × 2.50 × 1.40 × 0.90 × 1.40 = 39.7

Wave 1: All enemies, 12 damage (water+lightning)
Wave 2: 2 enemies, 9 damage
Wave 3: 1 enemy, 6.7 damage
```

### 🩹 Mom's Hug (Heal)
```
Core: Lux (Light)
Power: ++
Effect: Multi (heals all allies)
Efficiency: Streamline

MP: 5 × 1.30 × 2.50 × 0.80 = 13
Heal: 6 × 1.50 = 9 HP to ALL allies
```

### 💀 The Hell (Endgame)
```
Core: Umbra (Dark)
Power: ✦
Power: +++
Effect: Multi
Effect: Leech
Control: Overcharge

MP: 7 × 2.20 × 1.60 × 2.50 × 1.40 × 1.00 = 86.2
Damage: 14 × 3.00 × 2.00 = 84 dark to ALL
Leech: Heals 10% of 84 = 8.4 HP
Overcharge: Extra damage costs HP instead of MP
```

---

## Comparison: Mage vs. Warrior (Resource Puzzle)

| | Warrior | Mage |
|---|---|---|
| **Resource** | Stamina (regens fast) | MP (limited) |
| **Puzzle** | "Which tier do I use?" ×2 cheap vs ×13 expensive | "Can I afford this composition?" |
| **Mistake** | Used too much STA, rest 1 turn | Used too much MP, cast basic spells for 5 turns |
| **Optimization** | Use ×2 for weak enemies, ×7 for bosses | Use cheap spells for trash, puzzle-solve for elites |

---

## Open Questions

1. **Should Power Glyphs stack additively or multiplicatively?** Current spec: multiplicatively (×1.20 × 1.20 = ×1.44). This makes stacking expensive but rewarding.
2. **Should cost multipliers stack additively or multiplicatively?** Current spec: multiplicatively (×1.15 × 1.15 = ×1.32). This prevents infinite cheap stacking.
3. **How many Efficiency Glyphs can stack?** Max 2? Or unlimited but with diminishing returns?
4. **Should Secondary Element damage scale with Power Glyphs?** Yes — it's part of the total damage calculation.
5. **How does Repeat work with Multi?** Each wave hits all enemies. Total damage = wave damage × number of waves.
