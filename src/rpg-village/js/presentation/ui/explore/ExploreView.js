import { BaseView } from '../BaseView.js';

export class ExploreView extends BaseView {
    constructor() {
        super('explore');
        this.selectedExpId = null;
        this.selectedHeroIds = new Set();
    }

    onMount() {
        this.elements = {
            listContainer: this.$('#regions-list-container'),
            detailContent: this.$('#expedition-detail-content'),
            statusBanner: this.$('#explore-status-banner'),
            tplRegion: this.$('#tpl-region-group'),
            tplNode: this.$('#tpl-expedition-node')
        };

        if (this.elements.listContainer) {
            this.elements.listContainer.addEventListener('click', (e) => {
                const card = e.target.closest('.expedition-card');
                if (card) {
                    this.selectedExpId = card.dataset.id;
                    this.ui.update(this.lastRawState);
                }
            });
        }
    }

    update(state) {
        this.lastRawState = state;
        if (!state.expeditions) return;

        const stateString = JSON.stringify({
            expeditions: state.expeditions.map(e => ({ id: e.id, status: e.status, stages: e.stages.length })),
            activeExpedition: state.activeExpedition,
            selectedExpId: this.selectedExpId,
            selectedHeroes: Array.from(this.selectedHeroIds),
            idleHeroes: state.heroes?.filter(h => h.activity === 'idle').map(h => ({ id: h.id, hp: h.hp }))
        });

        if (this.lastRenderedState === stateString) return;

        this.onUpdate(state);
        this.lastRenderedState = stateString;
    }

    onUpdate(state) {
        this.renderRegionsList(state.expeditions);
        this.renderStatus(state.activeExpedition);
        this.renderExpeditionDetail(state);
    }

    renderStatus(activeExpedition) {
        if (!this.elements.statusBanner) return;
        if (activeExpedition) {
            this.elements.statusBanner.className = 'status-banner';
            // We can just show a generic "Expedition in Progress" or find its name
            this.elements.statusBanner.innerHTML = `<span data-i18n="ui_active_expeditions">${this.t('ui_active_expeditions')}</span>: In Progress`;
        } else {
            this.elements.statusBanner.className = 'status-banner none';
        }
    }

    renderRegionsList(expeditions) {
        if (!this.elements.listContainer || !this.elements.tplRegion || !this.elements.tplNode) return;

        // Group by regionId
        const byRegion = {};
        expeditions.forEach(exp => {
            if (!byRegion[exp.regionId]) byRegion[exp.regionId] = [];
            byRegion[exp.regionId].push(exp);
        });

        this.elements.listContainer.innerHTML = '';

        for (const [regionId, exps] of Object.entries(byRegion)) {
            const regionEl = this.elements.tplRegion.content.cloneNode(true).querySelector('.region-group');
            // Assuming region name translation is available, or we just display the raw ID mapped.
            // In a real scenario we'd have the region name. We'll use translation key e.g., t(regionId)
            regionEl.querySelector('.region-title').textContent = this.t(regionId) || regionId;
            
            const nodesContainer = regionEl.querySelector('.region-nodes');
            exps.forEach(exp => {
                const nodeEl = this.elements.tplNode.content.cloneNode(true).querySelector('.expedition-card');
                nodeEl.dataset.id = exp.id;
                nodeEl.querySelector('.list-item-title').textContent = exp.name;
                nodeEl.querySelector('.list-item-badge').textContent = exp.stages.length + ' Stages';
                
                if (exp.id === this.selectedExpId) {
                    nodeEl.classList.add('active');
                }
                nodesContainer.appendChild(nodeEl);
            });

            this.elements.listContainer.appendChild(regionEl);
        }
    }

    renderExpeditionDetail(state) {
        if (!this.elements.detailContent) return;

        const exp = state.expeditions.find(e => e.id === this.selectedExpId);
        
        // If nothing is selected, but there is an active expedition, select it automatically
        if (!exp && state.activeExpedition) {
            this.selectedExpId = state.activeExpedition.id;
            // Return to re-render in next cycle, or just proceed by re-evaluating
            return this.update(this.lastRawState);
        }

        if (!exp) {
            this.elements.detailContent.innerHTML = `
                <div class="empty-detail">
                    <p data-i18n="ui_select_expedition">Select an expedition node on the map.</p>
                </div>`;
            return;
        }

        const isActiveNode = state.activeExpedition && state.activeExpedition.id === exp.id;
        const isAnotherActive = state.activeExpedition && state.activeExpedition.id !== exp.id;
        const isLocked = isActiveNode && state.activeExpedition.currentStage > 0;

        // Build the active dashboard if this is the active node
        let dashboardHtml = '';
        if (isActiveNode) {
            const isStageZero = state.activeExpedition.currentStage === 0;
            dashboardHtml = `
                <div class="active-expedition-dashboard" style="margin-bottom: 20px; padding: 15px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.2);">
                    <h3 style="margin-top: 0; color: var(--primary-color);">${this.t('ui_assigned_expedition')}</h3>
                    <p class="description">${isStageZero ? this.t('ui_waiting_combat') : this.t('ui_progress_combat')}</p>
                    <div class="exp-progress">
                        <h4>${this.t('exp_stage')} ${state.activeExpedition.currentStage} / ${exp.stages.length}</h4>
                        <div class="progress-bar-container" style="background: rgba(255,255,255,0.1); height: 10px; border-radius: 5px; margin: 10px 0;">
                            <div class="progress-bar" style="background: var(--primary-color); height: 100%; border-radius: 5px; width: ${(state.activeExpedition.currentStage / exp.stages.length) * 100}%"></div>
                        </div>
                    </div>
                    <button class="btn btn-secondary btn-retire" style="width: 100%; margin-top: 10px;">${this.t('ui_unassign_retire')}</button>
                </div>
            `;
        } else if (isAnotherActive) {
            dashboardHtml = `
                <div class="alert alert-warning" style="margin-bottom: 20px;">
                    ${this.t('ui_another_active')}
                </div>
            `;
        }

        // Build Hero List
        const idleHeroes = state.heroes.filter(h => h.activity === 'idle');
        const assignedHeroes = isActiveNode ? state.heroes.filter(h => state.activeExpedition.heroIds.includes(h.id)) : [];
        
        let heroListHtml = '';
        
        if (isLocked) {
            heroListHtml = `<p>${this.t('ui_roster_locked')}</p>
                <ul>${assignedHeroes.map(h => `<li>${h.name} (Lvl ${h.level})</li>`).join('')}</ul>`;
        } else {
            // Can assign new heroes
            const availableHeroes = [...assignedHeroes, ...idleHeroes];
            if (availableHeroes.length === 0) {
                heroListHtml = `<p>${this.t('ui_no_idle_heroes')}</p>`;
            } else {
                heroListHtml = `<div class="hero-checkbox-list">
                    ${availableHeroes.map(h => {
                        // Pre-check if they are already assigned, OR if they were just selected in UI
                        const isAssigned = isActiveNode && state.activeExpedition.heroIds.includes(h.id);
                        const isChecked = this.selectedHeroIds.has(h.id) || (isAssigned && !this.selectedHeroIds.size);
                        // If they are assigned, add to selectedHeroIds initially so the UI state matches
                        if (isChecked) this.selectedHeroIds.add(h.id);
                        
                        return `
                        <label class="hero-checkbox-item">
                            <input type="checkbox" value="${h.id}" class="exp-hero-check" ${isChecked ? 'checked' : ''}>
                            <div class="hero-info">
                                <strong>${h.name}</strong> (Lvl ${h.level})
                                <br><small>HP: ${h.hp}/${h.maxHp}</small>
                            </div>
                        </label>
                        `;
                    }).join('')}
                </div>`;
            }
        }

        this.elements.detailContent.innerHTML = `
            ${dashboardHtml}
            <div class="expedition-profile">
                <header class="building-profile-header">
                    <div class="profile-title-group">
                        <span class="profile-badge">${exp.isStory ? this.t('ui_exp_story') : this.t('ui_exp_exploration')}</span>
                        <h2>${this.t(exp.id) || exp.name}</h2>
                    </div>
                </header>
                <div class="exp-stats">
                    <p><strong>${this.t('ui_exp_stages')}:</strong> ${exp.stages.length}</p>
                    <p><strong>${this.t('ui_exp_base_reward')}:</strong> ${exp.reward.gold || 0} ${this.t('village_gold')}</p>
                </div>
                
                <div class="hero-selector">
                    <h3>${this.t('ui_select_heroes')}</h3>
                    ${heroListHtml}
                    ${!isLocked ? `
                        <button class="btn btn-primary btn-start-exp" ${isAnotherActive || (idleHeroes.length === 0 && assignedHeroes.length === 0) ? 'disabled' : ''}>
                            ${isActiveNode ? this.t('ui_update_assignment') : this.t('ui_assign_heroes')}
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        // Bind events
        if (isActiveNode) {
            const retireBtn = this.elements.detailContent.querySelector('.btn-retire');
            if (retireBtn) {
                retireBtn.addEventListener('click', () => {
                    this.emit('retireExpedition');
                    this.selectedHeroIds.clear();
                });
            }
        }

        const checkboxes = this.elements.detailContent.querySelectorAll('.exp-hero-check');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedHeroIds.add(e.target.value);
                } else {
                    this.selectedHeroIds.delete(e.target.value);
                }
                this.ui.update(this.lastRawState);
            });
        });

        const startBtn = this.elements.detailContent.querySelector('.btn-start-exp');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (this.selectedHeroIds.size === 0 && !isActiveNode) {
                    alert(this.t("ui_select_one_hero"));
                    return;
                }
                
                this.emit('assignExpedition', { 
                    expId: exp.id, 
                    heroIds: Array.from(this.selectedHeroIds) 
                });
            });
        }
    }
}
