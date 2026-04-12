import { t } from '../i18n.js';

export const BASIC_BLASTER = {
    id: 'BASIC_BLASTER',
    get name() { return t('tower_basic_blaster'); },
    get description() { return t('tower_basic_desc'); },
    cost: 25,
    stats: { 
        damage: 1, 
        range: 3, // In grid cells
        cooldownMs: 600 
    },
    presentation: { 
        color: '#00f2ff', 
        radiusMult: 0.35 
    }
};

export const HEAVY_CANNON = {
    id: 'HEAVY_CANNON',
    get name() { return t('tower_heavy_cannon'); },
    get description() { return t('tower_heavy_desc'); },
    cost: 70,
    stats: { 
        damage: 8, 
        range: 5, 
        cooldownMs: 2500 
    },
    presentation: { 
        color: '#7000ff', 
        radiusMult: 0.45 
    }
};

export const PLASMA_NOVA = {
    id: 'PLASMA_NOVA',
    get name() { return t('tower_plasma_nova') || 'PLASMA NOVA'; },
    get description() { return t('tower_plasma_desc') || 'Hits all enemies in range'; },
    cost: 120, // In-game cost
    stats: { 
        damage: 1, 
        range: 4, 
        cooldownMs: 1500,
        aoe: true
    },
    presentation: { 
        color: '#ff00ff', 
        radiusMult: 0.4 
    }
};

export const TOWER_TYPES = [BASIC_BLASTER, HEAVY_CANNON, PLASMA_NOVA];
