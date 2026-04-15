import { Result } from '../core/Result.js';

export class GymService {
    constructor(playerService, villageService, heroService, inventoryService) {
        this.player = playerService;
        this.village = villageService;
        this.heroes = heroService;
        this.inventory = inventoryService;

        this.TRAINING_REGIMES = {
            light_sparring: { id: 'light_sparring', duration: 3600000, exp: 50 },
            endurance_run: { id: 'endurance_run', duration: 10800000, exp: 200, goldChance: 0.3 },
            master_class: { id: 'master_class', duration: 28800000, exp: 600, itemChance: 0.2 },
            heroic_pilgrimage: { id: 'heroic_pilgrimage', duration: 86400000, exp: 2000, coreReward: 1 }
        };
    }

    isUnlocked() {
        return this.village.getBuildingLevel('gymLevel') > 0;
    }

    startTraining(heroId, regimeId) {
        const hero = this.heroes.get(heroId);
        if (!hero) return Result.fail('error_hero_not_found');
        if (hero.status !== 'resting') return Result.fail('error_hero_busy');

        const regime = this.TRAINING_REGIMES[regimeId];
        if (!regime) return Result.fail('error_invalid_regime');

        hero.status = 'training';
        hero.trainingSession = {
            regimeId: regimeId,
            startTime: Date.now()
        };
        this.heroes.save(hero);
        return Result.ok(hero);
    }

    claimTraining(heroId) {
        const hero = this.heroes.get(heroId);
        if (!hero || !hero.trainingSession) return Result.fail('error_no_session');

        const regime = this.TRAINING_REGIMES[hero.trainingSession.regimeId];
        const elapsed = Date.now() - hero.trainingSession.startTime;

        if (elapsed < regime.duration) return Result.fail('error_training_ongoing');

        const gymMult = 1 + (this.village.getBuildingLevel('gymLevel') / 100);
        const expGained = Math.floor(regime.exp * gymMult);

        const levelsGained = hero.addExperience(expGained).data;

        let rewards = { exp: expGained, levels: levelsGained, gold: 0, cores: 0, item: null };

        if (regime.goldChance && Math.random() < regime.goldChance) {
            rewards.gold = Math.floor(50 * gymMult);
            this.player.addGold(rewards.gold);
        }
        if (regime.coreReward) {
            rewards.cores = regime.coreReward;
            this.player.addCores(rewards.cores);
        }
        if (regime.itemChance && Math.random() < regime.itemChance) {
            rewards.item = 'tiny_potion';
            this.inventory.addItem(rewards.item);
        }

        hero.status = 'resting';
        delete hero.trainingSession;
        this.heroes.save(hero);

        return Result.ok(rewards);
    }
}
