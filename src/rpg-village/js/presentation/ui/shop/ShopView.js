import { BaseView } from '../BaseView.js';
import { getEquipmentName, getEquipmentStats, getFormattedStats } from '../shared/EquipmentHelper.js';
import { CONSUMABLES_CATALOG, WEAPONS_CATALOG, ARMOR_CATALOG, getWeaponBaseCost, getArmorBaseCost } from '../../../engine/shared/data/ShopCatalog.js';

export class ShopView extends BaseView {
    constructor() {
        super('shop');
        this.currentTab = 'buy';
        this.selectedItemKey = null;
        this.selectedSellItemKey = null;
        this.justBoughtKey = null;
        this.justBoughtTime = 0;
        this.justBoughtTimeout = null;
        this.justSoldKey = null;
        this.justSoldTime = 0;
        this.justSoldTimeout = null;

        // Catalog references (single source of truth in ShopCatalog.js)
        this.consumables = CONSUMABLES_CATALOG;
        this.weapons = WEAPONS_CATALOG;
        this.armor = ARMOR_CATALOG;
    }

    onMount() {
        this.elements = {
            lockOverlay: this.$('#shop-lock-overlay'),
            catalog: this.$('#shop-catalog-container'),
            detailContent: this.$('#shop-detail-content')
        };

        // Bind tab switching
        this.$$('.shop-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const mode = tab.getAttribute('data-tab');
                if (mode !== this.currentTab) {
                    this.currentTab = mode;
                    this.$$('.shop-tab').forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === mode));
                    this.ui.forceUpdate();
                }
            });
        });
    }

    update(state) {
        if (!state) return;
        
        const completed = state.completedExpeditions || [];
        const isUnlocked = completed.includes('exp_tutorial_cave');
        const blacksmithLevel = state.village?.infrastructure?.blacksmith || 0;
        const playerGold = state.village?.gold || 0;
        
        const invStr = state.inventory ? JSON.stringify({
            equipmentCount: state.inventory.equipment?.length || 0,
            gold: playerGold,
            blacksmithLevel,
            isUnlocked
        }) : '';

        const stateString = JSON.stringify({
            completed: completed.length,
            invStr,
            heroesCount: state.heroes?.length || 0,
            selectedItemKey: this.selectedItemKey,
            selectedSellItemKey: this.selectedSellItemKey,
            justBoughtKey: this.justBoughtKey,
            justSoldKey: this.justSoldKey,
            currentTab: this.currentTab
        });

        if (this.lastRenderedState === stateString) {
            return;
        }

        this.onUpdate(state);
        this.lastRenderedState = stateString;
    }

    onUpdate(state) {
        const completed = state.completedExpeditions || [];
        const isUnlocked = completed.includes('exp_tutorial_cave');

        if (!isUnlocked) {
            if (this.elements.lockOverlay) this.elements.lockOverlay.style.display = 'flex';
            return;
        }

        if (this.elements.lockOverlay) this.elements.lockOverlay.style.display = 'none';

        if (this.currentTab === 'buy') {
            this._renderBuyTab(state);
        } else {
            this._renderSellTab(state);
        }
    }

    _renderBuyTab(state) {
        const blacksmithLevel = state.village?.infrastructure?.blacksmith || 0;
        const maxTier = blacksmithLevel >= 1 ? 2 : 1;
        const playerGold = state.village?.gold || 0;
        const t = this.t.bind(this);

        // Group items:
        const groups = [
            {
                id: 'consumables',
                title: t('ui_consumables') || 'Consumables',
                icon: '🧪',
                items: this.consumables
            },
            {
                id: 'weapons',
                title: t('ui_equipment') || 'Weapons',
                icon: '⚔️',
                items: this.weapons.filter(w => w.tier <= maxTier)
            },
            {
                id: 'helmets',
                title: t('slot_name_head') || 'Helmets',
                icon: '🪖',
                items: this.armor.filter(a => a.slot === 'head' && a.tier <= maxTier)
            },
            {
                id: 'armors',
                title: t('slot_name_body') || 'Armors',
                icon: '🧥',
                items: this.armor.filter(a => a.slot === 'body' && a.tier <= maxTier)
            },
            {
                id: 'legwear',
                title: t('slot_name_legs') || 'Legwear',
                icon: '👖',
                items: this.armor.filter(a => a.slot === 'legs' && a.tier <= maxTier)
            },
            {
                id: 'shields',
                title: t('slot_name_rightHand') || 'Shields',
                icon: '🛡️',
                items: this.armor.filter(a => a.slot === 'rightHand' && a.tier <= maxTier)
            }
        ];

        const getItemKey = (item) => {
            return item.id || `${item.type}_${item.material}_${item.family || item.archetype}_${item.slot || ''}`;
        };

        // Find all available items to buy
        const allItems = [];
        groups.forEach(g => {
            g.items.forEach(item => {
                allItems.push(item);
            });
        });

        if (!this.selectedItemKey && allItems.length > 0) {
            this.selectedItemKey = getItemKey(allItems[0]);
        }

        const getOwnedCount = (item) => this._getOwnedCount(item, state);

        // Render catalog
        if (this.elements.catalog) {
            this.elements.catalog.innerHTML = groups.map(group => {
                if (group.items.length === 0) return '';
                
                // Determine if this category contains the selected item
                const containsSelected = group.items.some(item => getItemKey(item) === this.selectedItemKey);
                const isOpenAttr = containsSelected || (group.id === 'consumables' && !this.selectedItemKey) ? 'open' : '';

                const itemsHtml = group.items.map(item => {
                    const itemKey = getItemKey(item);
                    const activeClass = this.selectedItemKey === itemKey ? 'active' : '';
                    const ownedCount = getOwnedCount(item);
                    const canAfford = playerGold >= item.cost;
                    const costBadgeClass = canAfford ? 'shop-item-cost-badge' : 'shop-item-cost-badge insufficient';
                    
                    let displayName = '';
                    if (item.type === 'consumable') {
                        displayName = t(item.i18n_name);
                    } else {
                        displayName = getEquipmentName(item, t);
                    }

                    return `
                        <div class="shop-item-row ${activeClass}" data-key="${itemKey}">
                            <span class="list-item-title">${displayName}</span>
                            <div class="shop-item-meta">
                                <span class="shop-item-owned-badge">${ownedCount}</span>
                                <span class="${costBadgeClass}">💰 ${item.cost}</span>
                            </div>
                        </div>
                    `;
                }).join('');

                return `
                    <details class="shop-category-details" ${isOpenAttr}>
                        <summary>
                            <span>${group.icon} ${group.title}</span>
                            <span class="arrow">▼</span>
                        </summary>
                        <div class="shop-item-list">
                            ${itemsHtml}
                        </div>
                    </details>
                `;
            }).join('');

            // Bind click to shop rows
            this.$$('.shop-item-row').forEach(row => {
                row.addEventListener('click', () => {
                    this.selectedItemKey = row.getAttribute('data-key');
                    this.ui.forceUpdate();
                });
            });
        }

        // Find selected item object
        const selectedItem = allItems.find(item => getItemKey(item) === this.selectedItemKey);
        
        // Render details
        this._renderDetails(selectedItem, state);
    }

    _renderSellTab(state) {
        const t = this.t.bind(this);
        const inventory = state.inventory || {};
        const consumables = inventory.consumables || {};
        const equipment = inventory.equipment || [];

        // Build sell groups from inventory
        const groups = [];

        // Consumables
        const consumableItems = Object.entries(consumables)
            .filter(([_, count]) => count > 0)
            .map(([id, count]) => {
                const shopItem = this.consumables.find(c => c.id === id);
                const basePrice = shopItem ? shopItem.cost : 0;
                return {
                    id,
                    type: 'consumable',
                    count,
                    i18n_name: shopItem ? shopItem.i18n_name : id,
                    i18n_desc: shopItem ? shopItem.i18n_desc : id,
                    sellPrice: Math.floor(basePrice * 0.3)
                };
            });

        if (consumableItems.length > 0) {
            groups.push({
                id: 'consumables',
                title: t('ui_consumables') || 'Consumables',
                icon: '🧪',
                items: consumableItems
            });
        }

        // Equipment helper
        const eqGroups = [
            { id: 'weapons', title: t('ui_equipment') || 'Weapons', icon: '⚔️', filter: eq => eq.type === 'weapon' },
            { id: 'helmets', title: t('slot_name_head') || 'Helmets', icon: '🪖', filter: eq => eq.type === 'armor' && eq.slot === 'head' },
            { id: 'armors', title: t('slot_name_body') || 'Armors', icon: '🧥', filter: eq => eq.type === 'armor' && eq.slot === 'body' },
            { id: 'legwear', title: t('slot_name_legs') || 'Legwear', icon: '👖', filter: eq => eq.type === 'armor' && eq.slot === 'legs' },
            { id: 'shields', title: t('slot_name_rightHand') || 'Shields', icon: '🛡️', filter: eq => eq.type === 'armor' && eq.slot === 'rightHand' }
        ];

        eqGroups.forEach(g => {
            const items = equipment.filter(g.filter).map(eq => ({
                ...eq,
                type: 'equipment',
                sellPrice: this._calculateEquipmentSellPrice(eq)
            }));
            if (items.length > 0) {
                groups.push({ ...g, items });
            }
        });

        // Render catalog
        if (this.elements.catalog) {
            if (groups.length === 0) {
                this.elements.catalog.innerHTML = `
                    <div class="empty-detail" style="padding: var(--spacing-lg);">
                        <p style="color: var(--text-muted);">${t('ui_no_items_to_sell') || 'No items to sell.'}</p>
                    </div>
                `;
            } else {
                this.elements.catalog.innerHTML = groups.map(group => {
                    const containsSelected = group.items.some(item => item.id === this.selectedSellItemKey);
                    const isOpenAttr = containsSelected || group.id === 'consumables' ? 'open' : '';

                    const itemsHtml = group.items.map(item => {
                        const activeClass = this.selectedSellItemKey === item.id ? 'active' : '';
                        const displayName = item.type === 'consumable' 
                            ? t(item.i18n_name) 
                            : getEquipmentName(item, t);
                        const countBadge = item.type === 'consumable' ? `×${item.count}` : '';

                        return `
                            <div class="shop-item-row ${activeClass}" data-key="${item.id}">
                                <span class="list-item-title">${displayName} ${countBadge}</span>
                                <div class="shop-item-meta">
                                    <span class="shop-item-cost-badge">💰 ${item.sellPrice}</span>
                                </div>
                            </div>
                        `;
                    }).join('');

                    return `
                        <details class="shop-category-details" ${isOpenAttr}>
                            <summary>
                                <span>${group.icon} ${group.title}</span>
                                <span class="arrow">▼</span>
                            </summary>
                            <div class="shop-item-list">
                                ${itemsHtml}
                            </div>
                        </details>
                    `;
                }).join('');

                // Bind click to sell rows
                this.$$('.shop-item-row').forEach(row => {
                    row.addEventListener('click', () => {
                        this.selectedSellItemKey = row.getAttribute('data-key');
                        this.ui.forceUpdate();
                    });
                });
            }
        }

        // Find selected item
        let selectedItem = null;
        for (const g of groups) {
            selectedItem = g.items.find(i => i.id === this.selectedSellItemKey);
            if (selectedItem) break;
        }

        this._renderSellDetails(selectedItem, state);
    }

    _calculateEquipmentSellPrice(eq) {
        let baseCost = 0;
        if (eq.type === 'weapon') {
            baseCost = getWeaponBaseCost(eq.material, eq.family);
        } else if (eq.type === 'armor') {
            baseCost = getArmorBaseCost(eq.material, eq.archetype, eq.slot);
        }
        const level = eq.level || 0;
        return Math.floor(baseCost * 0.3 * Math.pow(1.1, level));
    }

    /**
     * Get ownership breakdown for a shop catalog item.
     * @param {Object} item - Shop catalog item
     * @param {Object} state - Full engine state
     * @returns {{total: number, inventory: number, equipped: number}}
     */
    _getOwnedBreakdown(item, state) {
        if (item.type === 'consumable') {
            const count = (state.inventory && state.inventory.consumables) ? (state.inventory.consumables[item.id] || 0) : 0;
            return { total: count, inventory: count, equipped: 0 };
        }

        let inventory = 0;
        let equipped = 0;

        if (state.inventory) {
            inventory = (state.inventory.equipment || []).filter(eq =>
                eq.type === item.type &&
                eq.material === item.material &&
                (item.type === 'weapon' ? eq.family === item.family : (eq.archetype === item.archetype && eq.slot === item.slot))
            ).length;
        }

        if (state.heroes) {
            state.heroes.forEach(h => {
                Object.values(h.equipment).forEach(eq => {
                    if (eq &&
                        eq.type === item.type &&
                        eq.material === item.material &&
                        (item.type === 'weapon' ? eq.family === item.family : (eq.archetype === item.archetype && eq.slot === item.slot))
                    ) {
                        equipped++;
                    }
                });
            });
        }

        return { total: inventory + equipped, inventory, equipped };
    }

    /**
     * Count how many of a given shop item the player owns (inventory + equipped).
     * @param {Object} item - Shop catalog item
     * @param {Object} state - Full engine state
     * @returns {number} Total owned count
     */
    _getOwnedCount(item, state) {
        return this._getOwnedBreakdown(item, state).total;
    }

    _renderSellDetails(item, state) {
        if (!this.elements.detailContent) return;
        const t = this.t.bind(this);

        if (!item) {
            this.elements.detailContent.innerHTML = `
                <div class="empty-detail">
                    <div class="detail-icon-bg">💰</div>
                    <p>${t('ui_select_item') || 'Select an item to view details.'}</p>
                </div>
            `;
            return;
        }

        const isJustSold = this.justSoldKey === item.id && (Date.now() - this.justSoldTime) < 600;

        let name = '';
        let desc = '';
        let icon = '🛡️';

        if (item.type === 'consumable') {
            name = t(item.i18n_name);
            desc = t(item.i18n_desc);
            icon = item.id.includes('potion') ? '🧪' : '📜';
        } else {
            name = getEquipmentName(item, t);
            desc = getFormattedStats(item, t);
            if (item.type === 'weapon') {
                icon = item.family === 'wand' ? '🪄' : '⚔️';
            } else {
                icon = item.slot === 'head' ? '🪖' : (item.slot === 'rightHand' ? '🛡️' : '🧥');
            }
        }

        const STAT_LABEL_MAP = {
            strength:        'ui_stats_power',
            defense:         'ui_stats_defense',
            maxHp:           'ui_stats_hp',
            maxMp:           'ui_stats_mp',
            magicPower:      'ui_stats_magic',
            speed:           'ui_stats_speed',
            evasion:         'ui_stats_evasion',
            mpCostReduction: 'ui_stats_mpreduce'
        };

        const statsHtml = item.type !== 'consumable' ? `
            <div class="shop-stats-card">
                <h4>${t('ui_stats') || 'Stats Bonus'}</h4>
                ${Object.entries(getEquipmentStats(item)).map(([stat, val]) => {
                    if (!val) return '';
                    const sign = val > 0 ? '+' : '';
                    const label = t(STAT_LABEL_MAP[stat]) || stat;
                    return `
                        <div class="shop-stat-row">
                            <span class="shop-stat-label">${label}</span>
                            <span class="shop-stat-value">${sign}${val}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        ` : '';

        const btnClassFinal = isJustSold ? 'btn-success bought' : 'btn-primary';
        const btnText = isJustSold ? (t('ui_sold') || 'Sold! ✓') : t('ui_sell');
        const btnDisabled = isJustSold ? 'disabled' : '';

        this.elements.detailContent.innerHTML = `
            <div class="shop-detail-header">
                <div class="shop-title-group">
                    <h2>${name}</h2>
                    <span style="color: var(--text-muted); font-size: 0.9rem;">
                        ${item.type === 'consumable' ? (t('ui_consumables') || 'Consumable') : (t('slot_name_' + item.slot) || item.type)}
                    </span>
                </div>
                ${item.level !== undefined ? `<span class="shop-tier-badge">+${item.level}</span>` : ''}
            </div>
            <div class="shop-detail-body">
                <div class="shop-preview-card">
                    <span class="shop-preview-icon">${icon}</span>
                </div>
                
                <p class="shop-desc-text">${desc}</p>
                
                ${statsHtml}
                
                <div class="shop-cost-section">
                    <h4>${t('ui_sell_price') || 'Sell Price'}</h4>
                    <div class="shop-cost-grid">
                        <div class="shop-cost-item">
                            <span class="label">GOLD</span>
                            <span class="value">💰 ${item.sellPrice}</span>
                        </div>
                    </div>
                </div>
                
                <div class="shop-action-footer">
                    <button class="btn ${btnClassFinal} btn-sell-action" 
                            data-id="${item.id}" 
                            data-type="${item.type}"
                            data-price="${item.sellPrice}" 
                            ${btnDisabled}>
                        ${btnText}
                    </button>
                </div>
            </div>
        `;

        this._bindSellButtons();
    }

    _bindSellButtons() {
        this.$$('.btn-sell-action').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', () => {
                const itemId = newBtn.getAttribute('data-id');
                const itemType = newBtn.getAttribute('data-type');
                const sellPrice = parseInt(newBtn.getAttribute('data-price'));

                this.justSoldKey = itemId;
                this.justSoldTime = Date.now();

                if (this.justSoldTimeout) clearTimeout(this.justSoldTimeout);
                this.justSoldTimeout = setTimeout(() => {
                    this.justSoldKey = null;
                    this.ui.forceUpdate();
                }, 600);

                this.emit('sellItem', { itemId, itemType, sellPrice });
            });
        });
    }

    _renderDetails(item, state) {
        if (!this.elements.detailContent) return;

        const t = this.t.bind(this);
        if (!item) {
            this.elements.detailContent.innerHTML = `
                <div class="empty-detail">
                    <div class="detail-icon-bg">🛒</div>
                    <p data-i18n="ui_select_item">${t('ui_select_item') || 'Select an item to view details.'}</p>
                </div>
            `;
            return;
        }

        const playerGold = state.village?.gold || 0;
        const canAfford = playerGold >= item.cost;
        const itemKey = item.id || `${item.type}_${item.material}_${item.family || item.archetype}_${item.slot || ''}`;
        const isJustBought = this.justBoughtKey === itemKey && (Date.now() - this.justBoughtTime) < 600;

        let name = '';
        let desc = '';
        let icon = '🛡️';

        if (item.type === 'consumable') {
            name = t(item.i18n_name);
            desc = t(item.i18n_desc);
            icon = item.id.includes('potion') ? '🧪' : '📜';
        } else {
            name = getEquipmentName(item, t);
            desc = getFormattedStats(item, t);
            if (item.type === 'weapon') {
                icon = item.family === 'wand' ? '🪄' : '⚔️';
            } else {
                icon = item.slot === 'head' ? '🪖' : (item.slot === 'rightHand' ? '🛡️' : '🧥');
            }
        }

        // Calculate owned stats
        const ownedBreakdown = this._getOwnedBreakdown(item, state);
        const ownedInvCount = ownedBreakdown.inventory;
        const ownedEqCount = ownedBreakdown.equipped;

        const STAT_LABEL_MAP = {
            strength:        'ui_stats_power',
            defense:         'ui_stats_defense',
            maxHp:           'ui_stats_hp',
            maxMp:           'ui_stats_mp',
            magicPower:      'ui_stats_magic',
            speed:           'ui_stats_speed',
            evasion:         'ui_stats_evasion',
            mpCostReduction: 'ui_stats_mpreduce'
        };

        const statsHtml = item.type !== 'consumable' ? `
            <div class="shop-stats-card">
                <h4>${t('ui_stats') || 'Stats Bonus'}</h4>
                ${Object.entries(getEquipmentStats(item)).map(([stat, val]) => {
                    if (!val) return '';
                    const sign = val > 0 ? '+' : '';
                    const label = t(STAT_LABEL_MAP[stat]) || stat;
                    return `
                        <div class="shop-stat-row">
                            <span class="shop-stat-label">${label}</span>
                            <span class="shop-stat-value">${sign}${val}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        ` : '';

        const costClass = canAfford ? 'shop-cost-item' : 'shop-cost-item insufficient';
        const btnClassFinal = isJustBought ? 'btn-success bought' : (canAfford ? 'btn-primary' : 'btn-secondary');
        const btnText = isJustBought ? (t('ui_purchased') || 'Purchased! ✓') : t('ui_buy');
        const btnDisabled = isJustBought || !canAfford ? 'disabled' : '';

        this.elements.detailContent.innerHTML = `
            <div class="shop-detail-header">
                <div class="shop-title-group">
                    <h2>${name}</h2>
                    <span style="color: var(--text-muted); font-size: 0.9rem;">
                        ${item.type === 'consumable' ? (t('ui_consumables') || 'Consumable') : (t('slot_name_' + item.slot) || item.type)}
                    </span>
                </div>
                ${item.tier ? `<span class="shop-tier-badge">Tier ${item.tier}</span>` : ''}
            </div>
            <div class="shop-detail-body">
                <div class="shop-preview-card">
                    <span class="shop-preview-icon">${icon}</span>
                </div>
                
                <p class="shop-desc-text">${desc}</p>
                
                ${statsHtml}
                
                <div class="shop-owned-breakdown">
                    <span>${t('ui_owned') || 'Owned'}: ${ownedInvCount + ownedEqCount}</span>
                    <span style="color: var(--text-muted);">
                        (${t('ui_inventory') || 'Inventory'}: ${ownedInvCount} | ${t('ui_equipped') || 'Equipped'}: ${ownedEqCount})
                    </span>
                </div>
                
                <div class="shop-cost-section">
                    <h4>${t('ui_cost') || 'Cost'}</h4>
                    <div class="shop-cost-grid">
                        <div class="${costClass}">
                            <span class="label">GOLD</span>
                            <span class="value">💰 ${item.cost}</span>
                        </div>
                    </div>
                </div>
                
                <div class="shop-action-footer">
                    <button class="btn ${btnClassFinal} btn-buy-action" 
                            data-item='${JSON.stringify(item)}' 
                            data-cost="${item.cost}" 
                            ${btnDisabled}>
                        ${btnText}
                    </button>
                </div>
            </div>
        `;

        this._bindBuyButtons();
    }

    _bindBuyButtons() {
        this.$$('.btn-buy-action').forEach(btn => {
            // Remove any old listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', () => {
                const itemData = JSON.parse(newBtn.getAttribute('data-item'));
                const cost = parseInt(newBtn.getAttribute('data-cost'));
                
                const itemKey = itemData.id || `${itemData.type}_${itemData.material}_${itemData.family || itemData.archetype}_${itemData.slot || ''}`;
                this.justBoughtKey = itemKey;
                this.justBoughtTime = Date.now();
                
                if (this.justBoughtTimeout) clearTimeout(this.justBoughtTimeout);
                this.justBoughtTimeout = setTimeout(() => {
                    this.justBoughtKey = null;
                    this.ui.forceUpdate();
                }, 600);

                this.emit('buyItem', { itemData, costGold: cost });
            });
        });
    }
}
