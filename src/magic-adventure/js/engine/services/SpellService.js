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

            // Granular intensity based on size.
            // 100px is our "standard" size (intensity 1.0)
            if (item.metadata && item.metadata.boundingBox) {
                const box = item.metadata.boundingBox;
                // Using area/perimeter or diagonal might be more stable than just max side
                const diagonal = Math.sqrt(box.width * box.width + box.height * box.height);
                totalIntensity += diagonal / 141.4; // 141.4 is diagonal of 100x100
            }
        });

        if (!mainPattern) {
            // "Fizzle" or "Spark" intensity
            const intensity = Math.max(0.1, totalIntensity);
            return new Spell({
                name: intensity > 0.5 ? 'Chaos Bolt' : 'Basic Spark',
                type: 'spark',
                element: 'Neutral',
                mpCost: Math.round(5 * intensity),
                damage: Math.round(8 * intensity)
            });
        }

        const baseDamage = mainPattern.config.baseDamage;
        const baseCost = mainPattern.config.baseCost;

        // Every small change in size (totalIntensity) affects damage and cost
        let intensity = totalIntensity;
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
