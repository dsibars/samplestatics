import { BaseView } from '../BaseView.js';
import { getEquipmentName, getEquipmentStats, getFormattedStats } from '../shared/EquipmentHelper.js';
import { MEAL_RECIPES } from '../../../engine/shared/data/GameConstants.js';

export class InventoryView extends BaseView {
    constructor() {
        super('inventory');
        this.activeFilter = 'all';
        this.selectedItemId = null;
        this.cachedItems = [];
        this.lastState = null;
    }

    onMount() {
        this.elements = {
            storageText: this.$('#inv-storage-text'),
            storageBar: this.$('#inv-storage-bar'),
            itemsContainer: this.$('#inventory-items-container'),
            detail: this.$('#inventory-detail-content')
        };

        this.root.addEventListener('click', (e) => {
            const subviewBtn = e.target.closest('[data-subview]');
            if (subviewBtn) {
                this.ui.switchView(subviewBtn.dataset.subview);
                return;
            }
        });

        // Bind filter tabs click events
        const filtersContainer = this.$('.inventory-filters');
        if (filtersContainer) {
            filtersContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.filter-btn');
                if (btn) {
                    filtersContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.activeFilter = btn.getAttribute('data-filter') || 'all';
                    this.selectedItemId = null; // Reset selection on filter switch
                    if (this.lastState) {
                        this.onUpdate(this.lastState);
                    }
                }
            });
        }

        // Bind item click selection events
        if (this.elements.itemsContainer) {
            this.elements.itemsContainer.addEventListener('click', (e) => {
                const card = e.target.closest('.inventory-item-card');
                if (card) {
                    const itemId = card.getAttribute('data-id');
                    this.selectedItemId = itemId;
                    if (this.lastState) {
                        this.onUpdate(this.lastState);
                    }
                }
            });
        }

        // Bind cook/consume buttons in detail pane
        if (this.elements.detail) {
            this.elements.detail.addEventListener('click', (e) => {
                const cookBtn = e.target.closest('.btn-cook-meal');
                if (cookBtn) {
                    this.emit('cookMeal', { recipeId: cookBtn.dataset.recipe });
                    return;
                }
                const feedBtn = e.target.closest('.btn-consume-meal');
                if (feedBtn) {
                    this.emit('consumeMeal', { mealId: feedBtn.dataset.meal });
                    return;
                }
            });
        }
    }

    update(state) {
        if (!state.inventory) return;

        // Custom diff checks including UI filter and selection states
        const stateString = JSON.stringify({
            inventory: state.inventory,
            activeFilter: this.activeFilter,
            selectedItemId: this.selectedItemId
        });

        if (this.lastRenderedState === stateString) {
            return;
        }

        this.lastState = state;
        this.onUpdate(state);
        this.lastRenderedState = stateString;
    }

    onUpdate(state) {
        const { inventory, village } = state;
        if (!inventory || !village) return;

        // Storage Summary
        const used = inventory.totalUsed || 0;
        const max = village.maxStorage || 100;
        if (this.elements.storageText) this.elements.storageText.textContent = `${used} / ${max}`;
        if (this.elements.storageBar) {
            const percent = Math.min(100, (used / max) * 100);
            this.elements.storageBar.style.width = `${percent}%`;
            this.elements.storageBar.classList.toggle('warning', percent > 70);
            this.elements.storageBar.classList.toggle('danger', percent > 90);
        }

        // Compile all items
        const items = [];

        // Materials
        if (inventory.materials) {
            Object.entries(inventory.materials).forEach(([id, count]) => {
                if (count > 0) {
                    items.push({
                        id,
                        type: 'materials',
                        name: this.t(id),
                        qty: count,
                        icon: id === 'material_wood' ? '🪵' : (id === 'material_stone' ? '🪨' : '⛓️')
                    });
                }
            });
        }

        // Food
        if (inventory.food) {
            Object.entries(inventory.food).forEach(([id, count]) => {
                if (count > 0) {
                    const mealRecipe = MEAL_RECIPES[id];
                    items.push({
                        id,
                        type: 'food',
                        name: this.t(id),
                        qty: count,
                        icon: mealRecipe ? mealRecipe.icon : '🌾'
                    });
                }
            });
        }

        // Consumables
        if (inventory.consumables) {
            Object.entries(inventory.consumables).forEach(([id, count]) => {
                if (count > 0) {
                    items.push({
                        id,
                        type: 'consumables',
                        name: this.t(id),
                        qty: count,
                        icon: id === 'item_teleport_scroll' ? '📜' : '🧪'
                    });
                }
            });
        }

        // Equipment
        if (inventory.equipment) {
            inventory.equipment.forEach((item, index) => {
                const eqId = `eq_${item.type}_${item.material}_${index}`;
                const name = getEquipmentName(item, this.t.bind(this));
                const icon = item.type === 'weapon' ? '🗡️' : (item.slot === 'head' ? '🪖' : (item.slot === 'body' ? '👕' : (item.slot === 'rightHand' ? '🛡️' : '🥾')));
                items.push({
                    id: eqId,
                    type: 'equipment',
                    name: `${name} +${item.level || 0}`,
                    qty: 1,
                    icon,
                    rawEquipment: item
                });
            });
        }

        this.cachedItems = items;

        // Filter items
        const filtered = items.filter(item => {
            if (this.activeFilter === 'all') return true;
            return item.type === this.activeFilter;
        });

        // Render List
        if (this.elements.itemsContainer) {
            if (filtered.length === 0) {
                this.elements.itemsContainer.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;">No items found</div>`;
            } else {
                this.elements.itemsContainer.innerHTML = filtered.map(item => {
                    const isActive = this.selectedItemId === item.id;
                    return `
                        <div class="inventory-item-card ${isActive ? 'active' : ''}" data-id="${item.id}">
                            ${item.qty > 1 ? `<span class="item-badge">${item.qty}</span>` : ''}
                            <div class="item-icon">${item.icon}</div>
                            <div class="item-name">${item.name}</div>
                        </div>
                    `;
                }).join('');
            }
        }

        // Render Detail
        this.renderDetail();
    }

    renderDetail() {
        if (!this.elements.detail) return;

        if (!this.selectedItemId) {
            this.elements.detail.innerHTML = `
                <div class="empty-detail">
                    <div class="detail-icon-bg">🎒</div>
                    <p data-i18n="ui_select_item">${this.t('ui_select_item')}</p>
                </div>
            `;
            return;
        }

        const item = this.cachedItems.find(i => i.id === this.selectedItemId);
        if (!item) {
            this.selectedItemId = null;
            this.elements.detail.innerHTML = `
                <div class="empty-detail">
                    <div class="detail-icon-bg">🎒</div>
                    <p data-i18n="ui_select_item">${this.t('ui_select_item')}</p>
                </div>
            `;
            return;
        }

        // Determine category label and description
        let categoryLabel = this.t('ui_' + item.type);
        let description = '';

        if (item.type === 'materials') {
            description = this.t('desc_' + item.id) || '';
        } else if (item.type === 'food') {
            description = this.t('desc_' + item.id) || '';
        } else if (item.type === 'consumables') {
            description = this.t(item.id + '_desc') || '';
        }

        let detailsHtml = '';
        let actionHtml = '';

        // Show cook recipes when raw grain is selected
        if (item.id === 'food_raw_grain') {
            const recipes = Object.values(MEAL_RECIPES);
            const inventory = this.lastState?.inventory || {};
            const recipesHtml = recipes.map(recipe => {
                const canCook = Object.entries(recipe.ingredients).every(([ingId, qty]) => {
                    const count = inventory.materials?.[ingId] || inventory.food?.[ingId] || inventory.consumables?.[ingId] || 0;
                    return count >= qty;
                });
                const ingredientsList = Object.entries(recipe.ingredients).map(([ingId, qty]) => {
                    const have = inventory.materials?.[ingId] || inventory.food?.[ingId] || inventory.consumables?.[ingId] || 0;
                    const color = have >= qty ? 'var(--success)' : 'var(--danger)';
                    return `<span style="color:${color}">${qty} ${this.t(ingId) || ingId}</span>`;
                }).join(', ');
                const buffDesc = Object.entries(recipe.buff).map(([stat, val]) => {
                    const label = stat === 'maxHp' ? '+${Math.round(val*100)}% HP' : `+${val} ${this.t('ui_stats_' + stat) || stat.toUpperCase()}`;
                    return label.replace('${Math.round(val*100)}', Math.round(val * 100)).replace('${val}', val);
                }).join(', ');

                return `
                    <div class="recipe-row" style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px dashed rgba(255,255,255,0.05);">
                        <div style="text-align:left;">
                            <div style="font-weight:600; font-size:0.9rem;">${recipe.icon} ${this.t(recipe.name) || recipe.name}</div>
                            <div style="font-size:0.75rem; color:var(--text-muted);">${ingredientsList}</div>
                            <div style="font-size:0.75rem; color:var(--accent-color);">${buffDesc} · ${recipe.battles} ${this.t('ui_battles') || 'battle(s)'}</div>
                        </div>
                        <button class="btn btn-primary btn-sm btn-cook-meal" data-recipe="${recipe.id}" ${canCook ? '' : 'disabled'} style="min-width:60px;">
                            ${this.t('ui_cook') || 'Cook'}
                        </button>
                    </div>
                `;
            }).join('');

            actionHtml = `
                <div class="item-inspector-stats" style="margin-top:15px;">
                    <h4>${this.t('ui_recipes') || 'Recipes'}</h4>
                    ${recipesHtml}
                </div>
            `;
        }

        // Show feed button when a meal is selected
        if (item.id && item.id.startsWith('meal_')) {
            const recipe = MEAL_RECIPES[item.id];
            if (recipe) {
                const buffDesc = Object.entries(recipe.buff).map(([stat, val]) => {
                    if (stat === 'maxHp') return `+${Math.round(val * 100)}% HP`;
                    return `+${val} ${this.t('ui_stats_' + stat) || stat.toUpperCase()}`;
                }).join(', ');
                actionHtml = `
                    <div class="item-inspector-stats" style="margin-top:15px;">
                        <h4>${this.t('ui_effect') || 'Effect'}</h4>
                        <div style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:10px;">${buffDesc} · ${recipe.battles} ${this.t('ui_battles') || 'battle(s)'}</div>
                        <button class="btn btn-primary btn-consume-meal" data-meal="${item.id}" style="width:100%;">
                            ${this.t('ui_feed_heroes') || 'Feed Heroes'}
                        </button>
                    </div>
                `;
            }
        }

        if (item.type === 'equipment' && item.rawEquipment) {
            const eq = item.rawEquipment;
            categoryLabel = this.t('ui_equipment');
            const descKey = 'desc_' + eq.type + '_' + eq.material;
            const descVal = this.t(descKey);
            description = descVal !== descKey ? descVal : `${this.t('tier_' + eq.material)} ${this.t('eq_' + eq.type)}.`;
            
            // Format stats block
            const formattedStats = getFormattedStats(eq, this.t.bind(this));
            
            detailsHtml = `
                <div class="item-inspector-stats">
                    <h4>Equipment Stats</h4>
                    <div class="inspector-stat-row">
                        <span class="inspector-stat-label">Slot</span>
                        <span class="inspector-stat-value" style="text-transform: capitalize;">${eq.type} (${eq.slot})</span>
                    </div>
                    <div class="inspector-stat-row">
                        <span class="inspector-stat-label">Tier</span>
                        <span class="inspector-stat-value">${eq.tier || 1}</span>
                    </div>
                    <div class="inspector-stat-row">
                        <span class="inspector-stat-label">Level</span>
                        <span class="inspector-stat-value">+${eq.level || 0}</span>
                    </div>
                    <div class="inspector-stat-row">
                        <span class="inspector-stat-label">Properties</span>
                        <span class="inspector-stat-value" style="color: var(--success);">${formattedStats}</span>
                    </div>
                </div>
            `;
        }

        this.elements.detail.innerHTML = `
            <div class="item-inspector">
                <div class="item-inspector-header">
                    <div class="item-inspector-visual">
                        <span class="item-inspector-icon">${item.icon}</span>
                    </div>
                    <div class="item-inspector-title-group">
                        <span class="item-inspector-badge">${categoryLabel}</span>
                        <h2>${item.name}</h2>
                        <div class="item-inspector-qty">${this.t('ui_owned') || 'Owned'}: <strong>${item.qty}</strong></div>
                    </div>
                </div>
                
                <div class="item-inspector-body">
                    <p class="item-inspector-description">${description}</p>
                    ${detailsHtml}
                    ${actionHtml}
                </div>
            </div>
        `;
    }
}
