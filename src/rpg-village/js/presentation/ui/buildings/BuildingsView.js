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
            card.querySelector('.list-item-level').textContent = `LVL ${level}`;
            
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

    renderDetail(village, state) {
        if (!this.elements.detail) return;

        if (!this.selectedBuildingId) {
            this.elements.detail.innerHTML = `
                <div class="empty-detail">
                    <div class="detail-icon-bg">⚒️</div>
                    <p data-i18n="ui_select_building">${this.t('ui_select_building')}</p>
                </div>
            `;
            return;
        }

        const id = this.selectedBuildingId;
        const currentLevel = village.infrastructure[id];
        const nextLevel = currentLevel + 1;
        
        // Cost calculation logic (should match Engine values)
        const costGold = nextLevel * 50;
        const costWood = nextLevel * 20;
        const duration = nextLevel * 2;

        const hasGold = village.gold >= costGold;
        const woodCount = state.inventory?.materials?.material_wood || 0;
        const hasWood = woodCount >= costWood;
        
        const activeProject = village.constructionQueue.find(p => p.buildingId === id);

        this.elements.detail.innerHTML = `
            <div class="building-profile">
                <header class="building-profile-header">
                    <div class="profile-title-group">
                        <span class="profile-badge">INFRASTRUCTURE</span>
                        <h2>${this.t('village_' + id)}</h2>
                    </div>
                    <div class="profile-stat">
                        <span class="label">CURRENT LEVEL</span>
                        <span class="value">${currentLevel}</span>
                    </div>
                </header>

                <div class="upgrade-section">
                    <h3>Next Upgrade: Level ${nextLevel}</h3>
                    <p class="description">Expanding this structure will increase the village's capacity and unlock new potential.</p>
                    
                    <div class="cost-grid">
                        <div class="cost-item ${!hasGold ? 'insufficient' : ''}">
                            <span class="label">GOLD</span>
                            <span class="value">💰 ${costGold}</span>
                        </div>
                        <div class="cost-item ${!hasWood ? 'insufficient' : ''}">
                            <span class="label">WOOD</span>
                            <span class="value">🪵 ${costWood}</span>
                        </div>
                        <div class="cost-item">
                            <span class="label">TIME</span>
                            <span class="value">⏳ ${duration} Days</span>
                        </div>
                    </div>

                    <div class="action-footer">
                        ${activeProject ? `
                            <button class="btn btn-secondary btn-lg" disabled>
                                ⏳ ${this.t('ui_under_construction') || 'Under Construction'} (${activeProject.daysRemaining}d)
                            </button>
                        ` : `
                            <button class="btn btn-primary btn-lg upgrade-btn" ${(!hasGold || !hasWood) ? 'disabled' : ''}>
                                <span class="icon">⚒️</span>
                                ${this.t('btn_confirm')}
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;

        const btn = this.elements.detail.querySelector('.upgrade-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                this.emit('startProject', {
                    buildingId: id,
                    targetLevel: nextLevel,
                    costGold,
                    costMaterials: { material_wood: costWood },
                    duration
                });
            });
        }
    }
}
