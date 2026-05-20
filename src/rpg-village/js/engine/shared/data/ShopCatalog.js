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
    { type: 'weapon', material: 'iron', family: 'wand', cost: 300, tier: 2 },
    // Tier 3 (Steel)
    { type: 'weapon', material: 'steel', family: 'dagger', cost: 450, tier: 3 },
    { type: 'weapon', material: 'steel', family: 'broadsword', cost: 720, tier: 3 },
    { type: 'weapon', material: 'steel', family: 'battle_axe', cost: 1080, tier: 3 },
    { type: 'weapon', material: 'steel', family: 'wand', cost: 900, tier: 3 },
    // Tier 4 (Gold)
    { type: 'weapon', material: 'gold', family: 'dagger', cost: 1350, tier: 4 },
    { type: 'weapon', material: 'gold', family: 'broadsword', cost: 2160, tier: 4 },
    { type: 'weapon', material: 'gold', family: 'battle_axe', cost: 3240, tier: 4 },
    { type: 'weapon', material: 'gold', family: 'wand', cost: 2700, tier: 4 },
    // Tier 5 (Mythril)
    { type: 'weapon', material: 'mythril', family: 'dagger', cost: 4050, tier: 5 },
    { type: 'weapon', material: 'mythril', family: 'broadsword', cost: 6480, tier: 5 },
    { type: 'weapon', material: 'mythril', family: 'battle_axe', cost: 9720, tier: 5 },
    { type: 'weapon', material: 'mythril', family: 'wand', cost: 8100, tier: 5 }
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
    { type: 'armor', material: 'iron', archetype: 'robes', slot: 'rightHand', cost: 120, tier: 2 },
    // Tier 3 (Steel)
    { type: 'armor', material: 'steel', archetype: 'plate', slot: 'head', cost: 450, tier: 3 },
    { type: 'armor', material: 'steel', archetype: 'plate', slot: 'body', cost: 900, tier: 3 },
    { type: 'armor', material: 'steel', archetype: 'plate', slot: 'legs', cost: 600, tier: 3 },
    { type: 'armor', material: 'steel', archetype: 'plate', slot: 'rightHand', cost: 540, tier: 3 },
    { type: 'armor', material: 'steel', archetype: 'leather', slot: 'head', cost: 360, tier: 3 },
    { type: 'armor', material: 'steel', archetype: 'leather', slot: 'body', cost: 720, tier: 3 },
    { type: 'armor', material: 'steel', archetype: 'leather', slot: 'legs', cost: 480, tier: 3 },
    { type: 'armor', material: 'steel', archetype: 'leather', slot: 'rightHand', cost: 405, tier: 3 },
    { type: 'armor', material: 'steel', archetype: 'robes', slot: 'head', cost: 390, tier: 3 },
    { type: 'armor', material: 'steel', archetype: 'robes', slot: 'body', cost: 780, tier: 3 },
    { type: 'armor', material: 'steel', archetype: 'robes', slot: 'legs', cost: 525, tier: 3 },
    { type: 'armor', material: 'steel', archetype: 'robes', slot: 'rightHand', cost: 360, tier: 3 },
    // Tier 4 (Gold)
    { type: 'armor', material: 'gold', archetype: 'plate', slot: 'head', cost: 1350, tier: 4 },
    { type: 'armor', material: 'gold', archetype: 'plate', slot: 'body', cost: 2700, tier: 4 },
    { type: 'armor', material: 'gold', archetype: 'plate', slot: 'legs', cost: 1800, tier: 4 },
    { type: 'armor', material: 'gold', archetype: 'plate', slot: 'rightHand', cost: 1620, tier: 4 },
    { type: 'armor', material: 'gold', archetype: 'leather', slot: 'head', cost: 1080, tier: 4 },
    { type: 'armor', material: 'gold', archetype: 'leather', slot: 'body', cost: 2160, tier: 4 },
    { type: 'armor', material: 'gold', archetype: 'leather', slot: 'legs', cost: 1440, tier: 4 },
    { type: 'armor', material: 'gold', archetype: 'leather', slot: 'rightHand', cost: 1215, tier: 4 },
    { type: 'armor', material: 'gold', archetype: 'robes', slot: 'head', cost: 1170, tier: 4 },
    { type: 'armor', material: 'gold', archetype: 'robes', slot: 'body', cost: 2340, tier: 4 },
    { type: 'armor', material: 'gold', archetype: 'robes', slot: 'legs', cost: 1575, tier: 4 },
    { type: 'armor', material: 'gold', archetype: 'robes', slot: 'rightHand', cost: 1080, tier: 4 },
    // Tier 5 (Mythril)
    { type: 'armor', material: 'mythril', archetype: 'plate', slot: 'head', cost: 4050, tier: 5 },
    { type: 'armor', material: 'mythril', archetype: 'plate', slot: 'body', cost: 8100, tier: 5 },
    { type: 'armor', material: 'mythril', archetype: 'plate', slot: 'legs', cost: 5400, tier: 5 },
    { type: 'armor', material: 'mythril', archetype: 'plate', slot: 'rightHand', cost: 4860, tier: 5 },
    { type: 'armor', material: 'mythril', archetype: 'leather', slot: 'head', cost: 3240, tier: 5 },
    { type: 'armor', material: 'mythril', archetype: 'leather', slot: 'body', cost: 6480, tier: 5 },
    { type: 'armor', material: 'mythril', archetype: 'leather', slot: 'legs', cost: 4320, tier: 5 },
    { type: 'armor', material: 'mythril', archetype: 'leather', slot: 'rightHand', cost: 3645, tier: 5 },
    { type: 'armor', material: 'mythril', archetype: 'robes', slot: 'head', cost: 3510, tier: 5 },
    { type: 'armor', material: 'mythril', archetype: 'robes', slot: 'body', cost: 7020, tier: 5 },
    { type: 'armor', material: 'mythril', archetype: 'robes', slot: 'legs', cost: 4725, tier: 5 },
    { type: 'armor', material: 'mythril', archetype: 'robes', slot: 'rightHand', cost: 3240, tier: 5 }
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
