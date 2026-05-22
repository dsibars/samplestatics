# Physical Skill Tree Specification

## Overview

The current flat skill list is being refactored into a **branching skill tree** focused exclusively on **physical combat abilities**. Magic spells are moving to the separate [Magic Circle System](magic_circle_system.md). This document defines the tree structure, progression rules, and UI representation.

> **Status:** Design Phase — Not yet implemented.

---

## Design Goals

1. **Visual Progression**: Players should see a clear path of growth, not a scrollable list.
2. **Meaningful Choices**: Branching paths force players to specialize (fast striker vs. heavy hitter vs. tactician).
3. **Reward Milestones**: Reaching branch endpoints or cross-branch nodes unlocks powerful capstone skills.
4. **Backward Compatible**: Existing save data with learned skills must map cleanly into the new tree.

---

## Tree Structure

The physical skill tree has **3 vertical tiers** (rows 0 → 1 → 2) and **4 horizontal branches** (columns). Each branch represents a combat philosophy.

```
Tier 3 (Capstones)          [Blade Dance]        [Berserker Rage]        [Phalanx]        [Shadow Strike]
                                 ↑                    ↑                    ↑                ↑
Tier 2 (Advanced)      [Double Attack]──┬──[Whirlwind]   [Power Blow]    [Shield Bash]    [Poison Dart]
                                              │                              │
Tier 1 (Basics)         [Basic Attack]───────┴────────────────────────────────┘
                               │
                        (Free — all heroes)
```

### Branch Definitions

| Branch | Color | Philosophy | Stat Focus |
|--------|-------|------------|------------|
| **Speed** | 🔶 Orange | Strike fast, strike often | Speed |
| **Power** | 🔴 Red | Overwhelming single-target force | Strength |
| **Defense** | 🟢 Teal | Control the battlefield, protect allies | Defense |
| **Tricker** | 🟣 Purple | Status effects, deception, precision | Speed / Strength |

### Node Definitions

#### Tier 1 — Fundamentals

| Node ID | Name | Branch | MP | Effect | Unlock Cost |
|---------|------|--------|-----|--------|-------------|
| `basic_attack` | Basic Attack | All (root) | 0 | 1.0× STR, single target | Free |

#### Tier 2 — Specialization

| Node ID | Name | Branch | Parent | MP | Effect | Unlock Cost |
|---------|------|--------|--------|-----|--------|-------------|
| `double_attack` | Double Attack | Speed | `basic_attack` | 10 | 0.7× STR × 2 hits | 1 SP |
| `whirlwind` | Whirlwind | Speed | `double_attack` | 15 | 0.6× STR, all enemies | 2 SP |
| `power_blow` | Power Blow | Power | `basic_attack` | 12 | 1.5× STR, single target | 1 SP |
| `shield_bash` | Shield Bash | Defense | `basic_attack` | 8 | 0.8× STR + stun chance | 1 SP |
| `poison_dart` | Poison Dart | Tricker | `basic_attack` | 5 | 0.8× STR + poison | 1 SP |

#### Tier 3 — Mastery (Capstones)

| Node ID | Name | Branch | Parent | MP | Effect | Unlock Cost |
|---------|------|--------|--------|-----|--------|-------------|
| `blade_dance` | Blade Dance | Speed | `whirlwind` | 35 | 0.4× STR × 4 hits, all enemies | 3 SP |
| `berserker_rage` | Berserker Rage | Power | `power_blow` | 25 | 2.0× STR, self-buff next 3 turns | 3 SP |
| `phalanx` | Phalanx | Defense | `shield_bash` | 20 | 0.6× STR, all allies gain +DEF buff | 3 SP |
| `shadow_strike` | Shadow Strike | Tricker | `poison_dart` | 10 | 0.5× STR, steal item + high crit | 3 SP |

### Cross-Branch Connections (Future)

After all 4 capstones are unlocked, a hidden **Tier 4** node appears:

| Node ID | Name | Requires | MP | Effect | Unlock Cost |
|---------|------|----------|-----|--------|-------------|
| `master_of_arms` | Master of Arms | All 4 capstones | 40 | 1.2× STR, all enemies, applies random debuff | 5 SP |

---

## Progression Rules

1. **Root Access**: All heroes start with `basic_attack` unlocked for free.
2. **Parent Requirement**: A node can only be unlocked if its parent node is already learned.
3. **Branching**: From `basic_attack`, the hero may choose **any** Tier 2 node. They are **not** restricted to a single branch.
4. **Skill Points (SP)**: Earned when heroes level up. Cost scales with tier.
5. **Upgrading**: Each learned node can be upgraded from Level 1 → Level 5. Each level increases damage by +5% and may reduce MP cost by 1 (at Lv 3 and Lv 5).
6. **Max Level**: Capstone nodes (Tier 3) max at Level 3 instead of 5.

### SP Cost Table

| Tier | Base Unlock Cost | Upgrade Cost (per level) |
|------|------------------|--------------------------|
| 1    | Free             | —                        |
| 2    | 1 SP             | 1 SP                     |
| 3    | 3 SP             | 2 SP                     |
| 4    | 5 SP             | 3 SP                     |

---

## Data Model Changes

### `SKILLS_DATA` Registry Update

Each entry gains:
- `treePosition: { branch: 'speed'|'power'|'defense'|'tricker', tier: 1|2|3|4 }`
- `parentId: string | null` (replaces the old flat `dependency` string)
- `isCapstone: boolean`

```javascript
// Example
blade_dance: {
    id: 'blade_dance',
    category: 'physical',
    stat: 'strength',
    baseMultiplier: 0.4,
    mpCost: 35,
    tier: 3,
    targetType: 'all_enemies',
    treePosition: { branch: 'speed', tier: 3 },
    parentId: 'whirlwind',
    isCapstone: true,
    unlockCost: 3
}
```

### Migration from Current Save Data

Current saves store `hero.skills` as `{ skillId: level }`. The migration is trivial:
- All existing learned skills remain learned.
- Nodes that become **magic** (e.g., `small_fire_ball`) are **deprecated** — they remain in the save but are no longer usable in physical combat. A migration script moves them to the hero's "spell memory" for the Magic Circle system (if the Arcane Sanctum is built).
- The UI tree renderer simply checks `hero.skills[skillId]` to determine if a node is learned.

---

## UI Specification

### Tree Layout

- **Canvas**: A scrollable container with fixed node positions.
- **Nodes**: Circular icons (~56px), color-coded by branch.
- **Connections**: SVG lines (quadratic bezier) from parent to child.
- **Node States**:
  - **Locked**: 30% opacity, grayscale, dashed border.
  - **Available**: Pulsing glow border in branch color.
  - **Learned**: Filled with branch color, level badge (Lv.1–5).
  - **Maxed**: Gold border + subtle particle aura.
- **Interaction**: Click a node to open a tooltip panel showing:
  - Skill name, description, MP cost, damage formula.
  - "Unlock (X SP)" or "Upgrade (X SP)" button.
  - Parent requirement warning if not met.

### Responsive Behavior

- **Desktop**: Full tree visible, ~800px wide canvas.
- **Tablet**: Horizontal scroll if needed.
- **Mobile**: Collapsible branches — tap a branch name to expand its nodes.

---

## What Was Removed (Magic Skills)

All elemental magic skills (`fire_ball`, `water_ball`, `wind_ball`, `storm_ball`, `heal`, `haste`) are **removed from the physical tree**. They are not deleted from the codebase — they migrate to the **Magic Circle System** where they become **spell templates** created through rune composition. See [magic_circle_system.md](magic_circle_system.md).

Support skills (`heal`, `haste`) may optionally remain as a **utility branch** in the physical tree if desired, but the spec recommends moving them to Magic Circle for consistency.

---

## Open Questions

1. Should `steal` remain in the Tricker branch or move to a future "Roguery" expansion?
2. Do we want a "respec" mechanic (reset all SP for a gold cost)?
3. Should cross-branch nodes (e.g., a Speed+Defense hybrid) exist before Tier 4?
