import { MOMENTUM_CONFIG } from './constants.js';

export class MomentumSystem {
    constructor() {
        this.stacks = {
            physical: 0,
            elemental: 0,
            psychic: 0
        };
    }

    /**
     * Get stacks for a domain
     */
    getStacks(domain) {
        return this.stacks[domain] || 0;
    }

    /**
     * Add momentum to a domain
     * @param {number} decayMultiplier - Multiplier for decay (from upgrades)
     */
    addMomentum(domain, decayMultiplier = 1.0) {
        this.stacks[domain] = Math.min(
            MOMENTUM_CONFIG.MAX_STACKS,
            (this.stacks[domain] || 0) + 1
        );
        
        // Decay other domains
        const decay = MOMENTUM_CONFIG.DECAY_PER_TURN * decayMultiplier;
        for (const d in this.stacks) {
            if (d !== domain) {
                this.stacks[d] = Math.max(0, this.stacks[d] - decay);
            }
        }
    }

    /**
     * Get damage multiplier for a domain based on momentum
     */
    getDamageMultiplier(domain) {
        const stacks = this.getStacks(domain);
        return 1.0 + (stacks * MOMENTUM_CONFIG.DAMAGE_BONUS_PER_STACK);
    }

    /**
     * Reset all momentum
     */
    reset() {
        this.stacks = {
            physical: 0,
            elemental: 0,
            psychic: 0
        };
    }
}