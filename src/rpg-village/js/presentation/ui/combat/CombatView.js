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
      this.renderCombatOverlay();
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

    const events = combatLog.events || combatLog || [];
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
      const entry = events[index];
      const entryDiv = document.createElement('div');
      entryDiv.innerHTML = this._formatLogEntryHtml(entry);
      entryDiv.style.cssText = 'margin-bottom:4px;opacity:0;transition:opacity 0.3s;';
      logContainer.appendChild(entryDiv);
      requestAnimationFrame(() => { entryDiv.style.opacity = '1'; });
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

    const render = () => {
      const state = this.lastState;
      if (!state || !state.activeBattle) {
        overlay.remove();
        this.isCombatOverlayOpen = false;
        this.renderCombatOverlay = null;
        this.overlay = null;
        if (this.onCombatComplete) this.onCombatComplete();
        return;
      }

      const battle = state.activeBattle;
      const activeExp = (state.activeExpeditions || []).find(e => e.status === 'combat');
      const currentStageNum = activeExp ? activeExp.currentStage + 1 : 1;
      const stageText = `${this.t('exp_stage')} ${currentStageNum}`;

      const menuState = overlay.menuState || 'main';
      const selectedAction = overlay.selectedAction || null;
      const currentHash = JSON.stringify(battle) + menuState + (selectedAction ? selectedAction.id : '');
      if (overlay.lastRenderHash === currentHash) {
        return;
      }
      overlay.lastRenderHash = currentHash;

      this._animateLastEvents(battle);

      // Header
      const header = document.createElement('div');
      header.className = 'combat-header';
      const titleWrap = document.createElement('div');
      const title = document.createElement('h2');
      title.textContent = activeExp ? (this.t(activeExp.id) !== activeExp.id ? this.t(activeExp.id) : activeExp.name) : this.t('combat_battle_title');
      titleWrap.appendChild(title);
      const stageLabel = document.createElement('div');
      stageLabel.style.cssText = 'font-size:0.9rem;color:var(--text-secondary);margin-top:4px;';
      stageLabel.textContent = stageText;
      titleWrap.appendChild(stageLabel);
      header.appendChild(titleWrap);
      const controls = document.createElement('div');
      controls.className = 'combat-header-controls';
      const autoBtn = document.createElement('button');
      autoBtn.textContent = `${this.t('btn_auto_combat')} ${battle.autoBattle ? '(ON)' : '(OFF)'}`;
      autoBtn.className = `btn btn-sm ${battle.autoBattle ? 'btn-primary' : 'btn-secondary'}`;
      autoBtn.addEventListener('click', () => {
        if (this.engine && this.engine.battleService) {
          this.engine.battleService.autoBattle = !this.engine.battleService.autoBattle;
        }
        if (this.adapter) this.adapter.forceUpdate();
      });
      controls.appendChild(autoBtn);
      const skipBtn = document.createElement('button');
      skipBtn.textContent = this.t('btn_skip_combat');
      skipBtn.className = 'btn btn-secondary btn-sm';
      skipBtn.addEventListener('click', () => {
        if (this.engine && this.engine.skipBattle) {
          this.engine.skipBattle();
        }
        if (this.adapter) this.adapter.forceUpdate();
      });
      controls.appendChild(skipBtn);
      header.appendChild(controls);
      container.innerHTML = '';
      container.appendChild(header);

      // Grid
      const grid = document.createElement('div');
      grid.className = 'combat-grid';

      // Heroes column
      const heroesCol = document.createElement('div');
      heroesCol.className = 'combat-column';
      const heroesTitle = document.createElement('div');
      heroesTitle.className = 'combat-column-title';
      heroesTitle.textContent = this.t('combat_heroes');
      heroesCol.appendChild(heroesTitle);

      const activeActor = battle.turnOrder[battle.currentTurnIndex];
      (battle.heroes || []).forEach((hero, index) => {
        const isCurrentTurn = activeActor && activeActor.id === hero.id;
        const isDead = hero.hp <= 0;
        const hpPct = hero.maxHp ? Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100)) : 0;
        const mpPct = hero.maxMp ? Math.max(0, Math.min(100, (hero.mp / hero.maxMp) * 100)) : 0;

        const card = document.createElement('div');
        card.className = `combat-card hero-card ${isCurrentTurn ? 'active' : ''} ${isDead ? 'dead' : ''}`;
        card.dataset.heroId = hero.id;
        card.dataset.heroIndex = index;

        const avatar = document.createElement('div');
        avatar.className = 'combat-card-avatar';
        avatar.textContent = isDead ? '💀' : '⚔️';
        card.appendChild(avatar);

        const info = document.createElement('div');
        info.className = 'combat-card-info';
        const headerRow = document.createElement('div');
        headerRow.className = 'combat-card-header';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'combat-card-name';
        nameSpan.textContent = hero.name;
        headerRow.appendChild(nameSpan);
        const lvlSpan = document.createElement('span');
        lvlSpan.className = 'combat-card-level';
        lvlSpan.textContent = `Lv.${hero.level}`;
        headerRow.appendChild(lvlSpan);
        info.appendChild(headerRow);

        const hpBarWrap = document.createElement('div');
        hpBarWrap.className = 'combat-bar-container';
        const hpBar = document.createElement('div');
        hpBar.className = 'combat-bar combat-bar-hp';
        hpBar.style.width = `${hpPct}%`;
        hpBarWrap.appendChild(hpBar);
        info.appendChild(hpBarWrap);
        const hpText = document.createElement('div');
        hpText.className = 'combat-bar-text';
        hpText.innerHTML = `<span>HP</span><span>${hero.hp}/${hero.maxHp}</span>`;
        info.appendChild(hpText);

        if (hero.maxMp > 0) {
          const mpBarWrap = document.createElement('div');
          mpBarWrap.className = 'combat-bar-container';
          mpBarWrap.style.height = '4px';
          const mpBar = document.createElement('div');
          mpBar.className = 'combat-bar combat-bar-mp';
          mpBar.style.width = `${mpPct}%`;
          mpBarWrap.appendChild(mpBar);
          info.appendChild(mpBarWrap);
          const mpText = document.createElement('div');
          mpText.className = 'combat-bar-text';
          mpText.style.fontSize = '0.7rem';
          mpText.innerHTML = `<span>MP</span><span>${hero.mp}/${hero.maxMp}</span>`;
          info.appendChild(mpText);
        }

        const statuses = document.createElement('div');
        statuses.className = 'combat-card-statuses';
        (hero.statusEffects || []).forEach(st => {
          const badge = document.createElement('span');
          badge.className = 'combat-status-badge';
          const iconMap = { poison: '🤢', burn: '🔥', regen: '💚', haste: '⭐', sleep: '💤', stun: '💫' };
          badge.textContent = iconMap[st.type] || st.type;
          badge.title = `${st.type} (${st.duration} turns)`;
          statuses.appendChild(badge);
        });
        info.appendChild(statuses);

        const effects = document.createElement('div');
        effects.className = 'combat-effects-container';
        effects.id = `effects-hero-${hero.id}`;
        card.appendChild(info);
        card.appendChild(effects);
        heroesCol.appendChild(card);
      });
      grid.appendChild(heroesCol);

      // Middle column: log + actions
      const middleCol = document.createElement('div');
      middleCol.className = 'combat-log-column';
      const logTitle = document.createElement('div');
      logTitle.className = 'combat-column-title';
      logTitle.textContent = this.t('combat_log');
      middleCol.appendChild(logTitle);

      const logConsole = document.createElement('div');
      logConsole.className = 'combat-log-console';
      logConsole.id = 'combat-log-console';
      (battle.log || []).slice(-20).forEach(entry => {
        const line = document.createElement('div');
        line.innerHTML = this._formatLogEntryHtml(entry);
        line.style.cssText = 'margin-bottom:4px;line-height:1.4;';
        logConsole.appendChild(line);
      });
      middleCol.appendChild(logConsole);

      const turnBanner = document.createElement('div');
      turnBanner.className = 'combat-current-turn-banner';
      const activeActorName = activeActor ? (this.t(activeActor.name) || activeActor.name) : '...';
      turnBanner.textContent = activeActor ? `${activeActorName}'s Turn` : '...';
      middleCol.appendChild(turnBanner);

      const controlPanel = document.createElement('div');
      controlPanel.className = 'combat-control-panel';
      controlPanel.id = 'combat-control-panel';
      middleCol.appendChild(controlPanel);
      grid.appendChild(middleCol);

      // Enemies column
      const enemiesCol = document.createElement('div');
      enemiesCol.className = 'combat-column';
      const enemiesTitle = document.createElement('div');
      enemiesTitle.className = 'combat-column-title';
      enemiesTitle.textContent = this.t('combat_enemies');
      enemiesCol.appendChild(enemiesTitle);

      (battle.enemies || []).forEach((enemy, index) => {
        const isCurrentTurn = activeActor && activeActor.id === enemy.id;
        const isDead = enemy.hp <= 0;
        const hpPct = enemy.maxHp ? Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100)) : 0;

        const card = document.createElement('div');
        card.className = `combat-card enemy-card ${isCurrentTurn ? 'active' : ''} ${isDead ? 'dead' : ''}`;
        card.dataset.enemyIndex = index;

        const avatar = document.createElement('div');
        avatar.className = 'combat-card-avatar';
        avatar.textContent = isDead ? '💀' : '👾';
        card.appendChild(avatar);

        const info = document.createElement('div');
        info.className = 'combat-card-info';
        const headerRow = document.createElement('div');
        headerRow.className = 'combat-card-header';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'combat-card-name';
        nameSpan.textContent = this.t(enemy.name) || enemy.name;
        headerRow.appendChild(nameSpan);
        const lvlSpan = document.createElement('span');
        lvlSpan.className = 'combat-card-level';
        lvlSpan.textContent = `Lv.${enemy.level || 1}`;
        headerRow.appendChild(lvlSpan);
        info.appendChild(headerRow);

        const hpBarWrap = document.createElement('div');
        hpBarWrap.className = 'combat-bar-container';
        const hpBar = document.createElement('div');
        hpBar.className = 'combat-bar combat-bar-hp';
        hpBar.style.width = `${hpPct}%`;
        hpBarWrap.appendChild(hpBar);
        info.appendChild(hpBarWrap);
        const hpText = document.createElement('div');
        hpText.className = 'combat-bar-text';
        hpText.innerHTML = `<span>HP</span><span>${enemy.hp}/${enemy.maxHp}</span>`;
        info.appendChild(hpText);

        const statuses = document.createElement('div');
        statuses.className = 'combat-card-statuses';
        (enemy.statusEffects || []).forEach(st => {
          const badge = document.createElement('span');
          badge.className = 'combat-status-badge';
          const iconMap = { poison: '🤢', burn: '🔥', regen: '💚', haste: '⭐', sleep: '💤', stun: '💫' };
          badge.textContent = iconMap[st.type] || st.type;
          badge.title = `${st.type} (${st.duration} turns)`;
          statuses.appendChild(badge);
        });
        info.appendChild(statuses);

        const effects = document.createElement('div');
        effects.className = 'combat-effects-container';
        effects.id = `effects-enemy-${index}`;
        card.appendChild(info);
        card.appendChild(effects);
        enemiesCol.appendChild(card);
      });
      grid.appendChild(enemiesCol);

      container.appendChild(grid);

      // Scroll log to bottom
      const consoleEl = logConsole;
      if (consoleEl) {
        consoleEl.scrollTop = consoleEl.scrollHeight;
      }

      // Battle end → show resolution inline
      if (battle.isOver) {
        const preview = this.engine && this.engine.getBattleResolutionPreview ? this.engine.getBattleResolutionPreview() : null;
        const isVictory = preview ? preview.isVictory : battle.winner === 'heroes';
        const resultColor = isVictory ? '#4caf50' : '#f44336';
        const resultText = isVictory ? this.t('victory') : this.t('defeat');

        let summaryHtml = '';
        if (preview && preview.summary) {
          summaryHtml = preview.summary.map(s => {
            let text = `<strong>${s.heroName}</strong>: `;
            if (s.hpLost > 0) text += `<span style="color:#f44336;font-size:0.9em;">-${s.hpLost} HP</span> | `;
            else if (s.hpLost < 0) text += `<span style="color:#4caf50;font-size:0.9em;">+${-s.hpLost} HP</span> | `;
            text += `<span style="color:#03a9f4;font-size:0.9em;">+${s.expEarned} EXP</span>`;
            if (s.leveledUp) text += ` <span style="color:#ffeb3b;font-weight:bold;font-size:0.9em;">(LEVEL UP!)</span>`;
            return `<div style="margin-bottom:5px;">${text}</div>`;
          }).join('');
        }

        let rewardsHtml = '';
        if (preview && preview.isLastStage && preview.rewards) {
          const rewards = [];
          if (preview.rewards.gold) rewards.push(`💰 ${preview.rewards.gold} Gold`);
          if (preview.rewards.items) {
            for (const [itemId, qty] of Object.entries(preview.rewards.items)) {
              rewards.push(`📦 ${qty}x ${this.t(itemId) || itemId}`);
            }
          }
          if (rewards.length > 0) {
            rewardsHtml = `
              <div style="margin-top:15px;border-top:1px solid rgba(255,255,255,0.1);padding-top:10px;">
                <h4 style="color:#ffeb3b;margin:0 0 5px 0;">Rewards</h4>
                <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;font-size:0.95rem;">
                  ${rewards.map(r => `<span style="background:rgba(255,235,59,0.1);border:1px solid rgba(255,235,59,0.3);padding:4px 8px;border-radius:4px;">${r}</span>`).join('')}
                </div>
              </div>`;
          }
        }

        controlPanel.innerHTML = `
          <div style="text-align:center;margin-bottom:15px;width:100%;">
            <h3 style="color:${resultColor};font-size:1.6rem;margin:0 0 10px 0;">${resultText}</h3>
            <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);padding:10px;border-radius:6px;text-align:left;max-height:150px;overflow-y:auto;display:inline-block;width:100%;box-sizing:border-box;">
              ${summaryHtml}
              ${rewardsHtml}
            </div>
          </div>
          <button class="btn btn-primary" id="btn-resolve-battle" style="width:100%;">${this.t('ui_btn_close')}</button>
        `;
        controlPanel.querySelector('#btn-resolve-battle').addEventListener('click', () => {
          if (this.engine && this.engine.resolveBattle) {
            this.engine.resolveBattle();
          }
          overlay.style.opacity = '0';
          overlay.style.transition = 'opacity 0.3s ease';
          setTimeout(() => {
            overlay.remove();
            this.isCombatOverlayOpen = false;
            this.renderCombatOverlay = null;
            this.overlay = null;
            if (this.onCombatComplete) this.onCombatComplete();
            if (this.adapter) this.adapter.forceUpdate();
          }, 300);
        });
        return;
      }

      // Normal combat flow
      const isHeroTurn = activeActor && activeActor.type === 'Hero';
      if (!isHeroTurn || battle.autoBattle) {
        controlPanel.innerHTML = `<div class="combat-control-message">${battle.autoBattle ? 'Running Auto-Combat...' : 'Enemy is planning action...'}</div>`;
        return;
      }

      const currentHero = battle.heroes.find(h => h.id === activeActor.id);
      if (!currentHero) return;

      if (menuState === 'main') {
        controlPanel.innerHTML = `
          <div class="combat-control-buttons">
            <button class="btn btn-secondary" id="btn-action-attack" style="flex:1 1 120px;">⚔️ ${this.t('basic_attack')}</button>
            <button class="btn btn-secondary" id="btn-action-skills" style="flex:1 1 120px;" ${(!currentHero.skills || Object.keys(currentHero.skills).length === 0) ? 'disabled' : ''}>✨ ${this.t('ui_skills')}</button>
            <button class="btn btn-secondary" id="btn-action-items" style="flex:1 1 120px;" ${battle.itemUsedThisTurn ? 'disabled' : ''}>🎒 ${this.t('combat_items')} ${battle.itemUsedThisTurn ? '(1/Turn)' : ''}</button>
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
        const skillsButtons = Object.keys(currentHero.skills || {}).map(skillId => {
          const skillData = SKILLS_DATA[skillId];
          const mpCost = skillData ? skillData.mpCost : 0;
          const canAfford = currentHero.mp >= mpCost;
          const skillName = this.t(skillId) || skillId;
          return `<button class="btn btn-secondary" data-skill-id="${skillId}" ${!canAfford ? 'disabled' : ''} style="flex:1 1 140px;">${skillName} <span style="font-size:0.8rem;opacity:0.8;">(${mpCost} MP)</span></button>`;
        }).join('');
        controlPanel.innerHTML = `
          <div class="combat-control-back"><button class="btn btn-secondary btn-sm" id="btn-skill-back">◀ ${this.t('btn_back')}</button></div>
          <div class="combat-control-buttons">${skillsButtons || '<div style="color:var(--text-muted);">No skills available.</div>'}</div>
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
        const itemsButtons = Object.keys(consumables).filter(itemId => consumables[itemId] > 0).map(itemId => {
          const itemName = this.t(itemId) || itemId;
          return `<button class="btn btn-secondary" data-item-id="${itemId}" style="flex:1 1 140px;">${itemName} x${consumables[itemId]}</button>`;
        }).join('');
        controlPanel.innerHTML = `
          <div class="combat-control-back"><button class="btn btn-secondary btn-sm" id="btn-item-back">◀ ${this.t('btn_back')}</button></div>
          <div class="combat-control-buttons">${itemsButtons || '<div style="color:var(--text-muted);">No consumables in inventory.</div>'}</div>
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
        const sel = overlay.selectedAction;
        controlPanel.innerHTML = `
          <div class="combat-control-back"><button class="btn btn-secondary btn-sm" id="btn-target-back">◀ ${this.t('btn_back')}</button></div>
          <div class="combat-control-message" style="color:var(--success);font-weight:700;">${this.t('ui_choose_target')} — ${sel ? sel.name : ''}</div>
        `;
        controlPanel.querySelector('#btn-target-back').addEventListener('click', () => {
          if (sel && sel.type === 'skill') overlay.menuState = 'skills';
          else if (sel && sel.type === 'item') overlay.menuState = 'items';
          else overlay.menuState = 'main';
          render();
        });

        const isFriendly = sel && (sel.id === 'small_heal' || (sel.type === 'item' && sel.id.includes('potion')));
        if (isFriendly) {
          grid.querySelectorAll('.hero-card').forEach(card => {
            const idx = parseInt(card.getAttribute('data-hero-index'));
            const targetHero = battle.heroes[idx];
            if (targetHero && targetHero.hp > 0) {
              card.classList.add('targetable');
              card.addEventListener('click', () => this._executeTargetAction(idx, targetHero.id));
            }
          });
        } else {
          grid.querySelectorAll('.enemy-card').forEach(card => {
            const idx = parseInt(card.getAttribute('data-enemy-index'));
            const targetEnemy = battle.enemies[idx];
            if (targetEnemy && targetEnemy.hp > 0) {
              card.classList.add('targetable');
              card.addEventListener('click', () => this._executeTargetAction(idx, targetEnemy.id));
            }
          });
        }
      }
    };

    this.renderCombatOverlay = render;
    render();
  }

  _executeTargetAction(targetIndex, targetId) {
    const overlay = document.getElementById('combat-overlay');
    if (!overlay) return;
    const selectedAction = overlay.selectedAction;
    if (!selectedAction) return;

    let result;
    if (selectedAction.type === 'attack') {
      result = this.engine.executeBattleAction('basic_attack', targetIndex);
    } else if (selectedAction.type === 'skill') {
      result = this.engine.executeBattleAction(selectedAction.id, targetIndex);
    } else if (selectedAction.type === 'item') {
      result = this.engine.useBattleConsumable(selectedAction.id, targetId);
    }

    if (result && !result.success) {
      alert(this.t(result.error) || result.error);
      return;
    }

    overlay.menuState = 'main';
    overlay.selectedAction = null;
    if (this.adapter) this.adapter.forceUpdate();
  }

  _formatLogEntryHtml(entry) {
    if (typeof entry === 'string') {
      return `<span style="color:#aaa;">${entry}</span>`;
    }
    const ev = entry;
    let text = '';
    let color = '#aaa';

    if (ev.type === 'DAMAGE') {
      if (ev.isMiss) {
        text = this.t('log_miss', { attacker: ev.actorName, target: ev.targetName });
        color = '#ffcc00';
      } else {
        text = this.t('log_attack', { attacker: ev.actorName, target: ev.targetName, damage: ev.amount });
        color = ev.actorIsHero ? '#4caf50' : '#f44336';
        if (ev.isCrit) text = '🔥 ' + text;
        if (ev.targetDefeated) text += ` <span style="color:#ff3b30;font-weight:bold;">(DEAD 💀)</span>`;
      }
    } else if (ev.type === 'HEAL') {
      text = this.t('log_heal', { attacker: ev.actorName, target: ev.targetName, amount: ev.amount });
      color = '#03a9f4';
    } else if (ev.type === 'VAMP') {
      text = this.t('log_vamp', { actor: ev.actorName, amount: ev.amount });
      color = '#8bc34a';
    } else if (ev.type === 'TRAIT_REGEN') {
      text = this.t('log_regen', { target: ev.targetName, amount: ev.amount });
      color = '#8bc34a';
    } else if (ev.type === 'STATUS_TICK') {
      if (ev.effectType === 'poison') {
        text = this.t('log_poison', { target: ev.targetName, damage: ev.damage });
        color = '#9c27b0';
      } else if (ev.effectType === 'burn') {
        text = this.t('log_burn', { target: ev.targetName, damage: ev.damage });
        color = '#ff9800';
      }
    } else if (ev.type === 'STATUS_EXPIRED') {
      text = this.t('log_status_expired', { target: ev.targetName, effect: ev.effectType });
      color = '#888';
    } else if (ev.type === 'USE_CONSUMABLE') {
      const itemName = this.t(ev.consumableId) || ev.consumableId;
      const stat = ev.healType === 'HEAL_MP' ? 'MP' : 'HP';
      text = this.t('log_use_consumable', { attacker: ev.actorName, item: itemName, target: ev.targetName, amount: ev.amount, stat });
      color = '#00bcd4';
    } else {
      text = `[${ev.type}]`;
    }

    if (ev.targetHp !== undefined && ev.targetMaxHp !== undefined && !ev.targetDefeated) {
      text += ` <span style="color:#8e8e93;font-size:0.85em;">(HP: ${ev.targetHp}/${ev.targetMaxHp})</span>`;
    }

    return `<span style="color:${color};">${text}</span>`;
  }

  _animateLastEvents(battle) {
    const log = battle.log || [];
    if (this.lastLogLength !== undefined && log.length > this.lastLogLength) {
      const newEvents = log.slice(this.lastLogLength);
      newEvents.forEach(ev => {
        const targetName = ev.targetName;
        if (!targetName) return;
        if (ev.type === 'DAMAGE') {
          const text = ev.isMiss ? this.t('miss') : `-${ev.amount}`;
          const type = ev.isMiss ? 'miss' : 'damage';
          this._triggerVisualEffect(targetName, text, type);
        } else if (ev.type === 'HEAL' || ev.type === 'VAMP' || ev.type === 'TRAIT_REGEN' || ev.type === 'USE_CONSUMABLE') {
          const label = ev.type === 'USE_CONSUMABLE' && ev.healType === 'HEAL_MP' ? 'MP' : 'HP';
          const amount = ev.amount || ev.damage || 0;
          this._triggerVisualEffect(targetName, `+${amount} ${label}`, 'heal');
        } else if (ev.type === 'STATUS_TICK') {
          this._triggerVisualEffect(targetName, `-${ev.damage}`, 'damage');
        }
      });
    }
    this.lastLogLength = log.length;
  }

  _triggerVisualEffect(targetName, text, type) {
    const overlay = document.getElementById('combat-overlay');
    if (!overlay) return;
    const cards = overlay.querySelectorAll('.combat-card');
    let card = null;
    cards.forEach(c => {
      const nameEl = c.querySelector('.combat-card-name');
      if (nameEl && nameEl.textContent.trim() === targetName) {
        card = c;
      }
    });
    if (!card) return;

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
      numEl.style.cssText = `position:absolute;top:20%;left:50%;transform:translateX(-50%);font-weight:bold;font-size:1.4rem;color:${color};pointer-events:none;z-index:10;transition:top 1s,opacity 1s;`;
      effectContainer.appendChild(numEl);
      requestAnimationFrame(() => {
        numEl.style.top = '-30%';
        numEl.style.opacity = '0';
      });
      setTimeout(() => numEl.remove(), 1000);
    }
  }
}
