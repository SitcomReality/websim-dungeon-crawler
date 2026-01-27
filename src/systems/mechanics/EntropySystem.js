import { ENTROPY_CONFIG } from './constants.js';

export class EntropySystem {
    constructor() {
        this.current = ENTROPY_CONFIG.STARTING;
    }

    /**
     * Get current entropy value
     */
    get value() {
        return this.current;
    }

    /**
     * Check if entropy is in chaotic range
     */
    get isChaotic() {
        return this.current >= ENTROPY_CONFIG.CHAOTIC_THRESHOLD;
    }

    /**
     * Check if entropy is high
     */
    get isHigh() {
        return this.current >= ENTROPY_CONFIG.HIGH_THRESHOLD;
    }

    /**
     * Check if entropy is low
     */
    get isLow() {
        return this.current <= ENTROPY_CONFIG.LOW_THRESHOLD;
    }

    /**
     * Consume entropy for an ability
     */
    consume(amount) {
        const available = this.current;
        this.current = Math.max(ENTROPY_CONFIG.MIN, this.current - amount);
        return available >= amount; // Return true if had enough
    }

    /**
     * Add entropy
     */
    add(amount) {
        this.current = Math.min(ENTROPY_CONFIG.MAX, this.current + amount);
    }

    /**
     * Passive regeneration each turn
     */
    regenerate() {
        this.add(ENTROPY_CONFIG.PASSIVE_REGEN);
    }

    /**
     * Get damage multiplier based on entropy state
     */
    getDamageMultiplier() {
        if (this.isChaotic) {
            // Chaotic range: 0.8 to 1.4 (random)
            return 0.8 + Math.random() * 0.6;
        } else if (this.isHigh) {
            return 1.2; // 20% bonus
        } else if (this.isLow) {
            return 0.85; // 15% penalty
        }
        return 1.0; // Normal
    }

    /**
     * Reset to starting value
     */
    reset() {
        this.current = ENTROPY_CONFIG.STARTING;
    }
}