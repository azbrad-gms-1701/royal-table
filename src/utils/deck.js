// utils/deck.js
export const SUITS = ["♠", "♥", "♦", "♣"];
export const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const RED_SUITS = ["♥", "♦"];

export function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({
        suit,
        value,
        id: `${value}${suit}`,
      });
    }
  }
  return shuffle(deck);
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Valor numérico de una carta (para Carta Mayor y Black Jack)
export function cardNumericValue(card) {
  if (["J", "Q", "K"].includes(card.value)) return 10;
  if (card.value === "A") return 11;
  return parseInt(card.value);
}

// Valor para Baccarat (módulo 10)
export function cardBaccaratValue(card) {
  if (["J", "Q", "K", "10"].includes(card.value)) return 0;
  if (card.value === "A") return 1;
  return parseInt(card.value);
}
// Valor para Carta Mayor: A=14, K=13, Q=12, J=11, resto su valor numérico
export function cardMayorValue(card) {
  if (card.value === "A") return 14;
  if (card.value === "K") return 13;
  if (card.value === "Q") return 12;
  if (card.value === "J") return 11;
  return parseInt(card.value);
}