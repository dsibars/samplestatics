import '../css/style.css';
import { TowerDefenseGame } from './game.js';
import { applyTranslations, changeLanguage, t, currentLang } from './i18n.js';

let game = null;

// --- View Management ---
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
}

window.showMenu = () => {
    if (game) game.stop();
    const stageMenu = document.getElementById('stage-select-menu');
    if (stageMenu) stageMenu.style.display = 'none';
    const mainActions = document.getElementById('main-menu-actions');
    if (mainActions) mainActions.style.display = 'flex';
    showView('view-menu');
};

window.showStageSelect = () => {
    document.getElementById('main-menu-actions').style.display = 'none';
    const stageMenu = document.getElementById('stage-select-menu');
    stageMenu.style.display = 'flex';
    stageMenu.innerHTML = '';
    
    const maxStageStr = localStorage.getItem('td_max_stage') || '1';
    const maxStage = parseInt(maxStageStr, 10);
    
    for (let i = 1; i <= 6; i++) {
        const btn = document.createElement('button');
        const locked = i > maxStage;
        btn.className = `menu-btn ${locked ? 'secondary' : 'primary'}`;
        if (locked) btn.style.opacity = '0.5';
        
        btn.innerHTML = `<span class="icon">${locked ? '🔒' : '⭐'}</span> Stage ${i}`;
        if (!locked) {
            btn.onclick = () => window.startGame(i);
        }
        stageMenu.appendChild(btn);
    }
    
    const backBtn = document.createElement('button');
    backBtn.className = 'menu-btn secondary';
    backBtn.innerText = '← BACK';
    backBtn.onclick = () => {
        stageMenu.style.display = 'none';
        document.getElementById('main-menu-actions').style.display = 'flex';
    };
    stageMenu.appendChild(backBtn);
};

window.startGame = (stageId) => {
    showView('view-game');
    if (!game) {
        game = new TowerDefenseGame('gameCanvas');
    }
    game.start(stageId);
};

window.clearGameData = () => {
    if (confirm('Are you sure you want to completely wipe your progression?')) {
        localStorage.removeItem('td_max_stage');
        alert('Data wiped successfully!');
        window.showMenu();
    }
};

window.showSettings = () => {
    showView('view-settings');
};

// --- Initialization ---
window.onload = () => {
    applyTranslations();
    console.log(`Tower Defense Experiment Initialized (Lang: ${currentLang})`);
};

// Expose functions to window for HTML onclick attributes
window.showView = showView;
window.changeLanguage = changeLanguage;
window.closeTowerPopup = () => {
    if (game) game.closeTowerPopup();
};
window.startNextWave = () => {
    if (game) game.startNextWave();
};

window.startNextStage = () => {
    if (game) {
        document.getElementById('win-overlay').style.display = 'none';
        game.start(game.currentStageId + 1);
    }
};

window.restartStage = () => {
    if (game) {
        document.getElementById('lose-overlay').style.display = 'none';
        game.start(game.currentStageId);
    }
};

// Provide translation function to global scope for dynamic UI uses
window.t = t;
