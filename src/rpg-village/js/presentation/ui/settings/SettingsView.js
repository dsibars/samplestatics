import { BaseView } from '../BaseView.js';
import { persistence } from '../../../engine/shared/core/Persistence.js';

/**
 * SettingsView - Manages the game settings and data wiping.
 */
export class SettingsView extends BaseView {
    constructor() {
        super('settings');
    }

    onMount() {
        this.elements = {
            langSelect: this.$('#lang-select'),
            btnWipe: this.$('#btn-wipe-data')
        };

        // Initialize Select with current language
        if (this.elements.langSelect) {
            this.elements.langSelect.value = this.ui.i18n.currentLang;
            
            this.elements.langSelect.addEventListener('change', (e) => {
                const newLang = e.target.value;
                console.log(`Settings: Changing language to ${newLang}`);
                this.ui.setLanguage(newLang);
            });
        }

        // Wipe Data logic
        if (this.elements.btnWipe) {
            this.elements.btnWipe.addEventListener('click', () => {
                console.log('SettingsView: Wipe button clicked');
                
                this.ui.showConfirmDialog({
                    title: 'ui_settings_wipe_data',
                    message: 'ui_settings_wipe_confirm',
                    onConfirm: () => {
                        console.warn('SettingsView: USER CONFIRMED WIPE. Executing persistence.clear()...');
                        persistence.clear();
                        
                        console.log('SettingsView: Wipe complete. Reloading page...');
                        // Small delay to ensure logs are processed
                        setTimeout(() => {
                            window.location.reload();
                        }, 100);
                    }
                });
            });
        }
    }

    onUpdate(state) {
        // Settings view doesn't typically change based on game state
        // but we could show dynamic info here if needed.
    }
}
