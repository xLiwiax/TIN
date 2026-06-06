export const routingContainer = document.getElementById('routing-container');
//export const API_URL = 'http://localhost:3000/api/ranking';
export const API_URL = '/api/ranking';

// Stan rozgrywki (zmieniamy na let/tablice/obiekty)
export let CARD_DATABASE = [];
export function setCardDatabase(data) { CARD_DATABASE = data; }

export let deckPool = [];
export function setDeckPool(val) { deckPool = val; }

export let playerHand = [];
export function setPlayerHand(val) { playerHand = val; }

export let botHand = [];
export function setBotHand(val) { botHand = val; }

export let playerBoard = { close: [], ranged: [], siege: [] };
export function setPlayerBoard(val) { playerBoard = val; }

export let botBoard = { close: [], ranged: [], siege: [] };
export function setBotBoard(val) { botBoard = val; }

export let playerWins = 0;
export function setPlayerWins(val) { playerWins = val; }

export let botWins = 0;
export function setBotWins(val) { botWins = val; }

export let playerPassed = false;
export function setPlayerPassed(val) { playerPassed = val; }

export let botPassed = false;
export function setBotPassed(val) { botPassed = val; }

export let isBotTurning = false;
export function setIsBotTurning(val) { isBotTurning = val; }

export let isRoundEnding = false;
export function setIsRoundEnding(val) { isRoundEnding = val; }

export let gameTimerInterval = null;
export function setGameTimerInterval(val) { gameTimerInterval = val; }

export let gameSeconds = 0;
export function setGameSeconds(val) { gameSeconds = val; }

export let roundMessageBanner = "";
export function setRoundMessageBanner(val) { roundMessageBanner = val; }