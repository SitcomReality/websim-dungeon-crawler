import { CHARACTER_DATA } from '../../data/CharacterData.js';
import { ALL_ABILITIES, ABILITY_POOL } from '../../data/AbilityData.js';
import { gameState } from '../../data/store/StateStore.js';
import { globalBus, EVENTS } from '../../core/events/Bus.js';
import { DamageCalculator } from './DamageCalculator.js';

/**
 * Handles opponent decision making and execution flow.
 */
export class OpponentAI {
    constructor(battleManager) {
        this.bm = battleManager;
    }

    /**
     * Randomly selects an ability and calculates its predicted outcome.
     */
    decideIntent() {
        const state = gameState.getState();
        const opponentChar = CHARACTER_DATA[state.opponentCharacterIndex];
        const playerChar = CHARACTER_DATA[state.playerCharacterIndex];
        
        if (!opponentChar || !playerChar) return;

        // Filter abilities based on domain locks
        const availableAbilities = opponentChar.abilities.filter(abilityId => {
            const ability = ABILITY_POOL.find(a => a.id === abilityId);
            return ability && !this.bm.statusEffects.isDomainLocked('OPPONENT', ability.domain);
        });

        const abilityId = availableAbilities.length > 0 
            ? availableAbilities[Math.floor(Math.random() * availableAbilities.length)]
            : opponentChar.abilities[0];
            
        const ability = ALL_ABILITIES.find(a => a.id === abilityId);
        const damage = DamageCalculator.calculate(
            opponentChar, 
            playerChar, 
            ability, 
            false, 
            this.bm.getSystems(), 
            state
        );

        gameState.updateState({
            opponentIntent: {
                abilityId,
                predictedDamage: damage,
                statusEffects: ability.statusEffects || []
            }
        });
    }

    /**
     * Executes the pre-decided intent with animations.
     */
    performTurn() {
        const state = gameState.getState();
        if (state.mode !== 'BATTLE' || state.turn !== 'OPPONENT') return;

        const intent = state.opponentIntent;
        if (!intent) {
            this.decideIntent();
            return this.performTurn();
        }

        const abilityId = intent.abilityId;

        gameState.updateState({ 
            turn: 'BUSY',
            executingAbilityId: abilityId,
            executingAttacker: 'OPPONENT',
            opponentIntent: null
        });

        const opponentChar = CHARACTER_DATA[state.opponentCharacterIndex];
        const playerChar = CHARACTER_DATA[state.playerCharacterIndex];
        const ability = ALL_ABILITIES.find(a => a.id === abilityId);

        const damage = DamageCalculator.calculate(
            opponentChar, 
            playerChar, 
            ability, 
            false, 
            this.bm.getSystems(), 
            state
        );

        globalBus.emit(EVENTS.ABILITY_USED, {
            attacker: 'OPPONENT',
            abilityId: ability.id,
            abilityName: ability.name
        });

        this.bm.animator.playAttackSequence('OPPONENT', ability, damage,
            () => this._handleHit(damage, ability),
            () => this._handleComplete()
        );
    }

    _handleHit(damage, ability) {
        const currentState = gameState.getState();
        this.bm.applyStatusEffects(ability, 'OPPONENT', 'PLAYER');
        
        const playerEffectResults = this.bm.statusEffects.processTurnEnd('PLAYER', this.bm);
        let totalDoTDamage = 0;
        playerEffectResults.forEach(result => {
            if (result.type === 'damage') totalDoTDamage += result.amount;
        });
        
        let finalDamage = damage + totalDoTDamage;
        if (currentState.damageReduction) {
            finalDamage = Math.max(1, Math.round(finalDamage * (1 - currentState.damageReduction)));
        }
        
        let newHP = currentState.playerHP - finalDamage;
        if (newHP <= 0 && currentState.fateThreads > 0) {
            newHP = Math.floor((currentState.maxHP + currentState.maxHPBonus) * 0.3);
            gameState.updateState({ 
                playerHP: newHP,
                fateThreads: currentState.fateThreads - 1
            });
            globalBus.emit(EVENTS.HEAL_APPLIED, { target: 'PLAYER', amount: 'FATE THREAD!' });
            return;
        }
        
        newHP = Math.max(0, newHP);
        if (currentState.entropyOnHit && newHP > 0) {
            this.bm.entropy.add(currentState.entropyOnHit);
        }
        
        gameState.updateState({ playerHP: newHP });
        globalBus.emit(EVENTS.DAMAGE_APPLIED, { target: 'PLAYER', amount: damage });
        
        if (totalDoTDamage > 0) {
            setTimeout(() => {
                globalBus.emit(EVENTS.DAMAGE_APPLIED, { target: 'PLAYER', amount: totalDoTDamage });
            }, 200);
        }
    }

    _handleComplete() {
        gameState.updateState({ executingAbilityId: null, executingAttacker: null });
        if (gameState.getState().playerHP <= 0) {
            gameState.updateState({ turn: 'DEFEAT' });
        } else {
            gameState.updateState({ turn: 'PLAYER' });
        }
    }
}