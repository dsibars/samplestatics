import { SKILLS_DATA } from '../constants.js';
import { t } from '../i18n.js';
import { CombatAttackCalculator } from './CombatAttackCalculator.js';
import { CombatTurnAutoAgent } from './CombatTurnAutoAgent.js';

export class CombatManager {
    constructor(game, heroes, enemy) {
        this.game = game;
        this.heroes = heroes;   // Array of Hero objects
        this.enemy = enemy;     // Enemy object

        this.turnOrder = [];
        this.currentTurnIndex = 0;
        this.isCombatOver = false;
        this.isActionInProgress = false;
        this.autoTurnTimeout = null;
        this.itemUsedThisTurn = false;

        this.initTurnOrder();
    }

    stop() {
        this.isCombatOver = true;
        clearTimeout(this.autoTurnTimeout);
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
            const turnMsg = t('s_turn').replace('{hero}', participant.name);
            this.game.log(participant.name + turnMsg); // Legacy fallback but should use template if possible
            // Re-evaluating: s_turn in i18n is "'s Turn" in English and " - Turno" in Spanish.
            // Let's stick to the user's template style if we had one.
            // Actually, I didn't add log_turn to i18n. I'll use s_turn as is.
            
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
                enemies: [this.enemy],
                type: 'smart' // Heroes are always smart in auto battle
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
        if (this.enemy.hp <= 0) {
            this.isCombatOver = true;
            setTimeout(() => this.game.endCombat('win'), 1000);
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
        // Detect one-shot for level skip: boss hit for 300%+ max HP on the first hit
        if (target === this.enemy && target.isBoss && target.hp === target.maxHp && typeof amount === 'number' && amount >= target.maxHp * 3) {
            this.oneShotJumpPossible = true;
        }

        const roundedAmount = typeof amount === 'number' ? Math.round(amount) : 0;
        target.hp = Math.max(0, target.hp - roundedAmount);
        if (this.game.onDamage) this.game.onDamage(target, roundedAmount);
        if (target.hp === 0) {
            if (this.game.onDeath) this.game.onDeath(target);
        }
    }

    // Formulas moved to CombatAttackCalculator

    heroAction(hero, skillId, targetIndex = null) {
        this.handleSkillAction(hero, skillId, targetIndex);
    }

    handleSkillAction(actor, skillId, targetIndex = null) {
        if (this.isActionInProgress || this.isCombatOver) return;

        const skillData = SKILLS_DATA[skillId];
        if (!skillData) return;

        if (actor.mp < skillData.mpCost) {
            if (actor !== this.enemy) {
                this.game.log(t('not_enough_mp') || 'Not enough MP!');
                this.game.showActionPanel(actor);
            } else {
                // Enemy fallback to basic attack if AI fails (shouldn't happen with AutoAgent)
                this.handleSkillAction(actor, 'basic_attack', targetIndex);
            }
            return;
        }

        this.isActionInProgress = true;
        clearTimeout(this.autoTurnTimeout);

        actor.mp -= skillData.mpCost;

        const skillLevel = actor.skills[skillId] || 0;
        let delay = 500;
        
        // Define targets
        let targets = [];
        const isActorHero = this.heroes.includes(actor);
        const allies = isActorHero ? this.heroes : [this.enemy];
        const enemies = isActorHero ? [this.enemy] : this.heroes;

        if (skillData.targetType === 'all_allies') {
            targets = allies.filter(a => a.hp > 0);
        } else if (skillData.targetType === 'single_ally') {
            targets = [targetIndex !== null ? allies[targetIndex] : actor];
        } else if (skillData.targetType === 'all_enemies') {
            targets = enemies.filter(e => e.hp > 0);
        } else if (skillData.targetType === 'single_enemy') {
            targets = [targetIndex !== null ? enemies[targetIndex] : enemies[0]];
        } else if (skillData.targetType === 'self') {
            targets = [actor];
        }

        targets.forEach(target => {
            const result = CombatAttackCalculator.calculate(actor, target, skillData, skillLevel);

            if (result.isMiss) {
                this.game.log(t('log_miss').replace('{attacker}', actor.name).replace('{target}', target.name));
                if (this.game.onDamage) this.game.onDamage(target, t('miss_label') || 'Miss!');
                if (target === this.enemy) {
                    // Visual feedback for missing enemy
                } else {
                    this.game.triggerFlash('rgba(255, 255, 255, 0.1)', 200);
                }
            } else {
                if (skillData.category === 'support') {
                    const healAmount = Math.floor(target.maxHp * result.amount);
                    target.hp = Math.min(target.maxHp, target.hp + healAmount);
                    if (this.game.onHeal) this.game.onHeal(target, healAmount);
                    this.game.log(t('log_heals').replace('{attacker}', actor.name).replace('{target}', target.name).replace('{amount}', healAmount));
                } else {
                    // Offensive
                    const finalDamage = result.amount;
                    let elementFeedback = '';
                    if (result.elementMult > 1) elementFeedback = `[${t('effective') || 'Effective!'}] `;
                    else if (result.elementMult < 1) elementFeedback = `[${t('resisted') || 'Resisted'}] `;

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

                    if (skillId === 'basic_attack' || skillId === 'double_attack' || skillId === 'triple_attack') {
                        this.game.log(elementFeedback + t('log_attack').replace('{attacker}', actor.name).replace('{target}', target.name).replace('{damage}', finalDamage));
                    } else {
                        this.game.log(elementFeedback + t('log_uses_skill').replace('{attacker}', actor.name).replace('{skill}', t(skillId)));
                    }

                    if (!isActorHero) {
                        this.game.triggerFlash('rgba(255, 0, 0, 0.3)', 300);
                    }
                }
            }
        });

        if (this.enemy.hp === 0) delay += 1000;
        setTimeout(() => this.advanceTurn(), delay);
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

    enemyTurn() {
        if (this.isCombatOver) return;

        const context = {
            target: this.enemy,
            allies: [this.enemy],
            enemies: this.heroes,
            type: 'random' // Enemies are random for now as requested
        };

        const decision = CombatTurnAutoAgent.decideAction(context);
        this.handleSkillAction(this.enemy, decision.skillId, decision.targetIndex);
    }
}
