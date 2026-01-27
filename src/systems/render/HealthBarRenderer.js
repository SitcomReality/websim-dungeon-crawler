export class HealthBarRenderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    drawBar(x, y, width, height, current, max, predictedDamage = 0) {
        const ratio = Math.max(0, Math.min(1, current / max));
        const damageRatio = Math.max(0, Math.min(ratio, predictedDamage / max));

        // Background
        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.fillRect(x - 1, y - 1, width + 2, height + 2);

        // Border
        this.ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);

        // Predicted Damage Chunk (Flashing red)
        if (predictedDamage > 0) {
            const pulse = (Math.sin(performance.now() / 100) + 1) / 2;
            this.ctx.fillStyle = `rgba(255, 50, 50, ${0.4 + pulse * 0.4})`;
            const fillWidth = width * ratio;
            const predWidth = width * damageRatio;
            this.ctx.fillRect(x + fillWidth - predWidth, y, predWidth, height);
        }

        // Current Health Fill
        const remainingRatio = ratio - damageRatio;
        const green = ratio > 0.5 ? 200 : 120;
        const red = ratio < 0.3 ? 200 : 80;
        this.ctx.fillStyle = `rgb(${red},${green},80)`;
        this.ctx.fillRect(x, y, width * remainingRatio, height);
    }
}