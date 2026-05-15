/**
 * BaseView - Abstract base class for domain-specific views.
 */
export class BaseView {
    constructor(domainName) {
        this.domainName = domainName;
        this.container = null;
    }

    /**
     * Called when the view is loaded into the DOM.
     * @param {HTMLElement} container The container where the view was injected.
     */
    mount(container) {
        this.container = container;
        this.onMount();
    }

    /**
     * Lifecycle hook for when the view is mounted.
     */
    onMount() {
        // Override in subclass
    }

    /**
     * Called by the UIManager when new state is available.
     * @param {Object} state The engine state.
     */
    update(state) {
        if (!this.container) return;
        this.onUpdate(state);
    }

    /**
     * Lifecycle hook for when state updates.
     */
    onUpdate(state) {
        // Override in subclass
    }

    /**
     * Helper to find elements within this view's container.
     */
    $(selector) {
        return this.container.querySelector(selector);
    }
}
