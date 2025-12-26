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
     */
    drawCharacter(index, x, y, { flipped = false, scale = 1 } = {}) {
        const char = CHARACTER_DATA[index];
        if (!char) return;

        const sx = char.gridX * SPRITE_SIZE;
        const sy = char.gridY * SPRITE_SIZE;
        const dw = Math.round(SPRITE_SIZE * scale);
        const dh = Math.round(SPRITE_SIZE * scale);

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
    }
}