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

        // Reset any temporary room state if needed here
        
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
        // Compute which character is in this room based on fixed logic for now
        const roomIndex = this.state.roomY * GRID_COLS + this.state.roomX;
        // There are 16 characters and 24 rooms. Some rooms will be empty or repeat.
        const characterIndex = roomIndex < 16 ? roomIndex : -1;

        return { 
            ...this.state,
            characterIndex
        };
    }
}

export const gameState = new StateStore();