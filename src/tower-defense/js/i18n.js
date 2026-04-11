export const TRANSLATIONS = {
  es: {
    app_title: "Defensa de la Torre",
    menu_start: "INICIAR JUEGO",
    menu_settings: "AJUSTES",
    btn_back: "← VOLVER",
    stat_lives: "❤️ ",
    stat_money: "💰 ",
    stat_wave: "🌊 Oleada ",
    game_over_win: "¡VICTORIA! Sobreviviste todas las oleadas.",
    game_over_lose: "FIN DEL JUEGO. Te has quedado sin vidas.",
    lang: "Idioma",
    tower_basic_blaster: "Blaster Básico",
    tower_basic_desc: "Barato, fiable y ligeramente molesto.",
    tower_heavy_cannon: "Cañón Pesado",
    tower_heavy_desc: "Lento pero pega muy duro.",
    stats_damage: "Daño:",
    stats_range: "Radio:",
    stats_cooldown: "CD:",
    tap_to_place: "Toca un cuadrado libre para colocar una torre."
  },
  en: {
    app_title: "Tower Defense",
    menu_start: "START GAME",
    menu_settings: "SETTINGS",
    btn_back: "← BACK",
    stat_lives: "❤️ ",
    stat_money: "💰 ",
    stat_wave: "🌊 Wave ",
    game_over_win: "VICTORY! You survived all waves.",
    game_over_lose: "GAME OVER. You lost all your lives.",
    lang: "Language",
    tower_basic_blaster: "Basic Blaster",
    tower_basic_desc: "Cheap, reliable, and slightly annoying.",
    tower_heavy_cannon: "Heavy Cannon",
    tower_heavy_desc: "Slow to fire but packs a serious punch.",
    stats_damage: "Dmg:",
    stats_range: "Range:",
    stats_cooldown: "CD:",
    tap_to_place: "Tap an empty square to place a tower."
  }
};

const SHARED_KEY = 'static_apps_lang';

export let currentLang = localStorage.getItem(SHARED_KEY) || 'en';

export function t(key) {
  if (!TRANSLATIONS[currentLang]) return key;
  return TRANSLATIONS[currentLang][key] || TRANSLATIONS['en'][key] || key;
}

export function changeLanguage() {
  const selector = document.getElementById('lang-selector');
  if (selector) {
    currentLang = selector.value;
    localStorage.setItem(SHARED_KEY, currentLang);
    location.reload(); 
  }
}

export function applyTranslations() {
  document.documentElement.lang = currentLang;
  const selector = document.getElementById('lang-selector');
  if (selector) selector.value = currentLang;
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n'));
  });
}
