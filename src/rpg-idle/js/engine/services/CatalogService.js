import { SKILLS_DATA, WEAPON_FAMILIES, ARMOR_ARCHETYPES, MATERIAL_TIERS } from '../../constants.js';

export class CatalogService {
    constructor() {
        this.skills = SKILLS_DATA;
        this.weapons = WEAPON_FAMILIES;
        this.armor = ARMOR_ARCHETYPES;
        this.materials = MATERIAL_TIERS;
        this.origins = [
            'origin_clown', 'origin_warrior', 'origin_thief',
            'origin_cook', 'origin_farmer', 'origin_guard',
            'origin_monk', 'origin_poet'
        ];
    }

    getSkill(id) {
        return this.skills[id] || null;
    }

    getWeapon(id) {
        return this.weapons[id] || null;
    }

    getArmor(id) {
        return this.armor[id] || null;
    }

    getMaterial(id) {
        return this.materials[id] || null;
    }

    listSkills(category = null) {
        const skills = Object.values(this.skills);
        if (category) {
            return skills.filter(s => s.category === category);
        }
        return skills;
    }

    listWeapons() {
        return Object.values(this.weapons);
    }

    listArmor() {
        return Object.values(this.armor);
    }

    listMaterials(maxLevel = 999) {
        return Object.values(this.materials).filter(m => m.levelReq <= maxLevel);
    }

    listOrigins() {
        return this.origins;
    }

    getSkillUpgradeCost(skillId, currentLevel) {
        const skill = this.getSkill(skillId);
        if (!skill) return 0;
        return Math.max(1, skill.tier * currentLevel);
    }
}

export const catalogService = new CatalogService();
