export class Spell {
    constructor({ name, type, element, mpCost, damage, effects = [] }) {
        this.name = name;
        this.type = type;
        this.element = element;
        this.mpCost = mpCost;
        this.damage = damage;
        this.effects = effects; // e.g., ['multi-target', 'storm']
    }
}
