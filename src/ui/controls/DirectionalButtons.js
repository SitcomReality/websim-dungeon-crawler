import { globalBus, EVENTS } from '../../core/events/EventBus.js';

export class DirectionalButtons {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.createButtons();
    }

    createButtons() {
        this.createButton('north', '▲', 'NORTH');
        this.createButton('south', '▼', 'SOUTH');
        this.createButton('west', '◀', 'WEST');
        this.createButton('east', '▶', 'EAST');
    }

    createButton(className, label, direction) {
        const btn = document.createElement('div');
        btn.className = `nav-btn ${className}`;
        btn.textContent = label;
        
        // Handle both touch and click, prevent ghost clicks
        btn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            this.navigate(direction);
        });

        this.container.appendChild(btn);
    }

    navigate(direction) {
        globalBus.emit(EVENTS.NAVIGATE, { direction });
    }
}