export const UPGRADE_POOL = [
    // Healing upgrades (Common - always compete with power)
    {
        id: 'small_heal',
        name: 'Rest & Recover',
        icon: '💊',
        description: 'Restore 30 HP',
        rarity: 'common',
        type: 'heal',
        apply: (state, battleManager) => {
            const newHP = Math.min(state.maxHP + state.maxHPBonus, state.playerHP + 30);
            state.playerHP = newHP;
        }
    },
    {
        id: 'medium_heal',
        name: 'Deep Recovery',
        icon: '💚',
        description: 'Restore 50 HP',
        rarity: 'uncommon',
        type: 'heal',
        apply: (state, battleManager) => {
            const newHP = Math.min(state.maxHP + state.maxHPBonus, state.playerHP + 50);
            state.playerHP = newHP;
        }
    },
    {
        id: 'large_heal',
        name: 'Full Restoration',
        icon: '✨',
        description: 'Restore 80 HP',
        rarity: 'rare',
        type: 'heal',
        apply: (state, battleManager) => {
            const newHP = Math.min(state.maxHP + state.maxHPBonus, state.playerHP + 80);
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
        name: 'Life Steal',
        icon: '🩸',
        description: 'Heal 3 HP per successful attack',
        rarity: 'rare',
        type: 'power',
        apply: (state) => {
            state.lifeSteal = (state.lifeSteal || 0) + 3;
        }
    }
];