import { Enemy } from './Enemy.js';
import { FAST_ENEMY, STRONG_ENEMY, ADAPTIVE_ENEMY, HEALER_ENEMY } from './EnemyDefinitions.js';

export class EnemySpawner {
    constructor(paths, cellSize, wavesData, adjustments = {}) {
        this.paths = paths || []; 
        this.cellSize = cellSize;
        this.wavesData = wavesData || {};
        this.adjustments = adjustments;
        
        this.activeWaveNumber = 0;
        this.activeSequence = [];
        this.currentRoundIndex = 0;
        this.remainingInRound = 0;
        this.timer = 0;
        this.waveIsActive = false;
        this.isInfinite = false;
    }
    
    startWave(waveNum) {
        if (!this.wavesData[waveNum] && !this.isInfinite) return false;
        
        let waveSeq = this.wavesData[waveNum];
        
        // Dynamic Generation for Infinite Mode
        if (this.isInfinite && !waveSeq) {
            waveSeq = this.generateInfiniteWave(waveNum);
            this.wavesData[waveNum] = waveSeq;
        }

        this.activeWaveNumber = waveNum;
        this.activeSequence = waveSeq;
        this.currentRoundIndex = 0;
        this.timer = 0;
        this.waveIsActive = true;
        this.remainingInRound = this.activeSequence.length > 0 ? this.activeSequence[0].amount : 0;
        
        // Update difficulty scalar for generated instances
        if (this.isInfinite) {
            this.adjustments.difficultyMult = 1 + (waveNum * 0.12); // 12% stats per wave (up from 5%)
            this.adjustments.speedMult = Math.min(2.5, 1 + (waveNum * 0.04)); // faster speed scaling
        }

        return true;
    }

    generateInfiniteWave(waveNum) {
        const seq = [];
        // More batches as waves progress
        const numBatches = 1 + Math.floor(waveNum / 2);
        
        for (let i = 0; i < numBatches; i++) {
            // Determine enemy type based on progression
            const rand = Math.random();
            let type = FAST_ENEMY;
            let delay = 700 - (waveNum * 15);
            delay = Math.max(100, delay);
            let amount = 12 + Math.floor(waveNum * 2.0);
            
            if (waveNum > 2 && rand > 0.3) {
                type = ADAPTIVE_ENEMY;
                amount = Math.floor(amount * 0.8);
                delay += 200;
            }
            if (waveNum > 4 && rand > 0.6) {
                type = STRONG_ENEMY;
                amount = Math.floor(amount * 0.4);
                delay += 500;
            }
            if (waveNum >= 10 && (rand > 0.8 || i === numBatches - 1)) { // Add healers earlier and more frequently
                seq.push({ type: HEALER_ENEMY, amount: 1 + Math.floor(waveNum / 8), delayMs: 1200, pathIndex: 0 });
            }
            
            seq.unshift({ type, amount, delayMs: delay, pathIndex: 0 });
        }
        return seq;
    }

    update(deltaTime) {
        const spawnedEnemies = [];
        
        if (!this.waveIsActive || this.currentRoundIndex >= this.activeSequence.length) {
            this.waveIsActive = false;
            return spawnedEnemies;
        }

        const currentRound = this.activeSequence[this.currentRoundIndex];
        this.timer += deltaTime;

        if (this.timer >= currentRound.delayMs) {
            this.timer = 0;
            
            const targetPath = this.paths[currentRound.pathIndex] || this.paths[0];
            
            // Create the enemy
            const enemy = new Enemy(
                targetPath, 
                this.cellSize, 
                currentRound.type.stats, 
                currentRound.type.presentation,
                this.adjustments
            );
            spawnedEnemies.push(enemy);
            
            this.remainingInRound--;
            
            // Check if we finished this internal wave subset
            if (this.remainingInRound <= 0) {
                this.currentRoundIndex++;
                if (this.currentRoundIndex < this.activeSequence.length) {
                    this.remainingInRound = this.activeSequence[this.currentRoundIndex].amount;
                    this.timer = 0;
                } else {
                    this.waveIsActive = false;
                }
            }
        }

        return spawnedEnemies;
    }

    isWaveFinished() {
        return !this.waveIsActive;
    }
    
    hasMoreWaves() {
        if (this.isInfinite) return true;
        return !!this.wavesData[this.activeWaveNumber + 1];
    }
}
