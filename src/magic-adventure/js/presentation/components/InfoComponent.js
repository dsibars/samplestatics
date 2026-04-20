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

        const compositionText = spell.composition
            ? `Base: ${spell.composition.core} | Modifiers: ${
                Object.entries(spell.composition.modifiers)
                    .map(([type, count]) => `${count}x ${type}`)
                    .join(', ') || 'None'
            }`
            : 'Composition: Unknown';

        return `
            <div class="info-panel" style="min-height: 15vh; background: #e0f7fa; padding: 10px; border: 1px solid #00acc1; margin-bottom: 10px;">
                <h2 style="margin: 0;">${spell.name}</h2>
                <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                    <span><strong>Element:</strong> ${spell.element}</span>
                    <span><strong>MP Cost:</strong> ${spell.mpCost} MP</span>
                    <span><strong>Damage:</strong> ${spell.damage}</span>
                </div>
                <div style="font-size: 0.85em; color: #00796b; margin-top: 8px; border-top: 1px dashed #4db6ac; padding-top: 5px;">
                    <strong>${compositionText}</strong>
                </div>
                <div style="font-size: 0.8em; color: #666; margin-top: 5px;">
                    Effects: ${spell.effects.length > 0 ? spell.effects.join(', ') : 'None'}
                </div>
            </div>
        `;
    }
}
