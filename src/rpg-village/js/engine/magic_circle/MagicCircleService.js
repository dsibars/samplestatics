import { GLYPH_DATA, MAGIC_TIER_THRESHOLDS } from '../shared/data/GameConstants.js';
import { Result } from '../shared/core/Result.js';

/**
 * MagicCircleService handles spell composition, cost calculation, and codex management.
 */
export class MagicCircleService {
    /**
     * Get the number of circle slots for a given magic tier.
     * Tier = slot count (Tier 1 = 1 slot, Tier 25 = 25 slots).
     */
    static getSlotCount(magicTier) {
        return Math.max(1, Math.min(25, magicTier || 1));
    }

    /**
     * Compose a spell from a list of glyph IDs.
     * @param {string[]} glyphIds - Array of glyph IDs (first must be core)
     * @param {number} magicTier - Hero's magic tier (determines max slots)
     * @returns {Result} { spell: { name, mpCost, damage, element, targetType, waves, glyphIds } }
     */
    static compose(glyphIds, magicTier = 1) {
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

        const maxSlots = this.getSlotCount(magicTier);
        if (glyphs.length > maxSlots) {
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
     * @param {number} magicXp - cumulative Magic Insight
     * @returns {number} Current magic tier (1-25)
     */
    static getMagicTier(magicXp) {
        let tier = 1;
        for (let i = 1; i < MAGIC_TIER_THRESHOLDS.length; i++) {
            if (magicXp >= MAGIC_TIER_THRESHOLDS[i]) {
                tier = i + 1;
            } else {
                break;
            }
        }
        return Math.min(25, tier);
    }
}
