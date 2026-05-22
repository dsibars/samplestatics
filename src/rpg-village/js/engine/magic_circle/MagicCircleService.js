import { GLYPH_DATA, MAGIC_CIRCLE_SLOTS } from '../shared/data/GameConstants.js';
import { Result } from '../shared/core/Result.js';

/**
 * MagicCircleService handles spell composition, cost calculation, and codex management.
 */
export class MagicCircleService {
    /**
     * Compose a spell from a list of glyph IDs.
     * @param {string[]} glyphIds - Array of glyph IDs (first must be core)
     * @returns {Result} { spell: { name, mpCost, damage, element, targetType, waves, glyphIds } }
     */
    static compose(glyphIds) {
        if (!glyphIds || glyphIds.length === 0) {
            return Result.fail('error_no_glyphs');
        }

        const glyphs = glyphIds.map(id => GLYPH_DATA[id]).filter(Boolean);
        if (glyphs.length === 0) {
            return Result.fail('error_invalid_glyphs');
        }

        const core = glyphs.find(g => g.type === 'core');
        if (!core) {
            return Result.fail('error_no_core_glyph');
        }

        if (glyphs.length > MAGIC_CIRCLE_SLOTS) {
            return Result.fail('error_too_many_glyphs');
        }

        let totalDamageMult = 1.0;
        let totalCostMult = 1.0;
        let targetType = 'single_enemy';
        let waves = 1;

        for (const glyph of glyphs) {
            if (glyph.damageMult) {
                totalDamageMult *= glyph.damageMult;
            }
            if (glyph.costMult) {
                totalCostMult *= glyph.costMult;
            }
            if (glyph.targetType) {
                targetType = glyph.targetType;
            }
            if (glyph.waves) {
                waves = glyph.waves;
            }
        }

        const mpCost = Math.max(1, Math.floor(core.baseCost * totalCostMult));
        const damage = Math.floor(core.baseDamage * totalDamageMult);

        const spell = {
            id: `spell_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: `${core.element} Spell`,
            mpCost,
            damage,
            element: core.element,
            targetType,
            waves,
            glyphIds: [...glyphIds]
        };

        return Result.ok(spell);
    }

    /**
     * Get available glyphs for a hero based on their magic tier.
     * @param {number} magicTier
     * @returns {Object[]} Array of glyph data objects
     */
    static getAvailableGlyphs(magicTier = 1) {
        return Object.values(GLYPH_DATA).filter(g => g.tier <= magicTier);
    }

    /**
     * Calculate magic tier from spell casting experience.
     * @param {number} magicXp
     * @returns {number} Current magic tier (1-4)
     */
    static getMagicTier(magicXp) {
        if (magicXp >= 50) return 4;
        if (magicXp >= 30) return 3;
        if (magicXp >= 15) return 2;
        return 1;
    }
}
