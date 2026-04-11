export const FAST_ENEMY = {
    stats: { 
        hp: 3,
        speed: 4, 
        damage: 1,
        reward: 5
    },
    presentation: { 
        color: '#ffea00', 
        radiusMult: 0.2 
    }
};

export const STRONG_ENEMY = {
    stats: { 
        hp: 15,
        speed: 0.8, 
        damage: 5,
        reward: 10
    },
    presentation: { 
        color: '#ff0000', 
        radiusMult: 0.45 
    }
};

export const ADAPTIVE_ENEMY = {
    stats: { 
        hp: 8,
        speed: 1.5, 
        damage: 2,
        reward: 7,
        burstDuration: 1000,
        burstSpeedMult: 1.5
    },
    presentation: { 
        color: '#ff8800', 
        radiusMult: 0.35 
    }
};
