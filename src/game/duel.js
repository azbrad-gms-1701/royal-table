import { chooseBotCard, highCardValue } from './rules.js'

export function createDuelRound(deck, humans, bots) {
  if (!Number.isInteger(humans) || !Number.isInteger(bots) || humans < 1 || humans > 8 || bots < 0 || bots > 7 || humans + bots < 2 || humans + bots > 8) {
    throw new RangeError('La mesa admite de 2 a 8 puestos, con 1 a 8 personas y hasta 7 bots.')
  }
  const seats = Array.from({ length: humans + bots }, (_, index) => ({
    id: index,
    name: index < humans ? `Jugador ${index + 1}` : `Bot ${index - humans + 1}`,
    bot: index >= humans,
    cards: deck.slice(index * 3, index * 3 + 3),
    choice: null,
  }))
  return { seats, humans, phase: 'handoff', turn: 0, botTurn: humans, winners: [] }
}

export function selectDuelCard(round, seatIndex, cardIndex) {
  if (round.phase !== 'choose' || round.turn !== seatIndex || !Number.isInteger(cardIndex) || cardIndex < 0 || cardIndex > 2) return round
  const seats = round.seats.map((seat, index) => index === seatIndex ? { ...seat, choice: cardIndex } : seat)
  const next = seatIndex + 1
  return { ...round, seats, turn: next, phase: next < round.humans ? 'handoff' : 'bots' }
}

export function playNextBot(round) {
  if (round.phase !== 'bots' || round.botTurn >= round.seats.length) return round
  const seats = round.seats.map((seat, index) => index === round.botTurn ? { ...seat, choice: chooseBotCard(seat.cards) } : seat)
  const botTurn = round.botTurn + 1
  if (botTurn < seats.length) return { ...round, seats, botTurn }
  const highest = Math.max(...seats.map((seat) => highCardValue(seat.cards[seat.choice])))
  return { ...round, seats, botTurn, phase: 'complete', winners: seats.filter((seat) => highCardValue(seat.cards[seat.choice]) === highest).map((seat) => seat.id) }
}

export function finishDuelWithoutBots(round) {
  if (round.phase !== 'bots' || round.botTurn !== round.seats.length) return round
  const highest = Math.max(...round.seats.map((seat) => highCardValue(seat.cards[seat.choice])))
  return { ...round, phase: 'complete', winners: round.seats.filter((seat) => highCardValue(seat.cards[seat.choice]) === highest).map((seat) => seat.id) }
}
