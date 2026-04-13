import { SKILLS_DATA } from '../constants.js';
import { t } from '../i18n.js';

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
            
            const validSkills = Object.keys(hero.skills).filter(s => {
                const data = SKILLS_DATA[s];
                if (!data) return false;
                if (hero.mp < data.mpCost) return false;
                return true;
            });
            const action = validSkills[Math.floor(Math.random() * validSkills.length)] || 'basic_attack';
            
            const skill = SKILLS_DATA[action];
            let target = null;
            if (skill && skill.category === 'support' && skill.targetType === 'ally') {
                // Find weakest ally who is still alive
                const sortedAllies = [...this.heroes]
                    .filter(h => h.hp > 0)
                    .sort((a,b) => (a.hp/a.maxHp) - (b.hp/b.maxHp));
                
                if (sortedAllies.length > 0) {
                    target = this.heroes.indexOf(sortedAllies[0]);
                }
            }
            
            this.heroAction(hero, action, target);
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
            this.game.endCombat('win');
            return true;
        }

        const allHeroesDead = this.heroes.every(h => h.hp <= 0);
        if (allHeroesDead) {
            this.isCombatOver = true;
            this.game.endCombat('lose');
            return true;
        }

        return false;
    }

    applyDamage(target, amount) {
        target.hp = Math.max(0, target.hp - amount);
        if (this.game.onDamage) this.game.onDamage(target, amount);
        if (target.hp === 0) {
            if (this.game.onDeath) this.game.onDeath(target);
        }
    }

    getFinalStat(entity, statName) {
        // Placeholder for future status effects/modifiers
        let baseVal = entity[statName] || 0;
        return Math.max(1, baseVal);
    }

    calculateDamageMultiplier(attackValue, defenseValue) {
        if (defenseValue <= 0) defenseValue = 1;
        const R = attackValue / defenseValue;
        
        if (R >= 10) return R / 10;
        if (R >= 5) return 1.0;
        
        // Piecewise linear model
        if (R >= 4) return 0.9 + (R - 4) * 0.1;      // (4, 0.9) to (5, 1.0)
        if (R >= 2) return 0.75 + (R - 2) * 0.075;   // (2, 0.75) to (4, 0.9)
        if (R >= 1) return 0.5 + (R - 1) * 0.25;     // (1, 0.5) to (2, 0.75)
        
        return R * 0.5;                             // (0, 0) to (1, 0.5)
    }

    getElementMultiplier(skillElement, targetElement) {
        if (!skillElement || !targetElement || targetElement === 'neutral') return 1.0;
        if (skillElement === targetElement) return 1.0;

        const relationships = {
            fire: 'wind',
            wind: 'storm',
            storm: 'water',
            water: 'fire'
        };

        if (relationships[skillElement] === targetElement) return 1.5;
        if (relationships[targetElement] === skillElement) return 0.5;
        
        return 1.0;
    }

    calculateEvasionChance(attacker, defender) {
        const sAttacker = this.getFinalStat(attacker, 'speed');
        const sDefender = this.getFinalStat(defender, 'speed');
        const R = sDefender / sAttacker;

        if (R <= 1) {
            // Faster attacker reduces evasion. R=0.5 (double speed) -> 0%
            return Math.max(0, (R - 0.5) * 20);
        } else {
            // Faster defender increases evasion.
            return 10 + (R * 10);
        }
    }

    heroAction(hero, skillId, targetIndex = null) {
        if (this.isActionInProgress || this.isCombatOver) return;

        const skillData = SKILLS_DATA[skillId];
        if (!skillData) return;

        if (hero.mp < skillData.mpCost) {
            this.game.log(t('not_enough_mp') || 'Not enough MP!');
            this.game.showActionPanel(hero);
            return;
        }

        this.isActionInProgress = true;
        clearTimeout(this.autoTurnTimeout);

        hero.mp -= skillData.mpCost;

        const level = hero.skills[skillId] || 0;
        const multiplier = 1.0 + (0.005 * (skillData.tier || 1) * level);
        const baseStatValue = hero[skillData.stat] || 1;
        
        let logMsg = '';
        let delay = 500;

        if (skillData.category === 'support') {
            // New tiered healing logic
            const power = skillData.power || 0.1;
            const finalPercentage = power * multiplier;
            
            if (skillData.targetType === 'all') {
                this.heroes.forEach(h => {
                    if (h.hp > 0) {
                        const amount = Math.floor(h.maxHp * finalPercentage);
                        h.hp = Math.min(h.maxHp, h.hp + amount);
                        if (this.game.onHeal) this.game.onHeal(h, amount);
                    }
                });
                logMsg = t('log_heals_all').replace('{attacker}', hero.name);
            } else {
                const targetHero = targetIndex !== null ? this.heroes[targetIndex] : hero; // Fallback to self
                const amount = Math.floor(targetHero.maxHp * finalPercentage);
                targetHero.hp = Math.min(targetHero.maxHp, targetHero.hp + amount);
                logMsg = t('log_heals').replace('{attacker}', hero.name).replace('{target}', targetHero.name).replace('{amount}', amount);
                if (this.game.onHeal) this.game.onHeal(targetHero, amount);
            }
        } else {
            // Offensive skills
            const damageMultiplier = skillData.baseMultiplier || 1.0;
            const rawDamage = baseStatValue * damageMultiplier * multiplier;
            
            // Check for Evasion
            const evasionChance = this.calculateEvasionChance(hero, this.enemy);
            if (Math.random() * 100 < evasionChance) {
                this.game.log(t('log_miss').replace('{attacker}', hero.name).replace('{target}', this.enemy.name));
                if (this.game.onDamage) this.game.onDamage(this.enemy, t('miss_label') || 'Miss!');
            } else {
                const targetDefense = this.getFinalStat(this.enemy, 'defense');
                const defMult = this.calculateDamageMultiplier(rawDamage, targetDefense);
                
                const elementMult = this.getElementMultiplier(skillData.element, this.enemy.element);
                const finalDamage = Math.max(1, Math.floor(rawDamage * defMult * elementMult));
                
                let elementFeedback = '';
                if (elementMult > 1) {
                   elementFeedback = `[${t('effective') || 'Effective!'}] `;
                } else if (elementMult < 1) {
                   elementFeedback = `[${t('resisted') || 'Resisted'}] `;
                }
                
                if (skillId === 'double_attack') {
                    this.applyDamage(this.enemy, finalDamage);
                    setTimeout(() => this.applyDamage(this.enemy, finalDamage), 300);
                    logMsg = elementFeedback + t('log_uses_skill').replace('{attacker}', hero.name).replace('{skill}', t(skillId));
                    delay += 300;
                } else if (skillId === 'triple_attack') {
                    this.applyDamage(this.enemy, finalDamage);
                    setTimeout(() => this.applyDamage(this.enemy, finalDamage), 300);
                    setTimeout(() => this.applyDamage(this.enemy, finalDamage), 600);
                    logMsg = elementFeedback + t('log_uses_skill').replace('{attacker}', hero.name).replace('{skill}', t(skillId));
                    delay += 600;
                } else {
                    this.applyDamage(this.enemy, finalDamage);
                    if (skillId === 'basic_attack') {
                        logMsg = elementFeedback + t('log_attack').replace('{attacker}', hero.name).replace('{target}', this.enemy.name).replace('{damage}', finalDamage);
                    } else {
                        logMsg = elementFeedback + t('log_uses_skill').replace('{attacker}', hero.name).replace('{skill}', t(skillId));
                    }
                }
            }
        }

        this.game.log(logMsg);

        if (this.enemy.hp === 0) delay += 1000;

        setTimeout(() => this.advanceTurn(), delay);
    }

    useItem(hero, itemId) {
        if (this.isActionInProgress || this.isCombatOver) return;
        
        // Items are currently used immediately in game.js before calling this, 
        // but we'll lock here for safety during the sequence.
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
        const aliveHeroes = this.heroes.filter(h => h.hp > 0);
        if (aliveHeroes.length === 0) {
            this.advanceTurn();
            return;
        }

        const target = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
        
        // Check for Evasion
        const evasionChance = this.calculateEvasionChance(this.enemy, target);
        if (Math.random() * 100 < evasionChance) {
            this.game.log(t('log_miss').replace('{attacker}', this.enemy.name).replace('{target}', target.name));
            if (this.game.onDamage) this.game.onDamage(target, t('miss_label') || 'Miss!');
            this.game.triggerFlash('rgba(255, 255, 255, 0.1)', 200);
        } else {
            const attackValue = this.getFinalStat(this.enemy, 'strength');
            const targetDefense = this.getFinalStat(target, 'defense');
            const defMult = this.calculateDamageMultiplier(attackValue, targetDefense);
            const finalDamage = Math.max(1, Math.floor(attackValue * defMult));
            
            this.applyDamage(target, finalDamage);
            this.game.log(t('log_attack').replace('{attacker}', this.enemy.name).replace('{target}', target.name).replace('{damage}', finalDamage));
            this.game.triggerFlash('rgba(255, 0, 0, 0.3)', 300);
        }

        const delay = 1500;
        setTimeout(() => this.advanceTurn(), delay);
    }
}
