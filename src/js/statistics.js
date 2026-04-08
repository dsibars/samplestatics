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
