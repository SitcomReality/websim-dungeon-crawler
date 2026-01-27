import { globalBus, EVENTS } from '../../core/events/EventBus.js';
import { ROOM_WIDTH, ROOM_HEIGHT } from '../../config/dimensions.js';

export class BattleIndicatorManager {
    constructor() {
        this.indicators = [];
        this.abilityBanner = null;

        globalBus.on(EVENTS.DAMAGE_APPLIED, this._onDamage.bind(this));
        globalBus.on(EVENTS.HEAL_APPLIED, this._onHeal.bind(this));
        globalBus.on(EVENTS.ABILITY_USED, this._onAbilityUsed.bind(this));
        globalBus.on(EVENTS.STATE_CHANGED, this._onStateChange.bind(this));
        
        this.lastBattleCount = null;
    }

    _onStateChange(state) {
        if (state.battleCount !== this.lastBattleCount) {
            this.lastBattleCount = state.battleCount;
            this.clear();
        }
    }

    clear() {
        this.indicators = [];
        this.abilityBanner = null;
    }

    _onDamage({ target, amount }) {
        const { x, y } = this._getSidePosition(target);
        this._spawnFloatingText({
            x,
            y,
            text: `-${amount}`,
            color: '#ff4444'
        });
    }

    _onHeal({ target, amount }) {
        const { x, y } = this._getSidePosition(target);
        this._spawnFloatingText({
            x,
            y,
            text: `+${amount}`,
            color: '#44ff88'
        });
    }

    _onAbilityUsed({ attacker, abilityName }) {
        // Center banner between the two sides
        this.abilityBanner = {
            text: abilityName,
            life: 0,
            maxLife: 900, // ms
            attacker
        };
    }

    _getSidePosition(side) {
        // Rough positions aligned with left/right characters
        const leftX = ROOM_WIDTH * 0.25;
        const rightX = ROOM_WIDTH * 0.75;
        const baseY = ROOM_HEIGHT * 0.35;

        return {
            x: side === 'PLAYER' ? leftX : rightX,
            y: baseY
        };
    }

    _spawnFloatingText({ x, y, text, color }) {
        this.indicators.push({
            x,
            y,
            text,
            color,
            life: 0,
            maxLife: 800, // ms
            vy: -40 // px per second upward
        });
    }

    update(deltaTime) {
        const dt = deltaTime || 0;
        // Update numbers
        this.indicators = this.indicators.filter(ind => {
            ind.life += dt;
            const t = ind.life / ind.maxLife;
            ind.y += ind.vy * (dt / 1000);
            return t < 1;
        });

        // Update banner
        if (this.abilityBanner) {
            this.abilityBanner.life += dt;
            if (this.abilityBanner.life >= this.abilityBanner.maxLife) {
                this.abilityBanner = null;
            }
        }
    }

    draw(ctx) {
        if (!ctx) return;

        // Draw floating numbers
        this.indicators.forEach(ind => {
            const t = ind.life / ind.maxLife;
            const alpha = 1 - t;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = ind.color;
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            ctx.font = 'bold 22px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeText(ind.text, ind.x, ind.y);
            ctx.fillText(ind.text, ind.x, ind.y);
            ctx.restore();
        });

        // Draw ability banner
        if (this.abilityBanner) {
            const t = this.abilityBanner.life / this.abilityBanner.maxLife;
            // Ease-out alpha
            const alpha = t < 0.7 ? 1 : Math.max(0, 1 - (t - 0.7) / 0.3);
            ctx.save();
            ctx.globalAlpha = alpha;

            const centerX = ROOM_WIDTH / 2;
            const centerY = ROOM_HEIGHT * 0.22;

            // Background pill
            const paddingX = 14;
            const paddingY = 6;
            ctx.font = 'bold 16px monospace';
            const textWidth = ctx.measureText(this.abilityBanner.text).width;
            const boxWidth = textWidth + paddingX * 2;
            const boxHeight = 28;
            const x = centerX - boxWidth / 2;
            const y = centerY - boxHeight / 2;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            const r = 6;
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + boxWidth - r, y);
            ctx.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + r);
            ctx.lineTo(x + boxWidth, y + boxHeight - r);
            ctx.quadraticCurveTo(x + boxWidth, y + boxHeight, x + boxWidth - r, y + boxHeight);
            ctx.lineTo(x + r, y + boxHeight);
            ctx.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Text
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.abilityBanner.text, centerX, centerY);

            ctx.restore();
        }
    }
}