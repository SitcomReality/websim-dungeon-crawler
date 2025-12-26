import { gameState } from '../../data/store/StateStore.js';
import { globalBus, EVENTS } from '../../core/events/EventBus.js';

/**
 * Currently just acts as a bridge or listener if we need specific logic 
 * when rooms change (like triggering sounds or analytics).
 * The actual state mutation happens in StateStore.
 */
export class Navigator {
    constructor() {
        globalBus.on(EVENTS.STATE_CHANGED, this._onRoomChange.bind(this));
    }

    _onRoomChange({ roomX, roomY }) {
        // console.log(`Moved to room: ${roomX}, ${roomY}`);
        // Placeholder for future navigation logic (e.g. checking for locked doors)
    }
}