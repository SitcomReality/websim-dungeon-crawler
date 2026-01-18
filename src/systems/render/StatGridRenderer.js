import { CHARACTER_DATA } from '../../data/CharacterData.js';

export class StatGridRenderer {
    constructor(ctx, iconsImage) {
        this.ctx = ctx;
        this.iconsImage = iconsImage;
        this.iconSize = 150; // Size in source image
        // Increase on-canvas icon size for better visibility
        this.drawIconSize = 20;
        this.cellSize = 18;
    }

    /**
     * Draws the 3x3 stat grid for a character
     * @param {number} x Top-left X coordinate of the grid (excluding labels)
     * @param {number} y Top-left Y coordinate of the grid
     * @param {Object} stats The character's stats object
     * @param {Object} highlight { row, col } or null
     */
    draw(x, y, stats, highlight = null) {
        if (!stats) return;

        const types = ['power', 'finesse', 'resistance'];
        const domains = ['physical', 'elemental', 'psychic'];
        const padding = 6;
        
        this.ctx.save();
        
        // 1. Draw row labels (Power, Finesse, Resistance) to the left
        types.forEach((type, i) => {
            const labelX = x - this.drawIconSize - padding;
            const labelY = y + i * this.cellSize + (this.cellSize - this.drawIconSize) / 2;
            this._drawIcon(type, labelX, labelY);
        });

        // 2. Draw column labels (Physical, Elemental, Psychic) below
        domains.forEach((domain, j) => {
            const labelX = x + j * this.cellSize + (this.cellSize - this.drawIconSize) / 2;
            const labelY = y + 3 * this.cellSize + padding;
            this._drawIcon(domain, labelX, labelY);
        });

        // 3. Draw the 3x3 grid cells
        const time = performance.now();
        for (let i = 0; i < 3; i++) { // Rows: types
            for (let j = 0; j < 3; j++) { // Cols: domains
                const val = stats[domains[j]][types[i]];
                const cx = x + j * this.cellSize;
                const cy = y + i * this.cellSize;

                const isHighlighted = highlight && highlight.row === i && highlight.col === j;

                // Background box
                this.ctx.fillStyle = isHighlighted ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.45)';
                this.ctx.fillRect(cx, cy, this.cellSize - 1, this.cellSize - 1);

                // Stat indicator block
                const fillRatio = Math.max(0.18, val / 10);
                let colorAlpha = 0.35 + (fillRatio * 0.6);
                
                if (isHighlighted) {
                    // Pulse highlight alpha
                    const pulse = (Math.sin(time / 180) + 1) / 2;
                    colorAlpha = 0.55 + (pulse * 0.35);
                }

                this.ctx.fillStyle = this._getDomainColor(domains[j], colorAlpha);
                
                const inset = (this.cellSize - 1) * (1 - fillRatio) * 0.5;
                const size = (this.cellSize - 1) - (inset * 2);
                this.ctx.fillRect(cx + inset, cy + inset, size, size);

                // Highlight border
                if (isHighlighted) {
                    const pulseSize = (Math.sin(time / 150) + 1) * 0.45;
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 + pulseSize * 0.45})`;
                    this.ctx.lineWidth = 1.6;
                    this.ctx.strokeRect(cx - 1, cy - 1, this.cellSize + 1, this.cellSize + 1);
                } else {
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                    this.ctx.lineWidth = 0.6;
                    this.ctx.strokeRect(cx, cy, this.cellSize - 1, this.cellSize - 1);
                }
            }
        }

        this.ctx.restore();
    }

    _drawIcon(key, dx, dy) {
        const coords = {
            power: { x: 0, y: 0 },
            finesse: { x: 1, y: 0 },
            resistance: { x: 2, y: 0 },
            physical: { x: 0, y: 1 },
            elemental: { x: 1, y: 1 },
            psychic: { x: 2, y: 1 }
        };
        const pos = coords[key];
        if (!pos) return;

        // Temporarily enable high-quality smoothing for icon rendering so icons scale gracefully
        const prev = {
            imageSmoothingEnabled: this.ctx.imageSmoothingEnabled,
            webkitImageSmoothingEnabled: this.ctx.webkitImageSmoothingEnabled,
            mozImageSmoothingEnabled: this.ctx.mozImageSmoothingEnabled,
            msImageSmoothingEnabled: this.ctx.msImageSmoothingEnabled,
            imageSmoothingQuality: this.ctx.imageSmoothingQuality
        };

        try {
            if (typeof this.ctx.imageSmoothingEnabled !== 'undefined') this.ctx.imageSmoothingEnabled = true;
            if (typeof this.ctx.webkitImageSmoothingEnabled !== 'undefined') this.ctx.webkitImageSmoothingEnabled = true;
            if (typeof this.ctx.mozImageSmoothingEnabled !== 'undefined') this.ctx.mozImageSmoothingEnabled = true;
            if (typeof this.ctx.msImageSmoothingEnabled !== 'undefined') this.ctx.msImageSmoothingEnabled = true;
            if (typeof this.ctx.imageSmoothingQuality !== 'undefined') this.ctx.imageSmoothingQuality = 'high';

            this.ctx.drawImage(
                this.iconsImage,
                pos.x * this.iconSize, pos.y * this.iconSize, this.iconSize, this.iconSize,
                Math.round(dx), Math.round(dy), this.drawIconSize, this.drawIconSize
            );
        } finally {
            // Restore previous smoothing settings
            if (typeof prev.imageSmoothingEnabled !== 'undefined') this.ctx.imageSmoothingEnabled = prev.imageSmoothingEnabled;
            if (typeof prev.webkitImageSmoothingEnabled !== 'undefined') this.ctx.webkitImageSmoothingEnabled = prev.webkitImageSmoothingEnabled;
            if (typeof prev.mozImageSmoothingEnabled !== 'undefined') this.ctx.mozImageSmoothingEnabled = prev.mozImageSmoothingEnabled;
            if (typeof prev.msImageSmoothingEnabled !== 'undefined') this.ctx.msImageSmoothingEnabled = prev.msImageSmoothingEnabled;
            if (typeof prev.imageSmoothingQuality !== 'undefined') this.ctx.imageSmoothingQuality = prev.imageSmoothingQuality;
        }
    }

    _getDomainColor(domain, alpha) {
        if (domain === 'physical') return `rgba(205, 92, 92, ${alpha})`;
        if (domain === 'elemental') return `rgba(70, 130, 180, ${alpha})`;
        if (domain === 'psychic') return `rgba(147, 112, 219, ${alpha})`;
        return `rgba(255, 255, 255, ${alpha})`;
    }
}