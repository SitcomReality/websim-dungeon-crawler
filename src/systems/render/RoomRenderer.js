import { ROOM_WIDTH, ROOM_HEIGHT } from '../../config/dimensions.js';

export class RoomRenderer {
    constructor(ctx, spritesheet) {
        this.ctx = ctx;
        this.spritesheet = spritesheet;
    }

    draw(roomX, roomY) {
        const sx = roomX * ROOM_WIDTH;
        const sy = roomY * ROOM_HEIGHT;

        this.ctx.drawImage(
            this.spritesheet,
            sx, sy, ROOM_WIDTH, ROOM_HEIGHT, // Source
            0, 0, ROOM_WIDTH, ROOM_HEIGHT    // Destination
        );
    }
}