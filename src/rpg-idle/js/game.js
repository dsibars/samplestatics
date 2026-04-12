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
        this.currentEnemy = null;
        this.currentMilestone = Progression.prog.milestone;
        this.heroes = Progression.prog.heroes.map(h => new Hero(h));
        
        this.autoBattle = false;
        const toggle = document.getElementById('autobattle-toggle');
        if (toggle) toggle.checked = this.autoBattle;

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
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        if (this.currentEnemy) {
            this.updateUI();
        }
    }

    startAdventure() {
        this.currentMilestone = Math.floor(Progression.prog.milestone / 5) * 5;
        // Restore all heroes to full health/mana when starting a fresh run from the village
        this.heroes.forEach(h => {
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
        const level = Math.max(1, Math.floor(this.currentMilestone / 2));
        this.currentEnemy = Enemy.generate(level, this.currentMilestone);

        this.heroes.forEach(h => {
            if (h.hp > 0) {
                h.hp = Math.min(h.maxHp, h.hp + Math.floor(h.maxHp * 0.2));
                h.mp = Math.min(h.maxMp, h.mp + Math.floor(h.maxMp * 0.2));
            }
        });

        if (this.currentCombat) {
            this.currentCombat.stop();
        }
        this.currentCombat = new CombatManager(this, this.heroes, this.currentEnemy);

        this.autoBattle = false;
        const toggle = document.getElementById('autobattle-toggle');
        if (toggle) toggle.checked = false;

        this.updateUI();
        // Give the user a moment to see the setup before starting the first turn
        setTimeout(() => this.currentCombat.nextTurn(), 1000);
    }

    endCombat(result) {
        this.popupOpenTime = performance.now();
        let levelUps = [];

        if (result === 'win') {
            const goldEarned = 10 * this.currentMilestone;
            const expEarned = 20 * this.currentMilestone;
            const coresEarned = this.currentEnemy.isBoss ? 5 : 0;

            Progression.addGold(goldEarned);
            Progression.addCores(coresEarned);
            Progression.setMilestone(this.currentMilestone);

            this.heroes.forEach(h => {
                const leveled = h.gainExp(expEarned);
                if (leveled) levelUps.push({ name: h.name, level: h.level });
            });

            // Save hero states back to progression
            Progression.prog.heroes = this.heroes.map(h => h.toJSON());
            Progression.saveState();

            const levelUpMessages = levelUps.map(lu => 
                `<p style="color: #0af; font-weight: bold;">${t('log_level_up').replace('{hero}', lu.name).replace('{level}', lu.level)}</p>`
            ).join('');

            document.getElementById('victory-rewards').innerHTML = `
                <p>💰 +${goldEarned} ${t('gold')}</p>
                <p>✨ +${expEarned} ${t('exp_for_heroes')}</p>
                ${coresEarned > 0 ? `<p>🔮 +${coresEarned} ${t('cores')}</p>` : ''}
                ${levelUpMessages}
            `;
            document.getElementById('win-overlay').style.display = 'flex';
        } else {
            const damageDealt = this.currentEnemy.maxHp - this.currentEnemy.hp;
            const expPotential = 20 * this.currentMilestone;
            let expEarned = Math.floor((damageDealt / this.currentEnemy.maxHp) * expPotential);
            if (damageDealt > 0) expEarned = Math.max(1, expEarned);

            if (expEarned > 0) {
                this.heroes.forEach(h => {
                    const leveled = h.gainExp(expEarned);
                    if (leveled) levelUps.push({ name: h.name, level: h.level });
                });
                // Save hero states back to progression
                Progression.prog.heroes = this.heroes.map(h => h.toJSON());
                Progression.saveState();
            }

            const levelUpMessages = levelUps.map(lu => 
                `<p style="color: #0af; font-weight: bold;">${t('log_level_up').replace('{hero}', lu.name).replace('{level}', lu.level)}</p>`
            ).join('');

            document.getElementById('defeat-rewards').innerHTML = `
                <p>${t('milestone')}: ${this.currentMilestone}</p>
                ${expEarned > 0 ? `<p>✨ +${expEarned} ${t('exp_for_heroes')}</p>` : ''}
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

    log(msg) {
        const logEl = document.getElementById('combat-log');
        const p = document.createElement('p');
        p.innerText = msg;
        logEl.appendChild(p);
        logEl.scrollTop = logEl.scrollHeight;

        const participant = this.currentCombat.turnOrder[this.currentCombat.currentTurnIndex];
        if (!(participant instanceof Hero) || participant.hp <= 0 || this.currentCombat.isCombatOver) {
            document.getElementById('action-panel').style.display = 'none';
        }

        this.updateUI();
    }

    updateUI() {
        document.getElementById('combat-milestone').innerText = `${t('milestone')}: ${this.currentMilestone}`;
        if (!this.isRunning) this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.currentEnemy) {
            const isTurn = this.currentCombat && this.currentCombat.turnOrder[this.currentCombat.currentTurnIndex] === this.currentEnemy;
            this.currentEnemy.draw(this.ctx, this.canvas.width / 2, this.canvas.height * 0.3, isTurn);
        }

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
        let x, y;
        if (target === this.currentEnemy) {
            x = this.canvas.width / 2;
            y = this.canvas.height * 0.3;
        } else {
            const index = this.heroes.indexOf(target);
            const heroSpacing = this.canvas.width / (this.heroes.length + 1);
            x = heroSpacing * (index + 1);
            y = this.canvas.height * 0.7;
        }
        x += (Math.random() - 0.5) * 20;
        y += (Math.random() - 0.5) * 20;
        this.floatingTexts.push(new FloatingText(x, y, `-${amount}`, '#ff0000'));
    }

    onDeath(target) {
        let x, y, color;
        if (target === this.currentEnemy) {
            x = this.canvas.width / 2;
            y = this.canvas.height * 0.3;
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

    showActionPanel(hero) {
        const panel = document.getElementById('action-panel');
        panel.style.display = 'flex';
        this.renderActionLevel1(hero, panel);
    }

    renderActionLevel1(hero, panel) {
        this.renderDynamicGrid(panel, [
            { id: 'skills', icon: '🛡️', onclick: () => this.renderActionSkills(hero) },
            { id: 'items', icon: '🎒', onclick: () => this.renderActionItems(hero, panel) }
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
                    if (skill.targetType === 'ally') {
                        this.renderTargetSelection(hero, skillId);
                    } else {
                        panel.style.display = 'none';
                        this.currentCombat.heroAction(hero, skillId);
                    }
                }
            };
        });

        this.renderDynamicGrid(panel, options, '🛡️ ' + t('skills'), () => this.showActionPanel(hero));
    }

    renderTargetSelection(hero, skillId) {
        const panel = document.getElementById('action-panel');
        const options = this.heroes.map((h, index) => ({
            label: h.name,
            extra: `${Math.ceil(h.hp)}/${h.maxHp} HP`,
            disabled: h.hp <= 0,
            color: '#0f0',
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
