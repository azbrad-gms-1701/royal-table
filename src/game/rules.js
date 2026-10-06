export const SUITS = [
  { key: 'spades', symbol: '♠', name: 'picas' },
  { key: 'hearts', symbol: '♥', name: 'corazones' },
  { key: 'clubs', symbol: '♣', name: 'tréboles' },
  { key: 'diamonds', symbol: '♦', name: 'diamantes' },
]

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export function createDeck() {
  return SUITS.flatMap((suit) => RANKS.map((rank, index) => ({
    id: `${suit.key}-${rank}`,
    rank,
    suit: suit.key,
    symbol: suit.symbol,
    value: index + 1,
  })))
}

export function shuffleDeck(cards, random = Math.random) {
  const deck = [...cards]
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export function highCardValue(card) {
  return card.rank === 'A' ? 14 : card.value
}

export function chooseBotCard(cards) {
  return cards.reduce((best, card, index) => highCardValue(card) > highCardValue(cards[best]) ? index : best, 0)
}

export function highCardResult(player, house) {
  const playerValue = highCardValue(player)
  const houseValue = highCardValue(house)
  return playerValue === houseValue ? 'tie' : playerValue > houseValue ? 'win' : 'lose'
}

export function blackjackTotal(cards) {
  let total = cards.reduce((sum, card) => sum + (card.rank === 'A' ? 1 : Math.min(card.value, 10)), 0)
  let soft = false
  if (cards.some((card) => card.rank === 'A') && total + 10 <= 21) {
    total += 10
    soft = true
  }
  return { total, soft }
}

export function isBlackjack(cards) {
  return cards.length === 2 && blackjackTotal(cards).total === 21
}

export function blackjackResult(player, dealer) {
  const playerTotal = blackjackTotal(player).total
  const dealerTotal = blackjackTotal(dealer).total
  if (playerTotal > 21) return 'lose'
  if (isBlackjack(player) && !isBlackjack(dealer)) return 'win'
  if (isBlackjack(dealer) && !isBlackjack(player)) return 'lose'
  if (dealerTotal > 21) return 'win'
  return playerTotal === dealerTotal ? 'tie' : playerTotal > dealerTotal ? 'win' : 'lose'
}

// The dealer stands on every 17, including a soft 17.
export function dealerShouldDraw(cards) {
  return blackjackTotal(cards).total < 17
}

export function playDealer(initialCards, deck) {
  const cards = [...initialCards]
  let nextDeck = [...deck]
  while (dealerShouldDraw(cards) && nextDeck.length) {
    cards.push(nextDeck[0])
    nextDeck = nextDeck.slice(1)
  }
  return { cards, deck: nextDeck }
}

export function baccaratCardValue(card) {
  return card.rank === 'A' ? 1 : Math.min(card.value, 10) % 10
}

export function baccaratTotal(cards) {
  return cards.reduce((sum, card) => sum + baccaratCardValue(card), 0) % 10
}

export function bankerShouldDraw(bankerTotal, playerThirdCard = null) {
  if (playerThirdCard === null) return bankerTotal <= 5
  if (bankerTotal <= 2) return true
  const third = baccaratCardValue(playerThirdCard)
  if (bankerTotal === 3) return third !== 8
  if (bankerTotal === 4) return third >= 2 && third <= 7
  if (bankerTotal === 5) return third >= 4 && third <= 7
  if (bankerTotal === 6) return third === 6 || third === 7
  return false
}

// Punto Banco: initial cards alternate Player, Banker, Player, Banker.
// Each timeline entry represents a visible dealing step for the interface.
export function playBaccarat(deck) {
  const remaining = [...deck]
  const player = []
  const banker = []
  const timeline = []
  const deal = (hand, label) => {
    hand.push(remaining.shift())
    timeline.push({ player: [...player], banker: [...banker], message: label })
  }
  deal(player, 'Primera carta para Punto')
  deal(banker, 'Primera carta para Banco')
  deal(player, 'Segunda carta para Punto')
  deal(banker, 'Segunda carta para Banco')

  const initialPlayer = baccaratTotal(player)
  const initialBanker = baccaratTotal(banker)
  const natural = initialPlayer >= 8 || initialBanker >= 8
  let thirdCard = null
  if (!natural && initialPlayer <= 5) {
    deal(player, 'Punto roba una tercera carta')
    thirdCard = player[2]
  }
  if (!natural && bankerShouldDraw(initialBanker, thirdCard)) {
    deal(banker, 'Banco roba según la tabla de Punto Banco')
  }

  const playerTotal = baccaratTotal(player)
  const bankerTotal = baccaratTotal(banker)
  const outcome = playerTotal === bankerTotal ? 'tie' : playerTotal > bankerTotal ? 'player' : 'banker'
  return { player, banker, playerTotal, bankerTotal, outcome, natural, timeline, deck: remaining }
}
