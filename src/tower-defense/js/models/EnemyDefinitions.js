export const FAST_ENEMY = {
    stats: { 
        hp: 3,
        speed: 4.5, 
        damage: 1,
        reward: 6
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
        reward: 40
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
        burstDuration: 1000,
        burstSpeedMult: 1.5
    },
    presentation: { 
        color: '#ff8800', 
        radiusMult: 0.35 
    }
};
