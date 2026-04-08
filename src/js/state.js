export const EXERCISES = { 
  SENT: { name: "Sentadillas" }, 
  FLEX: { name: "Flexiones" }, 
  DOM_E: { name: "Dom. Espalda" }, 
  DOM_B: { name: "Dom. Bíceps" } 
};

export const DEFAULT_ROUTINE = [
  { ex: 'SENT', start: 20, tag: 'Calentamiento' }, 
  { ex: 'FLEX', start: 8, tag: 'Al Fallo' },
  { ex: 'SENT', start: 20, tag: 'Recuperación' }, 
  { ex: 'DOM_E', start: 2, tag: 'Lenta/Negativa' },
  { ex: 'SENT', start: 20, tag: 'Recuperación' }, 
  { ex: 'DOM_B', start: 3, tag: 'Recorrido Total' },
  { ex: 'SENT', start: 20, tag: 'Recuperación' }, 
  { ex: 'FLEX', start: 6, tag: 'Al Fallo' }
];

export const state = {
  history: JSON.parse(localStorage.getItem('workout_history_v2') || '{}'),
  routine: JSON.parse(localStorage.getItem('workout_routine') || JSON.stringify(DEFAULT_ROUTINE)),
  results: [],
  startTime: null,
  stepStartTime: null,
  activeDate: "",
};
