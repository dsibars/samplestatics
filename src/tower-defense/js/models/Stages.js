import { FAST_ENEMY, STRONG_ENEMY, ADAPTIVE_ENEMY } from './EnemyDefinitions.js';

export const STAGES = {
    1: {
        scenarioId: 'SCENARIO_1_STRAIGHT',
        startingMoney: 60,
        waves: {
            1: [ { type: FAST_ENEMY, amount: 5, delayMs: 1500, pathIndex: 0 } ],
            2: [ { type: FAST_ENEMY, amount: 10, delayMs: 1200, pathIndex: 0 } ]
        }
    },
    2: {
        scenarioId: 'SCENARIO_2_CURVE',
        startingMoney: 80,
        waves: {
            1: [ { type: FAST_ENEMY, amount: 8, delayMs: 1200, pathIndex: 0 } ],
            2: [ { type: STRONG_ENEMY, amount: 3, delayMs: 2500, pathIndex: 0 } ],
            3: [ { type: FAST_ENEMY, amount: 15, delayMs: 800, pathIndex: 0 } ]
        }
    },
    3: {
        scenarioId: 'SCENARIO_3_MULTI',
        startingMoney: 100,
        waves: {
            1: [ { type: FAST_ENEMY, amount: 10, delayMs: 1000, pathIndex: 0 } ],
            2: [ { type: STRONG_ENEMY, amount: 5, delayMs: 2000, pathIndex: 0 } ],
            3: [ 
                { type: FAST_ENEMY, amount: 10, delayMs: 1000, pathIndex: 0 },
                { type: STRONG_ENEMY, amount: 4, delayMs: 1500, pathIndex: 0 }
            ]
        }
    },
    4: {
        scenarioId: 'SCENARIO_1_STRAIGHT',
        startingMoney: 120,
        waves: {
            1: [ { type: ADAPTIVE_ENEMY, amount: 5, delayMs: 1500, pathIndex: 0 } ],
            2: [ { type: STRONG_ENEMY, amount: 10, delayMs: 1500, pathIndex: 0 } ],
            3: [ 
                { type: FAST_ENEMY, amount: 20, delayMs: 500, pathIndex: 0 },
                { type: ADAPTIVE_ENEMY, amount: 5, delayMs: 1000, pathIndex: 0 }
            ]
        }
    },
    5: {
        scenarioId: 'SCENARIO_2_CURVE',
        startingMoney: 150,
        waves: {
            1: [ { type: ADAPTIVE_ENEMY, amount: 10, delayMs: 1200, pathIndex: 0 } ],
            2: [ { type: STRONG_ENEMY, amount: 8, delayMs: 2000, pathIndex: 0 } ],
            3: [ { type: ADAPTIVE_ENEMY, amount: 15, delayMs: 1000, pathIndex: 0 } ]
        }
    },
    6: {
        scenarioId: 'SCENARIO_3_MULTI',
        startingMoney: 200,
        waves: {
            1: [ { type: ADAPTIVE_ENEMY, amount: 15, delayMs: 1000, pathIndex: 0 } ],
            2: [ { type: STRONG_ENEMY, amount: 15, delayMs: 1500, pathIndex: 0 } ],
            3: [ 
                { type: ADAPTIVE_ENEMY, amount: 20, delayMs: 800, pathIndex: 0 },
                { type: STRONG_ENEMY, amount: 10, delayMs: 1000, pathIndex: 0 }
            ]
        }
    }
};
