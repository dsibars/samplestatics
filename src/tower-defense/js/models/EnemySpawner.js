import { Enemy } from './Enemy.js';

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
    }
    
    startWave(waveNum) {
        if (!this.wavesData[waveNum]) return false;
        
        this.activeWaveNumber = waveNum;
        this.activeSequence = this.wavesData[waveNum];
        this.currentRoundIndex = 0;
        this.timer = 0;
        this.waveIsActive = true;
        this.remainingInRound = this.activeSequence.length > 0 ? this.activeSequence[0].amount : 0;
        
        return true;
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
        return !!this.wavesData[this.activeWaveNumber + 1];
    }
}
