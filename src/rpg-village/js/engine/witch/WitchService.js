/**
 * WitchService generates mystical dialogue hints about magic and glyphs.
 */
export class WitchService {
    static getDialogue(hero, i18n) {
        const hasMage = hero.origin === 'origin_arcane_initiate';
        const hasGlyphs = hero.knownGlyphs && hero.knownGlyphs.length > 0;
        const hasSpells = hero.spellCodex && hero.spellCodex.length > 0;
        const magicTier = hero.magicTier || 0;

        let category = 'novice';
        if (hasSpells && magicTier >= 13) category = 'master';
        else if (hasSpells) category = 'practitioner';
        else if (hasGlyphs) category = 'seeker';
        else if (hasMage) category = 'awakened';

        return {
            category,
            lines: this._getLines(category, i18n, { heroName: hero.name, tier: magicTier })
        };
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
