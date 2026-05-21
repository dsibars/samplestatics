import { persistence } from '../../shared/core/Persistence.js';
import { Result } from '../../shared/core/Result.js';

const OBJECTIVE_TYPES = [
    { id: 'defeat_enemies', label: 'obj_defeat_enemies', target: [3, 5, 8], reward: { gold: 50, material_wood: 10 } },
    { id: 'spend_gold', label: 'obj_spend_gold', target: [100, 200, 500], reward: { gold: 30, material_stone: 5 } },
    { id: 'complete_expeditions', label: 'obj_complete_expeditions', target: [1, 2, 3], reward: { gold: 80, material_iron: 3 } },
    { id: 'upgrade_building', label: 'obj_upgrade_building', target: [1], reward: { gold: 40, material_wood: 15 } },
    { id: 'recruit_hero', label: 'obj_recruit_hero', target: [1], reward: { gold: 60, material_stone: 10 } },
    { id: 'craft_items', label: 'obj_craft_items', target: [1, 2, 3], reward: { gold: 35, material_iron: 5 } }
];

export class DailyObjectivesService {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
        this.STORAGE_KEY = 'daily_objectives_state';
        this.state = this._load();
    }

    _load() {
        const defaultState = {
            day: 1,
            objectives: [],
            allCompletedDay: null
        };
        return persistence.load(this.STORAGE_KEY, defaultState);
    }

    save() {
        persistence.save(this.STORAGE_KEY, this.state);
    }

    generateForDay(day) {
        if (this.state.day === day && this.state.objectives.length > 0) {
            return;
        }

        this.state.day = day;
        this.state.allCompletedDay = null;

        // Pick 2-3 random objectives with scaled targets
        const count = 2 + Math.floor(Math.random() * 2); // 2 or 3
        const shuffled = [...OBJECTIVE_TYPES].sort(() => Math.random() - 0.5);
        const picked = shuffled.slice(0, count);

        this.state.objectives = picked.map(type => {
            const target = type.target[Math.floor(Math.random() * type.target.length)];
            return {
                id: type.id,
                label: type.label,
                target,
                progress: 0,
                completed: false,
                reward: { ...type.reward }
            };
        });

        this.save();
    }

    track(type, amount = 1) {
        let anyCompleted = false;
        this.state.objectives.forEach(obj => {
            if (obj.completed || obj.id !== type) return;
            obj.progress = Math.min(obj.target, obj.progress + amount);
            if (obj.progress >= obj.target) {
                obj.completed = true;
                anyCompleted = true;
            }
        });

        if (anyCompleted) {
            this._checkAllCompleted();
        }

        this.save();
        return anyCompleted;
    }

    _checkAllCompleted() {
        const allDone = this.state.objectives.every(o => o.completed);
        if (allDone && this.state.allCompletedDay === null) {
            this.state.allCompletedDay = this.state.day;
            // Grant bonus reward for completing all objectives
            this.inventoryService.addItem('material_wood', 20);
            this.inventoryService.addItem('material_stone', 10);
        }
    }

    getObjectives() {
        return this.state.objectives;
    }

    getState() {
        return {
            day: this.state.day,
            objectives: this.state.objectives,
            allCompleted: this.state.allCompletedDay === this.state.day
        };
    }

    claimReward(objectiveId) {
        const obj = this.state.objectives.find(o => o.id === objectiveId);
        if (!obj || !obj.completed || obj.claimed) {
            return Result.fail('error_reward_not_available');
        }

        obj.claimed = true;

        if (obj.reward.gold) {
            // Gold is handled by caller adding to village
        }
        if (obj.reward.material_wood) {
            this.inventoryService.addItem('material_wood', obj.reward.material_wood);
        }
        if (obj.reward.material_stone) {
            this.inventoryService.addItem('material_stone', obj.reward.material_stone);
        }
        if (obj.reward.material_iron) {
            this.inventoryService.addItem('material_iron', obj.reward.material_iron);
        }

        this.save();
        return Result.ok({ reward: obj.reward });
    }
}
