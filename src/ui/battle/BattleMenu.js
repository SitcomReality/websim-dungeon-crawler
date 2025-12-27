import { globalBus, EVENTS } from '../../core/events/EventBus.js';
import { gameState } from '../../data/store/StateStore.js';
import { CHARACTER_DATA } from '../../data/CharacterData.js';
import { ABILITY_POOL } from '../../data/AbilityData.js';

export class BattleMenu {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.element = null;
        this.selectedAbilityId = null;
        this._setup();
        
        globalBus.on(EVENTS.STATE_CHANGED, this._onStateChange.bind(this));
    }

    _setup() {
        this.element = document.createElement('div');
        this.element.className = 'battle-menu';
        this.container.appendChild(this.element);
    }

    _onStateChange(state) {
        // Reset selection if it's no longer the player's turn or we leave battle
        if (state.turn !== 'PLAYER' || state.mode !== 'BATTLE') {
            this.selectedAbilityId = null;
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
        const selectedAbility = ABILITY_POOL.find(a => a.id === this.selectedAbilityId);

        // 1. Render Description Panel if an ability is selected
        if (selectedAbility) {
            const detailPanel = document.createElement('div');
            detailPanel.className = 'ability-detail-panel';
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
                    Uses <i class="icon ${selectedAbility.damageType}"></i> 
                    ${selectedAbility.damageType} attribute
                </div>
                <button class="confirm-ability-btn">Execute Action</button>
            `;
            
            const confirmBtn = detailPanel.querySelector('.confirm-ability-btn');
            confirmBtn.onclick = (e) => {
                e.stopPropagation();
                globalBus.emit(EVENTS.PLAYER_ACTION, { abilityId: selectedAbility.id });
                this.selectedAbilityId = null;
            };

            this.element.appendChild(detailPanel);
        }

        // 2. Render Ability Buttons Container
        const buttonList = document.createElement('div');
        buttonList.className = 'ability-list';
        
        playerChar.abilities.forEach(abilityId => {
            const ability = ABILITY_POOL.find(a => a.id === abilityId);
            if (!ability) return;

            const btn = document.createElement('button');
            const isSelected = this.selectedAbilityId === ability.id;
            btn.className = `ability-btn ${ability.domain} ${isSelected ? 'selected' : ''}`;
            btn.innerHTML = `
                <span class="ability-name">${ability.name}</span>
                <span class="ability-type">
                    <i class="icon ${ability.damageType}"></i>
                    ${ability.damageType}
                </span>
            `;
            
            btn.onclick = () => {
                this.selectedAbilityId = ability.id;
                this._render(gameState.getState());
            };

            buttonList.appendChild(btn);
        });

        this.element.appendChild(buttonList);
    }
}