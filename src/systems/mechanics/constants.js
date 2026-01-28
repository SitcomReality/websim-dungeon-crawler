/**
 * Tunable parameters for game mechanics
 * Adjust these values to balance the game
 */

// Entropy System
export const ENTROPY_CONFIG = {
    MIN: 0,
    MAX: 100,
    STARTING: 50,
    PASSIVE_REGEN: 8, // Per turn
    LOW_THRESHOLD: 30, // Below this, unstable abilities weaken
    HIGH_THRESHOLD: 70, // Above this, unstable abilities strengthen
    CHAOTIC_THRESHOLD: 90, // Above this, random effects occur
};

// Cooldown System
export const COOLDOWN_CONFIG = {
    MIN_COOLDOWN: 0,
    MAX_COOLDOWN: 3,
    DEFAULT_COOLDOWN: 1,
};

// Domain Momentum System
export const MOMENTUM_CONFIG = {
    MAX_STACKS: 5,
    DAMAGE_BONUS_PER_STACK: 0.15, // 15% per stack
    DECAY_PER_TURN: 1, // Stacks lost when not using that domain
};

// Ability-specific costs (entropy cost by ability ID)
export const ABILITY_ENTROPY_COSTS = {
    // Physical
    'slash': 10,
    'heavy_strike': 25,
    'quick_stab': 8,
    'shoot': 12,
    'execute': 30,
    'riposte': 15,
    'rampage': 20,
    
    // Elemental
    'fireball': 30,
    'lightning_bolt': 28,
    'ice_shard': 26,
    'toxic_cloud': 22,
    'chain_lightning': 35,
    'meteor': 40,
    'drain': 20,
    
    // Psychic
    'mind_blast': 35,
    'confusion': 18,
    'fear': 20,
    'shadow_strike': 24,
    'dominate': 30,
    'nightmare': 25,
    'reflect': 18,
    'rest': 0,
    'guard': 0,
};

// Ability-specific cooldowns
export const ABILITY_COOLDOWNS = {
    // Physical
    'slash': 0,
    'heavy_strike': 2,
    'quick_stab': 0,
    'shoot': 1,
    'execute': 2,
    'riposte': 2,
    'rampage': 1,
    
    // Elemental
    'fireball': 2,
    'lightning_bolt': 2,
    'ice_shard': 1,
    'toxic_cloud': 2,
    'chain_lightning': 3,
    'meteor': 3,
    'drain': 1,
    
    // Psychic
    'mind_blast': 3,
    'confusion': 1,
    'fear': 1,
    'shadow_strike': 2,
    'dominate': 2,
    'nightmare': 2,
    'reflect': 2,
    'rest': 0,
    'guard': 0,
};