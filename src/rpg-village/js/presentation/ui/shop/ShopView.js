import { BaseView } from '../BaseView.js';
import { getEquipmentName, getEquipmentStats, getFormattedStats } from '../shared/EquipmentHelper.js';

export class ShopView extends BaseView {
    constructor() {
        super('shop');
        
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
            consumablesList: this.$('#shop-consumables-list'),
            weaponsList: this.$('#shop-weapons-list'),
            armorList: this.$('#shop-armor-list')
        };
    }

    onUpdate(state) {
        const completed = state.completedExpeditions || [];
        const isUnlocked = completed.includes('exp_tutorial_cave');

        if (!isUnlocked) {
            if (this.elements.lockOverlay) this.elements.lockOverlay.style.display = 'flex';
            return;
        }

        if (this.elements.lockOverlay) this.elements.lockOverlay.style.display = 'none';

        const blacksmithLevel = state.village.infrastructure.blacksmith || 0;
        const maxTier = blacksmithLevel >= 1 ? 2 : 1;

        // Render Consumables
        if (this.elements.consumablesList) {
            this.elements.consumablesList.innerHTML = this.consumables
                .map(item => this._renderShopItem(item, state))
                .join('');
        }

        // Render Weapons
        if (this.elements.weaponsList) {
            this.elements.weaponsList.innerHTML = this.weapons
                .filter(w => w.tier <= maxTier)
                .map(item => this._renderShopItem(item, state))
                .join('');
        }

        // Render Armor
        if (this.elements.armorList) {
            this.elements.armorList.innerHTML = this.armor
                .filter(a => a.tier <= maxTier)
                .map(item => this._renderShopItem(item, state))
                .join('');
        }

        // Add Event Listeners
        this._bindBuyButtons();
    }

    _renderShopItem(item, state) {
        const playerGold = state.village.gold;
        let name = '';
        let desc = '';
        const t = this.t.bind(this);

        if (item.type === 'consumable') {
            name = t(item.i18n_name);
            desc = t(item.i18n_desc);
        } else {
            name = getEquipmentName(item, t);
            desc = getFormattedStats(item, t);
        }

        // Calculate owned quantity
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

        const canAfford = playerGold >= item.cost;
        const btnClass = canAfford ? 'btn-primary' : 'btn-secondary';

        return `
            <div class="shop-item-card">
                <div class="shop-item-header">
                    <span class="shop-item-name">
                        ${name}
                        <span class="shop-item-owned" style="color: var(--text-muted); font-size: 0.75rem; font-weight: normal; margin-left: 5px;">(${t('ui_owned') || 'Owned'}: ${ownedCount})</span>
                    </span>
                    <span class="shop-item-cost">💰 ${item.cost}</span>
                </div>
                <div class="shop-item-details">
                    <span class="shop-item-stats">${desc}</span>
                    <button class="btn ${btnClass} btn-sm btn-buy-action" 
                            data-item='${JSON.stringify(item)}' 
                            data-cost="${item.cost}" 
                            ${canAfford ? '' : 'disabled'}>
                        ${t('ui_buy')}
                    </button>
                </div>
            </div>
        `;
    }

    _bindBuyButtons() {
        this.$$('.btn-buy-action').forEach(btn => {
            // Remove any old listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', () => {
                const itemData = JSON.parse(newBtn.getAttribute('data-item'));
                const cost = parseInt(newBtn.getAttribute('data-cost'));
                this.emit('buyItem', { itemData, costGold: cost });
            });
        });
    }
}
