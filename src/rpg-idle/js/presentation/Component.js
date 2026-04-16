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
