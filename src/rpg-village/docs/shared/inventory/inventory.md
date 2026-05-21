# Inventory System Specification

## Overview
The Inventory system manages all items, materials, equipment, and consumables for the village. It enforces storage limits, handles stackable vs. unique items, and provides the bridge between the village economy and hero equipment.

## Architecture
- **Service**: `InventoryService` (`js/engine/shared/inventory/services/InventoryService.js`)
- **Models**: `Equipment` (`js/engine/shared/inventory/models/Equipment.js`)
- **Data**: `GameConstants.js` (`js/engine/shared/data/GameConstants.js`)

## Storage Limits
- Total storage capacity is determined by the village's `Warehouse` level.
- Each item counts as 1 unit toward the storage limit.
- Adding items beyond the limit returns `Result.fail('error_storage_full')`.

## Item Types

### Materials
- Stackable resources used for construction and crafting.
- Examples: `material_wood`, `material_stone`, `material_iron_ore`.
- Stored as quantities in `inventoryService.data.materials`.

### Food
- Stackable consumables used to feed heroes or prevent starvation.
- Examples: `food_raw_grain`, `food_bread`, `food_stew`.
- Stored as quantities in `inventoryService.data.food`.

### Consumables
- Single-use items with immediate effects.
- Used in combat via `BattleService.useConsumable()`.
- Examples: `tiny_hp_potion`, `tiny_mp_potion`, `teleport_scroll`.
- Stored as quantities in `inventoryService.data.consumables`.

### Equipment
- Unique items with individual stats, level, and affixes.
- Each piece has a `type` (`weapon`, `armor`) and a `slot` (`head`, `body`, `legs`, `leftHand`, `rightHand`, `accessory`).
- Stored as objects in `inventoryService.data.equipment`.
- Equipment can be equipped on heroes (moved from inventory to `Hero.equipment`) or unequipped (returned to inventory).

## Key Operations

### Adding Items
- `addItem(itemId, quantity)`: Adds stackable items (materials, food, consumables).
- `addEquipment(itemData)`: Adds a unique equipment piece.

### Removing Items
- `useItem(itemId, quantity)`: Deducts stackable items.
- `removeEquipment(equipmentId)`: Removes an equipment piece from inventory.

### Queries
- `getItemCount(itemId)`: Returns the quantity of a stackable item.
- `getEquipment(equipmentId)`: Returns an equipment object by ID.
- `listEquipment()`: Returns all equipment in inventory.
- `getTotalStorageUsed()`: Returns the total count of all items.

## Equipment Lifecycle
1. **Acquisition**: Found during expeditions or purchased from the shop.
2. **Storage**: Held in `InventoryService.data.equipment`.
3. **Equip**: `HeroService.equipItem()` moves the item to `Hero.equipment[slot]` and calls `Hero.recalculateStats()`.
4. **Unequip**: `HeroService.unequipItem()` returns the item to inventory and recalculates stats.
5. **Refine**: `GameEngine.refineEquipment()` can upgrade equipment up to +10, increasing its stats.
