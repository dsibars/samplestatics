export class CombatAttackCalculator {
    /**
     * Extracts the effective stat from an entity (Hero or Enemy)
     */
    static getFinalStat(entity, statName) {
        let baseVal = entity[statName] || 0;
        
        // If entity is a Hero and has equipment, this would be where we add those.
        // For now, it's just the base stat.
        
        return Math.max(1, baseVal);
    }

    /**
     * Calculates the damage multiplier based on Attack vs Defense ratio (R)
     */
    static calculateDamageMultiplier(attackValue, defenseValue) {
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

    /**
     * Calculates elemental efficiency
     */
    static getElementMultiplier(skillElement, targetElement) {
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

    /**
     * Calculates evasion chance (0-100)
     */
    static calculateEvasionChance(attacker, defender) {
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

    /**
     * Main calculation entry point
     * @returns {Object} { amount, evasionChance, isMiss, elementMult }
     */
    static calculate(attacker, defender, skillData, skillLevel = 0) {
        const evasionChance = this.calculateEvasionChance(attacker, defender);
        const isMiss = Math.random() * 100 < evasionChance;

        if (isMiss) {
            return { amount: 0, evasionChance, isMiss: true, elementMult: 1 };
        }

        const multiplier = 1.0 + (0.005 * (skillData.tier || 1) * skillLevel);
        const baseStatValue = this.getFinalStat(attacker, skillData.stat);
        
        if (skillData.category === 'support') {
            const power = skillData.power || 0.1;
            const finalPercentage = power * multiplier;
            // For healing, amount is a percentage of target max HP usually, 
            // but we'll return the raw percentage multiplier here and let CombatManager apply it to target.maxHp
            return { amount: finalPercentage, evasionChance: 0, isMiss: false, elementMult: 1 };
        } else {
            const damageMultiplier = skillData.baseMultiplier || 1.0;
            const rawDamage = baseStatValue * damageMultiplier * multiplier;
            
            const targetDefense = this.getFinalStat(defender, 'defense');
            const defMult = this.calculateDamageMultiplier(rawDamage, targetDefense);
            const elementMult = this.getElementMultiplier(skillData.element, defender.element);
            
            const finalDamage = Math.max(1, Math.floor(rawDamage * defMult * elementMult));
            
            return { amount: finalDamage, evasionChance, isMiss: false, elementMult };
        }
    }
}
