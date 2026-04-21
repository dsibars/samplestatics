import { View } from '../View.js';

export class GuideView extends View {
    constructor(props) {
        super(props);
    }

    render() {
        return `
            <div class="guide-view" style="
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                padding-top: max(20px, env(safe-area-inset-top));
                padding-bottom: max(20px, env(safe-area-inset-bottom));
                font-family: sans-serif;
                box-sizing: border-box;
                min-height: 100vh;
                background: #fdfdfd;
            ">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #673ab7; padding-bottom: 10px;">
                    <button id="back-btn" style="padding: 8px 15px; cursor: pointer; background: #eee; border: 1px solid #ccc; border-radius: 4px;">&larr; Back</button>
                    <h1 style="margin: 0; font-size: 1.5em; color: #673ab7;">Magic Guide</h1>
                </div>

                <section>
                    <h3>The Magic Circle</h3>
                    <p>Each spell has a <strong>Core</strong> and up to 4 <strong>Complements</strong> (the outer slices).</p>
                    <p><strong>Rule:</strong> Exactly ONE gesture in the Core. Mixing different symbols in one Complement section causes failure.</p>
                </section>

                <section>
                    <h3>Core Symbols (Elements)</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <tr style="background: #ede7f6; text-align: left;">
                            <th style="padding: 8px; border: 1px solid #ddd;">Symbol</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Element</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">DMG</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">MP</th>
                        </tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">&gt;</td><td style="padding: 8px; border: 1px solid #ddd;">Fire</td><td style="padding: 8px; border: 1px solid #ddd;">20</td><td style="padding: 8px; border: 1px solid #ddd;">10</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">&lt;</td><td style="padding: 8px; border: 1px solid #ddd;">Water</td><td style="padding: 8px; border: 1px solid #ddd;">12</td><td style="padding: 8px; border: 1px solid #ddd;">8</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">v</td><td style="padding: 8px; border: 1px solid #ddd;">Earth</td><td style="padding: 8px; border: 1px solid #ddd;">15</td><td style="padding: 8px; border: 1px solid #ddd;">12</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">^</td><td style="padding: 8px; border: 1px solid #ddd;">Light</td><td style="padding: 8px; border: 1px solid #ddd;">8</td><td style="padding: 8px; border: 1px solid #ddd;">15</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">Z</td><td style="padding: 8px; border: 1px solid #ddd;">Neutral</td><td style="padding: 8px; border: 1px solid #ddd;">0</td><td style="padding: 8px; border: 1px solid #ddd;">20</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">X</td><td style="padding: 8px; border: 1px solid #ddd;">Poison</td><td style="padding: 8px; border: 1px solid #ddd;">4</td><td style="padding: 8px; border: 1px solid #ddd;">10</td></tr>
                    </table>
                    <p style="font-size: 0.8em; color: #666; margin-top: 5px;">* Arrows are drawn as two strokes or one continuous movement (caret shape).</p>
                </section>

                <section style="margin-top: 20px;">
                    <h3>Complement Symbols (Modifiers)</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <tr style="background: #e0f2f1; text-align: left;">
                            <th style="padding: 8px; border: 1px solid #ddd;">Symbol</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Effect</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">MP Cost</th>
                        </tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">+</td><td style="padding: 8px; border: 1px solid #ddd;">+25% Power</td><td style="padding: 8px; border: 1px solid #ddd;">+25%</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">-</td><td style="padding: 8px; border: 1px solid #ddd;">-25% Power</td><td style="padding: 8px; border: 1px solid #ddd;">-25%</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">&infin;</td><td style="padding: 8px; border: 1px solid #ddd;">Multi-target</td><td style="padding: 8px; border: 1px solid #ddd;">+50%</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">&gt;</td><td style="padding: 8px; border: 1px solid #ddd;">Piercing</td><td style="padding: 8px; border: 1px solid #ddd;">+20%</td></tr>
                    </table>
                    <p style="font-size: 0.8em; color: #666; margin-top: 5px;">* Multiple identical symbols in different slices stack their effects!</p>
                </section>
            </div>
        `;
    }

    onMount() {
        this.element.querySelector('#back-btn').addEventListener('click', () => {
            if (this.props.onBack) this.props.onBack();
        });
    }
}
