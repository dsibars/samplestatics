import { state, EXERCISES, DEFAULT_ROUTINE } from './state.js';
import Sortable from 'sortablejs';
import { currentLang, t, applyTranslations } from './i18n.js';

export function resetToToday() {
  localStorage.removeItem('workout_manual_date');
  updateActiveDate();
}

export function updateActiveDate(manualDateStr = null) {
  if (manualDateStr) {
    state.activeDate = manualDateStr;
    localStorage.setItem('workout_manual_date', state.activeDate);
  } else if (localStorage.getItem('workout_manual_date')) {
    state.activeDate = localStorage.getItem('workout_manual_date');
  } else {
    const now = new Date();
    state.activeDate = now.getFullYear() + '-' + 
                 String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                 String(now.getDate()).padStart(2, '0');
  }
  
  document.getElementById('date-hacker').value = state.activeDate;
  
  const d = new Date(state.activeDate + 'T00:00:00');
  document.getElementById('display-date').innerText = d.toLocaleDateString(currentLang, { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  const isDynamic = !localStorage.getItem('workout_manual_date');
  document.getElementById('btn-today').style.display = isDynamic ? 'none' : 'block';
  
  const isRegistered = state.history[state.activeDate] !== undefined;
  document.getElementById('check-msg').innerHTML = isRegistered 
    ? `<p style="color:#ffa726">${t('already_registered')}</p>` 
    : `<p>${t('ready')}</p>`;
}

export function showSettings() {
  document.getElementById('view-welcome').classList.remove('active');
  document.getElementById('view-settings').classList.add('active');
}

export function closeSettings() {
  updateActiveDate();
  document.getElementById('view-settings').classList.remove('active');
  document.getElementById('view-welcome').classList.add('active');
}

let sortableInstance = null;

export function showRoutine() {
  document.getElementById('view-settings').classList.remove('active');
  document.getElementById('view-routine').classList.add('active');
  renderRoutineList();
}

export function renderRoutineList() {
  const list = document.getElementById('routine-list');
  list.innerHTML = state.routine.map((step, idx) => {
    const ex = EXERCISES[step.ex];
    return `
      <div style="background:#222; margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #4CAF50; position: relative;">
        
        <button onclick="removeRoutineStep(${idx})" style="position: absolute; top: 15px; right: 15px; background: transparent; border: 2px solid #f44336; color: #f44336; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; z-index: 10;">X</button>
        
        <div style="font-weight:bold; color:#4CAF50; font-size: 0.9rem;">${t(step.tag)} (${step.start})</div>
        <div style="font-size:1.2rem; margin: 8px 0; padding-right: 35px;">${t(ex.name)}</div>
        <div style="font-size:0.85rem; color:#aaa;">${t(ex.desc)}</div>
        
        <div class="drag-handle" style="position:absolute; bottom: 10px; right: 10px; color: #555; font-size: 1.5rem; cursor: grab; padding: 10px; z-index: 10;">☰</div>
      </div>
    `;
  }).join('');
  
  if (sortableInstance) sortableInstance.destroy();
  sortableInstance = Sortable.create(list, {
    handle: '.drag-handle',
    animation: 250,
    onEnd: (evt) => {
      const draggedStep = state.routine.splice(evt.oldIndex, 1)[0];
      state.routine.splice(evt.newIndex, 0, draggedStep);
      localStorage.setItem('workout_routine', JSON.stringify(state.routine));
      // Re-render specifically to fix indices matching the X deletion buttons
      renderRoutineList();
    }
  });
}

export function removeRoutineStep(idx) {
  if (confirm("¿Borrar ejercicio?")) {
    state.routine.splice(idx, 1);
    localStorage.setItem('workout_routine', JSON.stringify(state.routine));
    renderRoutineList();
  }
}

export function closeRoutine() {
  document.getElementById('view-routine').classList.remove('active');
  document.getElementById('view-settings').classList.add('active');
}

export function openAddExercise() {
  document.getElementById('view-routine').classList.remove('active');
  document.getElementById('view-add-exercise').classList.add('active');
  
  const select = document.getElementById('builder-ex');
  select.innerHTML = Object.keys(EXERCISES).map(k => `<option value="${k}">${t(EXERCISES[k].name)}</option>`).join('');
  
  document.getElementById('builder-start').value = 10;
  document.getElementById('builder-tag').value = '';
  
  updateExercisePreview();
}

export function closeAddExercise() {
  document.getElementById('view-add-exercise').classList.remove('active');
  document.getElementById('view-routine').classList.add('active');
}

export function updateExercisePreview() {
  const k = document.getElementById('builder-ex').value;
  document.getElementById('builder-desc').innerHTML = t(EXERCISES[k].desc);
}

export function appendNewExercise() {
  const ex = document.getElementById('builder-ex').value;
  const start = parseInt(document.getElementById('builder-start').value) || 0;
  const tag = document.getElementById('builder-tag').value.trim() || t(EXERCISES[ex].name);
  
  state.routine.unshift({ ex, start, tag });
  localStorage.setItem('workout_routine', JSON.stringify(state.routine));
  
  closeAddExercise();
  renderRoutineList();
}

export function exportJSON() { 
  const exportData = {
    version: 3,
    history: state.history,
    routine: state.routine
  };
  const b = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' }); 
  const a = document.createElement("a"); 
  a.href = URL.createObjectURL(b); 
  a.download = `workout.json`; 
  a.click(); 
}

export function importJSON(event) { 
  const r = new FileReader(); 
  r.onload = (e) => { 
    const data = JSON.parse(e.target.result); 
    
    // Backwards compatibility for raw historic JSON
    if (data.version && data.version >= 3) {
      state.history = data.history || {};
      state.routine = data.routine || DEFAULT_ROUTINE;
      localStorage.setItem('workout_routine', JSON.stringify(state.routine));
    } else {
      state.history = data;
    }
    
    localStorage.setItem('workout_history_v2', JSON.stringify(state.history)); 
    location.reload(); 
  }; 
  r.readAsText(event.target.files); 
}

export function clearAllData() { 
  if (confirm(t('delete_confirm'))) { 
    localStorage.removeItem('workout_history_v2'); 
    localStorage.removeItem('workout_routine'); 
    location.reload(); 
  } 
}

export function showExit() { 
  document.getElementById('view-welcome').classList.remove('active'); 
  document.getElementById('view-exit').classList.add('active'); 
}
