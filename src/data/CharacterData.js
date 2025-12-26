/**
 * Character registry defining all available characters with:
 * - Sprite coordinates
 * - 3x3 stat grid (Physical/Elemental/Psychic × Power/Finesse/Resistance)
 * - Assigned abilities (4 per character from the universal ability pool)
 */
export const CHARACTER_DATA = [
    // Row 1
    { 
        id: 'axe_warrior', 
        name: 'Axe Warrior', 
        gridX: 0, gridY: 0, 
        tags: ['blonde', 'axe', 'human'],
        stats: {
            physical: { power: 8, finesse: 5, resistance: 7 },
            elemental: { power: 2, finesse: 2, resistance: 5 },
            psychic: { power: 3, finesse: 4, resistance: 6 }
        },
        abilities: ['heavy_strike', 'slash', 'quick_stab', 'fear']
    },
    { 
        id: 'skull_witch', 
        name: 'Skull Witch', 
        gridX: 1, gridY: 0, 
        tags: ['witch', 'green', 'staff'],
        stats: {
            physical: { power: 2, finesse: 4, resistance: 3 },
            elemental: { power: 9, finesse: 7, resistance: 6 },
            psychic: { power: 8, finesse: 7, resistance: 5 }
        },
        abilities: ['fireball', 'toxic_cloud', 'mind_blast', 'confusion']
    },
    { 
        id: 'crook_tophat', 
        name: 'Top-Hat Crook', 
        gridX: 2, gridY: 0, 
        tags: ['crook', 'moustached', 'purple'],
        stats: {
            physical: { power: 5, finesse: 8, resistance: 4 },
            elemental: { power: 4, finesse: 5, resistance: 4 },
            psychic: { power: 6, finesse: 7, resistance: 5 }
        },
        abilities: ['quick_stab', 'shoot', 'confusion', 'shadow_strike']
    },
    { 
        id: 'crook_megaphone', 
        name: 'Megaphone Crook', 
        gridX: 3, gridY: 0, 
        tags: ['crook', 'bald', 'megaphone'],
        stats: {
            physical: { power: 4, finesse: 6, resistance: 4 },
            elemental: { power: 3, finesse: 4, resistance: 4 },
            psychic: { power: 7, finesse: 6, resistance: 5 }
        },
        abilities: ['shoot', 'confusion', 'fear', 'mind_blast']
    },
    
    // Row 2
    { 
        id: 'tall_dwarf', 
        name: 'Tall Dwarf', 
        gridX: 0, gridY: 1, 
        tags: ['dwarf', 'hammer'],
        stats: {
            physical: { power: 9, finesse: 4, resistance: 9 },
            elemental: { power: 3, finesse: 2, resistance: 7 },
            psychic: { power: 2, finesse: 2, resistance: 8 }
        },
        abilities: ['heavy_strike', 'slash', 'fireball', 'fear']
    },
    { 
        id: 'hooded_crossbow', 
        name: 'Crossbow Assassin', 
        gridX: 1, gridY: 1, 
        tags: ['hooded', 'crossbows'],
        stats: {
            physical: { power: 6, finesse: 9, resistance: 5 },
            elemental: { power: 4, finesse: 5, resistance: 5 },
            psychic: { power: 5, finesse: 8, resistance: 6 }
        },
        abilities: ['shoot', 'quick_stab', 'shadow_strike', 'toxic_cloud']
    },
    { 
        id: 'pig_pirate', 
        name: 'Pig Pirate', 
        gridX: 2, gridY: 1, 
        tags: ['pig', 'pirate', 'hook'],
        stats: {
            physical: { power: 7, finesse: 6, resistance: 6 },
            elemental: { power: 5, finesse: 4, resistance: 5 },
            psychic: { power: 4, finesse: 5, resistance: 5 }
        },
        abilities: ['slash', 'shoot', 'fear', 'heavy_strike']
    },
    { 
        id: 'lizard_man', 
        name: 'Lizard Man', 
        gridX: 3, gridY: 1, 
        tags: ['dino', 'lizard'],
        stats: {
            physical: { power: 7, finesse: 7, resistance: 7 },
            elemental: { power: 6, finesse: 6, resistance: 8 },
            psychic: { power: 3, finesse: 4, resistance: 4 }
        },
        abilities: ['slash', 'quick_stab', 'toxic_cloud', 'fireball']
    },
    
    // Row 3
    { 
        id: 'rusted_knight', 
        name: 'Rusted Knight', 
        gridX: 0, gridY: 2, 
        tags: ['knight', 'armor'],
        stats: {
            physical: { power: 8, finesse: 3, resistance: 9 },
            elemental: { power: 2, finesse: 2, resistance: 6 },
            psychic: { power: 3, finesse: 3, resistance: 7 }
        },
        abilities: ['slash', 'heavy_strike', 'quick_stab', 'fear']
    },
    { 
        id: 'steampank_maniac', 
        name: 'Steam Maniac', 
        gridX: 1, gridY: 2, 
        tags: ['goggles', 'backpack', 'hook'],
        stats: {
            physical: { power: 6, finesse: 7, resistance: 5 },
            elemental: { power: 7, finesse: 8, resistance: 6 },
            psychic: { power: 5, finesse: 6, resistance: 4 }
        },
        abilities: ['quick_stab', 'fireball', 'lightning_bolt', 'toxic_cloud']
    },
    { 
        id: 'frankenstein_orc', 
        name: 'Ogre Orc', 
        gridX: 2, gridY: 2, 
        tags: ['ogre', 'orc', 'club'],
        stats: {
            physical: { power: 9, finesse: 3, resistance: 8 },
            elemental: { power: 5, finesse: 3, resistance: 7 },
            psychic: { power: 2, finesse: 2, resistance: 2 }
        },
        abilities: ['heavy_strike', 'slash', 'fireball', 'toxic_cloud']
    },
    { 
        id: 'tentacle_monster', 
        name: 'Tentacle Monster', 
        gridX: 3, gridY: 2, 
        tags: ['purple', 'monster'],
        stats: {
            physical: { power: 6, finesse: 5, resistance: 6 },
            elemental: { power: 7, finesse: 6, resistance: 6 },
            psychic: { power: 9, finesse: 8, resistance: 7 }
        },
        abilities: ['mind_blast', 'confusion', 'toxic_cloud', 'slash']
    },
    
    // Row 4
    { 
        id: 'female_warrior', 
        name: 'Shieldmaiden', 
        gridX: 0, gridY: 3, 
        tags: ['warrior', 'sword'],
        stats: {
            physical: { power: 7, finesse: 7, resistance: 7 },
            elemental: { power: 4, finesse: 5, resistance: 6 },
            psychic: { power: 5, finesse: 6, resistance: 6 }
        },
        abilities: ['slash', 'quick_stab', 'shoot', 'fear']
    },
    { 
        id: 'black_superhero', 
        name: 'Night Stalker', 
        gridX: 1, gridY: 3, 
        tags: ['superhero', 'black', 'cape'],
        stats: {
            physical: { power: 7, finesse: 8, resistance: 6 },
            elemental: { power: 4, finesse: 5, resistance: 5 },
            psychic: { power: 8, finesse: 9, resistance: 7 }
        },
        abilities: ['quick_stab', 'shadow_strike', 'mind_blast', 'confusion']
    },
    { 
        id: 'demon_cupid', 
        name: 'Demon Cupid', 
        gridX: 2, gridY: 3, 
        tags: ['satan', 'demon', 'pitchfork'],
        stats: {
            physical: { power: 6, finesse: 6, resistance: 5 },
            elemental: { power: 8, finesse: 7, resistance: 8 },
            psychic: { power: 7, finesse: 6, resistance: 6 }
        },
        abilities: ['fireball', 'quick_stab', 'fear', 'mind_blast']
    },
    { 
        id: 'eyeball_monster', 
        name: 'Beholder Spawn', 
        gridX: 3, gridY: 3, 
        tags: ['eyeball', 'teeth'],
        stats: {
            physical: { power: 4, finesse: 5, resistance: 5 },
            elemental: { power: 7, finesse: 8, resistance: 6 },
            psychic: { power: 9, finesse: 8, resistance: 6 }
        },
        abilities: ['mind_blast', 'confusion', 'lightning_bolt', 'ice_shard']
    }
];