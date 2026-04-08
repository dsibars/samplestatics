import '../css/app.css';
import { state, saveState } from './state.js';
import { applyTranslations, t, currentLang } from './i18n.js';

window.showView = (viewId) => {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${viewId}`).classList.add('active');
  state.currentView = viewId;
  window.scrollTo(0, 0);
  renderView(viewId);
};

function renderView(viewId) {
  applyTranslations();
  if (viewId === 'welcome') renderTodoList();
  if (viewId === 'settings') renderSettings();
}

function renderTodoList() {
  const container = document.getElementById('todo-list-container');
  if (!container) return;

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = state.tasks.filter(t => t.date === today);

  if (todayTasks.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 40px 20px; color: var(--text-dim);">
        <div style="font-size: 4rem; margin-bottom: 20px;">☕</div>
        <p data-i18n="no_tasks">${t('no_tasks')}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = todayTasks.map(task => `
    <div class="todo-item ${task.completed ? 'completed' : ''}" onclick="toggleTask(${task.id})">
      <div class="todo-checkbox">
        ${task.completed ? '✓' : ''}
      </div>
      <div class="todo-content">
        <h3>${task.name}</h3>
        ${task.desc ? `<p>${task.desc}</p>` : ''}
      </div>
    </div>
  `).join('');
}

window.toggleTask = (id) => {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveState();
    renderTodoList();
  }
};

window.addTask = () => {
  const name = document.getElementById('task-name').value.trim();
  const desc = document.getElementById('task-desc').value.trim();
  const date = document.getElementById('task-date').value;

  if (!name || !date) return;

  state.tasks.push({
    id: Date.now(),
    name,
    desc,
    date,
    completed: false
  });

  saveState();
  // Clear inputs
  document.getElementById('task-name').value = '';
  document.getElementById('task-desc').value = '';
  
  showView('welcome');
};

function renderSettings() {
  const langSelector = document.getElementById('lang-selector');
  if (langSelector) langSelector.value = currentLang;
  
  // Set default date to today in form
  document.getElementById('task-date').value = new Date().toISOString().split('T')[0];
}

window.changeLanguage = () => {
  const val = document.getElementById('lang-selector').value;
  localStorage.setItem('static_apps_lang', val);
  location.reload();
};

window.exportData = () => {
  const data = { version: 1, tasks: state.tasks };
  const b = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(b);
  a.download = "todo_backup.json";
  a.click();
};

window.importData = (event) => {
  const r = new FileReader();
  r.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.tasks) {
        state.tasks = data.tasks;
        saveState();
        location.reload();
      }
    } catch (err) {
      alert("Invalid file");
    }
  };
  r.readAsText(event.target.files[0]);
};

window.clearAllData = () => {
  if (confirm(t('erase_confirm'))) {
    localStorage.removeItem('todo_list_tasks');
    location.reload();
  }
};

window.onload = () => {
  applyTranslations();
  renderTodoList();
};
