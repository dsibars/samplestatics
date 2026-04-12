import { Progression } from './models/Progression.js';
import { Hero } from './models/Hero.js';
import { Enemy } from './models/Enemy.js';
import { CombatManager } from './models/CombatManager.js';
import { t } from './i18n.js';

export class RPGGame {
    constructor() {
        this.currentCombat = null;
        this.currentEnemy = null;
        this.currentMilestone = Progression.prog.milestone;
        this.heroes = Progression.prog.heroes.map(h => new Hero(h));

        this.canvas = document.getElementById('combatCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    startAdventure() {
        this.currentMilestone = Math.floor(Progression.prog.milestone / 5) * 5;
        this.nextCombat();
    }

    nextCombat() {
        this.currentMilestone++;
        const level = Math.max(1, Math.floor(this.currentMilestone / 2));
        this.currentEnemy = Enemy.generate(level, this.currentMilestone);

        // Reset hero HP/MP for a new adventure if needed, or keep it?
        // For simplicity, let's restore some HP/MP between combats
        this.heroes.forEach(h => {
            if (h.hp > 0) {
                h.hp = Math.min(h.maxHp, h.hp + Math.floor(h.maxHp * 0.2));
                h.mp = Math.min(h.maxMp, h.mp + Math.floor(h.maxMp * 0.2));
            }
        });

        this.currentCombat = new CombatManager(
            this.heroes,
            this.currentEnemy,
            (result) => this.endCombat(result),
            (msg) => this.log(msg)
        );

        this.updateUI();
        this.currentCombat.nextTurn();
    }

    endCombat(result) {
        if (result === 'win') {
            const goldEarned = 10 * this.currentMilestone;
            const expEarned = 20 * this.currentMilestone;
            const coresEarned = this.currentEnemy.isBoss ? 5 : 0;

            Progression.addGold(goldEarned);
            Progression.addCores(coresEarned);
            Progression.setMilestone(this.currentMilestone);

            this.heroes.forEach(h => h.gainExp(expEarned));

            // Save hero states back to progression
            Progression.prog.heroes = this.heroes.map(h => h.toJSON());
            Progression.saveState();

            document.getElementById('victory-rewards').innerHTML = `
                <p>💰 +${goldEarned} Gold</p>
                <p>✨ +${expEarned} EXP for all heroes</p>
                ${coresEarned > 0 ? `<p>🔮 +${coresEarned} Cores</p>` : ''}
            `;
            document.getElementById('win-overlay').style.display = 'flex';
        } else {
            document.getElementById('defeat-rewards').innerHTML = `
                <p>Reached Milestone: ${this.currentMilestone}</p>
            `;
            document.getElementById('lose-overlay').style.display = 'flex';
        }
    }

    log(msg) {
        const logEl = document.getElementById('combat-log');
        const p = document.createElement('p');
        p.innerText = msg;
        logEl.appendChild(p);
        logEl.scrollTop = logEl.scrollHeight;

        // Show action panel if it's a hero's turn
        const participant = this.currentCombat.turnOrder[this.currentCombat.currentTurnIndex];
        if (participant instanceof Hero && participant.hp > 0 && !this.currentCombat.isCombatOver) {
            this.showActionPanel(participant);
        } else {
            document.getElementById('action-panel').style.display = 'none';
        }

        this.updateUI();
    }

    updateUI() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update Milestone
        document.getElementById('combat-milestone').innerText = `Milestone: ${this.currentMilestone}`;

        // Draw Enemy
        if (this.currentEnemy) {
            this.currentEnemy.draw(this.ctx, this.canvas.width / 2, this.canvas.height * 0.3);
        }

        // Draw Heroes
        const heroSpacing = this.canvas.width / (this.heroes.length + 1);
        this.heroes.forEach((h, i) => {
            const isTurn = this.currentCombat && this.currentCombat.turnOrder[this.currentCombat.currentTurnIndex] === h;
            h.draw(this.ctx, heroSpacing * (i + 1), this.canvas.height * 0.7, isTurn);
        });
    }

    showActionPanel(hero) {
        const panel = document.getElementById('action-panel');
        panel.style.display = 'flex';
        document.getElementById('active-hero-name').innerText = `${hero.name}'s Turn`;

        const skillBtnContainer = document.getElementById('skill-buttons');
        skillBtnContainer.innerHTML = '';
        hero.skills.forEach(skill => {
            const btn = document.createElement('button');
            btn.className = 'menu-btn secondary';
            btn.style = 'padding: 5px; font-size: 0.7rem; flex: 1;';
            btn.innerText = t(skill);
            btn.onclick = () => {
                this.currentCombat.heroAction(hero, skill, this.currentEnemy);
            };
            skillBtnContainer.appendChild(btn);
        });

        const itemBtnContainer = document.getElementById('item-buttons');
        itemBtnContainer.innerHTML = '';
        ['tiny_potion', 'tiny_mana_potion'].forEach(itemId => {
            const count = Progression.prog.inventory[itemId] || 0;
            const btn = document.createElement('button');
            btn.className = 'menu-btn secondary';
            btn.style = 'padding: 5px; font-size: 0.7rem; flex: 1;';
            btn.innerHTML = `${t(itemId)} (${count})`;
            btn.disabled = count <= 0;
            btn.onclick = () => {
                if (Progression.useItem(itemId)) {
                    this.currentCombat.useItem(hero, itemId);
                }
            };
            itemBtnContainer.appendChild(btn);
        });
    }
}
