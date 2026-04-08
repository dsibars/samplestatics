import '../css/app.css';
import { state, saveState } from './state.js';
import { applyTranslations, t, currentLang } from './i18n.js';

// --- View Router ---
window.showView = (viewId) => {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${viewId}`).classList.add('active');
  state.currentView = viewId;
  renderView(viewId);
};

function renderView(viewId) {
  applyTranslations();
  if (viewId === 'welcome') renderDashboard();
  if (viewId === 'transaction') renderTransactionForm();
  if (viewId === 'history') renderHistory();
  if (viewId === 'people') renderPeople();
}

// --- Dashboard Logic ---
function renderDashboard() {
  const totals = calculateTotals();
  document.getElementById('main-balance').innerText = formatCurrency(totals.net);
  document.getElementById('main-balance').className = totals.net >= 0 ? 'positive' : 'negative';
  document.getElementById('total-plus').innerText = formatCurrency(totals.plus);
  document.getElementById('total-minus').innerText = formatCurrency(totals.minus);
}

function calculateTotals() {
  let plus = 0, minus = 0;
  state.transactions.forEach(tx => {
    if (tx.type === 'owe_me') plus += tx.amount;
    else minus += tx.amount;
  });
  return { plus, minus, net: plus - minus };
}

// --- Transaction Logic ---
function renderTransactionForm() {
  const select = document.getElementById('tx-person');
  select.innerHTML = state.people.map(p => `<option value="${p}">${p}</option>`).join('');
  
  // Toggle Logic
  document.querySelectorAll('#tx-type-toggle .toggle-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#tx-type-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };
  });
}

window.saveTransaction = () => {
  const amount = parseFloat(document.getElementById('tx-amount').value);
  const person = document.getElementById('tx-person').value;
  const desc = document.getElementById('tx-desc').value;
  const type = document.querySelector('#tx-type-toggle .toggle-btn.active').dataset.type;

  if (!amount || !person) return;

  state.transactions.unshift({
    id: Date.now(),
    date: new Date().toISOString(),
    amount,
    person,
    desc,
    type
  });

  saveState();
  showView('welcome');
};

// --- History Logic ---
function renderHistory(personFilter = null) {
  const listId = personFilter ? 'person-history-list' : 'history-list';
  const list = document.getElementById(listId);
  const filtered = personFilter 
    ? state.transactions.filter(t => t.person === personFilter)
    : state.transactions;

  list.innerHTML = filtered.map(tx => `
    <div class="tx-item">
      <div class="tx-info">
        <h3>${tx.person} ${tx.desc ? '<span style="font-weight:normal;opacity:0.7"> - '+tx.desc+'</span>' : ''}</h3>
        <span>${new Date(tx.date).toLocaleDateString(currentLang)}</span>
      </div>
      <div class="tx-amount ${tx.type === 'owe_me' ? 'positive' : 'negative'}">
        ${tx.type === 'owe_me' ? '+' : '-'}${formatCurrency(tx.amount)}
        <button onclick="deleteTx(${tx.id})" style="border:none; background:none; color:#555; margin-left:10px; cursor:pointer;">×</button>
      </div>
    </div>
  `).join('');
}

window.deleteTx = (id) => {
  if (confirm(t('delete_confirm'))) {
    state.transactions = state.transactions.filter(t => t.id !== id);
    saveState();
    renderView(state.currentView);
  }
};

// --- People Logic ---
function renderPeople() {
  const list = document.getElementById('people-list');
  list.innerHTML = state.people.length > 0 ? '' : `<p data-i18n="no_people" style="text-align:center; color:#555;">No people</p>`;
  
  state.people.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style = 'display:flex; justify-content:space-between; align-items:center; cursor:pointer;';
    card.onclick = () => showPersonStats(p);
    
    card.innerHTML = `
      <span style="font-weight:bold; font-size:1.1rem;">${p}</span>
      <button onclick="event.stopPropagation(); removePerson('${p}')" style="background:none; border:none; color:#f87171; font-size:1.5rem;">×</button>
    `;
    list.appendChild(card);
  });
  applyTranslations();
}

window.addPerson = () => {
  const name = document.getElementById('new-person-name').value.trim();
  if (name && !state.people.includes(name)) {
    state.people.push(name);
    saveState();
    renderPeople();
    document.getElementById('new-person-name').value = '';
  }
};

window.removePerson = (name) => {
  state.people = state.people.filter(p => p !== name);
  saveState();
  renderPeople();
};

function showPersonStats(name) {
  showView('stats');
  document.getElementById('stats-title').innerText = `${t('net_with')} ${name}`;
  
  const personTxs = state.transactions.filter(t => t.person === name);
  let net = 0;
  personTxs.forEach(tx => {
    if (tx.type === 'owe_me') net += tx.amount;
    else net -= tx.amount;
  });

  const balanceEl = document.getElementById('person-net-balance');
  balanceEl.innerText = formatCurrency(net);
  balanceEl.className = net >= 0 ? 'positive' : 'negative';

  renderHistory(name);
}

// --- Helpers ---
function formatCurrency(val) {
  return Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

window.onload = () => {
  applyTranslations();
  renderDashboard();
};
