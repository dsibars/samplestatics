import { SKILLS_DATA } from '../../data/GameConstants.js';

export class CombatAI {
    /**
     * Decides the best action for the actor based on the combat context.
     * @param {Object} context { actor: actor, allies: [], enemies: [], type: "smart"|"random" }
     * @returns {Object} { skillId, targetIndex }
     */
    static decideAction(context) {
        const { actor, allies, enemies, type } = context;
        
        // Filter skills by MP availability
        const availableSkills = Object.keys(actor.skills || {}).filter(sId => {
            const data = SKILLS_DATA[sId];
            return data && actor.mp >= data.mpCost;
        });

        // 1. Check for Healing needs (Smart only)
        const injuredAllies = allies.filter(a => a.hp > 0 && a.hp / a.maxHp <= 0.7);

        if (injuredAllies.length > 0 && type === 'smart') {
            const healSkills = availableSkills
                .map(sId => SKILLS_DATA[sId])
                .filter(s => s.category === 'support' && s.power > 0 && (s.targetType === 'single_ally' || s.targetType === 'all_allies'))
                .sort((a, b) => (b.power || 0) - (a.power || 0));

            if (healSkills.length > 0) {
                const groupHeal = healSkills.find(s => s.targetType === 'all_allies');
                if (groupHeal && injuredAllies.length >= 2) {
                    return { skillId: groupHeal.id, targetIndex: null };
                }

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

        // 2. Offensive logic
        const attackSkills = availableSkills
            .map(sId => SKILLS_DATA[sId])
            .filter(s => s.category !== 'support')
            .sort((a, b) => (b.baseMultiplier || 0) - (a.baseMultiplier || 0));

        let chosenSkill = attackSkills[0] || SKILLS_DATA['basic_attack'];

        // 3. Targeting & AoE decision
        let targetIndex = 0;
        const aliveEnemies = enemies
            .map((e, idx) => ({ e, idx }))
            .filter(item => item.e.hp > 0);

        const aoeSkill = attackSkills.find(s => s.targetType === 'all_enemies');
        if (aoeSkill && aliveEnemies.length > 1 && type === 'smart') {
            chosenSkill = aoeSkill;
        }
        
        if (aliveEnemies.length > 0) {
            if (type === 'smart') {
                aliveEnemies.sort((a, b) => a.e.hp - b.e.hp);
                targetIndex = aliveEnemies[0].idx;
            } else {
                targetIndex = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)].idx;
            }
        }

        return { 
            skillId: chosenSkill.id, 
            targetIndex: (chosenSkill.targetType === 'single_enemy' || chosenSkill.targetType === 'single_ally') ? targetIndex : null
        };
    }
}
