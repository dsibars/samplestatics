export const TRANSLATIONS = {
  es: {
    app_title: "Defensa de la Torre",
    menu_start: "INICIAR JUEGO",
    menu_settings: "AJUSTES",
    btn_back: "← VOLVER",
    btn_hub: "MENU PRINCIPAL",
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
    btn_hub: "MAIN HUB",
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
  },
  ca: {
    app_title: "Defensa de la Torre",
    menu_start: "INICIAR JOC",
    menu_settings: "AJUSTOS",
    btn_back: "← TORNAR",
    btn_hub: "MENÚ PRINCIPAL",
    stat_lives: "❤️ ",
    stat_money: "💰 ",
    stat_wave: "🌊 Onada ",
    game_over_win: "VICTÒRIA! Has sobreviscut totes les onades.",
    game_over_lose: "FI DEL JOC. T'has quedat sense vides.",
    lang: "Idioma",
    tower_basic_blaster: "Blaster Bàsic",
    tower_basic_desc: "Barat, fiable i lleugerament molest.",
    tower_heavy_cannon: "Canó Pesat",
    tower_heavy_desc: "Lent però pica molt fort.",
    stats_damage: "Dany:",
    stats_range: "Radi:",
    stats_cooldown: "CD:",
    tap_to_place: "Toca un quadrat lliure per col·locar una torre."
  },
  eu: {
    app_title: "Dorre Defentsa",
    menu_start: "HASI JOKOA",
    menu_settings: "EZARPENAK",
    btn_back: "← ITZULI",
    btn_hub: "MENÚ NAGUSIA",
    stat_lives: "❤️ ",
    stat_money: "💰 ",
    stat_wave: "🌊 Olatua ",
    game_over_win: "GARAIPENA! Olatu guztiak bizirik iraun dituzu.",
    game_over_lose: "JOKOAREN AMAIERA. Bizitzarik gabe geratu zara.",
    lang: "Hizkuntza",
    tower_basic_blaster: "Oinarrizko Blaster",
    tower_basic_desc: "Merkea, fidagarria eta pixka bat gogaikarria.",
    tower_heavy_cannon: "Kanoi Astuna",
    tower_heavy_desc: "Mantsoa baina oso gogor jotzen du.",
    stats_damage: "Kaltea:",
    stats_range: "Erradioa:",
    stats_cooldown: "CD:",
    tap_to_place: "Sakatu karratu libre bat dorre bat jartzeko."
  },
  gl: {
    app_title: "Defensa da Torre",
    menu_start: "INICIAR XOGO",
    menu_settings: "AXUSTES",
    btn_back: "← VOLVER",
    btn_hub: "MENU PRINCIPAL",
    stat_lives: "❤️ ",
    stat_money: "💰 ",
    stat_wave: "🌊 Oleada ",
    game_over_win: "VICTORIA! Sobreviviches todas as oleadas.",
    game_over_lose: "FIN DO XOGO. Quedaches sen vidas.",
    lang: "Idioma",
    tower_basic_blaster: "Blaster Básico",
    tower_basic_desc: "Barato, fiable e lixeiramente molesto.",
    tower_heavy_cannon: "Cañón Pesado",
    tower_heavy_desc: "Lento pero pega moi duro.",
    stats_damage: "Dano:",
    stats_range: "Radio:",
    stats_cooldown: "CD:",
    tap_to_place: "Toca un cadrado libre para colocar unha torre."
  }
};

const SHARED_KEY = 'static_apps_lang';

export let currentLang = localStorage.getItem(SHARED_KEY) || 'en';

export function t(key) {
  const lang = TRANSLATIONS[currentLang] ? currentLang : 'en';
  return TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key] || key;
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
