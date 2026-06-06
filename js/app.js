import * as cfg from './config.js';
import { Card, createCardDOM } from './card.js';
import { renderMainMenu, renderGameBoard, renderEndGameView } from './views.js';

// 1. ŁADOWANIE BAZY KART
async function loadCardsData() {
    try {
        const response = await fetch('data/cards.json');
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        const rawData = await response.json();
        cfg.setCardDatabase(rawData.map(c => new Card(c.id, c.name, c.strength, c.row, c.color, c.specialAbility || null)));
    } catch (error) {
        alert('Krytyczny błąd gry: Nie można załadować bazy kart.');
    }
}

// 2. URUCHOMIENIe=E NOWEJ GRY
export function startNewGame() {
    cfg.setPlayerWins(0); cfg.setBotWins(0); cfg.setPlayerPassed(false); cfg.setBotPassed(false);
    cfg.setIsBotTurning(false); cfg.setIsRoundEnding(false); cfg.setRoundMessageBanner(""); cfg.setGameSeconds(0);
    resetBoardState();

    const extendedDatabase = [...cfg.CARD_DATABASE, ...cfg.CARD_DATABASE, ...cfg.CARD_DATABASE];
    let pool = extendedDatabase.map(card => new Card(card.id + Math.random(), card.name, card.baseStrength, card.row, card.color, card.specialAbility));
    
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    cfg.setDeckPool(pool);
    cfg.setPlayerHand(pool.splice(0, 10));
    cfg.setBotHand(pool.splice(0, 10));

    renderGameBoard();
    updateDOM();
    startTimer();
}

function resetBoardState() {
    cfg.setPlayerBoard({ close: [], ranged: [], siege: [] });
    cfg.setBotBoard({ close: [], ranged: [], siege: [] });
    cfg.setPlayerPassed(false); cfg.setBotPassed(false); cfg.setIsBotTurning(false);
}

function startTimer() {
    if (cfg.gameTimerInterval) clearInterval(cfg.gameTimerInterval);
    cfg.setGameTimerInterval(setInterval(() => {
        cfg.setGameSeconds(cfg.gameSeconds + 1);
        const mins = String(Math.floor(cfg.gameSeconds / 60)).padStart(2, '0');
        const secs = String(cfg.gameSeconds % 60).padStart(2, '0');
        const timerSpan = document.getElementById('game-time');
        if (timerSpan) timerSpan.textContent = `${mins}:${secs}`;
    }, 1000));
}

function updateDOM() {
    document.getElementById('player-wins').textContent = cfg.playerWins;
    document.getElementById('bot-wins').textContent = cfg.botWins;
    document.getElementById('hand-count').textContent = cfg.playerHand.length;

    if (cfg.roundMessageBanner !== "") {
        document.getElementById('player-status').textContent = cfg.roundMessageBanner;
    } else if (cfg.playerPassed) {
        document.getElementById('player-status').textContent = "Spasował";
    } else if (cfg.isBotTurning) {
        document.getElementById('player-status').textContent = "Oczekiwanie na bota...";
    } else {
        document.getElementById('player-status').textContent = "Twoja tura";
    }
    document.getElementById('bot-status').textContent = cfg.botPassed ? "Spasował" : "W grze";
    
    ['close', 'ranged', 'siege'].forEach(rowType => {
        const pRow = document.querySelector(`#player-${rowType} .card-slots`);
        pRow.innerHTML = '';
        cfg.playerBoard[rowType].forEach(card => pRow.appendChild(createCardDOM(card)));

        const bRow = document.querySelector(`#bot-${rowType} .card-slots`);
        bRow.innerHTML = '';
        cfg.botBoard[rowType].forEach(card => bRow.appendChild(createCardDOM(card)));
    });
    calculateScores();
    renderPlayerHandDOM();
}

function renderPlayerHandDOM() {
    const handContainer = document.getElementById('player-hand');
    handContainer.innerHTML = '';
    if (cfg.playerPassed || cfg.isBotTurning) return;

    cfg.playerHand.forEach((card, index) => {
        const cardEl = createCardDOM(card);
        cardEl.addEventListener('click', () => playerPlayCard(index));
        handContainer.appendChild(cardEl);
    });
}

function calculateScores() {
    let playerTotal = 0, botTotal = 0;
    ['close', 'ranged', 'siege'].forEach(rowType => {
        const pSum = cfg.playerBoard[rowType].reduce((sum, card) => sum + card.currentStrength, 0);
        document.querySelector(`#player-${rowType} .row-counter`).textContent = pSum;
        playerTotal += pSum;

        const bSum = cfg.botBoard[rowType].reduce((sum, card) => sum + card.currentStrength, 0);
        document.querySelector(`#bot-${rowType} .row-counter`).textContent = bSum;
        botTotal += bSum;
    });
    document.getElementById('player-round-score').textContent = playerTotal;
    document.getElementById('bot-round-score').textContent = botTotal;
}

function playerPlayCard(index) {
    if (cfg.isBotTurning || cfg.playerPassed) return;
    cfg.setRoundMessageBanner("");
    const card = cfg.playerHand.splice(index, 1)[0];
    
    if (card.specialAbility === 'draw_card') {
        cfg.botBoard[card.row].push(card);
        cfg.playerHand.push(...cfg.deckPool.splice(0, 2));
    } else {
        cfg.playerBoard[card.row].push(card);
    }

    if (!cfg.botPassed && cfg.botHand.length > 0) {
        cfg.setIsBotTurning(true); updateDOM();
        setTimeout(botTurn, 800);
    } else {
        cfg.setIsBotTurning(false); updateDOM();
        if (cfg.playerHand.length === 0) playerPassTurn();
    }
}

export function playerPassTurn() {
    cfg.setPlayerPassed(true); cfg.setIsBotTurning(false); cfg.setRoundMessageBanner(""); updateDOM();
    if (!cfg.botPassed && cfg.botHand.length > 0) {
        if (Math.random() < 0.5) {
            const card = cfg.botHand.splice(0, 1)[0];
            if (card.specialAbility === 'draw_card') {
                cfg.playerBoard[card.row].push(card);
                cfg.botHand.push(...cfg.deckPool.splice(0, 2));
            } else {
                cfg.botBoard[card.row].push(card);
            }
            cfg.setBotPassed(true); cfg.setIsBotTurning(false); updateDOM();
            setTimeout(checkRoundWinner, 1000);
        } else {
            cfg.setBotPassed(true); cfg.setIsBotTurning(false); updateDOM();
            setTimeout(checkRoundWinner, 1000);
        }
    } else {
        checkRoundWinner();
    }
}

function botTurn() {
    if (cfg.botPassed || cfg.botHand.length === 0) {
        cfg.setBotPassed(true); cfg.setIsBotTurning(false); updateDOM();
        return;
    }
    const pScore = parseInt(document.getElementById('player-round-score').textContent) || 0;
    const bScore = parseInt(document.getElementById('bot-round-score').textContent) || 0;

    if (cfg.playerPassed && bScore > pScore) {
        cfg.setBotPassed(true); cfg.setIsBotTurning(false); updateDOM();
        checkRoundWinner(); return;
    }

    const card = cfg.botHand.splice(0, 1)[0];
    if (card.specialAbility === 'draw_card') {
        cfg.playerBoard[card.row].push(card);
        cfg.botHand.push(...cfg.deckPool.splice(0, 2));
    } else {
        cfg.botBoard[card.row].push(card);
    }

    if (cfg.botHand.length === 0) cfg.setBotPassed(true);
    cfg.setIsBotTurning(false); updateDOM();

    if (cfg.playerPassed && !cfg.botPassed) {
        cfg.setIsBotTurning(true); updateDOM();
        setTimeout(botTurn, 800);
    } else {
        if (cfg.playerHand.length === 0 && !cfg.playerPassed) playerPassTurn();
    }
}

function checkRoundWinner() {
    if (cfg.isRoundEnding) return;
    cfg.setIsRoundEnding(true);

    const pScore = parseInt(document.getElementById('player-round-score').textContent) || 0;
    const bScore = parseInt(document.getElementById('bot-round-score').textContent) || 0;

    if (pScore > bScore) { cfg.setPlayerWins(cfg.playerWins + 1); cfg.setRoundMessageBanner(`Wygrałeś rundę! Wynik: ${pScore} do ${bScore}`); }
    else if (bScore > pScore) { cfg.setBotWins(cfg.botWins + 1); cfg.setRoundMessageBanner(`Bot wygrał rundę! Wynik: ${bScore} do ${pScore}`); }
    else { cfg.setPlayerWins(cfg.playerWins + 1); cfg.setBotWins(cfg.botWins + 1); cfg.setRoundMessageBanner(`Remis w rundzie! Wynik: ${pScore} do ${bScore}`); }

    cfg.setIsBotTurning(true); updateDOM();

    setTimeout(() => {
        if (cfg.playerWins >= 3 || cfg.botWins >= 3) {
            renderEndGameView();
        } else {
            resetBoardState();
            const pDraw = Math.min(3, 10 - cfg.playerHand.length);
            const bDraw = Math.min(3, 10 - cfg.botHand.length);
            cfg.playerHand.push(...cfg.deckPool.splice(0, pDraw));
            cfg.botHand.push(...cfg.deckPool.splice(0, bDraw));
            
            cfg.setPlayerPassed(false); cfg.setBotPassed(false); cfg.setIsBotTurning(false); cfg.setIsRoundEnding(false);
            cfg.setRoundMessageBanner(`Nowa runda! Dobrano karty. Twój ruch.`);
            updateDOM();
            
            if (cfg.playerHand.length === 0 && cfg.botHand.length > 0) playerPassTurn();
        }
    }, 3000); 
}

// 3. OBSŁUGA RANKINGU (API)
export async function sendScoreToRanking(scoreData) {
    try {
        const response = await fetch('/api/ranking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scoreData) 
        });

        if (!response.ok) throw new Error('Błąd odpowiedzi serwera');
        alert('Logi sesji pomyślnie zapisane w chmurze.');
    } catch (error) {
        console.error(error);
        alert('Krytyczny błąd zapisu danych.');
    }
}

export async function loadRankingData() {
    const rowsContainer = document.getElementById('ranking-rows');
    if (!rowsContainer) return;
    try {
        const response = await fetch(cfg.API_URL);
        const ranking = await response.json();
        rowsContainer.innerHTML = '';
        if (ranking.length === 0) {
            rowsContainer.innerHTML = `<tr><td colspan="4">Tabela jest pusta.</td></tr>`; return;
        }
        ranking.forEach((player, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><strong>${index + 1}</strong></td><td>${player.name}</td><td>${player.score} SC</td><td>${player.time}</td>`;
            rowsContainer.appendChild(tr);
        });
    } catch (error) { rowsContainer.innerHTML = `<tr><td colspan="4" style="color:#ff5555;">Błąd połączenia.</td></tr>`; }
}

async function initApp() {
    await loadCardsData();
    renderMainMenu();
}
initApp();