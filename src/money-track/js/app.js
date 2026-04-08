import '../css/app.css';
import { state, saveState } from './state.js';
import { applyTranslations, t, currentLang } from './i18n.js';

// --- Pagination & Observer State ---
let currentPage = 0;
const PAGE_SIZE = 20;
let currentObserver = null;
let currentPersonFilter = null;

// --- View Router ---
window.showView = (viewId) => {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${viewId}`).classList.add('active');
  state.currentView = viewId;
  
  // Always scroll to top when changing views
  window.scrollTo(0, 0);
  
  renderView(viewId);
};

function renderView(viewId) {
  applyTranslations();
  if (viewId === 'welcome') renderDashboard();
  if (viewId === 'transaction') renderTransactionForm();
  if (viewId === 'history') {
    currentPersonFilter = null;
    renderHistory(true);
  }
  if (viewId === 'people') renderPeople();
  if (viewId === 'general_stats') renderGeneralStats();
  if (viewId === 'settings') renderSettings();
  if (viewId === 'stats') {
    // This is handled by showPersonStats(name)
  }
}

// --- Dashboard Logic ---
function renderDashboard() {
  const totals = calculateTotals();
  document.getElementById('main-balance').innerText = formatCurrency(totals.net);
  document.getElementById('main-balance').className = totals.net >= 0 ? 'positive' : 'negative';
  document.getElementById('total-plus').innerText = formatCurrency(totals.plus);
  document.getElementById('total-minus').innerText = formatCurrency(totals.minus);
}

function calculateTotals(transactions = state.transactions) {
  let plus = 0, minus = 0;
  transactions.forEach(tx => {
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

// --- History & Infinite Scroll Logic ---
function renderHistory(reset = false) {
  const isPersonStats = state.currentView === 'stats';
  const listId = isPersonStats ? 'person-history-list' : 'history-list';
  const sentinelId = isPersonStats ? 'stats-sentinel' : 'history-sentinel';
  const list = document.getElementById(listId);
  if (!list) return;

  if (reset) {
    currentPage = 0;
    list.innerHTML = '';
    setupInfiniteScroll(sentinelId);
  }

  const allFiltered = currentPersonFilter 
    ? state.transactions.filter(t => t.person === currentPersonFilter)
    : state.transactions;

  const start = currentPage * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const batch = allFiltered.slice(start, end);

  if (batch.length === 0 && reset) {
    list.innerHTML = `<p style="text-align:center; color:#555; padding:20px;">No records found</p>`;
    return;
  }

  const html = batch.map(tx => `
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

  const div = document.createElement('div');
  div.innerHTML = html;
  while (div.firstChild) list.appendChild(div.firstChild);

  currentPage++;
  
  // If no more items, disconnect observer
  if (allFiltered.length <= currentPage * PAGE_SIZE && currentObserver) {
    currentObserver.disconnect();
  }
}

function setupInfiniteScroll(sentinelId) {
  if (currentObserver) currentObserver.disconnect();
  
  const sentinel = document.getElementById(sentinelId);
  if (!sentinel) return;

  currentObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      renderHistory(false);
    }
  }, { threshold: 0.1 });

  currentObserver.observe(sentinel);
}

window.deleteTx = (id) => {
  if (confirm(t('delete_confirm'))) {
    state.transactions = state.transactions.filter(t => t.id !== id);
    saveState();
    renderHistory(true);
  }
};

// --- People Logic ---
function renderPeople() {
  const list = document.getElementById('people-list');
  if (!list) return;

  list.innerHTML = state.people.length > 0 ? '' : `<p data-i18n="no_people" style="text-align:center; color:#555;">No people</p>`;
  
  // Pre-calculate balances for performance
  const balances = {};
  state.people.forEach(p => balances[p] = 0);
  state.transactions.forEach(tx => {
    if (balances[tx.person] !== undefined) {
      if (tx.type === 'owe_me') balances[tx.person] += tx.amount;
      else balances[tx.person] -= tx.amount;
    }
  });

  state.people.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style = 'display:flex; justify-content:space-between; align-items:center; cursor:pointer;';
    card.onclick = () => showPersonStats(p);
    
    const balance = balances[p];
    const balanceClass = balance >= 0 ? 'positive' : 'negative';
    const balanceText = (balance >= 0 ? '+' : '-') + formatCurrency(balance);

    card.innerHTML = `
      <div style="display:flex; flex-direction:column;">
        <span style="font-weight:bold; font-size:1.1rem;">${p}</span>
        <span class="${balanceClass}" style="font-size:0.9rem;">${balanceText}</span>
      </div>
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

window.showPersonStats = (name) => {
  currentPersonFilter = name;
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

  renderHistory(true);
}

// --- General Stats Logic ---
window.renderGeneralStats = () => {
  const fromInput = document.getElementById('stats-from');
  const toInput = document.getElementById('stats-to');
  
  if (!fromInput.value) {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    fromInput.value = d.toISOString().split('T')[0];
    toInput.value = new Date().toISOString().split('T')[0];
  }

  const from = new Date(fromInput.value + 'T00:00:00');
  const to = new Date(toInput.value + 'T23:59:59');

  const filtered = state.transactions.filter(tx => {
    const d = new Date(tx.date);
    return d >= from && d <= to;
  });

  const totals = calculateTotals(filtered);
  document.getElementById('stats-period-net').innerText = (totals.net >= 0 ? '+' : '-') + formatCurrency(totals.net);
  document.getElementById('stats-period-net').className = totals.net >= 0 ? 'positive' : 'negative';
  document.getElementById('stats-period-plus').innerText = formatCurrency(totals.plus);
  document.getElementById('stats-period-minus').innerText = formatCurrency(totals.minus);

  // Per person breakdown
  const personMap = {};
  state.people.forEach(p => personMap[p] = 0);
  filtered.forEach(tx => {
    if (tx.type === 'owe_me') personMap[tx.person] += tx.amount;
    else personMap[tx.person] -= tx.amount;
  });

  const list = document.getElementById('stats-person-breakdown');
  list.innerHTML = Object.entries(personMap)
    .filter(([_, val]) => val !== 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, val]) => `
      <div class="tx-item">
        <span>${name}</span>
        <span class="${val >= 0 ? 'positive' : 'negative'}">${val >= 0 ? '+' : '-'}${formatCurrency(val)}</span>
      </div>
    `).join('');
};

// --- Settings Logic ---
function renderSettings() {
  const selector = document.getElementById('lang-selector');
  if (selector) selector.value = currentLang;
}

window.changeLanguage = () => {
  const val = document.getElementById('lang-selector').value;
  localStorage.setItem('static_apps_lang', val);
  location.reload();
};

window.exportData = () => {
  const data = {
    version: 1,
    transactions: state.transactions,
    people: state.people
  };
  const b = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(b);
  a.download = "balance_backup.json";
  a.click();
};

window.importData = (event) => {
  const r = new FileReader();
  r.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.transactions && data.people) {
        state.transactions = data.transactions;
        state.people = data.people;
        saveState();
        location.reload();
      }
    } catch (err) {
      alert("Invalid JSON file");
    }
  };
  r.readAsText(event.target.files[0]);
};

window.clearAllData = () => {
  if (confirm(t('erase_confirm'))) {
    localStorage.removeItem('balance_history');
    localStorage.removeItem('balance_people');
    location.reload();
  }
};

window.generateDummyData = () => {
  if (!confirm("Generate 1000 dummy transactions for performance testing?")) return;

  const testNames = ["Emma Watson", "Tony Stark", "Bruce Wayne", "Clark Kent", "Diana Prince"];
  testNames.forEach(name => {
    if (!state.people.includes(name)) state.people.push(name);
  });

  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  for (let i = 0; i < 1000; i++) {
    const randomPerson = testNames[Math.floor(Math.random() * testNames.length)];
    const randomAmount = (Math.random() * 50000) + 10;
    const randomType = Math.random() > 0.5 ? 'owe_me' : 'i_owe';
    
    // Spread over last 6 months
    const randomDate = new Date(sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime()));

    state.transactions.push({
      id: Date.now() + i,
      date: randomDate.toISOString(),
      amount: parseFloat(randomAmount.toFixed(2)),
      person: randomPerson,
      desc: "Stress Test #" + (i + 1),
      type: randomType
    });
  }

  // Sort by date so history looks correct
  state.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  saveState();
  alert("Generated 1000 transactions! App will reload now.");
  location.reload();
};

// --- Helpers ---
function formatCurrency(val) {
  return Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

window.onload = () => {
  applyTranslations();
  renderDashboard();
};
