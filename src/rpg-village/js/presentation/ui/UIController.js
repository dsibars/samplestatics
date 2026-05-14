/**
 * UIController - Manages the DOM and components.
 */
export class UIController {
    constructor() {
        this.elements = {
            goldCount: document.getElementById('gold-count'),
            villagerCount: document.getElementById('villager-count'),
            btnStart: document.getElementById('btn-start'),
            navItems: document.querySelectorAll('.nav-item')
        };
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.elements.navItems.forEach(item => {
            item.addEventListener('click', () => {
                this.setActiveNav(item);
            });
        });
    }

    setActiveNav(item) {
        this.elements.navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const view = item.getAttribute('data-view');
        console.log(`Switching to view: ${view}`);
    }

    updateStats(state) {
        if (this.elements.goldCount) {
            this.elements.goldCount.textContent = Math.floor(state.gold);
        }
        if (this.elements.villagerCount) {
            this.elements.villagerCount.textContent = state.villagers;
        }
    }

    onInitialize(callback) {
        if (this.elements.btnStart) {
            this.elements.btnStart.addEventListener('click', callback);
        }
    }
}
