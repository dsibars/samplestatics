# Shop & Forge Specification

## 1. Shop Mechanics

The Shop allows the village to purchase consumables and equipment using gold. It also provides a **Sell Resources** panel where players can sell raw materials and food for a small gold return.

### Unlock Condition
- Unlocked after completing the first story expedition (`exp_tutorial_cave`).

### Stock & Gating
Stock scales with the village **Blacksmith** building level:
- **Blacksmith Level 0:**
  - Consumables: Tiny HP Potion (10g), Tiny MP Potion (15g), Teleport Scroll (50g).
  - Gear: Tier 1 (Wooden) Weapons (50g-120g) & Armor (40g-100g).
- **Blacksmith Level >= 1:**
  - Unlocks Tier 2 (Iron) Weapons (150g-360g) & Armor (120g-300g).

### Sell Resources Panel

Players can sell raw resources in bulk. Prices are intentionally low (roughly 10-30% of a crafted item's cost) to discourage over-selling:

| Resource | Sell Price (per unit) |
| :--- | :--- |
| **Food (Raw Grain)** | 1 gold |
| **Wood** | 2 gold |
| **Stone** | 3 gold |

**Sell quantities offered:** 1 / 10 / 100 units per click.

**Constraints:**
- The player must have at least 1 unit of the resource to sell.
- Selling deducts the resource from the inventory immediately.
- Gold is added to the village treasury immediately.
- Resources cannot be sold below zero.

---

### Sell Items Panel

Players can sell **equipment and consumables** from their inventory for a fraction of their value. This is accessed via a "Sell" tab inside the Shop UI.

#### Sell Price Formula

**Consumables:** `floor(Shop Cost × 0.3)`  
**Equipment:** `floor(Base Shop Cost × 0.3 × 1.1^Level)`

Where:
- *Shop Cost* is the standard purchase price defined in the shop catalog.
- *Level* is the equipment refinement level (`+0` to `+10`).

#### Example Prices

| Item | Shop Cost | Sell Price (Lv 0) | Sell Price (Lv 5) | Sell Price (Lv 10) |
| :--- | :--- | :--- | :--- | :--- |
| Tiny HP Potion | 10g | 3g | — | — |
| Tiny MP Potion | 15g | 4g | — | — |
| Teleport Scroll | 50g | 15g | — | — |
| Wooden Dagger | 50g | 15g | 24g | 38g |
| Iron Broadsword | 240g | 72g | 115g | 186g |

#### UI Behavior

- The Sell tab displays the player's **inventory items only** (equipped items are not shown and must be unequipped first).
- Items are grouped by category (Consumables, Weapons, Helmets, Armors, Legwear, Shields) in a collapsible list.
- Selecting an item shows its details, stats, and the calculated **Sell Price**.
- Clicking "Sell" removes the item from inventory and adds gold immediately.
- A brief "Sold!" confirmation replaces the button for 600ms.

#### Constraints
- Only items in the main inventory can be sold. Equipped items must be unequipped via the Heroes or Forge view first.
- Consumables are sold one unit at a time.
- Equipment is sold as a single unique item (one per click).
- Selling cannot be undone.

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
