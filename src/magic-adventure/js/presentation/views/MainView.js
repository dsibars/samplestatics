import { View } from '../View.js';
import { CanvasComponent } from '../components/CanvasComponent.js';
import { InfoComponent } from '../components/InfoComponent.js';
import { drawingEngine } from '../../engine/core/DrawingEngine.js';
import { recognitionEngine } from '../../engine/core/RecognitionEngine.js';
import { SpellService } from '../../engine/services/SpellService.js';

import { GuideView } from './GuideView.js';

export class MainView extends View {
    constructor() {
        super();
        this.spellService = new SpellService(recognitionEngine);
        this.showGuide = false;
        this.currentSpell = null;

        this.infoComp = new InfoComponent({ spell: null });
        this.canvasComp = new CanvasComponent({ drawingEngine });
    }

    render() {
        if (this.showGuide) {
            return `<div id="guide-container"></div>`;
        }

        return `
            <div class="main-view" style="
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                padding-top: max(20px, env(safe-area-inset-top));
                padding-bottom: max(20px, env(safe-area-inset-bottom));
                font-family: sans-serif;
                box-sizing: border-box;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                background: #fafafa;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h1 style="margin: 0; font-size: 1.5em;">Magic Simulator</h1>
                    <button id="open-guide-btn" style="padding: 8px 15px; cursor: pointer; background: #673ab7; color: #fff; border: none; border-radius: 4px;">Guide</button>
                </div>
                <div id="info-section"></div>
                <div id="canvas-section"></div>
                <div style="margin-top: 20px; text-align: center;">
                    <button id="launch-btn" style="padding: 15px 40px; font-size: 1.2em; cursor: pointer; background: #673ab7; color: #fff; border: none; border-radius: 5px;">LAUNCH SPELL</button>
                    <button id="clear-btn" style="padding: 10px 20px; font-size: 1em; cursor: pointer; background: #f44336; color: #fff; border: none; border-radius: 5px; margin-left: 10px;">Clear</button>
                </div>
            </div>
        `;
    }

    onMount() {
        if (this.showGuide) {
            const guide = new GuideView({
                onBack: () => {
                    this.showGuide = false;
                    this.update();
                }
            });
            // If showGuide is true, render returns <div id="guide-container"></div>
            // so this.element is the container itself.
            guide.mount(this.element);
            return;
        }

        this.infoComp.mount(this.element.querySelector('#info-section'));
        this.canvasComp.mount(this.element.querySelector('#canvas-section'));

        this.element.querySelector('#launch-btn').addEventListener('click', () => this.launchSpell());
        this.element.querySelector('#clear-btn').addEventListener('click', () => this.canvasComp.clear());
        this.element.querySelector('#open-guide-btn').addEventListener('click', () => {
            this.showGuide = true;
            this.update();
        });
    }

    launchSpell() {
        const strokes = drawingEngine.getStrokes();
        if (strokes.length === 0) return;

        const canvasSize = {
            width: this.canvasComp.canvas.width,
            height: this.canvasComp.canvas.height
        };

        this.currentSpell = this.spellService.createSpellFromStrokes(strokes, canvasSize);
        this.infoComp.update({ spell: this.currentSpell });

        // Highlight recognized strokes
        this.canvasComp.highlightRecognized(this.spellService.lastRecognized);

        // Wait a bit to show results then clear? User said "clear the draw part to be ready to test another spell"
        setTimeout(() => {
            this.canvasComp.clear();
        }, 1000);
    }
}
