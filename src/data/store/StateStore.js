import { globalBus, EVENTS } from '../../core/events/EventBus.js';
import { GRID_COLS, GRID_ROWS } from '../../config/dimensions.js';
import { CHARACTER_DATA } from '../CharacterData.js';

class StateStore {
    constructor() {
        this.state = {
            // Map / room state
            roomX: 0,
            roomY: 0,
            roomHistory: [], // Last 4 rooms to avoid repetition

            // High-level mode: MENU, BATTLE, or UPGRADE
            mode: 'MENU',
            
            // Battle State
            turn: 'PLAYER', // 'PLAYER', 'OPPONENT', 'BUSY', 'VICTORY', 'DEFEAT'

            // Progression
            battleCount: 0,
            highestStreak: 0,

            // Battle participants
            playerCharacterIndex: null,
            opponentCharacterIndex: null,
            playerHP: 0,
            opponentHP: 0,
            maxHP: 100,
            
            // Player upgrades/modifiers
            statBoosts: { physical: 0, elemental: 0, psychic: 0 }, // Additive stat boosts
            damageMultiplier: 1.0,
            maxHPBonus: 0,
            unlockedAbilities: [], // Additional abilities unlocked during run
            fateThreads: 0, // Reroll resources
            victoryThreshold: 20, // Battles to win

            // Highlighting for stats
            selectedAbilityId: null, // For player's hover/selection
            executingAbilityId: null, // During animation
            executingAttacker: null,  // 'PLAYER' or 'OPPONENT'
            playerGuarding: false,   // Damage reduction flag
            
            // Opponent Intent (Telegraphed to player)
            opponentIntent: null // { abilityId, predictedDamage }
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
        const nextRoomIndex = this._getRandomRoomIndex([], totalRooms);

        const roomX = nextRoomIndex % GRID_COLS;
        const roomY = Math.floor(nextRoomIndex / GRID_COLS);

        const opponentIndex = this._getRandomOpponentIndex(characterIndex);

        this.updateState({
            mode: 'BATTLE',
            turn: 'PLAYER',
            roomX,
            roomY,
            roomHistory: [nextRoomIndex],
            battleCount: 1,
            highestStreak: 0,
            playerCharacterIndex: characterIndex,
            opponentCharacterIndex: opponentIndex,
            playerHP: 100,
            opponentHP: 100,
            maxHP: 100,
            statBoosts: { physical: 0, elemental: 0, psychic: 0 },
            damageMultiplier: 1.0,
            maxHPBonus: 0,
            unlockedAbilities: [],
            fateThreads: 0,
            victoryThreshold: 20
        });
    }

    _getRandomRoomIndex(roomHistory, totalRooms) {
        if (totalRooms <= 1) return 0;
        let idx;
        let attempts = 0;
        do {
            idx = Math.floor(Math.random() * totalRooms);
            attempts++;
            // Fallback after many attempts to avoid infinite loop
            if (attempts > 100) break;
        } while (roomHistory.includes(idx));
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
        let changed = false;
        for (const key in newState) {
            if (this.state[key] !== newState[key]) {
                changed = true;
                break;
            }
        }
        
        if (!changed) return;

        this.state = { ...this.state, ...newState };
        globalBus.emit(EVENTS.STATE_CHANGED, this.state);
    }

    getState() {
        return { ...this.state };
    }
}

export const gameState = new StateStore();