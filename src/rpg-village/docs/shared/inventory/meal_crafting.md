# Meal Crafting Specification

## Overview
The meal crafting system allows players to cook meals from raw ingredients and feed them to idle heroes for temporary combat buffs.

## Architecture
- **Facade**: `GameEngine.cookMeal(recipeId)` and `GameEngine.consumeMeal(mealId)`
- **Data**: `MEAL_RECIPES` in `GameConstants.js`
- **Buff Storage**: `Hero.mealBuffs` array

## Cooking
1. `cookMeal(recipeId)` looks up the recipe in `MEAL_RECIPES`.
2. Validates that all ingredients are present in inventory.
3. Deducts ingredients and adds 1 meal item to food inventory.
4. Tracks `craft_items` objective.

## Recipes
| Meal | Ingredients | Buff | Duration |
|------|------------|------|----------|
| `meal_bread` | Grain | +STR | 3 battles |
| `meal_stew` | Grain + Meat | +DEF | 3 battles |
| `meal_pie` | Meat + Grain | +HP | 3 battles |
| `meal_feast` | Multiple | +All Stats | 5 battles |

## Consumption
1. `consumeMeal(mealId)` validates the meal exists in inventory.
2. Deducts 1 meal from inventory.
3. Applies buffs to **all idle heroes** (heroes not on expedition).
4. Buffs of the same stat type replace existing buffs (no stacking).
5. Buffs are stored in `hero.mealBuffs` as `{ stat, value, battlesRemaining }`.
6. `Hero.recalculateStats()` is called to apply buffs to final stats.

## Buff Decay
- `HeroService.tickAllMealBuffs()` is called after each combat.
- Each buff's `battlesRemaining` is decremented by 1.
- When `battlesRemaining` reaches 0, the buff is removed and stats are recalculated.

## Code Locations
- `js/engine/GameEngine.js` — `cookMeal()`, `consumeMeal()`
- `js/engine/heroes/services/HeroService.js` — `tickAllMealBuffs()`
- `js/engine/heroes/models/Hero.js` — `recalculateStats()` (applies meal buffs)
