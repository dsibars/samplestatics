import { BaseView } from '../BaseView.js';
import { getEquipmentName, getEquipmentStats } from '../shared/EquipmentHelper.js';
import { SKILLS_DATA } from '../../../engine/shared/data/GameConstants.js';

export class HeroesView extends BaseView {
    constructor() {
        super('heroes');
        this.selectedHeroId = null;
        this.inventoryEquipment = [];
    }

    onMount() {
        this.elements = {
            list: this.$('#heroes-list-container'),
            detail: this.$('#hero-detail-content'),
            cardTemplate: this.$('#tpl-hero-card')
        };

        if (this.elements.list) {
            this.elements.list.addEventListener('click', (e) => {
                const card = e.target.closest('.list-item');
                if (card) {
                    this.selectedHeroId = card.dataset.id;
                    this.ui.update(this.lastRawState); // Force re-render for selection change
                }
            });
        }

        if (this.elements.detail) {
            this.elements.detail.addEventListener('click', (e) => {
                const btn = e.target.closest('.btn-assign-stat');
                if (btn) {
                    const statId = btn.dataset.stat;
                    this.emit('increaseStat', { heroId: this.selectedHeroId, statId });
                    return;
                }

                const slotBtn = e.target.closest('.equip-slot.clickable');
                if (slotBtn) {
                    const slot = slotBtn.dataset.slot;
                    this._openEquipModal(slot);
                    return;
                }

                const learnBtn = e.target.closest('.btn-learn-skill');
                if (learnBtn) {
                    this.emit('learnSkill', { heroId: this.selectedHeroId, skillId: learnBtn.dataset.skill, unlockCost: parseInt(learnBtn.dataset.cost) });
                    return;
                }

                const upgradeBtn = e.target.closest('.btn-upgrade-skill');
                if (upgradeBtn) {
                    this.emit('upgradeSkill', { heroId: this.selectedHeroId, skillId: upgradeBtn.dataset.skill, upgradeCost: 1 });
                    return;
                }
            });
        }
    }

    update(state) {
        this.lastRawState = state;
        const heroes = state.heroes;
        if (!heroes) return;

        this.inventoryEquipment = state.inventory.equipment || [];

        const activeHero = heroes.find(h => h.id === this.selectedHeroId);
        const stateString = JSON.stringify({
            heroes: heroes.map(h => ({ id: h.id, level: h.level })),
            selection: this.selectedHeroId,
            activeHero: activeHero ? {
                statPoints: activeHero.statPoints,
                hp: activeHero.hp,
                maxHp: activeHero.maxHp,
                mp: activeHero.mp,
                maxMp: activeHero.maxMp,
                strength: activeHero.strength,
                speed: activeHero.speed,
                defense: activeHero.defense,
                magicPower: activeHero.magicPower,
                equipment: activeHero.equipment
            } : null
        });

        if (this.lastRenderedState === stateString) return;

        this.onUpdate(state);
        this.lastRenderedState = stateString;
    }

    onUpdate(state) {
        this.renderHeroesList(state.heroes);
        this.renderHeroDetail(state);
    }

    renderHeroesList(heroes) {
        if (!this.elements.list || !this.elements.cardTemplate) return;

        this.elements.list.innerHTML = '';
        heroes.forEach(hero => {
            const card = this.elements.cardTemplate.content.cloneNode(true).querySelector('.list-item');
            card.dataset.id = hero.id;
            card.querySelector('.list-item-title').textContent = hero.name;
            card.querySelector('.list-item-level').textContent = `${this.t('ui_level') || 'Level'} ${hero.level}`;
            
            if (hero.id === this.selectedHeroId) {
                card.classList.add('active');
            }

            this.elements.list.appendChild(card);
        });
    }

    renderHeroDetail(state) {
        if (!this.elements.detail) return;

        const hero = state.heroes.find(h => h.id === this.selectedHeroId);
        if (!hero) {
            this.elements.detail.innerHTML = `
                <div class="empty-detail">
                    <p data-i18n="ui_select_hero">${this.t('ui_select_hero')}</p>
                </div>`;
            return;
        }

        const isIdle = hero.activity === 'idle';
        const activityText = isIdle ? this.t('ui_activity_idle') : this.t('ui_activity_expedition');

        const equipSlots = ['head', 'body', 'legs', 'leftHand', 'rightHand', 'accessory'];
        let equipHtml = equipSlots.map(slot => {
            const hasItem = !!hero.equipment[slot];
            const itemName = hasItem ? getEquipmentName(hero.equipment[slot], this.t.bind(this)) : this.t('ui_empty_slot');
            const clickableClass = isIdle ? 'clickable' : 'locked';
            return `
                <div class="equip-slot ${clickableClass}" data-slot="${slot}">
                    <span class="slot-name">${this.t('slot_' + slot)}</span>
                    <span class="slot-item" style="color: ${hasItem ? 'var(--accent-color)' : 'var(--text-muted)'};">${itemName}</span>
                </div>
            `;
        }).join('');

        const hasSkillPoints = hero.skillPoints > 0;
        const canManageSkills = hasSkillPoints && isIdle;

        const allSkills = Object.values(SKILLS_DATA);
        let skillsHtml = allSkills.map(skill => {
            const skillId = skill.id;
            const learned = hero.skills[skillId] !== undefined;
            const level = learned ? hero.skills[skillId] : null;
            const depMet = !skill.dependency || hero.skills[skill.dependency] !== undefined;
            const canLearn = !learned && depMet && canManageSkills && hero.skillPoints >= skill.unlockCost;
            const canUpgrade = learned && canManageSkills && hero.skillPoints >= 1 && level < 5;

            let actionBtn = '';
            if (learned && canUpgrade) {
                actionBtn = `<button class="btn btn-primary btn-sm btn-upgrade-skill" data-skill="${skillId}">+1 (${this.t('ui_cost') || 'Cost'} 1)</button>`;
            } else if (learned) {
                actionBtn = `<span class="skill-max-label">${this.t('ui_max') || 'MAX'}</span>`;
            } else if (canLearn) {
                actionBtn = `<button class="btn btn-primary btn-sm btn-learn-skill" data-skill="${skillId}" data-cost="${skill.unlockCost}">${this.t('ui_unlock') || 'Unlock'} (${skill.unlockCost} SP)</button>`;
            } else if (!depMet) {
                actionBtn = `<span class="skill-locked-label">${this.t('ui_locked') || 'Locked'}</span>`;
            } else {
                actionBtn = `<span class="skill-locked-label">${skill.unlockCost} SP</span>`;
            }

            const categoryClass = `skill-cat-${skill.category}`;
            const tierClass = `skill-tier-${skill.tier}`;
            const learnedClass = learned ? 'skill-learned' : 'skill-locked';

            return `
                <div class="skill-item ${categoryClass} ${tierClass} ${learnedClass}">
                    <div class="skill-info">
                        <span class="skill-name">${this.t(skillId)}</span>
                        <span class="skill-meta">${skill.mpCost > 0 ? skill.mpCost + ' MP' : '0 MP'} · ${this.t('cat_' + skill.category) || skill.category}</span>
                    </div>
                    <div class="skill-actions">
                        ${learned ? `<span class="skill-level">Lv.${level}</span>` : ''}
                        ${actionBtn}
                    </div>
                </div>
            `;
        }).join('');

        const hasStatPoints = hero.statPoints > 0;
        const canAllocate = hasStatPoints && isIdle;
        const statPointsText = canAllocate 
            ? this.t('ui_stat_points').replace('{amount}', hero.statPoints)
            : this.t('ui_stat_points_busy').replace('{amount}', hero.statPoints);

        let avatarSrc = 'assets/heroes/arthur.png';
        if (hero.avatar) {
            avatarSrc = `assets/heroes/${hero.avatar}`;
        } else {
            const fallbackMap = {
                origin_warrior: 'arthur.png',
                origin_guard: 'valen.png',
                origin_thief: 'origin_thief.png',
                origin_monk: 'origin_monk.png',
                origin_clown: 'origin_clown.png',
                origin_poet: 'origin_poet.png'
            };
            const mapped = fallbackMap[hero.origin] || 'arthur.png';
            avatarSrc = `assets/heroes/${mapped}`;
        }

        this.elements.detail.innerHTML = `
            <div class="hero-profile">
                <div class="hero-detail-header-card">
                    <div class="hero-portrait-container">
                        <img class="hero-portrait-img" src="${avatarSrc}" alt="${hero.name}">
                    </div>
                    <div class="hero-detail-info">
                        <div class="profile-title-group">
                            <span class="profile-badge">${this.t(hero.origin)}</span>
                            <h2>${hero.name} <span class="hero-level-text">(${this.t('ui_level')} ${hero.level})</span></h2>
                        </div>
                        <p class="hero-origin-desc"><em>${this.t(hero.origin + '_desc')}</em></p>
                        <div class="hero-status-row">
                            <span><strong>${this.t('ui_activity')}:</strong> <span class="status-badge ${isIdle ? 'idle' : 'busy'}">${activityText}</span></span>
                            <span><strong>${this.t('ui_experience')}:</strong> ${hero.exp} / ${hero.expToNextLevel}</span>
                        </div>
                        ${hasStatPoints ? `
                        <div class="stat-points-alert ${canAllocate ? '' : 'locked'}">
                            <strong>${statPointsText}</strong>
                        </div>
                        ` : ''}
                        ${hero.skillPoints > 0 ? `
                        <div class="stat-points-alert ${canManageSkills ? '' : 'locked'}" style="margin-top: 6px; background: rgba(99, 102, 241, 0.1); border-color: rgba(99, 102, 241, 0.3);">
                            <strong>${this.t('ui_skill_points').replace('{amount}', hero.skillPoints)}${!canManageSkills ? ' (Cannot spend on expedition)' : ''}</strong>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="stats-grid">
                    <div class="stat-row">
                        <span>${this.t('ui_stats_hp') || 'HP'}</span> 
                        <div class="stat-value-group">
                            <span>${hero.hp} / ${hero.maxHp}</span>
                            ${canAllocate ? `<button class="btn-assign-stat" data-stat="baseMaxHp">+</button>` : ''}
                        </div>
                    </div>
                    <div class="stat-row">
                        <span>${this.t('ui_stats_mp') || 'MP'}</span> 
                        <div class="stat-value-group">
                            <span>${hero.mp} / ${hero.maxMp}</span>
                            ${canAllocate ? `<button class="btn-assign-stat" data-stat="baseMaxMp">+</button>` : ''}
                        </div>
                    </div>
                    <div class="stat-row">
                        <span>${this.t('ui_stats_power') || 'STR'}</span> 
                        <div class="stat-value-group">
                            <span>${hero.strength}</span>
                            ${canAllocate ? `<button class="btn-assign-stat" data-stat="baseStrength">+</button>` : ''}
                        </div>
                    </div>
                    <div class="stat-row">
                        <span>${this.t('ui_stats_speed') || 'SPD'}</span> 
                        <div class="stat-value-group">
                            <span>${hero.speed}</span>
                            ${canAllocate ? `<button class="btn-assign-stat" data-stat="baseSpeed">+</button>` : ''}
                        </div>
                    </div>
                    <div class="stat-row">
                        <span>${this.t('ui_stats_defense') || 'DEF'}</span> 
                        <div class="stat-value-group">
                            <span>${hero.defense}</span>
                            ${canAllocate ? `<button class="btn-assign-stat" data-stat="baseDefense">+</button>` : ''}
                        </div>
                    </div>
                    <div class="stat-row">
                        <span>${this.t('ui_stats_magic') || 'MAG'}</span> 
                        <div class="stat-value-group">
                            <span>${hero.magicPower}</span>
                            ${canAllocate ? `<button class="btn-assign-stat" data-stat="baseMagicPower">+</button>` : ''}
                        </div>
                    </div>
                </div>
                <div class="hero-sections-grid">
                    <div class="hero-section">
                        <h3>${this.t('ui_equipment')}</h3>
                        <div class="equipment-list">
                            ${equipHtml}
                        </div>
                    </div>
                    <div class="hero-section">
                        <h3>${this.t('ui_skills')}</h3>
                        <div class="skills-list">
                            ${skillsHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    _openEquipModal(slot) {
        const hero = this.lastRawState.heroes.find(h => h.id === this.selectedHeroId);
        if (!hero || hero.activity !== 'idle') return;

        const currentItem = hero.equipment[slot];

        // Filter eligible items in inventory
        const eligibleItems = this.inventoryEquipment.filter(item => {
            if (slot === 'leftHand' || slot === 'rightHand') {
                return item.type === 'weapon' || (item.type === 'armor' && item.slot === slot);
            } else {
                return item.type === 'armor' && item.slot === slot;
            }
        });

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.style.zIndex = '2000';

        const t = this.t.bind(this);

        let itemsHtml = '';
        if (eligibleItems.length === 0) {
            itemsHtml = `<div style="text-align:center; padding: 25px; color: var(--text-muted); font-size: 0.95rem;">${t('ui_no_items')}</div>`;
        } else {
            itemsHtml = eligibleItems.map(item => {
                const statsObj = getEquipmentStats(item);
                const statLines = [];
                if (statsObj.strength) statLines.push(`+${statsObj.strength} ${t('ui_stats_power') || 'STR'}`);
                if (statsObj.defense) statLines.push(`+${statsObj.defense} DEF`);
                if (statsObj.maxHp) statLines.push(`+${statsObj.maxHp} HP`);
                if (statsObj.maxMp) statLines.push(`+${statsObj.maxMp} MP`);
                if (statsObj.magicPower) statLines.push(`+${statsObj.magicPower} MAG`);
                if (statsObj.speed) statLines.push(`${statsObj.speed} SPD`);
                if (statsObj.evasion) statLines.push(`${statsObj.evasion > 0 ? '+' : ''}${statsObj.evasion}% EVA`);
                const desc = statLines.join(', ');

                return `
                    <div class="list-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 8px; cursor: default;">
                        <div style="flex: 1; text-align: left; padding-right: 10px;">
                            <div style="font-weight:700; color: var(--text-primary);">${getEquipmentName(item, t)}</div>
                            <div style="font-size:0.8rem; color:var(--text-secondary); margin-top: 2px;">${desc}</div>
                        </div>
                        <button class="btn btn-primary btn-sm btn-select-equip" data-id="${item.id}" style="min-width: 70px;">
                            ${t('ui_equip') || 'Equip'}
                        </button>
                    </div>
                `;
            }).join('');
        }

        modalOverlay.innerHTML = `
            <div class="modal-body" style="max-width: 480px; max-height: 80vh; display: flex; flex-direction: column;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid var(--glass-border); padding-bottom: 10px;">
                    <h3 style="margin: 0; font-size:1.1rem; color: var(--accent-color);">${t('ui_equip')} - ${t('slot_' + slot)}</h3>
                    <button class="btn btn-secondary btn-sm" id="btn-close-equip-modal" style="padding: 4px 8px; font-size: 0.8rem;">❌</button>
                </div>
                
                <div style="flex: 1; overflow-y: auto; margin-bottom: 15px; padding-right: 5px;">
                    ${currentItem ? `
                        <div style="background: rgba(239, 68, 68, 0.05); border: 1px dashed var(--danger); padding: 12px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <div style="text-align: left;">
                                <div style="font-size: 0.8rem; color: var(--text-muted);">${t('ui_equipped') || 'Equipped'}:</div>
                                <div style="font-weight: 700; color: var(--danger); margin-top: 2px;">${getEquipmentName(currentItem, t)}</div>
                            </div>
                            <button class="btn btn-danger btn-sm" id="btn-unequip-slot" style="padding: 6px 12px; font-size: 0.8rem;">
                                ${t('ui_unequip') || 'Unequip'}
                            </button>
                        </div>
                    ` : ''}
                    
                    <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 10px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; text-align: left;">
                        ${t('ui_available_gear') || 'Available Gear'}
                    </div>
                    ${itemsHtml}
                </div>
                
                <div class="modal-actions" style="border-top: 1px solid var(--glass-border); padding-top: 12px; display: flex; justify-content: flex-end;">
                    <button class="btn btn-secondary btn-sm" id="btn-cancel-equip-modal">${t('btn_cancel')}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);

        const closeModal = () => {
            document.body.removeChild(modalOverlay);
        };

        modalOverlay.querySelector('#btn-close-equip-modal').addEventListener('click', closeModal);
        modalOverlay.querySelector('#btn-cancel-equip-modal').addEventListener('click', closeModal);

        if (currentItem) {
            modalOverlay.querySelector('#btn-unequip-slot').addEventListener('click', () => {
                this.emit('unequipItem', { heroId: this.selectedHeroId, slot });
                closeModal();
            });
        }

        modalOverlay.querySelectorAll('.btn-select-equip').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.dataset.id;
                this.emit('equipItem', { heroId: this.selectedHeroId, slot, itemId });
                closeModal();
            });
        });
    }
}

