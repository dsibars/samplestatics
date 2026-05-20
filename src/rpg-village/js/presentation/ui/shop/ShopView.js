import { BaseView } from '../BaseView.js';
import { getEquipmentName, getEquipmentStats, getFormattedStats } from '../shared/EquipmentHelper.js';

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

        // Consumable base prices for sell calculation
        this.consumablePrices = {
            'item_tiny_hp_potion': 10,
            'item_tiny_mp_potion': 15,
            'item_teleport_scroll': 50
        };
        
        // Define static shop catalogs
        this.consumables = [
            { id: 'item_tiny_hp_potion', type: 'consumable', cost: 10, i18n_name: 'item_tiny_hp_potion', i18n_desc: 'item_tiny_hp_potion_desc' },
            { id: 'item_tiny_mp_potion', type: 'consumable', cost: 15, i18n_name: 'item_tiny_mp_potion', i18n_desc: 'item_tiny_mp_potion_desc' },
            { id: 'item_teleport_scroll', type: 'consumable', cost: 50, i18n_name: 'item_teleport_scroll', i18n_desc: 'item_teleport_scroll_desc' }
        ];

        this.weapons = [
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

        this.armor = [
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

        const getOwnedCount = (item) => {
            let ownedCount = 0;
            if (item.type === 'consumable') {
                ownedCount = (state.inventory && state.inventory.consumables) ? (state.inventory.consumables[item.id] || 0) : 0;
            } else if (state.inventory) {
                // Count matching items in inventory
                const matchingInv = (state.inventory.equipment || []).filter(eq => 
                    eq.type === item.type && 
                    eq.material === item.material && 
                    (item.type === 'weapon' ? eq.family === item.family : (eq.archetype === item.archetype && eq.slot === item.slot))
                ).length;
                
                // Count matching items equipped on heroes
                let matchingEq = 0;
                if (state.heroes) {
                    state.heroes.forEach(h => {
                        Object.values(h.equipment).forEach(eq => {
                            if (eq &&
                                eq.type === item.type && 
                                eq.material === item.material && 
                                (item.type === 'weapon' ? eq.family === item.family : (eq.archetype === item.archetype && eq.slot === item.slot))
                            ) {
                                matchingEq++;
                            }
                        });
                    });
                }
                ownedCount = matchingInv + matchingEq;
            }
            return ownedCount;
        };

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
        // Find matching shop item for base cost
        let baseCost = 0;
        if (eq.type === 'weapon') {
            const shopItem = this.weapons.find(w => w.material === eq.material && w.family === eq.family);
            baseCost = shopItem ? shopItem.cost : 50;
        } else if (eq.type === 'armor') {
            const shopItem = this.armor.find(a => a.material === eq.material && a.archetype === eq.archetype && a.slot === eq.slot);
            baseCost = shopItem ? shopItem.cost : 40;
        }
        const level = eq.level || 0;
        return Math.floor(baseCost * 0.3 * Math.pow(1.1, level));
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
        let ownedInvCount = 0;
        let ownedEqCount = 0;
        if (item.type === 'consumable') {
            ownedInvCount = (state.inventory && state.inventory.consumables) ? (state.inventory.consumables[item.id] || 0) : 0;
        } else if (state.inventory) {
            ownedInvCount = (state.inventory.equipment || []).filter(eq => 
                eq.type === item.type && 
                eq.material === item.material && 
                (item.type === 'weapon' ? eq.family === item.family : (eq.archetype === item.archetype && eq.slot === item.slot))
            ).length;
            
            if (state.heroes) {
                state.heroes.forEach(h => {
                    Object.values(h.equipment).forEach(eq => {
                        if (eq &&
                            eq.type === item.type && 
                            eq.material === item.material && 
                            (item.type === 'weapon' ? eq.family === item.family : (eq.archetype === item.archetype && eq.slot === item.slot))
                        ) {
                            ownedEqCount++;
                        }
                    });
                });
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
