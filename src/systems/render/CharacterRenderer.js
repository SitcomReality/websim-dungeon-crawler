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
     * If flipped is true, the sprite is mirrored horizontally.
     */
    drawCharacter(index, x, y, { flipped = false } = {}) {
        const char = CHARACTER_DATA[index];
        if (!char) return;

        const sx = char.gridX * SPRITE_SIZE;
        const sy = char.gridY * SPRITE_SIZE;

        if (!flipped) {
            this.ctx.drawImage(
                this.spritesheet,
                sx, sy, SPRITE_SIZE, SPRITE_SIZE,
                x, y, SPRITE_SIZE, SPRITE_SIZE
            );
            return;
        }

        // Draw horizontally flipped
        this.ctx.save();
        // Translate so that the flip happens around the left edge of where we want to draw
        this.ctx.translate(x + SPRITE_SIZE, y);
        this.ctx.scale(-1, 1);

        this.ctx.drawImage(
            this.spritesheet,
            sx, sy, SPRITE_SIZE, SPRITE_SIZE,
            0, 0, SPRITE_SIZE, SPRITE_SIZE
        );

        this.ctx.restore();
    }
}