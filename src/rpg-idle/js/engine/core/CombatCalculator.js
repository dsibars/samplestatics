export class CombatCalculator {
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
        let sAttacker = attacker.speed || 1;
        let sDefender = defender.speed || 1;

        // Apply accuracy/evasion bonuses if they exist
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
}
