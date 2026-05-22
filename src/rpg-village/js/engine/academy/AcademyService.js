import { Result } from '../shared/core/Result.js';
import { GLYPH_DATA } from '../shared/data/GameConstants.js';

/**
 * AcademyService manages glyph teaching and the Design Library.
 */
export class AcademyService {
    constructor(heroService) {
        this.heroService = heroService;
        this.designLibrary = this._loadDesigns();
    }

    _loadDesigns() {
        try {
            const raw = localStorage.getItem('academy_designs');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    _saveDesigns() {
        localStorage.setItem('academy_designs', JSON.stringify(this.designLibrary));
    }

    /**
     * Teach a glyph from teacher to student.
     * @param {string} teacherId
     * @param {string} studentId
     * @param {string} glyphId
     * @returns {Result}
     */
    teachGlyph(teacherId, studentId, glyphId) {
        const teacher = this.heroService.get(teacherId);
        const student = this.heroService.get(studentId);
        if (!teacher || !student) return Result.fail('error_hero_not_found');

        if (!teacher.glyphRepertoire || !teacher.glyphRepertoire.includes(glyphId)) {
            return Result.fail('error_teacher_does_not_know_glyph');
        }

        if (!student.glyphRepertoire) student.glyphRepertoire = [];
        if (student.glyphRepertoire.includes(glyphId)) {
            return Result.fail('error_student_already_knows_glyph');
        }

        const glyph = GLYPH_DATA[glyphId];
        if (!glyph) return Result.fail('error_invalid_glyph');

        student.glyphRepertoire.push(glyphId);
        this.heroService.saveAll();
        return Result.ok({ glyphId, studentId });
    }

    /**
     * Save a spell design to the Design Library.
     * @param {Object} design - { name, glyphIds, mpCost, damage }
     * @returns {Result}
     */
    saveDesign(design) {
        if (!design || !design.name || !design.glyphIds) {
            return Result.fail('error_invalid_design');
        }
        const entry = {
            id: `design_${Date.now()}`,
            ...design,
            createdAt: Date.now()
        };
        this.designLibrary.push(entry);
        this._saveDesigns();
        return Result.ok(entry);
    }

    /**
     * Get all saved designs.
     * @returns {Object[]}
     */
    getDesigns() {
        return [...this.designLibrary];
    }

    /**
     * Copy a design's glyphs to a hero's repertoire (if they don't already have them).
     * @param {string} designId
     * @param {string} heroId
     * @returns {Result}
     */
    copyDesignToHero(designId, heroId) {
        const design = this.designLibrary.find(d => d.id === designId);
        if (!design) return Result.fail('error_design_not_found');

        const hero = this.heroService.get(heroId);
        if (!hero) return Result.fail('error_hero_not_found');

        if (!hero.glyphRepertoire) hero.glyphRepertoire = [];
        let added = 0;
        for (const glyphId of design.glyphIds) {
            if (!hero.glyphRepertoire.includes(glyphId)) {
                hero.glyphRepertoire.push(glyphId);
                added++;
            }
        }

        if (added === 0) return Result.fail('error_hero_already_has_all_glyphs');
        this.heroService.saveAll();
        return Result.ok({ added, designId });
    }
}
