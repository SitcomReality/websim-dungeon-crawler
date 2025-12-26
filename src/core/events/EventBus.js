import { EventEmitter } from 'events';

class EventBus extends EventEmitter {}

export const globalBus = new EventBus();

// Event Constants
export const EVENTS = {
    NAVIGATE: 'NAVIGATE', // payload: { direction: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' }
    STATE_CHANGED: 'STATE_CHANGED', // payload: full game state
    ASSETS_LOADED: 'ASSETS_LOADED',
    TICK: 'TICK',
    NEW_GAME: 'NEW_GAME', // payload: { characterIndex }
    PLAYER_ACTION: 'PLAYER_ACTION' // payload: { abilityId }
};