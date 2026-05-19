import { CombatCalculator } from '../core/CombatCalculator.js';
import { CombatAI } from '../core/CombatAI.js';
import { Result } from '../../core/Result.js';
import { SKILLS_DATA, CONSUMABLES_DATA } from '../../data/GameConstants.js';

export class BattleService {
    constructor(inventoryService) {
        this.inventory = inventoryService;
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
        this.itemUsedThisTurn = false;
    }

    startBattle(heroes, enemies, autoBattle = false) {
        this.reset();
        this.heroes = heroes;
        this.enemies = enemies;
        this.autoBattle = autoBattle;

        this._determineTurnOrder();
        this.partyTraits = this._calculatePartyTraits();

        return Result.ok({
            turnOrder: this.turnOrder.map(e => ({ id: e.id, name: e.name, type: e.constructor.name })),
            partyTraits: this.partyTraits
        });
    }

    _calculatePartyTraits() {
        const traits = {
            hpRegen: 0,
            physicalDamageReduction: 0,
            magicPowerBoost: 0,
            goldBonus: 1.0
        };

        this.heroes.forEach(hero => {
            if (hero.hp > 0) {
                switch (hero.origin) {
                    case 'origin_cook':
                        traits.hpRegen += 0.05;
                        break;
                    case 'origin_guard':
                        traits.physicalDamageReduction += 0.10;
                        break;
                    case 'origin_poet':
                        traits.magicPowerBoost += 0.10;
                        break;
                    case 'origin_thief':
                        traits.goldBonus += 0.10;
                        break;
                }
            }
        });

        return traits;
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

        // 1. Process Status Effects (Poison, Burn, etc.)
        const statusResults = this._processStatusEffects(currentEntity);
        
        // 1.1 Process Party Traits (Regen)
        if (this.heroes.includes(currentEntity) && this.partyTraits.hpRegen > 0 && currentEntity.hp > 0) {
            const regenAmount = Math.floor(currentEntity.maxHp * this.partyTraits.hpRegen);
            if (regenAmount > 0) {
                currentEntity.hp = Math.min(currentEntity.maxHp, currentEntity.hp + regenAmount);
                const event = { 
                    type: 'TRAIT_REGEN', 
                    amount: regenAmount, 
                    targetId: currentEntity.id,
                    targetName: currentEntity.name,
                    targetIsHero: true,
                    targetHp: currentEntity.hp,
                    targetMaxHp: currentEntity.maxHp
                };
                statusResults.push(event);
                this.log.push(event);
            }
        }

        if (currentEntity.hp <= 0) {
            return Result.ok({ statusEvents: statusResults, entityDefeated: true });
        }

        // 2. Perform Auto Action if applicable
        if (this.enemies.includes(currentEntity) || this.autoBattle) {
            return this.performAutoAction(currentEntity, statusResults);
        }

        return Result.ok({
            actionRequired: true,
            entity: { id: currentEntity.id, name: currentEntity.name },
            statusEvents: statusResults
        });
    }

    _processStatusEffects(entity) {
        if (!entity.statusEffects || entity.statusEffects.length === 0) return [];

        const isHero = this.heroes.includes(entity);
        const events = [];
        for (let i = entity.statusEffects.length - 1; i >= 0; i--) {
            const eff = entity.statusEffects[i];
            let damage = 0;

            if (eff.type === 'poison' || eff.type === 'burn') {
                damage = Math.floor(entity.maxHp * (eff.power || 0.05));
                entity.hp = Math.max(0, entity.hp - damage);
                const event = { 
                    type: 'STATUS_TICK', 
                    effectType: eff.type, 
                    damage, 
                    targetId: entity.id,
                    targetName: entity.name,
                    targetIsHero: isHero,
                    targetHp: entity.hp,
                    targetMaxHp: entity.maxHp
                };
                events.push(event);
                this.log.push(event);
            }

            eff.duration--;
            if (eff.duration <= 0) {
                entity.statusEffects.splice(i, 1);
                const event = { 
                    type: 'STATUS_EXPIRED', 
                    effectType: eff.type, 
                    targetId: entity.id,
                    targetName: entity.name,
                    targetIsHero: isHero
                };
                events.push(event);
                this.log.push(event);
                if (entity.recalculateStats) entity.recalculateStats({});
            }
        }
        return events;
    }

    performAutoAction(entity, statusResults = []) {
        const context = {
            actor: entity,
            allies: this.heroes.includes(entity) ? this.heroes : this.enemies,
            enemies: this.heroes.includes(entity) ? this.enemies : this.heroes,
            type: 'smart'
        };

        const decision = CombatAI.decideAction(context);
        return this.executeAction(entity, decision.skillId, decision.targetIndex, statusResults);
    }

    executeAction(actor, skillId, targetIndex = null, statusResults = []) {
        if (this.isOver) return Result.fail('error_battle_over');

        const skillData = SKILLS_DATA[skillId];
        if (!skillData) return Result.fail('error_invalid_skill');

        if (actor.mp < skillData.mpCost) return Result.fail('error_not_enough_mp');

        actor.mp -= skillData.mpCost;
        const skillLevel = (actor.skills && actor.skills[skillId]) || 0;

        const isActorHero = this.heroes.includes(actor);
        const allies = isActorHero ? this.heroes : this.enemies;
        const enemies = isActorHero ? this.enemies : this.heroes;

        // Determine Targets
        let baseTargets = [];
        if (skillData.targetType === 'all_allies') {
            baseTargets = allies.filter(a => a.hp > 0);
        } else if (skillData.targetType === 'single_ally') {
            baseTargets = [targetIndex !== null ? allies[targetIndex] : actor];
        } else if (skillData.targetType === 'all_enemies') {
            baseTargets = enemies.filter(e => e.hp > 0);
        } else if (skillData.targetType === 'single_enemy') {
            if (targetIndex !== null && enemies[targetIndex]?.hp > 0) {
                baseTargets = [enemies[targetIndex]];
            } else {
                const alive = enemies.filter(e => e.hp > 0);
                baseTargets = alive.length > 0 ? [alive[0]] : [];
            }
        } else if (skillData.targetType === 'self') {
            baseTargets = [actor];
        }

        if (baseTargets.length === 0) return Result.fail('error_no_targets');

        // Handle Splash/Jump
        let targetsWithMultipliers = baseTargets.map(t => ({ target: t, mult: 1.0 }));
        const mainTarget = baseTargets[0];

        if (skillData.splash && mainTarget) {
            const others = enemies.filter(e => e.hp > 0 && e !== mainTarget);
            others.forEach(o => targetsWithMultipliers.push({ target: o, mult: skillData.splash }));
        }

        if (skillData.jump && mainTarget) {
            const others = enemies.filter(e => e.hp > 0 && e !== mainTarget);
            let currentMult = skillData.jump;
            others.forEach(o => {
                targetsWithMultipliers.push({ target: o, mult: currentMult });
                currentMult *= skillData.jump;
            });
        }

        const actionEvents = [];

        targetsWithMultipliers.forEach(({ target, mult }) => {
            const result = CombatCalculator.calculate(actor, target, skillData, skillLevel, this.partyTraits);

            const event = {
                type: skillData.category === 'support' ? 'HEAL' : 'DAMAGE',
                actorId: actor.id,
                actorName: actor.name,
                actorIsHero: isActorHero,
                targetId: target.id,
                targetName: target.name,
                targetIsHero: this.heroes.includes(target),
                skillId: skillId,
                isMiss: result.isMiss,
                amount: 0,
                isCrit: result.isCrit,
                elementMult: result.elementMult
            };

            if (!result.isMiss) {
                if (skillData.category === 'support') {
                    const healAmount = Math.floor(target.maxHp * result.amount * mult);
                    target.hp = Math.min(target.maxHp, target.hp + healAmount);
                    event.amount = healAmount;
                } else {
                    const damage = Math.max(1, Math.floor(result.amount * mult));
                    target.hp = Math.max(0, target.hp - damage);
                    event.amount = damage;
                    if (target.hp <= 0) event.targetDefeated = true;

                    // Side effects (Poison from Poison Dart, etc.)
                    if (skillId === 'poison_dart' && Math.random() < 0.5) {
                        this._applyStatusEffect(target, { type: 'poison', duration: 3, power: 0.05 });
                        event.statusApplied = 'poison';
                    }
                }
            }
            event.targetHp = target.hp;
            event.targetMaxHp = target.maxHp;
            actionEvents.push(event);
            this.log.push(event);
        });

        const battleEnd = this._checkBattleEnd();
        if (battleEnd.success && this.isOver) {
            return Result.ok({ statusEvents: statusResults, actionEvents, battleOver: true, winner: this.winner });
        }

        return this._advanceTurn({ statusEvents: statusResults, actionEvents });
    }

    _applyStatusEffect(target, effect) {
        if (!target.statusEffects) target.statusEffects = [];
        const existing = target.statusEffects.find(e => e.type === effect.type);
        if (existing) {
            existing.duration = Math.max(existing.duration, effect.duration);
        } else {
            target.statusEffects.push(effect);
        }
        if (target.recalculateStats) target.recalculateStats({});
    }

    useConsumable(actor, consumableId, targetId = null) {
        if (this.isOver) return Result.fail('error_battle_over');
        if (this.itemUsedThisTurn) return Result.fail('error_item_already_used');

        const useResult = this.inventory.useConsumable(consumableId);
        if (!useResult.success) return useResult;

        const data = CONSUMABLES_DATA[consumableId];
        if (!data) return Result.fail('error_invalid_consumable');

        const target = [...this.heroes, ...this.enemies].find(e => e.id === targetId) || actor;
        
        let amount = 0;
        let type = data.type;

        if (type === 'HEAL_HP') {
            amount = Math.floor(target.maxHp * data.amount);
            target.hp = Math.min(target.maxHp, target.hp + amount);
        } else if (type === 'HEAL_MP') {
            amount = Math.floor(target.maxMp * data.amount);
            target.mp = Math.min(target.maxMp, target.mp + amount);
        } else if (type === 'ESCAPE') {
            // Logic for escaping battle would go here
            this.isOver = true;
            this.winner = 'escape';
        }

        const event = {
            type: 'USE_CONSUMABLE',
            actorId: actor.id,
            actorName: actor.name,
            actorIsHero: this.heroes.includes(actor),
            targetId: target.id,
            targetName: target.name,
            targetIsHero: this.heroes.includes(target),
            consumableId,
            healType: type,
            amount,
            targetHp: target.hp,
            targetMaxHp: target.maxHp
        };

        this.log.push(event);
        this.itemUsedThisTurn = true;

        return Result.ok({ event });
    }

    _advanceTurn(data = {}) {
        this.currentTurnIndex++;
        this.itemUsedThisTurn = false;
        if (this.currentTurnIndex >= this.turnOrder.length) {
            this._determineTurnOrder();
            this.currentTurnIndex = 0;
        }
        const nextEntity = this.turnOrder[this.currentTurnIndex];
        return Result.ok({ ...data, nextEntityId: nextEntity?.id });
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
