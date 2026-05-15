import { BaseView } from '../BaseView.js';

export class ExploreView extends BaseView {
    constructor() {
        super('explore');
    }

    onMount() {
        console.log('ExploreView mounted');
    }

    onUpdate(state) {
        // Implementation for world map and expeditions
    }
}
