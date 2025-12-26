import { ROOM_WIDTH, ROOM_HEIGHT } from '../../config/dimensions.js';

export class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this._resize();
        
        window.addEventListener('resize', () => this._resize());
    }

    _resize() {
        // Keep internal resolution fixed for crisp pixel-art rendering
        this.canvas.width = ROOM_WIDTH;
        this.canvas.height = ROOM_HEIGHT;

        // Make the canvas fill the full available width while preserving aspect ratio
        this.canvas.style.width = '100%';
        this.canvas.style.height = 'auto';

        // Explicitly disable image smoothing for the canvas context
        // This ensures the browser doesn't try to blur pixels when drawing
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
    }

    get context() {
        return this.ctx;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}