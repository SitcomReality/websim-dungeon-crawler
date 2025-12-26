import { globalBus, EVENTS } from '../events/EventBus.js';

export class GameLoop {
    constructor() {
        this.running = false;
        this.lastTime = 0;
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this._loop.bind(this));
    }

    stop() {
        this.running = false;
    }

    _loop(timestamp) {
        if (!this.running) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        globalBus.emit(EVENTS.TICK, { deltaTime, timestamp });

        requestAnimationFrame(this._loop.bind(this));
    }
}