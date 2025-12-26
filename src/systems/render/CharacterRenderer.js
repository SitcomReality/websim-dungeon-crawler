import { SPRITE_SIZE } from '../../config/dimensions.js';
import { CHARACTER_DATA } from '../../data/CharacterData.js';

export class CharacterRenderer {
    constructor(ctx, spritesheet) {
        this.ctx = ctx;
        this.spritesheet = spritesheet;
    }

    /**
     * Draws a character based on their index in the CHARACTER_DATA array
     * at the provided x,y (top-left of the sprite).
     * Options:
     *  - flipped: mirror horizontally
     *  - scale: multiplier for sprite size (1 = full size)
     *
     * Temporarily enables image smoothing and raises quality so scaled
     * character sprites appear smoother, then restores previous settings.
     */
    drawCharacter(index, x, y, { flipped = false, scale = 1 } = {}) {
        const char = CHARACTER_DATA[index];
        if (!char) return;

        const sx = char.gridX * SPRITE_SIZE;
        const sy = char.gridY * SPRITE_SIZE;
        const dw = Math.round(SPRITE_SIZE * scale);
        const dh = Math.round(SPRITE_SIZE * scale);

        // Save previous smoothing settings (may be undefined on some browsers)
        const prev = {
            imageSmoothingEnabled: this.ctx.imageSmoothingEnabled,
            webkitImageSmoothingEnabled: this.ctx.webkitImageSmoothingEnabled,
            mozImageSmoothingEnabled: this.ctx.mozImageSmoothingEnabled,
            msImageSmoothingEnabled: this.ctx.msImageSmoothingEnabled,
            imageSmoothingQuality: this.ctx.imageSmoothingQuality
        };

        // Enable smoothing for character rendering and prefer high quality
        try {
            if (typeof this.ctx.imageSmoothingEnabled !== 'undefined') this.ctx.imageSmoothingEnabled = true;
            if (typeof this.ctx.webkitImageSmoothingEnabled !== 'undefined') this.ctx.webkitImageSmoothingEnabled = true;
            if (typeof this.ctx.mozImageSmoothingEnabled !== 'undefined') this.ctx.mozImageSmoothingEnabled = true;
            if (typeof this.ctx.msImageSmoothingEnabled !== 'undefined') this.ctx.msImageSmoothingEnabled = true;
            if (typeof this.ctx.imageSmoothingQuality !== 'undefined') this.ctx.imageSmoothingQuality = 'high';

            if (!flipped) {
                this.ctx.drawImage(
                    this.spritesheet,
                    sx, sy, SPRITE_SIZE, SPRITE_SIZE,
                    x, y, dw, dh
                );
                return;
            }

            // Draw horizontally flipped around the destination rectangle
            this.ctx.save();
            // Translate to the right edge of the destination, then flip
            this.ctx.translate(x + dw, y);
            this.ctx.scale(-1, 1);

            this.ctx.drawImage(
                this.spritesheet,
                sx, sy, SPRITE_SIZE, SPRITE_SIZE,
                0, 0, dw, dh
            );

            this.ctx.restore();
        } finally {
            // Restore previous smoothing settings
            if (typeof prev.imageSmoothingEnabled !== 'undefined') this.ctx.imageSmoothingEnabled = prev.imageSmoothingEnabled;
            if (typeof prev.webkitImageSmoothingEnabled !== 'undefined') this.ctx.webkitImageSmoothingEnabled = prev.webkitImageSmoothingEnabled;
            if (typeof prev.mozImageSmoothingEnabled !== 'undefined') this.ctx.mozImageSmoothingEnabled = prev.mozImageSmoothingEnabled;
            if (typeof prev.msImageSmoothingEnabled !== 'undefined') this.ctx.msImageSmoothingEnabled = prev.msImageSmoothingEnabled;
            if (typeof prev.imageSmoothingQuality !== 'undefined') this.ctx.imageSmoothingQuality = prev.imageSmoothingQuality;
        }
    }
}