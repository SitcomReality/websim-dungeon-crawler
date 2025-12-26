export class HealthBarRenderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    drawBar(x, y, width, height, current, max) {
        const ratio = Math.max(0, Math.min(1, current / max));

        // Background
        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.fillRect(x - 1, y - 1, width + 2, height + 2);

        // Border
        this.ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);

        // Fill
        const green = ratio > 0.5 ? 200 : 120;
        const red = ratio < 0.3 ? 200 : 80;
        this.ctx.fillStyle = `rgb(${red},${green},80)`;
        this.ctx.fillRect(x, y, width * ratio, height);
    }
}