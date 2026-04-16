import { engine } from '../engine/Engine.js';
import { HeroDetailsView } from './views/HeroDetailsView.js';

async function initV2() {
    // 1. Initialize Engine (auto-loads from localStorage)
    console.log('Initializing Engine...');

    // 2. Setup Mock Hero if none exists (for POC)
    if (engine.heroes.total() === 0) {
        console.log('No heroes found, setting up POC hero...');
        const result = engine.heroes.add({
            name: 'Hero Protagonist',
            origin: 'origin_warrior'
        });

        if (result.success) {
            const hero = result.data;
            // Give some levels and points
            hero.addExperience(500); // Should be enough for several levels
            hero.statPoints = 15;
            hero.skillPoints = 10;

            // Give some gold and equipment
            engine.player.addGold(5000);

            // Generate some gear
            const weaponResult = engine.inventory.addEquipment({
                type: 'weapon',
                family: 'sword',
                material: 'steel',
                level: 3
            });

            const armorResult = engine.inventory.addEquipment({
                type: 'armor',
                archetype: 'plate',
                slot: 'body',
                material: 'iron',
                level: 1
            });

            if (weaponResult.success) {
                engine.heroes.equipItem(hero.id, 'rightHand', weaponResult.data.id);
            }
            if (armorResult.success) {
                engine.heroes.equipItem(hero.id, 'body', armorResult.data.id);
            }

            engine.heroes.save(hero);
        }
    }

    const heroes = engine.heroes.list();
    const heroId = heroes[0].id;

    // 3. Render View
    const mainContent = document.getElementById('main-content');
    const heroDetails = new HeroDetailsView({ heroId });
    heroDetails.mount(mainContent);
}

document.addEventListener('DOMContentLoaded', initV2);
