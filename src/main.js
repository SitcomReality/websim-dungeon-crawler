import { ASSETS } from './config/assets.js';
import { AssetLoader } from './utils/AssetLoader.js';
import { CanvasManager } from './systems/render/CanvasManager.js';
import { RoomRenderer } from './systems/render/RoomRenderer.js';
import { CharacterRenderer } from './systems/render/CharacterRenderer.js';
import { DirectionalButtons } from './ui/controls/DirectionalButtons.js';
import { gameState } from './data/store/StateStore.js';
import { GameLoop } from './core/loop/GameLoop.js';
import { globalBus, EVENTS } from './core/events/EventBus.js';
import { Navigator } from './systems/navigation/Navigator.js';

class Game {
    constructor() {
        this.canvasManager = null;
        this.roomRenderer = null;
        this.navControls = null;
        this.navigator = null;
        this.loop = null;
        this.textures = null;
        this.charSprites = null;
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
        this.navControls = new DirectionalButtons('ui-layer');
        this.navigator = new Navigator();
        this.loop = new GameLoop();

        // Setup Render Loop
        globalBus.on(EVENTS.TICK, this.render.bind(this));

        // Initial Render
        const { roomX, roomY } = gameState.getState();
        this.roomRenderer.draw(roomX, roomY);

        // Start Loop
        this.loop.start();
    }

    render() {
        const { roomX, roomY, characterIndex } = gameState.getState();
        
        // 1. Draw Background
        this.roomRenderer.draw(roomX, roomY);

        // 2. Draw Character if present in room
        if (characterIndex !== -1) {
            this.charRenderer.drawCharacter(characterIndex, 0, 0);
        }
    }
}

// Bootstrap
const game = new Game();
game.init();