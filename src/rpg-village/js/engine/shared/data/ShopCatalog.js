/**
 * ShopCatalog - Static game data for the Shop domain.
 * Contains all purchasable items, their costs, tiers, and base prices for sell calculations.
 * This is the single source of truth for shop stock definitions.
 */

export const CONSUMABLES_CATALOG = [
    { id: 'item_tiny_hp_potion', type: 'consumable', cost: 10, i18n_name: 'item_tiny_hp_potion', i18n_desc: 'item_tiny_hp_potion_desc' },
    { id: 'item_tiny_mp_potion', type: 'consumable', cost: 15, i18n_name: 'item_tiny_mp_potion', i18n_desc: 'item_tiny_mp_potion_desc' },
    { id: 'item_teleport_scroll', type: 'consumable', cost: 50, i18n_name: 'item_teleport_scroll', i18n_desc: 'item_teleport_scroll_desc' }
];

export const WEAPONS_CATALOG = [
    // Tier 1 (Wooden)
    { type: 'weapon', material: 'wooden', family: 'dagger', cost: 50, tier: 1 },
    { type: 'weapon', material: 'wooden', family: 'broadsword', cost: 80, tier: 1 },
    { type: 'weapon', material: 'wooden', family: 'battle_axe', cost: 120, tier: 1 },
    { type: 'weapon', material: 'wooden', family: 'wand', cost: 100, tier: 1 },
    // Tier 2 (Iron)
    { type: 'weapon', material: 'iron', family: 'dagger', cost: 150, tier: 2 },
    { type: 'weapon', material: 'iron', family: 'broadsword', cost: 240, tier: 2 },
    { type: 'weapon', material: 'iron', family: 'battle_axe', cost: 360, tier: 2 },
    { type: 'weapon', material: 'iron', family: 'wand', cost: 300, tier: 2 }
];

export const ARMOR_CATALOG = [
    // Tier 1 (Wooden / Basic)
    { type: 'armor', material: 'wooden', archetype: 'plate', slot: 'head', cost: 50, tier: 1 },
    { type: 'armor', material: 'wooden', archetype: 'plate', slot: 'body', cost: 100, tier: 1 },
    { type: 'armor', material: 'wooden', archetype: 'plate', slot: 'legs', cost: 65, tier: 1 },
    { type: 'armor', material: 'wooden', archetype: 'plate', slot: 'rightHand', cost: 60, tier: 1 },
    { type: 'armor', material: 'wooden', archetype: 'leather', slot: 'head', cost: 40, tier: 1 },
    { type: 'armor', material: 'wooden', archetype: 'leather', slot: 'body', cost: 80, tier: 1 },
    { type: 'armor', material: 'wooden', archetype: 'leather', slot: 'legs', cost: 50, tier: 1 },
    { type: 'armor', material: 'wooden', archetype: 'leather', slot: 'rightHand', cost: 45, tier: 1 },
    { type: 'armor', material: 'wooden', archetype: 'robes', slot: 'head', cost: 45, tier: 1 },
    { type: 'armor', material: 'wooden', archetype: 'robes', slot: 'body', cost: 90, tier: 1 },
    { type: 'armor', material: 'wooden', archetype: 'robes', slot: 'legs', cost: 55, tier: 1 },
    { type: 'armor', material: 'wooden', archetype: 'robes', slot: 'rightHand', cost: 40, tier: 1 },
    // Tier 2 (Iron)
    { type: 'armor', material: 'iron', archetype: 'plate', slot: 'head', cost: 150, tier: 2 },
    { type: 'armor', material: 'iron', archetype: 'plate', slot: 'body', cost: 300, tier: 2 },
    { type: 'armor', material: 'iron', archetype: 'plate', slot: 'legs', cost: 200, tier: 2 },
    { type: 'armor', material: 'iron', archetype: 'plate', slot: 'rightHand', cost: 180, tier: 2 },
    { type: 'armor', material: 'iron', archetype: 'leather', slot: 'head', cost: 120, tier: 2 },
    { type: 'armor', material: 'iron', archetype: 'leather', slot: 'body', cost: 240, tier: 2 },
    { type: 'armor', material: 'iron', archetype: 'leather', slot: 'legs', cost: 160, tier: 2 },
    { type: 'armor', material: 'iron', archetype: 'leather', slot: 'rightHand', cost: 135, tier: 2 },
    { type: 'armor', material: 'iron', archetype: 'robes', slot: 'head', cost: 130, tier: 2 },
    { type: 'armor', material: 'iron', archetype: 'robes', slot: 'body', cost: 260, tier: 2 },
    { type: 'armor', material: 'iron', archetype: 'robes', slot: 'legs', cost: 175, tier: 2 },
    { type: 'armor', material: 'iron', archetype: 'robes', slot: 'rightHand', cost: 120, tier: 2 }
];

/**
 * Base prices for consumables, used in sell calculations.
 * Maps consumable ID → base gold cost.
 */
export const CONSUMABLE_BASE_PRICES = {
    'item_tiny_hp_potion': 10,
    'item_tiny_mp_potion': 15,
    'item_teleport_scroll': 50
};

/**
 * Lookup a weapon's base cost by material and family.
 * @param {string} material - e.g. 'wooden', 'iron'
 * @param {string} family - e.g. 'dagger', 'broadsword'
 * @returns {number} Base cost, or 50 as fallback
 */
export function getWeaponBaseCost(material, family) {
    const item = WEAPONS_CATALOG.find(w => w.material === material && w.family === family);
    return item ? item.cost : 50;
}

/**
 * Lookup an armor piece's base cost by material, archetype, and slot.
 * @param {string} material - e.g. 'wooden', 'iron'
 * @param {string} archetype - e.g. 'plate', 'leather', 'robes'
 * @param {string} slot - e.g. 'head', 'body', 'legs', 'rightHand'
 * @returns {number} Base cost, or 40 as fallback
 */
export function getArmorBaseCost(material, archetype, slot) {
    const item = ARMOR_CATALOG.find(a => a.material === material && a.archetype === archetype && a.slot === slot);
    return item ? item.cost : 40;
}
