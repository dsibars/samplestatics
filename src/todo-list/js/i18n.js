export const TRANSLATIONS = {
  es: {
    app_title: "Tareas Diarias", tasks: "Tareas", no_tasks: "¡Día libre! No hay tareas para hoy.",
    add_task: "NUEVA TAREA", task_name: "Tarea", task_desc: "Descripción", date: "Fecha",
    save: "GUARDAR", back: "VOLVER", settings: "AJUSTES ⚙️", lang: "Idioma",
    local_data: "Datos Locales", export: "EXPORTAR", import: "IMPORTAR", erase_all: "BORRAR TODO",
    erase_confirm: "¿Estás seguro? Se borrarán todas las tareas.",
    back_home: "SALIR AL HUB"
  },
  en: {
    app_title: "Daily Todo", tasks: "Tasks", no_tasks: "Day off! No tasks for today.",
    add_task: "NEW TASK", task_name: "Task", task_desc: "Description", date: "Date",
    save: "SAVE", back: "BACK", settings: "SETTINGS ⚙️", lang: "Language",
    local_data: "Local Data", export: "EXPORT", import: "IMPORT", erase_all: "ERASE EVERYTHING",
    erase_confirm: "Are you sure? This will delete all tasks.",
    back_home: "EXIT TO HUB"
  },
  ca: {
    app_title: "Tasques Diàries", tasks: "Tasques", no_tasks: "Dia lliure! No hi ha tasques per avui.",
    add_task: "NOVA TASCA", task_name: "Tasca", task_desc: "Descripció", date: "Data",
    save: "DESAR", back: "TORNAR", settings: "CONFIGURACIÓ ⚙️", lang: "Idioma",
    local_data: "Dades Locals", export: "EXPORTAR", import: "IMPORTAR", erase_all: "ESBORRAR TOT",
    erase_confirm: "Estàs segur? S'esborraran totes les tasques.",
    back_home: "SORTIR AL HUB"
  },
  eu: {
    app_title: "Eguneroko Atazak", tasks: "Atazak", no_tasks: "Egun librea! Ez dago atazarik gaurko.",
    add_task: "ATAZA BERRIA", task_name: "Ataza", task_desc: "Deskribapena", date: "Data",
    save: "GORDE", back: "ITZULI", settings: "EZARPENAK ⚙️", lang: "Hizkuntza",
    local_data: "Datu Lokalak", export: "EXPORTATU", import: "IMPORTATU", erase_all: "DENA EZABATU",
    erase_confirm: "Ziur zaude? Ataza guztiak ezabatuko dira.",
    back_home: "HUBERA IRTEN"
  },
  gl: {
    app_title: "Tarefas Diarias", tasks: "Tarefas", no_tasks: "Día libre! Non hai tarefas para hoxe.",
    add_task: "NOVA TAREFA", task_name: "Tarefa", task_desc: "Descrición", date: "Data",
    save: "GARDAR", back: "VOLVER", settings: "AXUSTES ⚙️", lang: "Idioma",
    local_data: "Datos Locales", export: "EXPORTAR", import: "IMPORTAR", erase_all: "BORRAR TODO",
    erase_confirm: "Estás seguro? Borraranse todas as tarefas.",
    back_home: "SAÍR AO HUB"
  }
};

const SHARED_KEY = 'static_apps_lang';
export let currentLang = localStorage.getItem(SHARED_KEY) || 'es';

export function t(key) {
  if (!TRANSLATIONS[currentLang]) return key;
  return TRANSLATIONS[currentLang][key] || TRANSLATIONS['es'][key] || key;
}

export function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n'));
  });
}
