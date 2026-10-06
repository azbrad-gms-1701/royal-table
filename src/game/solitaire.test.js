import test from 'node:test'
import assert from 'node:assert/strict'
import { createDeck } from './rules.js'
import { createSolitaireGame, drawSolitaireStock, moveSolitaireCards } from './solitaire.js'

const card = (rank, suit = 'spades') => createDeck().find((item) => item.rank === rank && item.suit === suit)

test('Klondike deals seven columns and leaves 24 cards in the stock', () => {
  const game = createSolitaireGame(createDeck())
  assert.deepEqual(game.tableau.map((column) => column.length), [1, 2, 3, 4, 5, 6, 7])
  assert.ok(game.tableau.every((column) => column.filter((entry) => entry.faceUp).length === 1 && column.at(-1).faceUp))
  assert.equal(game.stock.length, 24)
  assert.equal(new Set([...game.tableau.flat().map(({ card: item }) => item.id), ...game.stock.map((item) => item.id)]).size, 52)
})

test('stock draws one and recycles the waste in its original order', () => {
  const initial = { ...createSolitaireGame(createDeck()), stock: [card('2'), card('3')], waste: [] }
  const first = drawSolitaireStock(initial)
  const second = drawSolitaireStock(first)
  assert.equal(first.waste.at(-1).rank, '3')
  assert.equal(second.waste.at(-1).rank, '2')
  const recycled = drawSolitaireStock(second)
  assert.equal(drawSolitaireStock(recycled).waste.at(-1).rank, '3')
})

test('tableau moves alternate colors, uncover cards, and reserve empty columns for kings', () => {
  const game = createSolitaireGame(createDeck())
  game.tableau = [[{ card: card('8'), faceUp: false }, { card: card('7', 'hearts'), faceUp: true }], [{ card: card('8', 'clubs'), faceUp: true }], [], [], [], [], []]
  const moved = moveSolitaireCards(game, { kind: 'tableau', column: 0, index: 1 }, { kind: 'tableau', column: 1 })
  assert.equal(moved.tableau[0][0].faceUp, true)
  assert.equal(moved.tableau[1].at(-1).card.rank, '7')
  assert.equal(moveSolitaireCards(game, { kind: 'tableau', column: 0, index: 1 }, { kind: 'tableau', column: 2 }), null)
  game.waste = [card('K')]
  assert.equal(moveSolitaireCards(game, { kind: 'waste' }, { kind: 'tableau', column: 2 }).tableau[2][0].card.rank, 'K')
})

test('foundations build by suit from ace and reject a wrong next card', () => {
  const game = createSolitaireGame(createDeck())
  game.waste = [card('A')]
  const moved = moveSolitaireCards(game, { kind: 'waste' }, { kind: 'foundation', suit: 'spades' })
  assert.equal(moved.foundations.spades.length, 1)
  assert.equal(moved.waste.length, 0)
  assert.equal(moveSolitaireCards({ ...moved, waste: [card('3')] }, { kind: 'waste' }, { kind: 'foundation', suit: 'spades' }), null)
})

test('the game ends when all four foundations reach a king', () => {
  const deck = createDeck()
  const game = createSolitaireGame(deck)
  game.foundations = {
    spades: deck.filter((item) => item.suit === 'spades' && item.value < 13),
    hearts: deck.filter((item) => item.suit === 'hearts'),
    clubs: deck.filter((item) => item.suit === 'clubs'),
    diamonds: deck.filter((item) => item.suit === 'diamonds'),
  }
  game.waste = [card('K')]
  const finished = moveSolitaireCards(game, { kind: 'waste' }, { kind: 'foundation', suit: 'spades' })
  assert.equal(finished.won, true)
})
