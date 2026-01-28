import { globalBus, EVENTS } from '../../core/events/EventBus.js';
import { gameState } from '../../data/store/StateStore.js';
import { CHARACTER_DATA } from '../../data/CharacterData.js';
import { ABILITY_POOL, ALL_ABILITIES } from '../../data/AbilityData.js';
import { ABILITY_ENTROPY_COSTS } from '../../systems/mechanics/constants.js';
import { STATUS_EFFECTS } from '../../systems/mechanics/StatusEffectSystem.js';

export class BattleMenu {
    constructor(containerId, battleManager) {
        this.container = document.getElementById(containerId);
        this.battleManager = battleManager;
        this.element = null;
        this.selectedAbilityId = null;
        this._setup();
        
        globalBus.on(EVENTS.STATE_CHANGED, this._onStateChange.bind(this));
        globalBus.on(EVENTS.TICK, this._onTick.bind(this));
    }

    _onTick() {
        // Update UI if visible
        const state = gameState.getState();
        if (state.mode === 'BATTLE' && state.turn === 'PLAYER') {
            this._updateResourceDisplays();
        }
    }

    _setup() {
        this.element = document.createElement('div');
        this.element.className = 'battle-menu';
        this.container.appendChild(this.element);
    }

    _onStateChange(state) {
        // Reset selection if it's no longer the player's turn or we leave battle
        if (state.turn !== 'PLAYER' || state.mode !== 'BATTLE') {
            if (state.selectedAbilityId !== null) {
                gameState.updateState({ selectedAbilityId: null });
            }
        }
        this._render(state);
    }

    _render(state) {
        if (state.mode !== 'BATTLE') {
            this.element.style.display = 'none';
            return;
        }

        // Only show controls if it's PLAYER turn
        if (state.turn !== 'PLAYER') {
            this.element.style.display = 'none';
            return;
        }

        this.element.style.display = 'flex';
        this.element.innerHTML = '';

        const playerChar = CHARACTER_DATA[state.playerCharacterIndex];
        const selectedAbility = ALL_ABILITIES.find(a => a.id === state.selectedAbilityId);
        
        // Get all available abilities (base + unlocked)
        const allPlayerAbilities = [...playerChar.abilities, ...(state.unlockedAbilities || [])];

        // 0. Render Basic Actions (Always available)
        const basicActionsContainer = document.createElement('div');
        basicActionsContainer.className = 'basic-actions-list';
        ['rest', 'guard'].forEach(id => {
            const action = ABILITY_POOL.find(a => a.id === id);
            const btn = document.createElement('button');
            const isSelected = state.selectedAbilityId === id;
            btn.className = `basic-action-btn ${isSelected ? 'selected' : ''}`;
            btn.innerHTML = `<span class="basic-action-icon">${id === 'rest' ? '💤' : '🛡️'}</span> ${action.name}`;
            btn.onclick = () => gameState.updateState({ selectedAbilityId: id });
            basicActionsContainer.appendChild(btn);
        });
        this.element.appendChild(basicActionsContainer);

        // 0.5 Render Resource Display (Entropy & Momentum)
        this._renderResourceDisplay();

        // 1. Render Description Panel if an ability is selected
        if (selectedAbility) {
            const isOffensive = !['rest', 'guard'].includes(selectedAbility.id);
            const predictedDamage = isOffensive ? this.battleManager.getPredictedDamage(selectedAbility.id, true) : null;

            const detailPanel = document.createElement('div');
            detailPanel.className = 'ability-detail-panel';
            
            // Build status effects display
            let statusEffectsHtml = '';
            if (selectedAbility.statusEffects && selectedAbility.statusEffects.length > 0) {
                statusEffectsHtml = '<div class="detail-status-effects">';
                selectedAbility.statusEffects.forEach(effectData => {
                    const effectDef = this._getStatusEffectDef(effectData.effect);
                    if (effectDef) {
                        const chance = Math.round(effectData.chance * 100);
                        const target = effectData.target === 'self' ? 'you' : 'enemy';
                        statusEffectsHtml += `<span class="status-effect-tag" style="color: ${effectDef.color}">${effectDef.icon} ${effectDef.name} (${chance}% on ${target})</span>`;
                    }
                });
                statusEffectsHtml += '</div>';
            }
            
            detailPanel.innerHTML = `
                <div class="detail-header">
                    <span class="detail-name">${selectedAbility.name}</span>
                    <span class="detail-domain ${selectedAbility.domain}">
                        <i class="icon ${selectedAbility.domain}"></i>
                        ${selectedAbility.domain}
                    </span>
                </div>
                <div class="detail-desc">${selectedAbility.description}</div>
                <div class="detail-stats">
                    ${predictedDamage !== null ? `<span class="detail-prediction">Deals approx. <strong>${predictedDamage}</strong> damage</span>` : ''}
                    <span>Uses <i class="icon ${selectedAbility.damageType}"></i> ${selectedAbility.damageType}</span>
                </div>
                ${statusEffectsHtml}
                <button class="confirm-ability-btn">Execute Action</button>
            `;
            
            const confirmBtn = detailPanel.querySelector('.confirm-ability-btn');
            confirmBtn.onclick = (e) => {
                e.stopPropagation();
                globalBus.emit(EVENTS.PLAYER_ACTION, { abilityId: selectedAbility.id });
            };

            this.element.appendChild(detailPanel);
        }

        // 2. Render Ability Buttons Container
        const buttonList = document.createElement('div');
        buttonList.className = 'ability-list';
        
        allPlayerAbilities.forEach(abilityId => {
            const ability = ALL_ABILITIES.find(a => a.id === abilityId);
            if (!ability) return;

            const entropyCost = ABILITY_ENTROPY_COSTS[abilityId] || 0;
            const cooldown = this.battleManager.getCooldown(abilityId);
            const canUse = this.battleManager.canUseAbility(abilityId);
            const isLocked = this.battleManager.statusEffects.isDomainLocked('PLAYER', ability.domain);

            const btn = document.createElement('button');
            const isSelected = this.selectedAbilityId === ability.id;
            btn.className = `ability-btn ${ability.domain} ${isSelected ? 'selected' : ''} ${!canUse ? 'disabled' : ''}`;
            
            let statusText = '';
            if (isLocked) {
                statusText = `<span class="ability-locked">🔒 Locked</span>`;
            } else if (cooldown > 0) {
                statusText = `<span class="ability-cooldown">${cooldown} turn${cooldown > 1 ? 's' : ''}</span>`;
            } else if (!canUse) {
                statusText = `<span class="ability-cost-high">${entropyCost}E</span>`;
            } else {
                statusText = `<span class="ability-cost">${entropyCost}E</span>`;
            }

            btn.innerHTML = `
                <span class="ability-name">${ability.name}</span>
                <span class="ability-type">
                    <i class="icon ${ability.damageType}"></i>
                    ${ability.damageType}
                </span>
                ${statusText}
            `;
            
            btn.onclick = () => {
                if (canUse) {
                    gameState.updateState({ selectedAbilityId: ability.id });
                }
            };

            buttonList.appendChild(btn);
        });

        this.element.appendChild(buttonList);
    }
    
    _getStatusEffectDef(effectId) {
        return STATUS_EFFECTS[effectId];
    }

    _renderResourceDisplay() {
        const resourcePanel = document.createElement('div');
        resourcePanel.className = 'resource-panel';
        resourcePanel.id = 'resource-display';
        
        // Entropy bar
        const entropy = this.battleManager.getEntropy();
        const entropyBar = document.createElement('div');
        entropyBar.className = 'resource-item';
        entropyBar.innerHTML = `
            <div class="resource-label">Entropy</div>
            <div class="resource-bar-container">
                <div class="resource-bar entropy-bar" style="width: ${entropy}%"></div>
                <div class="resource-value">${Math.round(entropy)}</div>
            </div>
        `;
        
        // Momentum display
        const momentum = document.createElement('div');
        momentum.className = 'resource-item momentum-display';
        const domains = ['physical', 'elemental', 'psychic'];
        const momentumHtml = domains.map(d => {
            const stacks = this.battleManager.getMomentum(d);
            return `
                <div class="momentum-item ${d}">
                    <i class="icon ${d}"></i>
                    <span class="momentum-stacks">${stacks}</span>
                </div>
            `;
        }).join('');
        momentum.innerHTML = `
            <div class="resource-label">Momentum</div>
            <div class="momentum-grid">${momentumHtml}</div>
        `;
        
        resourcePanel.appendChild(entropyBar);
        resourcePanel.appendChild(momentum);
        this.element.appendChild(resourcePanel);
    }

    _updateResourceDisplays() {
        const display = document.getElementById('resource-display');
        if (!display) return;

        // Update entropy bar
        const entropy = this.battleManager.getEntropy();
        const entropyBar = display.querySelector('.entropy-bar');
        const entropyValue = display.querySelector('.resource-value');
        if (entropyBar) entropyBar.style.width = `${entropy}%`;
        if (entropyValue) entropyValue.textContent = Math.round(entropy);

        // Update momentum stacks
        const domains = ['physical', 'elemental', 'psychic'];
        domains.forEach(d => {
            const stacks = this.battleManager.getMomentum(d);
            const stacksEl = display.querySelector(`.momentum-item.${d} .momentum-stacks`);
            if (stacksEl) stacksEl.textContent = stacks;
        });
    }
}