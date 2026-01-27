import { globalBus, EVENTS } from '../../core/events/EventBus.js';
import { gameState } from '../../data/store/StateStore.js';
import { ABILITY_POOL } from '../../data/AbilityData.js';
import { CHARACTER_DATA } from '../../data/CharacterData.js';
import { EntropySystem } from '../mechanics/EntropySystem.js';
import { CooldownSystem } from '../mechanics/CooldownSystem.js';
import { MomentumSystem } from '../mechanics/MomentumSystem.js';
import { ABILITY_ENTROPY_COSTS } from '../mechanics/constants.js';

export class BattleManager {
    constructor(animator) {
        this.animator = animator;
        
        // Initialize game systems
        this.entropy = new EntropySystem();
        this.cooldowns = new CooldownSystem();
        this.momentum = new MomentumSystem();
        
        // Upgrade modifiers
        this.entropyBonus = 0;
        this.momentumDecayMultiplier = 1.0;

        this.lastMode = null;
        this.lastTurn = null;
        
        globalBus.on(EVENTS.PLAYER_ACTION, this._handlePlayerAction.bind(this));
        globalBus.on(EVENTS.STATE_CHANGED, this._onStateChange.bind(this));
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
        return hasEntropy && isReady;
    }

    _onStateChange(state) {
        const modeChanged = state.mode !== this.lastMode;
        const turnChanged = state.turn !== this.lastTurn;
        
        this.lastMode = state.mode;
        this.lastTurn = state.turn;

        if (state.mode !== 'BATTLE') return;

        // Reset systems on entering BATTLE mode
        if (modeChanged) {
            this.entropy.reset();
            this.cooldowns.reset();
            this.momentum.reset();
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
            this._decideOpponentIntent();
            gameState.updateState({ playerGuarding: false });
        }

        // If it's opponent's turn, trigger AI after delay (only on transition)
        if (turnChanged && state.turn === 'OPPONENT') {
            // Small delay for pacing
            setTimeout(() => this._performOpponentTurn(), 1000);
        }
    }

    _startPlayerTurn() {
        // Regenerate entropy at turn start
        this.entropy.regenerate();
        this.entropy.add(this.entropyBonus);
        
        // Tick down cooldowns
        this.cooldowns.tick();
    }

    _decideOpponentIntent() {
        const state = gameState.getState();
        const opponentChar = CHARACTER_DATA[state.opponentCharacterIndex];
        const playerChar = CHARACTER_DATA[state.playerCharacterIndex];
        
        if (!opponentChar || !playerChar) return;

        const abilityId = opponentChar.abilities[Math.floor(Math.random() * opponentChar.abilities.length)];
        const ability = ABILITY_POOL.find(a => a.id === abilityId);
        const damage = this._calculateDamage(opponentChar, playerChar, ability);

        gameState.updateState({
            opponentIntent: {
                abilityId,
                predictedDamage: damage
            }
        });
    }

    _handlePlayerAction({ abilityId }) {
        const state = gameState.getState();
        if (state.turn !== 'PLAYER' || state.mode !== 'BATTLE') return;

        // Check if ability can be used
        if (!this.canUseAbility(abilityId)) {
            console.warn('Ability not ready or insufficient entropy');
            return;
        }

        const ability = ABILITY_POOL.find(a => a.id === abilityId);
        if (!ability) return;

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
            globalBus.emit(EVENTS.HEAL_APPLIED, { target: 'PLAYER', amount: 'RESTORING' }); // Visual cue
            globalBus.emit(EVENTS.ABILITY_USED, { attacker: 'PLAYER', abilityId, abilityName: 'Resting...' });
            gameState.updateState({ turn: 'OPPONENT', selectedAbilityId: null });
            return;
        }

        if (abilityId === 'guard') {
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

        // Broadcast ability used for UI indicators
        globalBus.emit(EVENTS.ABILITY_USED, {
            attacker: 'PLAYER',
            abilityId: ability.id,
            abilityName: ability.name
        });

        // Calculate damage
        const damage = this._calculateDamage(playerChar, opponentChar, ability, true);

        // Play Animation
        this.animator.playAttackSequence('PLAYER', ability, damage, 
            () => { // On Hit
                const currentState = gameState.getState();
                let newHP = Math.max(0, currentState.opponentHP - damage);
                
                // Apply life steal if present
                let newPlayerHP = currentState.playerHP;
                if (currentState.lifeSteal) {
                    newPlayerHP = Math.min(
                        currentState.maxHP + currentState.maxHPBonus,
                        newPlayerHP + currentState.lifeSteal
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

    _performOpponentTurn() {
        const state = gameState.getState();
        // Check if battle ended during delay
        if (state.mode !== 'BATTLE' || state.turn !== 'OPPONENT') return;

        // Use pre-decided intent
        const intent = state.opponentIntent;
        if (!intent) {
            // Fallback if somehow intent wasn't set
            this._decideOpponentIntent();
            return this._performOpponentTurn();
        }

        const abilityId = intent.abilityId;

        gameState.updateState({ 
            turn: 'BUSY',
            executingAbilityId: abilityId,
            executingAttacker: 'OPPONENT',
            opponentIntent: null // Clear intent once used
        });

        const opponentChar = CHARACTER_DATA[state.opponentCharacterIndex];
        const playerChar = CHARACTER_DATA[state.playerCharacterIndex];
        const ability = ABILITY_POOL.find(a => a.id === abilityId);

        // Recalculate damage with current systems state
        const damage = this._calculateDamage(opponentChar, playerChar, ability, false);

        // Broadcast ability used for UI indicators
        globalBus.emit(EVENTS.ABILITY_USED, {
            attacker: 'OPPONENT',
            abilityId: ability.id,
            abilityName: ability.name
        });

        this.animator.playAttackSequence('OPPONENT', ability, damage,
            () => { // On Hit
                let newHP = Math.max(0, state.playerHP - damage);
                gameState.updateState({ playerHP: newHP });

                globalBus.emit(EVENTS.DAMAGE_APPLIED, {
                    target: 'PLAYER',
                    amount: damage
                });
            },
            () => { // On Complete
                gameState.updateState({ executingAbilityId: null, executingAttacker: null });
                if (gameState.getState().playerHP <= 0) {
                    gameState.updateState({ turn: 'DEFEAT' });
                } else {
                    gameState.updateState({ turn: 'PLAYER' });
                }
            }
        );
    }

    _calculateDamage(attacker, defender, ability, isPlayer = false) {
        const state = gameState.getState();
        
        // domain: physical, elemental, psychic
        // type: power, finesse
        let atkVal = attacker.stats[ability.domain][ability.damageType];
        
        // Apply stat boosts (only for player)
        if (isPlayer && state.statBoosts) {
            atkVal += state.statBoosts[ability.domain] || 0;
        }
        
        // Use resistance of the same domain
        let defVal = defender.stats[ability.domain].resistance;
        
        // Apply defender stat boosts if defender is player
        if (!isPlayer && state.statBoosts) {
            defVal += state.statBoosts[ability.domain] || 0;
        }

        // Simple formula: Base + (Atk * 2) - Def
        const basePower = 5;
        let damage = basePower + (atkVal * 2.5) - (defVal * 1.5);
        
        // Apply entropy multiplier (only for player to make it meaningful)
        if (isPlayer) {
            damage *= this.entropy.getDamageMultiplier();
        }
        
        // Apply momentum multiplier (only for player)
        if (isPlayer) {
            damage *= this.momentum.getDamageMultiplier(ability.domain);
        }
        
        // Apply player damage multiplier
        if (isPlayer && state.damageMultiplier) {
            damage *= state.damageMultiplier;
        }
        
        // Enemy scaling based on battle count
        if (!isPlayer && state.battleCount) {
            const scaling = 1 + (state.battleCount - 1) * 0.1;
            damage *= scaling;
        }
        
        // Variation
        damage += (Math.random() * 4) - 2;

        // Apply Guard reduction
        if (state.playerGuarding && !isPlayer) {
            damage *= 0.5; // 50% damage reduction
        }

        return Math.max(1, Math.round(damage));
    }
}