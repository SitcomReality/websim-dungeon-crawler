/**
 * Universal ability pool - all available abilities in the game.
 * Characters start with 4 abilities and can unlock more
 */

// Starting abilities (assigned to characters)
export const ABILITY_POOL = [
    // Physical abilities
    {
        id: 'slash',
        name: 'Slash',
        description: 'A swift sword strike that weakens armor',
        domain: 'physical',
        damageType: 'power',
        tags: ['melee', 'sword'],
        statusEffects: [{ effect: 'VULNERABLE', chance: 0.4, target: 'enemy' }]
    },
    {
        id: 'heavy_strike',
        name: 'Heavy Strike',
        description: 'A crushing blow that shatters defenses',
        domain: 'physical',
        damageType: 'power',
        tags: ['melee', 'heavy'],
        statusEffects: [{ effect: 'WEAKENED', chance: 0.5, target: 'enemy' }]
    },
    {
        id: 'quick_stab',
        name: 'Quick Stab',
        description: 'A precise strike that opens wounds',
        domain: 'physical',
        damageType: 'finesse',
        tags: ['melee', 'precise'],
        statusEffects: [{ effect: 'VULNERABLE', chance: 0.3, target: 'enemy' }]
    },
    {
        id: 'shoot',
        name: 'Shoot',
        description: 'Fire a projectile that pierces armor',
        domain: 'physical',
        damageType: 'finesse',
        tags: ['ranged'],
        statusEffects: [{ effect: 'VULNERABLE', chance: 0.35, target: 'enemy' }]
    },
    
    // Elemental abilities
    {
        id: 'fireball',
        name: 'Fireball',
        description: 'Ignite your foe in flames',
        domain: 'elemental',
        damageType: 'power',
        tags: ['magic', 'fire'],
        statusEffects: [{ effect: 'BURNING', chance: 0.6, target: 'enemy' }]
    },
    {
        id: 'lightning_bolt',
        name: 'Lightning Bolt',
        description: 'Electrify your enemy, priming them for physical attacks',
        domain: 'elemental',
        damageType: 'finesse',
        tags: ['magic', 'lightning'],
        statusEffects: [{ effect: 'SHOCKED', chance: 0.7, target: 'enemy' }]
    },
    {
        id: 'ice_shard',
        name: 'Ice Shard',
        description: 'Freeze your opponent solid',
        domain: 'elemental',
        damageType: 'finesse',
        tags: ['magic', 'ice'],
        statusEffects: [{ effect: 'FROZEN', chance: 0.5, target: 'enemy' }]
    },
    {
        id: 'toxic_cloud',
        name: 'Toxic Cloud',
        description: 'Poison your enemy with noxious fumes',
        domain: 'elemental',
        damageType: 'power',
        tags: ['magic', 'poison'],
        statusEffects: [{ effect: 'POISONED', chance: 0.8, target: 'enemy' }]
    },
    
    // Psychic abilities
    {
        id: 'mind_blast',
        name: 'Mind Blast',
        description: 'Shatter mental defenses',
        domain: 'psychic',
        damageType: 'power',
        tags: ['mental'],
        statusEffects: [{ effect: 'VULNERABLE', chance: 0.5, target: 'enemy' }]
    },
    {
        id: 'confusion',
        name: 'Confusion',
        description: 'Scramble thoughts, locking psychic abilities',
        domain: 'psychic',
        damageType: 'finesse',
        tags: ['mental', 'debuff'],
        statusEffects: [{ effect: 'CONFUSED', chance: 0.7, target: 'enemy' }]
    },
    {
        id: 'fear',
        name: 'Fear',
        description: 'Strike terror into their heart, reducing their damage',
        domain: 'psychic',
        damageType: 'power',
        tags: ['mental', 'debuff'],
        statusEffects: [{ effect: 'FEARED', chance: 0.6, target: 'enemy' }]
    },
    {
        id: 'shadow_strike',
        name: 'Shadow Strike',
        description: 'Strike from darkness, empowering yourself',
        domain: 'psychic',
        damageType: 'finesse',
        tags: ['stealth'],
        statusEffects: [{ effect: 'STRENGTHENED', chance: 0.5, target: 'self' }]
    },
    
    // Special/Basic actions
    {
        id: 'rest',
        name: 'Rest & Focus',
        description: 'Recover entropy and fortify defenses for the next turn',
        domain: 'psychic',
        damageType: 'finesse',
        tags: ['basic', 'utility'],
        statusEffects: [{ effect: 'FORTIFIED', chance: 1.0, target: 'self' }]
    },
    {
        id: 'guard',
        name: 'Guard',
        description: 'Adopt a defensive stance to reduce incoming damage',
        domain: 'physical',
        damageType: 'resistance',
        tags: ['basic', 'utility'],
        statusEffects: [{ effect: 'FORTIFIED', chance: 1.0, target: 'self' }]
    }
];

// Advanced abilities (unlockable during runs)
export const UNLOCKABLE_ABILITIES = [
    // Physical advanced
    {
        id: 'execute',
        name: 'Dramatic Finish',
        description: 'Deal massive damage to wounded foes',
        domain: 'physical',
        damageType: 'power',
        tags: ['melee', 'execute'],
        statusEffects: [],
        special: 'execute' // Bonus damage below 30% HP
    },
    {
        id: 'riposte',
        name: 'Spite',
        description: 'Counter-attack when hit',
        domain: 'physical',
        damageType: 'finesse',
        tags: ['counter'],
        statusEffects: [{ effect: 'RIPOSTE', chance: 1.0, target: 'self' }]
    },
    {
        id: 'rampage',
        name: 'Tantrum',
        description: 'Wild assault that empowers you',
        domain: 'physical',
        damageType: 'power',
        tags: ['melee', 'buff'],
        statusEffects: [{ effect: 'ENRAGED', chance: 0.8, target: 'self' }]
    },
    
    // Elemental advanced
    {
        id: 'chain_lightning',
        name: 'Social Anxiety',
        description: 'Spreads shocking discomfort',
        domain: 'elemental',
        damageType: 'finesse',
        tags: ['magic', 'lightning', 'aoe'],
        statusEffects: [{ effect: 'SHOCKED', chance: 1.0, target: 'enemy' }],
        special: 'chain' // Double damage if shocked
    },
    {
        id: 'meteor',
        name: 'Existential Dread',
        description: 'Crushing realization from above',
        domain: 'elemental',
        damageType: 'power',
        tags: ['magic', 'fire', 'heavy'],
        statusEffects: [{ effect: 'BURNING', chance: 0.9, target: 'enemy' }, { effect: 'STUNNED', chance: 0.3, target: 'enemy' }]
    },
    {
        id: 'drain',
        name: 'Emotional Vampire',
        description: 'Siphon their vitality',
        domain: 'elemental',
        damageType: 'finesse',
        tags: ['magic', 'drain'],
        statusEffects: [],
        special: 'lifesteal' // Heals for 50% damage dealt
    },
    
    // Psychic advanced
    {
        id: 'dominate',
        name: 'Gaslighting',
        description: 'Make them question everything',
        domain: 'psychic',
        damageType: 'power',
        tags: ['mental', 'control'],
        statusEffects: [{ effect: 'DOMINATED', chance: 0.7, target: 'enemy' }]
    },
    {
        id: 'nightmare',
        name: 'Cringe Compilation',
        description: 'Replay their worst moments',
        domain: 'psychic',
        damageType: 'finesse',
        tags: ['mental', 'dot'],
        statusEffects: [{ effect: 'NIGHTMARES', chance: 1.0, target: 'enemy' }]
    },
    {
        id: 'reflect',
        name: 'No U',
        description: 'Return damage to sender',
        domain: 'psychic',
        damageType: 'resistance',
        tags: ['defensive'],
        statusEffects: [{ effect: 'REFLECT', chance: 1.0, target: 'self' }]
    }
];

// Combined pool for lookups
export const ALL_ABILITIES = [...ABILITY_POOL, ...UNLOCKABLE_ABILITIES];