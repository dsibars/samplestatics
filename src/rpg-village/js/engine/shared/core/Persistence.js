const DEBUG = false;

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
            if (DEBUG) console.error(`Engine Persistence: Failed to save ${key}`, e);
            return false;
        }
    }

    load(key, defaultValue = null) {
        try {
            const fullKey = this._key(key);
            const serialized = localStorage.getItem(fullKey);
            if (DEBUG) console.log(`Persistence: Loading ${fullKey}`, serialized ? 'FOUND' : 'NOT FOUND');
            if (serialized === null) return defaultValue;
            return JSON.parse(serialized);
        } catch (e) {
            if (DEBUG) console.error(`Engine Persistence: Failed to load ${key}`, e);
            return defaultValue;
        }
    }

    remove(key) {
        localStorage.removeItem(this._key(key));
    }

    clear() {
        if (DEBUG) console.warn(`Persistence: CLEARING ALL DATA with prefix ${this.prefix}`);
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                if (DEBUG) console.log(`Persistence: Removing ${key}`);
                localStorage.removeItem(key);
            }
        });
        // Cleanup legacy raw keys that bypassed the prefix
        localStorage.removeItem('academy_designs');
    }
}

export const persistence = new Persistence();
