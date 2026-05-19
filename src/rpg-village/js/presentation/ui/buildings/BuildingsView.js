import { BaseView } from '../BaseView.js';

export class BuildingsView extends BaseView {
    constructor() {
        super('village'); // Buildings data is part of the village domain state
        this.selectedBuildingId = null;
    }

    onMount() {
        this.elements = {
            list: this.$('#buildings-list-container'),
            detail: this.$('#building-detail-content'),
            cardTemplate: this.$('#tpl-building-card')
        };

        // Event Delegation for the list
        if (this.elements.list) {
            this.elements.list.addEventListener('click', (e) => {
                const card = e.target.closest('.building-card');
                if (card) {
                    this.handleBuildingSelect(card.dataset.id);
                }
            });
        }
    }

    /**
     * Override update to include selection and inventory in the diff.
     */
    update(state) {
        const village = state.village;
        if (!village) return;

        // Include selectedBuildingId and wood count in the comparison key
        const stateString = JSON.stringify({ 
            infrastructure: village.infrastructure,
            constructionQueue: village.constructionQueue,
            wood: state.inventory?.materials?.material_wood,
            selection: this.selectedBuildingId
        });

        if (this.lastRenderedState === stateString) {
            return;
        }

        this.onUpdate(state);
        this.lastRenderedState = stateString;
    }

    onUpdate(state) {
        const { village } = state;
        if (!village) return;

        this.renderBuildingsList(village);
        this.renderDetail(village, state);
    }

    handleBuildingSelect(id) {
        this.selectedBuildingId = id;
        // The selection change will be picked up by the next update() call's stateString check
    }

    renderBuildingsList(village) {
        if (!this.elements.list) return;

        const buildings = Object.keys(village.infrastructure);
        this.elements.list.innerHTML = '';

        buildings.forEach(id => {
            const level = village.infrastructure[id];
            const isConstructing = village.constructionQueue.find(p => p.buildingId === id);
            
            const card = this.elements.cardTemplate.content.cloneNode(true).querySelector('.building-card');
            card.dataset.id = id;
            card.querySelector('.list-item-title').textContent = this.t('village_' + id);
            card.querySelector('.list-item-level').textContent = `${this.t('ui_level') || 'Level'} ${level}`;
            
            if (id === this.selectedBuildingId) {
                card.classList.add('active');
            }

            if (isConstructing) {
                const progress = card.querySelector('.progress-container');
                progress.classList.remove('hidden');
                const percent = ((isConstructing.duration - isConstructing.daysRemaining) / isConstructing.duration) * 100;
                progress.querySelector('.progress-bar').style.width = `${percent}%`;
            }

            this.elements.list.appendChild(card);
        });
    }

    _getUpgradeCost(buildingId, nextLevel) {
        if (buildingId === 'farm') {
            if (nextLevel === 1) return { gold: 30, wood: 10, stone: 0, duration: 1 };
            if (nextLevel === 2) return { gold: 80, wood: 30, stone: 10, duration: 3 };
        }
        if (buildingId === 'housing') {
            if (nextLevel === 2) return { gold: 150, wood: 40, stone: 10, duration: 4 };
            if (nextLevel === 3) return { gold: 300, wood: 90, stone: 45, duration: 6 };
        }
        if (buildingId === 'warehouse') {
            if (nextLevel === 2) return { gold: 120, wood: 50, stone: 30, duration: 4 };
        }
        if (buildingId === 'blacksmith') {
            if (nextLevel === 1) return { gold: 150, wood: 50, stone: 30, duration: 3 };
        }
        if (buildingId === 'infirmary') {
            if (nextLevel === 1) return { gold: 150, wood: 100, stone: 0, duration: 3 };
            if (nextLevel === 2) return { gold: 400, wood: 200, stone: 100, duration: 5 };
            if (nextLevel === 3) return { gold: 800, wood: 300, stone: 200, duration: 7 };
        }
        // Fallback default
        return {
            gold: nextLevel * 100,
            wood: nextLevel * 50,
            stone: nextLevel * 25,
            duration: nextLevel * 2
        };
    }

    _getBuildingStatsComparison(id, currentLevel, nextLevel) {
        const t = this.t.bind(this);
        let currentEffect = '';
        let nextEffect = '';
        let label = '';

        if (id === 'farm') {
            label = t('ui_effect_grain') || 'Daily Grain';
            currentEffect = `+${4 * currentLevel}`;
            nextEffect = `+${4 * nextLevel}`;
        } else if (id === 'housing') {
            label = t('ui_effect_pop') || 'Max Villagers';
            const calcPop = (lvl) => {
                if (lvl <= 0) return 0;
                if (lvl === 1) return 3;
                if (lvl === 2) return 10;
                return 20 + (lvl - 3) * 10;
            };
            currentEffect = `${calcPop(currentLevel)}`;
            nextEffect = `${calcPop(nextLevel)}`;
        } else if (id === 'warehouse') {
            label = t('ui_effect_storage') || 'Max Storage';
            const calcStorage = (lvl) => {
                if (lvl <= 0) return 100;
                if (lvl === 1) return 200;
                if (lvl === 2) return 500;
                return 500 + (lvl - 2) * 500;
            };
            currentEffect = `${calcStorage(currentLevel)} 🪵/🪨`;
            nextEffect = `${calcStorage(nextLevel)} 🪵/🪨`;
        } else if (id === 'blacksmith') {
            label = t('ui_effect_forge') || 'Forge Features';
            currentEffect = currentLevel >= 1 ? 'Iron Gear' : 'Locked';
            nextEffect = 'Iron Gear & Refining';
        } else if (id === 'infirmary') {
            label = t('ui_effect_heal') || 'Passive Healing';
            currentEffect = `+${currentLevel * 10}%`;
            nextEffect = `+${nextLevel * 10}%`;
        }

        return `
            <div class="building-stats-comparison">
                <h4>${t('ui_building_effects') || 'Building Effects'}</h4>
                <div class="building-stat-row">
                    <span class="building-stat-label">${label}</span>
                    <span class="building-stat-values">
                        ${currentEffect} ➡️ <span class="building-stat-next">${nextEffect}</span>
                    </span>
                </div>
            </div>
        `;
    }

    renderDetail(village, state) {
        if (!this.elements.detail) return;
        if (!this.selectedBuildingId) {
            this.elements.detail.innerHTML = `
                <div class="empty-detail">
                    <div class="detail-icon-bg">🏢</div>
                    <p data-i18n="ui_select_building">${this.t('ui_select_building')}</p>
                </div>
            `;
            return;
        }

        const id = this.selectedBuildingId;
        const currentLevel = village.infrastructure[id];
        const nextLevel = currentLevel + 1;
        
        // Cost calculation logic (matches calibrated specifications)
        const cost = this._getUpgradeCost(id, nextLevel);
        const costGold = cost.gold;
        const costWood = cost.wood;
        const costStone = cost.stone;
        const duration = cost.duration;

        const hasGold = village.gold >= costGold;
        
        const woodCount = state.inventory?.materials?.material_wood || 0;
        const hasWood = woodCount >= costWood;

        const stoneCount = state.inventory?.materials?.material_stone || 0;
        const hasStone = stoneCount >= costStone;
        
        const activeProject = village.constructionQueue.find(p => p.buildingId === id);

        const icons = {
            housing: '🏠',
            farm: '🌾',
            warehouse: '📦',
            blacksmith: '⚒️',
            infirmary: '🏥'
        };
        const icon = icons[id] || '🏢';

        this.elements.detail.innerHTML = `
            <div class="building-profile">
                <header class="building-profile-header">
                    <div class="profile-title-group">
                        <span class="profile-badge">${this.t('ui_infrastructure') || 'INFRASTRUCTURE'}</span>
                        <h2>${this.t('village_' + id)}</h2>
                    </div>
                    <div class="profile-stat">
                        <span class="label">${this.t('ui_current_level') || 'CURRENT LEVEL'}</span>
                        <span class="value">${currentLevel}</span>
                    </div>
                </header>

                <div class="building-detail-grid">
                    <div class="building-detail-visual-column">
                        <div class="building-preview-card">
                            <div class="building-preview-icon">${icon}</div>
                        </div>
                    </div>
                    <div class="building-detail-info-column">
                        <p class="building-description">${this.t('desc_' + id)}</p>
                        
                        ${this._getBuildingStatsComparison(id, currentLevel, nextLevel)}
                        
                        <div class="upgrade-section">
                            <h3>${(this.t('ui_next_upgrade') || 'Next Upgrade: Level {level}').replace('{level}', nextLevel)}</h3>
                            
                            <div class="cost-grid">
                                <div class="cost-item ${!hasGold ? 'insufficient' : ''}">
                                    <span class="label">${this.t('village_gold') || 'GOLD'}</span>
                                    <span class="value">💰 ${costGold}</span>
                                </div>
                                ${costWood > 0 ? `
                                <div class="cost-item ${!hasWood ? 'insufficient' : ''}">
                                    <span class="label">${this.t('material_wood') || 'WOOD'}</span>
                                    <span class="value">🪵 ${costWood}</span>
                                </div>
                                ` : ''}
                                ${costStone > 0 ? `
                                <div class="cost-item ${!hasStone ? 'insufficient' : ''}">
                                    <span class="label">${this.t('material_stone') || 'STONE'}</span>
                                    <span class="value">🪨 ${costStone}</span>
                                </div>
                                ` : ''}
                                <div class="cost-item">
                                    <span class="label">${this.t('ui_time') || 'TIME'}</span>
                                    <span class="value">⏳ ${duration} ${this.t('ui_days') || 'Days'}</span>
                                </div>
                            </div>

                            <div class="action-footer">
                                ${activeProject ? `
                                    <button class="btn btn-secondary btn-lg" disabled>
                                        ⏳ ${this.t('ui_under_construction') || 'Under Construction'} (${activeProject.daysRemaining}d)
                                    </button>
                                ` : `
                                    <button class="btn btn-primary btn-lg upgrade-btn" ${(!hasGold || !hasWood || !hasStone) ? 'disabled' : ''}>
                                        <span class="icon">⚒️</span>
                                        ${this.t('btn_confirm')}
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const btn = this.elements.detail.querySelector('.upgrade-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                const materials = {};
                if (costWood > 0) materials.material_wood = costWood;
                if (costStone > 0) materials.material_stone = costStone;

                this.emit('startProject', {
                    buildingId: id,
                    targetLevel: nextLevel,
                    costGold,
                    costMaterials: materials,
                    duration
                });
            });
        }
    }
}
