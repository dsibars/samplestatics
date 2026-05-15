import { BaseView } from '../BaseView.js';

export class InventoryView extends BaseView {
    constructor() {
        super('inventory');
    }

    onMount() {
        console.log('InventoryView mounted');
    }

    onUpdate(state) {
        // Implementation for inventory grid
    }
}
