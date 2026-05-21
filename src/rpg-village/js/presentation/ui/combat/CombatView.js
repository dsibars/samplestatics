import { SKILLS_DATA } from '../../../engine/shared/data/GameConstants.js';
import { CombatLogFormatter } from '../../../engine/shared/combat/CombatLogFormatter.js';

export class CombatView {
  constructor({ i18n }) {
    this.i18n = i18n;
    this.formatter = new CombatLogFormatter(i18n);
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
      // Only re-render if battle state has meaningfully changed
      const battle = state.activeBattle;
      const battleString = battle ? JSON.stringify({
        isOver: battle.isOver,
        currentTurnIndex: battle.currentTurnIndex,
        logLen: (battle.log || []).length,
        heroesHp: (battle.heroes || []).map(h => h.hp).join(','),
        enemiesHp: (battle.enemies || []).map(e => e.hp).join(','),
        itemUsedThisTurn: battle.itemUsedThisTurn
      }) : 'null';

      if (this.lastBattleState !== battleString) {
        this.lastBattleState = battleString;
        this.renderCombatOverlay();
      }
    }
  }

  playBattleLog(combatLog, onComplete) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:2000;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:sans-serif;';
    const content = document.createElement('div');
    content.style.cssText = 'max-width:600px;width:90%;text-align:center;';
    const title = document.createElement('h2');
    title.textContent = this.t('combat_battle_log');
    title.style.marginBottom = '16px';
    content.appendChild(title);
    const logContainer = document.createElement('div');
    logContainer.style.cssText = 'min-height:120px;margin-bottom:16px;text-align:left;';
    content.appendChild(logContainer);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    const events = combatLog.events || [];
    let index = 0;
    const interval = setInterval(() => {
      if (index >= events.length) {
        clearInterval(interval);
        const summary = document.createElement('div');
        summary.style.cssText = 'margin-top:12px;font-weight:bold;color:#ffd700;';
        summary.textContent = this.t('combat_battle_finished');
        content.appendChild(summary);
        const closeBtn = document.createElement('button');
        closeBtn.textContent = this.t('ui_btn_close');
        closeBtn.className = 'btn btn-secondary';
        closeBtn.style.marginTop = '16px';
        closeBtn.addEventListener('click', () => {
          overlay.remove();
          if (onComplete) onComplete();
        });
        content.appendChild(closeBtn);
        return;
      }
      const entry = document.createElement('div');
      entry.textContent = this.formatter.format(events[index]);
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
      title.textContent = this.t('combat_battle_title');
      header.appendChild(title);
      const controls = document.createElement('div');
      controls.className = 'combat-header-controls';
      const autoBtn = document.createElement('button');
      autoBtn.textContent = this.t('btn_auto_combat');
      autoBtn.className = 'btn btn-secondary btn-sm';
      autoBtn.addEventListener('click', () => {
        if (this.engine && this.engine.battleService) {
          this.engine.battleService.autoBattle = true;
          this.engine.nextBattleTurn();
        }
      });
      controls.appendChild(autoBtn);
      const skipBtn = document.createElement('button');
      skipBtn.textContent = this.t('btn_skip_combat');
      skipBtn.className = 'btn btn-secondary btn-sm';
      skipBtn.addEventListener('click', () => {
        if (this.engine && this.engine.skipBattle) {
          this.engine.skipBattle();
        }
      });
      controls.appendChild(skipBtn);
      header.appendChild(controls);
      container.appendChild(header);

      // Battle Resolution
      if (battle.isOver || battle.resolved) {
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
      heroesTitle.textContent = this.t('combat_heroes');
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
      logTitle.textContent = this.t('combat_log');
      centerCol.appendChild(logTitle);
      const logBox = document.createElement('div');
      logBox.id = 'combat-log-box';
      logBox.className = 'combat-log-console';
      (battle.log || []).forEach(entry => {
        const line = document.createElement('div');
        line.textContent = this.formatter.format(entry);
        line.style.cssText = 'margin-bottom:2px;';
        logBox.appendChild(line);
      });
      centerCol.appendChild(logBox);

      // Actions menu
      const actionsBox = document.createElement('div');
      actionsBox.className = 'combat-control-panel';
      if (currentMenu === 'main') {
        this._renderMainMenu(actionsBox,
          () => { if (this.engine && this.engine.executeBattleAction) { this.engine.executeBattleAction('basic_attack'); } render(); },
          () => { currentMenu = 'skills'; render(); },
          () => { currentMenu = 'items'; render(); }
        );
      } else if (currentMenu === 'skills') {
        this._renderSkillsMenu(actionsBox, battle, (skillId) => {
          selectedSkillId = skillId;
          const skillData = SKILLS_DATA[skillId];
          if (skillData && skillData.targetType === 'single_ally') {
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
          this._executeTargetAction(selectedSkillId, selectedItemId, targetId, targetMode);
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
      enemiesTitle.textContent = this.t('combat_enemies');
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
    const isVictory = battle.victory !== undefined ? battle.victory : battle.winner === 'heroes';
    resultTitle.textContent = isVictory ? this.t('victory') : this.t('defeat');
    resultTitle.style.color = isVictory ? '#4caf50' : '#f44336';
    resolution.appendChild(resultTitle);

    // Hero summary
    if (battle.summary && battle.summary.length > 0) {
      const summaryDiv = document.createElement('div');
      summaryDiv.style.cssText = 'margin-top:12px;text-align:left;';
      const summaryTitle = document.createElement('h3');
      summaryTitle.textContent = this.t('combat_heroes');
      summaryDiv.appendChild(summaryTitle);
      battle.summary.forEach(s => {
        const line = document.createElement('div');
        line.style.cssText = 'margin-bottom:4px;';
        const levelUpText = s.leveledUp ? ' ⬆️' : '';
        line.textContent = `${s.heroName}: +${s.expEarned} XP${levelUpText} | HP Lost: ${s.hpLost}`;
        summaryDiv.appendChild(line);
      });
      resolution.appendChild(summaryDiv);
    }

    // Rewards
    if (battle.rewards) {
      const rewardsDiv = document.createElement('div');
      rewardsDiv.style.cssText = 'margin-top:12px;';
      const rewardsTitle = document.createElement('h3');
      rewardsTitle.textContent = this.t('combat_rewards');
      rewardsDiv.appendChild(rewardsTitle);

      if (battle.rewards.gold) {
        const goldLine = document.createElement('div');
        goldLine.textContent = this.t('combat_gold_reward', { gold: battle.rewards.gold });
        rewardsDiv.appendChild(goldLine);
      }
      if (battle.rewards.items && Object.keys(battle.rewards.items).length > 0) {
        const itemsText = Object.entries(battle.rewards.items)
          .map(([id, qty]) => `${this.t(id) || id} x${qty}`)
          .join(', ');
        const itemsLine = document.createElement('div');
        itemsLine.textContent = this.t('combat_items_reward', { items: itemsText });
        rewardsDiv.appendChild(itemsLine);
      }
      resolution.appendChild(rewardsDiv);
    }

    const closeBtn = document.createElement('button');
    closeBtn.textContent = this.t('ui_btn_close');
    closeBtn.className = 'btn btn-secondary';
    closeBtn.style.marginTop = '16px';
    closeBtn.addEventListener('click', () => {
      if (this.overlay) this.overlay.remove();
      this.isCombatOverlayOpen = false;
      this.renderCombatOverlay = null;
      this.overlay = null;
      this.lastBattleState = null;
      if (this.onCombatComplete) this.onCombatComplete();
    });
    resolution.appendChild(closeBtn);
    container.appendChild(resolution);
  }

  _renderMainMenu(actionsBox, onAttack, onSkills, onItems) {
    const menu = document.createElement('div');
    menu.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    const attackBtn = document.createElement('button');
    attackBtn.textContent = this.t('basic_attack');
    attackBtn.className = 'btn btn-primary';
    attackBtn.style.flex = '1';
    attackBtn.style.minWidth = '80px';
    attackBtn.addEventListener('click', () => {
      if (onAttack) onAttack();
    });
    menu.appendChild(attackBtn);
    const skillsBtn = document.createElement('button');
    skillsBtn.textContent = this.t('ui_skills');
    skillsBtn.className = 'btn btn-secondary';
    skillsBtn.style.flex = '1';
    skillsBtn.style.minWidth = '80px';
    skillsBtn.addEventListener('click', () => {
      if (onSkills) onSkills();
    });
    menu.appendChild(skillsBtn);
    const itemsBtn = document.createElement('button');
    itemsBtn.textContent = this.t('combat_items');
    itemsBtn.className = 'btn btn-secondary';
    itemsBtn.style.flex = '1';
    itemsBtn.style.minWidth = '80px';
    itemsBtn.addEventListener('click', () => {
      if (onItems) onItems();
    });
    menu.appendChild(itemsBtn);
    actionsBox.appendChild(menu);
  }

  _renderSkillsMenu(actionsBox, battle, onSelect, onBack) {
    const activeActor = battle.turnOrder && battle.turnOrder[battle.currentTurnIndex];
    const currentHero = activeActor && battle.heroes ? battle.heroes.find(h => h.id === activeActor.id) : null;
    // hero.skills is an object like { basic_attack: 0, fireball: 2 }
    const skills = currentHero && currentHero.skills ? Object.keys(currentHero.skills) : [];
    const menu = document.createElement('div');
    menu.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.textContent = this.t('combat_select_skill');
    menu.appendChild(title);
    skills.forEach(skillId => {
      const skillData = SKILLS_DATA[skillId];
      const mpCost = skillData ? skillData.mpCost : 0;
      const btn = document.createElement('button');
      // Use i18n key for skill name; SKILLS_DATA has no 'name' field
      const skillName = this.t(skillId) || skillId;
      btn.textContent = `${skillName} (${mpCost} MP)`;
      btn.className = 'btn btn-secondary btn-sm';
      btn.style.textAlign = 'left';
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
    backBtn.textContent = this.t('btn_back');
    backBtn.className = 'btn btn-secondary btn-sm';
    backBtn.addEventListener('click', onBack);
    menu.appendChild(backBtn);
    actionsBox.appendChild(menu);
  }

  _renderItemsMenu(actionsBox, onSelect, onBack) {
    const inventory = this.lastState && this.lastState.inventory ? this.lastState.inventory : {};
    // consumables is a flat object: { item_tiny_hp_potion: 5, ... }
    const consumables = Object.entries(inventory.consumables || {}).filter(([_, count]) => count > 0);
    const menu = document.createElement('div');
    menu.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.textContent = this.t('combat_select_item');
    menu.appendChild(title);
    if (consumables.length === 0) {
      const none = document.createElement('div');
      none.style.cssText = 'opacity:0.6;';
      none.textContent = this.t('ui_no_items');
      menu.appendChild(none);
    }
    consumables.forEach(([itemId, count]) => {
      const btn = document.createElement('button');
      const itemName = this.t(itemId) || itemId;
      btn.textContent = `${itemName} x${count}`;
      btn.className = 'btn btn-secondary btn-sm';
      btn.style.textAlign = 'left';
      btn.addEventListener('click', () => onSelect(itemId));
      menu.appendChild(btn);
    });
    const backBtn = document.createElement('button');
    backBtn.textContent = this.t('btn_back');
    backBtn.className = 'btn btn-secondary btn-sm';
    backBtn.addEventListener('click', onBack);
    menu.appendChild(backBtn);
    actionsBox.appendChild(menu);
  }

  _renderTargeting(actionsBox, battle, targetMode, onSelect, onBack) {
    const menu = document.createElement('div');
    menu.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.textContent = this.t('ui_choose_target');
    menu.appendChild(title);
    const targets = targetMode === 'friendly' ? (battle.heroes || []) : (battle.enemies || []);
    targets.forEach(target => {
      const btn = document.createElement('button');
      btn.textContent = target.name;
      btn.className = 'btn btn-secondary btn-sm';
      btn.style.textAlign = 'left';
      btn.addEventListener('click', () => onSelect(target.id));
      menu.appendChild(btn);
    });
    const backBtn = document.createElement('button');
    backBtn.textContent = this.t('btn_back');
    backBtn.className = 'btn btn-secondary btn-sm';
    backBtn.addEventListener('click', onBack);
    menu.appendChild(backBtn);
    actionsBox.appendChild(menu);
  }

  _executeTargetAction(skillId, itemId, targetId, targetMode) {
    const battle = this.lastState && this.lastState.activeBattle;
    if (!battle) return;

    if (skillId && this.engine && this.engine.executeBattleAction) {
      // Map targetId to target index in the appropriate array
      const isFriendly = targetMode === 'friendly';
      const targets = isFriendly ? (battle.heroes || []) : (battle.enemies || []);
      const targetIndex = targets.findIndex(t => t.id === targetId);
      this.engine.executeBattleAction(skillId, targetIndex >= 0 ? targetIndex : null);
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
    // Structured event parsing (replaces old regex-based string parsing)
    const type = entry.type;
    const isDamage = type === 'DAMAGE' || type === 'STATUS_TICK';
    const isHeal = type === 'HEAL' || type === 'VAMP' || type === 'TRAIT_REGEN' || type === 'USE_CONSUMABLE';

    if (!isDamage && !isHeal) return;

    const value = entry.amount !== undefined ? entry.amount : entry.damage;
    if (!value || value <= 0) return;

    const targetName = entry.targetName;
    if (!targetName) return;

    // Find target card
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
