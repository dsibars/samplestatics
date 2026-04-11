import { FAST_ENEMY, STRONG_ENEMY, ADAPTIVE_ENEMY } from './EnemyDefinitions.js';

export const STAGES = {
    1: {
        scenarioId: 'SCENARIO_1_STRAIGHT',
        startingMoney: 75,
        waves: {
            1: [ { type: FAST_ENEMY, amount: 8, delayMs: 1200, pathIndex: 0 } ],
            2: [ { type: FAST_ENEMY, amount: 15, delayMs: 800, pathIndex: 0 } ]
        }
    },
    2: {
        scenarioId: 'SCENARIO_2_CURVE',
        startingMoney: 80,
        waves: {
            1: [ { type: FAST_ENEMY, amount: 10, delayMs: 1000, pathIndex: 0 } ],
            2: [ { type: ADAPTIVE_ENEMY, amount: 5, delayMs: 1500, pathIndex: 0 } ],
            3: [ 
                { type: FAST_ENEMY, amount: 10, delayMs: 800, pathIndex: 0 },
                { type: STRONG_ENEMY, amount: 1, delayMs: 5000, pathIndex: 0 } // Introduces the tank
            ]
        }
    },
    3: {
        scenarioId: 'SCENARIO_3_MULTI',
        startingMoney: 120,
        waves: {
            1: [ { type: ADAPTIVE_ENEMY, amount: 10, delayMs: 1200, pathIndex: 0 } ],
            2: [ { type: STRONG_ENEMY, amount: 3, delayMs: 3000, pathIndex: 0 } ],
            3: [ 
                { type: FAST_ENEMY, amount: 20, delayMs: 500, pathIndex: 0 },
                { type: ADAPTIVE_ENEMY, amount: 10, delayMs: 1000, pathIndex: 0 }
            ]
        }
    },
    4: {
        scenarioId: 'SCENARIO_1_STRAIGHT',
        startingMoney: 150,
        waves: {
            1: [ { type: STRONG_ENEMY, amount: 5, delayMs: 2500, pathIndex: 0 } ],
            2: [ { type: ADAPTIVE_ENEMY, amount: 15, delayMs: 800, pathIndex: 0 } ],
            3: [ 
                { type: STRONG_ENEMY, amount: 3, delayMs: 3000, pathIndex: 0 },
                { type: FAST_ENEMY, amount: 30, delayMs: 300, pathIndex: 0 }
            ]
        }
    },
    5: {
        scenarioId: 'SCENARIO_2_CURVE',
        startingMoney: 200,
        waves: {
            1: [ { type: ADAPTIVE_ENEMY, amount: 20, delayMs: 1000, pathIndex: 0 } ],
            2: [ { type: STRONG_ENEMY, amount: 10, delayMs: 2000, pathIndex: 0 } ],
            3: [ 
                { type: FAST_ENEMY, amount: 50, delayMs: 200, pathIndex: 0 },
                { type: STRONG_ENEMY, amount: 5, delayMs: 1000, pathIndex: 0 }
            ]
        }
    },
    6: {
        scenarioId: 'SCENARIO_3_MULTI',
        startingMoney: 300,
        waves: {
            1: [ { type: STRONG_ENEMY, amount: 15, delayMs: 1500, pathIndex: 0 } ],
            2: [ 
                { type: ADAPTIVE_ENEMY, amount: 30, delayMs: 700, pathIndex: 0 },
                { type: STRONG_ENEMY, amount: 5, delayMs: 1000, pathIndex: 0 }
            ],
            3: [ 
                { type: FAST_ENEMY, amount: 100, delayMs: 100, pathIndex: 0 },
                { type: STRONG_ENEMY, amount: 10, delayMs: 500, pathIndex: 0 }
            ]
        }
    }
};
