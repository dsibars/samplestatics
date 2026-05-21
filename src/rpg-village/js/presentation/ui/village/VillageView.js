import { BaseView } from '../BaseView.js';

/**
 * VillageView - Manages the main village dashboard.
 */
export class VillageView extends BaseView {
    constructor() {
        super('village');
    }

    onMount() {
        this.elements = {
            gold: this.$('#village-gold'),
            pop: this.$('#village-pop'),
            popAvail: this.$('#village-pop-avail'),
            builderCount: this.$('#village-builder-count'),
            builderAvail: this.$('#village-builder-avail'),
            storageText: this.$('#village-storage-text'),
            storageBar: this.$('#village-storage-bar'),
            constructionList: this.$('#construction-list'),
            objectivesList: this.$('#daily-objectives-list'),
            roleControls: this.$('#role-controls')
        };

        const builderControls = this.$('.builder-controls');
        if (builderControls) {
            builderControls.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;
                const action = btn.dataset.action;
                if (action === 'inc-builder') {
                    this.emit('setBuilders', { delta: 1 });
                } else if (action === 'dec-builder') {
                    this.emit('setBuilders', { delta: -1 });
                }
            });
        }

        const roleControls = this.$('#role-controls');
        if (roleControls) {
            roleControls.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-role-action]');
                if (!btn) return;
                const role = btn.dataset.role;
                const action = btn.dataset.roleAction;
                if (action === 'inc') {
                    this.emit('setWorkerRole', { role, delta: 1 });
                } else if (action === 'dec') {
                    this.emit('setWorkerRole', { role, delta: -1 });
                }
            });
        }
    }

    onUpdate(state) {
        const { village, inventory } = state;
        if (!village) return;

        // Status Updates
        if (this.elements.gold) this.elements.gold.textContent = Math.floor(village.gold);
        
        if (this.elements.pop) {
            this.elements.pop.textContent = `${village.population.total} / ${village.population.max}`;
        }
        if (this.elements.popAvail) {
            const avail = village.population.total - (village.population.assigned || 0);
            this.elements.popAvail.textContent = avail;
        }

        if (this.elements.builderCount) {
            this.elements.builderCount.textContent = `${village.population.builders || 0} / ${village.population.total}`;
        }
        if (this.elements.builderAvail) {
            this.elements.builderAvail.textContent = village.population.availableBuilders || 0;
        }

        // Storage Updates
        if (inventory && this.elements.storageText) {
            const used = inventory.totalUsed || 0;
            const max = village.maxStorage || 100;
            this.elements.storageText.textContent = `${used} / ${max}`;
            
            if (this.elements.storageBar) {
                const percent = Math.min(100, (used / max) * 100);
                this.elements.storageBar.style.width = `${percent}%`;
                this.elements.storageBar.classList.toggle('warning', percent > 75);
                this.elements.storageBar.classList.toggle('danger', percent > 90);
            }
        }

        // Render Canvas Visuals
        this.renderVillageCanvas(village);

        // Worker Roles
        this.renderRoles(village.population);

        // Construction Queue
        this.renderConstructionQueue(village.constructionQueue);

        // Daily Objectives
        this.renderDailyObjectives(state.dailyObjectives);

        // Daily Report
        this.renderDailyReport(village.lastDailyReport);
    }

    renderVillageCanvas(village) {
        const canvas = this.$('#village-canvas-container');
        if (!canvas) return;

        const infra = village.infrastructure || {};
        
        const tiles = [
            { id: 'townhall', name: 'Town Hall', icon: '🏛️', lvl: 1, active: true },
            { id: 'housing', name: this.t('village_housing') || 'Housing', icon: '🏠', lvl: infra.housing || 0, active: (infra.housing || 0) > 0 },
            { id: 'farm', name: this.t('village_farm') || 'Farm', icon: '🌾', lvl: infra.farm || 0, active: (infra.farm || 0) > 0 },
            { id: 'warehouse', name: this.t('village_warehouse') || 'Warehouse', icon: '📦', lvl: infra.warehouse || 0, active: (infra.warehouse || 0) > 0 },
            { id: 'blacksmith', name: this.t('village_blacksmith') || 'Blacksmith', icon: '⚒️', lvl: infra.blacksmith || 0, active: (infra.blacksmith || 0) > 0 },
            { id: 'training_grounds', name: this.t('village_training_grounds') || 'Training Grounds', icon: '💪', lvl: infra.training_grounds || 0, active: (infra.training_grounds || 0) > 0 },
            { id: 'explorer_guild', name: this.t('village_explorer_guild') || 'Explorer Guild', icon: '🧭', lvl: infra.explorer_guild || 0, active: (infra.explorer_guild || 0) > 0 },
            { id: 'infirmary', name: this.t('village_infirmary') || 'Infirmary', icon: '🏥', lvl: infra.infirmary || 0, active: (infra.infirmary || 0) > 0 }
        ];

        canvas.innerHTML = `
            <div class="village-grid">
                ${tiles.map(tile => {
                    const statusClass = tile.active ? 'active' : 'locked';
                    const lvlLabel = this.t('ui_level') || 'Level';
                    const displayedIcon = tile.active ? tile.icon : '🔒';
                    const displayedLvl = tile.active ? `${lvlLabel} ${tile.lvl}` : (this.t('ui_locked') || 'Locked');
                    
                    return `
                        <div class="village-tile ${statusClass}">
                            <div class="village-tile-icon">${displayedIcon}</div>
                            <div class="village-tile-name">${tile.name}</div>
                            <div class="village-tile-level">${displayedLvl}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderDailyReport(report) {
        const container = this.$('#daily-report-container');
        if (!container) return;

        if (!report) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';

        let builtHtml = '';
        if (report.completed && report.completed.length > 0) {
            builtHtml = `
                <div class="report-section">
                    <span class="report-icon">🔨</span>
                    <span>${this.t('ui_report_built')} ${report.completed.map(id => this.t('village_' + id)).join(', ')}</span>
                </div>
            `;
        }

        let growthHtml = '';
        if (report.growth > 0) {
            growthHtml = `
                <div class="report-section">
                    <span class="report-icon">👶</span>
                    <span>${this.t('ui_report_growth').replace('{amount}', report.growth)}</span>
                </div>
            `;
        }

        let minerHtml = '';
        if (report.minerYield && (report.minerYield.wood > 0 || report.minerYield.stone > 0)) {
            const yields = [];
            if (report.minerYield.wood > 0) yields.push(`${report.minerYield.wood} ${this.t('material_wood')}`);
            if (report.minerYield.stone > 0) yields.push(`${report.minerYield.stone} ${this.t('material_stone')}`);
            minerHtml = `
                <div class="report-section success">
                    <span class="report-icon">⛏️</span>
                    <span>${this.t('ui_report_miner').replace('{yield}', yields.join(', '))}</span>
                </div>
            `;
        }

        let expHtml = '';
        if (report.expedition) {
            const exp = report.expedition;
            const expName = this.t(exp.expId) || exp.expName || 'Expedition';
            
            if (exp.status === 'completed') {
                let rewardsStr = '';
                if (exp.reward) {
                    const rewards = [];
                    if (exp.reward.gold) rewards.push(`${exp.reward.gold} ${this.t('village_gold')}`);
                    if (exp.reward.items) {
                        for (const [id, qty] of Object.entries(exp.reward.items)) {
                            rewards.push(`${qty} ${this.t(id) || id}`);
                        }
                    }
                    rewardsStr = rewards.join(', ');
                }
                expHtml = `
                    <div class="report-section success">
                        <span class="report-icon">✨</span>
                        <span>${this.t('ui_report_exp_completed').replace('{name}', expName).replace('{rewards}', rewardsStr)}</span>
                    </div>
                `;
            } else if (exp.status === 'failed') {
                expHtml = `
                    <div class="report-section danger">
                        <span class="report-icon">💀</span>
                        <span>${this.t('ui_report_exp_failed').replace('{name}', expName)}</span>
                    </div>
                `;
            } else if (exp.status === 'progress') {
                expHtml = `
                    <div class="report-section">
                        <span class="report-icon">⚔️</span>
                        <span>${this.t('ui_report_exp_progress').replace('{name}', expName)}</span>
                    </div>
                `;
            }
        }

        let recoveryHtml = '';
        if (report.recovery && report.recovery.length > 0) {
            const healedStr = report.recovery.map(h => `${h.heroName} (+${h.amount} HP)`).join(', ');
            recoveryHtml = `
                <div class="report-section success">
                    <span class="report-icon">💖</span>
                    <span>${this.t('ui_report_recovery').replace('{healed}', healedStr)}</span>
                </div>
            `;
        }

        let trainingHtml = '';
        if (report.training && report.training.length > 0) {
            const leveled = report.training.filter(t => t.leveledUp).map(t => t.heroName);
            if (leveled.length > 0) {
                trainingHtml = `
                    <div class="report-section success">
                        <span class="report-icon">💪</span>
                        <span>${this.t('ui_report_training_level').replace('{heroes}', leveled.join(', '))}</span>
                    </div>
                `;
            } else {
                trainingHtml = `
                    <div class="report-section">
                        <span class="report-icon">💪</span>
                        <span>${this.t('ui_report_training').replace('{count}', report.training.length)}</span>
                    </div>
                `;
            }
        }

        container.innerHTML = `
            <div class="card widget daily-report-widget">
                <h3>${this.t('ui_daily_report_title').replace('{day}', report.day - 1)}</h3>
                <div class="report-content">
                    <div class="report-section ${report.starvation ? 'danger' : ''}">
                        <span class="report-icon">🍞</span>
                        <span>${report.starvation ? this.t('ui_report_starvation') : this.t('ui_report_food').replace('{amount}', report.consumed)}</span>
                    </div>
                    ${growthHtml}
                    ${minerHtml}
                    ${builtHtml}
                    ${recoveryHtml}
                    ${trainingHtml}
                    ${expHtml}
                </div>
            </div>
        `;
    }

    renderRoles(population) {
        if (!this.elements.roleControls) return;

        const roles = population.roles || { builder: population.builders || 0, farmer: 0, miner: 0, scout: 0 };
        const total = population.total || 0;
        const used = Object.values(roles).reduce((a, b) => a + b, 0);
        const available = total - used;

        const ROLE_ICONS = {
            builder: '🔨',
            farmer: '🌾',
            miner: '⛏️',
            scout: '👁️'
        };

        const ROLE_EFFECTS = {
            builder: this.t('ui_role_builder') || 'Construction',
            farmer: this.t('ui_role_farmer') || '+10% food per farmer',
            miner: this.t('ui_role_miner') || '20% chance for mats',
            scout: this.t('ui_role_scout') || '-1 stage per 2 scouts'
        };

        this.elements.roleControls.innerHTML = Object.entries(roles).map(([role, count]) => {
            const canInc = available > 0;
            const canDec = count > 0;
            return `
                <div class="role-row">
                    <span class="role-name">${ROLE_ICONS[role]} ${this.t('role_' + role) || role} <span style="font-size:0.75rem; color:var(--text-muted);">(${ROLE_EFFECTS[role]})</span></span>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <button class="btn-role" data-role="${role}" data-role-action="dec" ${canDec ? '' : 'disabled'}>−</button>
                        <span class="role-count">${count}</span>
                        <button class="btn-role" data-role="${role}" data-role-action="inc" ${canInc ? '' : 'disabled'}>+</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderDailyObjectives(dailyObj) {
        if (!this.elements.objectivesList) return;

        if (!dailyObj || !dailyObj.objectives || dailyObj.objectives.length === 0) {
            this.elements.objectivesList.innerHTML = `
                <div class="empty-state" data-i18n="ui_no_objectives">${this.t('ui_no_objectives')}</div>`;
            return;
        }

        const allDone = dailyObj.allCompleted;

        let html = dailyObj.objectives.map(obj => {
            const pct = Math.min(100, Math.floor((obj.progress / obj.target) * 100));
            const isDone = obj.completed;
            const label = (this.t(obj.label) || obj.label).replace('{target}', obj.target);

            return `
                <div class="objective-item ${isDone ? 'completed' : ''}">
                    <div class="objective-header">
                        <span class="objective-check">${isDone ? '✅' : '⬜'}</span>
                        <span class="objective-label">${label}</span>
                        <span class="objective-progress">${obj.progress} / ${obj.target}</span>
                    </div>
                    <div class="progress-container" style="margin-top: 6px;">
                        <div class="progress-bar ${isDone ? 'success' : ''}" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        }).join('');

        if (allDone) {
            html += `
                <div class="objective-all-completed">
                    <span>🎉</span> ${this.t('ui_all_objectives_done') || 'All objectives completed! Bonus rewards granted.'}
                </div>
            `;
        }

        this.elements.objectivesList.innerHTML = html;
    }

    renderConstructionQueue(queue) {
        if (!this.elements.constructionList) return;

        if (!queue || queue.length === 0) {
            this.elements.constructionList.innerHTML = `
                <div class="empty-state" data-i18n="ui_no_projects">
                    ${this.t('ui_no_projects')}
                </div>`;
            return;
        }

        this.elements.constructionList.innerHTML = queue.map(project => `
            <div class="list-item construction-item">
                <div class="list-item-header">
                    <span class="list-item-title">${this.t('village_' + project.buildingId)}</span>
                    <span class="list-item-level">${this.t('ui_level') || 'Level'} ${project.targetLevel}</span>
                </div>
                <div class="construction-status">
                    <span class="days-remaining">⏳ ${project.daysRemaining} ${this.t('ui_days') || 'Days'}</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar warning" style="width: ${((project.duration - project.daysRemaining) / project.duration) * 100}%"></div>
                </div>
            </div>
        `).join('');
    }
}
