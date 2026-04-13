# RPG Idle: Infinite Adventure - Game Manual

Welcome to **RPG Idle**, a tactical incremental RPG. This manual details the core mechanics, formulas, and progression systems of the game.

## 🕹️ Core Game Loop
1. **Infinite Adventure**: Battle through endless milestones to earn Gold, EXP, and Cores.
2. **Hero Roster**: Recruit diverse heroes and customize their stats and skills.
3. **Village Upgrades**: Spend Cores to permanently boost your team's power.
4. **Item Shop**: Buy potions to sustain your party during deep runs.

---

## 📊 Character Stats

- **HP (Health Points)**: Your survival. If all heroes reach 0 HP, the adventure ends.
- **MP (Mana Points)**: Used to cast powerful magic and physical skills.
- **Strength (STR)**: Increases physical damage dealt.
- **Speed (SPD)**: Determines turn frequency and evasion chance.
- **Defense (DEF)**: Reduces incoming physical and magic damage.
- **Magic Power (MAG)**: Increases magic damage and healing potency.

---

## ⚔️ Combat Mechanics

### Turn Order
Combat is turn-based. Turn frequency is determined by the **Speed** stat. Entities with higher speed act more often.

### Damage Calculation
The final damage is calculated using an **Attack/Defense Ratio ($R$)**:
$R = \frac{Total Attack}{Total Defense}$

The base damage is then modified by a piecewise linear multiplier:
- **$R \ge 10$**: Extreme advantage. Multiplier = $R/10$.
- **$R \in [5, 10)$**: Full damage. Multiplier = $1.0$.
- **$R \in [1, 5)$**: Diminishing returns based on defense.
- **$R < 1$**: Highly resisted. Multiplier = $R \times 0.5$.

### Evasion Chance
Evasion is a probability to completely avoid an attack, based on the speed ratio between defender and attacker:
- If defender is slower than half the attacker's speed, evasion is **0%**.
- If defender is faster, evasion scales up from **10%** significantly.

---

## 🔮 Elemental System
Magic skills and enemies can have one of four elements. Advantage adds **50% extra damage**, while disadvantage **reduces damage by 50%**.

### The Elemental Cycle
> **Fire** beats **Wind**  
> **Wind** beats **Storm**  
> **Storm** beats **Water**  
> **Water** beats **Fire**  

**Neutral** entities neither deal extra damage nor have resistances.

---

## 📈 Progression & Scaling

### Infinite Adventure Milestones
The "Infinite Adventure" introduces new mechanics in thematic blocks:
- **Milestones 1-10**: Tutorial phase. Enemies are neutral and stats are basic.
- **Milestones 11-15 (The Wall)**: Focus on high **Defense**. Requires high Strength or Magic to break through.
- **Milestones 16-20 (The Brute)**: Focus on high **Strength**. Enemies act slowly but hit extremely hard.
- **Milestones 21-40**: Elemental Introduction. Blocks of 5 rounds themed around Fire, Water, Wind, and Storm.
- **Milestones 41+**: True Infinite mode with scaling multipliers and randomized elements.

### Rewards
- **Gold**: Earned per victory. Used to recruit heroes and buy items.
- **EXP**: Earned by all heroes (including partial EXP on defeat). Used to Level Up.
- **Cores**: Earned by defeating **Bosses** (every 5 milestones). Used for permanent Village Upgrades.

---

## 🛠️ Hero Development
- **Level Up**: Grants **Stat Points** and **Skill Points**.
- **Stat Points**: Manually increase base stats in the Hero Details screen.
- **Skill Points**: Unlock new skills or enhance existing ones in the Skills screen.
- **Skill Tiers**: Skills range from Tier 1 to Tier 3, with increasing power and MP costs.
