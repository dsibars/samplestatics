import { SKILLS_DATA } from '../constants.js';
import { t } from '../i18n.js';
import { CombatAttackCalculator } from './CombatAttackCalculator.js';
import { CombatTurnAutoAgent } from './CombatTurnAutoAgent.js';

export class CombatManager {
    constructor(game, heroes, enemies) {
        this.game = game;
        this.heroes = heroes;
        this.enemies = enemies;

        this.turnOrder = [];
        this.currentTurnIndex = 0;
        this.isCombatOver = false;
        this.isActionInProgress = false;
        this.autoTurnTimeout = null;
        this.itemUsedThisTurn = false;

        this.targetIndex = null;

        this.partyTraits = this.calculatePartyTraits();
        this.initTurnOrder();
    }

    calculatePartyTraits() {
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

    stop() {
        this.isCombatOver = true;
        clearTimeout(this.autoTurnTimeout);
    }

    initTurnOrder() {
        this.turnOrder = [...this.heroes, ...this.enemies].sort((a, b) => b.speed - a.speed);
    }

    nextTurn() {
        if (this.isCombatOver) return;

        const participant = this.turnOrder[this.currentTurnIndex];

        if (participant.hp <= 0) {
            this.advanceTurn();
            return;
        }

        let skipTurn = false;
        if (participant.statusEffects.length > 0) {
            for (let i = participant.statusEffects.length - 1; i >= 0; i--) {
                const eff = participant.statusEffects[i];

                if (eff.type === 'poison') {
                    const dmg = Math.floor(participant.maxHp * eff.power);
                    this.applyDamage(participant, dmg);
                    this.game.log(t('log_status_poison').replace('{target}', participant.name).replace('{damage}', dmg), '#f0f');
                } else if (eff.type === 'burn') {
                    const dmg = Math.floor(participant.maxHp * eff.power);
                    this.applyDamage(participant, dmg);
                    this.game.log(t('log_status_burn').replace('{target}', participant.name).replace('{damage}', dmg), '#f50');
                } else if (eff.type === 'sleep') {
                    this.game.log(t('log_status_sleep').replace('{target}', participant.name), '#aaa');
                    skipTurn = true;
                } else if (eff.type === 'stun') {
                    this.game.log(t('log_status_stun').replace('{target}', participant.name), '#ff0');
                    skipTurn = true;
                }

                eff.duration--;
                if (eff.duration <= 0) {
                    participant.statusEffects.splice(i, 1);
                    if (participant.recalculateStats) participant.recalculateStats();
                }
            }
        }

        if (participant.hp <= 0) {
            this.advanceTurn();
            return;
        }

        if (skipTurn) {
            setTimeout(() => this.advanceTurn(), 1000);
            return;
        }

        if (this.heroes.includes(participant) && this.partyTraits.hpRegen > 0) {
            const regenAmount = Math.floor(participant.maxHp * this.partyTraits.hpRegen);
            if (regenAmount > 0) {
                participant.hp = Math.min(participant.maxHp, participant.hp + regenAmount);
                if (this.game.onHeal) this.game.onHeal(participant, regenAmount);
                this.game.log(t('log_heals').replace('{attacker}', t('origin_cook')).replace('{target}', participant.name).replace('{amount}', regenAmount), '#0f0');
            }
        }

        if (this.enemies.includes(participant)) {
            this.enemyTurn(participant);
        } else {
            const turnMsg = t('s_turn').replace('{hero}', participant.name);
            this.game.log(participant.name + turnMsg);
            
            if (this.game.autoBattle) {
                this.heroAutoTurn(participant);
            } else {
                this.game.showActionPanel(participant);
            }
        }
    }

    heroAutoTurn(hero) {
        clearTimeout(this.autoTurnTimeout);
        this.autoTurnTimeout = setTimeout(() => {
            if (this.isCombatOver || hero.hp <= 0 || !this.game.autoBattle) return;
            
            const context = {
                target: hero,
                allies: this.heroes,
                enemies: this.enemies,
                type: 'smart'
            };

            const decision = CombatTurnAutoAgent.decideAction(context);
            this.handleSkillAction(hero, decision.skillId, decision.targetIndex);
        }, 500);
    }

    advanceTurn() {
        this.isActionInProgress = false;
        this.itemUsedThisTurn = false;
        if (this.checkCombatEnd()) return;
        this.currentTurnIndex = (this.currentTurnIndex + 1) % this.turnOrder.length;
        this.nextTurn();
    }

    checkCombatEnd() {
        if (this.enemies.every(e => e.hp <= 0)) {
            this.isCombatOver = true;
            setTimeout(() => this.game.endCombat('win', this.partyTraits.goldBonus), 1000);
            return true;
        }

        const allHeroesDead = this.heroes.every(h => h.hp <= 0);
        if (allHeroesDead) {
            this.isCombatOver = true;
            setTimeout(() => this.game.endCombat('lose'), 1000);
            return true;
        }

        return false;
    }

    applyDamage(target, amount) {
        if (this.enemies.includes(target) && target.isBoss && target.hp === target.maxHp && typeof amount === 'number' && amount >= target.maxHp * 3) {
            this.oneShotJumpPossible = true;
        }

        const roundedAmount = typeof amount === 'number' ? Math.round(amount) : 0;

        // Handle Phoenix
        if (roundedAmount >= target.hp && target.hasPhoenix && !target.phoenixUsed) {
            target.hp = 1;
            target.phoenixUsed = true;
            this.game.log(t('log_phoenix_survive').replace('{target}', target.name), '#0ff');
            if (this.game.onHeal) this.game.onHeal(target, 1);
            return;
        }

        target.hp = Math.max(0, target.hp - roundedAmount);
        if (this.game.onDamage) this.game.onDamage(target, roundedAmount);

        if (roundedAmount > 0) {
            const sleepIdx = target.statusEffects.findIndex(e => e.type === 'sleep');
            if (sleepIdx > -1) {
                target.statusEffects.splice(sleepIdx, 1);
                this.game.log(t('log_status_wakeup').replace('{target}', target.name), '#ff0');
                if (target.recalculateStats) target.recalculateStats();
            }
        }

        if (target.hp === 0) {
            if (this.game.onDeath) this.game.onDeath(target);
            if (this.heroes.includes(target)) {
                this.partyTraits = this.calculatePartyTraits();
            }
        }
    }

    setTargetIndex(idx) {
        this.targetIndex = idx;
        const target = this.enemies[idx];
        if (target) {
            this.game.log(t('log_target_set').replace('{target}', target.name), '#0af');
        }
    }

    heroAction(hero, skillId, targetIndex = null) {
        this.handleSkillAction(hero, skillId, targetIndex);
    }

    handleSkillAction(actor, skillId, targetIndex = null) {
        if (this.isActionInProgress || this.isCombatOver) return;

        const skillData = SKILLS_DATA[skillId];
        if (!skillData) return;

        if (actor.mp < skillData.mpCost) {
            if (this.heroes.includes(actor)) {
                this.game.log(t('not_enough_mp') || 'Not enough MP!');
                this.game.showActionPanel(actor);
            } else {
                this.handleSkillAction(actor, 'basic_attack', targetIndex);
            }
            return;
        }

        this.isActionInProgress = true;
        clearTimeout(this.autoTurnTimeout);

        actor.mp -= skillData.mpCost;

        const skillLevel = actor.skills[skillId] || 0;
        let delay = 500;
        
        const isActorHero = this.heroes.includes(actor);
        const allies = isActorHero ? this.heroes : this.enemies;
        const enemies = isActorHero ? this.enemies : this.heroes;

        let baseTargets = [];
        if (skillData.targetType === 'all_allies') {
            baseTargets = allies.filter(a => a.hp > 0);
        } else if (skillData.targetType === 'single_ally') {
            baseTargets = [targetIndex !== null ? allies[targetIndex] : actor];
        } else if (skillData.targetType === 'all_enemies') {
            baseTargets = enemies.filter(e => e.hp > 0);
        } else if (skillData.targetType === 'single_enemy') {
            if (targetIndex !== null) {
                baseTargets = [enemies[targetIndex]];
            } else if (this.targetIndex !== null && !enemies.includes(actor) && enemies[this.targetIndex]?.hp > 0) {
                baseTargets = [enemies[this.targetIndex]];
            } else {
                const alive = enemies.filter(e => e.hp > 0);
                baseTargets = alive.length > 0 ? [alive[0]] : [];
            }
        } else if (skillData.targetType === 'self') {
            baseTargets = [actor];
        }

        const mainTarget = baseTargets[0];
        let targetsWithMultipliers = baseTargets.map(t => ({ target: t, mult: 1.0 }));

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

        targetsWithMultipliers.forEach(({ target, mult }) => {
            const result = CombatAttackCalculator.calculate(actor, target, skillData, skillLevel, this.partyTraits);

            if (result.isMiss) {
                this.game.log(t('log_miss').replace('{attacker}', actor.name).replace('{target}', target.name));
                if (this.game.onDamage) this.game.onDamage(target, t('miss_label') || 'Miss!');
            } else {
                if (skillData.category === 'support') {
                    if (skillId === 'haste') {
                        this.applyStatusEffect(target, { type: 'haste', duration: 3 });
                        this.game.log(t('log_uses_skill').replace('{attacker}', actor.name).replace('{skill}', t('haste')) + ` (${t('select_target')}: ${target.name})`, '#0ff');
                    } else {
                        const healAmount = Math.floor(target.maxHp * result.amount * mult);
                        target.hp = Math.min(target.maxHp, target.hp + healAmount);
                        if (this.game.onHeal) this.game.onHeal(target, healAmount);
                        this.game.log(t('log_heals').replace('{attacker}', actor.name).replace('{target}', target.name).replace('{amount}', healAmount), '#0f0');
                    }
                } else {
                    const finalDamage = Math.max(1, Math.floor(result.amount * mult));
                    let feedback = '';
                    if (result.isCrit) feedback += `[${t('critical_label') || 'CRITICAL!'}] `;
                    if (result.elementMult > 1) feedback += `[${t('effective') || 'Effective!'}] `;
                    else if (result.elementMult < 1) feedback += `[${t('resisted') || 'Resisted'}] `;

                    if (skillId === 'double_attack') {
                        this.applyDamage(target, finalDamage);
                        setTimeout(() => this.applyDamage(target, finalDamage), 300);
                        delay = Math.max(delay, 800);
                    } else if (skillId === 'triple_attack') {
                        this.applyDamage(target, finalDamage);
                        setTimeout(() => this.applyDamage(target, finalDamage), 300);
                        setTimeout(() => this.applyDamage(target, finalDamage), 600);
                        delay = Math.max(delay, 1100);
                    } else {
                        this.applyDamage(target, finalDamage);
                    }

                    // Handle Vampirism
                    if (actor.vampirism && finalDamage > 0) {
                        const heal = Math.floor(finalDamage * actor.vampirism);
                        if (heal > 0) {
                            actor.hp = Math.min(actor.maxHp, actor.hp + heal);
                            if (this.game.onHeal) this.game.onHeal(actor, heal);
                        }
                    }

                    if (skillId === 'poison_dart' && Math.random() < 0.5) {
                        this.applyStatusEffect(target, { type: 'poison', duration: 3, power: 0.05 });
                    } else if (skillId === 'meteor' && Math.random() < 0.3) {
                        this.applyStatusEffect(target, { type: 'burn', duration: 3, power: 0.02 });
                    } else if (skillId === 'blizzard' && Math.random() < 0.2) {
                        this.applyStatusEffect(target, { type: 'sleep', duration: 2 });
                    }

                    if (skillId === 'basic_attack' || skillId === 'double_attack' || skillId === 'triple_attack') {
                        this.game.log(feedback + t('log_attack').replace('{attacker}', actor.name).replace('{target}', target.name).replace('{damage}', finalDamage), isActorHero ? null : '#f77');
                    } else {
                        this.game.log(feedback + t('log_uses_skill').replace('{attacker}', actor.name).replace('{skill}', t(skillId)) + ` (${t('available_label').replace(':','').trim()} ${t('select_target')}: ${target.name})`, isActorHero ? '#0ff' : '#f77');
                    }

                    if (!isActorHero) {
                        this.game.triggerFlash('rgba(255, 0, 0, 0.3)', 300);
                    }
                }
            }
        });

        if (this.enemies.every(e => e.hp <= 0)) delay += 1000;
        setTimeout(() => this.advanceTurn(), delay);
    }

    applyStatusEffect(target, effect) {
        const existing = target.statusEffects.find(e => e.type === effect.type);
        if (existing) {
            existing.duration = Math.max(existing.duration, effect.duration);
        } else {
            target.statusEffects.push(effect);
        }
        if (target.recalculateStats) target.recalculateStats();
        this.game.log(t('log_status_affect').replace('{target}', target.name).replace('{type}', t(effect.type)), '#ff0');
    }

    useItem(hero, itemId) {
        if (this.isActionInProgress || this.isCombatOver) return;
        
        this.isActionInProgress = true;
        clearTimeout(this.autoTurnTimeout);

        if (itemId === 'tiny_potion') {
            const heal = Math.floor(hero.maxHp * 0.3);
            hero.hp = Math.min(hero.maxHp, hero.hp + heal);
            if (this.game.onHeal) this.game.onHeal(hero, heal);
            this.game.log(t('log_uses_item').replace('{attacker}', hero.name).replace('{item}', t(itemId)));
        } else if (itemId === 'tiny_mana_potion') {
            const restore = Math.floor(hero.maxMp * 0.3);
            hero.mp = Math.min(hero.maxMp, hero.mp + restore);
            this.game.log(t('log_uses_item').replace('{attacker}', hero.name).replace('{item}', t(itemId)));
        }

        this.itemUsedThisTurn = true;
        this.isActionInProgress = false;
        setTimeout(() => this.game.showActionPanel(hero), 500);
    }

    enemyTurn(enemy) {
        if (this.isCombatOver) return;

        const context = {
            target: enemy,
            allies: this.enemies,
            enemies: this.heroes,
            type: 'random'
        };

        const decision = CombatTurnAutoAgent.decideAction(context);
        this.handleSkillAction(enemy, decision.skillId, decision.targetIndex);
    }
}
