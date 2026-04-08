export const TRANSLATIONS = {
  es: {
    hub_title: "Panel de Aplicaciones",
    app_workout_title: "Rutina Diaria",
    app_workout_desc: "Rastreador de ejercicios con historial y estadísticas avanzadas.",
    app_money_title: "Balance",
    app_money_desc: "Control de gastos y deudas personales con amigos.",
    static_badge: "App Estática",
    lang: "Idioma"
  },
  en: {
    hub_title: "App Hub",
    app_workout_title: "Daily Routine Tracker",
    app_workout_desc: "Exercise tracker with history and advanced statistics.",
    app_money_title: "Balance",
    app_money_desc: "Track personal expenses and debts with friends.",
    static_badge: "Static App",
    lang: "Language"
  },
  ca: {
    hub_title: "Panell d'Aplicacions",
    app_workout_title: "Rutina Diària",
    app_workout_desc: "Rastrejador d'exercicis amb historial i estadístiques avançades.",
    app_money_title: "Balance",
    app_money_desc: "Control de despeses i deutes personals amb amics.",
    static_badge: "App Estàtica",
    lang: "Idioma"
  },
  eu: {
    hub_title: "Aplikazioen Panela",
    app_workout_title: "Eguneroko Errutina",
    app_workout_desc: "Ariketen jarraitzailea historia eta estatistika aurreratuekin.",
    app_money_title: "Balance",
    app_money_desc: "Gastu eta lagunarteko zorraren kontrolerako aplikazioa.",
    static_badge: "App Estatikoa",
    lang: "Hizkuntza"
  },
  gl: {
    hub_title: "Panel de Aplicacións",
    app_workout_title: "Rutina Diaria",
    app_workout_desc: "Rastreador de exercicios con historial e estatísticas avanzadas.",
    app_money_title: "Balance",
    app_money_desc: "Control de gastos e débedas persoais con amigos.",
    static_badge: "App Estática",
    lang: "Idioma"
  }
};

// Handle migration and shared persistence
const SHARED_KEY = 'static_apps_lang';
const OLD_KEY = 'workout_lang';

// Migration
if (!localStorage.getItem(SHARED_KEY) && localStorage.getItem(OLD_KEY)) {
  localStorage.setItem(SHARED_KEY, localStorage.getItem(OLD_KEY));
}

export let currentLang = localStorage.getItem(SHARED_KEY) || 'es';

export function t(key) {
  if (!TRANSLATIONS[currentLang]) return key;
  return TRANSLATIONS[currentLang][key] || TRANSLATIONS['es'][key] || key;
}

export function changeLanguage() {
  currentLang = document.getElementById('lang-selector').value;
  localStorage.setItem('static_apps_lang', currentLang);
  location.reload(); 
}

export function applyTranslations() {
  document.documentElement.lang = currentLang;
  const selector = document.getElementById('lang-selector');
  if (selector) selector.value = currentLang;
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n'));
  });
}
