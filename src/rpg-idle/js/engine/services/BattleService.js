import { CombatCalculator } from '../core/CombatCalculator.js';
import { Result } from '../core/Result.js';

export class BattleService {
    constructor() {
        this.reset();
    }

    reset() {
        this.heroes = [];
        this.enemies = [];
        this.turnOrder = [];
        this.currentTurnIndex = 0;
        this.isOver = false;
        this.winner = null;
        this.log = [];
        this.autoBattle = false;
    }

    startBattle(heroes, enemies, autoBattle = false) {
        this.reset();
        this.heroes = heroes;
        this.enemies = enemies;
        this.autoBattle = autoBattle;

        this._determineTurnOrder();
        return Result.ok({
            turnOrder: this.turnOrder.map(e => ({ id: e.id, name: e.name, type: e.constructor.name }))
        });
    }

    _determineTurnOrder() {
        this.turnOrder = [...this.heroes, ...this.enemies]
            .filter(e => e.hp > 0)
            .sort((a, b) => b.speed - a.speed);
    }

    nextTurn() {
        if (this.isOver) return Result.fail('error_battle_over');

        const currentEntity = this.turnOrder[this.currentTurnIndex];

        if (currentEntity.hp <= 0) {
            return this._advanceTurn();
        }

        // If it's an enemy or auto-battle is on, perform auto action
        if (this.enemies.includes(currentEntity) || this.autoBattle) {
            return this.performAutoAction(currentEntity);
        }

        return Result.ok({
            actionRequired: true,
            entity: { id: currentEntity.id, name: currentEntity.name }
        });
    }

    performAutoAction(entity) {
        // Simple AI: Basic attack on random healthy opponent
        const opponents = this.heroes.includes(entity) ? this.enemies : this.heroes;
        const healthyOpponents = opponents.filter(o => o.hp > 0);

        if (healthyOpponents.length === 0) return this._checkBattleEnd();

        const target = healthyOpponents[Math.floor(Math.random() * healthyOpponents.length)];
        return this.executeAction(entity, 'basic_attack', target.id);
    }

    executeAction(actor, skillId, targetId) {
        if (this.isOver) return Result.fail('error_battle_over');

        const target = [...this.heroes, ...this.enemies].find(e => e.id === targetId);
        if (!target || target.hp <= 0) return Result.fail('error_invalid_target');

        // For now, simplified damage calculation
        const isMiss = Math.random() * 100 < CombatCalculator.calculateEvasionChance(actor, target);

        let event = {
            type: 'ACTION',
            actorId: actor.id,
            targetId: target.id,
            skillId: skillId,
            isMiss: isMiss,
            damage: 0,
            isCrit: false
        };

        if (!isMiss) {
            // Very simplified damage for now, using strength vs defense
            const damageMult = CombatCalculator.calculateDamageMultiplier(actor.strength || actor.baseStrength, target.defense || target.baseDefense);
            const damage = Math.max(1, Math.floor((actor.strength || actor.baseStrength) * damageMult));
            target.hp = Math.max(0, target.hp - damage);
            event.damage = damage;

            if (target.hp <= 0) {
                event.targetDefeated = true;
            }
        }

        this.log.push(event);

        const endCheck = this._checkBattleEnd();
        if (endCheck.success && this.isOver) {
            return Result.ok({ event, battleOver: true, winner: this.winner });
        }

        return this._advanceTurn(event);
    }

    _advanceTurn(lastEvent = null) {
        this.currentTurnIndex++;
        if (this.currentTurnIndex >= this.turnOrder.length) {
            this._determineTurnOrder();
            this.currentTurnIndex = 0;
        }
        return Result.ok({ event: lastEvent, nextEntityId: this.turnOrder[this.currentTurnIndex].id });
    }

    _checkBattleEnd() {
        const allHeroesDead = this.heroes.every(h => h.hp <= 0);
        const allEnemiesDead = this.enemies.every(e => e.hp <= 0);

        if (allHeroesDead) {
            this.isOver = true;
            this.winner = 'enemies';
        } else if (allEnemiesDead) {
            this.isOver = true;
            this.winner = 'heroes';
        }

        return Result.ok({ isOver: this.isOver, winner: this.winner });
    }
}
