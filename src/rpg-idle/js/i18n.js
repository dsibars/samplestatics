const translations = {
    en: {
        subtitle: "Adventure & Recruit",
        btn_adventure: "ADVENTURE",
        btn_village: "VILLAGE",
        btn_settings: "SETTINGS",
        btn_back: "BACK",
        btn_quit: "QUIT",
        settings_title: "SETTINGS",
        lang: "Language",
        tavern_title: "Recruit Heroes",
        shop_title: "Item Shop",
        current_gold: "Current Gold",
        btn_recruit: "RECRUIT",
        btn_buy: "BUY",
        basic_attack: "Attack",
        double_attack: "Double Attack (10 MP)",
        basic_ice_ball: "Ice Ball (15 MP)",
        tiny_potion: "Tiny Potion",
        tiny_mana_potion: "Tiny Mana Potion",
        hero_limit: "Hero limit reached!",
        not_enough_gold: "Not enough gold!",
        victory: "VICTORY!",
        defeat: "DEFEAT",
        milestone: "Milestone",
        lvl: "Lvl",
        hp: "HP",
        mp: "MP",
        upgrades_title: "Village Upgrades",
        attack_boost: "Attack Boost",
        defense_boost: "Defense Boost",
        hp_boost: "HP Boost"
    },
    es: {
        subtitle: "Aventura y Recluta",
        btn_adventure: "AVENTURA",
        btn_village: "ALDEA",
        btn_settings: "AJUSTES",
        btn_back: "VOLVER",
        btn_quit: "SALIR",
        settings_title: "AJUSTES",
        lang: "Idioma",
        tavern_title: "Reclutar Héroes",
        shop_title: "Tienda de Objetos",
        current_gold: "Oro Actual",
        btn_recruit: "RECLUTAR",
        btn_buy: "COMPRAR",
        basic_attack: "Ataque",
        double_attack: "Ataque Doble (10 MP)",
        basic_ice_ball: "Bola de Hielo (15 MP)",
        tiny_potion: "Poción Pequeña",
        tiny_mana_potion: "Poción de Maná Pequeña",
        hero_limit: "¡Límite de héroes alcanzado!",
        not_enough_gold: "¡No hay suficiente oro!",
        victory: "¡VICTORIA!",
        defeat: "DERROTA",
        milestone: "Hito",
        lvl: "Niv",
        hp: "PV",
        mp: "PM",
        upgrades_title: "Mejoras de la Aldea",
        attack_boost: "Mejora de Ataque",
        defense_boost: "Mejora de Defensa",
        hp_boost: "Mejora de PV"
    }
};

export let currentLang = localStorage.getItem('rpg_lang') || 'en';

export function t(key) {
    return translations[currentLang][key] || key;
}

export function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerText = t(key);
    });
}

export function changeLanguage() {
    const selector = document.getElementById('lang-selector');
    currentLang = selector.value;
    localStorage.setItem('rpg_lang', currentLang);
    applyTranslations();
}
