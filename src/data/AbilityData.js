/**
 * Universal ability pool - all available abilities in the game.
 * Characters will be assigned 4 abilities from this pool
 */
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
        description: 'Recover energy and fortify defenses',
        domain: 'psychic',
        damageType: 'finesse',
        tags: ['basic', 'utility'],
        statusEffects: [{ effect: 'FORTIFIED', chance: 1.0, target: 'self' }]
    },
    {
        id: 'guard',
        name: 'Guard',
        description: 'Brace for incoming assault, reducing damage',
        domain: 'physical',
        damageType: 'resistance',
        tags: ['basic', 'utility'],
        statusEffects: [{ effect: 'FORTIFIED', chance: 1.0, target: 'self' }]
    }
];