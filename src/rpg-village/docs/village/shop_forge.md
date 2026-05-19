# Shop & Forge Specification

## 1. Shop Mechanics

The Shop allows the village to purchase consumables and equipment using gold.

### Unlock Condition
- Unlocked after completing the first story expedition (`exp_tutorial_cave`).

### Stock & Gating
Stock scales with the village **Blacksmith** building level:
- **Blacksmith Level 0:**
  - Consumables: Tiny HP Potion (10g), Tiny MP Potion (15g), Teleport Scroll (50g).
  - Gear: Tier 1 (Wooden) Weapons (50g-120g) & Armor (40g-100g).
- **Blacksmith Level >= 1:**
  - Unlocks Tier 2 (Iron) Weapons (150g-360g) & Armor (120g-300g).

---

## 2. Forge Mechanics

The Forge allows players to upgrade (refine) equipment.

### Unlock Condition
- Unlocked when `blacksmith` level is >= 1.

### Equipment Leveling
- Level range: `+0` to `+10`.
- Each upgrade increases item power/efficacy by **10%** (multiplicatively):
  $$\text{upgradeMult} = 1.1^{\text{level}}$$
- This multiplier directly scales the item's primary attributes (Strength, Defense, HP/MP, Magic Power).

### Upgrade Costs
The cost to refine an item to level $L+1$ depends on its material tier:

| Material | Gold Cost | Materials Cost |
| :--- | :--- | :--- |
| **Wooden** | $30 \times (L+1)$ | Wood: $10 \times (L+1)$ |
| **Iron** | $75 \times (L+1)$ | Wood: $5 \times (L+1)$, Stone: $5 \times (L+1)$, Iron Ore: $3 \times (L+1)$ |
| **Steel** | $150 \times (L+1)$ | Stone: $10 \times (L+1)$, Steel Ingot: $3 \times (L+1)$ |
| **Gold** | $300 \times (L+1)$ | Stone: $15 \times (L+1)$ |
| **Mythril** | $500 \times (L+1)$ | Mythril: $2 \times (L+1)$ |

### Interaction Constraints
- Only items in the main **Inventory** can be refined. Items equipped on a hero must be unequipped first to undergo refinement.
