/**
 * TrainerService generates gruff dialogue hints based on hero technique progress.
 */
export class TrainerService {
    /**
     * Get trainer dialogue for a hero.
     * @param {Hero} hero
     * @param {Object} i18n
     * @returns {Object} { lines: string[], category: string }
     */
    static getDialogue(hero, i18n) {
        const families = Object.keys(hero.techniqueUses || {});
        const tiers = hero.techniqueTiers || {};

        // Check for high-tier mastery first
        const highTierFamily = families.find(f => (tiers[f] || 1) >= 5);
        if (highTierFamily) {
            return {
                category: 'high_tier',
                lines: this._getLines('high_tier', i18n, { family: highTierFamily, tier: tiers[highTierFamily] })
            };
        }

        // Check progress toward next tier for each family
        let bestProgress = { family: null, progress: 0, threshold: 1 };
        for (const family of families) {
            const currentTier = tiers[family] || 1;
            const uses = hero.techniqueUses[family] || 0;
            const threshold = this._getTierThreshold(currentTier + 1);
            const progress = uses / threshold;
            if (progress > bestProgress.progress) {
                bestProgress = { family, progress, threshold, uses };
            }
        }

        // If no families used yet
        if (families.length === 0) {
            return {
                category: 'no_family',
                lines: this._getLines('no_family', i18n)
            };
        }

        // Determine category based on best progress
        let category = 'far';
        if (bestProgress.progress >= 0.75) category = 'near';
        else if (bestProgress.progress >= 0.25) category = 'approaching';

        return {
            category,
            lines: this._getLines(category, i18n, {
                family: bestProgress.family,
                uses: bestProgress.uses,
                threshold: bestProgress.threshold
            })
        };
    }

    static _getTierThreshold(tier) {
        if (tier <= 1) return 0;
        return Math.floor(100 * Math.pow(3, tier - 2));
    }

    static _getLines(category, i18n, ctx = {}) {
        const t = (key) => i18n ? i18n.t(key) : key;
        const familyName = ctx.family ? t(`family_${ctx.family}`) : '';
        const lines = [];

        switch (category) {
            case 'no_family':
                lines.push(t('trainer_no_family_1'));
                lines.push(t('trainer_no_family_2'));
                break;
            case 'far':
                lines.push(t('trainer_far_1').replace('{family}', familyName));
                lines.push(t('trainer_far_2').replace('{family}', familyName));
                break;
            case 'approaching':
                lines.push(t('trainer_approaching_1').replace('{family}', familyName));
                lines.push(t('trainer_approaching_2').replace('{family}', familyName));
                break;
            case 'near':
                lines.push(t('trainer_near_1').replace('{family}', familyName));
                lines.push(t('trainer_near_2').replace('{family}', familyName));
                break;
            case 'high_tier':
                lines.push(t('trainer_high_tier_1').replace('{family}', familyName).replace('{tier}', ctx.tier));
                lines.push(t('trainer_high_tier_2').replace('{family}', familyName));
                break;
        }

        return lines.filter(Boolean);
    }
}
