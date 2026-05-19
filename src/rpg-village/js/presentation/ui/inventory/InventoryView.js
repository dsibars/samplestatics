import { BaseView } from '../BaseView.js';
import { getEquipmentName, getEquipmentStats, getFormattedStats } from '../shared/EquipmentHelper.js';

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
                    items.push({
                        id,
                        type: 'food',
                        name: this.t(id),
                        qty: count,
                        icon: '🌾'
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
                const icon = item.type === 'weapon' ? '🗡️' : (item.slot === 'head' ? '🪖' : (item.slot === 'body' ? '👕' : '🥾'));
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

        if (item.type === 'equipment' && item.rawEquipment) {
            const eq = item.rawEquipment;
            categoryLabel = this.t('ui_equipment');
            description = this.t('desc_' + eq.type + '_' + eq.material) || `${this.t('material_' + eq.material)} ${this.t('eq_' + eq.type)}.`;
            
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
                </div>
            </div>
        `;
    }
}
