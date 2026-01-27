import { globalBus, EVENTS } from '../../core/events/EventBus.js';
import { gameState } from '../../data/store/StateStore.js';

export class GameOverMenu {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.element = null;
        this._setup();
        
        globalBus.on(EVENTS.STATE_CHANGED, this._onStateChange.bind(this));
    }

    _setup() {
        this.element = document.createElement('div');
        this.element.className = 'game-over-menu';
        this.container.appendChild(this.element);
    }

    _onStateChange(state) {
        if (state.turn === 'DEFEAT') {
            this._show(state);
        } else {
            this.element.style.display = 'none';
        }
    }

    _show(state) {
        this.element.style.display = 'flex';
        this.element.innerHTML = `
            <h2 class="game-over-title">Gallows Await</h2>
            <div class="game-over-stats">
                <p>You survived <strong>${state.battleCount}</strong> battles</p>
                <p>Record: <strong>${state.highestStreak}</strong></p>
            </div>
            <button class="retry-btn">Return to Character Selection</button>
        `;

        const retryBtn = this.element.querySelector('.retry-btn');
        retryBtn.onclick = () => {
            gameState.updateState({
                mode: 'MENU',
                turn: 'PLAYER',
                battleCount: 0,
                playerHP: 100,
                opponentHP: 100,
                opponentIntent: null,
                selectedAbilityId: null,
                executingAbilityId: null
            });
        };
    }
}