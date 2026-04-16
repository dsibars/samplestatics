export class Component {
    constructor(props = {}) {
        this.props = props;
        this.element = null;
    }

    /**
     * Should return a string of HTML or a DOM element
     */
    render() {
        return '';
    }

    /**
     * Called after the component is added to the DOM
     */
    mount(parent) {
        const html = this.render();
        if (typeof html === 'string') {
            const temp = document.createElement('div');
            temp.innerHTML = html;
            this.element = temp.firstElementChild;
        } else {
            this.element = html;
        }

        if (parent) {
            parent.appendChild(this.element);
        }

        this.onMount();
        return this.element;
    }

    onMount() {}

    /**
     * Adds a protected interaction listener to an element.
     * Prevents double-taps and ghost clicks by tracking pointer state globally in the view.
     */
    addInteractionListener(selector, handler) {
        if (!this.element) return;
        const targets = this.element.querySelectorAll(selector);

        targets.forEach(target => {
            target.addEventListener('pointerdown', (e) => {
                // If the view is "locked" by another ongoing interaction, ignore
                if (window._rpgInteractionLocked) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }

                // Lock interactions globally
                window._rpgInteractionLocked = true;

                // Track current pointer
                const pointerId = e.pointerId;

                // Final handler
                handler(e, target);

                // Unlock only when ALL pointers are removed from screen
                const unlock = (ev) => {
                    if (ev.pointerId === pointerId) {
                        // Small delay to ensure browser doesn't trigger "ghost" clicks
                        // from the same physical touch on underlying elements
                        setTimeout(() => {
                            window._rpgInteractionLocked = false;
                        }, 50);
                        window.removeEventListener('pointerup', unlock);
                        window.removeEventListener('pointercancel', unlock);
                    }
                };

                window.addEventListener('pointerup', unlock);
                window.addEventListener('pointercancel', unlock);
            });
        });
    }

    update(newProps = {}) {
        this.props = { ...this.props, ...newProps };
        const oldElement = this.element;
        const parent = oldElement ? oldElement.parentElement : null;

        const newHtml = this.render();
        let newElement;
        if (typeof newHtml === 'string') {
            const temp = document.createElement('div');
            temp.innerHTML = newHtml;
            newElement = temp.firstElementChild;
        } else {
            newElement = newHtml;
        }

        if (parent && oldElement) {
            parent.replaceChild(newElement, oldElement);
        }

        this.element = newElement;
        this.onMount();
    }
}
