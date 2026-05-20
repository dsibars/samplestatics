/**
 * BaseView - Foundation for all domain views.
 * Provides event emission, translation, and smart update logic.
 */
export class BaseView {
    constructor(domain) {
        this.domain = domain;
        this.root = null;
        this.ui = null;
        this.listeners = {};
        this.lastRenderedState = null;
    }

    /**
     * Mounts the view to a DOM container.
     */
    mount(container, uiReference) {
        this.root = container;
        this.ui = uiReference;
        this.lastRenderedState = null; // Reset to force a re-render on mount
        this.onMount();
    }

    /**
     * Life-cycle hook for initialization.
     */
    onMount() {}

    /**
     * Updates the view with new state.
     * Uses smart diffing to prevent unnecessary re-renders.
     */
    update(state) {
        const domainState = state[this.domain];
        if (!domainState) return;

        // Smart Diffing: Only trigger onUpdate if the state has changed
        // We use JSON stringify for a simple deep comparison of the domain state
        const stateString = JSON.stringify({ 
            domain: domainState, 
            inventory: state.inventory?.totalUsed // Some views depend on global inventory stats
        });

        if (this.lastRenderedState === stateString) {
            return; // Skip re-render
        }

        this.onUpdate(state);
        this.lastRenderedState = stateString;
    }

    /**
     * Life-cycle hook for state updates.
     */
    onUpdate(state) {}

    /**
     * Event Emitter: Register a listener.
     */
    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    /**
     * Event Emitter: Emit an event.
     */
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }

    /**
     * Helper to find elements within the view root.
     */
    $(selector) {
        return this.root ? this.root.querySelector(selector) : null;
    }

    /**
     * Helper to find all elements within the view root.
     */
    $$(selector) {
        return this.root ? this.root.querySelectorAll(selector) : [];
    }

    /**
     * Helper for translations.
     */
    t(key) {
        return this.ui ? this.ui.t(key) : key;
    }
}
