import { BaseView } from '../BaseView.js';

export class BuildingsView extends BaseView {
    constructor() {
        super('buildings');
    }

    onMount() {
        console.log('BuildingsView mounted');
    }

    onUpdate(state) {
        // Implementation for buildings list
    }
}
