import { ASSETS } from './config/assets.js';
import { AssetLoader } from './utils/AssetLoader.js';
import { CanvasManager } from './systems/render/CanvasManager.js';
import { RoomRenderer } from './systems/render/RoomRenderer.js';
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
    }

    async init() {
        console.log('Initializing game...');
        
        // Load Assets
        try {
            this.textures = await AssetLoader.loadImage(ASSETS.WALL_TEXTURES);
            console.log('Textures loaded');
        } catch (e) {
            console.error('Failed to load assets', e);
            return;
        }

        // Initialize Systems
        this.canvasManager = new CanvasManager('game-canvas');
        this.roomRenderer = new RoomRenderer(this.canvasManager.context, this.textures);
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
        // Clear logic if needed (not strictly needed for full screen opaque bg)
        // this.canvasManager.clear();
        
        const { roomX, roomY } = gameState.getState();
        this.roomRenderer.draw(roomX, roomY);
    }
}

// Bootstrap
const game = new Game();
game.init();