export class CombatAttackCalculator {
    /**
     * Extracts the effective stat from an entity (Hero or Enemy)
     */
    static getFinalStat(entity, statName) {
        let baseVal = entity[statName] || 0;
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
        
        if (R >= 4) return 0.9 + (R - 4) * 0.1;
        if (R >= 2) return 0.75 + (R - 2) * 0.075;
        if (R >= 1) return 0.5 + (R - 1) * 0.25;
        
        return R * 0.5;
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
        let sAttacker = this.getFinalStat(attacker, 'speed');
        let sDefender = this.getFinalStat(defender, 'speed');

        if (attacker.getTraitMultipliers) {
            const mults = attacker.getTraitMultipliers();
            sAttacker *= mults.accuracy;
        }

        // Apply Assassin affix accuracy bonus
        if (attacker.accuracyBonus) {
            sAttacker *= (1 + (attacker.accuracyBonus / 100));
        }

        const R = sDefender / sAttacker;

        if (R <= 1) {
            return Math.max(0, (R - 0.5) * 20);
        } else {
            return 10 + (R * 10);
        }
    }

    /**
     * Main calculation entry point
     * @returns {Object} { amount, evasionChance, isMiss, elementMult }
     */
    static calculate(attacker, defender, skillData, skillLevel = 0, partyTraits = {}) {
        const evasionChance = this.calculateEvasionChance(attacker, defender);

        let critChance = 0;
        if (attacker.getTraitMultipliers) {
            critChance += attacker.getTraitMultipliers().critChance;
        }
        if (attacker.critChanceBonus) {
            critChance += attacker.critChanceBonus;
        }

        const isMiss = Math.random() * 100 < evasionChance;
        const isCrit = !isMiss && (Math.random() * 100 < critChance);

        if (isMiss) {
            return { amount: 0, evasionChance, isMiss: true, elementMult: 1, isCrit: false };
        }

        const multiplier = 1.0 + (0.005 * (skillData.tier || 1) * skillLevel);
        let baseStatValue = this.getFinalStat(attacker, skillData.stat);
        
        if (skillData.stat === 'magicPower' && partyTraits.magicPowerBoost) {
            baseStatValue *= (1 + partyTraits.magicPowerBoost);
        }

        if (skillData.category === 'support') {
            const power = skillData.power || 0.1;
            const finalPercentage = power * multiplier;
            return { amount: finalPercentage, evasionChance: 0, isMiss: false, elementMult: 1, isCrit: false };
        } else {
            const damageMultiplier = skillData.baseMultiplier || 1.0;
            let rawDamage = baseStatValue * damageMultiplier * multiplier;
            if (isCrit) rawDamage *= 1.5;
            
            const targetDefense = this.getFinalStat(defender, 'defense');
            const defMult = this.calculateDamageMultiplier(rawDamage, targetDefense);
            const elementMult = this.getElementMultiplier(skillData.element, defender.element);
            
            let finalDamage = Math.max(1, Math.floor(rawDamage * defMult * elementMult));
            
            if (skillData.category === 'physical' && partyTraits.physicalDamageReduction) {
                finalDamage = Math.floor(finalDamage * (1 - partyTraits.physicalDamageReduction));
            }

            return { amount: finalDamage, evasionChance, isMiss: false, elementMult, isCrit };
        }
    }
}
