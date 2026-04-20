export const TRANSLATIONS = {
  es: {
    hub_title: "Panel de Aplicaciones",
    app_workout_title: "Rutina Diaria",
    app_workout_desc: "Rastreador de ejercicios con historial y estadísticas avanzadas.",
    app_money_title: "Balance",
    app_money_desc: "Control de gastos y deudas personales con amigos.",
    app_todo_title: "Lista de Tareas",
    app_todo_desc: "Gestor sencillo de tareas diarias para un enfoque profesional.",
    app_td_title: "Defensa de la Torre",
    app_td_desc: "Juego épico de estrategia y oleadas para poner a prueba tus defensas.",
    app_rpg_title: "RPG Idle",
    app_rpg_desc: "Recluta héroes y embárcate en una aventura sin fin.",
    app_magic_title: "Aventura Mágica",
    app_magic_desc: "Dibuja poderosos hechizos y pon a prueba tus habilidades mágicas.",
    static_badge: "App Estática",
    lang: "Idioma"
  },
  en: {
    hub_title: "App Hub",
    app_workout_title: "Daily Routine Tracker",
    app_workout_desc: "Exercise tracker with history and advanced statistics.",
    app_money_title: "Balance",
    app_money_desc: "Track personal expenses and debts with friends.",
    app_todo_title: "Todo List",
    app_todo_desc: "Simple daily task manager for professional focus.",
    app_td_title: "Tower Defense",
    app_td_desc: "Epic strategy and wave game to test your tactical defenses.",
    app_rpg_title: "RPG Idle",
    app_rpg_desc: "Recruit heroes and embark on an endless adventure.",
    app_magic_title: "Magic Adventure",
    app_magic_desc: "Draw powerful spells and test your magic skills.",
    static_badge: "Static App",
    lang: "Language"
  },
  ca: {
    hub_title: "Panell d'Aplicacions",
    app_workout_title: "Rutina Diària",
    app_workout_desc: "Rastrejador d'exercicis amb historial i estadístiques avançades.",
    app_money_title: "Balance",
    app_money_desc: "Control de despeses i deutes personals amb amics.",
    app_todo_title: "Llista de Tasques",
    app_todo_desc: "Gestor senzill de tasques diàries per a un enfocament professional.",
    app_td_title: "Defensa de la Torre",
    app_td_desc: "Joc èpic d'estrategia i onades per posar a prova les teves defenses.",
    app_magic_title: "Aventura Màgica",
    app_magic_desc: "Dibuixa encanteris poderosos i posa a prova les teves habilitats màgiques.",
    static_badge: "App Estàtica",
    lang: "Idioma"
  },
  eu: {
    hub_title: "Aplikazioen Panela",
    app_workout_title: "Eguneroko Errutina",
    app_workout_desc: "Ariketen jarraitzailea historia eta estatistika aurreratuekin.",
    app_money_title: "Balance",
    app_money_desc: "Gastu eta lagunarteko zorraren kontrolerako aplikazioa.",
    app_todo_title: "Ataza Zerrenda",
    app_todo_desc: "Eguneroko ataza kudeatzaile sinplea ikuspegi profesionalerako.",
    app_td_title: "Dorre Defentsa",
    app_td_desc: "Estrategia eta olatu joko epikoa zure defentsak probatzeko.",
    app_magic_title: "Aventurazko Magia",
    app_magic_desc: "Marraztu sorginkeria indartsuak eta probatu zure magia trebetasunak.",
    static_badge: "App Estatikoa",
    lang: "Hizkuntza"
  },
  gl: {
    hub_title: "Panel de Aplicacións",
    app_workout_title: "Rutina Diaria",
    app_workout_desc: "Rastreador de exercicios con historial e estatísticas avanzadas.",
    app_money_title: "Balance",
    app_money_desc: "Control de gastos e débedas persoais con amigos.",
    app_todo_title: "Lista de Tareas",
    app_todo_desc: "Gestor sencillo de tareas diarias para un enfoque profesional.",
    app_td_title: "Defensa da Torre",
    app_td_desc: "Xogo épico de estratexia e oleadas para poñer a proba as túas defensas.",
    app_magic_title: "Aventura Máxica",
    app_magic_desc: "Debuxa poderosos hechizos e pon a proba as túas habilidades máxicas.",
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
