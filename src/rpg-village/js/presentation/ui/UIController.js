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
            navItems: document.querySelectorAll('.nav-item'),
            shopNav: document.querySelector('.nav-item[data-view="shop"]'),
            forgeNav: document.querySelector('.nav-item[data-view="forge"]')
        };
        
        this.isShopUnlocked = false;
        this.isForgeUnlocked = false;
        this.lastState = null;
        
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
                const domain = item.getAttribute('data-view');
                if (domain === 'shop' && !this.isShopUnlocked) return;
                if (domain === 'forge' && !this.isForgeUnlocked) return;
                this.switchView(domain);
            });
        });
    }

    /**
     * Transitions to a new domain view.
     */
    async switchView(domain) {
        if (domain === 'shop' && !this.isShopUnlocked) return;
        if (domain === 'forge' && !this.isForgeUnlocked) return;
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
                this.activeView.mount(this.elements.mainContent.querySelector('.domain-view'), this);
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
        this.isShopUnlocked = completed.includes('exp_tutorial_cave');
        
        const blacksmithLvl = state.village?.infrastructure?.blacksmith || 0;
        this.isForgeUnlocked = blacksmithLvl >= 1;

        // Update Shop Tab
        if (this.elements.shopNav) {
            const iconEl = this.elements.shopNav.querySelector('.nav-icon');
            const labelEl = this.elements.shopNav.querySelector('.nav-label');
            if (this.isShopUnlocked) {
                this.elements.shopNav.classList.remove('nav-locked');
                if (iconEl) iconEl.textContent = '🛒';
                if (labelEl) {
                    labelEl.textContent = this.t('nav_shop');
                    labelEl.setAttribute('data-i18n', 'nav_shop');
                }
            } else {
                this.elements.shopNav.classList.add('nav-locked');
                if (iconEl) iconEl.textContent = '🔒';
                if (labelEl) {
                    labelEl.textContent = '???';
                    labelEl.removeAttribute('data-i18n');
                }
            }
        }

        // Update Forge Tab
        if (this.elements.forgeNav) {
            const iconEl = this.elements.forgeNav.querySelector('.nav-icon');
            const labelEl = this.elements.forgeNav.querySelector('.nav-label');
            if (this.isForgeUnlocked) {
                this.elements.forgeNav.classList.remove('nav-locked');
                if (iconEl) iconEl.textContent = '🔥';
                if (labelEl) {
                    labelEl.textContent = this.t('nav_forge');
                    labelEl.setAttribute('data-i18n', 'nav_forge');
                }
            } else {
                this.elements.forgeNav.classList.add('nav-locked');
                if (iconEl) iconEl.textContent = '🔒';
                if (labelEl) {
                    labelEl.textContent = '???';
                    labelEl.removeAttribute('data-i18n');
                }
            }
        }
    }

    /**
     * Updates the global shell stats and the active view.
     */
    update(state) {
        this.lastState = state;
        this.updateNavLocks(state);

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
        this.initCallback = callback;
    }

    /**
     * Displays the introductory narrative modal.
     */
    showIntroDialog() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        overlay.innerHTML = `
            <div class="intro-modal">
                <h2 data-i18n="intro_title">${this.t('intro_title')}</h2>
                <p data-i18n="intro_lore">${this.t('intro_lore')}</p>
                <button class="btn btn-primary btn-lg" id="btn-start-journey">
                    <span data-i18n="intro_btn">${this.t('intro_btn')}</span>
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const btn = overlay.querySelector('#btn-start-journey');
        btn.addEventListener('click', () => {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                overlay.remove();
            }, 500);
        });
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
     * Plays the battle log in a full-screen overlay dynamically imitating a turn-based combat log.
     */
    playBattleLog(combatLog, onComplete) {
        const overlay = document.createElement('div');
        overlay.className = 'battle-overlay';
        
        // Setup overlay style dynamically to avoid breaking existing styles if we don't have CSS yet
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(10, 10, 15, 0.95)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.padding = '20px';
        overlay.style.overflowY = 'hidden';
        overlay.style.fontFamily = '"Fira Code", monospace';

        const headerHtml = `
            <div style="display: flex; justify-content: space-between; width: 100%; max-width: 800px; border-bottom: 2px solid var(--glass-border); padding-bottom: 10px; margin-bottom: 20px;">
                <div style="color: var(--primary-color);">
                    <h3 style="margin: 0;">Heroes</h3>
                    <p style="margin: 5px 0 0 0; font-size: 0.9rem;">${combatLog.heroes.join(', ')}</p>
                </div>
                <div style="text-align: right; color: var(--danger-color);">
                    <h3 style="margin: 0;">Enemies</h3>
                    <p style="margin: 5px 0 0 0; font-size: 0.9rem;">${combatLog.enemies.join(', ')}</p>
                </div>
            </div>
        `;

        const logContainerHtml = `
            <div id="battle-log-container" style="flex: 1; width: 100%; max-width: 800px; overflow-y: auto; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); border-radius: 8px; padding: 15px; margin-bottom: 20px; box-shadow: inset 0 0 10px rgba(0,0,0,0.8);">
            </div>
        `;

        const footerHtml = `
            <div id="battle-log-footer" style="width: 100%; max-width: 800px; text-align: center; min-height: 50px;">
                <!-- Summary and Close button will appear here -->
            </div>
        `;

        overlay.innerHTML = headerHtml + logContainerHtml + footerHtml;
        document.body.appendChild(overlay);

        const logContainer = overlay.querySelector('#battle-log-container');
        const footer = overlay.querySelector('#battle-log-footer');
        
        let eventIndex = 0;
        const events = combatLog.events;

        const formatEventLog = (ev) => {
            let text = "";
            let color = "#aaa";

            if (ev.type === 'DAMAGE') {
                const isMiss = ev.isMiss ? this.t('log_miss').replace('{attacker}', ev.actorName).replace('{target}', ev.targetName) : null;
                const hitText = this.t('log_attack').replace('{attacker}', ev.actorName).replace('{target}', ev.targetName).replace('{damage}', ev.amount);
                text = isMiss || hitText;
                if (ev.isCrit) text = `🔥 CRITICAL! ${text}`;
                color = ev.actorIsHero ? "#4caf50" : "#f44336";
            } else if (ev.type === 'HEAL') {
                text = this.t('log_heal').replace('{attacker}', ev.actorName).replace('{target}', ev.targetName).replace('{amount}', ev.amount);
                color = "#03a9f4";
            } else if (ev.type === 'STATUS_TICK') {
                if (ev.effectType === 'poison') {
                    text = this.t('log_poison').replace('{target}', ev.targetName).replace('{damage}', ev.damage);
                    color = "#9c27b0";
                } else if (ev.effectType === 'burn') {
                    text = this.t('log_burn').replace('{target}', ev.targetName).replace('{damage}', ev.damage);
                    color = "#ff9800";
                }
            } else if (ev.type === 'TRAIT_REGEN') {
                text = this.t('log_regen').replace('{target}', ev.targetName).replace('{amount}', ev.amount);
                color = "#8bc34a";
            } else if (ev.type === 'USE_CONSUMABLE') {
                const itemName = this.t(ev.consumableId) || ev.consumableId;
                const statName = ev.healType === 'HEAL_HP' ? 'HP' : 'MP';
                text = (this.t('log_use_consumable') || '{attacker} used {item} on {target}, restoring {amount} {stat}.')
                    .replace('{attacker}', ev.actorName)
                    .replace('{item}', itemName)
                    .replace('{target}', ev.targetName)
                    .replace('{amount}', ev.amount)
                    .replace('{stat}', statName);
                color = "#00bcd4";
            }

            let hpSuffix = "";
            if (ev.targetHp !== undefined && ev.targetMaxHp !== undefined) {
                if (ev.targetHp <= 0) {
                    hpSuffix = ` <span style="color: #ff3b30; font-size: 0.85em; font-weight: bold;">(DEAD 💀)</span>`;
                } else {
                    hpSuffix = ` <span style="color: #8e8e93; font-size: 0.85em;">(HP: ${ev.targetHp}/${ev.targetMaxHp})</span>`;
                }
            }

            return `<p style="margin: 5px 0; color: ${color}; opacity: 0; animation: fadeIn 0.3s forwards;">${text}${hpSuffix}</p>`;
        };

        const timer = setInterval(() => {
            if (eventIndex < events.length) {
                const ev = events[eventIndex];
                const logHtml = formatEventLog(ev);
                if (logHtml.includes('<p')) { // Check if valid format
                    logContainer.insertAdjacentHTML('beforeend', logHtml);
                    logContainer.scrollTop = logContainer.scrollHeight;
                }
                eventIndex++;
            } else {
                clearInterval(timer);
                
                // Show Summary
                const summaryHtml = combatLog.summary.map(s => {
                    let text = `<strong>${s.heroName}</strong>: `;
                    if (s.hpLost > 0) text += `<span style="color: #f44336;">-${s.hpLost} HP</span> | `;
                    else if (s.hpLost < 0) text += `<span style="color: #4caf50;">+${-s.hpLost} HP</span> | `;
                    text += `<span style="color: #03a9f4;">+${s.expEarned} EXP</span>`;
                    if (s.leveledUp) text += ` <span style="color: #ffeb3b; font-weight: bold;">(LEVEL UP!)</span>`;
                    return `<div>${text}</div>`;
                }).join('');

                const resultText = combatLog.isVictory ? this.t('log_battle_won') : this.t('log_battle_lost');
                const resultColor = combatLog.isVictory ? "#4caf50" : "#f44336";

                footer.innerHTML = `
                    <div style="margin-bottom: 15px; font-size: 1.1rem;">
                        <div style="color: ${resultColor}; font-weight: bold; margin-bottom: 10px;">${resultText}</div>
                        ${summaryHtml}
                    </div>
                    <button class="btn btn-primary" id="btn-close-battle">
                        ${this.t('ui_btn_close')}
                    </button>
                `;

                footer.querySelector('#btn-close-battle').addEventListener('click', () => {
                    overlay.style.opacity = '0';
                    overlay.style.transition = 'opacity 0.3s ease';
                    setTimeout(() => {
                        overlay.remove();
                        if (onComplete) onComplete();
                    }, 300);
                });
            }
        }, 500);
    }
}
