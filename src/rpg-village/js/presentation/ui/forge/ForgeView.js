import { BaseView } from '../BaseView.js';
import { getEquipmentName, getEquipmentStats } from '../shared/EquipmentHelper.js';

export class ForgeView extends BaseView {
    constructor() {
        super('forge');
        this.selectedItemId = null;
    }

    onMount() {
        this.elements = {
            lockOverlay: this.$('#forge-lock-overlay'),
            itemsList: this.$('#forge-items-list'),
            detailContent: this.$('#forge-detail-content')
        };
    }

    update(state) {
        if (!state) return;
        
        const blacksmithLevel = state.village?.infrastructure?.blacksmith || 0;
        const playerGold = state.village?.gold || 0;
        
        const stateString = JSON.stringify({
            blacksmithLevel,
            playerGold,
            equipmentCount: state.inventory?.equipment?.length || 0,
            heroesCount: state.heroes?.length || 0,
            selectedItemId: this.selectedItemId
        });

        if (this.lastRenderedState === stateString) {
            return;
        }

        this.onUpdate(state);
        this.lastRenderedState = stateString;
    }

    onUpdate(state) {
        const blacksmithLevel = state.village.infrastructure.blacksmith || 0;
        const isUnlocked = blacksmithLevel >= 1;

        if (!isUnlocked) {
            if (this.elements.lockOverlay) this.elements.lockOverlay.style.display = 'flex';
            return;
        }

        if (this.elements.lockOverlay) this.elements.lockOverlay.style.display = 'none';

        const equipment = [...(state.inventory.equipment || [])];

        // Merge equipped items from all heroes
        if (state.heroes) {
            state.heroes.forEach(h => {
                ['head', 'body', 'legs', 'leftHand', 'rightHand', 'accessory'].forEach(slot => {
                    const item = h.equipment[slot];
                    if (item) {
                        equipment.push({
                            ...item,
                            equippedOn: h.name
                        });
                    }
                });
            });
        }

        // Render Equipment List
        if (this.elements.itemsList) {
            if (equipment.length === 0) {
                this.elements.itemsList.innerHTML = `<div class="empty-state" data-i18n="ui_no_items">${this.t('ui_no_items')}</div>`;
                this.selectedItemId = null;
            } else {
                this.elements.itemsList.innerHTML = equipment.map(item => {
                    const activeClass = this.selectedItemId === item.id ? 'active' : '';
                    const equippedSuffix = item.equippedOn ? ` [${item.equippedOn}]` : '';
                    return `
                        <div class="list-item forge-item-row ${activeClass}" data-id="${item.id}">
                            <div class="list-item-header">
                                <span class="list-item-title">${getEquipmentName(item, this.t.bind(this))}${equippedSuffix}</span>
                                <span class="list-item-level">+${item.level || 0}</span>
                            </div>
                        </div>
                    `;
                }).join('');

                // Bind Item Select Click
                this.$$('.forge-item-row').forEach(row => {
                    row.addEventListener('click', () => {
                        this.selectedItemId = row.getAttribute('data-id');
                        this.ui.forceUpdate(); // Re-trigger update to render details
                    });
                });
            }
        }

        // Render Detail Pane
        this._renderDetails(equipment, state);
    }

    _renderDetails(equipment, state) {
        if (!this.elements.detailContent) return;

        const selectedItem = equipment.find(e => e.id === this.selectedItemId);

        if (!selectedItem) {
            this.elements.detailContent.innerHTML = `
                <div class="empty-detail">
                    <div class="detail-icon-bg">🔥</div>
                    <p data-i18n="ui_select_item" style="color: var(--text-muted);">${this.t('ui_select_item') || 'Select a piece of equipment from the inventory to upgrade.'}</p>
                </div>
            `;
            return;
        }

        const t = this.t.bind(this);
        const currentLevel = selectedItem.level || 0;
        const isMaxLevel = currentLevel >= 10;
        
        // Calculate Stats
        const currentStats = getEquipmentStats(selectedItem);
        const nextItemMock = { ...selectedItem, level: currentLevel + 1 };
        const nextStats = isMaxLevel ? null : getEquipmentStats(nextItemMock);

        // Render Stats Comparison
        let statsHtml = '';
        const allStatKeys = Array.from(new Set([...Object.keys(currentStats), ...(nextStats ? Object.keys(nextStats) : [])]));
        
        if (allStatKeys.length === 0) {
            statsHtml = `<div style="color: var(--text-muted); font-size: 0.9rem;">${t('ui_no_item_stats') || 'No stats modification.'}</div>`;
        } else {
            statsHtml = allStatKeys.map(key => {
                const curVal = currentStats[key] || 0;
                let nextValHtml = '';
                if (!isMaxLevel && nextStats) {
                    const nextVal = nextStats[key] || 0;
                    if (nextVal !== curVal) {
                        const diff = nextVal - curVal;
                        const diffSign = diff > 0 ? '+' : '';
                        nextValHtml = ` ➔ <span class="forge-stat-next">${nextVal} (${diffSign}${diff})</span>`;
                    }
                }
                
                // Capitalize and format key
                const labelMap = {
                    strength: 'ui_stats_power',
                    defense: 'ui_stats_defense',
                    maxHp: 'ui_stats_hp',
                    maxMp: 'ui_stats_mp',
                    magicPower: 'ui_stats_magic',
                    speed: 'ui_stats_speed',
                    evasion: 'ui_stats_evasion',
                    mpCostReduction: 'ui_stats_mpreduce'
                };
                const labelKey = labelMap[key] || key;
                const label = t(labelKey) || key.toUpperCase();
                return `
                    <div class="forge-stat-row">
                        <span class="forge-stat-label">${label}</span>
                        <span class="forge-stat-values">${curVal}${nextValHtml}</span>
                    </div>
                `;
            }).join('');
        }

        // Calculate Costs
        let costHtml = '';
        let canAfford = true;

        if (!isMaxLevel) {
            const cost = this._getRefineCost(selectedItem);
            const playerGold = state.village.gold;
            const goldClass = playerGold >= cost.gold ? '' : 'insufficient';
            if (playerGold < cost.gold) canAfford = false;

            let costItems = [
                `<div class="forge-cost-item ${goldClass}">
                    <span class="label">💰 Gold</span>
                    <span class="value">${cost.gold} / ${playerGold}</span>
                </div>`
            ];

             for (const [matId, requiredQty] of Object.entries(cost.materials)) {
                 let ownedQty = 0;
                 if (matId.startsWith('material_')) {
                     ownedQty = state.inventory.materials?.[matId] || 0;
                 } else if (matId.startsWith('food_')) {
                     ownedQty = state.inventory.food?.[matId] || 0;
                 } else {
                     ownedQty = state.inventory.consumables?.[matId] || 0;
                 }
                 const isEnough = ownedQty >= requiredQty;
                 if (!isEnough) canAfford = false;
                 const matClass = isEnough ? '' : 'insufficient';
                 const matName = t(matId) || matId;

                 costItems.push(`
                     <div class="forge-cost-item ${matClass}">
                         <span class="label">📦 ${matName}</span>
                         <span class="value">${requiredQty} / ${ownedQty}</span>
                     </div>
                 `);
             }

            costHtml = `
                <div class="forge-cost-section">
                    <h4 data-i18n="ui_refine_cost">${t('ui_refine_cost')}</h4>
                    <div class="forge-cost-grid">
                        ${costItems.join('')}
                    </div>
                </div>
            `;
        }

        const btnLabel = isMaxLevel ? t('ui_refine_max') : t('ui_refine');
        const btnDisabled = isMaxLevel || !canAfford;

        this.elements.detailContent.innerHTML = `
            <div class="forge-upgrade-header">
                <div class="forge-title-group">
                    <h2>${getEquipmentName(selectedItem, t)}</h2>
                </div>
                <span class="forge-level-badge">+${currentLevel}</span>
            </div>

            <div class="forge-stats-comparison">
                <h4 data-i18n="ui_item_stats">${t('ui_item_stats') || 'Stats'}</h4>
                ${statsHtml}
            </div>

            ${costHtml}

            <div class="forge-action-footer">
                <button class="btn btn-primary btn-lg" id="btn-forge-refine" ${btnDisabled ? 'disabled' : ''}>
                    <span class="icon">🔥</span>
                    <span>${btnLabel}</span>
                </button>
            </div>
        `;

        // Bind Refine Click
        const btnRefine = this.$('#btn-forge-refine');
        if (btnRefine && !btnDisabled) {
            btnRefine.addEventListener('click', () => {
                this.emit('refineItem', { itemId: selectedItem.id });
            });
        }
    }

    _getRefineCost(item) {
        const L = item.level || 0;
        const nextLevel = L + 1;
        const mat = item.material;
        
        const cost = {
            gold: 0,
            materials: {}
        };
        
        if (mat === 'wooden') {
            cost.gold = 30 * nextLevel;
            cost.materials.material_wood = 10 * nextLevel;
        } else if (mat === 'iron') {
            cost.gold = 75 * nextLevel;
            cost.materials.material_wood = 5 * nextLevel;
            cost.materials.material_stone = 5 * nextLevel;
            cost.materials.material_iron_ore = 3 * nextLevel;
        } else if (mat === 'steel') {
            cost.gold = 150 * nextLevel;
            cost.materials.material_stone = 10 * nextLevel;
            cost.materials.material_steel_ingot = 3 * nextLevel;
        } else if (mat === 'gold') {
            cost.gold = 300 * nextLevel;
            cost.materials.material_stone = 15 * nextLevel;
        } else if (mat === 'mythril') {
            cost.gold = 500 * nextLevel;
            cost.materials.material_mythril = 2 * nextLevel;
        }
        
        return cost;
    }
}
