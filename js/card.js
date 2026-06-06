export class Card {
    constructor(id, name, strength, row, color, specialAbility = null) {
        this.id = id;
        this.name = name;
        this.baseStrength = strength;
        this.currentStrength = strength;
        this.row = row;
        this.color = color;
        this.specialAbility = specialAbility;
    }
    resetStrength() {
        this.currentStrength = this.baseStrength;
    }
}

export function createCardDOM(card) {
    const cardEl = document.createElement('div');
    cardEl.className = `game-card`;
    cardEl.style.backgroundColor = card.color;
    cardEl.innerHTML = `
        <div class="card-top-row">
            <div class="card-strength">${card.currentStrength}</div>
            <div class="card-type-icon">${card.row === 'close' ? '⚔️' : card.row === 'ranged' ? '🏹' : '📡'}</div>
        </div>
        <div class="card-name">${card.name}</div>
    `;
    return cardEl;
}