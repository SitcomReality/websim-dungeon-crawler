import { globalBus, EVENTS } from '../../core/events/EventBus.js';
import { GRID_COLS, GRID_ROWS } from '../../config/dimensions.js';

class StateStore {
    constructor() {
        this.state = {
            roomX: 0,
            roomY: 0
        };

        this._setupListeners();
    }

    _setupListeners() {
        globalBus.on(EVENTS.NAVIGATE, this._handleNavigation.bind(this));
    }

    _handleNavigation({ direction }) {
        let { roomX, roomY } = this.state;

        switch (direction) {
            case 'NORTH':
                roomY = (roomY - 1 + GRID_ROWS) % GRID_ROWS;
                break;
            case 'SOUTH':
                roomY = (roomY + 1) % GRID_ROWS;
                break;
            case 'WEST':
                roomX = (roomX - 1 + GRID_COLS) % GRID_COLS;
                break;
            case 'EAST':
                roomX = (roomX + 1) % GRID_COLS;
                break;
        }

        this.updateState({ roomX, roomY });
    }

    updateState(newState) {
        this.state = { ...this.state, ...newState };
        globalBus.emit(EVENTS.STATE_CHANGED, this.state);
    }

    getState() {
        return { ...this.state };
    }
}

export const gameState = new StateStore();