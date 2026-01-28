import { ABILITY_ENTROPY_COSTS } from '../mechanics/constants.js';
import { ALL_ABILITIES } from '../../data/AbilityData.js';

/**
 * Handles complex damage math, incorporating stats, momentum, entropy, 
 * status effects, and character-specific multipliers.
 */
export class DamageCalculator {
    /**
     * @param {Object} attacker Character data or stats object
     * @param {Object} defender Character data or stats object
     * @param {Object} ability Ability definition
     * @param {boolean} isPlayer True if attacker is the player
     * @param {Object} systems Object containing entropy, momentum, statusEffects systems
     * @param {Object} state Current global game state
     */
    static calculate(attacker, defender, ability, isPlayer, systems, state) {
        const { entropy, momentum, statusEffects } = systems;
        
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
        if (isPlayer && entropy) {
            damage *= entropy.getDamageMultiplier();
        }
        
        // Apply momentum multiplier (only for player)
        if (isPlayer && momentum) {
            damage *= momentum.getDamageMultiplier(ability.domain);
        }
        
        // Apply player damage multiplier
        if (isPlayer && state.damageMultiplier) {
            damage *= state.damageMultiplier;
        }
        
        // Enemy scaling based on battle count
        if (!isPlayer && state.battleCount) {
            const scaling = 1 + (state.battleCount - 1) * 0.06;
            damage *= scaling;
        }
        
        // Apply status effect damage modifiers (attacker's outgoing modifiers)
        const attackerSide = isPlayer ? 'PLAYER' : 'OPPONENT';
        if (statusEffects) {
            damage = statusEffects.modifyOutgoingDamage(attackerSide, damage, ability);
            
            // Apply status effect incoming damage modifiers (defender's incoming modifiers)
            const defenderSide = isPlayer ? 'OPPONENT' : 'PLAYER';
            damage = statusEffects.modifyIncomingDamage(defenderSide, damage);
        }
        
        // Variation
        damage += (Math.random() * 4) - 2;

        // Apply Guard reduction
        if (state.playerGuarding && !isPlayer) {
            damage *= 0.5; // 50% damage reduction
        }

        return Math.max(1, Math.round(damage));
    }

    /**
     * Simplified version for predictions that doesn't use RNG
     */
    static getPredicted(attacker, defender, ability, isPlayer, systems, state) {
        // We call the main calculator but could theoretically strip RNG here 
        // if we wanted a "perfect" prediction. For now, we reuse the logic.
        return this.calculate(attacker, defender, ability, isPlayer, systems, state);
    }
}