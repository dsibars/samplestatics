export const TRANSLATIONS = {
  es: {
    dashboard: "Resumen", add_tx: "AÑADIR MOVIMIENTO", history: "HISTORIAL 📜", people: "PERSONAS 👥", 
    i_owe: "Yo debo", owe_me: "Me deben", amount: "Cantidad", person: "Persona", desc: "Descripción (Opcional)",
    save: "GUARDAR", back: "VOLVER", total_balance: "Balance Neto", total_i_owe: "Yo debo", total_owe_me: "Me deben",
    no_people: "No hay personas. ¡Añade una!", add_person: "AÑADIR PERSONA", person_name: "Nombre",
    delete_confirm: "¿Borrar este registro?", settings: "AJUSTES ⚙️", back_home: "SALIR AL HUB",
    net_with: "Balance con", payments: "Movimientos", lang: "Idioma",
    stats: "ESTADÍSTICAS 📊", date_from: "Desde", date_to: "Hasta", period_summary: "Resumen del periodo",
    local_data: "Datos Locales", export_json: "EXPORTAR JSON", import_json: "IMPORTAR JSON", erase_all: "BORRAR TODO",
    erase_confirm: "¿Estás seguro? Se borrarán todos los movimientos y personas."
  },
  en: {
    dashboard: "Dashboard", add_tx: "ADD TRANSACTION", history: "HISTORY 📜", people: "PEOPLE 👥", 
    i_owe: "I owe", owe_me: "Owes me", amount: "Amount", person: "Person", desc: "Description (Optional)",
    save: "SAVE", back: "BACK", total_balance: "Net Balance", total_i_owe: "I owe", total_owe_me: "Owes me",
    no_people: "No people found. Add one!", add_person: "ADD PERSON", person_name: "Name",
    delete_confirm: "Delete this record?", settings: "SETTINGS ⚙️", back_home: "EXIT TO HUB",
    net_with: "Balance with", payments: "Transactions", lang: "Language",
    stats: "STATISTICS 📊", date_from: "From", date_to: "To", period_summary: "Period Summary",
    local_data: "Local Data", export_json: "EXPORT JSON", import_json: "IMPORT JSON", erase_all: "ERASE EVERYTHING",
    erase_confirm: "Are you sure? This will delete all transactions and people."
  },
  ca: {
    dashboard: "Resum", add_tx: "AFEGIR MOVIMENT", history: "HISTORIAL 📜", people: "PERSONES 👥", 
    i_owe: "Jo debó", owe_me: "Em deuen", amount: "Quantitat", person: "Persona", desc: "Descripció (Opcional)",
    save: "DESAR", back: "TORNAR", total_balance: "Balanç Net", total_i_owe: "Jo debó", total_owe_me: "Em deuen",
    no_people: "No hi ha persones. Afegeix una!", add_person: "AFEGIR PERSONA", person_name: "Nom",
    delete_confirm: "Esborrar aquest registre?", settings: "CONFIGURACIÓ ⚙️", back_home: "SORTIR AL HUB",
    net_with: "Balanç amb", payments: "Moviments", lang: "Idioma",
    stats: "ESTADÍSTIQUES 📊", date_from: "Des de", date_to: "Fins a", period_summary: "Resum del període",
    local_data: "Dades Locals", export_json: "EXPORTAR JSON", import_json: "IMPORTAR JSON", erase_all: "ESBORRAR TOT",
    erase_confirm: "Estàs segur? S'esborraran tots els moviments i persones."
  },
  eu: {
    dashboard: "Laburpena", add_tx: "GEHITU MUGIMENDUA", history: "HISTORIALA 📜", people: "PERTSONAK 👥", 
    i_owe: "Zor dut", owe_me: "Zor didate", amount: "Zenbatekoa", person: "Pertsona", desc: "Deskribapena (Aukerakoa)",
    save: "GORDE", back: "ITZULI", total_balance: "Balanç Netoa", total_i_owe: "Zor dut", total_owe_me: "Zor didate",
    no_people: "Ez dago pertsonarik. Gehitu bat!", add_person: "GEHITU PERTSONA", person_name: "Izena",
    delete_confirm: "Erregistro hau ezabatu?", settings: "EZARPENAK ⚙️", back_home: "HUBERA IRTEN",
    net_with: "Balanzea honekin:", payments: "Mugimenduak", lang: "Hizkuntza",
    stats: "ESTATISTIKAK 📊", date_from: "Noiztik", date_to: "Noiz arte", period_summary: "Epearen laburpena",
    local_data: "Datu Lokalak", export_json: "EXPORTATU JSON", import_json: "IMPORTATU JSON", erase_all: "DENA EZABATU",
    erase_confirm: "Ziur zaude? Mugimendu eta pertsona guztiak ezabatuko dira."
  },
  gl: {
    dashboard: "Resumo", add_tx: "ENGADIR MOVEMENTO", history: "HISTORIAL 📜", people: "PERSOAS 👥", 
    i_owe: "Eu debo", owe_me: "Débenme", amount: "Cantidade", person: "Persoa", desc: "Descrición (Opcional)",
    save: "GARDAR", back: "VOLVER", total_balance: "Balance Neto", total_i_owe: "Eu debo", total_owe_me: "Débenme",
    no_people: "Non hai persoas. Engade unha!", add_person: "ENGADIR PERSOA", person_name: "Nome",
    delete_confirm: "Borrar este rexistro?", settings: "AXUSTES ⚙️", back_home: "SAÍR AO HUB",
    net_with: "Balance con", payments: "Movementos", lang: "Idioma",
    stats: "ESTADÍSTICAS 📊", date_from: "Desde", date_to: "Ata", period_summary: "Resumo do periodo",
    local_data: "Datos Locais", export_json: "EXPORTAR JSON", import_json: "IMPORTAR JSON", erase_all: "BORRAR TODO",
    erase_confirm: "Estás seguro? Borraranse todos os movementos e persoas."
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
