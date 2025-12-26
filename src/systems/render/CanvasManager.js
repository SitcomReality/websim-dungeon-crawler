import { ROOM_WIDTH, ROOM_HEIGHT } from '../../config/dimensions.js';

export class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this._resize();
        
        window.addEventListener('resize', () => this._resize());
    }

    _resize() {
        // We want to maintain aspect ratio but fill as much as possible
        const aspect = ROOM_WIDTH / ROOM_HEIGHT;
        const windowW = window.innerWidth;
        const windowH = window.innerHeight;
        const windowAspect = windowW / windowH;

        let finalWidth, finalHeight;

        if (windowAspect > aspect) {
            // Window is wider than image, fit to height
            finalHeight = windowH;
            finalWidth = finalHeight * aspect;
        } else {
            // Window is taller than image, fit to width
            finalWidth = windowW;
            finalHeight = finalWidth / aspect;
        }

        // Set internal resolution to match texture resolution for crispness
        // Or set it to display resolution?
        // For pixel art, best to set internal resolution to logical size (ROOM_WIDTH/HEIGHT)
        // and let CSS handle the scaling with image-rendering: pixelated
        
        this.canvas.width = ROOM_WIDTH;
        this.canvas.height = ROOM_HEIGHT;

        // The CSS layout.css handles the visual sizing
    }

    get context() {
        return this.ctx;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}