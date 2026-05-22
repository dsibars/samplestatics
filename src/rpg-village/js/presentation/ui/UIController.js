/**
 * UIManager - Central UI Coordinator.
 * Manages the shell, view transitions, and domain-specific view registration.
 */
import { CombatView } from './combat/CombatView.js';
const DEBUG = false;

export class UIController {
    constructor(i18n) {
        this.i18n = i18n;
        this.elements = {
            mainContent: document.getElementById('main-content'),
            loader: document.getElementById('main-loader'),
            goldCount: document.getElementById('gold-count'),
            villagerCount: document.getElementById('villager-count'),
            woodCount: document.getElementById('wood-count'),
            globalDay: document.getElementById('global-day'),
            navItems: document.querySelectorAll('.nav-item')
        };

        this.VIEW_CATEGORIES = {
            village: 'village',
            buildings: 'village',
            heroes: 'heroes',
            explore: 'adventure',
            bestiary: 'adventure',
            shop: 'town',
            forge: 'town',
            inventory: 'town',
            settings: 'town'
        };

        this.CATEGORY_DEFAULTS = {
            village: 'village',
            heroes: 'heroes',
            adventure: 'explore',
            town: 'shop'
        };
        
        this.isShopUnlocked = false;
        this.isForgeUnlocked = false;
        this.lastState = null;
        this.categoryLastView = {
            village: 'village',
            heroes: 'heroes',
            adventure: 'explore',
            town: 'shop'
        };
        this.combatView = new CombatView({ i18n: this.i18n });
        
        this.views = new Map(); // domainName -> BaseView instance
        this.activeView = null;
        this.activeDomain = null;
        
        this.setupEventListeners();
        this.translateView(document.body); // Translate the shell
    }

    /**
     * Registers a view controller for a specific domain.
     */
    registerView(domain, viewController) {
        viewController.ui = this;
        this.views.set(domain, viewController);
    }

    setupEventListeners() {
        this.elements.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const category = item.getAttribute('data-category');
                const defaultView = item.getAttribute('data-default');
                const targetView = this.categoryLastView[category] || defaultView;
                this.switchView(targetView);
            });
        });
    }

    /**
     * Transitions to a new domain view.
     */
    async switchView(domain) {
        if (this.activeDomain === domain) return;

        // Remember this view as the last viewed for its category
        const category = this.VIEW_CATEGORIES[domain] || domain;
        this.categoryLastView[category] = domain;

        if (DEBUG) console.log(`Switching to domain: ${domain}`);

        // Update Nav UI: highlight the category tab
        this.elements.navItems.forEach(item => {
            if (item.getAttribute('data-category') === category) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        this.elements.mainContent.classList.add('view-exit');

        try {
            await new Promise(r => setTimeout(r, 150));

            // Get content from template
            const template = document.getElementById(`tpl-${domain}`);
            if (!template) throw new Error(`Template not found: tpl-${domain}`);

            // Clone template content
            const content = template.content.cloneNode(true);

            // Clear and inject
            this.elements.mainContent.innerHTML = '';
            this.elements.mainContent.appendChild(content);

            // Translate the new content
            this.translateView(this.elements.mainContent);

            // Initialize Domain Controller
            this.activeDomain = domain;
            this.activeView = this.views.get(domain);

            if (this.activeView) {
                this.activeView.mount(this.elements.mainContent.querySelector('.domain-view'), this);
            }

            requestAnimationFrame(() => {
                this.elements.mainContent.classList.remove('view-exit');
            });

        } catch (error) {
            if (DEBUG) console.error(error);
            this.elements.mainContent.innerHTML = `<div class="error-state">Error loading view: ${domain}</div>`;
            this.elements.mainContent.classList.remove('view-exit');
        }
    }

    /**
     * Scans a container for elements with data-i18n and translates them.
     */
    translateView(container) {
        if (!this.i18n) return;
        const elements = container.querySelectorAll('[data-i18n]');
        elements.forEach(el => this.translateElement(el));
    }

    /**
     * Translates a single element based on its data-i18n attribute.
     */
    translateElement(element) {
        const key = element.getAttribute('data-i18n');
        if (key) {
            element.textContent = this.t(key);
        }
    }

    /**
     * Helper to get translated string.
     */
    t(key) {
        return this.i18n ? this.i18n.t(key) : key;
    }

    /**
     * Changes the current language and re-translates the entire UI.
     */
    setLanguage(lang) {
        if (this.i18n.setLanguage(lang)) {
            this.translateView(document.body);
            if (this.lastState) {
                this.updateNavLocks(this.lastState);
            }
            return true;
        }
        return false;
    }

    updateNavLocks(state) {
        const completed = state.completedExpeditions || [];
        const isShopUnlocked = completed.includes('exp_tutorial_cave');
        const blacksmithLvl = state.village?.infrastructure?.blacksmith || 0;
        const isForgeUnlocked = blacksmithLvl >= 1;

        // Store state for views to use (lock overlays handle visual feedback now)
        this.isShopUnlocked = isShopUnlocked;
        this.isForgeUnlocked = isForgeUnlocked;
    }

    /**
     * Updates the global shell stats and the active view.
     */
    update(state) {
        this.lastState = state;
        this.updateNavLocks(state);

        // Update Shell
        if (state.village) {
            if (this.elements.globalDay) this.elements.globalDay.textContent = state.village.day || 1;
            if (this.elements.goldCount) this.elements.goldCount.textContent = Math.floor(state.village.gold || 0);
            if (this.elements.villagerCount) {
                this.elements.villagerCount.textContent = state.village.population?.total || 0;
            }
            if (this.elements.woodCount && state.inventory) {
                this.elements.woodCount.textContent = state.inventory.materials?.material_wood || 0;
            }
        }

        // Proactive storage warning
        if (state.inventory && state.village) {
            const used = state.inventory.totalUsed || 0;
            const max = state.village.maxStorage || 100;
            const pct = used / max;
            if (pct >= 0.95 && !this._storageWarningShown) {
                this.showToast(this.t('error_storage_full') || 'Storage is full!', 'error', 4000);
                this._storageWarningShown = true;
            } else if (pct < 0.8) {
                this._storageWarningShown = false;
            }
        }

        // Delegate combat UI to CombatView
        this.combatView.update(state);

        // Update Active View
        if (this.activeView) {
            this.activeView.update(state);
        }
    }

    // Compatibility method for current main.js
    onInitialize(callback) {
        this.initCallback = callback;
    }

    /**
     * Displays the introductory narrative modal.
     */
    showIntroDialog() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);

        const slides = [
            {
                image: 'assets/story/prologue_1.png',
                titleKey: 'prologue_title_1',
                loreKey: 'prologue_lore_1'
            },
            {
                image: 'assets/story/prologue_2.png',
                titleKey: 'prologue_title_2',
                loreKey: 'prologue_lore_2'
            },
            {
                image: 'assets/story/prologue_3.png',
                titleKey: 'prologue_title_3',
                loreKey: 'prologue_lore_3'
            }
        ];

        let currentSlide = 0;

        const renderSlide = () => {
            const slide = slides[currentSlide];
            overlay.innerHTML = `
                <div class="intro-modal story-slideshow">
                    <div class="prologue-illustration-container">
                        <img class="prologue-illustration-img" src="${slide.image}" alt="Prologue Illustration">
                    </div>
                    <div class="prologue-text-container">
                        <h2 data-i18n="${slide.titleKey}">${this.t(slide.titleKey)}</h2>
                        <p data-i18n="${slide.loreKey}">${this.t(slide.loreKey)}</p>
                    </div>
                    <div class="prologue-controls">
                        <button class="btn btn-secondary btn-sm" id="btn-prologue-back" ${currentSlide === 0 ? 'style="visibility: hidden;"' : ''}>
                            <span data-i18n="prologue_btn_back">${this.t('prologue_btn_back')}</span>
                        </button>
                        <div class="prologue-dots">
                            ${slides.map((_, i) => `<span class="prologue-dot ${i === currentSlide ? 'active' : ''}"></span>`).join('')}
                        </div>
                        <button class="btn btn-primary btn-sm" id="btn-prologue-next">
                            <span data-i18n="${currentSlide === slides.length - 1 ? 'intro_btn' : 'prologue_btn_next'}">
                                ${currentSlide === slides.length - 1 ? this.t('intro_btn') : this.t('prologue_btn_next')}
                            </span>
                        </button>
                    </div>
                </div>
            `;

            // Bind events
            const backBtn = overlay.querySelector('#btn-prologue-back');
            if (backBtn && currentSlide > 0) {
                backBtn.addEventListener('click', () => {
                    currentSlide--;
                    renderSlide();
                });
            }

            const nextBtn = overlay.querySelector('#btn-prologue-next');
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    if (currentSlide < slides.length - 1) {
                        currentSlide++;
                        renderSlide();
                    } else {
                        // End of prologue
                        overlay.style.opacity = '0';
                        overlay.style.transition = 'opacity 0.5s ease';
                        setTimeout(() => {
                            overlay.remove();
                        }, 500);
                    }
                });
            }
        };

        renderSlide();
    }

    /**
     * Displays a generic confirmation dialog.
     */
    showConfirmDialog({ title, message, onConfirm }) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        overlay.innerHTML = `
            <div class="modal-body">
                <div class="modal-header">
                    <h3 data-i18n="${title}">${this.t(title)}</h3>
                </div>
                <div class="modal-text">
                    <p data-i18n="${message}">${this.t(message)}</p>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" id="modal-btn-cancel">
                        <span data-i18n="ui_btn_cancel">${this.t('ui_btn_cancel')}</span>
                    </button>
                    <button class="btn btn-danger" id="modal-btn-confirm">
                        <span data-i18n="ui_btn_confirm">${this.t('ui_btn_confirm')}</span>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const close = () => {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease';
            setTimeout(() => overlay.remove(), 300);
        };

        overlay.querySelector('#modal-btn-cancel').addEventListener('click', close);
        overlay.querySelector('#modal-btn-confirm').addEventListener('click', () => {
            close();
            if (onConfirm) onConfirm();
        });
    }

    /**
     * Displays a transient in-game toast notification.
     * @param {string} message  Translated message text to show.
     * @param {'error'|'success'|'info'} type  Visual style. Defaults to 'error'.
     * @param {number} duration  Auto-dismiss delay in ms. Defaults to 3500.
     */
    showToast(message, type = 'error', duration = 3500) {
        // Ensure container exists
        let container = document.getElementById('game-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'game-toast-container';
            container.className = 'game-toast-container';
            document.body.appendChild(container);
        }

        const icons = { error: '⚠️', success: '✅', info: 'ℹ️' };
        const toast = document.createElement('div');
        toast.className = `game-toast toast-${type}`;
        toast.innerHTML = `<span class="toast-icon">${icons[type] || '⚠️'}</span><span>${message}</span>`;
        container.appendChild(toast);

        // Auto-dismiss
        setTimeout(() => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }

    /**
     * Plays the battle log in a full-screen overlay dynamically imitating a turn-based combat log.
     */
    // --- Combat UI Proxies (implementation in CombatView.js) ---
    get isCombatOverlayOpen() { return this.combatView.isCombatOverlayOpen; }
    set isCombatOverlayOpen(v) { this.combatView.isCombatOverlayOpen = v; }

    get renderCombatOverlay() { return this.combatView.renderCombatOverlay; }
    set renderCombatOverlay(v) { this.combatView.renderCombatOverlay = v; }

    playBattleLog(combatLog, onComplete) {
        return this.combatView.playBattleLog(combatLog, onComplete);
    }

    openCombatOverlay(battleContext, onComplete) {
        return this.combatView.openCombatOverlay(battleContext, onComplete);
    }

    // NOTE: Original playBattleLog (~145 lines) and openCombatOverlay (~597 lines)
    // have been extracted to src/rpg-village/js/presentation/ui/combat/CombatView.js



    forceUpdate() {
        if (this.adapter) {
            this.adapter.forceUpdate();
        }
    }
}
