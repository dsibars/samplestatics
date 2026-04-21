import { Component } from '../Component.js';

export class InfoComponent extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const spell = this.props.spell;
        if (!spell) {
            return `
                <div class="info-panel" style="height: 15vh; background: #f0f0f0; padding: 10px; border: 1px solid #ccc; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; text-align: center;">
                    <p>Draw a <strong>Core</strong> symbol (center) and <strong>Complements</strong> (slices) then press Launch!</p>
                </div>
            `;
        }

        let statsText = '';
        if (spell.composition) {
            const mods = [];
            if (spell.composition.modifiers.boost) mods.push(`Enhanced x${spell.composition.modifiers.boost}`);
            if (spell.composition.modifiers.reduce) mods.push(`Reduced x${spell.composition.modifiers.reduce}`);
            if (spell.composition.modifiers.all) mods.push(`Multi-Enemy x${spell.composition.modifiers.all}`);
            if (spell.composition.modifiers.pierce) mods.push(`Piercing x${spell.composition.modifiers.pierce}`);

            statsText = mods.length > 0 ? `Modifiers: ${mods.join(', ')}` : 'Stats: Basic';
        }

        const isFailure = spell.type === 'none';

        return `
            <div class="info-panel" style="min-height: 15vh; background: ${isFailure ? '#ffebee' : '#e0f7fa'}; padding: 10px; border: 1px solid ${isFailure ? '#f44336' : '#00acc1'}; margin-bottom: 10px;">
                <h2 style="margin: 0; color: ${isFailure ? '#c62828' : '#006064'};">${spell.name}</h2>
                <div style="display: flex; justify-content: space-between; margin-top: 5px; font-weight: bold;">
                    <span>Type: ${spell.element}</span>
                    <span>MP Cost: ${spell.mpCost}</span>
                    <span>Power: ${spell.damage}</span>
                </div>
                <div style="font-size: 0.85em; color: ${isFailure ? '#d32f2f' : '#00796b'}; margin-top: 8px; border-top: 1px dashed ${isFailure ? '#ef9a9a' : '#4db6ac'}; padding-top: 5px;">
                    <strong>${statsText}</strong>
                </div>
                <div style="font-size: 0.8em; color: #666; margin-top: 5px;">
                    Special Effects: ${spell.effects && spell.effects.length > 0 ? spell.effects.join(', ') : 'None'}
                </div>
            </div>
        `;
    }
}
