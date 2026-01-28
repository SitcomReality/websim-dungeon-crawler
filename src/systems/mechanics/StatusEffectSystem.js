/**
 * Status Effect System
 * Manages active status effects on combatants
 */

export const STATUS_EFFECTS = {
    // Elemental effects
    BURNING: {
        id: 'burning',
        name: 'Burning',
        icon: '🔥',
        color: '#ff4400',
        duration: 3,
        onTurnEnd: (target, battleManager) => {
            // DoT damage
            return { damage: 3 };
        }
    },
    FROZEN: {
        id: 'frozen',
        name: 'Frozen',
        icon: '❄️',
        color: '#00ffff',
        duration: 2,
        modifyStats: (stats) => {
            // Reduce finesse
            return { finesse: -2 };
        },
        lockDomain: 'elemental'
    },
    POISONED: {
        id: 'poisoned',
        name: 'Poisoned',
        icon: '☠️',
        color: '#00ff00',
        duration: 4,
        onTurnEnd: (target, battleManager) => {
            return { damage: 2 };
        }
    },
    SHOCKED: {
        id: 'shocked',
        name: 'Shocked',
        icon: '⚡',
        color: '#ffff00',
        duration: 2,
        modifyDamage: (damage, ability) => {
            if (ability.domain === 'physical') {
                return damage * 1.3; // 30% bonus from physical
            }
            return damage;
        }
    },
    
    // Psychic effects
    FEARED: {
        id: 'feared',
        name: 'Feared',
        icon: '😱',
        color: '#ff00ff',
        duration: 2,
        modifyDamage: (damage, ability) => {
            if (ability.damageType === 'power') {
                return damage * 0.7; // 30% reduction to power attacks
            }
            return damage;
        }
    },
    CONFUSED: {
        id: 'confused',
        name: 'Confused',
        icon: '😵',
        color: '#ff88ff',
        duration: 2,
        lockDomain: 'psychic'
    },
    
    // Physical effects
    WEAKENED: {
        id: 'weakened',
        name: 'Weakened',
        icon: '💔',
        color: '#ff8888',
        duration: 3,
        modifyDamage: (damage) => damage * 0.8 // 20% reduction to all damage
    },
    
    // Universal debuff
    VULNERABLE: {
        id: 'vulnerable',
        name: 'Vulnerable',
        icon: '🎯',
        color: '#ffaa00',
        duration: 2,
        modifyIncomingDamage: (damage) => damage * 1.25 // Takes 25% more damage
    },
    
    // Buffs
    STRENGTHENED: {
        id: 'strengthened',
        name: 'Strengthened',
        icon: '💪',
        color: '#44ff88',
        duration: 2,
        modifyDamage: (damage) => damage * 1.2
    },
    FORTIFIED: {
        id: 'fortified',
        name: 'Fortified',
        icon: '🛡️',
        color: '#88ccff',
        duration: 2,
        modifyIncomingDamage: (damage) => damage * 0.75
    },
    ENRAGED: {
        id: 'enraged',
        name: 'Enraged',
        icon: '😡',
        color: '#ff4444',
        duration: 3,
        modifyDamage: (damage) => damage * 1.4, // 40% bonus
        modifyIncomingDamage: (damage) => damage * 1.2 // Takes 20% more
    },
    RIPOSTE: {
        id: 'riposte',
        name: 'Riposte',
        icon: '⚔️',
        color: '#ffaa00',
        duration: 1,
        counterDamage: 5 // Flat counter damage
    },
    REFLECT: {
        id: 'reflect',
        name: 'Reflect',
        icon: '🪞',
        color: '#aaffff',
        duration: 2,
        reflectPercent: 0.5 // Reflects 50% of damage
    },
    DOMINATED: {
        id: 'dominated',
        name: 'Dominated',
        icon: '🎭',
        color: '#ff66ff',
        duration: 2,
        modifyDamage: (damage) => damage * 0.5 // 50% reduction
    },
    NIGHTMARES: {
        id: 'nightmares',
        name: 'Nightmares',
        icon: '💀',
        color: '#9900ff',
        duration: 4,
        onTurnEnd: (target, battleManager) => {
            return { damage: 4 };
        }
    },
    STUNNED: {
        id: 'stunned',
        name: 'Stunned',
        icon: '💫',
        color: '#ffff00',
        duration: 1,
        skipTurn: true
    }
};

export class StatusEffectSystem {
    constructor() {
        this.playerEffects = [];
        this.opponentEffects = [];
    }

    /**
     * Add a status effect to a target
     */
    addEffect(target, effectId, stacks = 1) {
        const effects = target === 'PLAYER' ? this.playerEffects : this.opponentEffects;
        const effectDef = STATUS_EFFECTS[effectId];
        if (!effectDef) return;

        // Check if effect already exists
        const existing = effects.find(e => e.id === effectId);
        if (existing) {
            // Refresh duration and add stacks
            existing.duration = effectDef.duration;
            existing.stacks = Math.min((existing.stacks || 1) + stacks, 3);
        } else {
            effects.push({
                ...effectDef,
                stacks: stacks,
                turnsRemaining: effectDef.duration
            });
        }
    }

    /**
     * Get all active effects for a target
     */
    getEffects(target) {
        return target === 'PLAYER' ? [...this.playerEffects] : [...this.opponentEffects];
    }

    /**
     * Check if target has a specific effect
     */
    hasEffect(target, effectId) {
        const effects = target === 'PLAYER' ? this.playerEffects : this.opponentEffects;
        return effects.some(e => e.id === effectId);
    }

    /**
     * Check if a domain is locked for the target
     */
    isDomainLocked(target, domain) {
        const effects = target === 'PLAYER' ? this.playerEffects : this.opponentEffects;
        return effects.some(e => e.lockDomain === domain);
    }

    /**
     * Apply stat modifications from effects
     */
    modifyStats(target, stats) {
        const effects = target === 'PLAYER' ? this.playerEffects : this.opponentEffects;
        let modified = { ...stats };
        
        effects.forEach(effect => {
            if (effect.modifyStats) {
                const mods = effect.modifyStats(modified);
                for (const key in mods) {
                    if (typeof modified[key] === 'number') {
                        modified[key] += mods[key];
                    }
                }
            }
        });
        
        return modified;
    }

    /**
     * Apply damage modifications from effects
     */
    modifyOutgoingDamage(attacker, damage, ability) {
        const effects = attacker === 'PLAYER' ? this.playerEffects : this.opponentEffects;
        let modified = damage;
        
        effects.forEach(effect => {
            if (effect.modifyDamage) {
                modified = effect.modifyDamage(modified, ability);
            }
        });
        
        return modified;
    }

    /**
     * Apply incoming damage modifications from effects
     */
    modifyIncomingDamage(defender, damage) {
        const effects = defender === 'PLAYER' ? this.playerEffects : this.opponentEffects;
        let modified = damage;
        
        effects.forEach(effect => {
            if (effect.modifyIncomingDamage) {
                modified = effect.modifyIncomingDamage(modified);
            }
        });
        
        return modified;
    }

    /**
     * Process end-of-turn effects (DoTs, etc)
     */
    processTurnEnd(target, battleManager) {
        const effects = target === 'PLAYER' ? this.playerEffects : this.opponentEffects;
        const results = [];
        
        effects.forEach(effect => {
            if (effect.onTurnEnd) {
                const result = effect.onTurnEnd(target, battleManager);
                if (result.damage) {
                    results.push({ type: 'damage', amount: result.damage, source: effect.name });
                }
            }
            
            // Decrement duration
            effect.turnsRemaining--;
        });
        
        // Remove expired effects
        const filtered = effects.filter(e => e.turnsRemaining > 0);
        if (target === 'PLAYER') {
            this.playerEffects = filtered;
        } else {
            this.opponentEffects = filtered;
        }
        
        return results;
    }

    /**
     * Reset all effects
     */
    reset() {
        this.playerEffects = [];
        this.opponentEffects = [];
    }
}