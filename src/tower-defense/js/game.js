import { Scenario } from './models/Scenario.js';
import { Enemy } from './models/Enemy.js';
import { EnemySpawner } from './models/EnemySpawner.js';
import { STAGES } from './models/Stages.js';
import { Tower } from './models/Tower.js';
import { TOWER_TYPES } from './models/TowerDefinitions.js';
import { Particle } from './models/Particle.js';
import { t } from './i18n.js';

export class TowerDefenseGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        this.scenario = new Scenario();
        this.enemies = [];
        this.towers = [];
        this.particles = [];
        
        this.lastTime = 0;
        this.spawnTimer = 0;
        this.spawnRate = 2000; // Spawn every 2 seconds
        
        this.isRunning = false;
        this.lives = 20;
        this.money = 100;
        this.wave = 1;
        this.spawner = null;
        this.pendingTowerCell = null;
        this.popupOpenTime = 0;
        this.gameStartTime = 0;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.setupInputHandling();
    }

    setupInputHandling() {
        let isDragging = false;
        let startX, startY, scrollLeft, scrollTop;
        let pointerDownPos = null;
        const container = this.canvas.parentElement;

        // Custom pointer handling for distinct drag-to-pan vs tap-to-place interactions
        this.canvas.addEventListener('pointerdown', (e) => {
            pointerDownPos = { x: e.clientX, y: e.clientY };
            // Auto click-and-drag panning for desktop mouse users
            if (e.pointerType === 'mouse') {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                scrollLeft = container.scrollLeft;
                scrollTop = container.scrollTop;
                this.canvas.style.cursor = 'grabbing';
            }
        });

        window.addEventListener('pointermove', (e) => {
            if (!isDragging || e.pointerType !== 'mouse') return;
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            container.scrollLeft = scrollLeft - dx;
            container.scrollTop = scrollTop - dy;
        }, { passive: false });

        window.addEventListener('pointerup', (e) => {
            this.canvas.style.cursor = 'default';
            
            if (pointerDownPos) {
                const totalDx = e.clientX - pointerDownPos.x;
                const totalDy = e.clientY - pointerDownPos.y;
                
                // If it was a clean stationary tap (< 5px movement), treat as click
                if (Math.hypot(totalDx, totalDy) < 5) {
                    if (e.target === this.canvas) {
                        this.handleCanvasClick(e);
                    }
                }
            }
            
            pointerDownPos = null;
            isDragging = false;
        });
    }

    resize() {
        const parent = this.canvas.parentElement;
        this.isPortrait = parent.clientHeight > parent.clientWidth;
        
        // We always want the 10-cell axis (gridHeight) to fill the shortest screen dimension
        let screenShortSide = this.isPortrait ? parent.clientWidth : parent.clientHeight;
        this.cellSize = Math.floor(screenShortSide / this.scenario.gridHeight);
        
        // Ensure cellSize is at least a reasonable minimum (it shouldn't be too small)
        if (this.cellSize < 20) this.cellSize = 20;

        if (this.isPortrait) {
            // In portrait, matrix columns (40) go down (canvas height)
            // matrix rows (10) go across (canvas width)
            this.canvas.width = this.scenario.gridHeight * this.cellSize;
            this.canvas.height = this.scenario.gridWidth * this.cellSize;
            parent.style.overflowX = 'hidden';
            parent.style.overflowY = 'auto';
        } else {
            // In landscape, matrix columns (40) go across (canvas width)
            // matrix rows (10) go down (canvas height)
            this.canvas.width = this.scenario.gridWidth * this.cellSize;
            this.canvas.height = this.scenario.gridHeight * this.cellSize;
            parent.style.overflowY = 'hidden';
            parent.style.overflowX = 'auto';
        }

        // Apply explicit CSS dimensions to prevent browser auto-scaling/squishing
        this.canvas.style.width = this.canvas.width + 'px';
        this.canvas.style.height = this.canvas.height + 'px';
    }

    closeTowerPopup() {
        this.pendingTowerCell = null;
        const popup = document.getElementById('tower-popup');
        if (popup) popup.style.display = 'none';
    }

    showTowerPopup(gridX, gridY) {
        this.pendingTowerCell = { x: gridX, y: gridY };
        const popup = document.getElementById('tower-popup');
        const content = document.getElementById('tower-popup-content');
        
        content.innerHTML = '';
        
        TOWER_TYPES.forEach(type => {
            const canAfford = this.money >= type.cost;
            const btn = document.createElement('div');
            btn.className = `tower-option ${canAfford ? '' : 'disabled'}`;
            btn.innerHTML = `
                <div class="tower-opt-header">
                    <span>${type.name}</span>
                    <span class="tower-opt-cost">💰 ${type.cost}</span>
                </div>
                <div class="tower-opt-desc">${type.description}</div>
                <div class="tower-opt-stats">
                    <span>${t('stats_damage')} ${type.stats.damage}</span>
                    <span>${t('stats_range')} ${type.stats.range}</span>
                    <span>${t('stats_cooldown')} ${type.stats.cooldownMs}ms</span>
                </div>
            `;
            
            if (canAfford) {
                btn.onclick = () => {
                    // Prevent accidental "double-tap" selection on mobile
                    if (performance.now() - this.popupOpenTime < 300) return;
                    this.buyTower(gridX, gridY, type);
                };
            }
            content.appendChild(btn);
        });
        
        popup.style.display = 'flex';
        this.popupOpenTime = performance.now();
    }

    buyTower(gridX, gridY, type) {
        if (this.money >= type.cost) {
            this.money -= type.cost;
            this.updateStats();
            this.towers.push(new Tower(gridX, gridY, this.cellSize, type));
            this.closeTowerPopup();
        }
    }

    handleCanvasClick(e) {
        if (!this.isRunning) return;
        
        // Prevent "leaked" clicks from the menu when the view switches instantly
        if (performance.now() - this.gameStartTime < 300) return;

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        let logicMouseX = mouseX;
        let logicMouseY = mouseY;

        if (this.isPortrait) {
            logicMouseX = mouseY;
            logicMouseY = mouseX;
        }

        const gridX = Math.floor(logicMouseX / this.cellSize);
        const gridY = Math.floor(logicMouseY / this.cellSize);

        if (gridY >= 0 && gridY < this.scenario.matrix.length && 
            gridX >= 0 && gridX < this.scenario.matrix[0].length) {
                
            const cellType = this.scenario.matrix[gridY][gridX];
            
            if (cellType === 0) {
                const existing = this.towers.find(t => t.gridX === gridX && t.gridY === gridY);
                if (!existing) {
                    this.showTowerPopup(gridX, gridY);
                } else {
                    this.closeTowerPopup();
                }
            } else {
                this.closeTowerPopup();
            }
        } else {
            this.closeTowerPopup();
        }
    }

    start(stageId) {
        this.isRunning = true;
        this.gameStartTime = performance.now();
        this.currentStageId = stageId || 1;
        const stageConfig = STAGES[this.currentStageId] || STAGES[1];
        
        this.scenario = new Scenario(stageConfig.scenarioId);
        this.resize();
        
        this.lives = 20;
        this.money = stageConfig.startingMoney || 100;
        this.wave = 1;
        this.enemies = [];
        this.towers = [];
        
        this.closeTowerPopup();
        
        const overlay = document.getElementById('next-wave-overlay');
        if (overlay) overlay.style.display = 'flex';
        
        const winOverlay = document.getElementById('win-overlay');
        if (winOverlay) winOverlay.style.display = 'none';
        
        const loseOverlay = document.getElementById('lose-overlay');
        if (loseOverlay) loseOverlay.style.display = 'none';
        
        this.spawner = new EnemySpawner(
            this.scenario.paths, 
            this.cellSize, 
            stageConfig.waves,
            { difficulty: 1.0 }
        );

        this.lastTime = performance.now();
        this.loop(this.lastTime);
        this.updateStats();
    }

    startNextWave() {
        if (this.spawner && this.spawner.startWave(this.wave)) {
            const overlay = document.getElementById('next-wave-overlay');
            if (overlay) overlay.style.display = 'none';
        }
    }

    stop() {
        this.isRunning = false;
    }

    updateStats() {
        document.getElementById('stat-lives').innerText = `❤️ ${this.lives}`;
        document.getElementById('stat-money').innerText = `💰 ${this.money}`;
        document.getElementById('stat-wave').innerText = `🌊 Wave ${this.wave}`;
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(deltaTime) {
        // Spawn enemies
        if (this.spawner) {
            const newEnemies = this.spawner.update(deltaTime);
            this.enemies.push(...newEnemies);
        }

        // Update towers
        this.towers.forEach(t => t.update(deltaTime, this.enemies));

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update enemies (reverse loop to allow splice)
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime); // passing deltatime for speed boost
            
            if (enemy.reachedGoal) {
                this.lives -= (enemy.stats.damage || 1);
                this.updateStats();
                this.enemies.splice(i, 1);
                
                if (this.lives <= 0) {
                    this.lives = 0;
                    this.updateStats();
                    this.gameLose();
                    return;
                }
            } else if (enemy.isDead) { // Killed by tower
                this.money += enemy.stats.reward;
                this.updateStats();
                
                // Spawn death particles
                for (let j = 0; j < 12; j++) {
                    this.particles.push(new Particle(enemy.x, enemy.y, enemy.presentation.color));
                }

                this.enemies.splice(i, 1);
            }
        }
        
        // Check win condition for segmented wave
        if (this.spawner && this.spawner.isWaveFinished() && this.enemies.length === 0) {
            const overlay = document.getElementById('next-wave-overlay');
            if (overlay && overlay.style.display === 'none') {
                if (this.spawner.hasMoreWaves()) {
                    this.wave++;
                    this.updateStats();
                    overlay.style.display = 'flex';
                } else {
                    this.gameWin();
                }
            }
        }
    }

    draw() {
        // Must clear using raw canvas width and height
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        if (this.isPortrait) {
            this.ctx.setTransform(0, 1, 1, 0, 0, 0);
        } else {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        // Draw Scenario (Grid)
        const matrix = this.scenario.matrix;
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                const cellType = matrix[y][x];
                const px = x * this.cellSize;
                const py = y * this.cellSize;

                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                this.ctx.strokeRect(px, py, this.cellSize, this.cellSize);

                if (cellType === 1 || cellType === 2 || cellType === 3) {
                    // Path
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    this.ctx.fillRect(px + 2, py + 2, this.cellSize - 4, this.cellSize - 4);
                    
                    if (cellType === 2) { // Start
                        this.ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
                        this.ctx.fillRect(px, py, this.cellSize, this.cellSize);
                    } else if (cellType === 3) { // Goal
                        this.ctx.fillStyle = 'rgba(255, 0, 85, 0.3)';
                        this.ctx.fillRect(px, py, this.cellSize, this.cellSize);
                    }
                } else {
                    // Buildable area
                    // Just a subtle dot in the middle
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    this.ctx.beginPath();
                    this.ctx.arc(px + this.cellSize/2, py + this.cellSize/2, 2, 0, Math.PI*2);
                    this.ctx.fill();
                }
            }
        }

        // Draw Towers
        this.towers.forEach(t => t.draw(this.ctx));

        // Draw Enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));

        // Draw Particles
        this.particles.forEach(p => p.draw(this.ctx));

        // Draw Pending Tower Selection (Highlight)
        if (this.pendingTowerCell) {
            this.ctx.strokeStyle = '#00f2ff';
            this.ctx.lineWidth = 3;
            const px = this.pendingTowerCell.x * this.cellSize;
            const py = this.pendingTowerCell.y * this.cellSize;
            this.ctx.strokeRect(px + 4, py + 4, this.cellSize - 8, this.cellSize - 8);
            
            this.ctx.fillStyle = 'rgba(0, 242, 255, 0.2)';
            this.ctx.fillRect(px, py, this.cellSize, this.cellSize);
        }

        this.ctx.restore();
    }

    gameLose() {
        this.stop();
        const loseOverlay = document.getElementById('lose-overlay');
        if (loseOverlay) {
            loseOverlay.style.display = 'flex';
        }
    }

    gameWin() {
        this.stop();
        
        const maxStageStr = localStorage.getItem('td_max_stage') || '1';
        let maxStage = parseInt(maxStageStr, 10);
        if (this.currentStageId >= maxStage) {
            maxStage = this.currentStageId + 1;
            localStorage.setItem('td_max_stage', maxStage.toString());
        }
        
        const winOverlay = document.getElementById('win-overlay');
        if (winOverlay) {
            winOverlay.style.display = 'flex';
            
            // Check if next stage exists
            const nextStageBtn = document.getElementById('btn-next-stage');
            if (STAGES[this.currentStageId + 1]) {
                nextStageBtn.style.display = 'flex';
            } else {
                nextStageBtn.style.display = 'none';
            }
        }
    }
}
