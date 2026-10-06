import test from 'node:test'
import assert from 'node:assert/strict'
import {
  baccaratTotal, bankerShouldDraw, blackjackResult, blackjackTotal, chooseBotCard, createDeck,
  dealerShouldDraw, highCardResult, isBlackjack, playBaccarat, playDealer, shuffleDeck,
} from './rules.js'

const card = (rank, suit = 'spades') => createDeck().find((item) => item.rank === rank && item.suit === suit)

test('the deck has 52 unique cards and shuffle does not change its contents', () => {
  const deck = createDeck()
  assert.equal(deck.length, 52)
  assert.equal(new Set(deck.map((item) => item.id)).size, 52)
  assert.deepEqual(shuffleDeck(deck, () => 0).map((item) => item.id).sort(), deck.map((item) => item.id).sort())
})

test('Carta Mayor treats ace as high and equal ranks as a tie', () => {
  assert.equal(highCardResult(card('A'), card('K')), 'win')
  assert.equal(highCardResult(card('7'), card('7', 'hearts')), 'tie')
})

test('Carta Mayor bot plays its strongest card, including an ace', () => {
  const cards = [card('K'), card('A'), card('A', 'hearts')]
  assert.equal(chooseBotCard(cards), 1)
  assert.equal(highCardResult(card('A', 'diamonds'), cards[chooseBotCard(cards)]), 'tie')
})

test('Black Jack counts soft hands and distinguishes a natural', () => {
  assert.deepEqual(blackjackTotal([card('A'), card('6')]), { total: 17, soft: true })
  assert.deepEqual(blackjackTotal([card('A'), card('6'), card('9')]), { total: 16, soft: false })
  assert.equal(isBlackjack([card('A'), card('K')]), true)
  assert.equal(isBlackjack([card('7'), card('7', 'hearts'), card('7', 'clubs')]), false)
  assert.equal(blackjackResult([card('A'), card('K')], [card('7'), card('7', 'hearts'), card('7', 'clubs')]), 'win')
  assert.equal(blackjackResult([card('A'), card('K')], [card('A', 'hearts'), card('Q')]), 'tie')
})

test('dealer stands on soft 17 and draws below 17', () => {
  assert.equal(dealerShouldDraw([card('A'), card('6')]), false)
  assert.equal(dealerShouldDraw([card('9'), card('7')]), true)
  assert.equal(playDealer([card('A'), card('6')], [card('2')]).cards.length, 2)
})

test('Baccarat totals use the last digit and third-card table', () => {
  assert.equal(baccaratTotal([card('K'), card('9'), card('7')]), 6)
  assert.equal(bankerShouldDraw(5, null), true)
  assert.equal(bankerShouldDraw(6, null), false)
  const drawValues = { 3: [0, 1, 2, 3, 4, 5, 6, 7, 9], 4: [2, 3, 4, 5, 6, 7], 5: [4, 5, 6, 7], 6: [6, 7] }
  for (const [banker, values] of Object.entries(drawValues)) {
    for (let value = 0; value <= 9; value += 1) {
      const third = value === 0 ? card('K') : value === 1 ? card('A') : card(String(value))
      assert.equal(bankerShouldDraw(Number(banker), third), values.includes(value), `Banco ${banker}, tercera ${value}`)
    }
  }
})

test('Baccarat stops on either natural and follows the automatic third-card rule', () => {
  const naturalDeck = [card('9'), card('2'), card('K'), card('2', 'hearts'), ...createDeck()]
  const natural = playBaccarat(naturalDeck)
  assert.equal(natural.natural, true)
  assert.equal(natural.timeline.length, 4)
  assert.equal(natural.outcome, 'player')

  const drawingDeck = [card('2'), card('2', 'hearts'), card('3'), card('2', 'clubs'), card('6'), card('9'), ...createDeck()]
  const drawing = playBaccarat(drawingDeck)
  assert.equal(drawing.natural, false)
  assert.equal(drawing.player.length, 3)
  assert.equal(drawing.banker.length, 3)
  assert.equal(drawing.timeline.length, 6)
})
