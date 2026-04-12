import '../css/style.css';
import { TowerDefenseGame } from './game.js';
import { applyTranslations, changeLanguage, t, currentLang } from './i18n.js';
import { Progression } from './models/Progression.js';
import { TOWER_TYPES } from './models/TowerDefinitions.js';

let game = null;

// --- View Management ---
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    const el = document.getElementById(viewId);
    if (el) el.classList.add('active');
}

window.showMenu = () => {
    // If we are in-game and it's running, show confirmation instead
    if (game && game.isRunning) {
        game.pause();
        const msgEl = document.getElementById('quit-cores-msg');
        if (msgEl) msgEl.innerText = `${t('cores_recovered')}: +${game.sessionCores}`;
        document.getElementById('quit-overlay').style.display = 'flex';
        return;
    }

    const stageMenu = document.getElementById('stage-select-menu');
    if (stageMenu) stageMenu.style.display = 'none';
    const mainActions = document.getElementById('main-menu-actions');
    if (mainActions) mainActions.style.display = 'flex';
    
    updateCoresUI();
    showView('view-menu');
};

window.confirmQuit = () => {
    if (game) {
        Progression.addCores(game.sessionCores);
        game.stop();
    }
    document.getElementById('quit-overlay').style.display = 'none';
    window.showMenu();
};

window.resumeGame = () => {
    document.getElementById('quit-overlay').style.display = 'none';
    if (game) game.resume();
};

function updateCoresUI() {
    const val = Progression.cores;
    const menuEl = document.getElementById('menu-cores-val');
    const labEl = document.getElementById('lab-cores-val');
    if (menuEl) menuEl.innerText = val;
    if (labEl) labEl.innerText = val;
}

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
        
        btn.innerHTML = `<span class="icon">${locked ? '🔒' : '⭐'}</span> ${t('stage')} ${i}`;
        if (!locked) {
            btn.onclick = () => window.startGame(i);
        }
        stageMenu.appendChild(btn);
    }
    
    if (Progression.isInfiniteUnlocked()) {
        const infBtn = document.createElement('button');
        infBtn.className = 'menu-btn primary';
        infBtn.style.borderStyle = 'dashed';
        infBtn.style.borderColor = '#ff00ff';
        infBtn.style.color = '#ff00ff';
        
        const maxInf = localStorage.getItem('td_max_infinite_wave') || '1';
        infBtn.innerHTML = `<span class="icon">♾️</span> ${t('stage')} INFINITE <span style="font-size:0.8em; opacity:0.8;">(Best: ${maxInf})</span>`;
        infBtn.onclick = () => window.startGame('infinite');
        stageMenu.appendChild(infBtn);
    }
    
    
    const backBtn = document.createElement('button');
    backBtn.className = 'menu-btn secondary';
    backBtn.innerText = t('btn_back');
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
        localStorage.removeItem(Progression.coreKey);
        localStorage.removeItem(Progression.labKey);
        Progression.loadState();
        alert('Data wiped successfully!');
        window.showMenu();
    }
};

window.showSettings = () => {
    showView('view-settings');
};

// --- Laboratory ---

const SKILLS_META = [
    { id: 'STARTING_MONEY', key: 'skill_start_money', currentEffect: (lvl) => `+${lvl * 10}` },
    { id: 'BOUNTY_HUNTER', key: 'skill_bounty', currentEffect: (lvl) => `+${lvl * 10}%` },
    { id: 'BASE_HEALTH', key: 'skill_health', currentEffect: (lvl) => `+${lvl * 2}` },
    { id: 'CHRONO_SLOW', key: 'skill_slow', currentEffect: (lvl) => `-${lvl * 5}%` },
    { id: 'WEAK_ENEMIES', key: 'skill_weak', currentEffect: (lvl) => `-${lvl * 5}%` }
];

window.showLaboratory = () => {
    updateLaboratoryUI();
    showView('view-laboratory');
    window.switchLabTab('towers');
};

window.switchLabTab = (tab) => {
    document.getElementById('lab-content-towers').style.display = tab === 'towers' ? 'flex' : 'none';
    document.getElementById('lab-content-skills').style.display = tab === 'skills' ? 'flex' : 'none';
    
    document.getElementById('tab-towers').className = tab === 'towers' ? 'menu-btn primary' : 'menu-btn secondary';
    document.getElementById('tab-skills').className = tab === 'skills' ? 'menu-btn primary' : 'menu-btn secondary';
};

function updateLaboratoryUI() {
    updateCoresUI();
    const cores = Progression.cores;
    
    // Render Towers
    const towContainer = document.getElementById('lab-content-towers');
    if (towContainer) {
        towContainer.innerHTML = '';
        TOWER_TYPES.forEach(tower => {
            const unlocked = Progression.isTowerUnlocked(tower.id) || tower.id === 'BASIC_BLASTER';
            const level = Progression.lab.towers[tower.id]?.level || 1;
            
            let btnHtml = '';
            if (!unlocked) {
                const cost = Progression.getTowerCostToUnlock(tower.id);
                const canAfford = cores >= cost;
                btnHtml = `<button class="menu-btn ${canAfford ? 'primary' : 'secondary'}" style="margin:0; padding:8px;" onclick="window.unlockTowerMeta('${tower.id}')">${t('btn_unlock')} (🔮 ${cost})</button>`;
            } else {
                const cost = Progression.getTowerCostToUpgrade(tower.id);
                const canAfford = cores >= cost;
                btnHtml = `
                    <div style="color:var(--primary); font-weight:bold; margin-bottom:5px;">${t('lvl')} ${level}</div>
                    <button class="menu-btn ${canAfford ? 'primary' : 'secondary'}" style="margin:0; padding:8px;" onclick="window.upgradeTowerMeta('${tower.id}')">${t('btn_upgrade')} (🔮 ${cost})</button>
                `;
            }
            
            // Name mapping
            let tName = 'tower_basic_blaster';
            let tDesc = 'tower_basic_desc';
            if (tower.id === 'HEAVY_CANNON') { tName = 'tower_heavy_cannon'; tDesc = 'tower_heavy_desc'; }
            if (tower.id === 'PLASMA_NOVA') { tName = 'tower_plasma_nova'; tDesc = 'tower_plasma_desc'; }

            towContainer.innerHTML += `
                <div style="background: rgba(0,0,0,0.4); padding: 15px; border-radius: 8px; border: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="margin:0; color: ${tower.presentation.color};">${t(tName) || tower.id}</h3>
                        <p style="margin:5px 0 0 0; font-size: 0.9rem; opacity: 0.8;">${t(tDesc) || ''}</p>
                    </div>
                    <div style="text-align: right; min-width: 120px;">
                        ${btnHtml}
                    </div>
                </div>
            `;
        });
    }
    
    // Render Skills
    const skillContainer = document.getElementById('lab-content-skills');
    if (skillContainer) {
        skillContainer.innerHTML = '';
        SKILLS_META.forEach(skillDef => {
            const level = Progression.lab.skills[skillDef.id]?.level || 0;
            const cost = Progression.getSkillCostToUpgrade(skillDef.id);
            const canAfford = cores >= cost;
            
            skillContainer.innerHTML += `
                <div style="background: rgba(0,0,0,0.4); padding: 15px; border-radius: 8px; border: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="margin:0; color: #fff;">${t(skillDef.key)}</h3>
                        <p style="margin:5px 0 0 0; font-size: 0.9rem; color: #00ff88;">${t('current_effect')} ${skillDef.currentEffect(level)}</p>
                    </div>
                    <div style="text-align: right; min-width: 120px;">
                        <div style="color:var(--primary); font-weight:bold; margin-bottom:5px;">${t('lvl')} ${level}</div>
                        <button class="menu-btn ${canAfford ? 'primary' : 'secondary'}" style="margin:0; padding:8px;" onclick="window.upgradeSkillMeta('${skillDef.id}')">${t('btn_upgrade')} (🔮 ${cost})</button>
                    </div>
                </div>
            `;
        });
        
        // Render Infinite Mode Unlock
        if (!Progression.isInfiniteUnlocked()) {
            const unlockCost = 100;
            const canAfford = cores >= unlockCost;
            skillContainer.innerHTML += `
                <div style="background: rgba(255,0,255,0.1); padding: 15px; border-radius: 8px; border: 1px dashed #ff00ff; display: flex; justify-content: space-between; align-items: center; margin-top:20px;">
                    <div>
                        <h3 style="margin:0; color: #ff00ff;">♾️ INFINITE STAGE</h3>
                        <p style="margin:5px 0 0 0; font-size: 0.9rem; color: #ff88ff;">Unlock the endless challenge mode</p>
                    </div>
                    <div style="text-align: right; min-width: 120px;">
                        <button class="menu-btn ${canAfford ? 'primary' : 'secondary'}" style="margin:0; padding:8px;" onclick="window.unlockInfiniteMeta()">${t('btn_unlock')} (🔮 ${unlockCost})</button>
                    </div>
                </div>
            `;
        } else {
             skillContainer.innerHTML += `
                <div style="background: rgba(255,0,255,0.1); padding: 15px; border-radius: 8px; border: 1px dashed #ff00ff; display: flex; justify-content: space-between; align-items: center; margin-top:20px;">
                    <div>
                        <h3 style="margin:0; color: #ff00ff;">♾️ INFINITE STAGE</h3>
                        <p style="margin:5px 0 0 0; font-size: 0.9rem; color: #ff88ff;">Unlocked! Select it from the stage menu.</p>
                    </div>
                </div>
            `;
        }
    }
}

window.unlockTowerMeta = (towerId) => {
    if (Progression.unlockTower(towerId)) updateLaboratoryUI();
};
window.upgradeTowerMeta = (towerId) => {
    if (Progression.upgradeTower(towerId)) updateLaboratoryUI();
};
window.upgradeSkillMeta = (skillId) => {
    if (Progression.upgradeSkill(skillId)) updateLaboratoryUI();
};
window.unlockInfiniteMeta = () => {
    if (Progression.unlockInfinite()) updateLaboratoryUI();
};

// --- Initialization ---
window.onload = () => {
    updateCoresUI();
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
