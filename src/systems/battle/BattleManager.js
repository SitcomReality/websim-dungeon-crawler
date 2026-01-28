import { globalBus, EVENTS } from '../../core/events/EventBus.js';
import { gameState } from '../../data/store/StateStore.js';
import { ABILITY_POOL, ALL_ABILITIES, UNLOCKABLE_ABILITIES } from '../../data/AbilityData.js';
import { CHARACTER_DATA } from '../../data/CharacterData.js';
import { EntropySystem } from '../mechanics/EntropySystem.js';
import { CooldownSystem } from '../mechanics/CooldownSystem.js';
import { MomentumSystem } from '../mechanics/MomentumSystem.js';
import { StatusEffectSystem } from '../mechanics/StatusEffectSystem.js';
import { ABILITY_ENTROPY_COSTS } from '../mechanics/constants.js';

export class BattleManager {
    constructor(animator) {
        this.animator = animator;
        
        // Initialize game systems
        this.entropy = new EntropySystem();
        this.cooldowns = new CooldownSystem();
        this.momentum = new MomentumSystem();
        this.statusEffects = new StatusEffectSystem();
        
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

    _decideOpponentIntent() {
        const state = gameState.getState();
        const opponentChar = CHARACTER_DATA[state.opponentCharacterIndex];
        const playerChar = CHARACTER_DATA[state.playerCharacterIndex];
        
        if (!opponentChar || !playerChar) return;

        // Filter abilities based on domain locks
        const availableAbilities = opponentChar.abilities.filter(abilityId => {
            const ability = ABILITY_POOL.find(a => a.id === abilityId);
            return ability && !this.statusEffects.isDomainLocked('OPPONENT', ability.domain);
        });

        const abilityId = availableAbilities.length > 0 
            ? availableAbilities[Math.floor(Math.random() * availableAbilities.length)]
            : opponentChar.abilities[0];
            
        const ability = ALL_ABILITIES.find(a => a.id === abilityId);
        const damage = this._calculateDamage(opponentChar, playerChar, ability, false);

        gameState.updateState({
            opponentIntent: {
                abilityId,
                predictedDamage: damage,
                statusEffects: ability.statusEffects || []
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
            this._applyStatusEffects(ability, 'PLAYER', 'PLAYER');
            globalBus.emit(EVENTS.HEAL_APPLIED, { target: 'PLAYER', amount: 'RESTORING' });
            globalBus.emit(EVENTS.ABILITY_USED, { attacker: 'PLAYER', abilityId, abilityName: 'Resting...' });
            gameState.updateState({ turn: 'OPPONENT', selectedAbilityId: null });
            return;
        }

        if (abilityId === 'guard') {
            this._applyStatusEffects(ability, 'PLAYER', 'PLAYER');
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
            damageBonus = 1.5; // 50% bonus vs low HP
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
        let damage = this._calculateDamage(playerChar, opponentChar, ability, true);
        if (damageBonus) damage *= (1 + damageBonus);

        // Play Animation
        this.animator.playAttackSequence('PLAYER', ability, damage, 
            () => { // On Hit
                const currentState = gameState.getState();
                let newHP = Math.max(0, currentState.opponentHP - damage);
                
                // Apply status effects
                this._applyStatusEffects(ability, 'PLAYER', 'OPPONENT');
                
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

        if (isPlayerAttacking) {
            let damage = this._calculateDamage(playerChar, opponentChar, ability, true);
            if (ability.special === 'execute' && state.opponentHP < state.opponentHP * 0.3) {
                damage *= 1.5;
            }
            if (ability.special === 'chain' && this.statusEffects.hasEffect('OPPONENT', 'shocked')) {
                damage *= 2.0;
            }
            return damage;
        } else {
            return this._calculateDamage(opponentChar, playerChar, ability, false);
        }
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
        const ability = ALL_ABILITIES.find(a => a.id === abilityId);

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
                const currentState = gameState.getState();
                
                // Apply status effects
                this._applyStatusEffects(ability, 'OPPONENT', 'PLAYER');
                
                // Process player status effects (their turn just ended)
                const playerEffectResults = this.statusEffects.processTurnEnd('PLAYER', this);
                let totalDoTDamage = 0;
                playerEffectResults.forEach(result => {
                    if (result.type === 'damage') {
                        totalDoTDamage += result.amount;
                    }
                });
                
                let finalDamage = damage + totalDoTDamage;
                
                // Apply damage reduction
                if (currentState.damageReduction) {
                    finalDamage *= (1 - currentState.damageReduction);
                    finalDamage = Math.max(1, Math.round(finalDamage));
                }
                
                // Check for fate thread
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
                
                // Gain entropy when hit
                if (currentState.entropyOnHit && newHP > 0) {
                    this.entropy.add(currentState.entropyOnHit);
                }
                
                gameState.updateState({ playerHP: newHP });

                globalBus.emit(EVENTS.DAMAGE_APPLIED, {
                    target: 'PLAYER',
                    amount: damage
                });
                
                if (totalDoTDamage > 0) {
                    setTimeout(() => {
                        globalBus.emit(EVENTS.DAMAGE_APPLIED, {
                            target: 'PLAYER',
                            amount: totalDoTDamage
                        });
                    }, 200);
                }
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

    _applyStatusEffects(ability, attacker, defender) {
        if (!ability.statusEffects) return;
        
        ability.statusEffects.forEach(effectData => {
            const roll = Math.random();
            if (roll < effectData.chance) {
                const target = effectData.target === 'self' ? attacker : defender;
                this.statusEffects.addEffect(target, effectData.effect);
            }
        });
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
        
        // Enemy scaling based on battle count (reduced)
        if (!isPlayer && state.battleCount) {
            const scaling = 1 + (state.battleCount - 1) * 0.06; // Reduced from 0.1
            damage *= scaling;
        }
        
        // Apply status effect damage modifiers (attacker's outgoing modifiers)
        const attackerSide = isPlayer ? 'PLAYER' : 'OPPONENT';
        damage = this.statusEffects.modifyOutgoingDamage(attackerSide, damage, ability);
        
        // Apply status effect incoming damage modifiers (defender's incoming modifiers)
        const defenderSide = isPlayer ? 'OPPONENT' : 'PLAYER';
        damage = this.statusEffects.modifyIncomingDamage(defenderSide, damage);
        
        // Variation
        damage += (Math.random() * 4) - 2;

        // Apply Guard reduction
        if (state.playerGuarding && !isPlayer) {
            damage *= 0.5; // 50% damage reduction
        }

        return Math.max(1, Math.round(damage));
    }
}