import { SPRITE_SIZE } from '../../config/dimensions.js';

export class BattleAnimator {
    constructor() {
        this.playerOffset = { x: 0, y: 0 };
        this.opponentOffset = { x: 0, y: 0 };
        
        // Visual effects state
        this.projectile = {
            active: false,
            x: 0,
            y: 0,
            color: '#fff',
            radius: 4
        };
        
        this.impact = {
            active: false,
            x: 0,
            y: 0,
            timer: 0
        };

        this.animations = [];
    }

    /**
     * Plays the full attack sequence.
     * @param {string} attacker 'PLAYER' | 'OPPONENT'
     * @param {Object} ability The ability data
     * @param {number} damage Calculated damage (affects knockback)
     * @param {Function} onHit Callback when damage should be applied (UI update)
     * @param {Function} onComplete Callback when animation is fully done
     */
    playAttackSequence(attacker, ability, damage, onHit, onComplete) {
        const isPlayer = attacker === 'PLAYER';
        const targetOffset = isPlayer ? this.opponentOffset : this.playerOffset;
        const actorOffset = isPlayer ? this.playerOffset : this.opponentOffset;
        const direction = isPlayer ? 1 : -1;
        
        // Determine if projectile
        const isRanged = ability.tags.includes('ranged') || ability.tags.includes('magic');

        const sequence = [
            // 1. Lunge / Windup
            {
                duration: 250,
                update: (progress) => {
                    // Move forward 40px then snap back slightly
                    const lunge = Math.sin(progress * Math.PI) * 40;
                    actorOffset.x = direction * lunge;
                }
            },
            
            // 2. Projectile (Optional)
            ...(isRanged ? [{
                duration: 400,
                start: () => {
                    this.projectile.active = true;
                    this.projectile.color = this._getProjectileColor(ability);
                    this.projectile.x = isPlayer ? 100 : window.innerWidth - 100; // rough start
                    // We'll calculate actual positions in render or pass them in, 
                    // but for now relative start positions work if we assume standard layout
                },
                update: (progress) => {
                    // Lerp from one side to other
                    // Assuming standard canvas size ~384 width. 
                    // Player at ~40, Opponent at ~300.
                    const startX = isPlayer ? 60 : 320;
                    const endX = isPlayer ? 320 : 60;
                    this.projectile.x = startX + (endX - startX) * progress;
                    this.projectile.y = 150; // Roughly chest height
                },
                finish: () => {
                    this.projectile.active = false;
                }
            }] : []), // No delay for melee, just immediate impact

            // 3. Impact & Knockback
            {
                duration: 400,
                start: () => {
                    if (onHit) onHit();
                    // Visual hit effect
                    this.impact.active = true;
                    this.impact.x = isPlayer ? 320 : 60;
                    this.impact.y = 150;
                    this.impact.timer = 1.0;
                },
                update: (progress) => {
                    // Knockback target
                    // easeOutQuad
                    const p = 1 - (1 - progress) * (1 - progress);
                    // Push back proportional to damage (max 50px)
                    const push = Math.min(damage * 3, 60); 
                    // Moves away from attacker
                    targetOffset.x = (direction * push) * (1 - p); // Slide back to 0
                    
                    // Flash impact
                    this.impact.timer = 1 - progress;
                },
                finish: () => {
                    this.impact.active = false;
                    targetOffset.x = 0;
                }
            },
            
            // 4. Reset Actor (if not already reset by lunge logic)
            {
                duration: 100,
                update: (progress) => {
                    // Ensure actor is back to 0
                    actorOffset.x = actorOffset.x * (1 - progress);
                },
                finish: () => {
                    actorOffset.x = 0;
                    if (onComplete) onComplete();
                }
            }
        ];

        this._runSequence(sequence);
    }

    _getProjectileColor(ability) {
        if (ability.tags.includes('fire')) return '#ff4400';
        if (ability.tags.includes('ice')) return '#00ffff';
        if (ability.tags.includes('poison')) return '#00ff00';
        if (ability.tags.includes('lightning')) return '#ffff00';
        if (ability.tags.includes('magic')) return '#ff00ff';
        return '#cccccc';
    }

    _runSequence(steps) {
        let currentStepIndex = 0;
        let startTime = performance.now();

        const processStep = (timestamp) => {
            if (currentStepIndex >= steps.length) return;

            const step = steps[currentStepIndex];
            if (!step.started) {
                if (step.start) step.start();
                step.started = true;
                startTime = timestamp;
            }

            const elapsed = timestamp - startTime;
            const progress = Math.min(1, elapsed / step.duration);

            if (step.update) step.update(progress);

            if (progress >= 1) {
                if (step.finish) step.finish();
                currentStepIndex++;
                startTime = timestamp;
                // Don't return, immediately check next step to avoid frame gaps? 
                // Actually requestAnimationFrame is better for gaps.
            }
            
            if (currentStepIndex < steps.length) {
                requestAnimationFrame(processStep);
            }
        };

        requestAnimationFrame(processStep);
    }

    draw(ctx) {
        // Draw Projectile
        if (this.projectile.active) {
            ctx.fillStyle = this.projectile.color;
            ctx.beginPath();
            ctx.arc(this.projectile.x, this.projectile.y, 6, 0, Math.PI * 2);
            ctx.fill();
            // Trail
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.arc(this.projectile.x - 5, this.projectile.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw Impact
        if (this.impact.active) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.impact.timer})`;
            ctx.beginPath();
            ctx.arc(this.impact.x, this.impact.y, 20 * this.impact.timer, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}