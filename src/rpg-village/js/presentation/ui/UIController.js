/**
 * UIManager - Central UI Coordinator.
 * Manages the shell, view transitions, and domain-specific view registration.
 */
export class UIController {
    constructor(i18n) {
        this.i18n = i18n;
        this.elements = {
            mainContent: document.getElementById('main-content'),
            loader: document.getElementById('main-loader'),
            goldCount: document.getElementById('gold-count'),
            villagerCount: document.getElementById('villager-count'),
            woodCount: document.getElementById('wood-count'),
            navItems: document.querySelectorAll('.nav-item')
        };
        
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
        this.views.set(domain, viewController);
    }

    setupEventListeners() {
        this.elements.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const domain = item.getAttribute('data-view');
                this.switchView(domain);
            });
        });
    }

    /**
     * Transitions to a new domain view.
     */
    async switchView(domain) {
        if (this.activeDomain === domain) return;
        
        console.log(`Switching to domain: ${domain}`);
        
        // Update Nav UI
        this.elements.navItems.forEach(item => {
            if (item.getAttribute('data-view') === domain) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Show Loader (briefly for effect, though now it's instant)
        this.elements.loader.style.display = 'flex';

        try {
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
                // The first child of the fragment is usually our domain-view section
                this.activeView.mount(this.elements.mainContent.querySelector('.domain-view'));
            }

        } catch (error) {
            console.error(error);
            this.elements.mainContent.innerHTML = `<div class="error-state">Error loading view: ${domain}</div>`;
        } finally {
            // Short delay to allow animation/transition to feel right
            setTimeout(() => {
                this.elements.loader.style.display = 'none';
            }, 50);
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
            element.textContent = this.i18n.t(key);
        }
    }

    /**
     * Changes the current language and re-translates the entire UI.
     */
    setLanguage(lang) {
        if (this.i18n.setLanguage(lang)) {
            this.translateView(document.body);
            return true;
        }
        return false;
    }

    /**
     * Updates the global shell stats and the active view.
     */
    update(state) {
        // Update Shell
        if (state.village) {
            if (this.elements.goldCount) this.elements.goldCount.textContent = Math.floor(state.village.gold || 0);
            if (this.elements.villagerCount) {
                this.elements.villagerCount.textContent = state.village.population?.total || 0;
            }
            if (this.elements.woodCount && state.inventory) {
                this.elements.woodCount.textContent = state.inventory.materials?.material_wood || 0;
            }
        }

        // Update Active View
        if (this.activeView) {
            this.activeView.update(state);
        }
    }

    // Compatibility method for current main.js
    onInitialize(callback) {
        // The "Start" button might be moved to the Village view
        // For now, we'll trigger it when the first village view is mounted if needed
        this.initCallback = callback;
    }
}
