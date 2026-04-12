export class CombatManager {
    constructor(heroes, enemy, onCombatEnd, onLog) {
        this.heroes = heroes; // Array of Hero objects
        this.enemy = enemy;   // Enemy object
        this.onCombatEnd = onCombatEnd;
        this.onLog = onLog;

        this.turnOrder = [];
        this.currentTurnIndex = 0;
        this.isCombatOver = false;

        this.initTurnOrder();
    }

    initTurnOrder() {
        this.turnOrder = [...this.heroes, this.enemy].sort((a, b) => b.speed - a.speed);
    }

    nextTurn() {
        if (this.isCombatOver) return;

        const participant = this.turnOrder[this.currentTurnIndex];

        if (participant.hp <= 0) {
            this.advanceTurn();
            return;
        }

        if (participant === this.enemy) {
            this.enemyTurn();
        } else {
            // Wait for player input
            this.onLog(`It's ${participant.name}'s turn!`);
        }
    }

    advanceTurn() {
        if (this.checkCombatEnd()) return;
        this.currentTurnIndex = (this.currentTurnIndex + 1) % this.turnOrder.length;
        this.nextTurn();
    }

    checkCombatEnd() {
        if (this.enemy.hp <= 0) {
            this.isCombatOver = true;
            this.onCombatEnd('win');
            return true;
        }

        const allHeroesDead = this.heroes.every(h => h.hp <= 0);
        if (allHeroesDead) {
            this.isCombatOver = true;
            this.onCombatEnd('lose');
            return true;
        }

        return false;
    }

    heroAction(hero, action, target) {
        if (this.isCombatOver) return;

        let damage = 0;
        let logMsg = '';

        if (action === 'basic_attack') {
            damage = Math.max(1, hero.strength - this.enemy.defense);
            this.enemy.hp -= damage;
            logMsg = `${hero.name} attacks ${this.enemy.name} for ${damage} damage!`;
        } else if (action === 'double_attack') {
            if (hero.mp >= 10) {
                hero.mp -= 10;
                const hit1 = Math.max(1, hero.strength - this.enemy.defense);
                const hit2 = Math.max(1, hero.strength - this.enemy.defense);
                damage = hit1 + hit2;
                this.enemy.hp -= damage;
                logMsg = `${hero.name} uses Double Attack! Hits for ${hit1} and ${hit2} damage!`;
            } else {
                this.onLog('Not enough MP!');
                return;
            }
        } else if (action === 'basic_ice_ball') {
            if (hero.mp >= 15) {
                hero.mp -= 15;
                damage = Math.max(1, hero.magicPower * 1.5 - this.enemy.defense * 0.5);
                this.enemy.hp -= damage;
                logMsg = `${hero.name} casts Ice Ball! Deals ${Math.floor(damage)} magic damage!`;
            } else {
                this.onLog('Not enough MP!');
                return;
            }
        }

        this.onLog(logMsg);
        setTimeout(() => this.advanceTurn(), 500);
    }

    useItem(hero, itemId) {
        if (this.isCombatOver) return;

        if (itemId === 'tiny_potion') {
            const heal = Math.floor(hero.maxHp * 0.3);
            hero.hp = Math.min(hero.maxHp, hero.hp + heal);
            this.onLog(`${hero.name} uses Potion and heals ${heal} HP!`);
        } else if (itemId === 'tiny_mana_potion') {
            const restore = Math.floor(hero.maxMp * 0.3);
            hero.mp = Math.min(hero.maxMp, hero.mp + restore);
            this.onLog(`${hero.name} uses Mana Potion and restores ${restore} MP!`);
        }

        setTimeout(() => this.advanceTurn(), 500);
    }

    enemyTurn() {
        const aliveHeroes = this.heroes.filter(h => h.hp > 0);
        if (aliveHeroes.length === 0) return;

        const target = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
        const damage = Math.max(1, this.enemy.strength - target.defense);
        target.hp -= damage;
        this.onLog(`${this.enemy.name} attacks ${target.name} for ${damage} damage!`);

        setTimeout(() => this.advanceTurn(), 1000);
    }
}
