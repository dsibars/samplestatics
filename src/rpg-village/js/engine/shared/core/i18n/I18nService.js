import { en } from './translations/en.js';
import { es } from './translations/es.js';
import { ca } from './translations/ca.js';
import { eu } from './translations/eu.js';
import { gl } from './translations/gl.js';

import { persistence } from '../Persistence.js';

export class I18nService {
    constructor() {
        this.translations = { en, es, ca, eu, gl };
        this.currentLang = persistence.load('settings_lang', 'en');
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            persistence.save('settings_lang', lang);
            return true;
        }
        return false;
    }

    t(key, params = {}) {
        const langData = this.translations[this.currentLang];
        let text = langData[key] || this.translations['en'][key] || key;

        // Simple param replacement: {name} -> params.name
        Object.keys(params).forEach(p => {
            text = text.replace(`{${p}}`, params[p]);
        });

        return text;
    }
}

export const i18n = new I18nService();
