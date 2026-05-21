import { SKILLS_DATA } from '../../../engine/shared/data/GameConstants.js';

export class CombatView {
  constructor({ i18n }) {
    this.i18n = i18n;
    this.engine = null;
    this.adapter = null;
    this.lastState = null;
    this.isCombatOverlayOpen = false;
    this.lastLogLength = 0;
    this.renderCombatOverlay = null;
    this.overlay = null;
    this.onCombatComplete = null;
  }

  t(key, opts) {
    return this.i18n.t(key, opts);
  }

  update(state) {
    this.lastState = state;
    if (state.activeBattle && !this.isCombatOverlayOpen) {
      this.openCombatOverlay(state.activeBattle);
    }
    if (this.isCombatOverlayOpen && this.renderCombatOverlay) {
      this.renderCombatOverlay();
    }
  }

  playBattleLog(combatLog, onComplete) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:2000;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:sans-serif;';
    const content = document.createElement('div');
    content.style.cssText = 'max-width:600px;width:90%;text-align:center;';
    const title = document.createElement('h2');
    title.textContent = this.t('combat.battle_log');
    title.style.marginBottom = '16px';
    content.appendChild(title);
    const logContainer = document.createElement('div');
    logContainer.style.cssText = 'min-height:120px;margin-bottom:16px;text-align:left;';
    content.appendChild(logContainer);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    let index = 0;
    const interval = setInterval(() => {
      if (index >= combatLog.length) {
        clearInterval(interval);
        const summary = document.createElement('div');
        summary.style.cssText = 'margin-top:12px;font-weight:bold;color:#ffd700;';
        summary.textContent = this.t('combat.battle_finished');
        content.appendChild(summary);
        const closeBtn = document.createElement('button');
        closeBtn.textContent = this.t('ui.close');
        closeBtn.style.cssText = 'margin-top:16px;padding:8px 24px;font-size:1rem;cursor:pointer;';
        closeBtn.addEventListener('click', () => {
          overlay.remove();
          if (onComplete) onComplete();
        });
        content.appendChild(closeBtn);
        return;
      }
      const entry = document.createElement('div');
      entry.textContent = combatLog[index];
      entry.style.cssText = 'margin-bottom:4px;opacity:0;transition:opacity 0.3s;';
      logContainer.appendChild(entry);
      requestAnimationFrame(() => { entry.style.opacity = '1'; });
      index++;
    }, 600);
  }

  openCombatOverlay(battleContext, onComplete) {
    this.isCombatOverlayOpen = true;
    this.onCombatComplete = onComplete;
    const overlay = document.createElement('div');
    overlay.id = 'combat-overlay';
    overlay.className = 'combat-overlay';
    const container = document.createElement('div');
    container.className = 'combat-container';
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    this.overlay = overlay;

    let currentMenu = 'main';
    let selectedSkillId = null;
    let selectedItemId = null;
    let targetMode = null;

    const render = () => {
      container.innerHTML = '';
      const battle = this.lastState && this.lastState.activeBattle;
      if (!battle) {
        overlay.remove();
        this.isCombatOverlayOpen = false;
        this.renderCombatOverlay = null;
        this.overlay = null;
        if (this.onCombatComplete) this.onCombatComplete();
        return;
      }

      // Header
      const header = document.createElement('div');
      header.className = 'combat-header';
      const title = document.createElement('h2');
      title.textContent = this.t('combat.battle_title');
      header.appendChild(title);
      const controls = document.createElement('div');
      controls.className = 'combat-header-controls';
      const autoBtn = document.createElement('button');
      autoBtn.textContent = this.t('combat.auto');
      autoBtn.className = 'btn btn-secondary btn-sm';
      autoBtn.addEventListener('click', () => {
        if (this.engine && this.engine.executeBattleAction) {
          this.engine.executeBattleAction('auto');
        }
      });
      controls.appendChild(autoBtn);
      const skipBtn = document.createElement('button');
      skipBtn.textContent = this.t('combat.skip');
      skipBtn.className = 'btn btn-secondary btn-sm';
      skipBtn.addEventListener('click', () => {
        if (this.engine && this.engine.executeBattleAction) {
          this.engine.executeBattleAction('skip');
        }
      });
      controls.appendChild(skipBtn);
      header.appendChild(controls);
      container.appendChild(header);

      // Battle Resolution
      if (battle.resolved) {
        this._renderBattleResolution(battle, container);
        this._animateLastEvents(battle);
        return;
      }

      // Three columns
      const columns = document.createElement('div');
      columns.className = 'combat-grid';

      // Heroes column
      const heroesCol = document.createElement('div');
      heroesCol.className = 'combat-column';
      const heroesTitle = document.createElement('h3');
      heroesTitle.textContent = this.t('combat.heroes');
      heroesCol.appendChild(heroesTitle);
      const activeActor = battle.turnOrder[battle.currentTurnIndex];
      const isActiveActor = (actor) => activeActor && actor.id === activeActor.id;

      const renderStatusEffects = (entity, card) => {
        if (!entity.statusEffects || entity.statusEffects.length === 0) return;
        const statusMap = { poison: '🟣', burn: '🟠', haste: '🔵', sleep: '💤', stun: '💤' };
        const statusDiv = document.createElement('div');
        statusDiv.className = 'combat-card-statuses';
        entity.statusEffects.forEach(eff => {
          const badge = document.createElement('span');
          badge.className = 'combat-status-badge';
          badge.textContent = statusMap[eff.type] || eff.type;
          badge.title = eff.type;
          statusDiv.appendChild(badge);
        });
        card.appendChild(statusDiv);
      };

      (battle.heroes || []).forEach(hero => {
        const card = document.createElement('div');
        card.dataset.heroId = hero.id;
        card.className = 'combat-card' + (isActiveActor(hero) ? ' active' : '');
        const name = document.createElement('div');
        name.className = 'combat-card-name';
        name.textContent = hero.name;
        card.appendChild(name);
        const hpBar = document.createElement('div');
        hpBar.className = 'combat-bar-container';
        hpBar.style.height = '8px';
        const hpFill = document.createElement('div');
        const hpPct = hero.maxHp ? (hero.hp / hero.maxHp) * 100 : 0;
        const hpColorClass = hpPct > 50 ? 'combat-bar-hp-high' : hpPct > 25 ? 'combat-bar-hp-mid' : 'combat-bar-hp-low';
        hpFill.className = `combat-bar ${hpColorClass}`;
        hpFill.style.width = `${hpPct}%`;
        hpBar.appendChild(hpFill);
        card.appendChild(hpBar);
        const hpText = document.createElement('div');
        hpText.className = 'combat-bar-text';
        hpText.textContent = `${hero.hp}/${hero.maxHp} HP`;
        card.appendChild(hpText);
        if (hero.maxMp > 0) {
          const mpBar = document.createElement('div');
          mpBar.className = 'combat-bar-container';
          const mpFill = document.createElement('div');
          const mpPct = hero.maxMp ? (hero.mp / hero.maxMp) * 100 : 0;
          mpFill.className = 'combat-bar combat-bar-mp';
          mpFill.style.width = `${mpPct}%`;
          mpBar.appendChild(mpFill);
          card.appendChild(mpBar);
          const mpText = document.createElement('div');
          mpText.className = 'combat-bar-text';
          mpText.textContent = `${hero.mp}/${hero.maxMp} MP`;
          card.appendChild(mpText);
        }
        renderStatusEffects(hero, card);
        heroesCol.appendChild(card);
      });
      columns.appendChild(heroesCol);

      // Center column: log + actions
      const centerCol = document.createElement('div');
      centerCol.className = 'combat-column combat-log-column';
      const logTitle = document.createElement('h3');
      logTitle.textContent = this.t('combat.log');
      centerCol.appendChild(logTitle);
      const logBox = document.createElement('div');
      logBox.id = 'combat-log-box';
      logBox.className = 'combat-log-console';
      (battle.log || []).forEach(entry => {
        const line = document.createElement('div');
        line.textContent = entry;
        line.style.cssText = 'margin-bottom:2px;';
        logBox.appendChild(line);
      });
      centerCol.appendChild(logBox);

      // Actions menu
      const actionsBox = document.createElement('div');
      actionsBox.className = 'combat-control-panel';
      if (currentMenu === 'main') {
        this._renderMainMenu(actionsBox, () => render());
      } else if (currentMenu === 'skills') {
        this._renderSkillsMenu(actionsBox, battle, (skillId) => {
          selectedSkillId = skillId;
          const skillData = SKILLS_DATA[skillId];
          if (skillData && skillData.target === 'friendly') {
            targetMode = 'friendly';
          } else {
            targetMode = 'enemy';
          }
          currentMenu = 'targeting';
          render();
        }, () => {
          currentMenu = 'main';
          render();
        });
      } else if (currentMenu === 'items') {
        this._renderItemsMenu(actionsBox, (itemId) => {
          selectedItemId = itemId;
          targetMode = 'friendly';
          currentMenu = 'targeting';
          render();
        }, () => {
          currentMenu = 'main';
          render();
        });
      } else if (currentMenu === 'targeting') {
        this._renderTargeting(actionsBox, battle, targetMode, (targetId) => {
          this._executeTargetAction(selectedSkillId, selectedItemId, targetId);
          currentMenu = 'main';
          selectedSkillId = null;
          selectedItemId = null;
          targetMode = null;
          render();
        }, () => {
          currentMenu = selectedSkillId ? 'skills' : 'items';
          targetMode = null;
          render();
        });
      }
      centerCol.appendChild(actionsBox);
      columns.appendChild(centerCol);

      // Enemies column
      const enemiesCol = document.createElement('div');
      enemiesCol.className = 'combat-column';
      const enemiesTitle = document.createElement('h3');
      enemiesTitle.textContent = this.t('combat.enemies');
      enemiesCol.appendChild(enemiesTitle);
      (battle.enemies || []).forEach(enemy => {
        const card = document.createElement('div');
        card.dataset.enemyId = enemy.id;
        card.className = 'combat-card' + (isActiveActor(enemy) ? ' active' : '');
        const name = document.createElement('div');
        name.className = 'combat-card-name';
        name.textContent = enemy.name;
        card.appendChild(name);
        const hpBar = document.createElement('div');
        hpBar.className = 'combat-bar-container';
        hpBar.style.height = '8px';
        const hpFill = document.createElement('div');
        const hpPct = enemy.maxHp ? (enemy.hp / enemy.maxHp) * 100 : 0;
        const hpColorClass = hpPct > 50 ? 'combat-bar-hp-high' : hpPct > 25 ? 'combat-bar-hp-mid' : 'combat-bar-hp-low';
        hpFill.className = `combat-bar ${hpColorClass}`;
        hpFill.style.width = `${hpPct}%`;
        hpBar.appendChild(hpFill);
        card.appendChild(hpBar);
        const hpText = document.createElement('div');
        hpText.className = 'combat-bar-text';
        hpText.textContent = `${enemy.hp}/${enemy.maxHp} HP`;
        card.appendChild(hpText);
        renderStatusEffects(enemy, card);
        enemiesCol.appendChild(card);
      });
      columns.appendChild(enemiesCol);

      container.appendChild(columns);
      this._animateLastEvents(battle);
    };

    this.renderCombatOverlay = render;
    render();
  }

  _renderBattleResolution(battle, container) {
    const resolution = document.createElement('div');
    resolution.style.cssText = 'text-align:center;padding:20px;background:rgba(255,255,255,0.1);border-radius:8px;';
    const resultTitle = document.createElement('h2');
    resultTitle.textContent = battle.victory ? this.t('combat.victory') : this.t('combat.defeat');
    resultTitle.style.color = battle.victory ? '#4caf50' : '#f44336';
    resolution.appendChild(resultTitle);

    if (battle.rewards) {
      const rewardsDiv = document.createElement('div');
      rewardsDiv.style.cssText = 'margin-top:12px;';
      const rewardsTitle = document.createElement('h3');
      rewardsTitle.textContent = this.t('combat.rewards');
      rewardsDiv.appendChild(rewardsTitle);
      if (battle.rewards.xp) {
        const xpLine = document.createElement('div');
        xpLine.textContent = this.t('combat.xp_reward', { xp: battle.rewards.xp });
        rewardsDiv.appendChild(xpLine);
      }
      if (battle.rewards.gold) {
        const goldLine = document.createElement('div');
        goldLine.textContent = this.t('combat.gold_reward', { gold: battle.rewards.gold });
        rewardsDiv.appendChild(goldLine);
      }
      if (battle.rewards.items && battle.rewards.items.length) {
        const itemsLine = document.createElement('div');
        itemsLine.textContent = this.t('combat.items_reward', { items: battle.rewards.items.join(', ') });
        rewardsDiv.appendChild(itemsLine);
      }
      resolution.appendChild(rewardsDiv);
    }

    const closeBtn = document.createElement('button');
    closeBtn.textContent = this.t('ui.close');
    closeBtn.style.cssText = 'margin-top:16px;padding:8px 24px;font-size:1rem;cursor:pointer;';
    closeBtn.addEventListener('click', () => {
      if (this.overlay) this.overlay.remove();
      this.isCombatOverlayOpen = false;
      this.renderCombatOverlay = null;
      this.overlay = null;
      if (this.onCombatComplete) this.onCombatComplete();
    });
    resolution.appendChild(closeBtn);
    container.appendChild(resolution);
  }

  _renderMainMenu(actionsBox, rerender) {
    const menu = document.createElement('div');
    menu.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    const attackBtn = document.createElement('button');
    attackBtn.textContent = this.t('combat.attack');
    attackBtn.style.cssText = 'flex:1;min-width:80px;padding:8px;cursor:pointer;';
    attackBtn.addEventListener('click', () => {
      if (this.engine && this.engine.executeBattleAction) {
        this.engine.executeBattleAction('attack');
      }
      rerender();
    });
    menu.appendChild(attackBtn);
    const skillsBtn = document.createElement('button');
    skillsBtn.textContent = this.t('combat.skills');
    skillsBtn.style.cssText = 'flex:1;min-width:80px;padding:8px;cursor:pointer;';
    skillsBtn.addEventListener('click', () => {
      const event = new CustomEvent('combat-menu-change', { detail: { menu: 'skills' } });
      document.dispatchEvent(event);
    });
    menu.appendChild(skillsBtn);
    const itemsBtn = document.createElement('button');
    itemsBtn.textContent = this.t('combat.items');
    itemsBtn.style.cssText = 'flex:1;min-width:80px;padding:8px;cursor:pointer;';
    itemsBtn.addEventListener('click', () => {
      const event = new CustomEvent('combat-menu-change', { detail: { menu: 'items' } });
      document.dispatchEvent(event);
    });
    menu.appendChild(itemsBtn);
    actionsBox.appendChild(menu);

    document.addEventListener('combat-menu-change', (e) => {
      // Handled in render closure
    }, { once: true });
  }

  _renderSkillsMenu(actionsBox, battle, onSelect, onBack) {
    const currentHero = battle.heroes && battle.heroes[battle.currentHeroIndex || 0];
    const skills = currentHero && currentHero.skills ? currentHero.skills : [];
    const menu = document.createElement('div');
    menu.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.textContent = this.t('combat.select_skill');
    menu.appendChild(title);
    skills.forEach(skillId => {
      const skillData = SKILLS_DATA[skillId];
      const mpCost = skillData ? skillData.mpCost : 0;
      const btn = document.createElement('button');
      btn.textContent = `${skillData ? skillData.name : skillId} (${mpCost} MP)`;
      btn.style.cssText = 'padding:6px;cursor:pointer;text-align:left;';
      const canUse = currentHero && currentHero.mp >= mpCost;
      if (!canUse) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
      }
      btn.addEventListener('click', () => {
        if (canUse) onSelect(skillId);
      });
      menu.appendChild(btn);
    });
    const backBtn = document.createElement('button');
    backBtn.textContent = this.t('ui.back');
    backBtn.style.cssText = 'padding:6px;cursor:pointer;';
    backBtn.addEventListener('click', onBack);
    menu.appendChild(backBtn);
    actionsBox.appendChild(menu);
  }

  _renderItemsMenu(actionsBox, onSelect, onBack) {
    const inventory = this.lastState && this.lastState.inventory ? this.lastState.inventory : {};
    const consumables = Object.entries(inventory).filter(([_, item]) => item && item.type === 'consumable');
    const menu = document.createElement('div');
    menu.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.textContent = this.t('combat.select_item');
    menu.appendChild(title);
    if (consumables.length === 0) {
      const none = document.createElement('div');
      none.style.cssText = 'opacity:0.6;';
      none.textContent = this.t('combat.no_items');
      menu.appendChild(none);
    }
    consumables.forEach(([itemId, item]) => {
      const btn = document.createElement('button');
      btn.textContent = `${item.name || itemId} x${item.quantity || 1}`;
      btn.style.cssText = 'padding:6px;cursor:pointer;text-align:left;';
      btn.addEventListener('click', () => onSelect(itemId));
      menu.appendChild(btn);
    });
    const backBtn = document.createElement('button');
    backBtn.textContent = this.t('ui.back');
    backBtn.style.cssText = 'padding:6px;cursor:pointer;';
    backBtn.addEventListener('click', onBack);
    menu.appendChild(backBtn);
    actionsBox.appendChild(menu);
  }

  _renderTargeting(actionsBox, battle, targetMode, onSelect, onBack) {
    const menu = document.createElement('div');
    menu.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.textContent = targetMode === 'friendly' ? this.t('combat.select_ally') : this.t('combat.select_enemy');
    menu.appendChild(title);
    const targets = targetMode === 'friendly' ? (battle.heroes || []) : (battle.enemies || []);
    targets.forEach(target => {
      const btn = document.createElement('button');
      btn.textContent = target.name;
      btn.style.cssText = 'padding:6px;cursor:pointer;text-align:left;';
      btn.addEventListener('click', () => onSelect(target.id));
      menu.appendChild(btn);
    });
    const backBtn = document.createElement('button');
    backBtn.textContent = this.t('ui.back');
    backBtn.style.cssText = 'padding:6px;cursor:pointer;';
    backBtn.addEventListener('click', onBack);
    menu.appendChild(backBtn);
    actionsBox.appendChild(menu);
  }

  _executeTargetAction(skillId, itemId, targetId) {
    if (skillId && this.engine && this.engine.executeBattleAction) {
      this.engine.executeBattleAction('skill', { skillId, targetId });
    } else if (itemId && this.engine && this.engine.useBattleConsumable) {
      this.engine.useBattleConsumable(itemId, targetId);
    }
  }

  _animateLastEvents(battle) {
    const log = battle.log || [];
    const newEvents = log.slice(this.lastLogLength);
    this.lastLogLength = log.length;
    newEvents.forEach((entry, idx) => {
      setTimeout(() => {
        this._triggerVisualEffect(entry, battle);
      }, idx * 200);
    });
  }

  _triggerVisualEffect(entry, battle) {
    // Parse damage/heal from log entry text
    const damageMatch = entry.match(/(\d+)\s*damage/i);
    const healMatch = entry.match(/(\d+)\s*HP/i);
    const targetNameMatch = entry.match(/^([^\s]+)/);
    const value = damageMatch ? parseInt(damageMatch[1], 10) : healMatch ? parseInt(healMatch[1], 10) : null;
    const isHeal = !!healMatch;
    if (!value || !targetNameMatch) return;

    // Find target card
    const targetName = targetNameMatch[1];
    let card = null;
    const overlay = document.getElementById('combat-overlay');
    if (!overlay) return;
    const cards = overlay.querySelectorAll('[data-hero-id], [data-enemy-id]');
    cards.forEach(c => {
      const nameEl = c.querySelector('div:first-child');
      if (nameEl && nameEl.textContent === targetName) {
        card = c;
      }
    });
    if (!card) return;

    // Floating number
    const float = document.createElement('div');
    float.textContent = isHeal ? `+${value}` : `-${value}`;
    float.style.cssText = `position:absolute;top:20%;left:50%;transform:translateX(-50%);font-weight:bold;font-size:1.4rem;color:${isHeal ? '#4caf50' : '#f44336'};pointer-events:none;z-index:10;transition:top 1s,opacity 1s;`;
    card.appendChild(float);
    requestAnimationFrame(() => {
      float.style.top = '-10%';
      float.style.opacity = '0';
    });
    setTimeout(() => float.remove(), 1000);

    // Card shake
    card.style.transform = 'translateX(-4px)';
    setTimeout(() => { card.style.transform = 'translateX(4px)'; }, 50);
    setTimeout(() => { card.style.transform = 'translateX(-4px)'; }, 100);
    setTimeout(() => { card.style.transform = 'translateX(4px)'; }, 150);
    setTimeout(() => { card.style.transform = 'translateX(0)'; }, 200);
  }
}
