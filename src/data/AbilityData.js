/**
 * Universal ability pool - all available abilities in the game.
 * Characters will be assigned 4 abilities from this pool
 */
export const ABILITY_POOL = [
    // Physical abilities
    {
        id: 'slash',
        name: 'Slash',
        description: 'A swift sword strike',
        domain: 'physical',
        damageType: 'power',
        tags: ['melee', 'sword']
    },
    {
        id: 'heavy_strike',
        name: 'Heavy Strike',
        description: 'A powerful crushing blow',
        domain: 'physical',
        damageType: 'power',
        tags: ['melee', 'heavy']
    },
    {
        id: 'quick_stab',
        name: 'Quick Stab',
        description: 'A precise piercing attack',
        domain: 'physical',
        damageType: 'finesse',
        tags: ['melee', 'precise']
    },
    {
        id: 'shoot',
        name: 'Shoot',
        description: 'Fire a ranged projectile',
        domain: 'physical',
        damageType: 'finesse',
        tags: ['ranged']
    },
    
    // Elemental abilities
    {
        id: 'fireball',
        name: 'Fireball',
        description: 'Hurl a ball of flame',
        domain: 'elemental',
        damageType: 'power',
        tags: ['magic', 'fire']
    },
    {
        id: 'lightning_bolt',
        name: 'Lightning Bolt',
        description: 'Strike with lightning',
        domain: 'elemental',
        damageType: 'finesse',
        tags: ['magic', 'lightning']
    },
    {
        id: 'ice_shard',
        name: 'Ice Shard',
        description: 'Launch sharp ice projectiles',
        domain: 'elemental',
        damageType: 'finesse',
        tags: ['magic', 'ice']
    },
    {
        id: 'toxic_cloud',
        name: 'Toxic Cloud',
        description: 'Emit poisonous fumes',
        domain: 'elemental',
        damageType: 'power',
        tags: ['magic', 'poison']
    },
    
    // Psychic abilities
    {
        id: 'mind_blast',
        name: 'Mind Blast',
        description: 'Assault the mind directly',
        domain: 'psychic',
        damageType: 'power',
        tags: ['mental']
    },
    {
        id: 'confusion',
        name: 'Confusion',
        description: 'Disorient the target',
        domain: 'psychic',
        damageType: 'finesse',
        tags: ['mental', 'debuff']
    },
    {
        id: 'fear',
        name: 'Fear',
        description: 'Terrify the opponent',
        domain: 'psychic',
        damageType: 'power',
        tags: ['mental', 'debuff']
    },
    {
        id: 'shadow_strike',
        name: 'Shadow Strike',
        description: 'Attack from the shadows',
        domain: 'psychic',
        damageType: 'finesse',
        tags: ['stealth']
    },
    
    // Special/Basic actions
    {
        id: 'rest',
        name: 'Rest & Focus',
        description: 'Take a moment to stabilize your energy',
        domain: 'psychic',
        damageType: 'finesse',
        tags: ['basic', 'utility']
    },
    {
        id: 'guard',
        name: 'Guard',
        description: 'Brace for the next incoming assault',
        domain: 'physical',
        damageType: 'resistance',
        tags: ['basic', 'utility']
    }
];