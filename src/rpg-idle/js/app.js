import { RPGGame } from './game.js';
import { applyTranslations, changeLanguage, t } from './i18n.js';
import { Progression } from './models/Progression.js';
import { Hero } from './models/Hero.js';
import { SKILLS_DATA } from './constants.js';

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
    const allLvl1 = Progression.prog.heroes.every(h => h.level === 1);
    if (Progression.prog.milestone > 1 && allLvl1) {
        alert(t('greedy_reset_msg'));
        Progression.resetMilestone();
    }
    
    showView('view-game');
    document.getElementById('combat-log').innerHTML = '';
    document.getElementById('win-overlay').style.display = 'none';
    document.getElementById('lose-overlay').style.display = 'none';
    game = new RPGGame();
    game.startAdventure();
};

let lastNextCombatTime = 0;
window.nextCombat = () => {
    if (performance.now() - lastNextCombatTime < 500) return;
    if (game && game.popupOpenTime && performance.now() - game.popupOpenTime < 300) return;
    lastNextCombatTime = performance.now();
    
    document.getElementById('win-overlay').style.display = 'none';
    document.getElementById('combat-log').innerHTML = '';
    if (game) game.nextCombat();
};

// --- Village ---

window.showVillage = () => {
    if (Progression.checkFreeHero()) {
        alert(t('free_hero_welcome') || "Hello adventurer! I have a present for you!");
        Progression.addHero(Hero.generateRandom(1).toJSON());
    }
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
        const isActive = Progression.prog.activeHeroIndices.includes(i);
        const card = document.createElement('div');
        card.style = `background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; border: 1px solid ${isActive ? 'var(--primary)' : '#444'}; cursor: pointer; position: relative;`;
        card.onclick = () => window.showHeroDetails(i);
        card.innerHTML = `
            ${isActive ? '<div style="position:absolute; top:5px; right:5px; font-size:0.8rem; background:var(--primary); color:black; padding:2px 5px; border-radius:4px; font-weight:bold;">ACTIVE</div>' : ''}
            <div style="font-weight:bold;">${h.name}</div>
            <div style="font-size:0.8rem; color:#aaa;">Lvl ${h.level} ${t(h.origin)}</div>
            <div style="font-size:0.7rem; color:#aaa;">${t('stat_hp')}: ${h.baseMaxHp} ${t('stat_attack').toUpperCase()}: ${h.baseStrength} | SP: ${h.statPoints}</div>
        `;
        tavernList.appendChild(card);
    });

    // Show recruitment option if roster not full
    if (Progression.prog.heroes.length < Progression.getMaxRosterSize()) {
        const recruitCard = document.createElement('div');
        const cost = 500;
        recruitCard.style = 'background: rgba(0,242,255,0.05); padding: 10px; border-radius: 8px; border: 1px dashed var(--primary); display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80px;';
        recruitCard.innerHTML = `
            <div style="font-weight:bold; color:var(--primary);">${t('recruit_new')}</div>
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
                <div style="font-size:0.8rem; color:#aaa;">${t('owned')}: ${Progression.prog.inventory[item.id] || 0}</div>
            </div>
            <button class="menu-btn primary" style="padding: 8px 15px;" onclick="window.buyItem('${item.id}', ${item.cost})">💰 ${item.cost}</button>
        `;
        shopList.appendChild(itemRow);
    });

    // Upgrades
    const upgradeList = document.getElementById('upgrades-list');
    upgradeList.innerHTML = '';
    const buildings = [
        { id: 'rosterSizeLevel', title: t('roster_size_title') || 'Roster Size', max: 4 },
        { id: 'partySizeLevel', title: t('party_size_title') || 'Party Quality', max: 3 },
        { id: 'gymLevel', title: t('gym_title') || 'Hero Gym', max: 50 }
    ];

    buildings.forEach(b => {
        const level = Progression.prog.village[b.id] || 0;
        const cost = Progression.getBuildingCost(b.id);
        const upgradeRow = document.createElement('div');
        upgradeRow.style = 'background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;';
        
        const isMax = level >= b.max;
        const extra = b.id === 'gymLevel' ? ` (${level}%)` : ` (${4 + level} max)`;
        const label = b.id === 'partySizeLevel' ? ` (${1 + level} heroes)` : extra;

        upgradeRow.innerHTML = `
            <div>
                <div style="font-weight:bold;">${b.title}</div>
                <div style="font-size:0.8rem; color:#aaa;">${t('level_label')}: ${level}${isMax ? ' [MAX]' : label}</div>
            </div>
            ${isMax ? '<span style="color:#888;">MAX</span>' : `<button class="menu-btn primary" style="padding: 8px 15px;" onclick="window.buyBuilding('${b.id}')">🔮 ${cost}</button>`}
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

window.currentHeroIndex = -1;

window.showHeroDetails = (index) => {
    window.currentHeroIndex = index;
    const heroData = Progression.prog.heroes[index];
    if (!heroData) return;

    document.getElementById('hero-details-name').innerText = `${heroData.name} (${heroData.level})`;
    document.getElementById('hero-details-sp').innerText = heroData.statPoints;
    
    // Update EXP Bar
    const nextLevelExp = heroData.level * 20;
    const expPercent = Math.min(100, (heroData.exp / nextLevelExp) * 100);
    document.getElementById('hero-details-exp-text').innerText = `${heroData.exp} / ${nextLevelExp} EXP`;
    document.getElementById('hero-details-exp-bar').style.width = expPercent + '%';

    // Translation labels
    document.getElementById('label-sp').innerText = t('stat_points') + ':';

    const statsContainer = document.getElementById('hero-stats-container');
    statsContainer.innerHTML = '';
    
    const stats = [
        { id: 'baseMaxHp', label: t('stat_hp'), val: heroData.baseMaxHp },
        { id: 'baseMaxMp', label: t('stat_mp'), val: heroData.baseMaxMp },
        { id: 'baseStrength', label: t('stat_attack'), val: heroData.baseStrength },
        { id: 'baseSpeed', label: t('stat_speed'), val: heroData.baseSpeed },
        { id: 'baseDefense', label: t('stat_defense'), val: heroData.baseDefense },
        { id: 'baseMagicPower', label: t('stat_magic'), val: heroData.baseMagicPower }
    ];

    stats.forEach(st => {
        const row = document.createElement('div');
        row.style = 'display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 5px;';
        const canUpgrade = heroData.statPoints > 0;
        row.innerHTML = `
            <div><span style="font-weight:bold; color: #aaa;">${st.label}:</span> <span style="font-size:1.1rem; color:white;">${st.val}</span></div>
            <button class="menu-btn ${canUpgrade ? 'primary' : 'secondary'}" style="padding: 5px 15px; width: 40px;" ${canUpgrade ? '' : 'disabled'} onclick="window.increaseStat(${index}, '${st.id}')">+</button>
        `;
        statsContainer.appendChild(row);
    });

    // Active Toggle & Fire
    const actionContainer = document.createElement('div');
    actionContainer.style = 'margin-top: 20px; display: flex; flex-direction: column; gap: 10px;';
    
    const isActive = Progression.prog.activeHeroIndices.includes(index);
    const numActive = Progression.prog.activeHeroIndices.length;
    const maxSize = Progression.getMaxPartySize();
    
    const canUnselect = numActive > 1;
    // Special case: if maxSize is 1 and numActive is 1, we let the user select a new hero (it will swap)
    const canSelect = numActive < maxSize || (maxSize === 1 && numActive === 1);

    let toggleBtn = '';
    if (isActive) {
        toggleBtn = `<button class="menu-btn ${canUnselect ? 'secondary' : 'secondary'}" style="width: 100%; opacity: ${canUnselect ? 1 : 0.5};" ${canUnselect ? `onclick="window.toggleHeroActive(${index})"` : ''}>❌ ${t('btn_unselect') || 'Unselect from Party'}</button>`;
    } else {
        toggleBtn = `<button class="menu-btn ${canSelect ? 'primary' : 'secondary'}" style="width: 100%; opacity: ${canSelect ? 1 : 0.5};" ${canSelect ? `onclick="window.toggleHeroActive(${index})"` : ''}>⚔️ ${t('btn_select') || 'Add to Party'}</button>`;
    }

    const fireBtn = `<button class="menu-btn secondary" 
                style="padding: 10px 20px; font-size: 0.9rem; border-color: #f55; color: #f55; ${isActive ? 'opacity: 0.3; cursor: default;' : ''}" 
                ${!isActive ? `onclick="window.fireHero(${index})"` : ''}>
            🗑️ ${t('btn_fire_hero')}
        </button>`;

    actionContainer.innerHTML = toggleBtn + fireBtn;
    statsContainer.appendChild(actionContainer);

    showView('view-hero-details');
};

window.toggleHeroActive = (index) => {
    const isActive = Progression.prog.activeHeroIndices.includes(index);
    const numActive = Progression.prog.activeHeroIndices.length;
    const maxSize = Progression.getMaxPartySize();

    // Special case: swap if limit is 1
    if (!isActive && maxSize === 1 && numActive === 1) {
        if (confirm(t('confirm_hero_switch') || "This will change the only party member, sure?")) {
            Progression.swapActiveHero(index);
            window.showHeroDetails(index);
        }
        return;
    }

    if (Progression.toggleHeroActive(index)) {
        window.showHeroDetails(index);
    } else {
        if (Progression.prog.activeHeroIndices.includes(index)) {
            alert(t('need_min_hero') || "You need at least one hero in the party!");
        } else {
            alert(t('party_limit_reached') || "Party size limit reached!");
        }
    }
};

window.fireHero = (index) => {
    const heroData = Progression.prog.heroes[index];
    if (!heroData) return;

    if (Progression.prog.heroes.length <= 1) {
        alert(t('fire_limit_msg'));
        return;
    }

    if (confirm(t('confirm_fire').replace('{hero}', heroData.name))) {
        if (Progression.removeHero(index)) {
            window.showVillage();
        }
    }
};

window.increaseStat = (index, statId) => {
    const heroData = Progression.prog.heroes[index];
    if (heroData && heroData.statPoints > 0) {
        heroData.statPoints--;
        
        // Efficiency: HP +3, MP +2, rest +1
        const gain = statId === 'baseMaxHp' ? 3 : (statId === 'baseMaxMp' ? 2 : 1);
        heroData[statId] = (heroData[statId] || 0) + gain;
        
        if (statId === 'baseMaxHp') heroData.hp += 3;
        if (statId === 'baseMaxMp') heroData.mp += 2;

        Progression.updateHero(index, heroData);
        window.showHeroDetails(index);
    }
};

window.currentSkillTab = 'physical';

window.switchSkillTab = (tab) => {
    window.currentSkillTab = tab;
    const tabs = ['physical', 'magic', 'tricker', 'support'];
    tabs.forEach(t => {
        const btn = document.getElementById(`skill-tab-${t}`);
        if (btn) btn.className = tab === t ? 'menu-btn primary' : 'menu-btn secondary';
    });
    window.showHeroSkills();
};

window.showHeroSkills = (index) => {
    if (index === undefined) index = window.currentHeroIndex;
    
    const heroData = Progression.prog.heroes[index];
    if (!heroData) return;

    document.getElementById('hero-skills-sp').innerText = heroData.skillPoints;
    document.getElementById('label-skills-sp').innerText = t('skill_points') + ':';

    const skillsContainer = document.getElementById('hero-skills-container');
    skillsContainer.innerHTML = '';
    
    const categorySkills = Object.values(SKILLS_DATA).filter(sk => sk.category === window.currentSkillTab);

    categorySkills.forEach(sk => {
        const currentLevel = heroData.skills[sk.id];
        const isUnlocked = currentLevel !== undefined;
        
        // Visibility checklist
        let isVisible = false;
        if (sk.tier === 1) isVisible = true;
        else if (sk.dependency && heroData.skills[sk.dependency] !== undefined) isVisible = true;

        if (!isVisible) return;

        const row = document.createElement('div');
        row.style = 'background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 10px;';
        
        let actionHTML = '';
        if (!isUnlocked) {
            const canAfford = heroData.skillPoints >= sk.unlockCost;
            actionHTML = `
                <div style="display:flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 0.8rem; color: #aaa;">${t(sk.id + '_desc')}</div>
                    <button class="menu-btn ${canAfford ? 'primary' : 'secondary'}" style="padding: 5px 15px;" ${canAfford ? '' : 'disabled'} onclick="window.learnSkill(${index}, '${sk.id}', true)">${t('learn_skill_btn')} (${sk.unlockCost} SP)</button>
                </div>
            `;
        } else {
            const multiplier = 1.0 + (0.005 * sk.tier * currentLevel);
            const enhanceCost = Math.max(1, sk.tier * currentLevel);
            const canEnhance = heroData.skillPoints >= enhanceCost;
            actionHTML = `
                <div style="display:flex; justify-content: space-between; align-items: center; width: 100%;">
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <div style="font-size: 0.8rem; color: #aaa;">${t(sk.id + '_desc')}</div>
                        <div style="font-size: 0.8rem; color: #0af;">${t('level_label')} ${currentLevel} (+${((multiplier - 1) * 100).toFixed(1)}%)</div>
                    </div>
                    <button class="menu-btn ${canEnhance ? 'primary' : 'secondary'}" style="padding: 5px 15px; margin-left: 10px;" ${canEnhance ? '' : 'disabled'} onclick="window.learnSkill(${index}, '${sk.id}', false)">${t('enhance')} (${enhanceCost} SP)</button>
                </div>
            `;
        }

        row.innerHTML = `
            <div style="font-weight:bold; color: white; margin-bottom: 5px;">${t(sk.id)} <span style="font-size:0.7rem; color:#888;">Tier ${sk.tier}</span></div>
            ${actionHTML}
        `;
        skillsContainer.appendChild(row);
    });

    showView('view-hero-skills');
};

window.learnSkill = (index, skillId, isUnlock) => {
    const heroData = Progression.prog.heroes[index];
    const skillData = SKILLS_DATA[skillId];
    if (!heroData || !skillData) return;

    if (isUnlock) {
        if (heroData.skillPoints >= skillData.unlockCost) {
            heroData.skillPoints -= skillData.unlockCost;
            heroData.skills[skillId] = 0;
            Progression.updateHero(index, heroData);
            window.showHeroSkills(index);
        }
    } else {
        const currentLevel = heroData.skills[skillId];
        const enhanceCost = Math.max(1, skillData.tier * currentLevel);
        if (heroData.skillPoints >= enhanceCost) {
            heroData.skillPoints -= enhanceCost;
            heroData.skills[skillId]++;
            Progression.updateHero(index, heroData);
            window.showHeroSkills(index);
        }
    }
};

window.buyBuilding = (type) => {
    if (Progression.buyBuilding(type)) {
        updateVillageUI();
    } else {
        alert(t('not_enough_cores'));
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
    document.getElementById('lang-selector').value = localStorage.getItem('static_apps_lang') || 'en';
};

window.changeLanguage = () => {
    changeLanguage();
};

window.clearGameData = () => {
    if (confirm(t('confirm_wipe'))) {
        localStorage.removeItem('rpg_cores');
        localStorage.removeItem('rpg_progression');
        Progression.loadState();
        alert(t('wipe_success'));
        window.showMenu();
    }
};

window.toggleAutoBattle = (checked) => {
    localStorage.setItem('rpg_autobattle', checked ? 'true' : 'false');
    if (game) {
        game.autoBattle = checked;
        if (checked && game.currentCombat && !game.currentCombat.isCombatOver) {
            const participant = game.currentCombat.turnOrder[game.currentCombat.currentTurnIndex];
            if (participant && game.heroes.includes(participant)) {
                game.currentCombat.heroAutoTurn(participant);
            }
        }
    }
};

window.toggleCombatLog = () => {
    const logOverlay = document.getElementById('combat-log');
    const toggleText = document.getElementById('log-toggle-text');
    if (logOverlay.style.display === 'none' || logOverlay.style.display === '') {
        logOverlay.style.display = 'block';
        toggleText.innerText = t('hide_logs') || 'Hide Logs';
    } else {
        logOverlay.style.display = 'none';
        toggleText.innerText = t('show_logs') || 'Show Logs';
    }
};

window.exportData = () => {
    const data = {
        cores: localStorage.getItem('rpg_cores'),
        progression: localStorage.getItem('rpg_progression'),
        autobattle: localStorage.getItem('rpg_autobattle')
    };
    const b = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "rpg_idle_backup.json";
    a.click();
};

window.importData = (event) => {
    const r = new FileReader();
    r.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.progression) {
                if (data.cores) localStorage.setItem('rpg_cores', data.cores);
                localStorage.setItem('rpg_progression', data.progression);
                if (data.autobattle) localStorage.setItem('rpg_autobattle', data.autobattle);
                alert(t('wipe_success') || 'Data imported successfully!');
                location.reload();
            } else {
                alert("Invalid save file structure.");
            }
        } catch (err) {
            alert("Error parsing file.");
        }
    };
    r.readAsText(event.target.files[0]);
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
window.buyBuilding = buyBuilding;
window.toggleHeroActive = toggleHeroActive;
window.buyItem = buyItem;
window.clearGameData = clearGameData;
window.toggleAutoBattle = toggleAutoBattle;
window.toggleCombatLog = toggleCombatLog;
window.showHeroDetails = showHeroDetails;
window.increaseStat = increaseStat;
window.showHeroSkills = showHeroSkills;
window.learnSkill = learnSkill;
window.switchSkillTab = switchSkillTab;
