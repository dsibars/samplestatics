# Food Data

Food items are consumed by the village population every day. Additionally, raw grain can be crafted into **Meals** that provide combat buffs to heroes.

## Raw Food

| ID | Name | Saturation | Notes |
| :--- | :--- | :--- | :--- |
| `food_raw_grain` | Grain | 1 | Base sustenance. Consumed 1 per villager per day. |

## Meal Crafting

Meals are crafted from the Inventory view by selecting `food_raw_grain`. Crafting consumes ingredients and produces a meal item. Meals can then be consumed via "Feed Heroes" to apply buffs to all idle heroes.

### Recipes

| ID | Name | Ingredients | Buff | Battles | Icon |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `meal_bread` | Bread | 2 Grain | +5% Max HP | 1 | 🍞 |
| `meal_stew` | Hearty Stew | 3 Grain, 1 Wood | +10% Max HP, +1 STR | 1 | 🍲 |
| `meal_pie` | Meat Pie | 4 Grain, 1 Stone | +10% Max HP, +1 DEF | 1 | 🥧 |
| `meal_feast` | Hero's Feast | 5 Grain, 2 Wood, 1 Stone | +15% Max HP, +2 STR, +2 DEF | 2 | 🍖 |

### Meal Buff Mechanics

- Buffs apply to **all idle heroes** when a meal is consumed.
- Buffs last for a fixed number of **battles** (not days).
- After each combat resolution, remaining battle counts tick down by 1.
- When battles reach 0, the buff is removed and hero stats are recalculated.
- Consuming a new meal of the same type **overwrites** existing buffs of overlapping stats (no stacking).
- Heroes on expedition cannot receive meal buffs until they return to idle status.

### Meal Buff Storage

Meal buffs are stored on each `Hero` as `mealBuffs: Array<{ stat, value, battlesRemaining }>`.
