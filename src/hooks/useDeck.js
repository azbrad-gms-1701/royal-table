// hooks/useDeck.js
import { useState } from "react";
import { createDeck } from "../utils/deck";

export function useDeck() {
  const [deck, setDeck] = useState(() => createDeck());

  const draw = (n = 1) => {
    let drawn = [];
    setDeck(prev => {
      drawn = prev.slice(0, n);
      return prev.slice(n);
    });
    return drawn;
  };

  const reset = () => setDeck(createDeck());

  return { deck, deckCount: deck.length, draw, reset };
}