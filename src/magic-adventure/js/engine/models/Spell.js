export class Spell {
    constructor({ name, type, element, mpCost, damage, effects = [], composition = null }) {
        this.name = name;
        this.type = type;
        this.element = element;
        this.mpCost = mpCost;
        this.damage = damage;
        this.effects = effects; // e.g., ['multi-target', 'storm']
        this.composition = composition; // { core: string, modifiers: { name: count } }
    }
}
