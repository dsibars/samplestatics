import { Component } from './Component.js';

export class View extends Component {
    constructor(props = {}) {
        super(props);
        this.isMobile = window.innerHeight > window.innerWidth;
        this._resizeHandler = this._handleResize.bind(this);
        this._hasResizeListener = false;
    }

    onMount() {
        if (!this._hasResizeListener) {
            window.addEventListener('resize', this._resizeHandler);
            this._hasResizeListener = true;
        }
    }

    _handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerHeight > window.innerWidth;
        if (wasMobile !== this.isMobile) {
            this.update();
        }
    }

    destroy() {
        window.removeEventListener('resize', this._resizeHandler);
    }
}
