import { Component } from '../Component.js';

export class InfoComponent extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const spell = this.props.spell;
        if (!spell) {
            return `
                <div class="info-panel" style="height: 15vh; background: #f0f0f0; padding: 10px; border: 1px solid #ccc; margin-bottom: 10px;">
                    <p>Draw a spell below and press Launch!</p>
                </div>
            `;
        }

        let statsText = '';
        if (spell.composition) {
            const mods = [];
            if (spell.composition.modifiers.boost) mods.push(`enhanced x${spell.composition.modifiers.boost}`);
            if (spell.composition.modifiers.reduce) mods.push(`reduced x${spell.composition.modifiers.reduce}`);
            if (spell.composition.modifiers.all) mods.push(`multienemy x${spell.composition.modifiers.all}`);
            if (spell.composition.modifiers.pierce) mods.push(`piercing x${spell.composition.modifiers.pierce}`);

            statsText = mods.length > 0 ? `Stats: ${mods.join(', ')}` : 'Stats: Basic';
        }

        return `
            <div class="info-panel" style="min-height: 15vh; background: #e0f7fa; padding: 10px; border: 1px solid #00acc1; margin-bottom: 10px;">
                <h2 style="margin: 0;">${spell.name}</h2>
                <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                    <span><strong>Type:</strong> ${spell.element}</span>
                    <span><strong>MP Cost:</strong> ${spell.mpCost} MP</span>
                    <span><strong>Damage:</strong> ${spell.damage}</span>
                </div>
                <div style="font-size: 0.85em; color: #00796b; margin-top: 8px; border-top: 1px dashed #4db6ac; padding-top: 5px;">
                    <strong>${statsText}</strong>
                </div>
                <div style="font-size: 0.8em; color: #666; margin-top: 5px;">
                    Effects: ${spell.effects.length > 0 ? spell.effects.join(', ') : 'None'}
                </div>
            </div>
        `;
    }
}
