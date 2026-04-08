import { applyTranslations, changeLanguage } from './i18n.js';

window.onload = () => {
    applyTranslations();
};

window.changeLanguage = changeLanguage;
