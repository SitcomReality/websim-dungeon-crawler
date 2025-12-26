import { globalBus, EVENTS } from '../../core/events/EventBus.js';
import { CHARACTER_DATA } from '../../data/CharacterData.js';

export class CharacterSelectMenu {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.root = null;
        this._render();
    }

    _render() {
        this.root = document.createElement('div');
        this.root.className = 'char-select';

        const grid = document.createElement('div');
        grid.className = 'char-grid';

        CHARACTER_DATA.forEach((char, index) => {
            const card = document.createElement('button');
            card.className = 'char-card';
            card.type = 'button';
            card.textContent = char.name;
            card.addEventListener('click', (e) => {
                e.preventDefault();
                this._startNewGame(index);
            });
            grid.appendChild(card);
        });

        this.root.appendChild(grid);
        this.container.appendChild(this.root);

        // Hide menu when game leaves MENU mode (future-proof)
        globalBus.on(EVENTS.STATE_CHANGED, (state) => {
            if (!state || state.mode !== 'MENU') {
                this.hide();
            }
        });
    }

    _startNewGame(characterIndex) {
        globalBus.emit(EVENTS.NEW_GAME, { characterIndex });
    }

    hide() {
        if (this.root) {
            this.root.style.display = 'none';
        }
    }
}