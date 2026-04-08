export const TRANSLATIONS = {
  es: {
    hub_title: "Panel de Aplicaciones",
    app_workout_title: "Entrenamiento Diario",
    app_workout_desc: "Un rastreador de entrenamiento de 15 minutos con historial y estadísticas.",
    static_badge: "App Estática",
    lang: "Idioma"
  },
  en: {
    hub_title: "App Hub",
    app_workout_title: "Daily Routine Exercise",
    app_workout_desc: "A simple 15-minute workout tracker with history and statistics.",
    static_badge: "Static App",
    lang: "Language"
  },
  ca: {
    hub_title: "Panell d'Aplicacions",
    app_workout_title: "Entrenament Diari",
    app_workout_desc: "Un rastrejador d'entrenament de 15 minuts amb historial i estadístiques.",
    static_badge: "App Estàtica",
    lang: "Idioma"
  },
  eu: {
    hub_title: "Aplikazioen Panela",
    app_workout_title: "Eguneroko Entrenamendua",
    app_workout_desc: "15 minutuko entrenamendu-aztergailua historia eta estatistikekin.",
    static_badge: "App Estatikoa",
    lang: "Hizkuntza"
  },
  gl: {
    hub_title: "Panel de Aplicacións",
    app_workout_title: "Adestramento Diario",
    app_workout_desc: "Un rastreador de adestramento de 15 minutos con historial e estatísticas.",
    static_badge: "App Estática",
    lang: "Idioma"
  }
};

export let currentLang = localStorage.getItem('static_apps_lang') || 'es';

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
