import { t } from '../i18n.js';

export const BASIC_BLASTER = {
    id: 'BASIC_BLASTER',
    get name() { return t('tower_basic_blaster'); },
    get description() { return t('tower_basic_desc'); },
    cost: 30,
    stats: { 
        damage: 1, 
        range: 3, // In grid cells
        cooldownMs: 800 
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
    cost: 60,
    stats: { 
        damage: 3, 
        range: 4, 
        cooldownMs: 2000 
    },
    presentation: { 
        color: '#7000ff', 
        radiusMult: 0.45 
    }
};

export const TOWER_TYPES = [BASIC_BLASTER, HEAVY_CANNON];
