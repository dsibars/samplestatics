export class Scenario {
    constructor(id) {
        this.id = id;
        this.gridWidth = 40;
        this.gridHeight = 10;
        this.matrix = [];
        this.paths = []; // Map of priority ordered paths
        
        this.generateMap();
    }
    
    generateMap() {
        // Build an empty grid
        for (let y = 0; y < this.gridHeight; y++) {
            this.matrix.push(new Array(this.gridWidth).fill(0));
        }

        if (this.id === 'SCENARIO_1_STRAIGHT') {
            this._drawPath([{x: 0, y: 5}, {x: 39, y: 5}]);
            this.matrix[5][0] = 2; // spawn
            this.matrix[5][39] = 3; // goal
            this.paths.push(this._calculatePath(0, 5, 39, 5));
        } else if (this.id === 'SCENARIO_2_CURVE') {
            this._drawPath([
                {x: 0, y: 2}, {x: 10, y: 2}, {x: 10, y: 8}, {x: 30, y: 8}, {x: 30, y: 5}, {x: 39, y: 5}
            ]);
            this.matrix[2][0] = 2;
            this.matrix[5][39] = 3;
            this.paths.push(this._calculatePath(0, 2, 39, 5));
        } else if (this.id === 'SCENARIO_3_MULTI') {
            this._drawPath([
                {x: 0, y: 8}, {x: 20, y: 8}, {x: 20, y: 2}, {x: 39, y: 2}
            ]);
            this.matrix[8][0] = 2;
            this.matrix[2][39] = 3;
            // First span array
            this.paths.push(this._calculatePath(0, 8, 39, 2));
        } else {
            // Default fallback
            this._drawPath([{x: 0, y: 5}, {x: 39, y: 5}]);
            this.matrix[5][0] = 2; 
            this.matrix[5][39] = 3; 
            this.paths.push(this._calculatePath(0, 5, 39, 5));
        }
    }

    _drawPath(points) {
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i+1];
            
            const startX = Math.min(p1.x, p2.x);
            const endX = Math.max(p1.x, p2.x);
            const startY = Math.min(p1.y, p2.y);
            const endY = Math.max(p1.y, p2.y);
            
            for (let y = startY; y <= endY; y++) {
                for (let x = startX; x <= endX; x++) {
                    this.matrix[y][x] = 1;
                }
            }
        }
    }

    _calculatePath(startX, startY, goalX, goalY) {
        const path = [];
        let currX = startX;
        let currY = startY;
        let visited = new Set();
        
        while (currX !== goalX || currY !== goalY) {
            path.push({ x: currX, y: currY });
            visited.add(`${currX},${currY}`);
            
            const neighbors = [
                {x: currX+1, y: currY}, {x: currX-1, y: currY},
                {x: currX, y: currY+1}, {x: currX, y: currY-1}
            ];
            
            let moved = false;
            for (let n of neighbors) {
                if (n.x >= 0 && n.x < this.gridWidth && n.y >= 0 && n.y < this.gridHeight) {
                    if (this.matrix[n.y][n.x] > 0 && !visited.has(`${n.x},${n.y}`)) {
                        currX = n.x;
                        currY = n.y;
                        moved = true;
                        break;
                    }
                }
            }
            if (!moved) break; // Trapped
        }
        path.push({ x: goalX, y: goalY });
        return path;
    }

    getTile(x, y) {
        if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) return null;
        return this.matrix[y][x];
    }
}
