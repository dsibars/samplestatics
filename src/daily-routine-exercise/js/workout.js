import { state, EXERCISES } from './state.js';
import { t } from './i18n.js';
import { finish } from './statistics.js';

export function startWorkout() {
  state.startTime = Date.now(); 
  state.stepStartTime = state.startTime;
  
  state.results = state.routine.map(s => ({ ...s, value: s.start, duration: 0 }));
  
  document.getElementById('view-welcome').classList.remove('active');
  renderStep(0);
}

export function renderStep(idx) {
  const step = state.results[idx]; 
  const ex = EXERCISES[step.ex];
  const engine = document.getElementById('workout-engine');
  
  const isLastStep = idx === state.routine.length - 1;
  const buttonLabel = isLastStep ? t('finish') : t('next');
  
  engine.innerHTML = `
    <label>${t(step.tag)} (${idx + 1}/${state.routine.length})</label>
    <span class="exercise-name">${t(ex.name)}</span>
    <div class="counter-container">
      <button class="btn-circle" onclick="changeVal(${idx}, -1)">-</button>
      <div class="val" id="val-${idx}">${step.value}</div>
      <button class="btn-circle" onclick="changeVal(${idx}, 1)">+</button>
    </div>
    <button class="next-btn" onclick="processStep(${idx})">${buttonLabel}</button>
  `;
  
  engine.classList.add('active');
}

export function changeVal(idx, delta) { 
  state.results[idx].value = Math.max(0, state.results[idx].value + delta); 
  document.getElementById(`val-${idx}`).innerText = state.results[idx].value; 
}

export function processStep(idx) {
  const now = Date.now(); 
  
  state.results[idx].duration = Math.floor((now - state.stepStartTime) / 1000);
  
  if (idx === state.routine.length - 1) {
    finish(); 
  } else { 
    state.stepStartTime = now; 
    renderStep(idx + 1); 
  }
}
