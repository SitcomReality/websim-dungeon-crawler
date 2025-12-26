import { ASSETS } from './config/assets.js';
import { AssetLoader } from './utils/AssetLoader.js';
import { CanvasManager } from './systems/render/CanvasManager.js';
import { RoomRenderer } from './systems/render/RoomRenderer.js';
import { CharacterRenderer } from './systems/render/CharacterRenderer.js';
import { DirectionalButtons } from './ui/controls/DirectionalButtons.js';
import { CharacterSelectMenu } from './ui/menu/CharacterSelectMenu.js';
import { BattleMenu } from './ui/battle/BattleMenu.js';
import { HealthBarRenderer } from './systems/render/HealthBarRenderer.js';
import { gameState } from './data/store/StateStore.js';
import { GameLoop } from './core/loop/GameLoop.js';
import { globalBus, EVENTS } from './core/events/EventBus.js';
import { Navigator } from './systems/navigation/Navigator.js';
import { BattleManager } from './systems/battle/BattleManager.js';
import { BattleAnimator } from './systems/battle/BattleAnimator.js';
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
        
        this.battleManager = null;
        this.battleAnimator = null;
        this.battleMenu = null;
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
        this.charSelectMenu = new CharacterSelectMenu('ui-layer');
        
        // Battle Systems
        this.battleAnimator = new BattleAnimator();
        this.battleManager = new BattleManager(this.battleAnimator);
        this.battleMenu = new BattleMenu('ui-layer');

        this.loop = new GameLoop();

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

        // Scale characters to 50%
        const scale = 0.5;
        const horizontalMargin = 20;

        const drawHeight = Math.round(SPRITE_SIZE * scale);
        const groundY = ROOM_HEIGHT - drawHeight;

        // Get Animation Offsets
        const { playerOffset, opponentOffset } = this.battleAnimator;

        // Player on the left
        if (playerCharacterIndex !== null) {
            const playerX = horizontalMargin + playerOffset.x;
            const playerY = groundY + playerOffset.y;
            this.charRenderer.drawCharacter(playerCharacterIndex, playerX, playerY, { flipped: false, scale });

            const barWidth = 90;
            const barHeight = 8;
            const barX = horizontalMargin; // Keep bar stationary? Or move with char? Moving with char looks better usually.
            const barY = groundY - 14;
            
            // Draw bar at static position to prevent jitter/vomit inducing movement
            this.healthBarRenderer.drawBar(barX, barY, barWidth, barHeight, playerHP, maxHP);
        }

        // Opponent on the right, facing left (flipped)
        if (opponentCharacterIndex !== null) {
            const opponentDrawWidth = Math.round(SPRITE_SIZE * scale);
            const opponentBaseX = ROOM_WIDTH - opponentDrawWidth - horizontalMargin;
            const opponentX = opponentBaseX + opponentOffset.x;
            const opponentY = groundY + opponentOffset.y;
            this.charRenderer.drawCharacter(opponentCharacterIndex, opponentX, opponentY, { flipped: true, scale });

            const barWidth = 90;
            const barHeight = 8;
            const barX = opponentBaseX;
            const barY = groundY - 14;
            this.healthBarRenderer.drawBar(barX, barY, barWidth, barHeight, opponentHP, maxHP);
        }

        // Draw Battle Effects
        this.battleAnimator.draw(this.canvasManager.context);
    }
}

// Bootstrap
const game = new Game();
game.init();