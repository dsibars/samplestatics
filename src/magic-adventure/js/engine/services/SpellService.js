import { Spell } from '../models/Spell.js';

export class SpellService {
    constructor(recognitionEngine) {
        this.recognitionEngine = recognitionEngine;
        this.cores = {
            'fire': { element: 'Fire', baseDamage: 20, baseCost: 10, name: 'Fireball' },
            'water': { element: 'Water', baseDamage: 12, baseCost: 8, name: 'Aqua Wave' },
            'square': { element: 'Earth', baseDamage: 15, baseCost: 12, name: 'Boulder Strike' },
            'circle': { element: 'Light', baseDamage: 8, baseCost: 15, name: 'Holy Shield', effect: 'defense' },
            'sleep': { element: 'Neutral', baseDamage: 0, baseCost: 20, name: 'Deep Sleep', effect: 'sleep' },
            'poison': { element: 'Poison', baseDamage: 4, baseCost: 10, name: 'Venom Cloud', effect: 'poison' }
        };

        this.complements = {
            'plus': { type: 'boost', costMod: 1.25, effectMod: 1.25, nameModifier: 'Greater' },
            'dash': { type: 'reduce', costMod: 0.75, effectMod: 0.75, nameModifier: 'Minor' },
            'infinity': { type: 'all', costMod: 1.5, effectMod: 1.0, nameModifier: 'Echoing' },
            'arrow': { type: 'pierce', costMod: 1.2, effectMod: 1.0, nameModifier: 'Piercing' }
        };
    }

    /**
     * Converts recognized patterns into a Spell object using Magic Circle logic.
     */
    createSpellFromStrokes(strokes, canvasSize) {
        const recognized = this.recognitionEngine.recognize(strokes, canvasSize);
        // LOG FOR DEBUGGING
        recognized.forEach(r => {
            console.log(`[SpellService] Recognized: ${r.type} (score: ${r.score.toFixed(2)}) in zone: ${r.zone}`);
        });

        if (recognized.length === 0) {
            return this.fizzle('Emptiness');
        }

        const coreItems = recognized.filter(r => r.zone === 'core' && r.type !== 'unknown');
        if (coreItems.length === 0) return this.fizzle('No Core');

        const uniqueCoreTypes = [...new Set(coreItems.map(r => r.type))];

        if (uniqueCoreTypes.length > 1) return this.fizzle('Unstable Core');

        const coreType = uniqueCoreTypes[0];
        const coreConfig = this.cores[coreType];
        if (!coreConfig) return this.fizzle(`Unknown Core: ${coreType}`);

        const slices = { 0: null, 1: null, 2: null, 3: null };
        let failed = false;

        recognized.forEach(item => {
            if (item.zone.startsWith('complement-')) {
                const sliceId = parseInt(item.zone.split('-')[1]);
                if (item.type === 'unknown') return;

                const compConfig = this.complements[item.type];
                if (!compConfig) return;

                if (slices[sliceId] === null) {
                    slices[sliceId] = { type: item.type, count: 1, config: compConfig };
                } else if (slices[sliceId].type === item.type) {
                    slices[sliceId].count++;
                } else {
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

            if (slice.config.type === 'all') {
                effects.push('multi-target');
            } else if (slice.config.type === 'pierce') {
                effects.push('pierce');
            }

            name = `${slice.config.nameModifier} ${name}`;
        });

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
            name: `Fizzle (${reason})`,
            type: 'none',
            element: 'None',
            mpCost: 1,
            damage: 0
        });
    }
}
