# Gambit System: Hero Behavior Automation

> **"Your heroes are only as smart as your rules."**

Inspired by Final Fantasy XII's Gambit system. Players write **condition → action → target** rules for each hero. In auto-combat, heroes execute their highest-priority matching rule.

---

## Core Concept

### The Rule Structure

```
IF [Condition] THEN [Action] ON [Target]
```

**Example Rules:**

| Priority | Condition | Action | Target |
|----------|-----------|--------|--------|
| 1 | Ally HP < 30% | Spell: "Mom's Hug" | Lowest HP Ally |
| 2 | Self MP < 20% | Item: MP Potion | Self |
| 3 | Enemies > 2 | Spell: "Meteor Strike" | — (multi-target) |
| 4 | Enemy weak to Fire | Spell: "Inferno" | Weakest Enemy |
| 5 | Always | Skill: Multiple Attack ×4 | Highest HP Enemy |

> **Priority 1 executes first.** If no match, check Priority 2. If no match, check Priority 3... If NOTHING matches, the hero uses **basic attack on a random target**.

### Why This Is Deep

| System | How Gambits Use It |
|--------|-------------------|
| **Skill Tiers** | Rule specifies WHICH tier: ×2 (cheap, safe) vs ×13 (expensive, deadly) |
| **Magic Circles** | You build spells SPECIFICALLY for gambits. "Hell's Paradise" = your "Enemies > 2" rule. |
| **Auto-Combat** | No longer dumb. As smart as your rules. |
| **Skip Combat** | Only viable if your gambits are good. Bad rules = dead heroes. |
| **Party Composition** | Warrior gambits differ from Mage gambits. Hybrid needs both. |

---

## Rule Components

### 1. Conditions

What must be true for the rule to trigger.

#### Enemy Conditions

| Condition | Parameter | Example |
|-----------|-----------|---------|
| **Enemy count** | `>`, `<`, `=` a number | "Enemies > 2" |
| **Enemy HP** | `%` threshold | "Enemy HP > 50%" |
| **Enemy element** | Fire/Ice/etc. | "Enemy is weak to Fire" |
| **Enemy type** | Beast/Undead/etc. | "Enemy is Undead" |
| **Enemy status** | Poison/Stun/etc. | "Enemy is Poisoned" |
| **Any enemy HP <** | `%` threshold | "Any enemy below 25% HP" |

#### Ally Conditions

| Condition | Parameter | Example |
|-----------|-----------|---------|
| **Ally HP** | `%` threshold | "Ally HP < 30%" |
| **Ally MP** | `%` threshold | "Ally MP < 20%" |
| **Self HP** | `%` threshold | "Self HP < 50%" |
| **Self MP** | `%` threshold | "Self MP < 25%" |
| **Self STA** | `%` threshold | "Self Stamina < 30%" |
| **Ally status** | Poison/etc. | "Ally is Poisoned" |

#### Battle Conditions

| Condition | Parameter | Example |
|-----------|-----------|---------|
| **Turn count** | `>`, `<`, `=` | "Turn > 5" |
| **Battle phase** | Boss/Elite/etc. | "Boss is present" |
| **Always** | — | "Always" (fallback rule) |

### 2. Actions

What the hero does when the condition is met.

| Action Type | Options | Example |
|-------------|---------|---------|
| **Skill** | Any known skill + tier | "Multiple Attack ×7" |
| **Spell** | Any Codex spell | "Meteor Strike" |
| **Item** | Any consumable | "MP Potion" |
| **Defend** | — | "Defend" (+50% DEF for 1 turn) |
| **Flee** | — | "Attempt Escape" |

> **Skill Tier Choice:** The rule specifies WHICH tier. "Multiple Attack ×2" for weak enemies, "Multiple Attack ×11" for bosses. This is the stamina management puzzle.

### 3. Targets

Who receives the action. Not needed for multi-target spells/skills.

| Target | Description |
|--------|-------------|
| **Self** | The hero using the rule |
| **Lowest HP Ally** | Most wounded party member |
| **Highest HP Ally** | Tank/frontline |
| **Lowest MP Ally** | Mage who needs mana |
| **Highest HP Enemy** | Boss or elite |
| **Lowest HP Enemy** | Finish off weaklings |
| **Weakest Enemy** | Lowest defense |
| **Enemy with [Element] Weakness** | Exploit vulnerability |
| **Random** | Any valid target |

---

## The Gambit UI

### Hero Detail Panel: Gambits Tab

```
┌─ Hero: Arthur ─────────────────────────┐
│ [Stats] [Equipment] [Skills] [Gambits]  │
│                                         │
│ Gambit Rules (max 6):                   │
│                                         │
│ 1. [✓] IF Ally HP < 30%               │
│        THEN Spell: "Mom's Hug"          │
│        ON Lowest HP Ally                │
│        [▲] [▼] [✏️] [🗑️]               │
│                                         │
│ 2. [✓] IF Self MP < 20%               │
│        THEN Item: MP Potion             │
│        ON Self                          │
│        [▲] [▼] [✏️] [🗑️]               │
│                                         │
│ 3. [✓] IF Enemies > 2                 │
│        THEN Spell: "Meteor Strike"      │
│        ON —                             │
│        [▲] [▼] [✏️] [🗑️]               │
│                                         │
│ 4. [✓] IF Enemy weak to Fire          │
│        THEN Spell: "Inferno"            │
│        ON Weakest Enemy                 │
│        [▲] [▼] [✏️] [🗑️]               │
│                                         │
│ 5. [✓] IF Always                      │
│        THEN Skill: Multiple Attack ×4   │
│        ON Highest HP Enemy              │
│        [▲] [▼] [✏️] [🗑️]               │
│                                         │
│ [+ Add Rule]                            │
│                                         │
│ Auto-Combat: [Enabled ✓]                │
│ Skip Combat: [Disabled]                 │
└─────────────────────────────────────────┘
```

### Creating a Rule

```
┌─ New Gambit Rule ──────────────────────┐
│                                         │
│ Priority: [ 3 ]                         │
│                                         │
│ IF [Enemies > ▼] [2 ▼]                  │
│                                         │
│ THEN [Spell ▼] ["Meteor Strike" ▼]      │
│                                         │
│ ON [— ▼]  (multi-target spell)          │
│                                         │
│ [Save Rule]                             │
└─────────────────────────────────────────┘
```

---

## Auto-Combat Behavior

### With Gambits

```
1. Check Rule 1 (highest priority)
   → Condition met? Execute action. End turn.
   → Not met? Continue.
2. Check Rule 2
   → Condition met? Execute action. End turn.
   → Not met? Continue.
...
6. No rules match → Basic Attack on random enemy.
```

### Without Gambits (Dumb Mode)

```
Always → Basic Attack on random enemy.
```

> **This is intentional.** Auto-combat without gambits is garbage. Players MUST engage with the system.

### Skip Combat

If **all 4 heroes** have **Auto-Combat enabled** and valid gambits:
- The battle resolves instantly (simulated).
- Results are shown: damage dealt, items used, HP lost, XP gained.
- No manual intervention.

> **Skip is only safe if your gambits are good.** Bad rules = heroes die in auto-resolve.

---

## Gambit Design Philosophy

### The Physical Hero Gambit

```
Arthur (Warrior, High Stamina)

1. IF Self Stamina < 20%
   THEN Skill: Multiple Attack ×2
   ON Highest HP Enemy
   → Conserve stamina. Use cheap tier.

2. IF Enemy HP > 70%
   THEN Skill: Multiple Attack ×7
   ON Highest HP Enemy
   → Big enemy? Use big hits.

3. IF Always
   THEN Skill: Multiple Attack ×4
   ON Highest HP Enemy
   → Default: sustainable damage.
```

### The Mage Gambit

```
Elara (Mage, High MP, Limited)

1. IF Ally HP < 40%
   THEN Spell: "Mom's Hug"
   ON Lowest HP Ally
   → Heal first. Always.

2. IF Self MP < 30%
   THEN Item: MP Potion
   ON Self
   → Don't run dry.

3. IF Enemies > 3
   THEN Spell: "Meteor Strike" (T2 Power, T1 Multi)
   ON —
   → Trash mob clear. Budget version.

4. IF Boss Present
   THEN Spell: "Inferno" (T3 Power, T2 Multi)
   ON Boss
   → Expensive but boss needs to die.

5. IF Always
   THEN Spell: "Spark" (cheap, T1)
   ON Weakest Enemy
   → Fallback: cheap damage.
```

### The Hybrid Gambit

```
Thorne (Hybrid, Body Inscription: Fire)

1. IF Self MP < 15% OR Self Stamina < 15%
   THEN Skill: Multiple Attack ×2
   ON Highest HP Enemy
   → Both bars low? Use cheap physical.

2. IF Enemies > 2 AND Self MP > 30%
   THEN Skill: Multiple Attack ×8 (inscribed Fire)
   ON —
   → Burn everything. Costs STA + MP.

3. IF Boss HP > 50% AND Self MP > 50%
   THEN Spell: "World Ender" (max power)
   ON Boss
   → All resources? Nuke.

4. IF Always
   THEN Skill: Multiple Attack ×5
   ON Highest HP Enemy
   → Sustainable hybrid damage.
```

---

## Unlocking Gambits

Gambits are not available from the start. They unlock progressively:

| Unlock | How | What It Means |
|--------|-----|---------------|
| **Rule Slot 1** | Hero Level 5 | One rule. Simple automation. |
| **Rule Slot 2** | Hero Level 10 | Two rules. Basic priority. |
| **Rule Slot 3** | Hero Level 15 | Three rules. Real strategy. |
| **Rule Slot 4** | Hero Level 20 | Four rules. Complex combos. |
| **Rule Slot 5** | Hero Level 25 | Five rules. Fine-tuned. |
| **Rule Slot 6** | Hero Level 30 | Six rules. Maximum control. |
| **Skip Combat** | All 4 heroes have 4+ rules each | Unlock "Skip" for expeditions. |

> **Gambits are the endgame of combat strategy.** By Level 30, your heroes are autonomous — but only if you programmed them well.

---

## Why This System Is Brilliant

| Feature | Why It Matters |
|---------|---------------|
| **Skill Tiers** | Gambits choose ×2 vs ×13. Stamina management becomes strategic. |
| **Magic Circles** | You build spells FOR gambits. "Meteor Strike" exists because you need an AoE rule. |
| **Party Composition** | Warrior gambits ≠ Mage gambits. Hybrids need both. Composition matters. |
| **Auto-Combat** | Not dumb. As smart as you made it. |
| **Skip Combat** | Only works with good gambits. Bad rules = punishment. |
| **Depth Without Tedium** | Set once, works forever. But tweaking after every new spell is rewarding. |

---

## Open Questions

1. **Should there be a "copy gambits" feature?** Copy all rules from Arthur to Borin?
2. **Should conditions support AND/OR logic?** "Ally HP < 30% AND Self MP > 20%"?
3. **Should there be gambit presets?** "Tank preset", "Healer preset", "Nuke preset"?
4. **Can enemies have gambits?** Elite enemies use simple rules (heal if HP < 50%)?
5. **Should there be a gambit test mode?** Simulate 10 battles with current rules?
