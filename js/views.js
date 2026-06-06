import { routingContainer, playerWins, botWins, gameTimerInterval } from './config.js';
import { startNewGame, playerPassTurn, sendScoreToRanking, loadRankingData } from './app.js';

// --------------------------------------WIDOK: MENU GŁÓWNE
export function renderMainMenu() {
    if (gameTimerInterval) clearInterval(gameTimerInterval);
    routingContainer.innerHTML = `
        <div class="menu-container">
            <h2 class="menu-welcome">> WITAJ W NIGHT CITY</h2>
            <div class="menu-buttons">
                <button id="start-game-btn" class="menu-btn">INICJUJ PROTOKÓŁ GRY</button>
                <button id="view-ranking-btn" class="menu-btn btn-secondary">RANKING</button>
                <button id="view-rules-btn" class="menu-btn btn-secondary" style="border-color: #2a2a40; color: #747d8c;">SAMOUCZEK SYSTEMU</button>
            </div>
        </div>
    `;
    document.getElementById('start-game-btn').addEventListener('click', startNewGame);
    document.getElementById('view-ranking-btn').addEventListener('click', renderRankingView);
    document.getElementById('view-rules-btn').addEventListener('click', renderRulesView); // Wywołanie funkcji z tego samego pliku
}

// --------------------------------------WIDOK: RANKING
export function renderRankingView() {
    routingContainer.innerHTML = `
        <div class="ranking-container">
            <h3>🏆 TOP 10 REPREZENTANTÓW MIASTA</h3>
            <table class="ranking-table">
                <thead><tr><th>Lp.</th><th>Runner</th><th>Reputacja</th><th>Czas sesji</th></tr></thead>
                <tbody id="ranking-rows"><tr><td colspan="4">Pobieranie logów z sieci Arasaki...</td></tr></tbody>
            </table>
            <button id="back-to-menu-btn" class="menu-btn">POWRÓT DO SYSTEMU</button>
        </div>
    `;
    document.getElementById('back-to-menu-btn').addEventListener('click', renderMainMenu);
    loadRankingData();
}

// --------------------------------------WIDOK: SAMOUCZEK 
export function renderRulesView() {
    routingContainer.innerHTML = `
        <div class="rules-container">
            <h3>[PROTOKÓŁ: REGULAMIN SIECI]</h3>
            
            <div class="rules-content">
                
                <p class="rules-section-title">--------------------------------------CEL OPERACJI</p>
                <p class="rules-text">
                    Twoim zadaniem jest przełamanie zabezpieczeń Sztucznej Inteligencji i zdominowanie sieci. Wygrywa Netrunner, który jako pierwszy zdobędzie 3 punkty zwycięstwa (złamie 3 kody dostępu).
                </p>

                <p class="rules-section-title">--------------------------------------STRUKTURA DECKU</p>
                <p class="rules-text">
                    Na starcie sesji obaj gracze otrzymują po 10 losowych pakietów danych (kart) z pamięci RAM. Każda karta posiada określoną moc sygnału (siłę) oraz przypisany podsystem (rząd), w którym może zostać zainicjowana.
                </p>

                <p class="rules-section-title">--------------------------------------PODSYSTEMY SIECI</p>
                <ul class="rules-list">
                    <li><strong>[CQC] Walka w zwarciu:</strong> Pierwsza linia frontu. To tu lądują najciężsi cyber-wojownicy.</li>
                    <li><strong>[RNG] Atak dystansowy:</strong> Środkowa linia wsparcia ogniowego i taktycznego.</li>
                    <li><strong>[NET] Cyberprzestrzeń:</strong> Tylna linia serwerów oblężniczych i zaawansowanych programów hakerskich.</li>
                </ul>

                <p class="rules-section-title">--------------------------------------PRZEBIEG SESJI</p>
                <p class="rules-text">
                    Gracze wykonują ruchy na zmianę, wgrywając po 1 programie (karcie) na stół. Runda kończy się w momencie, gdy obaj użytkownicy zamkną cykl (spasują). Jeśli spasujesz, tracisz możliwość wykonywania dalszych ruchów w tej rundzie, a SI może podjąć próbę dołożenia ostatniej karty, aby Cię przebić.
                </p>

                <p class="rules-section-title">--------------------------------------SPECJALNE PROGRAMY</p>
                <p class="rules-text">
                    Niektóre pakiety (np. Lucy, Faraday) posiadają protokół dociągania. Zagranie takiego programu wysyła go na stronę wroga (zwiększając jego moc), ale pozwala Ci natychmiast pobrać 2 dodatkowe pakiety z puli głównej.
                </p>
                
            </div>

            <button id="back-from-rules-btn" class="menu-btn rules-back-btn">POWRÓT DO KONSOLI</button>
        </div>
    `;

    document.getElementById('back-from-rules-btn').addEventListener('click', renderMainMenu);
}

// --------------------------------------WIDOK: PLANSZA ROZGRYWKI
export function renderGameBoard() {
    routingContainer.innerHTML = `
        <div class="game-container">
            <aside class="sidebar">
                <div class="timer">Uptime połączenia: <span id="game-time">00:00</span></div>
                <div class="score-board">
                    <div class="score-row bot-score">
                        <h4>Sztuczna Inteligencja</h4>
                        <p>Moc sygnału: <span id="bot-round-score" class="total-score-val">0</span></p>
                        <p>Zabezpieczenia: <span id="bot-wins">0</span> / 3</p>
                        <div id="bot-status" class="status-indicator">ONLINE</div>
                    </div>
                    <hr class="sidebar-divider">
                    <div class="score-row player-score">
                        <h4>Twój Deck</h4>
                        <p>Moc sygnału: <span id="player-round-score" class="total-score-val">0</span></p>
                        <p>Zabezpieczenia: <span id="player-wins">0</span> / 3</p>
                        <div id="player-status" class="status-indicator">TWÓJ RUCH</div>
                    </div>
                </div>
                <button id="pass-btn" class="game-action-btn">ZAMKNIJ CYKL (PAS)</button>
                <button id="quit-btn" class="game-action-btn btn-quit">ODŁĄCZ SIĘ OD SIECI</button>
            </aside>
            <main class="game-board">
                <div class="board-half bot-half">
                    <div class="battle-row siege" data-row="siege" id="bot-siege"><div class="row-info"><div>[NET]</div><span class="row-counter">0</span></div><div class="card-slots"></div></div>
                    <div class="battle-row ranged" data-row="ranged" id="bot-ranged"><div class="row-info"><div>[RNG]</div><span class="row-counter">0</span></div><div class="card-slots"></div></div>
                    <div class="battle-row close" data-row="close" id="bot-close"><div class="row-info"><div>[CQC]</div><span class="row-counter">0</span></div><div class="card-slots"></div></div>
                </div>
                <div class="board-half player-half">
                    <div class="battle-row close" data-row="close" id="player-close"><div class="row-info"><div>[CQC]</div><span class="row-counter">0</span></div><div class="card-slots"></div></div>
                    <div class="battle-row ranged" data-row="ranged" id="player-ranged"><div class="row-info"><div>[RNG]</div><span class="row-counter">0</span></div><div class="card-slots"></div></div>
                    <div class="battle-row siege" data-row="siege" id="player-siege"><div class="row-info"><div>[NET]</div><span class="row-counter">0</span></div><div class="card-slots"></div></div>
                </div>
                <footer class="player-hand-section">
                    <div class="hand-header">Pamięć podręczna RAM (<span id="hand-count">0</span>/10 pakietów)</div>
                    <div id="player-hand" class="cards-hand-container"></div>
                </footer>
            </main>
        </div>
    `;
    document.getElementById('quit-btn').addEventListener('click', () => {
        if(confirm("Wykryto próbę wymuszonego wylogowania. Stracisz niezapisane dane sesji. Kontynuować?")) renderMainMenu();
    });
    document.getElementById('pass-btn').addEventListener('click', playerPassTurn);
}

// --------------------------------------WIDOK: EKRAN KOŃCOWY
export function renderEndGameView() {
    if (gameTimerInterval) clearInterval(gameTimerInterval);
    
    let resultTitle = playerWins > botWins ? "PRZEŁAMANIE SYSTEMU!" : (botWins > playerWins ? "KRYTYCZNA CZYSTKA SIECI" : "ZAKLESZCZENIE SYGNAŁU");
    let resultClass = playerWins > botWins ? "win-theme" : (botWins > playerWins ? "lose-theme" : "draw-theme");
    const finalTime = document.getElementById('game-time').textContent;
    const finalScore = parseInt(document.getElementById('player-round-score').textContent);

    routingContainer.innerHTML = `
        <div class="end-game-screen ${resultClass}">
            <h2 class="end-game-title">${resultTitle}</h2>
            <div class="end-game-stats">
                <div class="stat-box"><span>Zdobyty kredyt:</span><strong>${finalScore} SC</strong></div>
                <div class="stat-box"><span>Czas hackowania:</span><strong>${finalTime}</strong></div>
            </div>
            <form id="ranking-form" class="end-game-form">
                <label for="player-name-input">Podpisz pakiety danych swoim aliasem (ID):</label>
                <input type="text" id="player-name-input" required minlength="3" maxlength="15" placeholder="V" autofocus>
                <div class="form-buttons">
                    <button type="submit" class="menu-btn">ZAPISZ LOGI</button>
                    <button type="button" id="skip-ranking-btn" class="menu-btn btn-secondary">WYCZYŚĆ ŚLADY</button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('ranking-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('player-name-input').value;
        await sendScoreToRanking({ name: username, score: finalScore, time: finalTime });
        renderMainMenu();
    });
    document.getElementById('skip-ranking-btn').addEventListener('click', renderMainMenu);
}