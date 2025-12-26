import { ASSETS } from './config/assets.js';
import { AssetLoader } from './utils/AssetLoader.js';
import { CanvasManager } from './systems/render/CanvasManager.js';
import { RoomRenderer } from './systems/render/RoomRenderer.js';
import { CharacterRenderer } from './systems/render/CharacterRenderer.js';
import { DirectionalButtons } from './ui/controls/DirectionalButtons.js';
import { CharacterSelectMenu } from './ui/menu/CharacterSelectMenu.js';
import { HealthBarRenderer } from './systems/render/HealthBarRenderer.js';
import { gameState } from './data/store/StateStore.js';
import { GameLoop } from './core/loop/GameLoop.js';
import { globalBus, EVENTS } from './core/events/EventBus.js';
import { Navigator } from './systems/navigation/Navigator.js';
import { ROOM_WIDTH, ROOM_HEIGHT, SPRITE_SIZE } from './config/dimensions.js';

class Game {
    constructor() {
        this.canvasManager = null;
        this.roomRenderer = null;
        this.charRenderer = null;
        this.healthBarRenderer = null;
        this.navControls = null;
        this.navigator = null;
        this.loop = null;
        this.textures = null;
        this.charSprites = null;
        this.charSelectMenu = null;
    }

    async init() {
        console.log('Initializing game...');
        
        // Load Assets
        try {
            const [textures, charSprites] = await Promise.all([
                AssetLoader.loadImage(ASSETS.WALL_TEXTURES),
                AssetLoader.loadImage(ASSETS.CHARACTER_SPRITESHEET)
            ]);
            this.textures = textures;
            this.charSprites = charSprites;
            console.log('Assets loaded');
        } catch (e) {
            console.error('Failed to load assets', e);
            return;
        }

        // Initialize Systems
        this.canvasManager = new CanvasManager('game-canvas');
        this.roomRenderer = new RoomRenderer(this.canvasManager.context, this.textures);
        this.charRenderer = new CharacterRenderer(this.canvasManager.context, this.charSprites);
        this.healthBarRenderer = new HealthBarRenderer(this.canvasManager.context);
        this.navControls = new DirectionalButtons('ui-layer');
        this.navigator = new Navigator();
        this.loop = new GameLoop();
        this.charSelectMenu = new CharacterSelectMenu('ui-layer');

        // Setup Render Loop
        globalBus.on(EVENTS.TICK, this.render.bind(this));

        // Start Loop
        this.loop.start();
    }

    render() {
        const state = gameState.getState();
        const { mode, roomX, roomY } = state;

        if (mode !== 'BATTLE') {
            this.canvasManager.clear();
            return;
        }

        // 1. Draw Background
        this.roomRenderer.draw(roomX, roomY);

        // 2. Draw participants with health bars
        this._renderBattle(state);
    }

    _renderBattle(state) {
        const {
            playerCharacterIndex,
            opponentCharacterIndex,
            playerHP,
            opponentHP,
            maxHP
        } = state;

        const groundY = ROOM_HEIGHT - SPRITE_SIZE;
        const horizontalMargin = 40;

        // Player on the left
        if (playerCharacterIndex !== null) {
            const playerX = horizontalMargin;
            const playerY = groundY;
            this.charRenderer.drawCharacter(playerCharacterIndex, playerX, playerY, { flipped: false });

            const barWidth = 90;
            const barHeight = 8;
            const barX = playerX;
            const barY = playerY - 14;
            this.healthBarRenderer.drawBar(barX, barY, barWidth, barHeight, playerHP, maxHP);
        }

        // Opponent on the right, facing left (flipped)
        if (opponentCharacterIndex !== null) {
            const opponentX = ROOM_WIDTH - SPRITE_SIZE - horizontalMargin;
            const opponentY = groundY;
            this.charRenderer.drawCharacter(opponentCharacterIndex, opponentX, opponentY, { flipped: true });

            const barWidth = 90;
            const barHeight = 8;
            const barX = opponentX;
            const barY = opponentY - 14;
            this.healthBarRenderer.drawBar(barX, barY, barWidth, barHeight, opponentHP, maxHP);
        }
    }
}

// Bootstrap
const game = new Game();
game.init();