import { RPGGame } from './game.js';
import { applyTranslations, changeLanguage, t, formatEquipmentName } from './i18n.js';
import { Progression } from './models/Progression.js';
import { Hero } from './models/Hero.js';
import { SKILLS_DATA, WEAPON_FAMILIES, ARMOR_ARCHETYPES, MATERIAL_TIERS } from './constants.js';

let game = null;

const TRAINING_REGIMES = {
    light_sparring: { id: 'light_sparring', duration: 3600000, exp: 50 },
    endurance_run: { id: 'endurance_run', duration: 10800000, exp: 200, goldChance: 0.3 },
    master_class: { id: 'master_class', duration: 28800000, exp: 600, itemChance: 0.2 },
    heroic_pilgrimage: { id: 'heroic_pilgrimage', duration: 86400000, exp: 2000, coreReward: 1 }
};

const QUESTS = {
    volcano_cleanup: {
        id: 'volcano_cleanup',
        duration: 14400000, // 4h
        exp: 300,
        req: { type: 'magicPower', value: 5, label: 'High Magic' },
        reward: { type: 'fire_resist', label: 'Fire Resist' }
    },
    mountain_guard: {
        id: 'mountain_guard',
        duration: 14400000, // 4h
        exp: 300,
        req: { type: 'strength', value: 5, label: 'High Strength' },
        reward: { type: 'str_growth', label: 'Str Growth' }
    },
    storm_tracker: {
        id: 'storm_tracker',
        duration: 14400000, // 4h
        exp: 300,
        req: { type: 'speed', value: 5, label: 'High Speed' },
        reward: { type: 'storm_eff', label: 'Storm Eff.' }
    }
};

const AFFIXES = ['vampire', 'sage', 'titan', 'assassin', 'phoenix'];

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
    const el = document.getElementById('menu-cores-val');
    if (el) el.innerText = Progression.cores;
}

window.startAdventure = () => {
    if (Progression.prog.heroes.length === 0) {
        window.showToast(t('err_no_hero_village'));
        window.showVillage();
        return;
    }
    const allLvl1 = Progression.prog.heroes.every(h => h.level === 1);
    if (Progression.prog.milestone > 1 && allLvl1) {
        window.showResultModal(t('milestone'), t('greedy_reset_msg'), () => {
            Progression.resetMilestone();
        });
        return;
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
        window.showResultModal(t('tavern_title'), t('free_hero_welcome'), () => {});
        const currentNames = Progression.prog.heroes.map(h => h.name);
        Progression.addHero(Hero.generateRandom(1, currentNames).toJSON());
    }
    updateVillageUI();
    showView('view-village');
    window.switchVillageTab('tavern');
};

window.currentVillageTab = 'tavern';
window.switchVillageTab = (tab) => {
    window.currentVillageTab = tab;
    const tabs = ['tavern', 'shop', 'upgrades', 'weapon-shop', 'armor-shop', 'gym', 'forge'];
    tabs.forEach(t => {
        const content = document.getElementById(`village-content-${t}`);
        if (content) content.style.display = (tab === t) ? 'block' : 'none';
        
        const btn = document.getElementById(`tab-${t}`);
        if (btn) btn.className = (tab === t) ? 'menu-btn primary' : 'menu-btn secondary';
    });
    if (tab === 'weapon-shop') updateWeaponShopUI();
    if (tab === 'armor-shop') updateArmorShopUI();
    if (tab === 'gym') updateGymUI();
    if (tab === 'forge') updateForgeUI();
};

function updateVillageResourcesUI() {
    document.getElementById('village-gold-val').innerText = Progression.prog.gold.toFixed(2).replace(/\.00$/, '');
    document.getElementById('village-cores-val').innerText = Progression.cores.toFixed(2).replace(/\.00$/, '');
}

function updateTavernUI() {
    const tavernList = document.getElementById('tavern-hero-list');
    if (!tavernList) return;
    tavernList.innerHTML = '';

    Progression.prog.heroes.forEach((h, i) => {
        const isActive = Progression.prog.activeHeroIndices.includes(i);
        const card = document.createElement('div');
        card.style = `background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; border: 1px solid ${isActive ? 'var(--primary)' : '#444'}; cursor: pointer; position: relative;`;
        card.onclick = () => window.showHeroDetails(i);
        card.innerHTML = `
            ${isActive ? '<div style="position:absolute; top:5px; right:5px; font-size:0.8rem; background:var(--primary); color:black; padding:2px 5px; border-radius:4px; font-weight:bold;">ACTIVE</div>' : ''}
            <div style="font-weight:bold;">${escapeHTML(h.name)}</div>
            <div style="font-size:0.8rem; color:#aaa;">Lvl ${h.level} ${t(h.origin)}</div>
            <div style="font-size:0.7rem; color:#aaa;">${t('stat_hp')}: ${h.baseMaxHp} ${t('stat_attack').toUpperCase()}: ${h.baseStrength} | SP: ${h.statPoints}</div>
        `;
        tavernList.appendChild(card);
    });

    if (Progression.prog.heroes.length < Progression.getMaxRosterSize()) {
        const recruitCard = document.createElement('div');
        const cost = 500;
        const displayCost = cost.toFixed(2).replace(/\.00$/, '');
        recruitCard.style = 'background: rgba(0,242,255,0.05); padding: 10px; border-radius: 8px; border: 1px dashed var(--primary); display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80px;';
        recruitCard.innerHTML = `
            <div style="font-weight:bold; color:var(--primary);">${t('recruit_new')}</div>
            <div style="margin: 5px 0;">💰 ${displayCost}</div>
            <button class="menu-btn primary" style="padding: 5px 15px; font-size:0.8rem;" onclick="window.recruitHero(${cost})">${t('btn_recruit')}</button>
        `;
        tavernList.appendChild(recruitCard);
    }
}

function updateShopUI() {
    const shopList = document.getElementById('shop-item-list');
    if (!shopList) return;
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
            <button class="menu-btn primary" style="padding: 8px 15px;" onclick="window.buyItem('${item.id}', ${item.cost})">💰 ${item.cost.toFixed(2).replace(/\.00$/, '')}</button>
        `;
        shopList.appendChild(itemRow);
    });
}

function updateUpgradesUI() {
    const upgradeList = document.getElementById('upgrades-list');
    if (!upgradeList) return;
    upgradeList.innerHTML = '';
    const buildings = [
        { id: 'rosterSizeLevel', title: t('roster_size_title') || 'Roster Size', max: 4 },
        { id: 'partySizeLevel', title: t('party_size_title') || 'Party Quality', max: 3 },
        { id: 'gymLevel', title: t('gym_title') || 'Hero Gym', max: 50 },
        { id: 'weaponShopLevel', title: t('weapon_shop_upgrade') || 'Weapon Shop', max: 5 },
        { id: 'armorShopLevel', title: t('armor_shop_upgrade') || 'Armor Shop', max: 5 },
        { id: 'forgeLevel', title: t('forge_title') || 'Mystic Forge', max: 1 },
        { id: 'debugLevel', title: t('debug_title') || 'DEBUG ME', max: 999 }
    ];

    buildings.forEach(b => {
        const level = Progression.prog.village[b.id] || 0;
        const cost = Progression.getBuildingCost(b.id);
        const upgradeRow = document.createElement('div');
        upgradeRow.style = 'background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;';
        
        const isMax = level >= b.max;
        let extra = '';
        if (b.id === 'gymLevel') extra = ` (${level}%)`;
        else if (b.id === 'rosterSizeLevel') extra = ` (${4 + level} max)`;
        else if (b.id === 'partySizeLevel') extra = ` (${1 + level} heroes)`;
        
        const label = extra;

        const displayCost = cost.toFixed(2).replace(/\.00$/, '');
        upgradeRow.innerHTML = `
            <div>
                <div style="font-weight:bold;">${b.title}</div>
                <div style="font-size:0.8rem; color:#aaa;">${t('level_label')}: ${level}${isMax ? ' [MAX]' : label}</div>
            </div>
            ${isMax ? '<span style="color:#888;">MAX</span>' : `<button class="menu-btn primary" style="padding: 8px 15px;" onclick="window.buyBuilding('${b.id}')">🔮 ${displayCost}</button>`}
        `;
        upgradeList.appendChild(upgradeRow);
    });
}

function updateVillageTabsVisibilityUI() {
    const wShopBtn = document.getElementById('tab-weapon-shop');
    if (wShopBtn) wShopBtn.style.display = (Progression.prog.village.weaponShopLevel > 0) ? 'block' : 'none';
    const aShopBtn = document.getElementById('tab-armor-shop');
    if (aShopBtn) aShopBtn.style.display = (Progression.prog.village.armorShopLevel > 0) ? 'block' : 'none';
    const forgeBtn = document.getElementById('tab-forge');
    if (forgeBtn) forgeBtn.style.display = (Progression.prog.village.forgeLevel > 0) ? 'block' : 'none';
}
function updateVillageUI() {
    updateVillageResourcesUI();
    updateTavernUI();
    updateShopUI();
    updateUpgradesUI();
    updateVillageTabsVisibilityUI();
    if (window.currentVillageTab === "weapon-shop") updateWeaponShopUI();
    if (window.currentVillageTab === "armor-shop") updateArmorShopUI();
    if (window.currentVillageTab === "gym") updateGymUI();
    if (window.currentVillageTab === "forge") updateForgeUI();
}


function updateWeaponShopUI() {
    const container = document.getElementById('weapon-shop-item-list');
    container.innerHTML = '';
    const shopLvl = Progression.prog.village.weaponShopLevel;

    Object.keys(WEAPON_FAMILIES).forEach(familyId => {
        Object.keys(MATERIAL_TIERS).forEach(tierId => {
            const tier = MATERIAL_TIERS[tierId];
            if (tier.levelReq <= shopLvl) {
                const cost = 100 * tier.mult;
                const displayCost = cost.toFixed(2).replace(/\.00$/, '');
                const row = document.createElement('div');
                row.style = 'background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom:10px; border-left: 4px solid var(--primary);';
                row.innerHTML = `
                    <div style="flex: 1;">
                        <div style="font-weight:bold; color: white; font-size: 1.1rem;">${formatEquipmentName({type: 'weapon', material: tierId, family: familyId})}</div>
                        <div style="font-size:0.8rem; color:var(--primary); margin-bottom: 5px;">Tier ${tier.levelReq}</div>
                        <div style="font-size:0.85rem; color:#ccc; line-height: 1.4;">${t(familyId + '_desc')}</div>
                    </div>
                    <button class="menu-btn primary" style="padding: 12px 20px; min-width: 100px;" onclick="window.buyEquipment('${familyId}', '${tierId}', 'weapon', ${cost})">💰 ${displayCost}</button>
                `;
                container.appendChild(row);
            }
        });
    });
}

function updateArmorShopUI() {
    const container = document.getElementById('armor-shop-item-list');
    container.innerHTML = '';
    const shopLvl = Progression.prog.village.armorShopLevel;

    Object.keys(ARMOR_ARCHETYPES).forEach(archId => {
        Object.keys(MATERIAL_TIERS).forEach(tierId => {
            const tier = MATERIAL_TIERS[tierId];
            if (tier.levelReq <= shopLvl) {
                const slots = ['head', 'body', 'legs'];
                slots.forEach(slot => {
                    const cost = 80 * tier.mult;
                    const displayCost = cost.toFixed(2).replace(/\.00$/, '');
                    const row = document.createElement('div');
                    row.style = 'background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom:10px; border-left: 4px solid #0fa;';
                    row.innerHTML = `
                        <div style="flex: 1;">
                            <div style="font-weight:bold; color: white; font-size: 1.1rem;">${formatEquipmentName({type: 'armor', material: tierId, archetype: archId, slot: slot})}</div>
                            <div style="font-size:0.8rem; color:#0fa; margin-bottom: 5px;">Tier ${tier.levelReq}</div>
                            <div style="font-size:0.85rem; color:#ccc; line-height: 1.4;">${t(archId + '_desc')}</div>
                        </div>
                        <button class="menu-btn primary" style="padding: 12px 20px; min-width: 100px;" onclick="window.buyEquipment('${archId}', '${tierId}', 'armor', ${cost}, '${slot}')">💰 ${displayCost}</button>
                    `;
                    container.appendChild(row);
                });
            }
        });
    });
}

function updateGymUI() {
    const container = document.getElementById('gym-hero-list');
    container.innerHTML = '';

    Progression.prog.heroes.forEach((h, i) => {
        const isActive = Progression.prog.activeHeroIndices.includes(i);
        const session = Progression.prog.trainingSessions[i];

        const card = document.createElement('div');
        card.style = 'background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 10px;';

        let actionHTML = '';
        if (isActive) {
            actionHTML = `<span style="color: #666; font-style: italic;">In Active Party</span>`;
        } else if (session) {
            const regime = TRAINING_REGIMES[session.regimeId] || QUESTS[session.regimeId];
            const elapsed = Date.now() - session.startTime;
            const remaining = regime.duration - elapsed;

            if (remaining <= 0) {
                actionHTML = `
                    <div style="color: var(--primary); font-weight: bold; margin-bottom: 10px;">${t("training_complete")}</div>
                    <button class="menu-btn primary" onclick="window.claimTraining(${i})">${t("btn_claim")}</button>
                `;
            } else {
                const remMin = Math.ceil(remaining / 60000);
                actionHTML = `
                    <div style="color: #aaa; margin-bottom: 10px;">${t("status_label")}: ${t(session.regimeId)} (${remMin}m ${t("left_label")})</div>
                    <button class="menu-btn secondary" onclick="window.cancelTraining(${i})">${t("btn_cancel")}</button>
                `;
            }
        } else {
            actionHTML = `
                <div style="font-weight:bold; color:var(--primary); margin-bottom:5px;">Training:</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom:15px;">
                    ${Object.keys(TRAINING_REGIMES).map(rId => `
                        <button class="menu-btn primary" style="font-size: 0.7rem; padding: 5px;" onclick="window.startTraining(${i}, '${rId}')">
                            ${t(rId)}<br>(${TRAINING_REGIMES[rId].duration / 3600000}h)
                        </button>
                    `).join('')}
                </div>
                <div style="font-weight:bold; color:var(--primary); margin-bottom:5px;">Quests:</div>
                <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                    ${Object.keys(QUESTS).map(qId => {
                        const q = QUESTS[qId];
                        const heroObj = new Hero(h);
                        const canDo = heroObj[q.req.type] >= q.req.value;
                        return `
                            <button class="menu-btn ${canDo ? 'primary' : 'secondary'}" style="font-size: 0.7rem; padding: 10px; display:flex; justify-content:space-between; align-items:center;" ${canDo ? '' : 'disabled'} onclick="window.startTraining(${i}, '${qId}')">
                                <div style="text-align:left;">
                                    <div style="font-weight:bold;">${t(qId)}</div>
                                    <div style="font-size:0.6rem; color:#aaa;">Req: ${q.req.label} ${q.req.value}+</div>
                                </div>
                                <div style="text-align:right;">
                                    <div>${q.duration / 3600000}h</div>
                                    <div style="font-size:0.6rem; color:var(--primary);">${q.reward.label}</div>
                                </div>
                            </button>
                        `;
                    }).join('')}
                </div>
            `;
        }

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="font-weight: bold;">${escapeHTML(h.name)} (Lvl ${h.level})</div>
            </div>
            ${actionHTML}
        `;
        container.appendChild(card);
    });
}

function updateForgeUI() {
    const container = document.getElementById('forge-inventory-list');
    container.innerHTML = '';

    const createForgeRow = (item, sourceData) => {
        const cost = 50;
        const displayCost = cost.toFixed(2).replace(/\.00$/, '');
        const canAwaken = (item.level >= 10 || item.material === 'gold' || item.material === 'mythril');
        const row = document.createElement('div');
        row.style = 'background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom:10px;';
        
        const affixLabel = t('label_affixes');
        const noAffixLabel = t('label_no_affixes');
        let subText = item.affixes ? affixLabel + ': ' + item.affixes.join(', ') : noAffixLabel;
        if (sourceData.heroName) subText = `[${sourceData.heroName}] ${subText}`;

        const upgradeCost = Math.round(100 * Math.pow(1.5, item.level || 0));
        const canUpgrade = Progression.prog.gold >= upgradeCost;
        const btnText = canAwaken ? `🔮 ${displayCost}` : `🔮 ${displayCost} (${t('label_lvl_req').replace('{lvl}', '10')})`;

        row.innerHTML = `
            <div style="flex: 1;">
                <div style="font-weight:bold; color: white;">${formatEquipmentName(item)} ${item.level > 0 ? '(Lvl '+item.level+')' : ''}</div>
                <div style="font-size:0.8rem; color:#aaa;">${subText}</div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="menu-btn ${canUpgrade ? 'primary' : 'secondary'}" style="padding: 8px 12px; font-size: 0.75rem;" ${canUpgrade ? '' : 'disabled'} onclick='window.levelUpItem(${JSON.stringify(sourceData)}, ${upgradeCost})'>⬆️ ${upgradeCost}G</button>
                <button class="menu-btn ${canAwaken ? 'primary' : 'secondary'}" style="padding: 8px 12px; font-size: 0.75rem;" ${canAwaken ? '' : 'disabled'} onclick='window.awakenItem(${JSON.stringify(sourceData)}, ${cost})'>${btnText}</button>
            </div>
        `;
        container.appendChild(row);
    };

    // Inventory items
    Progression.prog.equipmentInventory.forEach((item, i) => {
        createForgeRow(item, { type: 'inventory', index: i });
    });

    // Equipped items
    Progression.prog.heroes.forEach((hero, hIdx) => {
        Object.entries(hero.equipment).forEach(([slot, item]) => {
            if (item) {
                createForgeRow(item, { type: 'equipped', heroIndex: hIdx, slot: slot, heroName: hero.name });
            }
        });
    });
}

window.awakenItem = (source, cost) => {
    if (Progression.cores >= cost) {
        if (confirm(t("confirm_awaken").replace("{cost}", cost))) {
            let item;
            if (source.type === 'inventory') {
                item = Progression.prog.equipmentInventory[source.index];
            } else {
                item = Progression.prog.heroes[source.heroIndex].equipment[source.slot];
            }

            if (!item) return;

            Progression.spendCores(cost);
            if (!item.affixes) item.affixes = [];
            const affix = AFFIXES[Math.floor(Math.random() * AFFIXES.length)];
            item.affixes.push(affix);

            if (source.type === 'equipped') {
                // If equipped, we need to make sure the stats recalculate for that hero
                const heroData = Progression.prog.heroes[source.heroIndex];
                const heroObj = new Hero(heroData);
                heroObj.recalculateStats();
                Progression.prog.heroes[source.heroIndex] = heroObj.toJSON();
            }

            Progression.saveState();
            window.showToast(t("awakened_msg").replace("{name}", formatEquipmentName(item)));
            updateForgeUI();
            updateVillageUI();
        }
    } else {
        window.showToast(t('not_enough_cores'));
    }
};

window.levelUpItem = (source, cost) => {
    if (Progression.prog.gold >= cost) {
        let item;
        if (source.type === 'inventory') {
            item = Progression.prog.equipmentInventory[source.index];
        } else {
            item = Progression.prog.heroes[source.heroIndex].equipment[source.slot];
        }

        if (!item) return;

        Progression.spendGold(cost);
        item.level = (item.level || 0) + 1;

        if (source.type === 'equipped') {
            const heroData = Progression.prog.heroes[source.heroIndex];
            const heroObj = new Hero(heroData);
            heroObj.recalculateStats();
            // Apply back to state
            Progression.prog.heroes[source.heroIndex] = heroObj.toJSON();
        }

        Progression.saveState();
        window.showToast(t('learned')); // "Aprendido" or "Completo" for level up feedback
        updateForgeUI();
        updateVillageUI();
    } else {
        window.showToast(t('not_enough_gold'));
    }
};

window.startTraining = (heroIndex, regimeId) => {
    if (Progression.startTraining(heroIndex, regimeId)) {
        updateGymUI();
    }
};

window.cancelTraining = (heroIndex) => {
    if (confirm("Cancel session? No rewards will be given.")) {
        Progression.cancelTraining(heroIndex);
        updateGymUI();
    }
};

window.claimTraining = (heroIndex) => {
    const session = Progression.prog.trainingSessions[heroIndex];
    if (!session) return;
    const regime = TRAINING_REGIMES[session.regimeId] || QUESTS[session.regimeId];

    let success = true;
    if (QUESTS[session.regimeId]) {
        const heroData = Progression.prog.heroes[heroIndex];
        const heroObj = new Hero(heroData);
        const req = QUESTS[session.regimeId].req;
        const diff = heroObj[req.type] - req.value;
        const successChance = 0.7 + (diff * 0.05);
        success = Math.random() < Math.min(0.95, successChance);
    }

    const rewards = Progression.completeTraining(heroIndex, regime);

    if (rewards) {
        if (!success) {
            rewards.exp = Math.floor(rewards.exp * 0.5);
            rewards.gold = Math.floor(rewards.gold * 0.5);
            rewards.cores = 0;
            rewards.item = null;
        }

        const heroData = Progression.prog.heroes[heroIndex];
        const heroObj = new Hero(heroData);
        const leveled = heroObj.gainExp(rewards.exp);
        Progression.prog.heroes[heroIndex] = heroObj.toJSON();

        if (rewards.gold) Progression.addGold(rewards.gold);
        if (rewards.cores) Progression.addCores(rewards.cores);
        if (rewards.item) Progression.addItem(rewards.item);

        let msg = (success ? "" : "QUEST PARTIALLY FAILED (50% rewards)\n") + `Rewards for ${escapeHTML(heroObj.name)}:\n✨ +${rewards.exp} EXP`;
        if (rewards.gold) msg += `\n💰 +${rewards.gold} Gold`;
        if (rewards.cores) msg += `\n🔮 +${rewards.cores} Core`;
        if (rewards.item) msg += `\n🎒 +1 ${t(rewards.item)}`;
        if (leveled) msg += `\n🌟 LEVEL UP! Now Level ${heroObj.level}`;

        alert(msg);
        updateGymUI();
        updateVillageUI();
    }
};

window.buyEquipment = (id, tier, type, cost, slot = null) => {
    if (Progression.prog.gold >= cost) {
        Progression.spendGold(cost);
        const item = { type, material: tier, level: 0 };
        if (type === 'weapon') item.family = id;
        else {
            item.archetype = id;
            item.slot = slot;
        }
        Progression.addEquipment(item);
        window.showToast(t('learned') + "!");
        updateVillageUI();
    } else {
        window.showToast(t('not_enough_gold'));
    }
};

window.recruitHero = (cost) => {
    if (Progression.prog.gold >= cost) {
        const currentNames = Progression.prog.heroes.map(h => h.name);
        if (Progression.addHero(Hero.generateRandom(1, currentNames).toJSON())) {
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

    document.getElementById('hero-details-name').innerHTML = `
        ${escapeHTML(heroData.name)} (${heroData.level})
        <span onclick="window.showTraitInfo('${heroData.origin}')" style="cursor:pointer; font-size:1.2rem; margin-left:10px; display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; border:1px solid var(--primary); border-radius:50%; color:var(--primary);">?</span>
    `;
    document.getElementById('hero-details-sp').innerText = heroData.statPoints;
    
    const nextLevelExp = heroData.level * 20;
    const expPercent = Math.min(100, (heroData.exp / nextLevelExp) * 100);
    document.getElementById('hero-details-exp-text').innerText = `${heroData.exp} / ${nextLevelExp} EXP`;
    document.getElementById('hero-details-exp-bar').style.width = expPercent + '%';

    document.getElementById('label-sp').innerText = t('stat_points') + ':';

    const statsContainer = document.getElementById('hero-stats-container');
    statsContainer.innerHTML = '';
    
    const heroObj = new Hero(heroData);
    const stats = [
        { id: 'baseMaxHp', label: t('stat_hp'), val: heroObj.maxHp },
        { id: 'baseMaxMp', label: t('stat_mp'), val: heroObj.maxMp },
        { id: 'baseStrength', label: t('stat_attack'), val: heroObj.strength },
        { id: 'baseSpeed', label: t('stat_speed'), val: heroObj.speed },
        { id: 'baseDefense', label: t('stat_defense'), val: heroObj.defense },
        { id: 'baseMagicPower', label: t('stat_magic'), val: heroObj.magicPower }
    ];

    stats.forEach(st => {
        const row = document.createElement('div');
        row.style = 'display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 5px;';
        const canUpgrade = heroData.statPoints > 0;
        
        const bonus = st.val - (heroData[st.id] || 0);
        const bonusText = bonus > 0 ? ` <span style="font-size:0.85rem; color:var(--primary); font-style:italic;">(+${bonus.toFixed(0)})</span>` : '';

        row.innerHTML = `
            <div><span style="font-weight:bold; color: #aaa;">${st.label}:</span> <span style="font-size:1.1rem; color:white;">${st.val}${bonusText}</span></div>
            <button class="menu-btn ${canUpgrade ? 'primary' : 'secondary'}" style="padding: 5px 15px; width: 40px;" ${canUpgrade ? '' : 'disabled'} onclick="window.increaseStat(${index}, '${st.id}')">+</button>
        `;
        statsContainer.appendChild(row);
    });

    const actionContainer = document.createElement('div');
    actionContainer.style = 'margin-top: 20px; display: flex; flex-direction: column; gap: 10px;';
    
    const isActive = Progression.prog.activeHeroIndices.includes(index);
    const isTraining = !!Progression.prog.trainingSessions[index];
    const numActive = Progression.prog.activeHeroIndices.length;
    const maxSize = Progression.getMaxPartySize();
    
    const canUnselect = numActive > 1;
    const canSelect = !isTraining && (numActive < maxSize || (maxSize === 1 && numActive === 1));

    let toggleBtn = '';
    if (isActive) {
        toggleBtn = `<button class="menu-btn ${canUnselect ? 'secondary' : 'secondary'}" style="width: 100%; opacity: ${canUnselect ? 1 : 0.5};" ${canUnselect ? `onclick="window.toggleHeroActive(${index})"` : ''}>❌ ${t('btn_unselect_party') || 'Unselect from Party'}</button>`;
    } else {
        const busyLabel = isTraining ? ' (Busy)' : '';
        toggleBtn = `<button class="menu-btn ${canSelect ? 'primary' : 'secondary'}" style="width: 100%; opacity: ${canSelect ? 1 : 0.5};" ${canSelect ? `onclick="window.toggleHeroActive(${index})"` : ''}>⚔️ ${t('btn_select_party') || 'Add to Party'}${busyLabel}</button>`;
    }

    let fireBtn = '';
    const totalHeroes = Progression.prog.heroes.length;

    if (totalHeroes === 1) {
        fireBtn = `<button class="menu-btn primary" 
                    style="padding: 10px 20px; font-size: 0.9rem; border-color: var(--primary);" 
                    onclick="window.switchHero(${index})">
                ${t('btn_switch_hero')}
            </button>`;
    } else {
        const canFire = !isActive && !isTraining;
        fireBtn = `<button class="menu-btn secondary" 
                    style="padding: 10px 20px; font-size: 0.9rem; border-color: #f55; color: #f55; ${!canFire ? 'opacity: 0.3; cursor: default;' : ''}"
                    ${canFire ? `onclick="window.fireHero(${index})"` : ''}>
                🗑️ ${t('btn_fire_hero')}
            </button>`;
    }

    actionContainer.innerHTML = toggleBtn + fireBtn;
    statsContainer.appendChild(actionContainer);

    document.getElementById('btn-hero-skills').onclick = () => window.showHeroSkills(index);
    document.getElementById('btn-hero-equip').onclick = () => window.showHeroEquip(index);

    showView('view-hero-details');
};

window.showTraitInfo = (origin) => {
    const modal = document.createElement('div');
    modal.id = 'trait-info-modal';
    modal.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center;
        z-index: 1000; padding: 20px; box-sizing: border-box;
    `;
    modal.onclick = () => modal.remove();

    const content = document.createElement('div');
    content.style = `
        background: #111; border: 2px solid var(--primary); border-radius: 12px;
        padding: 20px; max-width: 400px; width: 100%; text-align: center;
    `;
    content.onclick = (e) => e.stopPropagation();

    content.innerHTML = `
        <h2 style="color: var(--primary); margin-top: 0;">${t(origin)}</h2>
        <p style="color: white; line-height: 1.6; font-size: 1.1rem; margin: 20px 0;">${t(origin + '_desc')}</p>
        <button class="menu-btn primary" style="padding: 10px 30px;" onclick="document.getElementById('trait-info-modal').remove()">OK</button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);
};

window.showHeroEquip = (index) => {
    window.currentHeroIndex = index;
    const heroData = Progression.prog.heroes[index];
    if (!heroData) return;

    document.getElementById('hero-equip-name').innerText = heroData.name;
    
    const container = document.getElementById('hero-equip-container');
    container.innerHTML = '';

    const slots = [
        { id: 'head', name: t('slot_head') || 'Head' },
        { id: 'body', name: t('slot_body') || 'Body' },
        { id: 'legs', name: t('slot_legs') || 'Legs' },
        { id: 'leftHand', name: t('slot_leftHand') || 'Left Hand' },
        { id: 'rightHand', name: t('slot_rightHand') || 'Right Hand' },
        { id: 'accessory', name: t('slot_accessory') || 'Accessory' }
    ];

    slots.forEach(slot => {
        const item = heroData.equipment ? heroData.equipment[slot.id] : null;
        const row = document.createElement('div');
        row.style = `background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; cursor: pointer;`;
        row.onclick = () => window.manageSlot(index, slot.id);
        
        row.innerHTML = `
            <div style="display: flex; flex-direction: column;">
                <div style="font-weight: bold; color: #aaa; font-size: 0.8rem;">${slot.name}</div>
                <div style="color: white; font-size: 1.1rem;">${item ? formatEquipmentName(item) : '---'}</div>
            </div>
            <div style="color: #666; font-size: 0.8rem; font-style: italic;">${t('tap_to_manage')}</div>
        `;
        
        container.appendChild(row);
    });

    showView('view-hero-equip');
};

window.manageSlot = (heroIndex, slotId) => {
    const modal = document.createElement('div');
    modal.id = 'manage-slot-modal';
    modal.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center;
        z-index: 1001; padding: 20px; box-sizing: border-box;
    `;
    modal.onclick = () => modal.remove();

    const content = document.createElement('div');
    content.style = `
        background: #111; border: 2px solid var(--primary); border-radius: 12px;
        padding: 20px; max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto;
    `;
    content.onclick = (e) => e.stopPropagation();

    let itemsHTML = '';
    const isWeaponSlot = slotId === 'leftHand' || slotId === 'rightHand';
    const isArmorSlot = ['head', 'body', 'legs'].includes(slotId);

    Progression.prog.equipmentInventory.forEach((item, idx) => {
        let canEquip = false;
        if (isWeaponSlot && item.type === 'weapon') canEquip = true;
        if (isArmorSlot && item.type === 'armor' && item.slot === slotId) canEquip = true;

        if (canEquip) {
            itemsHTML += `
                <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <div>${formatEquipmentName(item)} (Lvl ${item.level || 0})</div>
                    <button class="menu-btn primary" style="padding: 5px 15px;" onclick="window.doEquip(${heroIndex}, '${slotId}', ${idx})">${t("btn_equip")}</button>
                </div>
            `;
        }
    });

    const hero = Progression.prog.heroes[heroIndex];
    const currentItem = hero.equipment[slotId];

    content.innerHTML = `
        <h3 style="color: var(--primary); margin-top: 0;">${t('manage_slot')} ${t('slot_' + slotId)}</h3>
        ${currentItem ? `
            <div style="background: rgba(0,242,255,0.1); padding: 10px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <div>${t("equipped_label")}: ${currentItem.name}</div>
                <button class="menu-btn secondary" style="padding: 5px 15px;" onclick="window.doUnequip(${heroIndex}, '${slotId}')">${t("btn_unequip")}</button>
            </div>
        ` : ''}
        <div style="font-weight: bold; margin-bottom: 10px; color: #888;">${t("available_label")}:</div>
        ${itemsHTML || '<div style="color: #666; font-style: italic;">No items available for this slot.</div>'}
        <button class="menu-btn secondary" style="width: 100%; margin-top: 20px;" onclick="document.getElementById('manage-slot-modal').remove()">${t("btn_cancel")}</button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);
};

window.doEquip = (heroIndex, slot, itemIdx) => {
    Progression.equipItem(heroIndex, slot, itemIdx);
    document.getElementById('manage-slot-modal').remove();
    window.showHeroEquip(heroIndex);
};

window.doUnequip = (heroIndex, slot) => {
    Progression.unequipItem(heroIndex, slot);
    document.getElementById('manage-slot-modal').remove();
    window.showHeroEquip(heroIndex);
};

window.toggleHeroActive = (index) => {
    const isActive = Progression.prog.activeHeroIndices.includes(index);
    const numActive = Progression.prog.activeHeroIndices.length;
    const maxSize = Progression.getMaxPartySize();

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
            const isBusy = !!Progression.prog.trainingSessions[index];
            alert(isBusy ? "Hero is busy training!" : (t('party_limit_reached') || "Party size limit reached!"));
        }
    }
};

window.fireHero = (index) => {
    const heroData = Progression.prog.heroes[index];
    if (!heroData) return;

    if (Progression.prog.heroes.length <= 1) {
        window.showToast(t('fire_limit_msg'));
        return;
    }

    if (confirm(t('confirm_fire').replace('{hero}', heroData.name))) {
        if (Progression.removeHero(index)) {
            window.showVillage();
        }
    }
};

window.switchHero = (index) => {
    const heroData = Progression.prog.heroes[index];
    if (!heroData) return;

    if (confirm(t('confirm_switch_unique'))) {
        const currentNames = []; 
        const newHero = Hero.generateRandom(1, currentNames);
        Progression.prog.heroes = [];
        Progression.prog.activeHeroIndices = [];
        Progression.addHero(newHero.toJSON());
        window.showVillage();
        alert(t('learned') + "!");
    }
};

window.increaseStat = (index, statId) => {
    const heroData = Progression.prog.heroes[index];
    if (heroData && heroData.statPoints > 0) {
        heroData.statPoints--;
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
    if (type === 'debugLevel') {
        if (confirm(t('debug_confirm'))) {
            Progression.addCores(100000);
            Progression.addGold(100000);
            Progression.prog.heroes.forEach((h, idx) => {
                const heroObj = new Hero(h);
                heroObj.gainExp(100000);
                Progression.prog.heroes[idx] = heroObj.toJSON();
            });
            Progression.saveState();
            updateVillageUI();
            updateCoresUI();
            window.showToast(t('debug_applied'));
        }
        return;
    }
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
    Progression.setAutoBattle(checked);

    // Use the game instance if it exists (set in RPGGame constructor)
    if (window.game) {
        window.game.autoBattle = checked;
        if (checked && window.game.currentCombat && !window.game.currentCombat.isCombatOver) {
            const participant = window.game.currentCombat.turnOrder[window.game.currentCombat.currentTurnIndex];
            if (participant && window.game.heroes.includes(participant)) {
                window.game.currentCombat.heroAutoTurn(participant);
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
                window.showToast(t('err_invalid_save'));
            }
        } catch (err) {
            window.showToast(t('err_parse_file'));
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
window.showTraitInfo = showTraitInfo;
window.manageSlot = manageSlot;
window.doEquip = doEquip;
window.doUnequip = doUnequip;
window.buyEquipment = buyEquipment;
window.updateWeaponShopUI = updateWeaponShopUI;
window.updateArmorShopUI = updateArmorShopUI;
window.updateGymUI = updateGymUI;
window.updateForgeUI = updateForgeUI;
window.awakenItem = awakenItem;
window.startTraining = startTraining;
window.cancelTraining = cancelTraining;
window.claimTraining = claimTraining;

window.showToast = function(msg, duration = 3000) {
    const toast = document.createElement('div');
    toast.style = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: rgba(0,0,0,0.85); color: white; padding: 10px 20px;
        border: 1px solid var(--primary); border-radius: 5px; z-index: 9999;
        font-size: 0.9rem; pointer-events: none; transition: opacity 0.3s;
    `;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, duration);
};

window.showResultModal = function(title, msg, onConfirm) {
    const overlay = document.createElement('div');
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center;
        z-index: 3000; padding: 20px; box-sizing: border-box;
    `;
    const content = document.createElement('div');
    content.style = `
        background: #111; border: 2px solid var(--primary); border-radius: 12px;
        padding: 30px; max-width: 500px; width: 100%; text-align: center;
    `;
    content.innerHTML = `
        <h2 style="color: var(--primary); margin-top: 0;">${title}</h2>
        <p style="color: white; font-size: 1.1rem; line-height: 1.6; margin: 20px 0;">${msg}</p>
        <button class="menu-btn primary" style="padding: 15px; width: 100%;">${t('btn_continue')}</button>
    `;
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    content.querySelector('button').onclick = () => {
        overlay.remove();
        if (onConfirm) onConfirm();
    };
};

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}
