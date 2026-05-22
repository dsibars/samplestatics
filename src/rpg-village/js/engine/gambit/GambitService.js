import { SKILLS_DATA } from '../shared/data/GameConstants.js';

export class GambitService {
    static CONDITION_TYPES = [
        'self_hp_below',
        'ally_hp_below',
        'self_mp_below',
        'self_stamina_below',
        'always'
    ];

    /**
     * Evaluate a hero's gambits against combat context and return the first matching action.
     * @param {Object} hero - the actor
     * @param {Array} allies - all allies
     * @param {Array} enemies - all enemies
     * @returns {Object|null} { skillId, targetIndex } or null if no gambit matches
     */
    static evaluate(hero, allies, enemies) {
        const gambits = hero.gambits || [];
        const activeGambits = gambits.filter(g => g.enabled !== false);

        for (const gambit of activeGambits) {
            const match = this._checkCondition(gambit.condition, gambit.threshold, hero, allies, enemies);
            if (!match) continue;

            const action = this._resolveAction(gambit, hero, allies, enemies);
            if (action) return action;
        }

        return null;
    }

    static _checkCondition(condition, threshold, hero, allies, enemies) {
        switch (condition) {
            case 'self_hp_below':
                return hero.hp / hero.maxHp <= (threshold ?? 0.5);
            case 'ally_hp_below': {
                const injured = allies.filter(a => a.id !== hero.id && a.hp > 0 && a.hp / a.maxHp <= (threshold ?? 0.5));
                return injured.length > 0;
            }
            case 'self_mp_below':
                return hero.mp / hero.maxMp <= (threshold ?? 0.3);
            case 'self_stamina_below':
                return (hero.stamina || 0) / (hero.maxStamina || 1) <= (threshold ?? 0.3);
            case 'always':
                return true;
            default:
                return false;
        }
    }

    static _resolveAction(gambit, hero, allies, enemies) {
        if (gambit.action === 'use_skill' && gambit.skillId) {
            const skillData = SKILLS_DATA[gambit.skillId];
            if (!skillData) return null;

            // Resource check
            if (skillData.category === 'physical') {
                if ((hero.stamina || 0) < (skillData.staminaCost || 0)) return null;
            } else {
                if (hero.mp < skillData.mpCost) return null;
            }

            const targetIndex = this._pickTarget(skillData, hero, allies, enemies);
            return { skillId: gambit.skillId, targetIndex };
        }
        return null;
    }

    static _pickTarget(skillData, hero, allies, enemies) {
        if (skillData.targetType === 'all_enemies' || skillData.targetType === 'all_allies') {
            return null;
        }

        if (skillData.targetType === 'single_ally' || (skillData.category === 'support' && skillData.power > 0)) {
            // Heal target: lowest HP ratio ally (including self)
            const validAllies = allies.filter(a => a.hp > 0).sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
            if (validAllies.length === 0) return null;
            const bestTarget = validAllies[0];
            return allies.indexOf(bestTarget);
        }

        if (skillData.targetType === 'self') {
            return allies.findIndex(a => a.id === hero.id);
        }

        // Offensive: lowest HP enemy
        const aliveEnemies = enemies.map((e, idx) => ({ e, idx })).filter(item => item.e.hp > 0);
        if (aliveEnemies.length === 0) return null;
        aliveEnemies.sort((a, b) => a.e.hp - b.e.hp);
        return aliveEnemies[0].idx;
    }

    static validateGambit(gambit) {
        if (!gambit) return { valid: false, error: 'error_invalid_gambit' };
        if (!this.CONDITION_TYPES.includes(gambit.condition)) {
            return { valid: false, error: 'error_invalid_gambit_condition' };
        }
        if (gambit.action === 'use_skill' && !gambit.skillId) {
            return { valid: false, error: 'error_invalid_gambit_action' };
        }
        if (gambit.skillId && !SKILLS_DATA[gambit.skillId]) {
            return { valid: false, error: 'error_invalid_skill' };
        }
        return { valid: true };
    }
}
