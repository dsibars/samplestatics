import { RPGGame } from './game.js';
import { applyTranslations, changeLanguage, t } from './i18n.js';
import { Progression } from './models/Progression.js';
import { Hero } from './models/Hero.js';

let game = null;

function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    const el = document.getElementById(viewId);
    if (el) el.classList.add('active');
}

window.showMenu = () => {
    updateCoresUI();
    showView('view-menu');
};

function updateCoresUI() {
    document.getElementById('menu-cores-val').innerText = Progression.cores;
}

window.startAdventure = () => {
    if (Progression.prog.heroes.length === 0) {
        alert('Recruit at least one hero in the village first!');
        window.showVillage();
        return;
    }
    showView('view-game');
    document.getElementById('combat-log').innerHTML = '';
    document.getElementById('win-overlay').style.display = 'none';
    document.getElementById('lose-overlay').style.display = 'none';
    game = new RPGGame();
    game.startAdventure();
};

window.nextCombat = () => {
    document.getElementById('win-overlay').style.display = 'none';
    document.getElementById('combat-log').innerHTML = '';
    if (game) game.nextCombat();
};

// --- Village ---

window.showVillage = () => {
    updateVillageUI();
    showView('view-village');
    window.switchVillageTab('tavern');
};

window.switchVillageTab = (tab) => {
    document.getElementById('village-content-tavern').style.display = tab === 'tavern' ? 'block' : 'none';
    document.getElementById('village-content-shop').style.display = tab === 'shop' ? 'block' : 'none';
    document.getElementById('village-content-upgrades').style.display = tab === 'upgrades' ? 'block' : 'none';

    document.getElementById('tab-tavern').className = tab === 'tavern' ? 'menu-btn primary' : 'menu-btn secondary';
    document.getElementById('tab-shop').className = tab === 'shop' ? 'menu-btn primary' : 'menu-btn secondary';
    document.getElementById('tab-upgrades').className = tab === 'upgrades' ? 'menu-btn primary' : 'menu-btn secondary';
};

function updateVillageUI() {
    document.getElementById('village-gold-val').innerText = Progression.prog.gold;
    document.getElementById('village-cores-val').innerText = Progression.cores;

    // Tavern
    const tavernList = document.getElementById('tavern-hero-list');
    tavernList.innerHTML = '';

    // Show current heroes
    Progression.prog.heroes.forEach((h, i) => {
        const card = document.createElement('div');
        card.style = 'background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; border: 1px solid #444;';
        card.innerHTML = `
            <div style="font-weight:bold;">${h.name}</div>
            <div style="font-size:0.8rem; color:#aaa;">Lvl ${h.level} ${h.type}</div>
            <div style="font-size:0.7rem; color:#aaa;">HP: ${h.maxHp} ATK: ${h.strength}</div>
        `;
        tavernList.appendChild(card);
    });

    // Show recruitment option if < 4
    if (Progression.prog.heroes.length < 4) {
        const recruitCard = document.createElement('div');
        const cost = 50 + (Progression.prog.heroes.length * 50);
        recruitCard.style = 'background: rgba(0,242,255,0.05); padding: 10px; border-radius: 8px; border: 1px dashed var(--primary); display: flex; flex-direction: column; align-items: center; justify-content: center;';
        recruitCard.innerHTML = `
            <div style="font-weight:bold; color:var(--primary);">Recruit New Hero</div>
            <div style="margin: 5px 0;">💰 ${cost}</div>
            <button class="menu-btn primary" style="padding: 5px 15px; font-size:0.8rem;" onclick="window.recruitHero(${cost})">${t('btn_recruit')}</button>
        `;
        tavernList.appendChild(recruitCard);
    }

    // Shop
    const shopList = document.getElementById('shop-item-list');
    shopList.innerHTML = '';
    const items = [
        { id: 'tiny_potion', cost: 20 },
        { id: 'tiny_mana_potion', cost: 20 }
    ];

    items.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.style = 'background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;';
        itemRow.innerHTML = `
            <div>
                <div style="font-weight:bold;">${t(item.id)}</div>
                <div style="font-size:0.8rem; color:#aaa;">Owned: ${Progression.prog.inventory[item.id] || 0}</div>
            </div>
            <button class="menu-btn primary" style="padding: 8px 15px;" onclick="window.buyItem('${item.id}', ${item.cost})">💰 ${item.cost}</button>
        `;
        shopList.appendChild(itemRow);
    });

    // Upgrades
    const upgradeList = document.getElementById('upgrades-list');
    upgradeList.innerHTML = '';
    const upgrades = ['attack_boost', 'defense_boost', 'hp_boost'];

    upgrades.forEach(upId => {
        const level = Progression.prog.upgrades[upId] || 0;
        const cost = Progression.getUpgradeCost(upId);
        const upgradeRow = document.createElement('div');
        upgradeRow.style = 'background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;';
        upgradeRow.innerHTML = `
            <div>
                <div style="font-weight:bold;">${t(upId)}</div>
                <div style="font-size:0.8rem; color:#aaa;">Level: ${level}</div>
            </div>
            <button class="menu-btn primary" style="padding: 8px 15px;" onclick="window.buyUpgrade('${upId}')">🔮 ${cost}</button>
        `;
        upgradeList.appendChild(upgradeRow);
    });
}

window.recruitHero = (cost) => {
    if (Progression.prog.gold >= cost) {
        if (Progression.addHero(Hero.generateRandom(1).toJSON())) {
            Progression.spendGold(cost);
            updateVillageUI();
        }
    } else {
        alert(t('not_enough_gold'));
    }
};

window.buyUpgrade = (upgradeId) => {
    if (Progression.buyUpgrade(upgradeId)) {
        updateVillageUI();
    } else {
        alert('Not enough Cores!');
    }
};

window.buyItem = (itemId, cost) => {
    if (Progression.prog.gold >= cost) {
        Progression.spendGold(cost);
        Progression.addItem(itemId);
        updateVillageUI();
    } else {
        alert(t('not_enough_gold'));
    }
};

// --- Settings ---

window.showSettings = () => {
    showView('view-settings');
    document.getElementById('lang-selector').value = localStorage.getItem('rpg_lang') || 'en';
};

window.changeLanguage = () => {
    changeLanguage();
};

window.clearGameData = () => {
    if (confirm('Are you sure you want to completely wipe your progression?')) {
        localStorage.removeItem('rpg_cores');
        localStorage.removeItem('rpg_progression');
        Progression.loadState();
        alert('Data wiped successfully!');
        window.showMenu();
    }
};

// --- Initialization ---
window.onload = () => {
    updateCoresUI();
    applyTranslations();
    console.log(`RPG Idle Initialized`);
};

// Expose functions to window
window.showMenu = showMenu;
window.showVillage = showVillage;
window.showSettings = showSettings;
window.startAdventure = startAdventure;
window.nextCombat = nextCombat;
window.switchVillageTab = switchVillageTab;
window.recruitHero = recruitHero;
window.buyItem = buyItem;
window.clearGameData = clearGameData;
