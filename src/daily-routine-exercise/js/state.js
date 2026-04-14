export const EXERCISES = { 
  SENT: { name: "Sentadillas", desc: "desc_sent" }, 
  FLEX: { name: "Flexiones", desc: "desc_flex" }, 
  DOM_E: { name: "Dom. Espalda", desc: "desc_dom_e" }, 
  DOM_B: { name: "Dom. Bíceps", desc: "desc_dom_b" },
  REST: { name: "Descanso", desc: "desc_rest" },
  PLANK: { name: "Plancha", desc: "desc_plank" },
  LUNGE: { name: "Zancadas", desc: "desc_lunge" }
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

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

const loadedRoutine = JSON.parse(localStorage.getItem('workout_routine') || JSON.stringify(DEFAULT_ROUTINE));
// Ensure every step has a unique ID for stable deletion indices
const normalizedRoutine = loadedRoutine.map(step => ({
  ...step,
  id: step.id || generateId()
}));

export const state = {
  history: JSON.parse(localStorage.getItem('workout_history_v2') || '{}'),
  routine: normalizedRoutine,
  results: [],
  startTime: null,
  stepStartTime: null,
  activeDate: "",
};
