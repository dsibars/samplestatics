import { Spell } from '../models/Spell.js';

export class SpellService {
    constructor(recognitionEngine) {
        this.recognitionEngine = recognitionEngine;
        this.mappings = {
            'circle': { element: 'Water', baseDamage: 10, baseCost: 10, name: 'Water Ball' },
            'square': { element: 'Earth', baseDamage: 15, baseCost: 15, name: 'Stone Blast' },
            'plus': { effect: 'multi-target', nameModifier: 'Burst' }
        };
    }

    /**
     * Converts recognized patterns into a Spell object.
     */
    createSpellFromStrokes(strokes) {
        const recognized = this.recognitionEngine.recognize(strokes);

        if (recognized.length === 0) {
            return new Spell({
                name: 'Fizzle',
                type: 'none',
                element: 'None',
                mpCost: 1,
                damage: 0
            });
        }

        let mainPattern = null;
        const effects = [];
        let totalIntensity = 0;

        recognized.forEach(item => {
            const config = this.mappings[item.type];
            if (config) {
                if (config.element && !mainPattern) {
                    mainPattern = { ...item, config };
                } else if (config.effect) {
                    effects.push(config.effect);
                }
            }

            // Intensity based on size relative to some arbitrary "large" size (e.g., 200px)
            if (item.metadata && item.metadata.boundingBox) {
                const size = Math.max(item.metadata.boundingBox.width, item.metadata.boundingBox.height);
                totalIntensity += size / 200;
            }
        });

        if (!mainPattern) {
            return new Spell({
                name: 'Basic Spark',
                type: 'spark',
                element: 'Neutral',
                mpCost: 5,
                damage: Math.round(5 * totalIntensity)
            });
        }

        const baseDamage = mainPattern.config.baseDamage;
        const baseCost = mainPattern.config.baseCost;

        // Final calculation
        let intensity = Math.min(2, totalIntensity); // Cap intensity for now
        let damage = Math.round(baseDamage * intensity);
        let mpCost = Math.round(baseCost * intensity);

        let name = mainPattern.config.name;
        if (effects.includes('multi-target')) {
            name = `${name} ${this.mappings['plus'].nameModifier}`;
            damage = Math.round(damage * 0.7); // Split damage for multi-target
            mpCost = Math.round(mpCost * 1.5);
        }

        return new Spell({
            name,
            type: mainPattern.type,
            element: mainPattern.config.element,
            mpCost: Math.min(100, mpCost),
            damage,
            effects
        });
    }
}
