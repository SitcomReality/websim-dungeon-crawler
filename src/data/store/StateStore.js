import { globalBus, EVENTS } from '../../core/events/EventBus.js';
import { GRID_COLS, GRID_ROWS } from '../../config/dimensions.js';
import { CHARACTER_DATA } from '../CharacterData.js';

class StateStore {
    constructor() {
        this.state = {
            // Map / room state
            roomX: 0,
            roomY: 0,
            previousRoomIndex: null,

            // High-level mode: MENU or BATTLE
            mode: 'MENU',
            
            // Battle State
            turn: 'PLAYER', // 'PLAYER', 'OPPONENT', 'BUSY', 'VICTORY', 'DEFEAT'

            // Battle participants
            playerCharacterIndex: null,
            opponentCharacterIndex: null,
            playerHP: 0,
            opponentHP: 0,
            maxHP: 100,

            // Highlighting for stats
            selectedAbilityId: null, // For player's hover/selection
            executingAbilityId: null, // During animation
            executingAttacker: null   // 'PLAYER' or 'OPPONENT'
        };

        this._setupListeners();
    }

    _setupListeners() {
        globalBus.on(EVENTS.NAVIGATE, this._handleNavigation.bind(this));
        globalBus.on(EVENTS.NEW_GAME, this._handleNewGame.bind(this));
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

    _handleNewGame({ characterIndex }) {
        const totalRooms = GRID_COLS * GRID_ROWS;
        const nextRoomIndex = this._getRandomRoomIndex(this.state.previousRoomIndex, totalRooms);

        const roomX = nextRoomIndex % GRID_COLS;
        const roomY = Math.floor(nextRoomIndex / GRID_COLS);

        const opponentIndex = this._getRandomOpponentIndex(characterIndex);

        this.updateState({
            mode: 'BATTLE',
            turn: 'PLAYER',
            roomX,
            roomY,
            previousRoomIndex: nextRoomIndex,
            playerCharacterIndex: characterIndex,
            opponentCharacterIndex: opponentIndex,
            playerHP: 100,
            opponentHP: 100,
            maxHP: 100
        });
    }

    _getRandomRoomIndex(previousIndex, totalRooms) {
        if (totalRooms <= 1) return 0;
        let idx;
        do {
            idx = Math.floor(Math.random() * totalRooms);
        } while (idx === previousIndex);
        return idx;
    }

    _getRandomOpponentIndex(playerIndex) {
        const totalChars = CHARACTER_DATA.length;
        if (totalChars <= 1) return playerIndex;
        let idx;
        do {
            idx = Math.floor(Math.random() * totalChars);
        } while (idx === playerIndex);
        return idx;
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