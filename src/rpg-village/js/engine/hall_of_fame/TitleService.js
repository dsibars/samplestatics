/**
 * TitleService checks hero lifetime stats and assigns titles.
 */
export class TitleService {
    static TITLES = [
        { id: 'title_first_blood', key: 'title_first_blood', check: (s) => s.enemiesDefeated >= 1 },
        { id: 'title_veteran', key: 'title_veteran', check: (s) => s.enemiesDefeated >= 50 },
        { id: 'title_slayer', key: 'title_slayer', check: (s) => s.enemiesDefeated >= 200 },
        { id: 'title_legend', key: 'title_legend', check: (s) => s.enemiesDefeated >= 500 },
        { id: 'title_explorer', key: 'title_explorer', check: (s) => s.expeditionsCompleted >= 5 },
        { id: 'title_survivor', key: 'title_survivor', check: (s) => s.battlesWon >= 10 },
        { id: 'title_titan', key: 'title_titan', check: (s) => s.damageDealt >= 1000 },
        { id: 'title_unstoppable', key: 'title_unstoppable', check: (s) => s.highestDamageDealt >= 100 },
    ];

    /**
     * Evaluate a hero and return any newly earned titles.
     * @param {Hero} hero
     * @returns {string[]} Array of newly earned title IDs
     */
    static evaluate(hero) {
        const stats = hero.lifetimeStats || {};
        const currentTitles = hero.titles || [];
        const newTitles = [];

        for (const title of this.TITLES) {
            if (!currentTitles.includes(title.id) && title.check(stats)) {
                newTitles.push(title.id);
            }
        }

        if (newTitles.length > 0) {
            hero.titles = [...currentTitles, ...newTitles];
        }

        return newTitles;
    }

    static getAllTitles() {
        return this.TITLES.map(t => t.id);
    }
}
