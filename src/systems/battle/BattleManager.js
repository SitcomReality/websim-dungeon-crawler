import { globalBus, EVENTS } from '../../core/events/EventBus.js';
import { gameState } from '../../data/store/StateStore.js';
import { ABILITY_POOL } from '../../data/AbilityData.js';
import { CHARACTER_DATA } from '../../data/CharacterData.js';

export class BattleManager {
    constructor(animator) {
        this.animator = animator;
        
        globalBus.on(EVENTS.PLAYER_ACTION, this._handlePlayerAction.bind(this));
        globalBus.on(EVENTS.STATE_CHANGED, this._onStateChange.bind(this));
    }

    _onStateChange(state) {
        // If it's opponent's turn, trigger AI after delay
        if (state.mode === 'BATTLE' && state.turn === 'OPPONENT') {
            // Small delay for pacing
            setTimeout(() => this._performOpponentTurn(), 1000);
        }
    }

    _handlePlayerAction({ abilityId }) {
        const state = gameState.getState();
        if (state.turn !== 'PLAYER' || state.mode !== 'BATTLE') return;

        // Lock turn
        gameState.updateState({ turn: 'BUSY' });

        const playerChar = CHARACTER_DATA[state.playerCharacterIndex];
        const ability = ABILITY_POOL.find(a => a.id === abilityId);
        const opponentChar = CHARACTER_DATA[state.opponentCharacterIndex];

        if (!ability) return;

        // Calculate damage
        const damage = this._calculateDamage(playerChar, opponentChar, ability);

        // Play Animation
        this.animator.playAttackSequence('PLAYER', ability, damage, 
            () => { // On Hit
                let newHP = Math.max(0, state.opponentHP - damage);
                gameState.updateState({ opponentHP: newHP });
            },
            () => { // On Complete
                if (gameState.getState().opponentHP <= 0) {
                    gameState.updateState({ turn: 'VICTORY' });
                    // Handle victory logic (screen, etc) later
                } else {
                    gameState.updateState({ turn: 'OPPONENT' });
                }
            }
        );
    }

    _performOpponentTurn() {
        const state = gameState.getState();
        // Check if battle ended during delay
        if (state.mode !== 'BATTLE' || state.turn !== 'OPPONENT') return;

        gameState.updateState({ turn: 'BUSY' });

        const opponentChar = CHARACTER_DATA[state.opponentCharacterIndex];
        const playerChar = CHARACTER_DATA[state.playerCharacterIndex];

        // AI Logic: Random ability for now
        const abilityId = opponentChar.abilities[Math.floor(Math.random() * opponentChar.abilities.length)];
        const ability = ABILITY_POOL.find(a => a.id === abilityId);

        const damage = this._calculateDamage(opponentChar, playerChar, ability);

        this.animator.playAttackSequence('OPPONENT', ability, damage,
            () => { // On Hit
                let newHP = Math.max(0, state.playerHP - damage);
                gameState.updateState({ playerHP: newHP });
            },
            () => { // On Complete
                if (gameState.getState().playerHP <= 0) {
                    gameState.updateState({ turn: 'DEFEAT' });
                } else {
                    gameState.updateState({ turn: 'PLAYER' });
                }
            }
        );
    }

    _calculateDamage(attacker, defender, ability) {
        // domain: physical, elemental, psychic
        // type: power, finesse
        const atkVal = attacker.stats[ability.domain][ability.damageType];
        
        // Use resistance of the same domain
        const defVal = defender.stats[ability.domain].resistance;

        // Simple formula: Base + (Atk * 2) - Def
        // Abilities might have base power, but for now assume base 5
        const basePower = 5;
        let damage = basePower + (atkVal * 2.5) - (defVal * 1.5);
        
        // Variation
        damage += (Math.random() * 4) - 2;

        return Math.max(1, Math.round(damage));
    }
}