import { BaseView } from '../BaseView.js';

export class HeroesView extends BaseView {
    constructor() {
        super('heroes');
        this.selectedHeroId = null;
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
                }
            });
        }
    }

    update(state) {
        this.lastRawState = state;
        const heroes = state.heroes;
        if (!heroes) return;

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
                magicPower: activeHero.magicPower
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
            card.querySelector('.list-item-level').textContent = `LVL ${hero.level}`;
            
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
        let equipHtml = equipSlots.map(slot => `
            <div class="equip-slot">
                <span class="slot-name">${this.t('slot_' + slot)}</span>
                <span class="slot-item">${hero.equipment[slot] ? hero.equipment[slot].name : this.t('ui_empty_slot')}</span>
            </div>
        `).join('');

        let skillsHtml = Object.keys(hero.skills).map(skillId => `
            <div class="skill-item">
                <span class="skill-name">${this.t(skillId)}</span>
                <span class="skill-level">Lvl ${hero.skills[skillId]}</span>
            </div>
        `).join('');

        const hasStatPoints = hero.statPoints > 0;
        const canAllocate = hasStatPoints && isIdle;
        const statPointsText = canAllocate 
            ? this.t('ui_stat_points').replace('{amount}', hero.statPoints)
            : this.t('ui_stat_points_busy').replace('{amount}', hero.statPoints);

        this.elements.detail.innerHTML = `
            <div class="hero-profile">
                <header class="building-profile-header">
                    <div class="profile-title-group">
                        <span class="profile-badge">${this.t(hero.origin)}</span>
                        <h2>${hero.name} <span class="hero-level-text">(${this.t('ui_level')} ${hero.level})</span></h2>
                    </div>
                </header>
                <div class="hero-info-section">
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
                </div>
                <div class="stats-grid">
                    <div class="stat-row">
                        <span>HP</span> 
                        <div class="stat-value-group">
                            <span>${hero.hp} / ${hero.maxHp}</span>
                            ${canAllocate ? `<button class="btn-assign-stat" data-stat="baseMaxHp">+</button>` : ''}
                        </div>
                    </div>
                    <div class="stat-row">
                        <span>MP</span> 
                        <div class="stat-value-group">
                            <span>${hero.mp} / ${hero.maxMp}</span>
                            ${canAllocate ? `<button class="btn-assign-stat" data-stat="baseMaxMp">+</button>` : ''}
                        </div>
                    </div>
                    <div class="stat-row">
                        <span>STR</span> 
                        <div class="stat-value-group">
                            <span>${hero.strength}</span>
                            ${canAllocate ? `<button class="btn-assign-stat" data-stat="baseStrength">+</button>` : ''}
                        </div>
                    </div>
                    <div class="stat-row">
                        <span>SPD</span> 
                        <div class="stat-value-group">
                            <span>${hero.speed}</span>
                            ${canAllocate ? `<button class="btn-assign-stat" data-stat="baseSpeed">+</button>` : ''}
                        </div>
                    </div>
                    <div class="stat-row">
                        <span>DEF</span> 
                        <div class="stat-value-group">
                            <span>${hero.defense}</span>
                            ${canAllocate ? `<button class="btn-assign-stat" data-stat="baseDefense">+</button>` : ''}
                        </div>
                    </div>
                    <div class="stat-row">
                        <span>MAG</span> 
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
}
