import { Spell } from '../models/Spell.js';

export class SpellService {
    constructor(recognitionEngine) {
        this.recognitionEngine = recognitionEngine;
        this.cores = {
            'caret_right': { element: 'Fire', baseDamage: 20, baseCost: 10, name: 'Fire' },
            'caret_left': { element: 'Water', baseDamage: 12, baseCost: 8, name: 'Water' },
            'caret_down': { element: 'Earth', baseDamage: 15, baseCost: 12, name: 'Earth' },
            'caret_up': { element: 'Light', baseDamage: 8, baseCost: 15, name: 'Light', effect: 'defense' },
            'sleep': { element: 'Neutral', baseDamage: 0, baseCost: 20, name: 'Neutral', effect: 'sleep' },
            'poison': { element: 'Poison', baseDamage: 4, baseCost: 10, name: 'Poison', effect: 'poison' },

            // Legacy support
            'fire': { element: 'Fire', baseDamage: 20, baseCost: 10, name: 'Fire' },
            'water': { element: 'Water', baseDamage: 12, baseCost: 8, name: 'Water' },
            'square': { element: 'Earth', baseDamage: 15, baseCost: 12, name: 'Earth' },
            'circle': { element: 'Light', baseDamage: 8, baseCost: 15, name: 'Light', effect: 'defense' }
        };

        this.complements = {
            'plus': { type: 'boost', costMod: 1.25, effectMod: 1.25, nameModifier: 'Greater' },
            'dash': { type: 'reduce', costMod: 0.75, effectMod: 0.75, nameModifier: 'Minor' },
            'infinity': { type: 'all', costMod: 1.5, effectMod: 1.0, nameModifier: 'Echoing' },
            'arrow': { type: 'pierce', costMod: 1.2, effectMod: 1.0, nameModifier: 'Piercing' },
            // Also map caret directions to complements if drawn in complement zone
            'caret_right': { type: 'pierce', costMod: 1.2, effectMod: 1.0, nameModifier: 'Piercing' }
        };
    }

    /**
     * Converts recognized patterns into a Spell object using Magic Circle logic.
     */
    createSpellFromStrokes(strokes, canvasSize) {
        const recognized = this.recognitionEngine.recognize(strokes, canvasSize);
        this.lastRecognized = recognized; // For visual feedback

        recognized.forEach(r => {
            console.log(`[SpellService] Recognized: ${r.type} (score: ${r.score.toFixed(2)}) in zone: ${r.zone}`);
        });

        if (recognized.length === 0) {
            return this.fizzle('Emptiness');
        }

        const coreItems = recognized.filter(r => r.zone === 'core' && r.type !== 'unknown');
        if (coreItems.length === 0) return this.fizzle('No Core');

        // Exactly ONE core symbol
        if (coreItems.length > 1) return this.fizzle('Unstable Core (Multiple Symbols)');

        const coreType = coreItems[0].type;
        const coreConfig = this.cores[coreType];
        if (!coreConfig) return this.fizzle(`Unknown Core: ${coreType}`);

        const slices = { 0: null, 1: null, 2: null, 3: null };
        let failed = false;

        recognized.forEach(item => {
            if (item.zone.startsWith('complement-')) {
                const sliceId = parseInt(item.zone.split('-')[1]);
                if (item.type === 'unknown') {
                    failed = true;
                    return;
                }

                const compConfig = this.complements[item.type];
                if (!compConfig) {
                    failed = true;
                    return;
                }

                if (slices[sliceId] === null) {
                    slices[sliceId] = { type: item.type, count: 1, config: compConfig };
                } else if (slices[sliceId].type === item.type) {
                    slices[sliceId].count++;
                } else {
                    // Mixing different types in the same slice
                    failed = true;
                }
            }
        });

        if (failed) return this.fizzle('Ambitious Failure');

        let damage = coreConfig.baseDamage;
        let mpCost = coreConfig.baseCost;
        let name = coreConfig.name;
        const effects = coreConfig.effect ? [coreConfig.effect] : [];
        const modifiers = {};

        Object.values(slices).forEach(slice => {
            if (!slice) return;

            modifiers[slice.config.type] = (modifiers[slice.config.type] || 0) + slice.count;

            for (let i = 0; i < slice.count; i++) {
                mpCost *= slice.config.costMod;
                if (slice.config.effectMod) {
                    damage *= slice.config.effectMod;
                }
            }

            if (slice.config.type === 'all' && !effects.includes('multi-target')) {
                effects.push('multi-target');
            } else if (slice.config.type === 'pierce' && !effects.includes('pierce')) {
                effects.push('pierce');
            }
        });

        // Dynamic Naming based on user feedback
        let prefixes = [];
        if (modifiers['all']) prefixes.push('Multi');
        if (modifiers['pierce']) prefixes.push('Piercing');

        if (modifiers['boost'] === 1) prefixes.push('Super');
        else if (modifiers['boost'] === 2) prefixes.push('Mega');
        else if (modifiers['boost'] >= 3) prefixes.push('Ultra');

        if (modifiers['reduce'] === 1) prefixes.push('Mini');
        else if (modifiers['reduce'] >= 2) prefixes.push('Tiny');

        if (prefixes.length > 0) {
            name = `${prefixes.join(' ')} ${name}`;
        }

        return new Spell({
            name,
            type: coreType,
            element: coreConfig.element,
            mpCost: Math.round(mpCost),
            damage: Math.round(damage),
            effects,
            composition: {
                core: coreConfig.name,
                modifiers
            }
        });
    }

    fizzle(reason) {
        return new Spell({
            name: `Failure to Cast (${reason})`,
            type: 'none',
            element: 'None',
            mpCost: 1,
            damage: 0
        });
    }
}
