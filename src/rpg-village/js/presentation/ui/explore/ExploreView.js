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

        this.root.addEventListener('click', (e) => {
            const subviewBtn = e.target.closest('[data-subview]');
            if (subviewBtn) {
                this.ui.switchView(subviewBtn.dataset.subview);
                return;
            }
        });

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
            activeExpeditions: state.activeExpeditions,
            maxConcurrentExpeditions: state.maxConcurrentExpeditions,
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
        this.renderStatus(state.activeExpeditions, state.maxConcurrentExpeditions);
        this.renderExpeditionDetail(state);
    }

    renderStatus(activeExpeditions, maxConcurrentExpeditions) {
        if (!this.elements.statusBanner) return;
        const count = activeExpeditions ? activeExpeditions.length : 0;
        if (count > 0) {
            this.elements.statusBanner.className = 'status-banner';
            this.elements.statusBanner.innerHTML = `<span>${this.t('ui_active_expeditions')}</span>: ${count} / ${maxConcurrentExpeditions}`;
        } else {
            this.elements.statusBanner.className = 'status-banner none';
        }
    }

    renderRegionsList(expeditions) {
        if (!this.elements.listContainer || !this.elements.tplRegion || !this.elements.tplNode) return;

        const byRegion = {};
        expeditions.forEach(exp => {
            if (!byRegion[exp.regionId]) byRegion[exp.regionId] = [];
            byRegion[exp.regionId].push(exp);
        });

        this.elements.listContainer.innerHTML = '';

        for (const [regionId, exps] of Object.entries(byRegion)) {
            const regionEl = this.elements.tplRegion.content.cloneNode(true).querySelector('.region-group');
            regionEl.querySelector('.region-title').textContent = this.t(regionId) || regionId;
            
            const nodesContainer = regionEl.querySelector('.region-nodes');
            exps.forEach(exp => {
                const nodeEl = this.elements.tplNode.content.cloneNode(true).querySelector('.expedition-card');
                nodeEl.dataset.id = exp.id;
                nodeEl.querySelector('.list-item-title').textContent = exp.name;
                const labelStages = this.t('ui_exp_stages') || 'Stages';
                const recLevel = Math.max(1, ...(exp.stages || []).map(s => s.enemyLevel || 1));
                nodeEl.querySelector('.list-item-badge').textContent = `${exp.stages.length} ${labelStages} • Lv. ${recLevel}`;

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
        const activeExpeditions = state.activeExpeditions || [];
        const activeExp = activeExpeditions.find(e => e.id === this.selectedExpId);
        const isActiveNode = !!activeExp;
        const isAtMax = activeExpeditions.length >= (state.maxConcurrentExpeditions || 1);
        const isLocked = isActiveNode && activeExp.currentStage > 0;

        if (!exp && activeExpeditions.length > 0) {
            this.selectedExpId = activeExpeditions[0].id;
            return this.update(this.lastRawState);
        }

        if (!exp) {
            this.elements.detailContent.innerHTML = `
                <div class="empty-detail">
                    <p data-i18n="ui_select_expedition">Select an expedition node on the map.</p>
                </div>`;
            return;
        }

        let dashboardHtml = '';
        if (isActiveNode) {
            const isStageZero = activeExp.currentStage === 0;
            dashboardHtml = `
                <div class="active-expedition-dashboard" style="margin-bottom: 20px; padding: 15px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.2);">
                    <h3 style="margin-top: 0; color: var(--primary-color);">${this.t('ui_assigned_expedition')}</h3>
                    <p class="description">${isStageZero ? this.t('ui_waiting_combat') : this.t('ui_progress_combat')}</p>
                    <div class="exp-progress">
                        <h4>${this.t('exp_stage')} ${activeExp.currentStage} / ${exp.stages.length}</h4>
                        <div class="progress-bar-container" style="background: rgba(255,255,255,0.1); height: 10px; border-radius: 5px; margin: 10px 0;">
                            <div class="progress-bar" style="background: var(--primary-color); height: 100%; border-radius: 5px; width: ${(activeExp.currentStage / exp.stages.length) * 100}%"></div>
                        </div>
                    </div>
                    <button class="btn btn-secondary btn-retire" style="width: 100%; margin-top: 10px;">${this.t('ui_unassign_retire')}</button>
                </div>
            `;
        } else if (isAtMax) {
            dashboardHtml = `
                <div class="alert alert-warning" style="margin-bottom: 20px;">
                    ${this.t('ui_max_expeditions_reached')}
                </div>
            `;
        }

        const idleHeroes = state.heroes.filter(h => h.activity === 'idle');
        const assignedHeroes = isActiveNode ? state.heroes.filter(h => activeExp.heroIds.includes(h.id)) : [];
        
        const busyHeroIds = new Set();
        activeExpeditions.forEach(ae => {
            if (ae.id !== this.selectedExpId) {
                ae.heroIds.forEach(id => busyHeroIds.add(id));
            }
        });
        
        let heroListHtml = '';
        let availableHeroes = [];
        
        if (isLocked) {
            const lvlLabel = this.t('ui_level') || 'Level';
            heroListHtml = `<p>${this.t('ui_roster_locked')}</p>
                <ul>${assignedHeroes.map(h => `<li>${h.name} (${lvlLabel} ${h.level})</li>`).join('')}</ul>`;
        } else {
            availableHeroes = [...assignedHeroes, ...idleHeroes].filter(h => !busyHeroIds.has(h.id));
            if (availableHeroes.length === 0) {
                heroListHtml = `<p>${this.t('ui_no_idle_heroes')}</p>`;
            } else {
                heroListHtml = `<div class="hero-checkbox-list">
                    ${availableHeroes.map(h => {
                        const isAssigned = isActiveNode && activeExp.heroIds.includes(h.id);
                        const isChecked = this.selectedHeroIds.has(h.id) || (isAssigned && !this.selectedHeroIds.size);
                        if (isChecked) this.selectedHeroIds.add(h.id);
                        
                        const isWounded = h.hp <= 0;
                        return `
                        <label class="hero-checkbox-item ${isWounded ? 'wounded' : ''}">
                            <input type="checkbox" value="${h.id}" class="exp-hero-check" ${isChecked ? 'checked' : ''} ${isWounded ? 'disabled' : ''}>
                            <div class="hero-info" style="${isWounded ? 'opacity: 0.6;' : ''}">
                                <strong>${h.name}</strong> (${this.t('ui_level') || 'Level'} ${h.level})
                                <br><small style="color: ${isWounded ? '#ff3b30; font-weight: bold;' : (h.hp < h.maxHp * 0.5 ? '#ff9500; font-weight: bold;' : '#4cd964;')};">
                                    ${isWounded ? '💀 ' + (this.t('ui_wounded') || 'Wounded') : `HP: ${h.hp}/${h.maxHp}`}
                                </small>
                            </div>
                        </label>
                        `;
                    }).join('')}
                </div>`;
            }
        }

        const canStart = !isLocked && (!isAtMax || isActiveNode) && availableHeroes.length > 0;

        this.elements.detailContent.innerHTML = `
            ${dashboardHtml}
            <div class="expedition-profile">
                <header class="building-profile-header">
                    <div class="profile-title-group">
                        <span class="profile-badge">${exp.isStory ? this.t('ui_exp_story') : this.t('ui_exp_exploration')}</span>
                        <h2>${this.t(exp.id) !== exp.id ? this.t(exp.id) : exp.name}</h2>
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
                        <button class="btn btn-primary btn-start-exp" ${!canStart ? 'disabled' : ''}>
                            ${isActiveNode ? this.t('ui_update_assignment') : this.t('ui_assign_heroes')}
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        if (isActiveNode) {
            const retireBtn = this.elements.detailContent.querySelector('.btn-retire');
            if (retireBtn) {
                retireBtn.addEventListener('click', () => {
                    this.ui.showConfirmDialog({
                        title: 'ui_retire_title',
                        message: 'ui_retire_message',
                        onConfirm: () => {
                            this.emit('retireExpedition', { expId: this.selectedExpId });
                            this.selectedHeroIds.clear();
                        }
                    });
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
