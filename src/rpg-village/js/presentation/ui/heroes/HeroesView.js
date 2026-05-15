import { BaseView } from '../BaseView.js';

export class HeroesView extends BaseView {
    constructor() {
        super('heroes');
    }

    onMount() {
        console.log('HeroesView mounted');
    }

    onUpdate(state) {
        // Implementation for heroes list
    }
}
