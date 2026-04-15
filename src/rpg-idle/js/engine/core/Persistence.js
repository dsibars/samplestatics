export class Persistence {
    constructor(prefix = 'rpg_engine_') {
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
            const serialized = localStorage.getItem(this._key(key));
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
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
}

export const persistence = new Persistence();
