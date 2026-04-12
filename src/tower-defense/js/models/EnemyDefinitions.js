export const FAST_ENEMY = {
    stats: { 
        hp: 3,
        speed: 4.5, 
        damage: 1,
        reward: 6,
        coreReward: 1
    },
    presentation: { 
        color: '#ffea00', 
        radiusMult: 0.2 
    }
};

export const STRONG_ENEMY = {
    stats: { 
        hp: 40,
        speed: 0.7, 
        damage: 5,
        reward: 40,
        coreReward: 5
    },
    presentation: { 
        color: '#ff0000', 
        radiusMult: 0.45 
    }
};

export const ADAPTIVE_ENEMY = {
    stats: { 
        hp: 12,
        speed: 1.8, 
        damage: 2,
        reward: 12,
        coreReward: 3,
        burstDuration: 1000,
        burstSpeedMult: 1.5
    },
    presentation: { 
        color: '#ff8800', 
        radiusMult: 0.35 
    }
};
export const HEALER_ENEMY = {
    stats: { 
        hp: 20,
        speed: 1.2, 
        damage: 2,
        reward: 20,
        coreReward: 4,
        healRange: 150,    // pixel range
        healAmount: 5,     // hp restored per tick
        healCooldownMs: 2000 // how often it heals
    },
    presentation: { 
        color: '#00ff88', 
        radiusMult: 0.35 
    }
};
