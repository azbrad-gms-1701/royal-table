import test from 'node:test'
import assert from 'node:assert/strict'
import { createDeck, highCardValue } from './rules.js'
import { createDuelRound, finishDuelWithoutBots, playNextBot, selectDuelCard } from './duel.js'

test('a shared table supports one person and seven bots using 24 unique cards', () => {
  let round = createDuelRound(createDeck(), 1, 7)
  assert.equal(round.seats.length, 8)
  assert.equal(new Set(round.seats.flatMap((seat) => seat.cards.map((card) => card.id))).size, 24)
  round = { ...round, phase: 'choose' }
  round = selectDuelCard(round, 0, 2)
  while (round.phase === 'bots') round = playNextBot(round)
  assert.equal(round.phase, 'complete')
  assert.ok(round.seats.slice(1).every((seat) => highCardValue(seat.cards[seat.choice]) === Math.max(...seat.cards.map(highCardValue))))
  assert.ok(round.winners.length >= 1)
})

test('human hands pass in order and matching highest values tie', () => {
  const deck = createDeck()
  deck[0] = createDeck().find((card) => card.id === 'hearts-A')
  deck[3] = createDeck().find((card) => card.id === 'clubs-A')
  let round = createDuelRound(deck, 2, 0)
  round = { ...round, phase: 'choose' }
  round = selectDuelCard(round, 0, 0)
  assert.equal(round.phase, 'handoff')
  assert.equal(round.turn, 1)
  round = { ...round, phase: 'choose' }
  round = selectDuelCard(round, 1, 0)
  round = finishDuelWithoutBots(round)
  assert.deepEqual(round.winners, [0, 1])
})

test('invalid table sizes and out-of-turn choices are rejected', () => {
  assert.throws(() => createDuelRound(createDeck(), 1, 8), RangeError)
  assert.throws(() => createDuelRound(createDeck(), 1, 0), RangeError)
  const round = createDuelRound(createDeck(), 2, 0)
  assert.equal(selectDuelCard(round, 1, 0), round)
})
