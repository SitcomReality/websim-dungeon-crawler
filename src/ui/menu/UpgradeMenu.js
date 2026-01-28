import { globalBus, EVENTS } from '../../core/events/EventBus.js';
import { gameState } from '../../data/store/StateStore.js';
import { UPGRADE_POOL } from '../../data/UpgradeData.js';
import { CHARACTER_DATA } from '../../data/CharacterData.js';
import { GRID_COLS, GRID_ROWS } from '../../config/dimensions.js';
import { UNLOCKABLE_ABILITIES, ALL_ABILITIES } from '../../data/AbilityData.js';

export class UpgradeMenu {
    constructor(containerId, battleManager) {
        this.container = document.getElementById(containerId);
        this.battleManager = battleManager;
        this.element = null;
        this.availableUpgrades = [];
        this._setup();
        
        globalBus.on(EVENTS.STATE_CHANGED, this._onStateChange.bind(this));
    }

    _setup() {
        this.element = document.createElement('div');
        this.element.className = 'upgrade-menu';
        this.container.appendChild(this.element);
    }

    _onStateChange(state) {
        if (state.turn === 'VICTORY') {
            this._showUpgrades(state);
        } else if (state.turn === 'ULTIMATE_VICTORY') {
            this._showVictory(state);
        } else {
            this.element.style.display = 'none';
        }
    }
    
    _showVictory(state) {
        this.element.style.display = 'flex';
        this.element.innerHTML = `
            <h2 class="upgrade-title" style="font-size: 48px; color: #ffdd00;">🎉 VICTORY! 🎉</h2>
            <p class="upgrade-subtitle" style="font-size: 20px;">You survived ${state.victoryThreshold} battles!</p>
            <p class="upgrade-subtitle">You are the main character!</p>
            <button class="retry-btn" style="margin-top: 30px;">Play Again</button>
        `;
        
        const btn = this.element.querySelector('.retry-btn');
        btn.onclick = () => {
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

    _showUpgrades(state) {
        this.element.style.display = 'flex';
        this.element.innerHTML = '';

        // Generate 3 random upgrades
        this.availableUpgrades = this._generateUpgradeChoices(3);

        // Title
        const title = document.createElement('h2');
        title.className = 'upgrade-title';
        title.textContent = `Victory! Battle ${state.battleCount} Complete`;
        this.element.appendChild(title);

        // Subtitle
        const subtitle = document.createElement('p');
        subtitle.className = 'upgrade-subtitle';
        subtitle.textContent = 'Choose your reward:';
        this.element.appendChild(subtitle);

        // Upgrades container
        const upgradesContainer = document.createElement('div');
        upgradesContainer.className = 'upgrades-container';

        this.availableUpgrades.forEach((upgrade, index) => {
            const card = document.createElement('div');
            card.className = `upgrade-card ${upgrade.rarity}`;
            
            const icon = document.createElement('div');
            icon.className = 'upgrade-icon';
            icon.textContent = upgrade.icon;
            
            const name = document.createElement('div');
            name.className = 'upgrade-name';
            name.textContent = upgrade.name;
            
            const desc = document.createElement('div');
            desc.className = 'upgrade-desc';
            desc.textContent = upgrade.description;
            
            card.appendChild(icon);
            card.appendChild(name);
            card.appendChild(desc);
            
            card.onclick = () => this._selectUpgrade(upgrade);
            
            upgradesContainer.appendChild(card);
        });

        this.element.appendChild(upgradesContainer);
    }

    _generateUpgradeChoices(count) {
        const state = gameState.getState();
        const choices = [];
        let available = [...UPGRADE_POOL];
        
        // Check if we should offer ability unlock
        const unlockedCount = (state.unlockedAbilities || []).length;
        const totalUnlockable = UNLOCKABLE_ABILITIES.length;
        if (unlockedCount < totalUnlockable && state.battleCount % 4 === 0) {
            // Every 4 battles, offer an ability unlock
            const abilityUpgrade = available.find(u => u.id === 'ability_slot');
            if (abilityUpgrade) {
                choices.push(abilityUpgrade);
                available = available.filter(u => u.id !== 'ability_slot');
            }
        }
        
        // Include heal option if player is below 60% HP (was 70%)
        const healthPercent = state.playerHP / (state.maxHP + state.maxHPBonus);
        if (healthPercent < 0.6) {
            const healUpgrades = available.filter(u => u.type === 'heal');
            if (healUpgrades.length > 0 && choices.length < count) {
                const healChoice = healUpgrades[Math.floor(Math.random() * healUpgrades.length)];
                choices.push(healChoice);
                available = available.filter(u => u !== healChoice);
            }
        }
        
        // Fill remaining slots with random upgrades
        while (choices.length < count && available.length > 0) {
            const idx = Math.floor(Math.random() * available.length);
            choices.push(available[idx]);
            available.splice(idx, 1);
        }
        
        return choices;
    }

    _selectUpgrade(upgrade) {
        const state = gameState.getState();
        
        // Special handling for ability unlock
        if (upgrade.id === 'ability_slot') {
            this._showAbilityChoice(state);
            return;
        }
        
        // Apply upgrade effect
        upgrade.apply(state, this.battleManager);
        
        // Update cooldown reduction if modified
        if (this.battleManager.cooldownReduction !== undefined) {
            this.battleManager.cooldowns.cooldownReduction = this.battleManager.cooldownReduction;
        }
        
        // Persist modified state
        gameState.updateState(state);
        
        // Start next battle
        this._startNextBattle();
    }
    
    _showAbilityChoice(state) {
        // Show ability selection screen
        const unlockedIds = state.unlockedAbilities || [];
        const availableAbilities = UNLOCKABLE_ABILITIES.filter(a => !unlockedIds.includes(a.id));
        
        if (availableAbilities.length === 0) {
            // Fallback to normal upgrade if no abilities left
            this._startNextBattle();
            return;
        }
        
        // Pick 3 random abilities to choose from
        const choices = [];
        const pool = [...availableAbilities];
        for (let i = 0; i < 3 && pool.length > 0; i++) {
            const idx = Math.floor(Math.random() * pool.length);
            choices.push(pool[idx]);
            pool.splice(idx, 1);
        }
        
        this.element.innerHTML = '';
        
        const title = document.createElement('h2');
        title.className = 'upgrade-title';
        title.textContent = 'Learn New Ability';
        this.element.appendChild(title);
        
        const subtitle = document.createElement('p');
        subtitle.className = 'upgrade-subtitle';
        subtitle.textContent = 'Choose wisely:';
        this.element.appendChild(subtitle);
        
        const container = document.createElement('div');
        container.className = 'upgrades-container';
        
        choices.forEach(ability => {
            const card = document.createElement('div');
            card.className = `upgrade-card rare`; // All abilities are rare
            
            const icon = document.createElement('div');
            icon.className = 'upgrade-icon';
            icon.textContent = this._getAbilityIcon(ability);
            
            const name = document.createElement('div');
            name.className = 'upgrade-name';
            name.textContent = ability.name;
            
            const desc = document.createElement('div');
            desc.className = 'upgrade-desc';
            desc.textContent = ability.description;
            
            card.appendChild(icon);
            card.appendChild(name);
            card.appendChild(desc);
            
            card.onclick = () => {
                const newUnlocked = [...(state.unlockedAbilities || []), ability.id];
                state.unlockedAbilities = newUnlocked;
                gameState.updateState(state);
                this._startNextBattle();
            };
            
            container.appendChild(card);
        });
        
        this.element.appendChild(container);
    }
    
    _getAbilityIcon(ability) {
        // Map abilities to icons
        const icons = {
            'execute': '🗡️',
            'riposte': '⚔️',
            'rampage': '😡',
            'chain_lightning': '😰',
            'meteor': '☄️',
            'drain': '🧛',
            'dominate': '🎭',
            'nightmare': '💀',
            'reflect': '🪞'
        };
        return icons[ability.id] || '✨';
    }

    _startNextBattle() {
        const state = gameState.getState();
        const playerIndex = state.playerCharacterIndex;
        const newBattleCount = state.battleCount + 1;
        
        // Update highest streak
        const newHighest = Math.max(state.highestStreak, newBattleCount);
        
        // Select new room (avoiding last 4)
        const totalRooms = GRID_COLS * GRID_ROWS;
        const roomHistory = state.roomHistory.slice(-3); // Keep last 3, add new one = 4 total
        const nextRoomIndex = this._getRandomRoomIndex(roomHistory, totalRooms);
        const roomX = nextRoomIndex % GRID_COLS;
        const roomY = Math.floor(nextRoomIndex / GRID_COLS);
        
        // Select random opponent (different from player)
        const opponentIndex = this._getRandomOpponentIndex(playerIndex);
        
        // Calculate scaled opponent HP (reduced scaling)
        const baseHP = 100;
        const scaledOpponentHP = Math.floor(baseHP * (1 + (newBattleCount - 1) * 0.08));
        
        gameState.updateState({
            mode: 'BATTLE',
            turn: 'PLAYER',
            roomX,
            roomY,
            roomHistory: [...roomHistory, nextRoomIndex],
            battleCount: newBattleCount,
            highestStreak: newHighest,
            opponentCharacterIndex: opponentIndex,
            opponentHP: scaledOpponentHP,
            selectedAbilityId: null,
            executingAbilityId: null,
            playerGuarding: false,
            opponentIntent: null
        });
        
        // Battle systems will be reset by BattleManager observing the battleCount change
    }

    _getRandomRoomIndex(roomHistory, totalRooms) {
        if (totalRooms <= 1) return 0;
        let idx;
        let attempts = 0;
        do {
            idx = Math.floor(Math.random() * totalRooms);
            attempts++;
            if (attempts > 100) break;
        } while (roomHistory.includes(idx));
        return idx;
    }

    _getRandomOpponentIndex(playerIndex) {
        const totalChars = CHARACTER_DATA.length;
        if (totalChars <= 1) return playerIndex;
        let idx;
        do {
            idx = Math.floor(Math.random() * totalChars);
        } while (idx === playerIndex);
        return idx;
    }
}