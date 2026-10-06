import { SUITS } from './rules.js'

const isRed = (card) => card.suit === 'hearts' || card.suit === 'diamonds'

export function createSolitaireGame(deck) {
  let next = 0
  const tableau = Array.from({ length: 7 }, (_, column) => Array.from({ length: column + 1 }, (_, index) => ({
    card: deck[next++],
    faceUp: index === column,
  })))
  return {
    tableau,
    foundations: Object.fromEntries(SUITS.map(({ key }) => [key, []])),
    stock: deck.slice(next),
    waste: [],
    won: false,
  }
}

export function drawSolitaireStock(game) {
  if (game.stock.length) {
    return {
      ...game,
      stock: game.stock.slice(0, -1),
      waste: [...game.waste, game.stock.at(-1)],
    }
  }
  if (game.waste.length) {
    return { ...game, stock: [...game.waste].reverse(), waste: [] }
  }
  return null
}

function movableCards(game, source) {
  if (source.kind === 'waste') return game.waste.length ? [game.waste.at(-1)] : null
  if (source.kind !== 'tableau') return null
  const column = game.tableau[source.column]
  if (!column?.[source.index]?.faceUp) return null
  const run = column.slice(source.index)
  for (let i = 1; i < run.length; i += 1) {
    const upper = run[i - 1].card
    const lower = run[i].card
    if (!run[i].faceUp || lower.value !== upper.value - 1 || isRed(lower) === isRed(upper)) return null
  }
  return run.map(({ card }) => card)
}

function removeSource(game, source) {
  if (source.kind === 'waste') return { ...game, waste: game.waste.slice(0, -1) }
  const tableau = game.tableau.map((column) => [...column])
  tableau[source.column] = tableau[source.column].slice(0, source.index)
  const last = tableau[source.column].length - 1
  if (last >= 0 && !tableau[source.column][last].faceUp) {
    tableau[source.column][last] = { ...tableau[source.column][last], faceUp: true }
  }
  return { ...game, tableau }
}

export function moveSolitaireCards(game, source, target) {
  const cards = movableCards(game, source)
  if (!cards) return null

  if (target.kind === 'foundation') {
    const foundation = game.foundations[target.suit]
    if (!foundation || cards.length !== 1 || cards[0].suit !== target.suit || cards[0].value !== foundation.length + 1) return null
    const next = removeSource(game, source)
    const foundations = { ...next.foundations, [target.suit]: [...foundation, cards[0]] }
    return { ...next, foundations, won: Object.values(foundations).every((pile) => pile.length === 13) }
  }

  if (target.kind === 'tableau') {
    const targetColumn = game.tableau[target.column]
    if (!targetColumn || (source.kind === 'tableau' && source.column === target.column)) return null
    const top = targetColumn.at(-1)?.card
    const first = cards[0]
    if (top ? first.value !== top.value - 1 || isRed(first) === isRed(top) : first.value !== 13) return null
    const next = removeSource(game, source)
    const tableau = next.tableau.map((column) => [...column])
    tableau[target.column].push(...cards.map((card) => ({ card, faceUp: true })))
    return { ...next, tableau }
  }

  return null
}
