import { ASSETS } from './config/assets.js';
import { AssetLoader } from './utils/AssetLoader.js';
import { CanvasManager } from './systems/render/CanvasManager.js';
import { RoomRenderer } from './systems/render/RoomRenderer.js';
import { CharacterRenderer } from './systems/render/CharacterRenderer.js';
import { StatGridRenderer } from './systems/render/StatGridRenderer.js';

import { CharacterSelectMenu } from './ui/menu/CharacterSelectMenu.js';
import { BattleMenu } from './ui/battle/BattleMenu.js';
import { HealthBarRenderer } from './systems/render/HealthBarRenderer.js';
import { gameState } from './data/store/StateStore.js';
import { GameLoop } from './core/loop/GameLoop.js';
import { globalBus, EVENTS } from './core/events/EventBus.js';
import { Navigator } from './systems/navigation/Navigator.js';
import { BattleManager } from './systems/battle/BattleManager.js';
import { BattleAnimator } from './systems/battle/BattleAnimator.js';
import { BattleIndicatorManager } from './systems/battle/BattleIndicatorManager.js';
import { UpgradeMenu } from './ui/menu/UpgradeMenu.js';
import { GameOverMenu } from './ui/menu/GameOverMenu.js';
import { ROOM_WIDTH, ROOM_HEIGHT, SPRITE_SIZE } from './config/dimensions.js';
import { CHARACTER_DATA } from './data/CharacterData.js';
import { ABILITY_POOL } from './data/AbilityData.js';
import { STATUS_EFFECTS } from './systems/mechanics/StatusEffectSystem.js';

class Game {
    constructor() {
        this.canvasManager = null;
        this.roomRenderer = null;
        this.charRenderer = null;
        this.statGridRenderer = null;
        this.healthBarRenderer = null;
        this.navigator = null;
        this.loop = null;
        this.textures = null;
        this.charSprites = null;
        this.charSelectMenu = null;
        
        this.battleManager = null;
        this.battleAnimator = null;
        this.battleMenu = null;
        this.battleIndicators = null;
        this.upgradeMenu = null;
    }

    async init() {
        console.log('Initializing game...');
        
        // Load Assets
        try {
            const [textures, charSprites, powerIcons] = await Promise.all([
                AssetLoader.loadImage(ASSETS.WALL_TEXTURES),
                AssetLoader.loadImage(ASSETS.CHARACTER_SPRITESHEET),
                AssetLoader.loadImage(ASSETS.POWER_ICONS)
            ]);
            this.textures = textures;
            this.charSprites = charSprites;
            this.powerIcons = powerIcons;
            console.log('Assets loaded');
        } catch (e) {
            console.error('Failed to load assets', e);
            return;
        }

        // Initialize Systems
        this.canvasManager = new CanvasManager('game-canvas');
        this.roomRenderer = new RoomRenderer(this.canvasManager.context, this.textures);
        this.charRenderer = new CharacterRenderer(this.canvasManager.context, this.charSprites);
        this.statGridRenderer = new StatGridRenderer(this.canvasManager.context, this.powerIcons);
        this.healthBarRenderer = new HealthBarRenderer(this.canvasManager.context);
        this.navigator = new Navigator();
        this.charSelectMenu = new CharacterSelectMenu('ui-layer');
        
        // Battle Systems
        this.battleAnimator = new BattleAnimator();
        this.battleManager = new BattleManager(this.battleAnimator);
        this.battleMenu = new BattleMenu('ui-layer', this.battleManager);
        this.battleIndicators = new BattleIndicatorManager();
        this.upgradeMenu = new UpgradeMenu('ui-layer', this.battleManager);
        this.gameOverMenu = new GameOverMenu('ui-layer');

        this.loop = new GameLoop();

        // Setup Render Loop
        globalBus.on(EVENTS.TICK, this.render.bind(this));

        // Start Loop
        this.loop.start();
    }

    render({ deltaTime }) {
        const state = gameState.getState();
        const { mode, roomX, roomY } = state;

        if (mode !== 'BATTLE') {
            this.canvasManager.clear();
            return;
        }

        // Update battle indicators
        if (this.battleIndicators) {
            this.battleIndicators.update(deltaTime);
        }

        // 1. Draw Background
        this.roomRenderer.draw(roomX, roomY);

        // 2. Draw participants with health bars
        this._renderBattle(state);
    }

    /**
     * Draws the opponent's telegraphed move information
     */
    _drawOpponentIntent(x, y, width, damage, domain, statusEffects) {
        const ctx = this.canvasManager.context;
        const iconSize = 12;
        const padding = 2;
        
        ctx.save();
        
        // Background for intent
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x, y, width, 26);
        ctx.strokeStyle = 'rgba(255, 40, 40, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, 26);

        // Icons: Resistance Icon + Domain Icon
        const centerX = x + 10;
        const centerY = y + 3;

        // Draw Player's Resistance Icon (The stat they will use)
        this.statGridRenderer._drawIcon('resistance', centerX, centerY);
        // Draw Domain Icon (The element of the attack)
        this.statGridRenderer._drawIcon(domain, centerX + iconSize + padding, centerY);

        // Text: Predicted Damage
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${damage} DMG`, x + width - 4, y + 10);

        // Status effects
        if (statusEffects && statusEffects.length > 0) {
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'left';
            let offsetX = x + 4;
            statusEffects.forEach(effectData => {
                const effectDef = this._getStatusEffectDef(effectData.effect);
                if (effectDef) {
                    ctx.fillText(effectDef.icon, offsetX, y + 20);
                    offsetX += 14;
                }
            });
        }

        ctx.restore();
    }
    
    _getStatusEffectDef(effectId) {
        return STATUS_EFFECTS[effectId];
    }

    _renderBattle(state) {
        const {
            playerCharacterIndex,
            opponentCharacterIndex,
            playerHP,
            opponentHP,
            maxHP,
            maxHPBonus,
            selectedAbilityId,
            executingAbilityId,
            executingAttacker,
            opponentIntent,
            turn,
            battleCount
        } = state;

        const scale = 0.5;
        const horizontalMargin = 20;
        const drawHeight = Math.round(SPRITE_SIZE * scale);
        const groundY = ROOM_HEIGHT - drawHeight;
        const { playerOffset, opponentOffset } = this.battleAnimator;

        const barWidth = 90;
        const barHeight = 8;
        const gridYOffset = 98;
        const statusEffectSpacing = 16;

        // Determine highlights
        let playerHighlight = null;
        let opponentHighlight = null;
        
        const activeAbilityId = executingAbilityId || selectedAbilityId;
        const currentAttacker = executingAbilityId ? executingAttacker : 'PLAYER';

        if (activeAbilityId) {
            const ability = ABILITY_POOL.find(a => a.id === activeAbilityId);
            if (ability) {
                const rowMap = { power: 0, finesse: 1, resistance: 2 };
                const colMap = { physical: 0, elemental: 1, psychic: 2 };
                const domainCol = colMap[ability.domain];
                const damageRow = rowMap[ability.damageType];
                const resRow = 2; // Resistance is always row 2

                if (currentAttacker === 'PLAYER') {
                    playerHighlight = { row: damageRow, col: domainCol };
                    opponentHighlight = { row: resRow, col: domainCol };
                } else {
                    opponentHighlight = { row: damageRow, col: domainCol };
                    playerHighlight = { row: resRow, col: domainCol };
                }
            }
        }

        // Player on the left
        if (playerCharacterIndex !== null) {
            const playerX = horizontalMargin + playerOffset.x;
            const playerY = groundY + playerOffset.y;
            this.charRenderer.drawCharacter(playerCharacterIndex, playerX, playerY, { flipped: false, scale });

            // Health Bar
            const barX = horizontalMargin;
            const barY = groundY - 14;
            const actualMaxHP = maxHP + (maxHPBonus || 0);
            this.healthBarRenderer.drawBar(barX, barY, barWidth, barHeight, playerHP, actualMaxHP);
            
            // Status Effects
            const playerEffects = this.battleManager.getPlayerStatusEffects();
            this._drawStatusEffects(barX, barY - statusEffectSpacing, playerEffects);
            
            // Battle count indicator
            const ctx = this.canvasManager.context;
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`Battle: ${battleCount || 1}`, barX, groundY - gridYOffset - 20);
            ctx.restore();

            // Stat Grid
            const stats = CHARACTER_DATA[playerCharacterIndex]?.stats;
            if (stats) {
                const gridX = barX + (barWidth / 2) - 15;
                this.statGridRenderer.draw(gridX, groundY - gridYOffset, stats, playerHighlight);
            }

            // Draw Guard Icon
            if (state.playerGuarding) {
                const ctx = this.canvasManager.context;
                ctx.fillStyle = 'rgba(100, 200, 255, 0.6)';
                ctx.font = '16px sans-serif';
                ctx.fillText('🛡️', barX + barWidth + 5, groundY - 5);
            }
        }

        // Opponent on the right
        if (opponentCharacterIndex !== null) {
            const opponentDrawWidth = Math.round(SPRITE_SIZE * scale);
            const opponentBaseX = ROOM_WIDTH - opponentDrawWidth - horizontalMargin;
            const opponentX = opponentBaseX + opponentOffset.x;
            const opponentY = groundY + opponentOffset.y;
            this.charRenderer.drawCharacter(opponentCharacterIndex, opponentX, opponentY, { flipped: true, scale });

            // Calculate predicted damage for health bar highlight
            let predictedDamageForOpponent = 0;
            if (turn === 'PLAYER' && selectedAbilityId && !['rest', 'guard'].includes(selectedAbilityId)) {
                predictedDamageForOpponent = this.battleManager.getPredictedDamage(selectedAbilityId, true);
            }

            // Health Bar
            const barX = opponentBaseX;
            const barY = groundY - 14;
            this.healthBarRenderer.drawBar(barX, barY, barWidth, barHeight, opponentHP, maxHP, predictedDamageForOpponent);
            
            // Status Effects
            const opponentEffects = this.battleManager.getOpponentStatusEffects();
            this._drawStatusEffects(barX, barY - statusEffectSpacing, opponentEffects);

            // Stat Grid
            const stats = CHARACTER_DATA[opponentCharacterIndex]?.stats;
            if (stats) {
                const gridX = barX + (barWidth / 2) - 15;
                this.statGridRenderer.draw(gridX, groundY - gridYOffset, stats, opponentHighlight);
            }

            // Draw Opponent Intent
            if (turn === 'PLAYER' && opponentIntent) {
                const intentY = barY + barHeight + 4;
                const ability = ABILITY_POOL.find(a => a.id === opponentIntent.abilityId);
                if (ability) {
                    this._drawOpponentIntent(barX, intentY, barWidth, opponentIntent.predictedDamage, ability.domain, opponentIntent.statusEffects);
                }
            }
        }

        // Draw Battle Effects
        this.battleAnimator.draw(this.canvasManager.context);

        // Draw Battle Indicators (floating numbers, ability banner)
        if (this.battleIndicators) {
            this.battleIndicators.draw(this.canvasManager.context);
        }
    }
    
    _drawStatusEffects(x, y, effects) {
        if (!effects || effects.length === 0) return;
        
        const ctx = this.canvasManager.context;
        ctx.save();
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        
        let offsetX = x;
        effects.forEach(effect => {
            // Icon
            ctx.fillText(effect.icon, offsetX, y);
            
            // Turns remaining (small number)
            ctx.font = 'bold 8px monospace';
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeText(effect.turnsRemaining, offsetX + 10, y);
            ctx.fillText(effect.turnsRemaining, offsetX + 10, y);
            ctx.font = '12px sans-serif';
            
            offsetX += 18;
        });
        
        ctx.restore();
    }
}

// Bootstrap
const game = new Game();
game.init();