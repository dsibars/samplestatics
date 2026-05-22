/**
 * WitchService generates mystical dialogue hints about magic and glyphs.
 */
export class WitchService {
    static getDialogue(hero, i18n) {
        const hasMage = hero.origin === 'origin_arcane_initiate';
        const hasGlyphs = hero.glyphRepertoire && hero.glyphRepertoire.length > 2;
        const hasSpells = hero.spellCodex && hero.spellCodex.length > 0;
        const magicTier = this._estimateMagicTier(hero);

        let category = 'novice';
        if (hasSpells && magicTier >= 3) category = 'master';
        else if (hasSpells) category = 'practitioner';
        else if (hasGlyphs) category = 'seeker';
        else if (hasMage) category = 'awakened';

        return {
            category,
            lines: this._getLines(category, i18n, { heroName: hero.name, tier: magicTier })
        };
    }

    static _estimateMagicTier(hero) {
        if (!hero.spellCodex) return 0;
        const maxCost = hero.spellCodex.reduce((max, s) => Math.max(max, s.mpCost || 0), 0);
        if (maxCost >= 30) return 4;
        if (maxCost >= 20) return 3;
        if (maxCost >= 10) return 2;
        return 1;
    }

    static _getLines(category, i18n, ctx) {
        const t = (key) => i18n ? i18n.t(key) : key;
        switch (category) {
            case 'novice':
                return [t('witch_novice_1'), t('witch_novice_2')];
            case 'awakened':
                return [t('witch_awakened_1').replace('{name}', ctx.heroName), t('witch_awakened_2')];
            case 'seeker':
                return [t('witch_seeker_1'), t('witch_seeker_2')];
            case 'practitioner':
                return [t('witch_practitioner_1'), t('witch_practitioner_2')];
            case 'master':
                return [t('witch_master_1').replace('{name}', ctx.heroName), t('witch_master_2')];
            default:
                return [t('witch_novice_1')];
        }
    }
}
