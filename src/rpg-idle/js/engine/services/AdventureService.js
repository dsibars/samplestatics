import { Result } from '../core/Result.js';
import { Enemy } from '../models/Enemy.js';

export class AdventureService {
    constructor(playerService, heroService, battleService) {
        this.player = playerService;
        this.heroes = heroService;
        this.battle = battleService;
        this.currentMilestone = this.player.milestone;
    }

    startAdventure() {
        const activeHeroes = this.heroes.list('active');
        if (activeHeroes.length === 0) return Result.fail('error_no_active_heroes');

        // Heal heroes for adventure start
        activeHeroes.forEach(h => {
            h.hp = h.maxHp;
            h.mp = h.maxMp;
        });

        return this.nextStep();
    }

    nextStep() {
        this.currentMilestone++;

        // Check for event
        if (this.currentMilestone % 5 === 0 && this.currentMilestone % 10 !== 0) {
            return this._generateEvent();
        }

        return this._generateBattle();
    }

    _generateBattle() {
        const enemies = this._generateEnemies(this.currentMilestone);
        const activeHeroes = this.heroes.list('active');

        this.battle.startBattle(activeHeroes, enemies, this.player.autoBattle);

        return Result.ok({
            type: 'BATTLE',
            milestone: this.currentMilestone,
            enemies: enemies.map(e => e.toJSON())
        });
    }

    _generateEnemies(milestone) {
        const level = Math.max(1, Math.floor(milestone / 2));
        const isBossMilestone = milestone % 10 === 0 && milestone > 0;

        let count = 1;
        if (!isBossMilestone) {
            if (milestone < 5) count = 1;
            else if (milestone < 15) count = Math.random() < 0.7 ? 1 : 2;
            else count = Math.random() < 0.4 ? 1 : (Math.random() < 0.8 ? 2 : 3);
        }

        const enemies = [];
        for (let i = 0; i < count; i++) {
            const isBoss = isBossMilestone && i === 0;
            const mult = 1 + (level - 1) * 0.2;
            const bossMult = isBoss ? 4.0 : 1.0;

            enemies.push(new Enemy({
                name: (isBoss ? 'BOSS: ' : '') + 'Monster ' + (i + 1),
                level,
                maxHp: Math.floor(20 * mult * bossMult),
                strength: Math.floor(5 * mult * bossMult),
                speed: Math.floor(3 * mult * (isBoss ? 1.5 : 1.0)),
                defense: Math.floor(2 * mult * bossMult),
                isBoss
            }));
        }

        return enemies;
    }

    _generateEvent() {
        const events = ['forsaken_shrine', 'hidden_cache', 'mystic_fountain'];
        const eventId = events[Math.floor(Math.random() * events.length)];

        return Result.ok({
            type: 'EVENT',
            milestone: this.currentMilestone,
            eventId: eventId
        });
    }

    handleEventChoice(eventId, choiceId) {
        // Logic for event outcomes
        // This mirrors handleEventChoice in legacy game.js
        let reward = null;

        if (eventId === 'forsaken_shrine' && choiceId === 'pray') {
            this.heroes.list('active').forEach(h => h.hp = h.maxHp);
            reward = { type: 'HEAL_ALL' };
        } else if (eventId === 'hidden_cache' && choiceId === 'careful') {
            this.player.addGold(100);
            reward = { type: 'GOLD', amount: 100 };
        }
        // ... more choices ...

        return Result.ok(reward);
    }

    completeBattle(winner) {
        if (winner === 'heroes') {
            this.player.setMilestone(this.currentMilestone);
            const gold = 10 * this.currentMilestone;
            const exp = 20 * this.currentMilestone;

            this.player.addGold(gold);
            this.heroes.list('active').forEach(h => h.addExperience(exp));

            if (this.currentMilestone % 10 === 0) {
                this.player.addCores(5);
            }

            return Result.ok({ gold, exp });
        } else {
            // Defeat rewards (partial exp)
            const exp = 5 * this.currentMilestone;
            this.heroes.list('active').forEach(h => h.addExperience(exp));
            return Result.ok({ exp });
        }
    }
}
