import { BaseView } from '../BaseView.js';

/**
 * VillageView - Manages the main village dashboard.
 */
export class VillageView extends BaseView {
    constructor() {
        super('village');
    }

    onMount() {
        console.log('VillageView mounted');
        this.elements = {
            pop: this.$('#village-pop'),
            day: this.$('#village-day')
        };
    }

    onUpdate(state) {
        if (!state.village) return;

        if (this.elements.pop) {
            const { total, max } = state.village.population;
            this.elements.pop.textContent = `${total} / ${max}`;
        }
        if (this.elements.day) {
            this.elements.day.textContent = state.village.day;
        }
    }
}
