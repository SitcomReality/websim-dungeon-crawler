import { globalBus, EVENTS } from '../../core/events/EventBus.js';
import { gameState } from '../../data/store/StateStore.js';
import { UPGRADE_POOL } from '../../data/UpgradeData.js';
import { CHARACTER_DATA } from '../../data/CharacterData.js';
import { GRID_COLS, GRID_ROWS } from '../../config/dimensions.js';

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
        } else {
            this.element.style.display = 'none';
        }
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
        const available = [...UPGRADE_POOL];
        
        // Always include a healing option if player is below 70% HP
        const healthPercent = state.playerHP / state.maxHP;
        if (healthPercent < 0.7) {
            const healUpgrades = available.filter(u => u.type === 'heal');
            if (healUpgrades.length > 0) {
                const healChoice = healUpgrades[Math.floor(Math.random() * healUpgrades.length)];
                choices.push(healChoice);
                available.splice(available.indexOf(healChoice), 1);
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
        
        // Apply upgrade effect
        upgrade.apply(state, this.battleManager);
        
        // Start next battle
        this._startNextBattle();
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
        
        // Calculate scaled opponent HP
        const baseHP = 100;
        const scaledOpponentHP = Math.floor(baseHP * (1 + (newBattleCount - 1) * 0.15));
        
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
        
        // Reset battle systems
        this.battleManager.cooldowns.reset();
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