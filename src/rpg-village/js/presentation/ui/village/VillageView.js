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
            day: this.$('#village-day'),
            gold: this.$('#village-gold'),
            pop: this.$('#village-pop'),
            popAvail: this.$('#village-pop-avail'),
            storageText: this.$('#village-storage-text'),
            storageBar: this.$('#village-storage-bar'),
            constructionList: this.$('#construction-list'),
            btnNextDay: this.$('#btn-next-day')
        };

        if (this.elements.btnNextDay) {
            this.elements.btnNextDay.addEventListener('click', () => {
                // Add click effect
                this.elements.btnNextDay.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.elements.btnNextDay.style.transform = '';
                }, 100);
                this.emit('nextDay');
            });
        }
    }

    onUpdate(state) {
        const { village, inventory } = state;
        if (!village) return;

        // Status Updates
        if (this.elements.day) this.elements.day.textContent = village.day;
        if (this.elements.gold) this.elements.gold.textContent = Math.floor(village.gold);
        
        if (this.elements.pop) {
            this.elements.pop.textContent = `${village.population.total} / ${village.population.max}`;
        }
        if (this.elements.popAvail) {
            const avail = village.population.total - (village.population.assigned || 0);
            this.elements.popAvail.textContent = avail;
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

        // Construction Queue
        this.renderConstructionQueue(village.constructionQueue);

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

        container.innerHTML = `
            <div class="card widget daily-report-widget">
                <h3>${this.t('ui_daily_report_title').replace('{day}', report.day - 1)}</h3>
                <div class="report-content">
                    <div class="report-section ${report.starvation ? 'danger' : ''}">
                        <span class="report-icon">🍞</span>
                        <span>${report.starvation ? this.t('ui_report_starvation') : this.t('ui_report_food').replace('{amount}', report.consumed)}</span>
                    </div>
                    ${growthHtml}
                    ${builtHtml}
                    ${recoveryHtml}
                    ${expHtml}
                </div>
            </div>
        `;
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
