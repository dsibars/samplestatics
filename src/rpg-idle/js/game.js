import { Progression } from './models/Progression.js';
import { Hero } from './models/Hero.js';
import { Enemy } from './models/Enemy.js';
import { CombatManager } from './models/CombatManager.js';
import { Particle } from './models/Particle.js';
import { FloatingText } from './models/FloatingText.js';
import { t } from './i18n.js';
import { SKILLS_DATA } from './constants.js';

export class RPGGame {
    constructor() {
        this.currentCombat = null;
        this.enemies = [];
        this.currentMilestone = Progression.prog.milestone;
        
        this.activeIndices = Progression.prog.activeHeroIndices;
        this.heroes = this.activeIndices.map(idx => new Hero(Progression.prog.heroes[idx]));
        
        this.autoBattle = !!Progression.prog.autoBattle;
        const toggle = document.getElementById('autobattle-toggle');
        if (toggle) {
            toggle.checked = this.autoBattle;
        }

        this.canvas = document.getElementById('combatCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.particles = [];
        this.floatingTexts = [];
        this.lastTime = 0;
        this.isRunning = false;
        this.screenFlash = { color: '#ff0000', life: 0 };
        this.lastActionTime = 0;

        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        if (this.enemies.length > 0 || this.currentEvent) {
            this.updateUI();
        }
    }

    startAdventure() {
        this.currentMilestone = Math.floor(Progression.prog.milestone / 5) * 5;
        this.heroes.forEach(h => {
            h.recalculateStats();
            h.hp = h.maxHp;
            h.mp = h.maxMp;
        });
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
        this.nextCombat();
    }

    stop() {
        this.isRunning = false;
    }

    loop(timestamp) {
        if (!this.isRunning) return;
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(dt);
        this.draw();
        
        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        if (this.screenFlash.life > 0) {
            this.screenFlash.life -= dt;
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) this.particles.splice(i, 1);
        }
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            this.floatingTexts[i].update();
            if (this.floatingTexts[i].life <= 0) this.floatingTexts.splice(i, 1);
        }
    }

    nextCombat() {
        this.currentMilestone++;

        // Randomly encounter an event every 5 milestones, but not on boss milestones
        const isBossMilestone = this.currentMilestone % 10 === 0;
        const isEventMilestone = this.currentMilestone % 5 === 0 && !isBossMilestone;

        if (isEventMilestone) {
            this.triggerEvent();
            return;
        }

        this.enemies = Enemy.generateGroup(this.currentMilestone);

        this.heroes.forEach(h => {
            if (h.hp > 0) {
                h.hp = Math.min(h.maxHp, h.hp + Math.floor(h.maxHp * 0.2));
                h.mp = Math.min(h.maxMp, h.mp + Math.floor(h.maxMp * 0.2));
            }
        });

        if (this.currentCombat) {
            this.currentCombat.stop();
        }

        const toggle = document.getElementById('autobattle-toggle');
        if (toggle) toggle.checked = this.autoBattle;

        this.currentCombat = new CombatManager(this, this.heroes, this.enemies);

        this.updateUI();
        setTimeout(() => this.currentCombat.nextTurn(), 1000);
    }

    triggerEvent() {
        const events = [
            {
                id: 'forsaken_shrine',
                options: [
                    { id: 'pray' },
                    { id: 'desecrate' }
                ]
            },
            {
                id: 'hidden_cache',
                options: [
                    { id: 'careful' },
                    { id: 'smash' }
                ]
            },
            {
                id: 'mystic_fountain',
                options: [
                    { id: 'drink' },
                    { id: 'ignore' }
                ]
            }
        ];

        const event = events[Math.floor(Math.random() * events.length)];
        this.currentEvent = event;
        this.showEventUI(event);
    }

    showEventUI(event) {
        const overlay = document.createElement('div');
        overlay.id = 'event-overlay';
        overlay.style = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center;
            z-index: 2000; padding: 20px; box-sizing: border-box;
        `;

        const content = document.createElement('div');
        content.style = `
            background: #111; border: 2px solid var(--primary); border-radius: 12px;
            padding: 30px; max-width: 500px; width: 100%; text-align: center;
        `;

        content.innerHTML = `
            <h2 style="color: var(--primary); margin-top: 0;">${t(event.id) || event.title}</h2>
            <p style="color: white; font-size: 1.1rem; line-height: 1.6; margin: 20px 0;">${t(event.id + '_desc') || event.desc}</p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                ${event.options.map(opt => `
                    <button class="menu-btn primary" style="padding: 15px;" onclick="window.game.handleEventChoice('${opt.id}')">
                        <div style="font-weight: bold;">${t('opt_' + opt.id) || opt.label}</div>
                        <div style="font-size: 0.8rem; opacity: 0.8;">${t('opt_' + opt.id + '_desc') || opt.desc}</div>
                    </button>
                `).join('')}
            </div>
        `;

        overlay.appendChild(content);
        document.body.appendChild(overlay);
        window.game = this; // Expose for click handler
    }

    handleEventChoice(choiceId) {
        let msgKey = "";
        let msgParams = {};

        if (choiceId === 'pray') {
            this.heroes.forEach(h => h.hp = h.maxHp);
            msgKey = "event_shrine_pray_res";
        } else if (choiceId === 'desecrate') {
            this.heroes.forEach(h => {
                const dmg = Math.floor(h.maxHp * 0.2);
                h.hp = Math.max(1, h.hp - dmg);
            });
            Progression.addCores(5);
            msgKey = "event_shrine_desecrate_res";
        } else if (choiceId === 'careful') {
            Progression.addGold(100);
            msgKey = "event_cache_careful_res";
        } else if (choiceId === 'smash') {
            if (Math.random() < 0.3) {
                this.heroes.forEach(h => {
                    const dmg = Math.floor(h.maxHp * 0.15);
                    h.hp = Math.max(1, h.hp - dmg);
                });
                msgKey = "event_cache_smash_trap_res";
            } else {
                msgKey = "event_cache_smash_ok_res";
            }
            Progression.addGold(300);
        } else if (choiceId === 'drink') {
            const h = this.heroes[Math.floor(Math.random() * this.heroes.length)];
            h.statPoints += 1;
            msgKey = "event_fountain_drink_res";
            msgParams = { hero: h.name };
        } else if (choiceId === 'ignore') {
            msgKey = "event_ignore_res";
        }

        document.getElementById('event-overlay').remove();
        
        let finalMsg = t(msgKey);
        for (let k in msgParams) {
            finalMsg = finalMsg.replace(`{${k}}`, msgParams[k]);
        }

        window.showResultModal(t(this.currentEvent.id), finalMsg, () => {
            this.currentEvent = null;
            this.nextCombat();
        });
    }

    endCombat(result, goldBonus = 1.0) {
        this.popupOpenTime = performance.now();
        let levelUps = [];

        if (result === 'win') {
            const goldEarned = Math.floor(10 * this.currentMilestone * goldBonus);
            const expEarned = 20 * this.currentMilestone;
            const coresEarned = this.enemies.some(e => e.isBoss) ? 5 : 0;

            Progression.addGold(goldEarned);
            Progression.addCores(coresEarned);
            Progression.setMilestone(this.currentMilestone);

            const numActive = this.heroes.length;
            const splitMultipliers = { 1: 1.0, 2: 0.8, 3: 0.7, 4: 0.6 };
            const multiplier = splitMultipliers[numActive] || 1.0;
            const finalExp = Math.floor(expEarned * multiplier);

            this.heroes.forEach(h => {
                const leveled = h.gainExp(finalExp);
                if (leveled) levelUps.push({ name: h.name, level: h.level });
            });

            const gymLevel = Progression.prog.village.gymLevel || 0;
            const passiveExp = Math.floor(expEarned * (gymLevel / 100));

            const fullRoster = Progression.prog.heroes;
            fullRoster.forEach((hData, idx) => {
                const isActive = this.activeIndices.includes(idx);
                if (isActive) {
                    const heroObj = this.heroes[this.activeIndices.indexOf(idx)];
                    fullRoster[idx] = heroObj.toJSON();
                } else if (passiveExp > 0) {
                    const hObj = new Hero(hData);
                    const leveled = hObj.gainExp(passiveExp);
                    fullRoster[idx] = hObj.toJSON();
                    if (leveled) levelUps.push({ name: hObj.name, level: hObj.level, passive: true });
                }
            });

            Progression.saveState();

            const levelUpMessages = levelUps.map(lu => 
                `<p style="color: #0af; font-weight: bold;">${t('log_level_up').replace('{hero}', lu.name).replace('{level}', lu.level)}</p>`
            ).join('');

            document.getElementById('victory-rewards').innerHTML = `
                <p>💰 +${goldEarned.toFixed(2).replace(/\.00$/, '')} ${t('gold')}</p>
                <p>✨ +${expEarned.toFixed(2).replace(/\.00$/, '')} ${t('exp_for_heroes')}</p>
                ${coresEarned > 0 ? `<p>🔮 +${coresEarned.toFixed(2).replace(/\.00$/, '')} ${t('cores')}</p>` : ''}
                ${levelUpMessages}
            `;
            document.getElementById('win-overlay').style.display = 'flex';

            if (this.currentCombat && this.currentCombat.oneShotJumpPossible) {
                setTimeout(() => {
                    if (confirm(t('oneshot_jump_confirm'))) {
                        this.currentMilestone += 10;
                        Progression.setMilestone(this.currentMilestone);
                        this.log(`>>> ${t('oneshot_jump_confirm')} YES! Skipping 10 levels...`);
                    }
                }, 500);
            }
        } else {
            const totalMaxHp = this.enemies.reduce((sum, e) => sum + e.maxHp, 0);
            const totalCurrentHp = this.enemies.reduce((sum, e) => sum + Math.max(0, e.hp), 0);
            const damageDealt = totalMaxHp - totalCurrentHp;

            const expPotential = 20 * this.currentMilestone;
            let expEarned = Math.floor((damageDealt / totalMaxHp) * expPotential);
            if (damageDealt > 0) expEarned = Math.max(1, expEarned);

            if (expEarned > 0) {
                const numActive = this.heroes.length;
                const splitMultipliers = { 1: 1.0, 2: 0.8, 3: 0.7, 4: 0.6 };
                const multiplier = splitMultipliers[numActive] || 1.0;
                const finalExp = Math.floor(expEarned * multiplier);

                this.heroes.forEach(h => {
                    const leveled = h.gainExp(finalExp);
                    if (leveled) levelUps.push({ name: h.name, level: h.level });
                });

                const gymLevel = Progression.prog.village.gymLevel || 0;
                const passiveExp = Math.floor(expEarned * (gymLevel / 100));

                const fullRoster = Progression.prog.heroes;
                fullRoster.forEach((hData, idx) => {
                    const isActive = this.activeIndices.includes(idx);
                    if (isActive) {
                        const heroObj = this.heroes[this.activeIndices.indexOf(idx)];
                        fullRoster[idx] = heroObj.toJSON();
                    } else if (passiveExp > 0) {
                        const hObj = new Hero(hData);
                        const leveled = hObj.gainExp(passiveExp);
                        fullRoster[idx] = hObj.toJSON();
                        if (leveled) levelUps.push({ name: hObj.name, level: hObj.level, passive: true });
                    }
                });

                Progression.saveState();
            }

            const levelUpMessages = levelUps.map(lu => 
                `<p style="color: #0af; font-weight: bold;">${t('log_level_up').replace('{hero}', lu.name).replace('{level}', lu.level)} ${lu.passive ? '(Gym)' : ''}</p>`
            ).join('');

            document.getElementById('defeat-rewards').innerHTML = `
                <p>${t('milestone')}: ${this.currentMilestone}</p>
                ${expEarned > 0 ? `<p>✨ +${expEarned.toFixed(2).replace(/\.00$/, '')} ${t('exp_for_heroes')}</p>` : ''}
                ${levelUpMessages}
            `;
            document.getElementById('lose-overlay').style.display = 'flex';
        }
    }

    toggleCombatLog() {
        const log = document.getElementById('combat-log');
        const text = document.getElementById('log-toggle-text');
        
        if (log.style.display === 'none') {
            log.style.display = 'block';
            text.innerText = t('hide_logs');
        } else {
            log.style.display = 'none';
            text.innerText = t('show_logs');
        }
    }

    log(msg, color = null) {
        const logEl = document.getElementById('combat-log');
        const p = document.createElement('p');
        p.style.margin = '2px 0';
        if (color) p.style.color = color;
        p.innerHTML = msg;
        logEl.appendChild(p);
        logEl.scrollTop = logEl.scrollHeight;

        const participant = this.currentCombat?.turnOrder[this.currentCombat.currentTurnIndex];
        if (!(participant instanceof Hero) || participant.hp <= 0 || this.currentCombat?.isCombatOver) {
            document.getElementById('action-panel').style.display = 'none';
        }

        this.updateUI();
    }

    updateUI() {
        document.getElementById('combat-milestone').innerText = `${t('milestone')}: ${this.currentMilestone}`;
        if (!this.isRunning) this.draw();
    }

    getEnemyPositions() {
        const count = this.enemies.length;
        const positions = [];
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height * 0.3;
        const spacing = 60;

        if (count === 1) {
            positions.push({ x: centerX, y: centerY });
        } else if (count === 2) {
            positions.push({ x: centerX - spacing, y: centerY });
            positions.push({ x: centerX + spacing, y: centerY });
        } else if (count === 3) {
            positions.push({ x: centerX, y: centerY - spacing / 2 });
            positions.push({ x: centerX - spacing, y: centerY + spacing / 2 });
            positions.push({ x: centerX + spacing, y: centerY + spacing / 2 });
        } else if (count === 4) {
            positions.push({ x: centerX - spacing, y: centerY - spacing / 2 });
            positions.push({ x: centerX + spacing, y: centerY - spacing / 2 });
            positions.push({ x: centerX - spacing, y: centerY + spacing / 2 });
            positions.push({ x: centerX + spacing, y: centerY + spacing / 2 });
        }
        return positions;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.currentEvent) {
             this.ctx.fillStyle = '#fff';
             this.ctx.font = '24px Outfit';
             this.ctx.textAlign = 'center';
             this.ctx.fillText("EVENT ENCOUNTER", this.canvas.width/2, this.canvas.height/2);
             return;
        }

        const enemyPos = this.getEnemyPositions();
        this.enemies.forEach((e, i) => {
            const isTurn = this.currentCombat && this.currentCombat.turnOrder[this.currentCombat.currentTurnIndex] === e;
            e.draw(this.ctx, enemyPos[i].x, enemyPos[i].y, isTurn);
        });

        const heroSpacing = this.canvas.width / (this.heroes.length + 1);
        this.heroes.forEach((h, i) => {
            const isTurn = this.currentCombat && this.currentCombat.turnOrder[this.currentCombat.currentTurnIndex] === h;
            h.draw(this.ctx, heroSpacing * (i + 1), this.canvas.height * 0.7, isTurn);
        });

        this.particles.forEach(p => p.draw(this.ctx));
        this.floatingTexts.forEach(ft => ft.draw(this.ctx));

        if (this.screenFlash.life > 0) {
            this.ctx.fillStyle = this.screenFlash.color;
            this.ctx.globalAlpha = Math.max(0, Math.min(1, this.screenFlash.life / 200));
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalAlpha = 1.0;
        }
    }

    triggerFlash(color = '#ff0000', duration = 200) {
        this.screenFlash = { color, life: duration };
    }

    onDamage(target, amount) {
        this.addFloatingText(target, `-${amount}`, '#ff0000');
    }

    onHeal(target, amount) {
        this.addFloatingText(target, `+${amount}`, '#00ff00');
    }

    addFloatingText(target, text, color) {
        let x, y;
        const enemyIndex = this.enemies.indexOf(target);
        if (enemyIndex > -1) {
            const pos = this.getEnemyPositions()[enemyIndex];
            x = pos.x;
            y = pos.y;
        } else {
            const index = this.heroes.indexOf(target);
            const heroSpacing = this.canvas.width / (this.heroes.length + 1);
            x = heroSpacing * (index + 1);
            y = this.canvas.height * 0.7;
        }
        x += (Math.random() - 0.5) * 20;
        y += (Math.random() - 0.5) * 20;
        this.floatingTexts.push(new FloatingText(x, y, text, color));
    }

    onDeath(target) {
        let x, y, color;
        const enemyIndex = this.enemies.indexOf(target);
        if (enemyIndex > -1) {
            const pos = this.getEnemyPositions()[enemyIndex];
            x = pos.x;
            y = pos.y;
            color = target.isBoss ? '#f0f' : '#f00';
        } else {
            const index = this.heroes.indexOf(target);
            const heroSpacing = this.canvas.width / (this.heroes.length + 1);
            x = heroSpacing * (index + 1);
            y = this.canvas.height * 0.7;
            color = target.type === 'warrior' ? '#0af' : '#a0f';
        }

        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    handleCanvasClick(e) {
        if (!this.currentCombat || this.currentCombat.isCombatOver) return;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const enemyPos = this.getEnemyPositions();
        this.enemies.forEach((enemy, i) => {
            if (enemy.hp <= 0) return;
            const pos = enemyPos[i];
            const dx = mouseX - pos.x;
            const dy = mouseY - pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 30) {
                this.currentCombat.setTargetIndex(i);
            }
        });
    }

    showActionPanel(hero) {
        const panel = document.getElementById('action-panel');
        panel.style.display = 'flex';
        this.renderActionLevel1(hero, panel);
    }

    renderActionLevel1(hero, panel) {
        const itemDisabled = this.currentCombat && this.currentCombat.itemUsedThisTurn;
        this.renderDynamicGrid(panel, [
            { id: 'skills', icon: '🛡️', onclick: () => this.renderActionSkills(hero) },
            { id: 'items', icon: '🎒', onclick: () => this.renderActionItems(hero, panel), disabled: itemDisabled }
        ]);
    }

    renderActionSkills(hero) {
        const panel = document.getElementById('action-panel');
        const options = Object.keys(hero.skills).map(skillId => {
            const skill = SKILLS_DATA[skillId];
            return {
                id: skillId,
                extra: `${skill.mpCost} MP`,
                disabled: hero.mp < skill.mpCost,
                onclick: () => {
                    if (skill.targetType === 'single_enemy') {
                        this.renderTargetSelection(hero, skillId, 'enemies');
                    } else if (skill.targetType === 'single_ally') {
                        this.renderTargetSelection(hero, skillId, 'allies');
                    } else {
                        panel.style.display = 'none';
                        this.currentCombat.heroAction(hero, skillId);
                    }
                }
            };
        });

        this.renderDynamicGrid(panel, options, '🛡️ ' + t('skills'), () => this.showActionPanel(hero));
    }

    renderTargetSelection(hero, skillId, type) {
        const panel = document.getElementById('action-panel');
        let targets = type === 'allies' ? this.heroes : this.enemies;

        const options = targets.map((t, index) => ({
            label: t.name,
            extra: `${Math.ceil(t.hp)}/${t.maxHp} HP`,
            disabled: t.hp <= 0,
            color: type === 'allies' ? '#0f0' : '#f00',
            onclick: () => {
                panel.style.display = 'none';
                this.currentCombat.heroAction(hero, skillId, index);
            }
        }));

        this.renderDynamicGrid(panel, options, '🎯 ' + t('select_target'), () => this.renderActionSkills(hero));
    }

    renderActionItems(hero, panel) {
        const options = Object.keys(Progression.prog.inventory).sort().filter(itemId => Progression.prog.inventory[itemId] > 0).map(itemId => ({
            id: itemId,
            extra: `Qty: ${Progression.prog.inventory[itemId]}`,
            onclick: () => {
                if (Progression.useItem(itemId)) {
                    panel.style.display = 'none';
                    this.currentCombat.useItem(hero, itemId);
                }
            }
        }));

        this.renderDynamicGrid(panel, options, '🎒 ' + t('items'), () => this.showActionPanel(hero));
    }

    renderDynamicGrid(panel, options, title = '', backFn = null) {
        panel.innerHTML = '';
        if (title) {
            const header = document.createElement('div');
            header.style = 'font-weight:bold; color:var(--primary); margin-bottom:10px; text-align:center;';
            header.innerText = title;
            panel.appendChild(header);
        }

        const items = [...options];
        if (backFn) {
            items.push({ 
                id: 'options_back', 
                icon: '🔙', 
                onclick: backFn, 
                color: '#aaa',
                isBack: true
            });
        }

        const grid = document.createElement('div');
        const N = items.length;
        let cols = 3;
        if (N <= 3) cols = N;
        else if (N === 4) cols = 2;
        
        grid.style = `display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 8px; flex: 1; min-height: 0;`;

        items.forEach(opt => {
            const btn = document.createElement('div');
            const isDisabled = opt.disabled || false;
            
            btn.style = `
                border: 2px solid ${opt.isBack ? '#444' : 'var(--primary)'};
                border-radius: 8px;
                background: rgba(255,255,255,0.05);
                color: #fff;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: ${isDisabled ? 'default' : 'pointer'};
                padding: 8px 4px;
                text-align: center;
                font-size: 0.9rem;
                opacity: ${isDisabled ? '0.4' : '1'};
                transition: transform 0.1s;
                min-height: 60px;
                box-sizing: border-box;
            `;

            if (!isDisabled) {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    if (performance.now() - this.lastActionTime < 300) return;
                    this.lastActionTime = performance.now();
                    opt.onclick();
                };
                btn.onmousedown = () => btn.style.transform = 'scale(0.95)';
                btn.onmouseup = () => btn.style.transform = 'scale(1)';
            }

            const labelText = opt.label || (opt.id ? t(opt.id) : '');
            
            if (opt.icon) {
                btn.innerHTML = `<span style="font-size: 1.4rem; margin-bottom: 2px;">${opt.icon}</span><span style="font-weight:bold;">${labelText}</span>`;
            } else {
                btn.innerHTML = `
                    <div style="font-weight:bold; margin-bottom: 2px; line-height: 1.1;">${labelText}</div>
                    ${opt.extra ? `<div style="font-size: 0.75rem; color: ${opt.color || '#0af'};">${opt.extra}</div>` : ''}
                `;
            }

            grid.appendChild(btn);
        });

        panel.appendChild(grid);
    }
}
