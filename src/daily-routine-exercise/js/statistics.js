import { state, EXERCISES } from './state.js';
import { t } from './i18n.js';

export function finish() {
  const totalTime = state.results.reduce((acc, s) => acc + s.duration, 0);
  
  const totals = state.results.reduce((acc, s) => { 
    const name = EXERCISES[s.ex].name; 
    acc[name] = (acc[name] || 0) + s.value; 
    return acc; 
  }, {});
  
  const sessionData = { 
    date: state.activeDate, 
    duration: totalTime, 
    steps: state.results, 
    totals: totals,
    routine: JSON.parse(JSON.stringify(state.routine))
  };
  
  const lastKey = Object.keys(state.history).sort().filter(k => k < state.activeDate).pop();
  const prevData = state.history[lastKey];
  
  showSummary(sessionData, prevData);
  
  state.history[state.activeDate] = sessionData;
  localStorage.setItem('workout_history_v2', JSON.stringify(state.history));
}

export function showSummary(cur, prev) {
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

export function showHistory() {
  document.getElementById('view-welcome').classList.remove('active');
  document.getElementById('view-history').classList.add('active');
  
  const list = document.getElementById('history-list');
  const sortedKeys = Object.keys(state.history).sort().reverse();
  
  list.innerHTML = sortedKeys.map((k, i) => {
    const s = state.history[k];
    const prevK = sortedKeys.slice(i + 1).find(key => key < k);
    const prevS = prevK ? state.history[prevK] : null;
    
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

export function toggleCard(i) { 
  document.getElementById(`card-${i}`).classList.toggle('open'); 
}

export function renderStatistics() {
  const from = document.getElementById('stats-from').value;
  const to = document.getElementById('stats-to').value;
  const type = document.getElementById('stats-type').value;
  const content = document.getElementById('stats-content');
  
  if (!from || !to) return;
  
  const entries = Object.keys(state.history)
    .filter(k => k >= from && k <= to)
    .sort()
    .map(k => state.history[k]);
  
  if (entries.length === 0) {
    content.innerHTML = `<div style="text-align:center; padding: 40px; color:#666;">Sin datos para este rango.</div>`;
    return;
  }
  
  if (type === 'ex_evol') renderExEvol(entries, content);
  else if (type === 'routine_evol') renderRoutineEvol(entries, content);
  else if (type === 'time_evol') renderTimeEvol(entries, content);
}

function renderExEvol(entries, container) {
  // Aggregate all unique exercises in the range
  const allEx = new Set();
  entries.forEach(e => Object.keys(e.totals).forEach(n => allEx.add(n)));
  
  container.innerHTML = Array.from(allEx).map(name => {
    const firstEntry = entries.find(e => e.totals[name] !== undefined);
    const lastEntry = [...entries].reverse().find(e => e.totals[name] !== undefined);
    
    const firstVal = firstEntry.totals[name];
    const lastVal = lastEntry.totals[name];
    const maxVal = Math.max(firstVal, lastVal, 1);
    
    const diff = lastVal - firstVal;
    const sign = diff >= 0 ? '+' : '';
    const color = diff >= 0 ? '#4CAF50' : '#e53935';
    
    return `
      <div class="evol-row">
        <div class="evol-label">
          <span>${t(name)}</span>
          <b style="color:${color}">${lastVal} (${sign}${diff})</b>
        </div>
        <div class="evol-bar-container" title="Initial: ${firstVal}">
          <div class="evol-bar" style="width: ${(lastVal/maxVal)*100}%"></div>
          <div style="position:absolute; left:0; top:0; height:100%; border-right: 2px solid white; width: ${(firstVal/maxVal)*100}%; opacity: 0.3;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderRoutineEvol(entries, container) {
  const milestones = [];
  let lastRoutineStr = null;
  
  entries.forEach(e => {
    const currentRoutineStr = JSON.stringify(e.routine);
    if (currentRoutineStr !== lastRoutineStr) {
      const changes = [];
      if (lastRoutineStr) {
        const lastRoutine = JSON.parse(lastRoutineStr);
        const currentRoutine = e.routine;
        
        // Very basic diff
        const lastTags = lastRoutine.map(r => r.tag + r.ex);
        const currentTags = currentRoutine.map(r => r.tag + r.ex);
        
        currentRoutine.forEach(r => {
          if (!lastTags.includes(r.tag + r.ex)) {
            changes.push(`<div class="milestone-change"><span class="change-add">+</span> ${t('added')}: ${t(r.tag)}</div>`);
          }
        });
        
        lastRoutine.forEach(r => {
          if (!currentTags.includes(r.tag + r.ex)) {
            changes.push(`<div class="milestone-change"><span class="change-rem">-</span> ${t('removed')}: ${t(r.tag)}</div>`);
          }
        });
      }
      
      milestones.unshift({
        date: e.date,
        changes: changes.length > 0 ? changes.join('') : '<i>Inicio de secuencia / Cambio mayor</i>'
      });
      lastRoutineStr = currentRoutineStr;
    }
  });

  container.innerHTML = milestones.map(m => `
    <div class="milestone">
      <span class="milestone-date">${m.date}</span>
      ${m.changes}
    </div>
  `).join('');
}

function renderTimeEvol(entries, container) {
  const totalWorkouts = entries.length;
  const totalSeconds = entries.reduce((acc, e) => acc + e.duration, 0);
  const avgSeconds = Math.round(totalSeconds / totalWorkouts);
  const totalReps = entries.reduce((acc, e) => {
    return acc + Object.values(e.totals).reduce((a, v) => a + v, 0);
  }, 0);
  
  container.innerHTML = `
    <div class="stats-grid">
      <div class="stats-card">
        <big>${totalWorkouts}</big>
        <label data-i18n="total_workouts">Entrenamientos</label>
      </div>
      <div class="stats-card">
        <big>${Math.floor(avgSeconds/60)}m ${avgSeconds%60}s</big>
        <label data-i18n="avg_time">Tiempo Medio</label>
      </div>
      <div class="stats-card" style="grid-column: span 2;">
        <big>${totalReps}</big>
        <label data-i18n="total_reps">Total Repeticiones</label>
      </div>
    </div>
  `;
}
