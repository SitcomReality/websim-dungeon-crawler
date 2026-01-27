import { ABILITY_COOLDOWNS, COOLDOWN_CONFIG } from './constants.js';

export class CooldownSystem {
    constructor() {
        this.cooldowns = {}; // abilityId -> turns remaining
    }

    /**
     * Check if ability is ready to use
     */
    isReady(abilityId) {
        return !this.cooldowns[abilityId] || this.cooldowns[abilityId] <= 0;
    }

    /**
     * Get remaining cooldown turns for an ability
     */
    getRemaining(abilityId) {
        return this.cooldowns[abilityId] || 0;
    }

    /**
     * Trigger cooldown for an ability
     */
    trigger(abilityId) {
        const cooldownTurns = ABILITY_COOLDOWNS[abilityId] || COOLDOWN_CONFIG.DEFAULT_COOLDOWN;
        this.cooldowns[abilityId] = cooldownTurns;
    }

    /**
     * Tick all cooldowns down by 1 turn
     */
    tick() {
        for (const abilityId in this.cooldowns) {
            if (this.cooldowns[abilityId] > 0) {
                this.cooldowns[abilityId]--;
            }
        }
    }

    /**
     * Reset all cooldowns
     */
    reset() {
        this.cooldowns = {};
    }
}