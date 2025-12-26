import { globalBus, EVENTS } from '../../core/events/EventBus.js';
import { CHARACTER_DATA } from '../../data/CharacterData.js';
import { ASSETS } from '../../config/assets.js';
import { SPRITE_SIZE } from '../../config/dimensions.js';

export class CharacterSelectMenu {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.selectedIndex = Math.floor(Math.random() * CHARACTER_DATA.length);
        this.root = null;
        this._render();
        
        // Hide menu when game leaves MENU mode
        globalBus.on(EVENTS.STATE_CHANGED, (state) => {
            if (state && state.mode !== 'MENU') {
                this.hide();
            } else if (state && state.mode === 'MENU') {
                this.show();
            }
        });
    }

    _render() {
        this.root = document.createElement('div');
        this.root.className = 'char-select-carousel';

        // Title/Name Area
        this.nameDisplay = document.createElement('h2');
        this.nameDisplay.className = 'selected-char-name';
        this.root.appendChild(this.nameDisplay);

        // Carousel Container
        const carousel = document.createElement('div');
        carousel.className = 'carousel-container';

        // Left Arrow
        const leftBtn = document.createElement('button');
        leftBtn.className = 'carousel-nav-btn left';
        leftBtn.innerHTML = '◀';
        leftBtn.onclick = () => this._navigate(-1);
        carousel.appendChild(leftBtn);

        // Sprite Display Area
        this.displayArea = document.createElement('div');
        this.displayArea.className = 'sprite-display-area';
        
        this.prevSprite = this._createSpriteElement('prev');
        this.currSprite = this._createSpriteElement('curr');
        this.nextSprite = this._createSpriteElement('next');

        this.displayArea.appendChild(this.prevSprite);
        this.displayArea.appendChild(this.currSprite);
        this.displayArea.appendChild(this.nextSprite);
        carousel.appendChild(this.displayArea);

        // Right Arrow
        const rightBtn = document.createElement('button');
        rightBtn.className = 'carousel-nav-btn right';
        rightBtn.innerHTML = '▶';
        rightBtn.onclick = () => this._navigate(1);
        carousel.appendChild(rightBtn);

        this.root.appendChild(carousel);

        // Confirm Button
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'confirm-game-btn';
        confirmBtn.textContent = 'Enter Dungeon';
        confirmBtn.onclick = () => this._startNewGame();
        this.root.appendChild(confirmBtn);

        this.container.appendChild(this.root);
        this._updateView();
    }

    _createSpriteElement(className) {
        const el = document.createElement('div');
        el.className = `char-preview-sprite ${className}`;
        el.style.backgroundImage = `url(${ASSETS.CHARACTER_SPRITESHEET})`;
        // Spritesheet is 4x4 of 256px = 1024px
        el.style.backgroundSize = `400% 400%`; 
        return el;
    }

    _navigate(delta) {
        const count = CHARACTER_DATA.length;
        this.selectedIndex = (this.selectedIndex + delta + count) % count;
        this._updateView();
    }

    _updateView() {
        const count = CHARACTER_DATA.length;
        const current = CHARACTER_DATA[this.selectedIndex];
        const prev = CHARACTER_DATA[(this.selectedIndex - 1 + count) % count];
        const next = CHARACTER_DATA[(this.selectedIndex + 1) % count];

        this.nameDisplay.textContent = current.name;

        this._setSpritePosition(this.currSprite, current);
        this._setSpritePosition(this.prevSprite, prev);
        this._setSpritePosition(this.nextSprite, next);
    }

    _setSpritePosition(element, charData) {
        // background-position uses percentages for simpler mapping in some cases, 
        // but with a fixed 4x4 grid, steps of 33.333% work, or exact pixels.
        // x: 0, 1, 2, 3 -> 0%, 33.33%, 66.66%, 100%
        const px = (charData.gridX / 3) * 100;
        const py = (charData.gridY / 3) * 100;
        element.style.backgroundPosition = `${px}% ${py}%`;
    }

    _startNewGame() {
        globalBus.emit(EVENTS.NEW_GAME, { characterIndex: this.selectedIndex });
    }

    hide() {
        if (this.root) this.root.style.display = 'none';
    }

    show() {
        if (this.root) this.root.style.display = 'flex';
    }
}