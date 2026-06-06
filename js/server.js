const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const FILE_PATH = path.join(__dirname, 'ranking.json');

// Konfiguracja middleware
app.use(cors());
app.use(express.json());

// Serwowanie plików statycznych frontendu
app.use(express.static(path.join(__dirname, '../')));

// Odczyt pliku bazy danych rankingu
function readRankingFile() {
    if (!fs.existsSync(FILE_PATH)) {
        fs.writeFileSync(FILE_PATH, JSON.stringify([]));
        return [];
    }
    const rawData = fs.readFileSync(FILE_PATH);
    return JSON.parse(rawData);
}

// --------------------------------------API GET
app.get('/api/ranking', (req, res) => {
    try {
        const ranking = readRankingFile();
        
        //"MM:SS" na sekundy
        const timeToSeconds = (timeStr) => {
            if (!timeStr || !timeStr.includes(':')) return 999999;
            const [minutes, seconds] = timeStr.split(':').map(Number);
            return (minutes * 60) + seconds;
        };

        // Filtrowanie (tylko wygrane) i sortowanie od najkrótszego czasu
        const filteredRanking = ranking
            .filter(player => player.isWin === true)
            .sort((a, b) => timeToSeconds(a.time) - timeToSeconds(b.time))
            .slice(0, 10);

        res.json(filteredRanking);
    } catch (error) {
        res.status(500).json({ error: 'Błąd odczytu bazy danych' });
    }
});

// --------------------------------------API POST
// Zapis nowego rekordu w rankingu
app.post('/api/ranking', (req, res) => {
    try {
        const { name, score, time } = req.body;

        if (!name || score === undefined || !time) {
            return res.status(400).json({ error: 'Brakujące parametry' });
        }

        const ranking = readRankingFile();
        ranking.push({ name, score, time, date: new Date().toISOString() });
        
        fs.writeFileSync(FILE_PATH, JSON.stringify(ranking, null, 2));
        res.status(201).json({ message: 'Wynik zapisany' });
    } catch (error) {
        res.status(500).json({ error: 'Błąd zapisu bazy danych' });
    }
});

// --------------------------------------INICJACJA
// Uruchomienie nasłuchiwania serwera
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serwer aktywny na porcie: ${PORT}`);
});

/* STARTA WERSJA
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const FILE_PATH = path.join(__dirname, 'ranking.json');

// Middleware
app.use(cors()); // frontend -> backend
app.use(express.json()); // Zezwala serwerowi na czytanie danych w formacie JSON

// Funkcja pomocnicza do czytania pliku bazy danych
function readRankingFile() {
    if (!fs.existsSync(FILE_PATH)) {
        // Jeśli plik nie istnieje-. add pustą tablicę
        fs.writeFileSync(FILE_PATH, JSON.stringify([]));
        return [];
    }
    const rawData = fs.readFileSync(FILE_PATH);
    return JSON.parse(rawData);
}

// 1. ENDPOINT GET: Pobieranie rankingu (10 malejąco)
app.get('/api/ranking', (req, res) => {
    try {
        const ranking = readRankingFile();
        const sortedRanking = ranking.sort((a, b) => b.score - a.score).slice(0, 10);
        res.json(sortedRanking);
    } catch (error) {
        res.status(500).json({ error: 'Błąd podczas odczytu bazy danych' });
    }
});

// 2. ENDPOINT POST: Zapisywanie nowego wyniku
app.post('/api/ranking', (req, res) => {
    try {
        const { name, score, time } = req.body;

        if (!name || score === undefined || !time) {
            return res.status(400).json({ error: 'Brakujące parametry wyniku' });
        }

        const ranking = readRankingFile();
        
        // Dodanie nowego rekordu
        ranking.push({ name, score, time, date: new Date().toISOString() });
        
        // Zapis z powrotem do pliku JSON
        fs.writeFileSync(FILE_PATH, JSON.stringify(ranking, null, 2));
        
        res.status(201).json({ message: 'Wynik zapisany pomyślnie!' });
    } catch (error) {
        res.status(500).json({ error: 'Błąd podczas zapisu do bazy danych' });
    }
});

// Uruchomienie serwera
app.listen(PORT, () => {
    console.log(` Serwer Gwinta działa na http://localhost:${PORT}`);
    console.log(` Baza danych rankingu ulokowana w: ${FILE_PATH}`);
});
*/