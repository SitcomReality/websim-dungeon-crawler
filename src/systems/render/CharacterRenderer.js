import { SPRITE_SIZE, ROOM_WIDTH, ROOM_HEIGHT } from '../../config/dimensions.js';
import { CHARACTER_DATA } from '../../data/CharacterData.js';

export class CharacterRenderer {
    constructor(ctx, spritesheet) {
        this.ctx = ctx;
        this.spritesheet = spritesheet;
    }

    /**
     * Draws a character based on their index in the CHARACTER_DATA array
     */
    drawCharacter(index, x, y) {
        const char = CHARACTER_DATA[index];
        if (!char) return;

        const sx = char.gridX * SPRITE_SIZE;
        const sy = char.gridY * SPRITE_SIZE;

        // Draw centered horizontally, sitting on the bottom
        // Character is 256x256, Room is 384x256
        const dx = (ROOM_WIDTH - SPRITE_SIZE) / 2 + x;
        const dy = (ROOM_HEIGHT - SPRITE_SIZE) + y;

        this.ctx.drawImage(
            this.spritesheet,
            sx, sy, SPRITE_SIZE, SPRITE_SIZE,
            dx, dy, SPRITE_SIZE, SPRITE_SIZE
        );
    }
}