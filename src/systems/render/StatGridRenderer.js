import { CHARACTER_DATA } from '../../data/CharacterData.js';

export class StatGridRenderer {
    constructor(ctx, iconsImage) {
        this.ctx = ctx;
        this.iconsImage = iconsImage;
        this.iconSize = 150; // Size in source image
        this.drawIconSize = 12;
        this.cellSize = 14;
    }

    /**
     * Draws the 3x3 stat grid for a character
     * @param {number} x Top-left X coordinate of the grid (excluding labels)
     * @param {number} y Top-left Y coordinate of the grid
     * @param {Object} stats The character's stats object
     */
    draw(x, y, stats) {
        if (!stats) return;

        const types = ['power', 'finesse', 'resistance'];
        const domains = ['physical', 'elemental', 'psychic'];
        const padding = 4;
        
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
        for (let i = 0; i < 3; i++) { // Rows: types
            for (let j = 0; j < 3; j++) { // Cols: domains
                const val = stats[domains[j]][types[i]];
                const cx = x + j * this.cellSize;
                const cy = y + i * this.cellSize;

                // Background box
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                this.ctx.fillRect(cx, cy, this.cellSize - 1, this.cellSize - 1);

                // Stat indicator block
                // Scale block size based on value (1-10)
                const fillRatio = Math.max(0.2, val / 10);
                const colorAlpha = 0.4 + (fillRatio * 0.6);
                this.ctx.fillStyle = this._getDomainColor(domains[j], colorAlpha);
                
                const inset = (this.cellSize - 1) * (1 - fillRatio) * 0.5;
                const size = (this.cellSize - 1) - (inset * 2);
                this.ctx.fillRect(cx + inset, cy + inset, size, size);

                // Optional: thin border for the cell
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.lineWidth = 0.5;
                this.ctx.strokeRect(cx, cy, this.cellSize - 1, this.cellSize - 1);
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

        this.ctx.drawImage(
            this.iconsImage,
            pos.x * this.iconSize, pos.y * this.iconSize, this.iconSize, this.iconSize,
            dx, dy, this.drawIconSize, this.drawIconSize
        );
    }

    _getDomainColor(domain, alpha) {
        if (domain === 'physical') return `rgba(205, 92, 92, ${alpha})`;
        if (domain === 'elemental') return `rgba(70, 130, 180, ${alpha})`;
        if (domain === 'psychic') return `rgba(147, 112, 219, ${alpha})`;
        return `rgba(255, 255, 255, ${alpha})`;
    }
}