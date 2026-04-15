import { catalogService } from './services/CatalogService.js';
import { playerService } from './services/PlayerService.js';
import { heroService } from './services/HeroService.js';

class Engine {
    constructor() {
        this.catalog = catalogService;
        this.player = playerService;
        this.heroes = heroService;
    }

    // Global operations could go here
    resetAll() {
        this.player.reset();
        this.heroes.reset();
    }
}

export const engine = new Engine();
