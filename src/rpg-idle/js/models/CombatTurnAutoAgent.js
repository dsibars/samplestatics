import { SKILLS_DATA } from '../constants.js';

export class CombatTurnAutoAgent {
    /**
     * Decides the best action for the actor based on the combat context.
     * @param {Object} context { target: actor, allies: [], enemies: [], type: "smart"|"random" }
     * @returns {Object} { skillId, targetIndex, targetIndices }
     */
    static decideAction(context) {
        const { target, allies, enemies, type } = context;
        const availableSkills = Object.keys(target.skills).filter(sId => {
            const data = SKILLS_DATA[sId];
            return data && target.mp >= data.mpCost;
        });

        // 1. Check for Healing needs
        const injuredAllies = allies.filter(a => a.hp > 0 && a.hp / a.maxHp <= 0.7); // < 70% HP

        if (injuredAllies.length > 0) {
            // Find best heal skill (must have power property for actual healing)
            const healSkills = availableSkills
                .map(sId => SKILLS_DATA[sId])
                .filter(s => s.category === 'support' && s.power > 0 && (s.targetType === 'single_ally' || s.targetType === 'all_allies'))
                .sort((a, b) => (b.power || 0) - (a.power || 0));

            if (healSkills.length > 0) {
                // Should we use group heal?
                const groupHeal = healSkills.find(s => s.targetType === 'all_allies');
                if (groupHeal && injuredAllies.length >= 2) {
                    return { skillId: groupHeal.id, targetIndex: null }; // Multi-target
                }

                // Use single target heal on the most injured
                const singleHeal = healSkills.find(s => s.targetType === 'single_ally') || groupHeal;
                if (singleHeal) {
                    const sortedInjured = [...injuredAllies].sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
                    const bestTarget = sortedInjured[0];
                    const targetIndex = allies.indexOf(bestTarget);

                    return {
                        skillId: singleHeal.id,
                        targetIndex: singleHeal.targetType === 'single_ally' ? targetIndex : null
                    };
                }
            }
        }

        // 2. Support logic (non-healing)
        const supportSkills = availableSkills
            .map(sId => SKILLS_DATA[sId])
            .filter(s => s.category === 'support' && (!s.power || s.power <= 0));

        if (supportSkills.length > 0) {
            // For now, only Haste is available. Apply to someone who doesn't have it.
            const hasteSkill = supportSkills.find(s => s.id === 'haste');
            if (hasteSkill) {
                const targetWithoutHaste = allies.find(a => a.hp > 0 && !a.statusEffects.some(e => e.type === 'haste'));
                if (targetWithoutHaste) {
                    return {
                        skillId: hasteSkill.id,
                        targetIndex: hasteSkill.targetType === 'single_ally' ? allies.indexOf(targetWithoutHaste) : null
                    };
                }
            }
        }

        // 3. Offensive logic
        const attackSkills = availableSkills
            .map(sId => SKILLS_DATA[sId])
            .filter(s => s.category !== 'support')
            .sort((a, b) => (b.baseMultiplier || 0) - (a.baseMultiplier || 0));

        // Default to basic_attack if nothing else
        let chosenSkill = attackSkills[0] || SKILLS_DATA['basic_attack'];

        // 4. Targeting & AoE decision
        let targetIndex = 0;
        const aliveEnemies = enemies
            .map((e, idx) => ({ e, idx }))
            .filter(item => item.e.hp > 0);

        // If we have multiple enemies, favor AoE (if any exist in data)
        const aoeSkill = attackSkills.find(s => s.targetType === 'all_enemies');
        if (aoeSkill && aliveEnemies.length > 1) {
            chosenSkill = aoeSkill;
        }
        
        if (aliveEnemies.length > 0) {
            if (type === 'smart') {
                // Focus on lowest HP to eliminate them faster
                aliveEnemies.sort((a, b) => a.e.hp - b.e.hp);
                targetIndex = aliveEnemies[0].idx;
            } else {
                // Random target
                targetIndex = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)].idx;
            }
        }

        return { 
            skillId: chosenSkill.id, 
            targetIndex: (chosenSkill.targetType === 'single_enemy' || chosenSkill.targetType === 'single_ally') ? targetIndex : null
        };
    }
}
