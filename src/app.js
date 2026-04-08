import './styles.css';
import { TRANSLATIONS } from './i18n.js';

let currentLang = localStorage.getItem('workout_lang') || 'es';

function t(key) {
  if (!TRANSLATIONS[currentLang]) return key;
  return TRANSLATIONS[currentLang][key] || TRANSLATIONS['es'][key] || key;
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.getElementById('lang-selector').value = currentLang;
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n'));
  });
  
  if (activeDate) updateActiveDate();
}

function changeLanguage() {
  currentLang = document.getElementById('lang-selector').value;
  localStorage.setItem('workout_lang', currentLang);
  applyTranslations();
}

// --- 1. State and Configuration ---

const EXERCISES = { 
  SENT: { name: "Sentadillas" }, 
  FLEX: { name: "Flexiones" }, 
  DOM_E: { name: "Dom. Espalda" }, 
  DOM_B: { name: "Dom. Bíceps" } 
};

const ROUTINE = [
  { ex: 'SENT', start: 20, tag: 'Calentamiento' }, 
  { ex: 'FLEX', start: 8, tag: 'Al Fallo' },
  { ex: 'SENT', start: 20, tag: 'Recuperación' }, 
  { ex: 'DOM_E', start: 2, tag: 'Lenta/Negativa' },
  { ex: 'SENT', start: 20, tag: 'Recuperación' }, 
  { ex: 'DOM_B', start: 3, tag: 'Recorrido Total' },
  { ex: 'SENT', start: 20, tag: 'Recuperación' }, 
  { ex: 'FLEX', start: 6, tag: 'Al Fallo' }
];

let history = JSON.parse(localStorage.getItem('workout_history_v2') || '{}');
let results = [];
let startTime, stepStartTime, activeDate = "";

// --- 2. Initialization & Validation ---

window.onload = () => {
  applyTranslations();
  updateActiveDate();
};

function resetToToday() {
  localStorage.removeItem('workout_manual_date');
  updateActiveDate();
}

function updateActiveDate(manualDateStr = null) {
  if (manualDateStr) {
    activeDate = manualDateStr;
    localStorage.setItem('workout_manual_date', activeDate);
  } else if (localStorage.getItem('workout_manual_date')) {
    activeDate = localStorage.getItem('workout_manual_date');
  } else {
    const now = new Date();
    activeDate = now.getFullYear() + '-' + 
                 String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                 String(now.getDate()).padStart(2, '0');
  }
  
  document.getElementById('date-hacker').value = activeDate;
  
  const d = new Date(activeDate + 'T00:00:00');
  document.getElementById('display-date').innerText = d.toLocaleDateString(currentLang, { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  const isDynamic = !localStorage.getItem('workout_manual_date');
  document.getElementById('btn-today').style.display = isDynamic ? 'none' : 'block';
  
  const isRegistered = history[activeDate] !== undefined;
  document.getElementById('check-msg').innerHTML = isRegistered 
    ? `<p style="color:#ffa726">${t('already_registered')}</p>` 
    : `<p>${t('ready')}</p>`;
}

// --- 3. Workout Engine Execution ---

function startWorkout() {
  startTime = Date.now(); 
  stepStartTime = startTime;
  
  results = ROUTINE.map(s => ({ ...s, value: s.start, duration: 0 }));
  
  document.getElementById('view-welcome').classList.remove('active');
  renderStep(0);
}

function renderStep(idx) {
  const step = results[idx]; 
  const ex = EXERCISES[step.ex];
  const engine = document.getElementById('workout-engine');
  
  const isLastStep = idx === ROUTINE.length - 1;
  const buttonLabel = isLastStep ? t('finish') : t('next');
  
  engine.innerHTML = `
    <label>${t(step.tag)} (${idx + 1}/${ROUTINE.length})</label>
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

function changeVal(idx, delta) { 
  results[idx].value = Math.max(0, results[idx].value + delta); 
  document.getElementById(`val-${idx}`).innerText = results[idx].value; 
}

function processStep(idx) {
  const now = Date.now(); 
  
  results[idx].duration = Math.floor((now - stepStartTime) / 1000);
  
  if (idx === ROUTINE.length - 1) {
    finish(); 
  } else { 
    stepStartTime = now; 
    renderStep(idx + 1); 
  }
}

// --- 4. Summaries and Metrics ---

function finish() {
  const totalTime = results.reduce((acc, s) => acc + s.duration, 0);
  
  const totals = results.reduce((acc, s) => { 
    const name = EXERCISES[s.ex].name; 
    acc[name] = (acc[name] || 0) + s.value; 
    return acc; 
  }, {});
  
  const sessionData = { 
    date: activeDate, 
    duration: totalTime, 
    steps: results, 
    totals: totals 
  };
  
  const lastKey = Object.keys(history).sort().filter(k => k < activeDate).pop();
  const prevData = history[lastKey];
  
  showSummary(sessionData, prevData);
  
  history[activeDate] = sessionData;
  localStorage.setItem('workout_history_v2', JSON.stringify(history));
}

function showSummary(cur, prev) {
  document.getElementById('workout-engine').classList.remove('active');
  document.getElementById('view-summary').classList.add('active');
  
  const minutes = Math.floor(cur.duration / 60);
  const seconds = cur.duration % 60;
  document.getElementById('finalTime').innerText = `${minutes}m ${seconds}s`;
  
  if (!prev) {
    document.getElementById('comparison-box').innerHTML = t('first_day');
  } else {
    let compHtml = t('vs_previous');
    
    Object.keys(cur.totals).forEach(name => {
      const prevVal = prev.totals[name] || 0;
      const diff = cur.totals[name] - prevVal;
      const sign = diff >= 0 ? '+' : '';
      compHtml += `• ${t(name)}: ${sign}${diff}<br>`;
    });
    
    const dT = prev.duration - cur.duration;
    const speedIcon = dT >= 0 ? '🚀 ' : '🐢 ';
    compHtml += `• ${t('time')}: ${speedIcon}${Math.abs(dT)}s`;
    
    document.getElementById('comparison-box').innerHTML = compHtml;
  }
  
  document.getElementById('statsList').innerHTML = Object.keys(cur.totals).map(n => `
    <div class="stat-row">
      <span>${t(n)}</span>
      <b>${cur.totals[n]}</b>
    </div>
  `).join('');
}

// --- 5. History Browser ---

function showHistory() {
  document.getElementById('view-welcome').classList.remove('active');
  document.getElementById('view-history').classList.add('active');
  
  const list = document.getElementById('history-list');
  const sortedKeys = Object.keys(history).sort().reverse();
  
  list.innerHTML = sortedKeys.map((k, i) => {
    const s = history[k];
    const prevK = sortedKeys.slice(i + 1).find(key => key < k);
    const prevS = prevK ? history[prevK] : null;
    
    const mins = Math.floor(s.duration / 60);
    const secs = s.duration % 60;
    
    const stepsHtml = s.steps.map(st => `
      <div>${t(st.tag)} ${t(EXERCISES[st.ex].name)}: <b>${st.value}</b></div>
    `).join('');
    
    const totalsHtml = Object.keys(s.totals).map(name => {
      const diff = prevS ? s.totals[name] - (prevS.totals[name] || 0) : null;
      const sign = diff >= 0 ? '+' : '';
      const diffClass = diff >= 0 ? 'pos' : 'neg';
      const diffText = diff !== null ? `<span class="delta ${diffClass}">(${sign}${diff})</span>` : '';
      
      return `<div>• ${t(name)}: <b>${s.totals[name]}</b> ${diffText}</div>`;
    }).join('');

    return `
      <div class="hist-card">
        <div class="hist-header" onclick="toggleCard(${i})">
          <div>
            <span class="hist-date">${k}</span><br>
            <small>${mins}m ${secs}s</small>
          </div>
          <span>▼</span>
        </div>
        
        <div id="card-${i}" class="hist-details">
          ${stepsHtml}
          <div class="hist-total-row">${t('grouped')}</div>
          ${totalsHtml}
        </div>
      </div>
    `;
  }).join('');
}

function toggleCard(i) { 
  document.getElementById(`card-${i}`).classList.toggle('open'); 
}

// --- 6. Configuration / Settings Logic ---

function showSettings() {
  document.getElementById('view-welcome').classList.remove('active');
  document.getElementById('view-settings').classList.add('active');
}

function closeSettings() {
  updateActiveDate();
  document.getElementById('view-settings').classList.remove('active');
  document.getElementById('view-welcome').classList.add('active');
}

// --- 7. Utilities ---

function exportJSON() { 
  const b = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' }); 
  const a = document.createElement("a"); 
  a.href = URL.createObjectURL(b); 
  a.download = `workout.json`; 
  a.click(); 
}

function importJSON(event) { 
  const r = new FileReader(); 
  r.onload = (e) => { 
    history = JSON.parse(e.target.result); 
    localStorage.setItem('workout_history_v2', JSON.stringify(history)); 
    location.reload(); 
  }; 
  r.readAsText(event.target.files); 
}

function clearAllData() { 
  if (confirm(t('delete_confirm'))) { 
    localStorage.removeItem('workout_history_v2'); 
    location.reload(); 
  } 
}

function showExit() { 
  document.getElementById('view-welcome').classList.remove('active'); 
  document.getElementById('view-exit').classList.add('active'); 
}

// Global Exports for HTML inline onclick handlers
window.startWorkout = startWorkout;
window.changeVal = changeVal;
window.processStep = processStep;
window.showHistory = showHistory;
window.toggleCard = toggleCard;
window.showSettings = showSettings;
window.closeSettings = closeSettings;
window.exportJSON = exportJSON;
window.importJSON = importJSON;
window.clearAllData = clearAllData;
window.showExit = showExit;
window.changeLanguage = changeLanguage;
window.updateActiveDate = updateActiveDate;
window.resetToToday = resetToToday;
window.t = t;
