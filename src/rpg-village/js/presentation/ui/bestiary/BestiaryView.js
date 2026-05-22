import { BaseView } from '../BaseView.js';

const TYPE_ICONS = {
    beast: '🐺',
    humanoid: '👺',
    elemental: '💧',
    undead: '💀',
    dragon: '🐉'
};

const ELEMENT_COLORS = {
    fire: '#ff6b6b',
    water: '#4dabf7',
    earth: '#8ce99a',
    wind: '#74c0fc',
    neutral: '#adb5bd'
};

export class BestiaryView extends BaseView {
    constructor() {
        super('bestiary');
    }

    onMount() {
        this.elements = {
            grid: this.$('#bestiary-grid'),
            count: this.$('#bestiary-count'),
            cardTemplate: this.$('#tpl-bestiary-card')
        };

        this.root.addEventListener('click', (e) => {
            const subviewBtn = e.target.closest('[data-subview]');
            if (subviewBtn) {
                this.ui.switchView(subviewBtn.dataset.subview);
                return;
            }
        });
    }

    onUpdate(state) {
        this.renderBestiary(state);
    }

    renderBestiary(state) {
        const grid = this.elements.grid;
        const countEl = this.elements.count;
        const template = this.elements.cardTemplate;
        if (!grid || !template) return;

        const discovered = state.bestiary || [];
        const templates = state.enemyTemplates || {};
        const allIds = Object.keys(templates);

        if (countEl) {
            countEl.textContent = `${discovered.length} / ${allIds.length}`;
        }

        grid.innerHTML = '';

        if (allIds.length === 0) {
            grid.innerHTML = `<div class="bestiary-empty">${this.t('ui_bestiary_empty') || 'No creatures catalogued yet.'}</div>`;
            return;
        }

        allIds.forEach(id => {
            const t = templates[id];
            const isDiscovered = discovered.includes(id);
            const card = template.content.cloneNode(true).querySelector('.bestiary-card');

            const icon = TYPE_ICONS[t.type] || '❓';
            const name = isDiscovered ? t.name : '???';

            card.querySelector('.bestiary-type-badge').textContent = icon;
            card.querySelector('.bestiary-name').textContent = name;

            if (isDiscovered) {
                card.querySelector('.bestiary-hp').textContent = t.maxHp;
                card.querySelector('.bestiary-str').textContent = t.strength;
                card.querySelector('.bestiary-def').textContent = t.defense;
                card.querySelector('.bestiary-spd').textContent = t.speed;

                const elDiv = card.querySelector('.bestiary-element');
                const elColor = ELEMENT_COLORS[t.element] || ELEMENT_COLORS.neutral;
                const elKey = 'el_' + t.element;
                const elVal = this.t(elKey);
                elDiv.innerHTML = `<span style="color:${elColor};">●</span> ${elVal !== elKey ? elVal : t.element}`;
            } else {
                card.querySelector('.bestiary-hp').textContent = '?';
                card.querySelector('.bestiary-str').textContent = '?';
                card.querySelector('.bestiary-def').textContent = '?';
                card.querySelector('.bestiary-spd').textContent = '?';
                card.querySelector('.bestiary-element').textContent = '';
                card.style.opacity = '0.45';
            }

            grid.appendChild(card);
        });
    }
}
