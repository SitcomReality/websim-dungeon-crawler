import { EventEmitter } from 'events';

class EventBus extends EventEmitter {}

export const globalBus = new EventBus();

// Event Constants
export const EVENTS = {
    NAVIGATE: 'NAVIGATE', // payload: { direction: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' }
    STATE_CHANGED: 'STATE_CHANGED', // payload: { roomX, roomY }
    ASSETS_LOADED: 'ASSETS_LOADED',
    TICK: 'TICK'
};