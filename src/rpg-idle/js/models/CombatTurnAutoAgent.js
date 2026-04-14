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
        const criticalAllies = allies.filter(a => a.hp > 0 && a.hp / a.maxHp <= 0.4); // < 40% HP

        if (injuredAllies.length > 0) {
            // Find best heal skill
            const healSkills = availableSkills
                .map(sId => SKILLS_DATA[sId])
                .filter(s => s.category === 'support' && (s.targetType === 'single_ally' || s.targetType === 'all_allies'))
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
                    return { skillId: singleHeal.id, targetIndex };
                }
            }
        }

        // 2. Offensive logic
        const attackSkills = availableSkills
            .map(sId => SKILLS_DATA[sId])
            .filter(s => s.category !== 'support')
            .sort((a, b) => (b.baseMultiplier || 0) - (a.baseMultiplier || 0));

        // Default to basic_attack if nothing else
        let chosenSkill = attackSkills[0] || SKILLS_DATA['basic_attack'];

        // If we have multiple enemies, favor AoE (if any exist in data)
        const aoeSkill = attackSkills.find(s => s.targetType === 'all_enemies');
        if (aoeSkill && enemies.filter(e => e.hp > 0).length > 1) {
            chosenSkill = aoeSkill;
        }

        // 3. Targeting
        let targetIndex = 0;
        const aliveEnemies = enemies.map((e, idx) => ({ e, idx })).filter(item => item.e.hp > 0);
        
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
            targetIndex: chosenSkill.targetType === 'single_enemy' ? targetIndex : null 
        };
    }
}
