export class Persistence {
    constructor(prefix = 'rpg_village_v1_') {
        this.prefix = prefix;
    }

    _key(key) {
        return `${this.prefix}${key}`;
    }

    save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(this._key(key), serialized);
            return true;
        } catch (e) {
            console.error(`Engine Persistence: Failed to save ${key}`, e);
            return false;
        }
    }

    load(key, defaultValue = null) {
        try {
            const fullKey = this._key(key);
            const serialized = localStorage.getItem(fullKey);
            console.log(`Persistence: Loading ${fullKey}`, serialized ? 'FOUND' : 'NOT FOUND');
            if (serialized === null) return defaultValue;
            return JSON.parse(serialized);
        } catch (e) {
            console.error(`Engine Persistence: Failed to load ${key}`, e);
            return defaultValue;
        }
    }

    remove(key) {
        localStorage.removeItem(this._key(key));
    }

    clear() {
        console.warn(`Persistence: CLEARING ALL DATA with prefix ${this.prefix}`);
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                console.log(`Persistence: Removing ${key}`);
                localStorage.removeItem(key);
            }
        });
    }
}

export const persistence = new Persistence();
