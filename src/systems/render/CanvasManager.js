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
        // Setting CSS width to 100% and height to auto scales the canvas visually
        this.canvas.style.width = '100%';
        this.canvas.style.height = 'auto';
    }

    get context() {
        return this.ctx;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}