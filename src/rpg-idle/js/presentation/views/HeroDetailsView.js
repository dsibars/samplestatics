import { View } from '../View.js';
import { engine } from '../../engine/Engine.js';
import { t } from '../../i18n.js';

export class HeroDetailsView extends View {
    constructor(props) {
        super(props);
        this.activeTab = 'stats'; // 'stats', 'skills', 'equipment'
    }

    render() {
        const hero = engine.heroes.get(this.props.heroId);
        if (!hero) return `<div>Hero not found</div>`;

        if (this.isMobile) {
            return this.renderMobile(hero);
        } else {
            return this.renderDesktop(hero);
        }
    }

    renderMobile(hero) {
        return `
            <div class="mobile-layout">
                ${this.renderHeader(hero)}
                ${this.renderTabs()}
                <div class="tab-content">
                    ${this.renderActiveTab(hero)}
                </div>
            </div>
        `;
    }

    renderDesktop(hero) {
        return `
            <div class="desktop-layout">
                <div class="desktop-sidebar">
                    ${this.renderHeader(hero)}
                    ${this.renderStats(hero)}
                </div>
                <div class="desktop-main">
                    ${this.renderSkills(hero)}
                    ${this.renderEquipment(hero)}
                </div>
            </div>
        `;
    }

    renderHeader(hero) {
        const nextExp = hero.level * 20;
        const progress = Math.min(100, (hero.exp / nextExp) * 100);

        return `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h2 style="margin: 0; font-size: 1.5rem;">${hero.name}</h2>
                        <div style="color: var(--text-dim); font-size: 0.9rem;">Lvl ${hero.level} ${t(hero.origin)}</div>
                    </div>
                    <div class="btn-v2" style="font-size: 0.7rem;">${hero.status.toUpperCase()}</div>
                </div>
                <div class="exp-bar-container">
                    <div class="exp-bar-fill" style="width: ${progress}%"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-dim); margin-top: 5px;">
                    <span>EXP</span>
                    <span>${hero.exp} / ${nextExp}</span>
                </div>
            </div>
        `;
    }

    renderTabs() {
        return `
            <div class="tab-nav">
                <button class="tab-btn ${this.activeTab === 'stats' ? 'active' : ''}" data-tab="stats">STATS</button>
                <button class="tab-btn ${this.activeTab === 'skills' ? 'active' : ''}" data-tab="skills">SKILLS</button>
                <button class="tab-btn ${this.activeTab === 'equipment' ? 'active' : ''}" data-tab="equipment">GEAR</button>
            </div>
        `;
    }

    renderActiveTab(hero) {
        switch (this.activeTab) {
            case 'stats': return this.renderStats(hero);
            case 'skills': return this.renderSkills(hero);
            case 'equipment': return this.renderEquipment(hero);
            default: return '';
        }
    }

    renderStats(hero) {
        const stats = [
            { id: 'baseMaxHp', label: 'HP', val: hero.maxHp, icon: '❤️' },
            { id: 'baseMaxMp', label: 'MP', val: hero.maxMp, icon: '💧' },
            { id: 'baseStrength', label: 'STR', val: hero.strength, icon: '⚔️' },
            { id: 'baseSpeed', label: 'SPD', val: hero.speed, icon: '⚡' },
            { id: 'baseDefense', label: 'DEF', val: hero.defense, icon: '🛡️' },
            { id: 'baseMagicPower', label: 'MAG', val: hero.magicPower, icon: '✨' }
        ];

        return `
            <div class="card">
                <div class="card-title"><span>📊</span> STATS <span style="margin-left: auto; font-size: 0.8rem; color: var(--text-dim);">Points: ${hero.statPoints}</span></div>
                <div class="stats-list">
                    ${stats.map(s => `
                        <div class="stat-row">
                            <span class="stat-label">${s.icon} ${s.label}</span>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <span class="stat-value">${s.val}</span>
                                <button class="btn-v2" style="padding: 2px 8px; font-size: 0.8rem;"
                                    ${hero.statPoints <= 0 ? 'disabled' : ''}
                                    data-action="increase-stat" data-stat="${s.id}">+</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderSkills(hero) {
        const allSkills = engine.catalog.listSkills();
        return `
            <div class="card">
                <div class="card-title"><span>🛡️</span> SKILLS <span style="margin-left: auto; font-size: 0.8rem; color: var(--text-dim);">Points: ${hero.skillPoints}</span></div>
                <div class="skills-list">
                    ${allSkills.map(sk => {
                        const level = hero.skills[sk.id];
                        const isUnlocked = level !== undefined;
                        const canUnlock = !isUnlocked && hero.skillPoints >= sk.unlockCost;
                        const upgradeCost = isUnlocked ? engine.catalog.getSkillUpgradeCost(sk.id, level) : sk.unlockCost;
                        const canUpgrade = isUnlocked && hero.skillPoints >= upgradeCost;

                        // Simple visibility check
                        if (sk.tier > 1 && !hero.skills[sk.dependency]) return '';

                        return `
                            <div class="skill-item ${isUnlocked ? 'unlocked' : ''}">
                                <div class="skill-header">
                                    <span class="skill-name">${t(sk.id)}</span>
                                    <span class="skill-level">${isUnlocked ? 'Lvl ' + level : 'LOCKED'}</span>
                                </div>
                                <div class="skill-desc">${t(sk.id + '_desc')}</div>
                                <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                                    <button class="btn-v2" style="font-size: 0.7rem; padding: 5px 10px;"
                                        ${(isUnlocked ? !canUpgrade : !canUnlock) ? 'disabled' : ''}
                                        data-action="${isUnlocked ? 'upgrade-skill' : 'learn-skill'}" data-skill="${sk.id}" data-cost="${upgradeCost}">
                                        ${isUnlocked ? 'UPGRADE' : 'UNLOCK'} (${upgradeCost} SP)
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    renderEquipment(hero) {
        const slots = [
            { id: 'head', label: 'Head' },
            { id: 'body', label: 'Body' },
            { id: 'legs', label: 'Legs' },
            { id: 'rightHand', label: 'Main Hand' },
            { id: 'leftHand', label: 'Off Hand' },
            { id: 'accessory', label: 'Accessory' }
        ];

        return `
            <div class="card">
                <div class="card-title"><span>🎒</span> EQUIPMENT</div>
                <div class="equip-grid">
                    ${slots.map(slot => {
                        const item = hero.equipment[slot.id];
                        return `
                            <div class="equip-slot ${item ? 'occupied' : ''}">
                                <div class="slot-name">${slot.label}</div>
                                <div class="item-name">${item ? item.name || t(item.family || item.archetype) : '---'}</div>
                                ${item && item.level ? `<div style="font-size: 0.7rem; color: var(--primary);">+${item.level}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    onMount() {
        super.onMount();

        // Protected Tab switching
        this.addInteractionListener('.tab-btn', (e, target) => {
            this.activeTab = target.dataset.tab;
            this.update();
        });

        // Protected Stat increase
        this.addInteractionListener('[data-action="increase-stat"]', (e, target) => {
            const statId = target.dataset.stat;
            engine.heroes.increaseHeroStat(this.props.heroId, statId);
            this.update();
        });

        // Protected Learn skill
        this.addInteractionListener('[data-action="learn-skill"]', (e, target) => {
            const skillId = target.dataset.skill;
            const cost = parseInt(target.dataset.cost);
            engine.heroes.learnHeroSkill(this.props.heroId, skillId, cost);
            this.update();
        });

        // Protected Upgrade skill
        this.addInteractionListener('[data-action="upgrade-skill"]', (e, target) => {
            const skillId = target.dataset.skill;
            const cost = parseInt(target.dataset.cost);
            engine.heroes.upgradeHeroSkill(this.props.heroId, skillId, cost);
            this.update();
        });
    }
}
