import { BaseView } from '../BaseView.js';

export class InventoryView extends BaseView {
    constructor() {
        super('inventory');
    }

    onMount() {
        this.elements = {
            storageText: this.$('#inv-storage-text'),
            storageBar: this.$('#inv-storage-bar'),
            materialsGrid: this.$('#materials-grid'),
            foodGrid: this.$('#food-grid'),
            equipmentList: this.$('#equipment-list'),
            itemTemplate: this.$('#tpl-resource-item')
        };
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

        // Materials
        this.renderGrid(this.elements.materialsGrid, inventory.materials);
        
        // Food
        this.renderGrid(this.elements.foodGrid, inventory.food);

        // Equipment
        this.renderEquipment(inventory.equipment);
    }

    renderGrid(container, items) {
        if (!container || !items) return;
        
        container.innerHTML = '';
        const keys = Object.keys(items);
        
        if (keys.length === 0) {
            container.innerHTML = `<div class="empty-state">No items</div>`;
            return;
        }

        keys.forEach(id => {
            const count = items[id];
            if (count <= 0) return;

            const item = this.elements.itemTemplate.content.cloneNode(true).querySelector('.resource-item');
            item.querySelector('.label').textContent = this.t(id);
            item.querySelector('.value').textContent = count;
            container.appendChild(item);
        });
    }

    renderEquipment(equipment) {
        if (!this.elements.equipmentList) return;

        if (!equipment || equipment.length === 0) {
            this.elements.equipmentList.innerHTML = `<div class="empty-state" data-i18n="ui_no_items">${this.t('ui_no_items')}</div>`;
            return;
        }

        this.elements.equipmentList.innerHTML = equipment.map(item => `
            <div class="list-item">
                <div class="list-item-header">
                    <span class="list-item-title">${item.name || 'Unknown Item'}</span>
                    <span class="list-item-level">${item.rarity || 'Common'}</span>
                </div>
            </div>
        `).join('');
    }
}
