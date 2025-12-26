import { globalBus, EVENTS } from '../../core/events/EventBus.js';
import { gameState } from '../../data/store/StateStore.js';
import { CHARACTER_DATA } from '../../data/CharacterData.js';
import { ABILITY_POOL } from '../../data/AbilityData.js';

export class BattleMenu {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.element = null;
        this._setup();
        
        globalBus.on(EVENTS.STATE_CHANGED, this._render.bind(this));
    }

    _setup() {
        this.element = document.createElement('div');
        this.element.className = 'battle-menu';
        this.container.appendChild(this.element);
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
        
        // Avoid re-creating buttons every frame if same character
        // But state change isn't every frame, so it's okay.
        this.element.innerHTML = '';

        const playerChar = CHARACTER_DATA[state.playerCharacterIndex];
        
        playerChar.abilities.forEach(abilityId => {
            const ability = ABILITY_POOL.find(a => a.id === abilityId);
            if (!ability) return;

            const btn = document.createElement('button');
            btn.className = `ability-btn ${ability.domain}`; // class for styling
            btn.innerHTML = `
                <span class="ability-name">${ability.name}</span>
                <span class="ability-type">${ability.damageType}</span>
            `;
            
            btn.onclick = () => {
                globalBus.emit(EVENTS.PLAYER_ACTION, { abilityId });
            };

            this.element.appendChild(btn);
        });
    }
}