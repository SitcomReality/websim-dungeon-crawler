export const UPGRADE_POOL = [
    // Healing upgrades (Now more balanced)
    {
        id: 'small_heal',
        name: 'Band-Aid',
        icon: '🩹',
        description: 'Restore 25 HP',
        rarity: 'common',
        type: 'heal',
        apply: (state, battleManager) => {
            const newHP = Math.min(state.maxHP + state.maxHPBonus, state.playerHP + 25);
            state.playerHP = newHP;
        }
    },
    {
        id: 'medium_heal',
        name: 'Therapy Session',
        icon: '💚',
        description: 'Restore 40 HP',
        rarity: 'uncommon',
        type: 'heal',
        apply: (state, battleManager) => {
            const newHP = Math.min(state.maxHP + state.maxHPBonus, state.playerHP + 40);
            state.playerHP = newHP;
        }
    },
    {
        id: 'large_heal',
        name: 'Miracle Drug',
        icon: '✨',
        description: 'Restore 60 HP',
        rarity: 'rare',
        type: 'heal',
        apply: (state, battleManager) => {
            const newHP = Math.min(state.maxHP + state.maxHPBonus, state.playerHP + 60);
            state.playerHP = newHP;
        }
    },
    
    // Stat boost upgrades (Uncommon)
    {
        id: 'physical_boost',
        name: 'Brute Force',
        icon: '💪',
        description: 'Permanently +2 to all Physical stats',
        rarity: 'uncommon',
        type: 'stat',
        apply: (state) => {
            state.statBoosts.physical += 2;
        }
    },
    {
        id: 'elemental_boost',
        name: 'Elemental Mastery',
        icon: '🔥',
        description: 'Permanently +2 to all Elemental stats',
        rarity: 'uncommon',
        type: 'stat',
        apply: (state) => {
            state.statBoosts.elemental += 2;
        }
    },
    {
        id: 'psychic_boost',
        name: 'Mental Fortitude',
        icon: '🧠',
        description: 'Permanently +2 to all Psychic stats',
        rarity: 'uncommon',
        type: 'stat',
        apply: (state) => {
            state.statBoosts.psychic += 2;
        }
    },
    
    // Power upgrades (Rare)
    {
        id: 'damage_amp',
        name: 'Raw Power',
        icon: '⚡',
        description: 'Increase all damage by 15%',
        rarity: 'rare',
        type: 'power',
        apply: (state) => {
            state.damageMultiplier *= 1.15;
        }
    },
    {
        id: 'max_hp_boost',
        name: 'Vitality Surge',
        icon: '❤️',
        description: 'Permanently +20 Max HP and restore 20 HP',
        rarity: 'rare',
        type: 'power',
        apply: (state) => {
            state.maxHPBonus += 20;
            state.playerHP = Math.min(state.maxHP + state.maxHPBonus, state.playerHP + 20);
        }
    },
    {
        id: 'entropy_boost',
        name: 'Chaos Control',
        icon: '🌀',
        description: 'Start each turn with +15 Entropy',
        rarity: 'rare',
        type: 'power',
        apply: (state, battleManager) => {
            battleManager.entropyBonus = (battleManager.entropyBonus || 0) + 15;
        }
    },
    
    // Momentum upgrades
    {
        id: 'momentum_keeper',
        name: 'Flow State',
        icon: '🌊',
        description: 'Momentum decays 50% slower',
        rarity: 'uncommon',
        type: 'momentum',
        apply: (state, battleManager) => {
            battleManager.momentumDecayMultiplier = 0.5;
        }
    },
    
    // Hybrid upgrades
    {
        id: 'vampire',
        name: 'Parasocial',
        icon: '🩸',
        description: 'Heal 3 HP per successful attack',
        rarity: 'rare',
        type: 'power',
        apply: (state) => {
            state.lifeSteal = (state.lifeSteal || 0) + 3;
        }
    },
    
    // Mechanical upgrades
    {
        id: 'fate_thread',
        name: 'Plot Armor',
        icon: '🎲',
        description: 'Gain 2 fate threads (prevent death once each)',
        rarity: 'rare',
        type: 'mechanical',
        apply: (state) => {
            state.fateThreads = (state.fateThreads || 0) + 2;
        }
    },
    {
        id: 'ability_slot',
        name: 'Multitasking',
        icon: '🎯',
        description: 'Unlock a new powerful ability',
        rarity: 'rare',
        type: 'ability',
        apply: (state) => {
            // Will be handled specially in UpgradeMenu
        }
    },
    {
        id: 'entropy_max',
        name: 'Unhinged',
        icon: '🌪️',
        description: '+30 Max Entropy',
        rarity: 'uncommon',
        type: 'mechanical',
        apply: (state, battleManager) => {
            // Increase max entropy
            battleManager.entropy.maxEntropy = (battleManager.entropy.maxEntropy || 100) + 30;
        }
    },
    {
        id: 'cooldown_reduction',
        name: 'Speedrun Strats',
        icon: '⏱️',
        description: 'All cooldowns -1 turn (min 0)',
        rarity: 'uncommon',
        type: 'mechanical',
        apply: (state, battleManager) => {
            battleManager.cooldownReduction = (battleManager.cooldownReduction || 0) + 1;
        }
    },
    {
        id: 'starting_momentum',
        name: 'Opening Gambit',
        icon: '🚀',
        description: 'Start battles with +2 momentum in all domains',
        rarity: 'uncommon',
        type: 'mechanical',
        apply: (state) => {
            state.startingMomentum = (state.startingMomentum || 0) + 2;
        }
    },
    {
        id: 'entropy_on_hit',
        name: 'Schadenfreude',
        icon: '😈',
        description: 'Gain +5 entropy when damaged',
        rarity: 'uncommon',
        type: 'mechanical',
        apply: (state) => {
            state.entropyOnHit = (state.entropyOnHit || 0) + 5;
        }
    },
    {
        id: 'glass_cannon',
        name: 'Main Character',
        icon: '💥',
        description: '+30% damage, -15 Max HP',
        rarity: 'rare',
        type: 'power',
        apply: (state) => {
            state.damageMultiplier *= 1.3;
            state.maxHPBonus -= 15;
            state.playerHP = Math.min(state.maxHP + state.maxHPBonus, state.playerHP);
        }
    },
    {
        id: 'thick_skin',
        name: 'Denial',
        icon: '🛡️',
        description: 'Take 15% less damage',
        rarity: 'uncommon',
        type: 'defensive',
        apply: (state) => {
            state.damageReduction = (state.damageReduction || 0) + 0.15;
        }
    }
];