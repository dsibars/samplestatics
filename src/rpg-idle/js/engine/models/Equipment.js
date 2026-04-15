export class Equipment {
    constructor(data) {
        this.id = data.id || crypto.randomUUID();
        this.type = data.type; // 'weapon' or 'armor'
        this.material = data.material; // 'wooden', 'iron', etc
        this.level = data.level || 0;
        this.affixes = data.affixes || [];

        // For weapons
        this.family = data.family || null; // 'dagger', 'broadsword', etc

        // For armor
        this.archetype = data.archetype || null; // 'plate', 'leather', 'robes'
        this.slot = data.slot || null; // 'head', 'body', 'legs'
    }

    increaseLevel() {
        this.level++;
        return this.level;
    }

    addAffix(affix) {
        if (!this.affixes.includes(affix)) {
            this.affixes.push(affix);
            return true;
        }
        return false;
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            material: this.material,
            level: this.level,
            affixes: [...this.affixes],
            family: this.family,
            archetype: this.archetype,
            slot: this.slot
        };
    }
}
