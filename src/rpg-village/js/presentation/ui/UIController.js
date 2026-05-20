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
            globalDay: document.getElementById('global-day'),
            navItems: document.querySelectorAll('.nav-item'),
            shopNav: document.querySelector('.nav-item[data-view="shop"]'),
            forgeNav: document.querySelector('.nav-item[data-view="forge"]')
        };
        
        this.isShopUnlocked = false;
        this.isForgeUnlocked = false;
        this.lastState = null;
        this.isCombatOverlayOpen = false;
        
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
            if (this.elements.globalDay) this.elements.globalDay.textContent = state.village.day || 1;
            if (this.elements.goldCount) this.elements.goldCount.textContent = Math.floor(state.village.gold || 0);
            if (this.elements.villagerCount) {
                this.elements.villagerCount.textContent = state.village.population?.total || 0;
            }
            if (this.elements.woodCount && state.inventory) {
                this.elements.woodCount.textContent = state.inventory.materials?.material_wood || 0;
            }
        }

        // Check for active battle
        if (state.activeBattle && !this.isCombatOverlayOpen) {
            this.openCombatOverlay(state.activeBattle);
        }

        // Update Combat overlay if open
        if (this.isCombatOverlayOpen && this.renderCombatOverlay) {
            this.renderCombatOverlay();
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

    /**
     * Opens the interactive turn-based combat overlay.
     */
    openCombatOverlay(battleContext, onComplete) {
        if (this.isCombatOverlayOpen) return;
        this.isCombatOverlayOpen = true;
        this.lastLogLength = 0;

        // Create overlay container
        const overlay = document.createElement('div');
        overlay.className = 'combat-overlay';
        document.body.appendChild(overlay);

        const render = () => {
            const state = this.lastState;
            if (!state || !state.activeBattle) {
                overlay.remove();
                this.isCombatOverlayOpen = false;
                if (onComplete) onComplete();
                return;
            }
            
            const battle = state.activeBattle;
            const activeExp = state.activeExpedition;
            const currentStageNum = activeExp ? activeExp.currentStage + 1 : 1;
            const stageText = `${this.t('exp_stage')} ${currentStageNum}`;

            const currentHash = JSON.stringify(battle) + (overlay.menuState || 'main') + (overlay.selectedAction ? overlay.selectedAction.id : '');
            if (overlay.lastRenderHash === currentHash) {
                return;
            }
            overlay.lastRenderHash = currentHash;

            // Check and trigger floating numbers for new events
            animateLastEvents();

            // Construct Header
            let headerHtml = `
                <div class="combat-header">
                    <div>
                        <h2>${activeExp ? (this.t(activeExp.id) !== activeExp.id ? this.t(activeExp.id) : activeExp.name) : 'Combat'}</h2>
                        <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 4px;">
                            ${stageText}
                        </div>
                    </div>
                    <div class="combat-header-controls">
                        <button class="btn btn-sm ${battle.autoBattle ? 'btn-primary' : 'btn-secondary'}" id="btn-toggle-auto">
                            ${this.t('btn_auto_combat')} ${battle.autoBattle ? '(ON)' : '(OFF)'}
                        </button>
                        <button class="btn btn-secondary btn-sm" id="btn-skip-combat">
                            ${this.t('btn_skip_combat')}
                        </button>
                    </div>
                </div>
            `;

            // Left Column: Heroes
            let heroesHtml = `<div class="combat-column">
                <div class="combat-column-title">Heroes</div>`;
            battle.heroes.forEach((hero, index) => {
                const isCurrentTurn = battle.turnOrder[battle.currentTurnIndex]?.id === hero.id;
                const hpPercent = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
                const mpPercent = Math.max(0, Math.min(100, (hero.mp / hero.maxMp) * 100));
                const isDead = hero.hp <= 0;
                
                const statusBadges = (hero.statuses || []).map(st => {
                    const icon = st.type === 'poison' ? '🤢' : st.type === 'burn' ? '🔥' : st.type === 'regen' ? '💚' : '⭐';
                    return `<span class="combat-status-badge" title="${st.type} (${st.duration} turns)">${icon}</span>`;
                }).join('');

                let avatarHtml = '⚔️';
                if (isDead) {
                    avatarHtml = '💀';
                } else {
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
                    avatarHtml = `<img src="${avatarSrc}" alt="${hero.name}" class="combat-avatar-img" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                }

                heroesHtml += `
                    <div class="combat-card hero-card ${isCurrentTurn ? 'active' : ''} ${isDead ? 'dead' : ''}" data-hero-id="${hero.id}" data-hero-index="${index}">
                        <div class="combat-card-avatar">${avatarHtml}</div>
                        <div class="combat-card-info">
                            <div class="combat-card-header">
                                <span class="combat-card-name">${hero.name}</span>
                                <span class="combat-card-level">Lv.${hero.level}</span>
                            </div>
                            <div class="combat-bar-container">
                                <div class="combat-bar combat-bar-hp" style="width: ${hpPercent}%"></div>
                            </div>
                            <div class="combat-bar-text">
                                <span>HP</span>
                                <span>${hero.hp}/${hero.maxHp}</span>
                            </div>
                            <div class="combat-bar-container" style="height: 4px;">
                                <div class="combat-bar combat-bar-mp" style="width: ${mpPercent}%"></div>
                            </div>
                            <div class="combat-bar-text" style="font-size: 0.7rem;">
                                <span>MP</span>
                                <span>${hero.mp}/${hero.maxMp}</span>
                            </div>
                            <div class="combat-card-statuses">${statusBadges}</div>
                        </div>
                        <div class="combat-effects-container" id="effects-hero-${hero.id}"></div>
                    </div>
                `;
            });
            heroesHtml += `</div>`;

            // Right Column: Enemies
            let enemiesHtml = `<div class="combat-column">
                <div class="combat-column-title">Enemies</div>`;
            battle.enemies.forEach((enemy, index) => {
                const isCurrentTurn = battle.turnOrder[battle.currentTurnIndex]?.id === enemy.id;
                const hpPercent = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100));
                const isDead = enemy.hp <= 0;
                
                const statusBadges = (enemy.statuses || []).map(st => {
                    const icon = st.type === 'poison' ? '🤢' : st.type === 'burn' ? '🔥' : st.type === 'regen' ? '💚' : '⭐';
                    return `<span class="combat-status-badge" title="${st.type} (${st.duration} turns)">${icon}</span>`;
                }).join('');

                const enemyName = this.t(enemy.name) || enemy.name;

                enemiesHtml += `
                    <div class="combat-card enemy-card ${isCurrentTurn ? 'active' : ''} ${isDead ? 'dead' : ''}" data-enemy-index="${index}">
                        <div class="combat-card-avatar">${enemy.hp <= 0 ? '💀' : '👾'}</div>
                        <div class="combat-card-info">
                            <div class="combat-card-header">
                                <span class="combat-card-name">${enemyName}</span>
                                <span class="combat-card-level">Lv.${enemy.level || 1}</span>
                            </div>
                            <div class="combat-bar-container">
                                <div class="combat-bar combat-bar-hp" style="width: ${hpPercent}%"></div>
                            </div>
                            <div class="combat-bar-text">
                                <span>HP</span>
                                <span>${enemy.hp}/${enemy.maxHp}</span>
                            </div>
                            <div class="combat-card-statuses">${statusBadges}</div>
                        </div>
                        <div class="combat-effects-container" id="effects-enemy-${index}"></div>
                    </div>
                `;
            });
            enemiesHtml += `</div>`;

            // Middle Column: Log Console & Action Bar
            const formatEventLog = (ev) => {
                let text = "";
                let color = "#aaa";

                if (ev.type === 'DAMAGE') {
                    const attackerName = ev.actorName;
                    const targetName = ev.targetName;
                    const isMiss = ev.isMiss ? this.t('log_miss').replace('{attacker}', attackerName).replace('{target}', targetName) : null;
                    const hitText = this.t('log_attack').replace('{attacker}', attackerName).replace('{target}', targetName).replace('{damage}', ev.amount);
                    text = isMiss || hitText;
                    if (ev.isCrit) text = `🔥 ${this.t('crit')} ${text}`;
                    color = ev.actorIsHero ? "#4caf50" : "#f44336";
                } else if (ev.type === 'HEAL') {
                    const attackerName = ev.actorName;
                    const targetName = ev.targetName;
                    text = this.t('log_heal').replace('{attacker}', attackerName).replace('{target}', targetName).replace('{amount}', ev.amount);
                    color = "#03a9f4";
                } else if (ev.type === 'STATUS_TICK') {
                    const targetName = ev.targetName;
                    if (ev.effectType === 'poison') {
                        text = this.t('log_poison').replace('{target}', targetName).replace('{damage}', ev.damage);
                        color = "#9c27b0";
                    } else if (ev.effectType === 'burn') {
                        text = this.t('log_burn').replace('{target}', targetName).replace('{damage}', ev.damage);
                        color = "#ff9800";
                    }
                } else if (ev.type === 'TRAIT_REGEN') {
                    const targetName = ev.targetName;
                    text = this.t('log_regen').replace('{target}', targetName).replace('{amount}', ev.amount);
                    color = "#8bc34a";
                } else if (ev.type === 'USE_CONSUMABLE') {
                    const attackerName = ev.actorName;
                    const itemName = this.t(ev.consumableId) || ev.consumableId;
                    const targetName = ev.targetName;
                    const statName = ev.healType === 'HEAL_HP' ? 'HP' : 'MP';
                    text = (this.t('log_use_consumable') || '{attacker} used {item} on {target}, restoring {amount} {stat}.')
                        .replace('{attacker}', attackerName)
                        .replace('{item}', itemName)
                        .replace('{target}', targetName)
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

                return `<div style="color: ${color}; margin-bottom: 4px; line-height: 1.4;">${text}${hpSuffix}</div>`;
            };

            const logLines = battle.log.slice(-12).map(formatEventLog).join('');
            const activeActor = battle.turnOrder[battle.currentTurnIndex];
            const activeActorName = activeActor ? (this.t(activeActor.name) || activeActor.name) : 'Unknown';
            const currentTurnText = activeActor ? `${activeActorName}'s Turn` : 'Thinking...';

            let middleHtml = `
                <div class="combat-log-column">
                    <div class="combat-column-title">Battle Log</div>
                    <div class="combat-log-console" id="combat-log-console">
                        ${logLines}
                    </div>
                    <div class="combat-current-turn-banner">
                        ${currentTurnText}
                    </div>
                    <div class="combat-control-panel" id="combat-control-panel">
                        <!-- Action UI goes here -->
                    </div>
                </div>
            `;

            overlay.innerHTML = headerHtml + `
                <div class="combat-grid">
                    ${heroesHtml}
                    ${middleHtml}
                    ${enemiesHtml}
                </div>
            `;

            overlay.querySelector('#btn-toggle-auto').addEventListener('click', () => {
                this.engine.battleService.autoBattle = !this.engine.battleService.autoBattle;
                this.adapter.forceUpdate();
            });

            overlay.querySelector('#btn-skip-combat').addEventListener('click', () => {
                this.engine.skipBattle();
                this.adapter.forceUpdate();
            });

            const consoleEl = overlay.querySelector('#combat-log-console');
            if (consoleEl) {
                consoleEl.scrollTop = consoleEl.scrollHeight;
            }

            const controlPanel = overlay.querySelector('#combat-control-panel');
            
            if (battle.isOver) {
                const preview = this.engine.getBattleResolutionPreview();
                const resultColor = (preview && preview.isVictory) ? 'var(--success)' : 'var(--danger)';
                const resultText = (preview && preview.isVictory) ? this.t('victory') : this.t('defeat');
                
                let summaryHtml = '';
                if (preview && preview.summary) {
                    summaryHtml = preview.summary.map(s => {
                        let text = `<strong>${s.heroName}</strong>: `;
                        if (s.hpLost > 0) text += `<span style="color: var(--danger); font-size: 0.9em;">-${s.hpLost} HP</span> | `;
                        else if (s.hpLost < 0) text += `<span style="color: var(--success); font-size: 0.9em;">+${-s.hpLost} HP</span> | `;
                        text += `<span style="color: #03a9f4; font-size: 0.9em;">+${s.expEarned} EXP</span>`;
                        if (s.leveledUp) text += ` <span style="color: #ffeb3b; font-weight: bold; font-size: 0.9em;">(LEVEL UP! 🎉)</span>`;
                        return `<div style="margin-bottom: 5px;">${text}</div>`;
                    }).join('');
                }

                let rewardsHtml = '';
                if (preview && preview.isLastStage && preview.rewards) {
                    const rewards = [];
                    if (preview.rewards.gold) {
                        rewards.push(`💰 ${preview.rewards.gold} Gold`);
                    }
                    if (preview.rewards.items) {
                        for (const [itemId, qty] of Object.entries(preview.rewards.items)) {
                            const itemName = this.t(itemId) || itemId;
                            rewards.push(`📦 ${qty}x ${itemName}`);
                        }
                    }
                    if (rewards.length > 0) {
                        rewardsHtml = `
                            <div style="margin-top: 15px; border-top: 1px solid var(--glass-border); padding-top: 10px;">
                                <h4 style="color: #ffeb3b; margin-top: 0; margin-bottom: 5px;">🏆 Expedition Rewards:</h4>
                                <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; font-size: 0.95rem;">
                                    ${rewards.map(r => `<span class="badge badge-accent" style="background: rgba(255, 235, 59, 0.1); border: 1px solid rgba(255, 235, 59, 0.3); padding: 4px 8px; border-radius: 4px;">${r}</span>`).join('')}
                                </div>
                            </div>
                        `;
                    }
                }

                controlPanel.innerHTML = `
                    <div style="text-align: center; margin-bottom: 15px; width: 100%;">
                        <h3 style="color: ${resultColor}; font-size: 1.6rem; margin-top: 0; margin-bottom: 10px;">${resultText}</h3>
                        <div class="combat-summary-container" style="background: rgba(0, 0, 0, 0.3); border: 1px solid var(--glass-border); padding: 10px; border-radius: 6px; text-align: left; max-height: 150px; overflow-y: auto; display: inline-block; width: 100%; box-sizing: border-box;">
                            ${summaryHtml}
                            ${rewardsHtml}
                        </div>
                    </div>
                    <button class="btn btn-primary" id="btn-resolve-battle" style="width: 100%;">
                        ${this.t('ui_btn_close')}
                    </button>
                `;
                controlPanel.querySelector('#btn-resolve-battle').addEventListener('click', () => {
                    this.engine.resolveBattle();
                    overlay.style.opacity = '0';
                    overlay.style.transition = 'opacity 0.3s ease';
                    setTimeout(() => {
                        overlay.remove();
                        this.isCombatOverlayOpen = false;
                        if (onComplete) onComplete();
                        this.adapter.forceUpdate();
                    }, 300);
                });
                return;
            }

            const isHeroTurn = activeActor && activeActor.type === 'Hero';
            if (!isHeroTurn || battle.autoBattle) {
                controlPanel.innerHTML = `
                    <div class="combat-control-message">
                        ${battle.autoBattle ? 'Running Auto-Combat...' : 'Enemy is planning action...'}
                    </div>
                `;
                return;
            }

            const currentHero = battle.heroes.find(h => h.id === activeActor.id);
            if (!currentHero) return;

            const menuState = overlay.menuState || 'main';
            const selectedAction = overlay.selectedAction || null;

            if (menuState === 'main') {
                controlPanel.innerHTML = `
                    <div class="combat-control-buttons">
                        <button class="btn btn-secondary" id="btn-action-attack" style="flex: 1 1 120px;">
                            ⚔️ ${this.t('basic_attack')}
                        </button>
                        <button class="btn btn-secondary" id="btn-action-skills" style="flex: 1 1 120px;" ${(!currentHero.skills || Object.keys(currentHero.skills).length === 0) ? 'disabled' : ''}>
                            ✨ ${this.t('ui_skills')}
                        </button>
                        <button class="btn btn-secondary" id="btn-action-items" style="flex: 1 1 120px;" ${battle.itemUsedThisTurn ? 'disabled' : ''}>
                            🎒 ${this.t('ui_consumables')} ${battle.itemUsedThisTurn ? '(1/Turn)' : ''}
                        </button>
                    </div>
                `;

                controlPanel.querySelector('#btn-action-attack').addEventListener('click', () => {
                    overlay.menuState = 'targeting';
                    overlay.selectedAction = { type: 'attack', id: 'basic_attack', name: this.t('basic_attack') };
                    render();
                });

                const btnSkills = controlPanel.querySelector('#btn-action-skills');
                if (btnSkills) {
                    btnSkills.addEventListener('click', () => {
                        overlay.menuState = 'skills';
                        render();
                    });
                }

                const btnItems = controlPanel.querySelector('#btn-action-items');
                if (btnItems) {
                    btnItems.addEventListener('click', () => {
                        overlay.menuState = 'items';
                        render();
                    });
                }
            } else if (menuState === 'skills') {
                let skillsButtons = Object.keys(currentHero.skills || {}).map(skillId => {
                    const skillName = this.t(skillId) || skillId;
                    const skillMeta = {
                        'double_attack': { mp: 3 },
                        'triple_attack': { mp: 6 },
                        'whirlwind': { mp: 4 },
                        'small_fire_ball': { mp: 3 },
                        'small_heal': { mp: 3 },
                        'haste': { mp: 4 }
                    }[skillId] || { mp: 0 };

                    const canAfford = currentHero.mp >= skillMeta.mp;
                    return `
                        <button class="btn btn-secondary" data-skill-id="${skillId}" ${!canAfford ? 'disabled' : ''} style="flex: 1 1 140px;">
                            ${skillName} <span style="font-size: 0.8rem; opacity: 0.8;">(${skillMeta.mp} MP)</span>
                        </button>
                    `;
                }).join('');

                controlPanel.innerHTML = `
                    <div class="combat-control-back">
                        <button class="btn btn-secondary btn-sm" id="btn-skill-back">◀ ${this.t('btn_back')}</button>
                    </div>
                    <div class="combat-control-buttons">
                        ${skillsButtons || '<div style="color: var(--text-muted);">No skills available.</div>'}
                    </div>
                `;

                controlPanel.querySelector('#btn-skill-back').addEventListener('click', () => {
                    overlay.menuState = 'main';
                    render();
                });

                controlPanel.querySelectorAll('[data-skill-id]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const skillId = btn.getAttribute('data-skill-id');
                        overlay.menuState = 'targeting';
                        overlay.selectedAction = { type: 'skill', id: skillId, name: this.t(skillId) };
                        render();
                    });
                });
            } else if (menuState === 'items') {
                const inventory = state.inventory || {};
                const consumables = inventory.consumables || {};
                
                let itemsButtons = Object.keys(consumables).filter(itemId => consumables[itemId] > 0).map(itemId => {
                    const itemName = this.t(itemId) || itemId;
                    const count = consumables[itemId];
                    return `
                        <button class="btn btn-secondary" data-item-id="${itemId}" style="flex: 1 1 140px;">
                            ${itemName} x${count}
                        </button>
                    `;
                }).join('');

                controlPanel.innerHTML = `
                    <div class="combat-control-back">
                        <button class="btn btn-secondary btn-sm" id="btn-item-back">◀ ${this.t('btn_back')}</button>
                    </div>
                    <div class="combat-control-buttons">
                        ${itemsButtons || '<div style="color: var(--text-muted);">No consumables in inventory.</div>'}
                    </div>
                `;

                controlPanel.querySelector('#btn-item-back').addEventListener('click', () => {
                    overlay.menuState = 'main';
                    render();
                });

                controlPanel.querySelectorAll('[data-item-id]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const itemId = btn.getAttribute('data-item-id');
                        overlay.menuState = 'targeting';
                        overlay.selectedAction = { type: 'item', id: itemId, name: this.t(itemId) };
                        render();
                    });
                });
            } else if (menuState === 'targeting') {
                controlPanel.innerHTML = `
                    <div class="combat-control-back">
                        <button class="btn btn-secondary btn-sm" id="btn-target-back">◀ ${this.t('btn_back')}</button>
                    </div>
                    <div class="combat-control-message" style="color: var(--success); font-weight: 700;">
                        ${this.t('ui_choose_target')} - ${selectedAction.name}
                    </div>
                `;

                controlPanel.querySelector('#btn-target-back').addEventListener('click', () => {
                    if (selectedAction.type === 'skill') {
                        overlay.menuState = 'skills';
                    } else if (selectedAction.type === 'item') {
                        overlay.menuState = 'items';
                    } else {
                        overlay.menuState = 'main';
                    }
                    render();
                });

                const isFriendlyTarget = selectedAction.id === 'small_heal' || (selectedAction.type === 'item' && selectedAction.id.includes('potion'));
                
                if (isFriendlyTarget) {
                    overlay.querySelectorAll('.hero-card').forEach(card => {
                        const idx = parseInt(card.getAttribute('data-hero-index'));
                        const targetHero = battle.heroes[idx];
                        if (targetHero && targetHero.hp > 0) {
                            card.classList.add('targetable');
                            card.addEventListener('click', () => executeTargetAction(idx, targetHero.id));
                        }
                    });
                } else {
                    overlay.querySelectorAll('.enemy-card').forEach(card => {
                        const idx = parseInt(card.getAttribute('data-enemy-index'));
                        const targetEnemy = battle.enemies[idx];
                        if (targetEnemy && targetEnemy.hp > 0) {
                            card.classList.add('targetable');
                            card.addEventListener('click', () => executeTargetAction(idx, targetEnemy.id));
                        }
                    });
                }
            }
        };

        const executeTargetAction = (targetIndex, targetId) => {
            const overlay = document.querySelector('.combat-overlay');
            if (!overlay) return;

            const selectedAction = overlay.selectedAction;
            let result;

            if (selectedAction.type === 'attack') {
                result = this.engine.executeBattleAction('basic_attack', targetIndex);
            } else if (selectedAction.type === 'skill') {
                result = this.engine.executeBattleAction(selectedAction.id, targetIndex);
            } else if (selectedAction.type === 'item') {
                result = this.engine.useBattleConsumable(selectedAction.id, targetId);
            }

            if (result && !result.success) {
                alert(this.t(result.error));
                return;
            }

            overlay.menuState = 'main';
            overlay.selectedAction = null;

            this.adapter.forceUpdate();
        };

        const animateLastEvents = () => {
            const state = this.lastState;
            if (!state || !state.activeBattle) return;

            if (this.lastLogLength !== undefined && state.activeBattle.log.length > this.lastLogLength) {
                const newEvents = state.activeBattle.log.slice(this.lastLogLength);
                newEvents.forEach(ev => {
                    const targetName = ev.targetName;
                    if (!targetName) return;
                    
                    if (ev.type === 'DAMAGE') {
                        const text = ev.isMiss ? this.t('miss') : `-${ev.amount}`;
                        const type = ev.isMiss ? 'miss' : 'damage';
                        triggerVisualEffect(targetName, text, type);
                    } else if (ev.type === 'HEAL') {
                        triggerVisualEffect(targetName, `+${ev.amount}`, 'heal');
                    } else if (ev.type === 'STATUS_TICK') {
                        triggerVisualEffect(targetName, `-${ev.damage}`, 'damage');
                    } else if (ev.type === 'TRAIT_REGEN') {
                        triggerVisualEffect(targetName, `+${ev.amount}`, 'heal');
                    } else if (ev.type === 'USE_CONSUMABLE') {
                        const label = ev.healType === 'HEAL_HP' ? 'HP' : 'MP';
                        triggerVisualEffect(targetName, `+${ev.amount} ${label}`, 'heal');
                    }
                });
            }
            this.lastLogLength = state.activeBattle.log.length;
        };

        const triggerVisualEffect = (targetName, text, type) => {
            const overlay = document.querySelector('.combat-overlay');
            if (!overlay) return;

            const cards = overlay.querySelectorAll('.combat-card');
            let card = null;
            cards.forEach(c => {
                const nameEl = c.querySelector('.combat-card-name');
                if (nameEl && nameEl.textContent.trim() === targetName) {
                    card = c;
                }
            });

            if (card) {
                if (type === 'damage') {
                    card.classList.add('hit-shake');
                    setTimeout(() => card.classList.remove('hit-shake'), 400);
                }

                const effectContainer = card.querySelector('.combat-effects-container');
                if (effectContainer) {
                    const numEl = document.createElement('div');
                    numEl.className = 'floating-num';
                    numEl.textContent = text;
                    
                    let color = '#ff3b30';
                    if (type === 'heal') color = '#34c759';
                    if (type === 'miss') color = '#ffcc00';

                    numEl.style.color = color;
                    numEl.style.left = '50%';
                    numEl.style.top = '20%';
                    
                    effectContainer.appendChild(numEl);
                    setTimeout(() => numEl.remove(), 1000);
                }
            }
        };

        this.renderCombatOverlay = render;
        render();
    }

    forceUpdate() {
        if (this.adapter) {
            this.adapter.forceUpdate();
        }
    }
}
