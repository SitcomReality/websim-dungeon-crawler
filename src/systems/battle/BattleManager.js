import { globalBus, EVENTS } from '../../core/events/EventBus.js';
import { gameState } from '../../data/store/StateStore.js';
import { ALL_ABILITIES } from '../../data/AbilityData.js';
import { CHARACTER_DATA } from '../../data/CharacterData.js';
import { EntropySystem } from '../mechanics/EntropySystem.js';
import { CooldownSystem } from '../mechanics/CooldownSystem.js';
import { MomentumSystem } from '../mechanics/MomentumSystem.js';
import { StatusEffectSystem } from '../mechanics/StatusEffectSystem.js';
import { ABILITY_ENTROPY_COSTS } from '../mechanics/constants.js';
import { DamageCalculator } from './DamageCalculator.js';
import { OpponentAI } from './OpponentAI.js';

export class BattleManager {
    constructor(animator) {
        this.animator = animator;
        
        // Initialize game systems
        this.entropy = new EntropySystem();
        this.cooldowns = new CooldownSystem();
        this.momentum = new MomentumSystem();
        this.statusEffects = new StatusEffectSystem();
        this.ai = new OpponentAI(this);
        
        // Upgrade modifiers
        this.entropyBonus = 0;
        this.momentumDecayMultiplier = 1.0;
        this.cooldownReduction = 0;

        this.lastMode = null;
        this.lastTurn = null;
        this.lastBattleCount = null;
        
        globalBus.on(EVENTS.PLAYER_ACTION, this._handlePlayerAction.bind(this));
        globalBus.on(EVENTS.STATE_CHANGED, this._onStateChange.bind(this));
    }

    getSystems() {
        return {
            entropy: this.entropy,
            cooldowns: this.cooldowns,
            momentum: this.momentum,
            statusEffects: this.statusEffects
        };
    }

    getEntropy() {
        return this.entropy.value;
    }

    getCooldown(abilityId) {
        return this.cooldowns.getRemaining(abilityId);
    }

    getMomentum(domain) {
        return this.momentum.getStacks(domain);
    }

    canUseAbility(abilityId) {
        const entropyCost = ABILITY_ENTROPY_COSTS[abilityId] || 0;
        const hasEntropy = this.entropy.value >= entropyCost;
        const isReady = this.cooldowns.isReady(abilityId);
        
        // Check if ability domain is locked
        const ability = ALL_ABILITIES.find(a => a.id === abilityId);
        if (ability && this.statusEffects.isDomainLocked('PLAYER', ability.domain)) {
            return false;
        }
        
        return hasEntropy && isReady;
    }
    
    getPlayerStatusEffects() {
        return this.statusEffects.getEffects('PLAYER');
    }
    
    getOpponentStatusEffects() {
        return this.statusEffects.getEffects('OPPONENT');
    }

    _onStateChange(state) {
        const modeChanged = state.mode !== this.lastMode;
        const turnChanged = state.turn !== this.lastTurn;
        const battleChanged = state.battleCount !== this.lastBattleCount;
        
        this.lastMode = state.mode;
        this.lastTurn = state.turn;
        this.lastBattleCount = state.battleCount;

        if (state.mode !== 'BATTLE') return;

        // Reset systems on entering BATTLE mode OR starting a new battle in the same mode
        if (modeChanged || battleChanged) {
            this.entropy.reset();
            this.cooldowns.reset();
            this.momentum.reset();
            this.statusEffects.reset();
            
            // Apply starting momentum if player has it
            if (state.startingMomentum) {
                this.momentum.stacks.physical = state.startingMomentum;
                this.momentum.stacks.elemental = state.startingMomentum;
                this.momentum.stacks.psychic = state.startingMomentum;
            }
            
            gameState.updateState({ 
                playerGuarding: false,
                opponentIntent: null,
                selectedAbilityId: null,
                executingAbilityId: null
            });
        }

        // When it transitions to the player's turn
        if (turnChanged && state.turn === 'PLAYER') {
            this._startPlayerTurn();
            this.ai.decideIntent();
            gameState.updateState({ playerGuarding: false });
        }

        // If it's opponent's turn, trigger AI after delay (only on transition)
        if (turnChanged && state.turn === 'OPPONENT') {
            // Small delay for pacing
            setTimeout(() => this.ai.performTurn(), 1000);
        }
    }

    _startPlayerTurn() {
        // Process status effects for opponent (their turn just ended)
        const opponentEffectResults = this.statusEffects.processTurnEnd('OPPONENT', this);
        opponentEffectResults.forEach(result => {
            if (result.type === 'damage') {
                const state = gameState.getState();
                const newHP = Math.max(0, state.opponentHP - result.amount);
                gameState.updateState({ opponentHP: newHP });
                globalBus.emit(EVENTS.DAMAGE_APPLIED, {
                    target: 'OPPONENT',
                    amount: result.amount
                });
            }
        });
        
        // Regenerate entropy at turn start
        this.entropy.regenerate();
        this.entropy.add(this.entropyBonus);
        
        // Tick down cooldowns
        this.cooldowns.tick();
    }

    // removed _decideOpponentIntent() {}

    _handlePlayerAction({ abilityId }) {
        const state = gameState.getState();
        if (state.turn !== 'PLAYER' || state.mode !== 'BATTLE') return;

        // Check if ability can be used
        if (!this.canUseAbility(abilityId)) {
            console.warn('Ability not ready or insufficient entropy');
            return;
        }

        const ability = ALL_ABILITIES.find(a => a.id === abilityId);
        if (!ability) return;
        
        // Check for victory condition
        if (state.battleCount >= state.victoryThreshold) {
            // Player has won!
            gameState.updateState({ turn: 'ULTIMATE_VICTORY' });
            return;
        }

        // Consume entropy
        const entropyCost = ABILITY_ENTROPY_COSTS[abilityId] || 0;
        this.entropy.consume(entropyCost);

        // Trigger cooldown
        this.cooldowns.trigger(abilityId);

        // Add momentum
        this.momentum.addMomentum(ability.domain, this.momentumDecayMultiplier);

        // Check for special basic actions
        if (abilityId === 'rest') {
            this.entropy.add(40);
            this.applyStatusEffects(ability, 'PLAYER', 'PLAYER');
            globalBus.emit(EVENTS.HEAL_APPLIED, { target: 'PLAYER', amount: 'RESTORING' });
            globalBus.emit(EVENTS.ABILITY_USED, { attacker: 'PLAYER', abilityId, abilityName: 'Resting...' });
            gameState.updateState({ turn: 'OPPONENT', selectedAbilityId: null });
            return;
        }

        if (abilityId === 'guard') {
            this.applyStatusEffects(ability, 'PLAYER', 'PLAYER');
            gameState.updateState({ playerGuarding: true });
            globalBus.emit(EVENTS.ABILITY_USED, { attacker: 'PLAYER', abilityId, abilityName: 'Guarding...' });
            gameState.updateState({ turn: 'OPPONENT', selectedAbilityId: null });
            return;
        }

        // Lock turn and set executing ability
        gameState.updateState({ 
            turn: 'BUSY', 
            executingAbilityId: abilityId, 
            executingAttacker: 'PLAYER',
            selectedAbilityId: null 
        });

        const playerChar = CHARACTER_DATA[state.playerCharacterIndex];
        const opponentChar = CHARACTER_DATA[state.opponentCharacterIndex];
        
        // Check for special ability effects
        let damageBonus = 0;
        if (ability.special === 'execute' && state.opponentHP < state.opponentHP * 0.3) {
            damageBonus = 0.5; // 50% bonus vs low HP (multiplier becomes 1.5)
        }
        if (ability.special === 'chain' && this.statusEffects.hasEffect('OPPONENT', 'shocked')) {
            damageBonus = 1.0; // Double damage
        }

        // Broadcast ability used for UI indicators
        globalBus.emit(EVENTS.ABILITY_USED, {
            attacker: 'PLAYER',
            abilityId: ability.id,
            abilityName: ability.name
        });

        // Calculate damage
        let damage = DamageCalculator.calculate(playerChar, opponentChar, ability, true, this.getSystems(), state);
        if (damageBonus) damage = Math.round(damage * (1 + damageBonus));

        // Play Animation
        this.animator.playAttackSequence('PLAYER', ability, damage, 
            () => { // On Hit
                const currentState = gameState.getState();
                let newHP = Math.max(0, currentState.opponentHP - damage);
                
                // Apply status effects
                this.applyStatusEffects(ability, 'PLAYER', 'OPPONENT');
                
                // Apply life steal
                let newPlayerHP = currentState.playerHP;
                let lifeStealAmount = currentState.lifeSteal || 0;
                if (ability.special === 'lifesteal') {
                    lifeStealAmount += Math.floor(damage * 0.5);
                }
                if (lifeStealAmount > 0) {
                    newPlayerHP = Math.min(
                        currentState.maxHP + currentState.maxHPBonus,
                        newPlayerHP + lifeStealAmount
                    );
                }
                
                gameState.updateState({ 
                    opponentHP: newHP,
                    playerHP: newPlayerHP
                });

                globalBus.emit(EVENTS.DAMAGE_APPLIED, {
                    target: 'OPPONENT',
                    amount: damage
                });
            },
            () => { // On Complete
                gameState.updateState({ executingAbilityId: null, executingAttacker: null });
                if (gameState.getState().opponentHP <= 0) {
                    gameState.updateState({ turn: 'VICTORY' });
                } else {
                    gameState.updateState({ turn: 'OPPONENT' });
                }
            }
        );
    }

    getPredictedDamage(abilityId, isPlayerAttacking = true) {
        const state = gameState.getState();
        const ability = ALL_ABILITIES.find(a => a.id === abilityId);
        if (!ability) return 0;

        const playerChar = CHARACTER_DATA[state.playerCharacterIndex];
        const opponentChar = CHARACTER_DATA[state.opponentCharacterIndex];

        let damage = DamageCalculator.getPredicted(
            isPlayerAttacking ? playerChar : opponentChar, 
            isPlayerAttacking ? opponentChar : playerChar, 
            ability, 
            isPlayerAttacking, 
            this.getSystems(), 
            state
        );

        if (isPlayerAttacking) {
            if (ability.special === 'execute' && state.opponentHP < state.opponentHP * 0.3) {
                damage *= 1.5;
            }
            if (ability.special === 'chain' && this.statusEffects.hasEffect('OPPONENT', 'shocked')) {
                damage *= 2.0;
            }
        }
        return Math.round(damage);
    }

    // removed _performOpponentTurn() {}

    applyStatusEffects(ability, attacker, defender) {
        if (!ability.statusEffects) return;
        
        ability.statusEffects.forEach(effectData => {
            const roll = Math.random();
            if (roll < effectData.chance) {
                const target = effectData.target === 'self' ? attacker : defender;
                this.statusEffects.addEffect(target, effectData.effect);
            }
        });
    }

    // removed _calculateDamage() {}
}